'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  deleteDevSellerProduct,
  getDevDummyUser,
  getDevSellerId,
  getDevSellerProducts,
  isApprovedSeller,
  type DevSellerProduct,
} from '@/lib/dev-seller'

export default function ProductManagePage() {
  const searchParams = useSearchParams()
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [sellerId, setSellerId] = useState<string | null>(null)
  const [products, setProducts] = useState<DevSellerProduct[]>([])

  useEffect(() => {
    const user = getDevDummyUser()
    const isAllowed = isApprovedSeller(user)
    const fromQuery = searchParams.get('sellerId')
    const resolvedSellerId = fromQuery || getDevSellerId(user)

    setAllowed(isAllowed)
    setSellerId(resolvedSellerId)

    if (isAllowed && resolvedSellerId) {
      setProducts(getDevSellerProducts(resolvedSellerId))
    } else {
      setProducts([])
    }
    setReady(true)
  }, [searchParams])

  const createHref = useMemo(() => {
    if (!sellerId) return '/products/create'
    return `/products/create?sellerId=${encodeURIComponent(sellerId)}`
  }, [sellerId])

  const refresh = () => {
    if (!sellerId) return
    setProducts(getDevSellerProducts(sellerId))
  }

  const handleDelete = (productId: string) => {
    deleteDevSellerProduct(productId)
    refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">상품 관리</h1>
            <p className="text-muted-foreground">개발용 더미 상품 CRUD 화면</p>
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
            <p className="text-sm text-muted-foreground">승인된 SELLER 계정으로 로그인해주세요.</p>
            <Button asChild>
              <Link href="/login">로그인으로 이동</Link>
            </Button>
          </Card>
        ) : products.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="font-semibold mb-2">등록된 상품이 없습니다.</p>
            <p className="text-sm text-muted-foreground mb-4">+ 버튼으로 상품을 등록해보세요.</p>
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
                      <h2 className="font-semibold text-lg">{product.name}</h2>
                      <Badge variant="outline">{product.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                    <p className="text-sm">
                      가격: <b>{product.price.toLocaleString()}원</b> / 재고: <b>{product.stock}</b>{' '}
                      / 카테고리: <b>{product.category}</b>
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                    삭제
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
