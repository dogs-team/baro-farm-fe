'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  CheckCircle,
  CreditCard,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Header } from '@/components/layout/header'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useParams, useRouter } from 'next/navigation'
import { experienceService, reservationService } from '@/lib/api/services/experience'
import type { Experience } from '@/lib/api/types'
import { getUserId } from '@/lib/api/client'

export default function ExperienceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [date, setDate] = useState<Date>()
  const [participants, setParticipants] = useState(2)
  const [selectedImage, setSelectedImage] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'onsite'>('onsite') // 현장 결제만 가능
  const [experience, setExperience] = useState<Experience | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')

  const experienceId = useMemo(() => {
    const id = params?.id
    if (!id || Array.isArray(id)) return null
    return id
  }, [params])

  useEffect(() => {
    const fetchExperience = async () => {
      if (!experienceId) return
      setIsLoading(true)
      try {
        const data = await experienceService.getExperience(experienceId)
        setExperience(data)
      } catch (error) {
        console.error('체험 상세 조회 실패:', error)
        toast({
          title: '체험 정보를 불러오지 못했습니다',
          description: '다시 시도해주세요.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchExperience()
  }, [experienceId, toast])

  // 기본값/가드
  const images = experience?.images?.length
    ? experience.images
    : experience?.imageUrls?.length
      ? experience.imageUrls
      : ['/placeholder.svg']
  const pricePerPerson = experience?.pricePerPerson ?? 0
  const minParticipants = experience?.capacity ? 1 : 1
  const maxParticipants = experience?.capacity ?? 10
  const durationText = experience?.durationMinutes ? `${experience.durationMinutes}분` : '미정'
  const totalPrice = pricePerPerson * participants
  const scheduleOptions = useMemo(() => {
    const sched = (experience as any)?.schedule
    if (Array.isArray(sched) && sched.length > 0) {
      return sched.filter((s) => typeof s === 'string' && s.trim().length > 0) as string[]
    }

    const duration = experience?.durationMinutes || 0
    const startStr = experience?.availableStartDate
    const endStr = experience?.availableEndDate

    // 시간대를 생성할 수 있는 경우: 시작/종료 시간 + durationMinutes
    if (duration > 0 && startStr && endStr) {
      try {
        const start = new Date(startStr)
        const end = new Date(endStr)
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
          throw new Error('invalid time range')
        }

        const slots: string[] = []
        let cursor = start
        let guard = 0
        const maxSlots = 48 // 하루를 초과하지 않도록 안전 장치

        while (cursor < end && guard < maxSlots) {
          const next = new Date(cursor.getTime() + duration * 60 * 1000)
          if (next > end) break
          const label = `${format(cursor, 'HH:mm')} - ${format(next, 'HH:mm')}`
          slots.push(label)
          cursor = next
          guard += 1
        }

        // 중복 제거
        const uniqueSlots = Array.from(new Set(slots))
        if (uniqueSlots.length > 0) return uniqueSlots
      } catch {
        // ignore parse error
      }
    }

    // fallback: 시작/종료만 있는 경우 단일 슬롯
    if (startStr && endStr) {
      try {
        const start = new Date(startStr)
        const end = new Date(endStr)
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const label = `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
          return [label]
        }
      } catch {
        // ignore parse error
      }
    }

    // 최종 fallback
    return ['기본 시간대']
  }, [experience])

  useEffect(() => {
    if (scheduleOptions && scheduleOptions.length > 0) {
      setSelectedTimeSlot(scheduleOptions[0])
    }
  }, [scheduleOptions])

  const handleBooking = async () => {
    if (!experience) {
      toast({
        title: '체험 정보를 불러오지 못했습니다',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      })
      return
    }
    const experienceIdForRequest = (experience as any).experienceId || experience.id
    if (!experienceIdForRequest) {
      toast({
        title: '체험 정보가 올바르지 않습니다',
        description: '체험 ID를 확인할 수 없습니다. 다시 시도해주세요.',
        variant: 'destructive',
      })
      return
    }
    if (!date) {
      toast({
        title: '날짜를 선택해주세요',
        description: '체험 날짜를 선택한 후 예약해주세요.',
        variant: 'destructive',
      })
      return
    }
    if (!selectedTimeSlot) {
      toast({
        title: '시간을 선택해주세요',
        description: '체험 시간대를 선택한 후 예약해주세요.',
        variant: 'destructive',
      })
      return
    }

    const buyerId = getUserId()
    if (!buyerId) {
      toast({
        title: '로그인이 필요합니다',
        description: '예약을 진행하려면 로그인해주세요.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)
      await reservationService.createReservation({
        experienceId: experienceIdForRequest,
        buyerId,
        reservedDate: format(date, 'yyyy-MM-dd'),
        reservedTimeSlot: selectedTimeSlot,
        headCount: participants,
        totalPrice,
      })

      toast({
        title: '예약이 완료되었습니다',
        description: `${format(date, 'yyyy년 MM월 dd일')} 체험이 예약되었습니다.`,
      })

      router.push('/booking/success')
    } catch (error: any) {
      console.error('예약 실패:', error)
      toast({
        title: '예약 실패',
        description: error?.message || '예약 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!experienceId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">잘못된 체험 ID 입니다.</p>
      </div>
    )
  }

  if (isLoading || !experience) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">체험 정보를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showCart />

      {/* Experience Detail */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Images & Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={images[selectedImage] || '/placeholder.svg'}
                  alt={experience.title}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-4 left-4">{experience.tag}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-video rounded-lg overflow-hidden bg-muted border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image || '/placeholder.svg'}
                      alt={`${experience.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              <Link
                href={`/farms/${experience.farmId}`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-2"
              >
                <MapPin className="h-3 w-3" />
                <span>{experience.farmName || '체험 농장'}</span>
                {experience.farmLocation && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{experience.farmLocation}</span>
                  </>
                )}
              </Link>
              <h1 className="text-3xl font-bold mb-4">{experience.title}</h1>
              {/* 리뷰와 평점 숨김 처리 (나중에 추가될 예정) */}
              {/* <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-semibold">{experience.rating}</span>
                </div>
                <span className="text-muted-foreground">({experience.reviews}개 리뷰)</span>
              </div> */}

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <div className="text-sm text-muted-foreground mb-1">소요 시간</div>
                  <div className="font-semibold">{durationText}</div>
                </Card>
                <Card className="p-4 text-center">
                  <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <div className="text-sm text-muted-foreground mb-1">정원</div>
                  <div className="font-semibold">
                    {experience.capacity ? `${experience.capacity}명` : '미정'}
                  </div>
                </Card>
                <Card className="p-4 text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <div className="text-sm text-muted-foreground mb-1">운영</div>
                  <div className="font-semibold">매일</div>
                </Card>
              </div>
            </div>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">프로그램 소개</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {experience.description || '설명이 없습니다.'}
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">포함 사항</h3>
                  <ul className="space-y-2">
                    {(experience as any).includes?.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">운영 시간</h3>
                  <div className="space-y-2">
                    {(experience as any).schedule?.map((time: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">유의 사항</h3>
                  <ul className="space-y-2">
                    {(experience as any).notes?.map((note: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0 mt-1.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Reviews Section - 숨김 처리 (나중에 추가될 예정) */}
            {/* <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">리뷰</h2>
                <Button variant="outline">리뷰 작성</Button>
              </div>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.author}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm mb-2">{review.content}</p>
                    <button className="text-xs text-muted-foreground hover:text-foreground">
                      도움이 돼요 ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
            </Card> */}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <div className="text-3xl font-bold mb-2">{pricePerPerson.toLocaleString()}원</div>
                <p className="text-sm text-muted-foreground">1인 기준 가격</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">체험 날짜</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-transparent"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP', { locale: ko }) : '날짜 선택'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => d < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">체험 시간대</label>
                  <RadioGroup
                    value={selectedTimeSlot}
                    onValueChange={(value) => setSelectedTimeSlot(value)}
                  >
                    {scheduleOptions.map((time) => (
                      <div key={time} className="flex items-center space-x-2">
                        <RadioGroupItem value={time} id={`time-${time}`} />
                        <Label htmlFor={`time-${time}`} className="font-normal cursor-pointer">
                          {time}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">참여 인원</label>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setParticipants(Math.max(experience.minParticipants, participants - 1))
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-medium">{participants}명</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setParticipants(Math.min(experience.maxParticipants, participants + 1))
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    최소 {experience.minParticipants}명 ~ 최대 {experience.maxParticipants}명
                  </p>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    결제 수단
                  </label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as 'onsite')}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="onsite" id="onsite" />
                      <Label htmlFor="onsite" className="font-normal cursor-pointer">
                        현장 결제
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">체험 당일 현장에서 결제해주세요</p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {pricePerPerson.toLocaleString()}원 × {participants}명
                    </span>
                    <span>{totalPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>총 금액</span>
                    <span className="text-primary">{totalPrice.toLocaleString()}원</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleBooking}
                  type="button"
                  variant="default"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '예약 중...' : '예약하기'}
                </Button>

                <div className="flex gap-2">
                  {/* TODO: 찜하기 기능 추가 예정 */}
                  {/* <Button variant="outline" size="icon" className="flex-1 bg-transparent">
                    <Heart className="h-4 w-4" />
                  </Button> */}
                  <Button variant="outline" size="icon" className="flex-1 bg-transparent">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  3일 전까지 무료 취소 가능
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
