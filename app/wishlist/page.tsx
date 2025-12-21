'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Heart, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { ProductCard } from '@/components/product/product-card'

interface WishlistItem {
  id: string
  name: string
  storeName: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  tag?: string
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      setIsLoading(true)
      try {
        // TODO: 위시리스트 API 호출
        // const response = await wishlistService.getWishlist()
        // setWishlist(response.items || [])

        // 임시 데이터
        await new Promise((resolve) => setTimeout(resolve, 500))
        setWishlist([])
      } catch (error) {
        console.error('위시리스트 조회 실패:', error)
        setWishlist([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlist()
  }, [])

  const handleRemove = (id: string) => {
    // TODO: 위시리스트에서 제거 API 호출
    setWishlist((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">홈으로</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">찜한 상품</h1>
          <p className="text-muted-foreground">관심 있는 상품을 모아보세요</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">찜한 상품을 불러오는 중...</div>
          </div>
        ) : wishlist.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">찜한 상품이 없습니다</h3>
            <p className="text-muted-foreground mb-6">관심 있는 상품을 찜해보세요.</p>
            <Button asChild>
              <Link href="/products">쇼핑하러 가기</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="relative">
                <ProductCard
                  id={item.id}
                  name={item.name}
                  storeName={item.storeName}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  image={item.image}
                  rating={item.rating}
                  reviews={item.reviews}
                  tag={item.tag}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => handleRemove(item.id)}
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
