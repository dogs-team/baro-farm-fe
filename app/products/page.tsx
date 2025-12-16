'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Filter, X, Search } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
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
import type { Product } from '@/lib/api/types'
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

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [products, setProducts] = useState<Product[]>([])
  const [displayProducts, setDisplayProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
        const response = await productService.getProducts(params)
        // response.content가 배열인지 확인하고, 없으면 빈 배열로 설정
        const productList = Array.isArray(response?.content) ? response.content : []
        setProducts(productList)

        // 각 상품의 판매자 정보를 가져와서 displayProducts 생성
        const productsWithSellerInfo = await Promise.all(
          productList.map(async (product) => {
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

        // 페이지네이션 정보 저장
        const paginationData = {
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          hasNext: response.hasNext || false,
          hasPrevious: response.hasPrevious || false,
          page: response.page || 0,
          size: response.size || 20,
        }
        console.log('페이지네이션 정보:', paginationData)
        setPaginationInfo(paginationData)
      } catch (error) {
        console.error('상품 조회 실패:', error)
        // 에러 발생 시 빈 배열로 설정
        setProducts([])
        setPaginationInfo(null)
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
              {filteredAndSortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
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
