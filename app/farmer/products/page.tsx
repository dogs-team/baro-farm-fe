'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sprout, Search, Plus, Edit, Trash2, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FarmerNav } from '../components/farmer-nav'
import { productService } from '@/lib/api/services/product'
import { authService } from '@/lib/api/services/auth'
import type { Product } from '@/lib/api/types'
import { getProductImage } from '@/lib/utils/product-images'
import { useToast } from '@/hooks/use-toast'

export default function FarmerProductsPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  // 현재 사용자 정보 및 상품 목록 조회
  useEffect(() => {
    const fetchData = async () => {
      if (!mounted) return

      setIsLoading(true)
      try {
        // 현재 사용자 정보 가져오기
        const user = await authService.getCurrentUser()

        // 상품 목록 가져오기 (page, size는 API가 지원하는 경우 전달)
        const response = await productService.getProducts({
          page: 0,
          size: 100,
        } as any)

        // 현재 판매자의 상품만 필터링
        const content = Array.isArray(response?.content) ? response.content : []
        const myProducts = content.filter((product) => product.sellerId === user.userId)
        setProducts(myProducts)
      } catch (error: unknown) {
        console.error('상품 목록 조회 실패:', error)
        const errorMessage =
          error instanceof Error ? error.message : '상품 정보를 불러오는 중 오류가 발생했습니다.'
        toast({
          title: '상품 조회 실패',
          description: errorMessage,
          variant: 'destructive',
        })
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [mounted, toast])

  // 검색 필터링
  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      product.productName.toLowerCase().includes(query) ||
      (product.description || '').toLowerCase().includes(query)
    )
  })

  // 상품 상태 한글 변환
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ON_SALE':
        return '판매중'
      case 'DISCOUNTED':
        return '할인중'
      case 'SOLD_OUT':
        return '품절'
      case 'HIDDEN':
        return '숨김'
      case 'DELETED':
        return '삭제됨'
      default:
        return status
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ON_SALE':
      case 'DISCOUNTED':
        return 'default'
      case 'SOLD_OUT':
        return 'secondary'
      case 'HIDDEN':
      case 'DELETED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">바로팜</span>
            </Link>
            <Badge variant="secondary">농가</Badge>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">고객 페이지</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>햇</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>햇살농장</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/farmer/dashboard">대시보드</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/farmer/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    설정
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <FarmerNav />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">상품 관리</h1>
            <p className="text-muted-foreground">등록된 상품을 관리하고 재고를 업데이트하세요</p>
          </div>
          <Button asChild>
            <Link href="/farmer/products/new">
              <Plus className="h-4 w-4 mr-2" />
              상품 등록
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="상품 검색..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">상품 목록을 불러오는 중...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchQuery.trim() ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.'}
            </p>
            <Button asChild>
              <Link href="/farmer/products/new">
                <Plus className="h-4 w-4 mr-2" />
                상품 등록하기
              </Link>
            </Button>
          </Card>
        ) : (
          /* Products Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const productImage =
                product.imageUrls && product.imageUrls.length > 0
                  ? product.imageUrls[0]
                  : getProductImage(product.productName, product.id)

              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={productImage}
                      alt={product.productName}
                      fill
                      className="object-cover"
                    />
                    <Badge
                      className="absolute top-3 right-3"
                      variant={getStatusVariant(product.productStatus)}
                    >
                      {getStatusLabel(product.productStatus)}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{product.productName}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {product.price.toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          재고:{' '}
                          <span
                            className={
                              product.stockQuantity === 0
                                ? 'text-destructive font-medium'
                                : 'font-medium text-foreground'
                            }
                          >
                            {product.stockQuantity}개
                          </span>
                        </span>
                        {product.reviewCount !== undefined && (
                          <span>리뷰: {product.reviewCount}개</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                        <Link href={`/farmer/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          편집
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: 삭제 API 연동
                          toast({
                            title: '삭제 기능',
                            description: '상품 삭제 기능은 곧 추가될 예정입니다.',
                          })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
