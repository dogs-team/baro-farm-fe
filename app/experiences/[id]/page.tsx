'use client'

import { useState, useEffect } from 'react'
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
import { experienceService } from '@/lib/api/services/experience'
import { farmService } from '@/lib/api/services/farm'
import { reviewService } from '@/lib/api/services/review'
import type { Experience, Farm, Review } from '@/lib/api/types'

export default function ExperienceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const experienceId = params?.id as string
  const { toast } = useToast()

  console.log(
    '[ExperienceDetail] Component rendered with experienceId:',
    experienceId,
    'params:',
    params
  )

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

  useEffect(() => {
    setMounted(true)
  }, [])

  // 체험 프로그램 데이터 로드
  useEffect(() => {
    console.log('[ExperienceDetail] useEffect triggered:', { experienceId, mounted })

    const fetchExperienceData = async () => {
      console.log('[ExperienceDetail] fetchExperienceData called with:', { experienceId, mounted })
      console.log('[ExperienceDetail] Fetching data for experienceId:', experienceId)

      setIsLoading(true)
      try {
        console.log('[ExperienceDetail] Starting API calls...')
        // 체험 프로그램, 농장, 리뷰 정보를 병렬로 로드
        const [experienceData, reviewsData] = await Promise.all([
          experienceService.getExperience(experienceId).then((data) => {
            console.log('[ExperienceDetail] Experience data loaded:', data.title)
            return data
          }),
          reviewService
            .getProductReviews(experienceId, { page: 0, size: 100 })
            .then((data) => {
              console.log(
                '[ExperienceDetail] Reviews data loaded:',
                data.content?.length || 0,
                'reviews'
              )
              return data
            })
            .catch((error) => {
              console.warn('[ExperienceDetail] Reviews load failed:', error)
              return { content: [], totalElements: 0 }
            }), // 리뷰 로드 실패 시 빈 배열로 처리
        ])

        // 농장 정보 로드 (farmId로 농장 조회)
        let farmData: Farm | null = null
        if (experienceData.farmId) {
          console.log('[ExperienceDetail] Loading farm data for farmId:', experienceData.farmId)
          try {
            farmData = await farmService.getFarm(experienceData.farmId)
            console.log('[ExperienceDetail] Farm data loaded:', farmData?.name)
          } catch (error) {
            console.warn('[ExperienceDetail] Farm info load failed:', error)
            // 농장 정보 로드 실패 시 null로 처리
          }
        }

        console.log('[ExperienceDetail] Setting state with data')
        setExperienceApiData(experienceData)
        setFarm(farmData)
        setReviewsApiData(reviewsData.content || [])
        console.log('[ExperienceDetail] State updated successfully')
      } catch (error) {
        console.error('[ExperienceDetail] 체험 프로그램 조회 실패:', error)
        toast({
          title: '체험 프로그램 조회 실패',
          description: '체험 프로그램 정보를 불러오는데 실패했습니다.',
          variant: 'destructive',
        })
        router.push('/experiences')
      } finally {
        console.log('[ExperienceDetail] API call finished, setting isLoading to false')
        setIsLoading(false)
      }
    }

    fetchExperienceData()
  }, [experienceId, mounted, router, toast])

  console.log('[ExperienceDetail] Rendering with state:', {
    isLoading,
    experienceApiData: !!experienceApiData,
  })

  // 로딩 중일 때 표시
  if (isLoading) {
    console.log('[ExperienceDetail] Showing loading UI')
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

  // 데이터가 없는 경우
  if (!experienceApiData) {
    console.log('[ExperienceDetail] No experience data, showing error UI')
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

  console.log('[ExperienceDetail] Rendering main content with experience:', experienceApiData.title)

  // 리뷰 데이터를 표시 형식으로 변환
  const displayReviews = reviewsApiData.map((review, index) => ({
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
  }))

  // API 데이터를 표시 형식으로 변환
  const displayExperience = (() => {
    const exp = experienceApiData!

    // 리뷰 데이터로 평균 평점 계산
    const averageRating =
      displayReviews.length > 0
        ? displayReviews.reduce((sum, review) => sum + review.rating, 0) / displayReviews.length
        : 0

    return {
      id: exp.experienceId,
      title: exp.title,
      farm: farm?.name || '',
      farmId: exp.farmId,
      location: farm?.address || '',
      price: exp.pricePerPerson || 0,
      images: [
        '/strawberry-picking-farm-experience.jpg',
        '/strawberry-farm-greenhouse.jpg',
        '/fresh-strawberries-basket.jpg',
      ], // TODO: API에서 이미지 정보 추가
      duration: `${Math.floor((exp.durationMinutes || 120) / 60)}시간`,
      capacity: `최대 ${exp.capacity || 10}명`,
      minParticipants: 2, // TODO: API에서 최소 인원 정보 추가
      maxParticipants: exp.capacity || 10,
      rating: averageRating,
      reviews: displayReviews.length,
      category: '수확', // TODO: API에서 카테고리 정보 추가
      tag: exp.status === 'ON_SALE' ? '판매중' : '마감',
      description: exp.description,
      includes: ['체험 프로그램', '농장 투어', '시식', '사진 촬영 서비스'], // TODO: API에서 포함 사항 정보 추가
      schedule: ['오전 10:00 - 12:00', '오후 14:00 - 16:00'], // TODO: API에서 스케줄 정보 추가
      notes: [
        '편한 복장과 신발을 착용해주세요',
        '우천 시 실내 체험장에서 진행됩니다',
        `최소 2명 이상 예약 가능합니다`,
        '3일 전까지 무료 취소 가능합니다',
      ],
    }
  })()

  // 표시용 데이터 객체들
  const experience = displayExperience
  const reviews = displayReviews

  const totalPrice = experience.price * participants

  const handleBooking = async () => {
    if (!date) {
      toast({
        title: '날짜를 선택해주세요',
        description: '체험 날짜를 선택한 후 예약해주세요.',
        variant: 'destructive',
      })
      return
    }

    try {
      // TODO: Implement booking logic with backend API
      console.log('Booking experience:', {
        experienceId: experience.id,
        date,
        participants,
        totalPrice,
        paymentMethod: 'onsite', // 현장 결제
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

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
                src={experience.images[selectedImage] || '/placeholder.svg'}
                alt={experience.title}
                fill
                className="object-cover transition-all duration-500"
              />
              <Badge className="absolute top-4 left-4 z-10">{experience.tag}</Badge>

              {/* Navigation Buttons - 순환 기능 */}
              {experience.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        selectedImage === 0 ? experience.images.length - 1 : selectedImage - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        selectedImage === experience.images.length - 1 ? 0 : selectedImage + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Image Indicators - 세련된 디자인 */}
            {experience.images.length > 1 && (
              <div className="flex justify-center gap-3">
                {experience.images.map((_, index) => (
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
                  <div className="font-semibold">{experience.duration}</div>
                </Card>
                <Card className="p-4 text-center">
                  <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <div className="text-sm text-muted-foreground mb-1">정원</div>
                  <div className="font-semibold">{experience.capacity}</div>
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
                {experience.price.toLocaleString()}원
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
                <label className="text-sm font-medium">참여 인원</label>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setParticipants(Math.max(experience.minParticipants, participants - 1))
                    }
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
                    onClick={() =>
                      setParticipants(Math.min(experience.maxParticipants, participants + 1))
                    }
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
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
                    {experience.price.toLocaleString()}원 × {participants}명
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
              >
                예약하기
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

              <p className="text-xs text-muted-foreground text-center">3일 전까지 무료 취소 가능</p>
            </div>
          </Card>
        </div>
      </div>
    </DetailPageLayout>
  )
}
