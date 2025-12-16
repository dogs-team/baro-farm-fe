'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

interface Slide {
  id: number
  image: string
  title: React.ReactNode
  subtitle: string
  ctaText: string
  ctaLink: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
}

const slides: Slide[] = [
  {
    id: 1,
    // 밝은 농장 풍경 - 초록색 밭과 하늘
    image:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1920&auto=format&fit=crop',
    title: (
      <>
        <span className="text-white drop-shadow-md">농장에서 식탁까지,</span>
        <br />
        <span className="text-white drop-shadow-md">신선함을 바로 전합니다</span>
      </>
    ),
    subtitle:
      '환경을 생각하고 탄소 발자국을 줄이는 직거래 플랫폼.\n신선한 농산물과 특별한 농장 체험을 만나보세요.',
    ctaText: '농산물 둘러보기',
    ctaLink: '/products',
    secondaryCtaText: '농장 체험 예약',
    secondaryCtaLink: '/experiences',
  },
  {
    id: 2,
    // 밝은 배경의 신선한 채소
    image:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1920&auto=format&fit=crop',
    title: (
      <>
        <span className="text-white drop-shadow-md">우리 땅에서 자란</span>
        <br />
        <span className="text-white drop-shadow-md">건강한 먹거리</span>
      </>
    ),
    subtitle:
      '매일 아침 수확한 신선함을 식탁으로 배달해드립니다.\n생산자와 소비자가 함께 웃는 상생의 가치.',
    ctaText: '베스트 상품 보기',
    ctaLink: '/products?sort=popular',
  },
  {
    id: 3,
    // 밝은 농장 체험 배경 - 밝은 초록색 농장 풍경
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1920&auto=format&fit=crop',
    title: (
      <>
        <span className="text-white drop-shadow-lg">주말엔 가족과 함께</span>
        <br />
        <span className="text-white drop-shadow-lg">농장 체험 떠나요</span>
      </>
    ),
    subtitle:
      '아이들에게는 자연의 소중함을, 어른들에게는 힐링을.\n다양한 체험 프로그램이 기다리고 있습니다.',
    ctaText: '체험 프로그램 보기',
    ctaLink: '/experiences',
  },
]

export function HeroSlider() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // Auto-play effect
  React.useEffect(() => {
    if (!api) return

    const intervalId = setInterval(() => {
      api.scrollNext()
    }, 5000) // 5 seconds

    return () => clearInterval(intervalId)
  }, [api])

  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-gray-900">
      <Carousel
        setApi={setApi}
        className="w-full h-full [&_[data-slot=carousel-content]]:h-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="h-full -ml-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="relative w-full h-full pl-0">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt="Hero Background"
                  fill
                  className="object-cover"
                  priority={slide.id === 1}
                  // Fallback to a color if image fails (handled by UI but good to have a backup idea)
                />
                <div
                  className={cn(
                    'absolute inset-0',
                    slide.id === 3
                      ? 'bg-gradient-to-b from-black/40 via-black/30 to-black/50'
                      : 'bg-gradient-to-b from-black/30 via-black/20 to-black/40'
                  )}
                />{' '}
                {/* Subtle gradient overlay for text readability */}
              </div>

              {/* Content */}
              <div className="relative h-full container mx-auto px-6 md:px-8 flex flex-col justify-center items-center text-center z-10">
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                  <Badge className="mb-8 text-sm font-medium text-white bg-green-600/90 hover:bg-green-600 border-none px-5 py-2 rounded-full backdrop-blur-sm">
                    Farm-to-Table Platform
                  </Badge>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
                  {slide.title}
                </h1>

                <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed whitespace-pre-line animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
                  {slide.subtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-5 duration-700 delay-500">
                  <Button
                    size="lg"
                    className="text-base px-8 py-6 h-auto bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all scale-100 hover:scale-105"
                    asChild
                  >
                    <Link href={slide.ctaLink}>{slide.ctaText}</Link>
                  </Button>

                  {slide.secondaryCtaText && slide.secondaryCtaLink && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-base px-8 py-6 h-auto border-2 border-white text-white hover:bg-white/20 bg-transparent rounded-lg font-bold backdrop-blur-sm transition-all"
                      asChild
                    >
                      <Link href={slide.secondaryCtaLink}>{slide.secondaryCtaText}</Link>
                    </Button>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Custom Navigation */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all duration-300',
                current === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <CarouselPrevious className="left-4 md:left-8 bg-white/10 hover:bg-white/20 border-white/20 text-white" />
        <CarouselNext className="right-4 md:right-8 bg-white/10 hover:bg-white/20 border-white/20 text-white" />
      </Carousel>
    </section>
  )
}
