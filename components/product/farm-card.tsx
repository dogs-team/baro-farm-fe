'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface FarmCardProps {
  id: string | number
  name: string
  location: string
  products: number
  experiences: number
  image: string
  specialties: string[]
  certification: string[]
  className?: string
}

export function FarmCard({
  id,
  name,
  location,
  products,
  experiences,
  image,
  specialties,
  certification,
  className,
}: FarmCardProps) {
  return (
    <div
      className={cn(
        'group bg-white dark:bg-gray-900 border border-border/50 hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)]',
        className
      )}
    >
      <Link href={`/farms/${id}`} className="block">
        <div className="relative h-48 overflow-hidden bg-muted">
          <Image
            src={image || '/placeholder.svg'}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
          />
        </div>
      </Link>
      <div className="p-5">
        <Link href={`/farms/${id}`} className="block mb-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors duration-200">
                {name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {certification.map((cert) => (
              <Badge
                key={cert}
                variant="secondary"
                className="text-xs bg-muted/50 text-muted-foreground border-transparent font-normal"
              >
                {cert}
              </Badge>
            ))}
          </div>

          <div className="space-y-2 mb-4 bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">판매 상품</span>
              <span className="font-semibold">{products}개</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">체험 프로그램</span>
              <span className="font-semibold">{experiences}개</span>
            </div>
          </div>

          <div className="mb-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Major Specialties
            </p>
            <div className="flex flex-wrap gap-1.5">
              {specialties.map((specialty) => (
                <Badge
                  key={specialty}
                  variant="outline"
                  className="text-xs font-normal border-border/60"
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </Link>

        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-primary/20 text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all"
            asChild
          >
            <Link href={`/farms/${id}`}>상세보기</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-primary/20 text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all"
            asChild
          >
            <Link href={`/products?farm=${id}`}>상품보기</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
