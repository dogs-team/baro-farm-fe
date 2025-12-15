'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Filter, X, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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
import type { Product } from '@/lib/api/types'

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 상품 목록 로드
  useEffect(() => {
    const fetchProducts = async () => {
      if (!mounted) return

      setIsLoading(true)
      try {
        const params: { category?: string; keyword?: string; page?: number; size?: number } = {}
        if (category !== 'all') {
          params.category = category
        }
        if (searchQuery.trim()) {
          params.keyword = searchQuery.trim()
        }
        const response = await productService.getProducts(params)
        // response.content가 배열인지 확인하고, 없으면 빈 배열로 설정
        setProducts(Array.isArray(response?.content) ? response.content : [])
      } catch (error) {
        console.error('상품 조회 실패:', error)
        // 에러 발생 시 빈 배열로 설정
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [mounted, category, searchQuery])

  // 카테고리 한글 변환 맵
  const categoryMap: Record<string, string> = {
    FRUIT: '과일',
    VEGETABLE: '채소',
    GRAIN: '곡물',
    NUT: '견과',
    ROOT: '뿌리',
    MUSHROOM: '버섯',
    ETC: '기타',
  }

  // 상품명에 따른 이미지 매핑
  const getProductImage = (productName: string, productId: string): string => {
    const name = productName.toLowerCase()

    // 상품명 키워드에 따른 이미지 매핑
    if (name.includes('토마토') || name.includes('tomato')) {
      return '/fresh-organic-cherry-tomatoes.jpg'
    }
    if (name.includes('상추') || name.includes('lettuce')) {
      return '/fresh-organic-lettuce.png'
    }
    if (name.includes('딸기') || name.includes('strawberry')) {
      return '/images/strawberries.png'
    }
    if (name.includes('감자') || name.includes('potato')) {
      return '/fresh-organic-potatoes.jpg'
    }
    if (name.includes('사과') || name.includes('apple')) {
      return '/images/apples.png'
    }
    if (name.includes('당근') || name.includes('carrot')) {
      return '/fresh-organic-carrots.jpg'
    }
    if (name.includes('블루베리') || name.includes('blueberry')) {
      return '/fresh-organic-blueberries.jpg'
    }
    if (name.includes('브로콜리') || name.includes('broccoli')) {
      return '/fresh-organic-broccoli.jpg'
    }
    if (name.includes('오이') || name.includes('cucumber')) {
      return '/fresh-organic-lettuce.png'
    }
    if (name.includes('배추') || name.includes('cabbage')) {
      return '/fresh-organic-lettuce.png'
    }
    if (name.includes('양파') || name.includes('onion')) {
      return '/fresh-organic-potatoes.jpg'
    }
    if (name.includes('고추') || name.includes('pepper')) {
      return '/fresh-organic-cherry-tomatoes.jpg'
    }

    // 매칭되지 않으면 상품 ID를 기반으로 랜덤하게 선택
    const fallbackImages = [
      '/fresh-organic-cherry-tomatoes.jpg',
      '/fresh-organic-lettuce.png',
      '/images/strawberries.png',
      '/fresh-organic-potatoes.jpg',
      '/images/apples.png',
      '/fresh-organic-carrots.jpg',
      '/fresh-organic-blueberries.jpg',
      '/fresh-organic-broccoli.jpg',
    ]

    // productId의 해시값을 사용하여 일관된 랜덤 선택
    const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return fallbackImages[hash % fallbackImages.length]
  }

  // API 데이터를 표시 형식으로 변환
  const displayProducts = useMemo(() => {
    // products가 배열이 아니면 빈 배열 반환
    if (!Array.isArray(products)) {
      return []
    }
    return products.map((product) => {
      const productName = product.productName || product.name || ''
      const defaultImage = getProductImage(productName, product.id)

      return {
        id: product.id,
        name: productName,
        farm: product.farmName || '농장',
        location: product.farmLocation || '',
        price: product.price,
        originalPrice: product.productStatus === 'DISCOUNTED' ? product.price * 1.2 : product.price,
        image: product.imageUrls?.[0] || product.images?.[0] || defaultImage,
        rating: product.rating || 0,
        reviews: 0, // TODO: 리뷰 개수 API 추가 시 업데이트
        tag:
          product.productStatus === 'DISCOUNTED'
            ? '할인'
            : product.productStatus === 'ON_SALE'
              ? '판매중'
              : '베스트',
        category: categoryMap[product.productCategory] || product.category || '기타',
      }
    })
  }, [products])

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
                    {filteredAndSortedProducts.length}
                  </span>
                  개의 상품
                  {hasActiveFilters && (
                    <span className="ml-2 text-xs">(전체 {products.length}개 중)</span>
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
                <Card
                  key={product.id}
                  className="overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <Link href={`/products/${product.id}`}>
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <Badge className="absolute top-3 left-3">{product.tag}</Badge>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>{product.farm}</span>
                        <span className="mx-1">•</span>
                        <span>{product.location}</span>
                      </div>
                      <h3 className="font-semibold mb-2">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-sm text-muted-foreground">({product.reviews})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {product.price.toLocaleString()}원
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {product.originalPrice.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
