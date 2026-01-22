'use client'

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
import { useQuery } from '@tanstack/react-query'
import { productService } from '@/lib/api/services/product'
import { useDeleteProduct } from '@/hooks/use-product-mutation'
import { Skeleton } from '@/components/ui/skeleton'

export default function FarmerProductsPage() {
  // Fetch products from API
  const { data: response, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  })

  const deleteMutation = useDeleteProduct()

  const products = response?.content || []

  // ... (Header and layout structure remains similar, replacing mock map with real data)

  const handleDelete = (id: string, name: string) => {
    if (confirm(`${name} 상품을 삭제하시겠습니까?`)) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header preserved */}
        <header className="border-b bg-background sticky top-0 z-50">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <Sprout className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">바로팜</span>
              </Link>
              <Badge variant="secondary">농가</Badge>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">상품 관리</h1>
              <p className="text-muted-foreground">등록된 상품을 관리하고 재고를 업데이트하세요</p>
            </div>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              상품 등록
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
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
            <Input placeholder="상품 검색..." className="pl-10" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              등록된 상품이 없습니다.
            </div>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="overflow-hidden group">
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={product.imageUrls?.[0] || '/placeholder.svg'}
                    alt={product.productName}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <Badge
                    className="absolute top-3 right-3"
                    variant={product.productStatus === 'ON_SALE' ? 'default' : 'secondary'}
                  >
                    {product.productStatus === 'ON_SALE'
                      ? '판매중'
                      : product.productStatus === 'SOLD_OUT'
                        ? '품절'
                        : product.productStatus === 'DISCOUNTED'
                          ? '할인'
                          : product.productStatus}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1">{product.productName}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{product.price.toLocaleString()}원</span>
                      {/* Original price logic if available in API */}
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
                      {/* Sales count if available in API */}
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
                      onClick={() => handleDelete(product.id, product.productName)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
