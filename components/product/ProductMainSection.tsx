'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Minus, Plus, ShoppingCart, Share2, Truck, Shield, Leaf } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/api/types/product'

// DisplayProduct - UI 표시용 데이터 구조 (Product 타입과 호환)
export interface DisplayProduct extends Product {
  // UI 표시용 추가 필드들 (Product 타입에 없는 것들)
  originalPrice: number
  tag: string
  weight: string
  certification: string
  delivery: string

  // 편의를 위한 computed 필드들
  storeName: string
  reviews: number
  rating: number
}

interface ProductMainSectionProps {
  product: DisplayProduct
  quantity: number
  selectedImage: number
  onChangeQuantity: (quantity: number) => void
  onChangeSelectedImage: (index: number) => void
  onAddToCart: () => void
  onBuyNow: () => void
}

export function ProductMainSection({
  product,
  quantity,
  selectedImage,
  onChangeQuantity,
  onChangeSelectedImage,
  onAddToCart,
  onBuyNow,
}: ProductMainSectionProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-8 mb-12">
      {/* Images */}
      <div className="space-y-4">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <Image
            src={product.imageUrls[selectedImage] || '/placeholder.svg'}
            alt={product.productName}
            fill
            className="object-cover"
            priority
          />
          <Badge className="absolute top-4 left-4">{product.tag}</Badge>

          {/* Navigation Arrows */}
          {product.imageUrls.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={() => {
                  const newIndex =
                    selectedImage === 0 ? product.imageUrls.length - 1 : selectedImage - 1
                  onChangeSelectedImage(newIndex)
                }}
              >
                <span className="text-xl font-bold">‹</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={() => {
                  const newIndex =
                    selectedImage === product.imageUrls.length - 1 ? 0 : selectedImage + 1
                  onChangeSelectedImage(newIndex)
                }}
              >
                <span className="text-xl font-bold">›</span>
              </Button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {product.imageUrls.length > 1 && (
          <div className="flex justify-center gap-2">
            {product.imageUrls.map((_, index) => (
              <button
                key={index}
                onClick={() => onChangeSelectedImage(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  selectedImage === index ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                aria-label={`이미지 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <Link
            href={`/farms/${product.sellerId}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-2"
          >
            <MapPin className="h-3 w-3" />
            <span>{product.storeName}</span>
          </Link>
          <h1 className="text-3xl font-bold mb-4">{product.productName}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="font-semibold">{product.rating}</span>
            </div>
            <span className="text-muted-foreground">({product.reviews}개 리뷰)</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{(product.price || 0).toLocaleString()}원</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {(product.originalPrice || 0).toLocaleString()}원
                </span>
                <Badge variant="destructive">
                  {Math.round(
                    ((product.originalPrice - product.price) / product.originalPrice) * 100
                  )}
                  % 할인
                </Badge>
              </>
            )}
            <p className="text-sm text-muted-foreground">{product.weight} 기준 가격</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-primary" />
            <span>{product.certification}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4 text-primary" />
            <span>{product.delivery}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Leaf className="h-4 w-4 text-primary" />
            <span>친환경 포장재 사용</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">수량</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onChangeQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => onChangeQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onAddToCart}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              장바구니
            </Button>
            <Button className="flex-1" onClick={onBuyNow}>
              바로 구매
            </Button>
          </div>

          <div className="flex gap-2">
            {/* TODO: 찜하기 기능 추가 예정 */}
            {/* <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button> */}
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
