'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Experience } from '@/lib/api/types'

// 체험 카드에 필요한 추가 정보들
export interface ExperienceCardData extends Experience {
  farmName?: string
  farmLocation?: string
  imageUrl?: string
  rating?: number
  reviewCount?: number
}

interface ExperienceCardProps {
  experience: ExperienceCardData
  className?: string
}

export function ExperienceCard({ experience, className }: ExperienceCardProps) {
  const {
    experienceId: id,
    title,
    farmName,
    farmLocation,
    pricePerPerson,
    capacity,
    durationMinutes,
    status,
    imageUrl,
  } = experience

  // 표시용 데이터 변환
  const displayPrice = pricePerPerson || 0
  const displayImage = imageUrl || '/placeholder.svg'
  const displayDuration = `${Math.floor((durationMinutes || 120) / 60)}시간`
  const displayCapacity = `최대 ${capacity || 10}명`
  const displayFarm = farmName || ''
  const displayLocation = farmLocation || ''
  const displayStatus = status === 'ON_SALE' ? '판매중' : '마감'
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
            src={displayImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
          />
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="backdrop-blur-md bg-white/80 text-foreground text-xs font-semibold shadow-sm"
            >
              {displayStatus}
            </Badge>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          {/* Farm Info */}
          {(displayFarm || displayLocation) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {displayFarm && <span className="truncate max-w-[120px]">{displayFarm}</span>}
              {displayFarm && displayLocation && <span className="text-border">•</span>}
              {displayLocation && <span className="truncate">{displayLocation}</span>}
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold mb-3 line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>

          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
              <Clock className="h-3.5 w-3.5" />
              <span>{displayDuration}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
              <Users className="h-3.5 w-3.5" />
              <span>{displayCapacity}</span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
            <div className="text-xl font-bold text-primary">{displayPrice.toLocaleString()}원</div>
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
