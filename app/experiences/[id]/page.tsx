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
  Share2,
  CheckCircle,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { DetailPageLayout } from '@/components/layout/detail-page-layout'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { experienceService, reservationService } from '@/lib/api/services/experience'
import { farmService } from '@/lib/api/services/farm'
import { reviewService } from '@/lib/api/services/review'
import type { Experience, Farm, Review } from '@/lib/api/types'
import { getUserId } from '@/lib/api/client'

export default function ExperienceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  // API 데이터 상태
  const [experienceApiData, setExperienceApiData] = useState<Experience | null>(null)
  const [farm, setFarm] = useState<Farm | null>(null)
  const [reviewsApiData, setReviewsApiData] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // UI 상태
  const [date, setDate] = useState<Date>()
  const [participants, setParticipants] = useState(2)
  const [selectedImage, setSelectedImage] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'onsite'>('onsite') // 현장 결제만 가능
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')

  const experienceId = useMemo(() => {
    const id = params?.id
    if (!id) return null
    return Array.isArray(id) ? id[0] : id
  }, [params])

  useEffect(() => {
    setMounted(true)
  }, [])

  // 체험 프로그램 데이터 로드
  useEffect(() => {
    const fetchExperienceData = async () => {
      if (!experienceId || !mounted) return
      setIsLoading(true)
      try {
        const [experienceData, reviewsData] = await Promise.all([
          experienceService.getExperience(experienceId),
          reviewService
            .getProductReviews(experienceId, { page: 0, size: 100 })
            .catch(() => ({ content: [], totalElements: 0 })),
        ])

        let farmData: Farm | null = null
        if (experienceData.farmId) {
          try {
            farmData = await farmService.getFarm(experienceData.farmId)
          } catch {
            farmData = null
          }
        }

        setExperienceApiData(experienceData)
        setFarm(farmData)
        setReviewsApiData(reviewsData.content || [])
      } catch (error) {
        console.error('체험 프로그램 조회 실패:', error)
        toast({
          title: '체험 프로그램 조회 실패',
          description: '체험 프로그램 정보를 불러오는데 실패했습니다.',
          variant: 'destructive',
        })
        router.push('/experiences')
      } finally {
        setIsLoading(false)
      }
    }

    fetchExperienceData()
  }, [experienceId, mounted, router, toast])

  // 리뷰 데이터를 표시 형식으로 변환
  const displayReviews = useMemo(
    () =>
      reviewsApiData.map((review, index) => ({
        id: review.id || index + 1,
        author: review.userName ? `${review.userName.slice(0, 1)}**` : '익명',
        rating: review.rating,
        date: review.createdAt
          ? new Date(review.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
          : '',
        content: review.content,
        helpful: review.helpfulCount || 0,
      })),
    [reviewsApiData]
  )

  const scheduleOptions = useMemo(() => {
    if (!experienceApiData) return ['기본 시간대']

    const sched = (experienceApiData as { schedule?: string[] }).schedule
    if (Array.isArray(sched) && sched.length > 0) {
      const cleaned = sched.filter((s) => typeof s === 'string' && s.trim().length > 0)
      if (cleaned.length) return cleaned
    }

    const duration = experienceApiData.durationMinutes || 0
    const startStr = experienceApiData.availableStartDate
    const endStr = experienceApiData.availableEndDate

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
        const maxSlots = 48

        while (cursor < end && guard < maxSlots) {
          const next = new Date(cursor.getTime() + duration * 60 * 1000)
          if (next > end) break
          slots.push(`${format(cursor, 'HH:mm')} - ${format(next, 'HH:mm')}`)
          cursor = next
          guard += 1
        }

        const uniqueSlots = Array.from(new Set(slots))
        if (uniqueSlots.length > 0) return uniqueSlots
      } catch {
        /* ignore parse error */
      }
    }

    if (startStr && endStr) {
      try {
        const start = new Date(startStr)
        const end = new Date(endStr)
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          return [`${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`]
        }
      } catch {
        /* ignore parse error */
      }
    }

    return ['기본 시간대']
  }, [experienceApiData])

  useEffect(() => {
    if (scheduleOptions && scheduleOptions.length > 0) {
      setSelectedTimeSlot(scheduleOptions[0])
    }
  }, [scheduleOptions])

  // API 데이터를 표시 형식으로 변환
  const displayExperience = useMemo(() => {
    if (!experienceApiData) return null

    const exp = experienceApiData
    const imagesFromApi = (experienceApiData as { imageUrls?: string[] }).imageUrls
    const averageRating =
      displayReviews.length > 0
        ? displayReviews.reduce((sum, review) => sum + review.rating, 0) / displayReviews.length
        : 0

    return {
      id: exp.experienceId,
      experienceId: exp.experienceId,
      title: exp.title,
      farm: farm?.name || '체험 농장',
      farmId: exp.farmId,
      location: farm?.address || '',
      pricePerPerson: exp.pricePerPerson || 0,
      images:
        imagesFromApi && Array.isArray(imagesFromApi) && imagesFromApi.length > 0
          ? imagesFromApi
          : [
              '/strawberry-picking-farm-experience.jpg',
              '/strawberry-farm-greenhouse.jpg',
              '/fresh-strawberries-basket.jpg',
            ],
      durationMinutes: exp.durationMinutes,
      capacity: exp.capacity,
      minParticipants: 1,
      maxParticipants: exp.capacity || 10,
      rating: averageRating,
      reviews: displayReviews.length,
      category: '수확',
      tag: exp.status === 'ON_SALE' ? '판매중' : '마감',
      description: exp.description,
      includes: ['체험 프로그램', '농장 투어', '시식', '사진 촬영 서비스'],
      schedule: scheduleOptions.length ? scheduleOptions : ['기본 시간대'],
      notes: [
        '편한 복장과 신발을 착용해주세요',
        '우천 시 실내 체험장에서 진행됩니다',
        '최소 1명 이상 예약 가능합니다',
        '3일 전까지 무료 취소 가능합니다',
      ],
    }
  }, [experienceApiData, farm, displayReviews, scheduleOptions])

  useEffect(() => {
    if (!displayExperience) return
    setParticipants((prev) =>
      Math.min(Math.max(prev, displayExperience.minParticipants), displayExperience.maxParticipants)
    )
  }, [displayExperience])

  if (isLoading) {
    return (
      <DetailPageLayout>
        <div className="text-center py-16">
          <div className="text-lg font-semibold mb-2">로딩 중...</div>
          <div className="text-sm text-muted-foreground">
            체험 프로그램 정보를 불러오는 중입니다.
          </div>
        </div>
      </DetailPageLayout>
    )
  }

  if (!experienceApiData || !displayExperience || !experienceId) {
    return (
      <DetailPageLayout>
        <div className="text-center space-y-4 py-16">
          <h1 className="text-2xl font-bold">체험 프로그램을 찾을 수 없습니다</h1>
          <p className="text-muted-foreground">
            요청하신 체험 프로그램이 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
          <Button asChild>
            <Link href="/experiences">체험 프로그램 목록으로 돌아가기</Link>
          </Button>
        </div>
      </DetailPageLayout>
    )
  }

  const experience = displayExperience

  // 기본값/가드
  const images = experience.images?.length ? experience.images : ['/placeholder.svg']
  const pricePerPerson = experience.pricePerPerson ?? 0
  const minParticipants = experience.minParticipants ?? 1
  const maxParticipants = experience.maxParticipants ?? 10
  const durationText = experience.durationMinutes ? `${experience.durationMinutes}분` : '미정'
  const totalPrice = pricePerPerson * participants

  const handleBooking = async () => {
    if (!experience) {
      toast({
        title: '체험 정보를 불러오지 못했습니다',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      })
      return
    }
    const experienceIdForRequest = experience.experienceId || experience.id
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
    } catch (error: unknown) {
      console.error('예약 실패:', error)
      const message =
        error instanceof Error ? error.message : '예약 중 오류가 발생했습니다. 다시 시도해주세요.'
      toast({
        title: '예약 실패',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DetailPageLayout>
      {/* Experience Detail */}
      <div className="grid lg:grid-cols-3 gap-10 mb-16">
        {/* Left Column - Images & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted group">
              <Image
                src={images[selectedImage] || '/placeholder.svg'}
                alt={experience.title}
                fill
                className="object-cover transition-all duration-500"
              />
              <Badge className="absolute top-4 left-4 z-10">{experience.tag}</Badge>

              {/* Navigation Buttons - 순환 기능 */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Image Indicators - 세련된 디자인 */}
            {images.length > 1 && (
              <div className="flex justify-center gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative transition-all duration-300 ${
                      selectedImage === index
                        ? 'w-8 h-3 bg-primary rounded-full'
                        : 'w-3 h-3 bg-muted-foreground/40 hover:bg-muted-foreground/60 rounded-full'
                    }`}
                  >
                    {selectedImage === index && (
                      <div className="absolute inset-0 bg-primary rounded-full animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <Link
              href={`/farms/${experience.farmId}`}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-2"
            >
              <MapPin className="h-3 w-3" />
              <span>{experience.farm || '체험 농장'}</span>
              {experience.location && (
                <>
                  <span className="mx-1">•</span>
                  <span>{experience.location}</span>
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
          </div>

          {/* Description */}
          <Card className="p-8 rounded-2xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-4">프로그램 소개</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{experience.description}</p>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">포함 사항</h3>
                <ul className="space-y-2">
                  {experience.includes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

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

              <div>
                <h3 className="font-semibold mb-3">운영 시간</h3>
                <div className="space-y-2">
                  {experience.schedule.map((time, index) => (
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
                  {experience.notes.map((note, index) => (
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
          <Card className="p-6 sticky top-24 shadow-xl border border-gray-100 rounded-2xl bg-white space-y-6">
            {/* Title and Location */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">{experience.title}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{experience.farm}</span>
                <span className="mx-1">•</span>
                <span>{experience.location}</span>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-4">
              <div className="text-3xl font-bold text-primary">
                {pricePerPerson.toLocaleString()}원
              </div>
              <p className="text-xs text-muted-foreground mt-1">1인 기준 · 현장 결제</p>
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
                      disabled={(date) => date < new Date()}
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
                    size="sm"
                    onClick={() => setParticipants((prev) => Math.max(minParticipants, prev - 1))}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-base font-medium min-w-[3rem] text-center">
                    {participants}명
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setParticipants((prev) => Math.min(maxParticipants, prev + 1))}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  최소 {minParticipants}명 ~ 최대 {maxParticipants}명
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
                className="w-full h-12 font-bold rounded-xl shadow-md"
                onClick={handleBooking}
                type="button"
                variant="default"
                disabled={isSubmitting}
              >
                {isSubmitting ? '예약 중...' : '예약하기'}
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="flex-1 bg-transparent">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">3일 전까지 무료 취소 가능</p>
            </div>
          </Card>
        </div>
      </div>
    </DetailPageLayout>
  )
}
