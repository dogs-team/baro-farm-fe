'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { productService } from '@/lib/api/services/product'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  status: string
  image?: string
}

export default function SellerProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        // TODO: 판매자 상품 목록 API 호출
        // const response = await sellerService.getSellerProducts()
        // setProducts(response.content || [])

        // 임시 데이터
        await new Promise((resolve) => setTimeout(resolve, 500))
        setProducts([])
      } catch (error) {
        console.error('상품 목록 조회 실패:', error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ON_SALE':
        return <Badge variant="default">판매중</Badge>
      case 'SOLD_OUT':
        return <Badge variant="secondary">품절</Badge>
      case 'DISCONTINUED':
        return <Badge variant="outline">판매중지</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">마이페이지로</span>
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">판매 상품 관리</h1>
            <p className="text-muted-foreground">판매하신 상품을 관리하실 수 있습니다</p>
          </div>
          <Button asChild>
            <Link href="/farmer/products/new">
              <Plus className="h-4 w-4 mr-2" />
              상품 등록
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">상품 목록을 불러오는 중...</div>
          </div>
        ) : products.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">등록된 상품이 없습니다</h3>
            <p className="text-muted-foreground mb-6">새로운 상품을 등록해보세요.</p>
            <Button asChild>
              <Link href="/farmer/products/new">상품 등록하기</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="p-4">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="mb-2">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold">{product.price.toLocaleString()}원</span>
                    {getStatusBadge(product.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">재고: {product.stock}개</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/farmer/products/${product.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1">
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
