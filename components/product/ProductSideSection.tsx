'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface RelatedProduct {
  id: number
  name: string
  price: number
  image: string
  rating: number
}

interface ProductSideSectionProps {
  farm: string
  farmId: string
  location: string
  relatedProducts: RelatedProduct[]
}

export function ProductSideSection({
  farm,
  farmId,
  location,
  relatedProducts,
}: ProductSideSectionProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">판매 농장</h3>
        <Link href={`/farms/${farmId}`} className="block hover:opacity-80 transition-opacity">
          <div className="aspect-video relative rounded-lg overflow-hidden bg-muted mb-3">
            <Image src="/sunny-farm-with-greenhouse.jpg" alt={farm} fill className="object-cover" />
          </div>
          <h4 className="font-semibold mb-1">{farm}</h4>
          <p className="text-sm text-muted-foreground mb-3">{location}</p>
        </Link>
        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href={`/farms/${farmId}`}>농장 방문하기</Link>
        </Button>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">함께 구매하면 좋은 상품</h3>
        <div className="space-y-4">
          {relatedProducts.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="flex gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={item.image || '/placeholder.svg'}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm mb-1 truncate">{item.name}</h4>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-xs">{item.rating}</span>
                </div>
                <p className="font-semibold text-sm">{(item.price || 0).toLocaleString()}원</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
