'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { inventoryService } from '@/lib/api/services/inventory'
import { userService } from '@/lib/api/services/user'
import { productService } from '@/lib/api/services/product'
import { sellerService } from '@/lib/api/services/seller'
import type { Product } from '@/lib/api/types'
import { useToast } from '@/hooks/use-toast'

type SellerProductCard = {
  id: string
  productName: string
  productStatus: string
  description?: string
  price: number
  stockQuantity: number | null
  categoryLabel: string
}

function ProductManageContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [sellerId, setSellerId] = useState<string | null>(null)
  const [products, setProducts] = useState<SellerProductCard[]>([])
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const requestedSellerId = searchParams.get('sellerId')

      try {
        const currentUser = await userService.getCurrentUser()
        const isAllowed = await sellerService.hasSellerAccess(currentUser.userId, currentUser.role)

        setAllowed(isAllowed)
        setSellerId(currentUser.userId)
        setLoadError(null)

        if (!isAllowed) {
          setProducts([])
          return
        }

        if (requestedSellerId && requestedSellerId !== currentUser.userId) {
          console.warn('[ProductManage] ignoring mismatched sellerId query:', {
            requestedSellerId,
            currentUserId: currentUser.userId,
          })
        }

        try {
          const response = await productService.getProducts({ page: 0, size: 200 })
          const content = Array.isArray(response?.content) ? response.content : []
          const sellerProducts = content.filter((item) => item.sellerId === currentUser.userId)

          const productCards = await Promise.all(
            sellerProducts.map(async (item) => {
              let stockQuantity: number | null = Array.isArray(item.inventoryOptions)
                ? item.inventoryOptions.reduce((sum, inventory) => sum + inventory.quantity, 0)
                : typeof item.stockQuantity === 'number'
                  ? item.stockQuantity
                  : null

              if (stockQuantity === null) {
                try {
                  const inventories = await inventoryService.getInventoriesByProductId(item.id)
                  stockQuantity = inventories.reduce((sum, inventory) => {
                    return sum + Math.max(inventory.quantity - inventory.reservedQuantity, 0)
                  }, 0)
                } catch (error) {
                  console.warn('[ProductManage] inventory load failed:', {
                    productId: item.id,
                    error,
                  })
                }
              }

              const categoryLabel = item.categoryName || item.categoryCode || item.productCategory || '-'

              return {
                id: item.id,
                productName: item.productName,
                productStatus: item.productStatus,
                description: item.description,
                price: item.price,
                stockQuantity,
                categoryLabel,
              } satisfies SellerProductCard
            })
          )

          setProducts(productCards)
        } catch (error) {
          console.error('[ProductManage] failed to load seller products:', error)
          setProducts([])
          setLoadError('상품 목록을 불러오지 못했습니다. 상품 조회 API 응답을 확인해 주세요.')
        }
      } catch {
        setAllowed(false)
        setSellerId(null)
        setProducts([])
        setLoadError(null)
      } finally {
        setReady(true)
      }
    })()
  }, [searchParams])

  const createHref = useMemo(() => {
    if (!sellerId) return '/products/create'
    return `/products/create?sellerId=${encodeURIComponent(sellerId)}`
  }, [sellerId])

  const handleDelete = async (productId: string) => {
    try {
      setIsDeleting(productId)
      await productService.deleteProduct(productId)
      setProducts((prev) => prev.filter((item) => item.id !== productId))
      toast({
        title: '삭제 완료',
        description: '상품이 삭제되었습니다.',
      })
    } catch (error) {
      console.error('상품 삭제 실패:', error)
      toast({
        title: '삭제 실패',
        description: '상품 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">상품 관리</h1>
          <p className="text-muted-foreground">현재 로그인한 판매자의 상품 목록입니다.</p>
        </div>
        <Button asChild>
          <Link href={createHref}>+ 상품 등록</Link>
        </Button>
      </div>

      {!ready ? (
        <Card className="p-6">로딩 중...</Card>
      ) : !allowed ? (
        <Card className="p-6 space-y-3">
          <p className="font-semibold">접근 권한이 없습니다.</p>
          <p className="text-sm text-muted-foreground">SELLER 계정으로 로그인해 주세요.</p>
          <Button asChild>
            <Link href="/login">로그인으로 이동</Link>
          </Button>
        </Card>
      ) : loadError ? (
        <Card className="p-6 space-y-3">
          <p className="font-semibold">상품 목록을 불러오지 못했습니다.</p>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </Card>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-semibold mb-2">등록된 상품이 없습니다.</p>
          <p className="text-sm text-muted-foreground mb-4">
            + 버튼으로 상품을 등록해 보세요.
          </p>
          <Button asChild>
            <Link href={createHref}>상품 등록</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-semibold text-lg">{product.productName}</h2>
                    <Badge variant="outline">{product.productStatus}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{product.description || '-'}</p>
                  <p className="text-sm">
                    가격 <b>{product.price.toLocaleString()}원</b> / 재고{' '}
                    <b>{product.stockQuantity ?? '-'}</b> / 카테고리 <b>{product.categoryLabel}</b>
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting === product.id}
                  onClick={() => void handleDelete(product.id)}
                >
                  {isDeleting === product.id ? '삭제 중...' : '삭제'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}

export default function ProductManagePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Suspense
        fallback={
          <main className="container mx-auto max-w-5xl px-4 py-10">
            <Card className="p-6">로딩 중...</Card>
          </main>
        }
      >
        <ProductManageContent />
      </Suspense>
    </div>
  )
}
