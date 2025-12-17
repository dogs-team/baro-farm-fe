'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Minus, Plus, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { productService } from '@/lib/api/services/product'
import type { CartItemInfo } from '@/lib/api/types/cart'
import type { Product } from '@/lib/api/types'

interface CartItemProps {
  item: CartItemInfo
  isUpdating: boolean
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

export function CartItem({ item, isUpdating, onUpdateQuantity, onRemove }: CartItemProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  // 상품 정보 조회
  useEffect(() => {
    const fetchProduct = async () => {
      if (!item.productId) return

      try {
        setLoading(true)
        const productData = await productService.getProduct(item.productId)
        setProduct(productData)
      } catch (error) {
        console.error('상품 정보 조회 실패:', error)
        // 상품 정보를 가져오지 못해도 장바구니 기능은 유지
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [item.productId])

  // 표시할 상품 정보
  const displayName = loading ? '로딩 중...' : product?.productName || item.productName || '상품명'
  const displayImage = product?.imageUrls?.[0] || item.productImage || '/placeholder.svg'
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.itemId, item.quantity - 1)
    }
  }

  const handleIncrease = () => {
    onUpdateQuantity(item.itemId, item.quantity + 1)
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Product Image */}
        <Link
          href={`/products/${item.productId}`}
          className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 group"
        >
          <Image
            src={displayImage}
            alt={displayName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <Link
              href={`/products/${item.productId}`}
              className="flex-1 hover:opacity-80 transition-opacity"
            >
              <h4 className="font-semibold text-lg mb-1 line-clamp-2">{displayName}</h4>
              {item.optionInfoJson ? (
                <p className="text-sm text-gray-500">
                  선택한 옵션: {JSON.parse(item.optionInfoJson)}
                </p>
              ) : (
                <p className="text-sm text-gray-500">선택한 옵션: 없음</p>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item.itemId)}
              disabled={isUpdating}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Quantity Controls and Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleDecrease}
                  disabled={isUpdating || item.quantity <= 1}
                >
                  {isUpdating ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <Minus className="h-2.5 w-2.5" />
                  )}
                </Button>
                <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleIncrease}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <Plus className="h-2.5 w-2.5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-base text-gray-900">
                {item.lineTotalPrice.toLocaleString()}원
              </p>
              <p className="text-xs text-gray-500">{item.unitPrice.toLocaleString()}원 / 개</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
