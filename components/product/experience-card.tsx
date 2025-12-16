'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ExperienceCardProps {
  id: string | number
  title: string
  farm: string
  location: string
  price: number
  image: string
  duration: string
  capacity: string
  className?: string
}

export function ExperienceCard({
  id,
  title,
  farm,
  location,
  price,
  image,
  duration,
  capacity,
  className,
}: ExperienceCardProps) {
  return (
    <div
      className={cn(
        'group bg-white dark:bg-gray-900 border border-border/50 hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)]',
        className
      )}
    >
      <Link href={`/experiences/${id}`} className="block h-full flex flex-col">
        <div className="relative h-64 overflow-hidden bg-muted">
          <Image
            src={image || '/placeholder.svg'}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
          />
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="backdrop-blur-md bg-white/80 text-foreground text-xs font-semibold shadow-sm"
            >
              체험 프로그램
            </Badge>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          {/* Farm Info */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 font-medium">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="truncate max-w-[120px]">{farm}</span>
            <span className="text-border">•</span>
            <span className="truncate">{location}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3 line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>

          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
              <Clock className="h-3.5 w-3.5" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
              <Users className="h-3.5 w-3.5" />
              <span>{capacity}</span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
            <div className="text-xl font-bold text-primary">{price.toLocaleString()}원</div>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary hover:text-white rounded-lg font-semibold transition-all shadow-sm"
            >
              예약하기
            </Button>
          </div>
        </div>
      </Link>
    </div>
  )
}
