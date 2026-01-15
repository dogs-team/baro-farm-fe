'use client'

import { Trophy, Medal, Award } from 'lucide-react'
import { ProductCard } from './product-card'
import { cn } from '@/lib/utils'

interface RankingProduct {
  id: string | number
  name: string
  storeName: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  tag?: string
  rank: number // 필수 필드
}

interface ProductRankingProps {
  products: RankingProduct[]
  isLoading?: boolean
  className?: string
}

const rankConfig = {
  1: {
    icon: Trophy,
    bgColor: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-600',
    shadow: 'shadow-lg shadow-yellow-500/20',
    scale: 'scale-105',
    label: '1위',
  },
  2: {
    icon: Medal,
    bgColor: 'bg-gradient-to-br from-gray-300 to-gray-500',
    borderColor: 'border-gray-400',
    textColor: 'text-gray-600',
    shadow: 'shadow-lg shadow-gray-500/20',
    scale: 'scale-103',
    label: '2위',
  },
  3: {
    icon: Award,
    bgColor: 'bg-gradient-to-br from-orange-400 to-orange-600',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-600',
    shadow: 'shadow-lg shadow-orange-500/20',
    scale: 'scale-101',
    label: '3위',
  },
}

export function ProductRanking({ products, isLoading = false, className }: ProductRankingProps) {
  // 상위 3개만 표시
  const topProducts = products.slice(0, 3)

  // 로딩 중이거나 상품이 없으면 표시하지 않음
  if (isLoading || !products || products.length === 0) {
    if (isLoading) {
      return (
        <section className={cn('py-8 bg-gradient-to-b from-muted/30 to-background', className)}>
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl md:text-3xl font-bold">실시간 인기 랭킹</h2>
              </div>
              <p className="text-muted-foreground text-sm md:text-base">
                지금 가장 인기 있는 농산물을 확인해보세요
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map((rank) => (
                <div key={rank} className="relative h-[400px] bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      )
    }
    return null
  }

  return (
    <section className={cn('py-8 bg-gradient-to-b from-muted/30 to-background', className)}>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl md:text-3xl font-bold">실시간 인기 랭킹</h2>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            지금 가장 인기 있는 농산물을 확인해보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {topProducts.map((product, index) => {
            const rank = product.rank || index + 1
            const config = rankConfig[rank as keyof typeof rankConfig]
            const Icon = config?.icon || Trophy

            return (
              <div
                key={product.id}
                className={cn(
                  'relative group',
                  rank === 1 && 'md:order-1',
                  rank === 2 && 'md:order-2',
                  rank === 3 && 'md:order-3'
                )}
              >
                {/* 랭킹 배지 */}
                <div
                  className={cn(
                    'absolute -top-3 -left-3 z-20 flex items-center justify-center w-12 h-12 rounded-full',
                    config?.bgColor,
                    config?.borderColor,
                    config?.shadow,
                    'border-2 border-white dark:border-gray-900'
                  )}
                >
                  <Icon className="h-6 w-6 text-white" />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-black/30 px-1.5 py-0.5 rounded-full">
                    {rank}
                  </span>
                </div>

                {/* 상품 카드 */}
                <div
                  className={cn(
                    'relative transition-all duration-300',
                    config?.scale,
                    config?.shadow,
                    'hover:scale-105'
                  )}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    storeName={product.storeName}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    image={product.image}
                    rating={product.rating}
                    reviews={product.reviews}
                    tag={product.tag || '인기'}
                    className={cn(
                      'h-full',
                      rank === 1 && 'border-2 border-yellow-500/30',
                      rank === 2 && 'border-2 border-gray-400/30',
                      rank === 3 && 'border-2 border-orange-500/30'
                    )}
                  />
                </div>

                {/* 랭킹 라벨 */}
                <div
                  className={cn(
                    'absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold text-white',
                    config?.bgColor,
                    'shadow-md'
                  )}
                >
                  {config?.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* 랭킹 설명 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            * 랭킹은 리뷰 수, 평점, 최근 주문량을 종합하여 실시간으로 계산됩니다
          </p>
        </div>
      </div>
    </section>
  )
}
