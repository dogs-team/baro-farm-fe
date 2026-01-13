'use client'

import { Badge } from '@/components/ui/badge'
import { MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  id: string | number
  name: string
  storeName: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  tag?: string
  className?: string
}

export function ProductCard({
  id,
  name,
  storeName,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  tag,
  className,
}: ProductCardProps) {
  // Discount calculation
  const discountRate =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0

  const handleClick = () => {
    if (typeof window === 'undefined') return

    console.log('[Tracking] card click', {
      id,
      name,
      storeName,
      price,
      path: window.location.pathname,
    })

    const payload = {
      type: 'product_detail_click',
      productId: String(id),
      productName: name,
      storeName,
      price,
      timestamp: Date.now(),
      path: window.location.pathname,
    }

    // GA 이벤트 (선택 사항)
    try {
      ;(window as any).gtag?.('event', 'product_detail_click', {
        event_category: 'engagement',
        event_label: String(id),
        product_name: name,
        store_name: storeName,
        price,
        page_path: window.location.pathname,
      })
    } catch (error) {
      console.warn('[Tracking] gtag click error', error)
    }

    // 서버 API → S3 로그 적재
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/log-product-click', JSON.stringify(payload))
      } else {
        fetch('/api/log-product-click', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {})
      }
    } catch (error) {
      console.warn('[Tracking] click send error', error)
    }
  }

  return (
    <div
      className={cn(
        'group bg-white dark:bg-gray-900 border border-border/50 hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)]',
        className
      )}
    >
      <Link href={`/products/${id}`} className="block h-full flex flex-col" onClick={handleClick}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={image || '/placeholder.svg'}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
          />
          {/* Tag Grid */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {tag && (
              <Badge
                className={cn(
                  'rounded-md px-2.5 py-0.5 text-xs font-semibold shadow-sm border-0',
                  tag === '베스트'
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : tag === '신선'
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : tag === '인기'
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : tag === '할인'
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-primary text-primary-foreground'
                )}
              >
                {tag}
              </Badge>
            )}
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          {/* Farm Info */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2.5 font-medium">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="truncate max-w-[100px]">{storeName}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-auto">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({reviews.toLocaleString()})</span>
          </div>

          {/* Price Section */}
          <div className="mt-4 pt-4 border-t border-border/50 flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">{price.toLocaleString()}원</span>
            {originalPrice && originalPrice > price && (
              <>
                <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                  {originalPrice.toLocaleString()}원
                </span>
                <span className="ml-auto text-sm text-red-500 font-bold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">
                  {discountRate}% OFF
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
