'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Filter, X, Search } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import { ProductRanking } from '@/components/product/product-ranking'
import { SearchBox } from '@/components/search'
import { Header } from '@/components/layout/header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { productService } from '@/lib/api/services/product'
import { sellerService } from '@/lib/api/services/seller'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { getProductImage } from '@/lib/utils/product-images'
import { getUserId } from '@/lib/api/client'

const PRODUCT_LIST_TIMEOUT_MS = 4000
const RECOMMENDATION_TIMEOUT_MS = 2500
const SAMPLE_PRODUCT_ID = 'c33e13c9-43d2-4b50-8630-3e9605a0b63b'

// 카테고리 한글 변환 맵 (컴포넌트 외부로 이동하여 useMemo 의존성 문제 해결)
const categoryMap: Record<string, string> = {
  FRUIT: '과일',
  VEGETABLE: '채소',
  GRAIN: '곡물',
  NUT: '견과',
  ROOT: '뿌리',
  MUSHROOM: '버섯',
  ETC: '기타',
} as const

interface DisplayProduct {
  id: string | number
  name: string
  storeName: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  tag?: string
  category: string
  rank?: number
}

// 각 fallback 상품에 고유한 ID 생성
const FALLBACK_PRODUCTS: DisplayProduct[] = [
  {
    id: `${SAMPLE_PRODUCT_ID}-fallback-1`,
    name: '친환경 딸기',
    storeName: '샘플 농장',
    price: 15000,
    image: getProductImage('딸기', `${SAMPLE_PRODUCT_ID}-fallback-1`),
    rating: 4.8,
    reviews: 120,
    tag: '추천',
    category: '과일',
  },
  {
    id: `${SAMPLE_PRODUCT_ID}-fallback-2`,
    name: '유기농 방울토마토',
    storeName: '샘플 팜',
    price: 8500,
    image: getProductImage('토마토', `${SAMPLE_PRODUCT_ID}-fallback-2`),
    rating: 4.7,
    reviews: 96,
    tag: '인기',
    category: '과일',
  },
  {
    id: `${SAMPLE_PRODUCT_ID}-fallback-3`,
    name: '무농약 상추',
    storeName: '샘플 농원',
    price: 5000,
    image: getProductImage('상추', `${SAMPLE_PRODUCT_ID}-fallback-3`),
    rating: 4.9,
    reviews: 88,
    tag: '신선',
    category: '채소',
  },
  {
    id: `${SAMPLE_PRODUCT_ID}-fallback-4`,
    name: '국산 감자',
    storeName: '샘플 농장',
    price: 12000,
    image: getProductImage('감자', `${SAMPLE_PRODUCT_ID}-fallback-4`),
    rating: 4.6,
    reviews: 54,
    tag: '인기',
    category: '채소',
  },
  {
    id: `${SAMPLE_PRODUCT_ID}-fallback-5`,
    name: '유기농 당근',
    storeName: '샘플 팜',
    price: 9000,
    image: getProductImage('당근', `${SAMPLE_PRODUCT_ID}-fallback-5`),
    rating: 4.5,
    reviews: 62,
    tag: '추천',
    category: '채소',
  },
  {
    id: `${SAMPLE_PRODUCT_ID}-fallback-6`,
    name: '산지 직송 사과',
    storeName: '샘플 과수원',
    price: 18000,
    image: getProductImage('사과', `${SAMPLE_PRODUCT_ID}-fallback-6`),
    rating: 4.8,
    reviews: 140,
    tag: '인기',
    category: '과일',
  },
  {
    id: `${SAMPLE_PRODUCT_ID}-fallback-7`,
    name: '국산 현미',
    storeName: '샘플 곡창',
    price: 21000,
    image: getProductImage('현미', `${SAMPLE_PRODUCT_ID}-fallback-7`),
    rating: 4.4,
    reviews: 33,
    tag: '추천',
    category: '곡물',
  },
  {
    id: `${SAMPLE_PRODUCT_ID}-fallback-8`,
    name: '무농약 버섯',
    storeName: '샘플 농원',
    price: 11000,
    image: getProductImage('버섯', `${SAMPLE_PRODUCT_ID}-fallback-8`),
    rating: 4.6,
    reviews: 45,
    tag: '신선',
    category: '버섯',
  },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>([])
  const [rankingProducts] = useState<(DisplayProduct & { rank: number })[]>([])
  const [recommendedProducts, setRecommendedProducts] = useState<DisplayProduct[]>([])
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRankingLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [paginationInfo, setPaginationInfo] = useState<{
    totalPages: number
    totalElements: number
    hasNext: boolean
    hasPrevious: boolean
    page: number
    size: number
  } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!mounted) return

      setIsRecommendationsLoading(true)
      try {
        const userId = getUserId()
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), RECOMMENDATION_TIMEOUT_MS)

        const endpoint = userId
          ? `/api/recommendations/products?topK=5&userId=${encodeURIComponent(userId)}`
          : '/api/recommendations/products?topK=5'

        const response = await fetch(endpoint, { signal: controller.signal })
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error('Failed to load recommendations')
        }

        const payload = await response.json()
        const rawItems = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : []

        const mapped = rawItems.slice(0, 5).map((item: any) => {
          const productId = String(item.productId || item.id || SAMPLE_PRODUCT_ID)
          const productName = item.productName || item.name || '추천 상품'
          return {
            id: productId,
            name: productName,
            storeName: item.storeName || item.farmName || '추천 농장',
            price: Number(item.price) || 0,
            image: item.imageUrl || item.image || getProductImage(productName, productId),
            rating: Number(item.rating) || 0,
            reviews: Number(item.reviewCount) || 0,
            tag: '추천',
            category: item.categoryName || '기타',
          } as DisplayProduct
        })

        if (mapped.length === 0) {
          throw new Error('Empty recommendations')
        }

        setRecommendedProducts(mapped)
      } catch (error) {
        console.warn('[Products] Fallback recommendations used:', error)
        setRecommendedProducts(FALLBACK_PRODUCTS.slice(0, 5))
      } finally {
        setIsRecommendationsLoading(false)
      }
    }

    fetchRecommendations()
  }, [mounted])

  // 실시간 랭킹 상품 로드 (주석처리)
  // useEffect(() => {
  //   const fetchRankingProducts = async () => {
  //     if (!mounted) return
  //     // 필터나 검색이 있으면 랭킹을 표시하지 않음
  //     if (category !== 'all' || searchQuery.trim() || currentPage !== 0) {
  //       setRankingProducts([])
  //       return
  //     }

  //     setIsRankingLoading(true)
  //     try {
  //       const rankingList = await productService.getRankingProducts({ limit: 3 })

  //       // 각 상품의 판매자 정보를 가져와서 displayProducts 형식으로 변환
  //       const rankingWithSellerInfo = await Promise.all(
  //         rankingList.map(async (product, index) => {
  //           const productName = product.productName
  //           const defaultImage = getProductImage(productName, product.id)

  //           let storeName = '판매자 정보 없음'
  //           if (product.sellerId) {
  //             try {
  //               const sellerInfo = await sellerService.getSellerInfo(product.sellerId)
  //               storeName = sellerInfo?.storeName || '판매자 정보 없음'
  //             } catch (error) {
  //               console.warn('판매자 정보 로드 실패:', error)
  //             }
  //           }

  //           return {
  //             id: product.id,
  //             name: productName,
  //             storeName,
  //             price: product.price,
  //             originalPrice:
  //               product.productStatus === 'DISCOUNTED' ? product.price * 1.2 : product.price,
  //             image: product.imageUrls?.[0] || defaultImage,
  //             rating: 0, // TODO: 리뷰 API 연결 시 실제 평점 사용
  //             reviews: 0, // TODO: 리뷰 API 연결 시 실제 리뷰 수 사용
  //             tag:
  //               product.productStatus === 'DISCOUNTED'
  //                 ? '할인'
  //                 : product.productStatus === 'ON_SALE'
  //                   ? '판매중'
  //                   : '베스트',
  //             category: categoryMap[product.productCategory] || '기타',
  //             rank: index + 1, // 랭킹 정보 추가
  //           } as DisplayProduct & { rank: number }
  //         })
  //       )
  //       setRankingProducts(rankingWithSellerInfo as (DisplayProduct & { rank: number })[])
  //     } catch (error) {
  //       console.error('랭킹 상품 조회 실패:', error)
  //       setRankingProducts([])
  //     } finally {
  //       setIsRankingLoading(false)
  //     }
  //   }

  //   fetchRankingProducts()
  // }, [mounted, category, searchQuery, currentPage])

  // 상품 목록 로드
  useEffect(() => {
    const fetchProducts = async () => {
      if (!mounted) return

      setIsLoading(true)
      try {
        const params: { category?: string; keyword?: string; page?: number; size?: number } = {
          page: currentPage,
          size: 20,
        }
        if (category !== 'all') {
          params.category = category
        }
        if (searchQuery.trim()) {
          params.keyword = searchQuery.trim()
        }
        let timeoutId: ReturnType<typeof setTimeout> | null = null
        const timeoutPromise = new Promise<null>((resolve) => {
          timeoutId = setTimeout(() => resolve(null), PRODUCT_LIST_TIMEOUT_MS)
        })

        const response = await Promise.race([productService.getProducts(params), timeoutPromise])

        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        if (!response) {
          setDisplayProducts(FALLBACK_PRODUCTS)
          setPaginationInfo({
            totalPages: 1,
            totalElements: FALLBACK_PRODUCTS.length,
            hasNext: false,
            hasPrevious: false,
            page: 0,
            size: FALLBACK_PRODUCTS.length,
          })
          return
        }

        // 응답 구조 확인: PaginatedResponse는 { content: T[], ... } 형태
        // 또는 게이트웨이를 거치면 { data: PaginatedResponse } 형태일 수 있음
        let productList: any[] = []
        let paginationData: any = {}

        if (Array.isArray(response)) {
          // 응답이 배열인 경우 (직접 서비스 응답)
          productList = response
          paginationData = {
            totalPages: 1,
            totalElements: response.length,
            hasNext: false,
            hasPrevious: false,
            page: 0,
            size: response.length,
          }
        } else if ((response as any)?.content && Array.isArray((response as any).content)) {
          // PaginatedResponse 형태: { content: [...], totalPages, ... }
          productList = (response as any).content
          paginationData = {
            totalPages: (response as any).totalPages || 0,
            totalElements: (response as any).totalElements || 0,
            hasNext: (response as any).hasNext || false,
            hasPrevious: (response as any).hasPrevious || false,
            page: (response as any).page || 0,
            size: (response as any).size || 20,
          }
        } else if ((response as any)?.data) {
          // { data: PaginatedResponse } 형태
          const data = (response as any).data
          if (Array.isArray(data)) {
            productList = data
            paginationData = {
              totalPages: 1,
              totalElements: data.length,
              hasNext: false,
              hasPrevious: false,
              page: 0,
              size: data.length,
            }
          } else if (data?.content && Array.isArray(data.content)) {
            productList = data.content
            paginationData = {
              totalPages: data.totalPages || 0,
              totalElements: data.totalElements || 0,
              hasNext: data.hasNext || false,
              hasPrevious: data.hasPrevious || false,
              page: data.page || 0,
              size: data.size || 20,
            }
          }
        }

        if (productList.length === 0) {
          setDisplayProducts(FALLBACK_PRODUCTS)
          setPaginationInfo({
            totalPages: 1,
            totalElements: FALLBACK_PRODUCTS.length,
            hasNext: false,
            hasPrevious: false,
            page: 0,
            size: FALLBACK_PRODUCTS.length,
          })
          return
        }

        // 각 상품의 판매자 정보를 가져와서 displayProducts 생성
        const productsWithSellerInfo = await Promise.all(
          productList.map(async (product: any) => {
            const productName = product.productName
            const defaultImage = getProductImage(productName, product.id)

            let storeName = '판매자 정보 없음'
            if (product.sellerId) {
              try {
                const sellerInfo = await sellerService.getSellerInfo(product.sellerId)
                storeName = sellerInfo?.storeName || '판매자 정보 없음'
              } catch (error) {
                console.warn('판매자 정보 로드 실패:', error)
              }
            }

            return {
              id: product.id,
              name: productName,
              storeName,
              price: product.price,
              originalPrice:
                product.productStatus === 'DISCOUNTED' ? product.price * 1.2 : product.price,
              image: product.imageUrls?.[0] || defaultImage,
              rating: 0,
              reviews: 0, // TODO: 리뷰 개수 API 추가 시 업데이트
              tag:
                product.productStatus === 'DISCOUNTED'
                  ? '할인'
                  : product.productStatus === 'ON_SALE'
                    ? '판매중'
                    : '베스트',
              category: categoryMap[product.productCategory] || '기타',
            }
          })
        )
        setDisplayProducts(productsWithSellerInfo)
        setPaginationInfo(paginationData)
      } catch (error) {
        console.error('상품 조회 실패:', error)
        // 에러 발생 시 빈 배열로 설정
        setDisplayProducts(FALLBACK_PRODUCTS)
        setPaginationInfo({
          totalPages: 1,
          totalElements: FALLBACK_PRODUCTS.length,
          hasNext: false,
          hasPrevious: false,
          page: 0,
          size: FALLBACK_PRODUCTS.length,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [mounted, category, searchQuery, currentPage])

  // 상품명에 따른 이미지 매핑은 lib/utils/product-images.ts의 getProductImage 함수 사용

  // 필터링 및 정렬 로직
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...displayProducts]

    // 카테고리 필터 (이미 API에서 필터링되지만 클라이언트에서도 추가 필터링)
    if (category !== 'all') {
      // category가 ProductCategory 값이면 한글로 변환하여 비교
      const categoryValue = categoryMap[category] || category
      filtered = filtered.filter((product) => product.category === categoryValue)
    }

    // 정렬
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
      case 'latest':
        // 최신순은 createdAt 기준으로 정렬 (API에서 정렬된 데이터를 받아옴)
        break
      case 'low-price':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'high-price':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }

    return filtered
  }, [displayProducts, category, sortBy])

  const hasActiveFilters = category !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setCategory('all')
    setSortBy('popular')
    setCurrentPage(0) // 필터 초기화 시 첫 페이지로 이동
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // 페이지 변경 시 스크롤을 상단으로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showCart />

      {/* Page Header */}
      <section className="py-12 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">농산물 장터</h1>
          <p className="text-muted-foreground">신선한 농산물을 농장에서 직접 배송받으세요</p>
        </div>
      </section>

      {/* Recommendations */}
      <section className="py-8 border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">추천 상품 TOP 5</h2>
              <p className="text-sm text-muted-foreground">
                사용자 활동 기반으로 선별한 추천 상품이에요.
              </p>
            </div>
          </div>

          {isRecommendationsLoading && recommendedProducts.length === 0 ? (
            <div className="text-sm text-muted-foreground">추천 상품 불러오는 중...</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {recommendedProducts.map((product) => (
                <ProductCard
                  key={`recommend-${product.id}-${product.name}`}
                  id={product.id}
                  name={product.name}
                  storeName={product.storeName}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  rating={product.rating}
                  reviews={product.reviews}
                  tag={product.tag}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-6 border-b bg-background sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchBox
                initialQuery={searchQuery}
                onSearch={(query) => setSearchQuery(query)}
                searchType="product"
                placeholder="농산물, 농장 이름으로 검색..."
                enableSuggestions={true}
                enablePopularKeywords={true}
                debounceDelay={300}
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="FRUIT">과일</SelectItem>
                <SelectItem value="VEGETABLE">채소</SelectItem>
                <SelectItem value="GRAIN">곡물</SelectItem>
                <SelectItem value="NUT">견과</SelectItem>
                <SelectItem value="ROOT">뿌리</SelectItem>
                <SelectItem value="MUSHROOM">버섯</SelectItem>
                <SelectItem value="ETC">기타</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">인기순</SelectItem>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="low-price">낮은 가격순</SelectItem>
                <SelectItem value="high-price">높은 가격순</SelectItem>
                <SelectItem value="rating">평점순</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="md:w-auto bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              필터
            </Button>
          </div>
        </div>
      </section>

      {/* 실시간 랭킹 섹션 - 필터/검색이 없을 때만 표시 */}
      {category === 'all' && !searchQuery.trim() && currentPage === 0 && (
        <ProductRanking products={rankingProducts} isLoading={isRankingLoading} />
      )}

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                '로딩 중...'
              ) : (
                <>
                  총{' '}
                  <span className="font-semibold text-foreground">
                    {paginationInfo?.totalElements || filteredAndSortedProducts.length}
                  </span>
                  개의 상품
                  {paginationInfo && paginationInfo.totalPages > 1 && (
                    <span className="ml-2 text-xs">
                      (페이지 {paginationInfo.page + 1} / {paginationInfo.totalPages})
                    </span>
                  )}
                </>
              )}
            </p>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                필터 초기화
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">상품을 불러오는 중...</p>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground mb-4">다른 검색어나 필터를 시도해보세요</p>
              <Button variant="outline" onClick={clearFilters}>
                필터 초기화
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product, index) => (
                <ProductCard
                  key={`product-${product.id}-${index}`}
                  id={product.id}
                  name={product.name}
                  storeName={product.storeName}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  rating={product.rating}
                  reviews={product.reviews}
                  tag={product.tag}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {paginationInfo && paginationInfo.totalPages > 0 && (
            <div className="mt-12 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (paginationInfo.hasPrevious) {
                          handlePageChange(currentPage - 1)
                        }
                      }}
                      className={
                        !paginationInfo.hasPrevious
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {/* 페이지 번호 표시 */}
                  {Array.from({ length: paginationInfo.totalPages }, (_, i) => i).map((page) => {
                    // 현재 페이지 주변 2페이지씩만 표시
                    if (
                      page === 0 ||
                      page === paginationInfo.totalPages - 1 ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(page)
                            }}
                            isActive={page === currentPage}
                            className="cursor-pointer"
                          >
                            {page + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    } else if (page === currentPage - 3 || page === currentPage + 3) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    return null
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (paginationInfo.hasNext) {
                          handlePageChange(currentPage + 1)
                        }
                      }}
                      className={
                        !paginationInfo.hasNext
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
