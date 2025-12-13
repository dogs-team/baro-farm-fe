'use client'

import { useState } from 'react'
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
import { useRouter } from 'next/navigation'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Header } from '@/components/layout/header'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

export default function ExperienceDetailPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date>()
  const [participants, setParticipants] = useState(2)
  const [selectedImage, setSelectedImage] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'onsite'>('onsite') // 현장 결제만 가능

  const experience = {
    id: 1,
    title: '딸기 수확 체험',
    farm: '달콤농원',
    farmId: 1,
    location: '전북 완주',
    price: 25000,
    images: [
      '/strawberry-picking-farm-experience.jpg',
      '/strawberry-farm-greenhouse.jpg',
      '/fresh-strawberries-basket.jpg',
    ],
    duration: '2시간',
    capacity: '최대 10명',
    minParticipants: 2,
    maxParticipants: 10,
    rating: 4.9,
    reviews: 87,
    category: '수확',
    tag: '인기',
    description:
      '달콤농원에서 운영하는 딸기 수확 체험 프로그램입니다. 직접 딸기를 따보고, 수확한 딸기는 가져가실 수 있습니다. 가족 단위 방문객에게 특히 인기가 많습니다.',
    includes: [
      '딸기 수확 체험 (1kg 포장 가능)',
      '농장 투어 및 딸기 재배 설명',
      '딸기 시식',
      '사진 촬영 서비스',
    ],
    schedule: ['오전 10:00 - 12:00', '오후 14:00 - 16:00'],
    notes: [
      '편한 복장과 신발을 착용해주세요',
      '우천 시 실내 체험장에서 진행됩니다',
      '최소 2명 이상 예약 가능합니다',
      '3일 전까지 무료 취소 가능합니다',
    ],
  }

  const reviews = [
    {
      id: 1,
      author: '김**',
      rating: 5,
      date: '2024.12.05',
      content: '아이들이 정말 좋아했어요! 딸기도 달고 신선해서 가족 모두 만족했습니다.',
      helpful: 32,
    },
    {
      id: 2,
      author: '이**',
      rating: 5,
      date: '2024.11.30',
      content: '농장 주인분이 친절하게 설명해주셔서 좋았어요. 딸기 수확 체험 강추합니다!',
      helpful: 24,
    },
    {
      id: 3,
      author: '박**',
      rating: 4,
      date: '2024.11.25',
      content: '재밌었고 딸기도 맛있었는데 시간이 조금 짧게 느껴졌어요.',
      helpful: 15,
    },
  ]

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
      console.log('[v0] Booking experience:', {
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
                  src={experience.images[selectedImage] || '/placeholder.svg'}
                  alt={experience.title}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-4 left-4">{experience.tag}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {experience.images.map((image, index) => (
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
                <span>{experience.farm}</span>
                <span className="mx-1">•</span>
                <span>{experience.location}</span>
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
            </div>

            {/* Description */}
            <Card className="p-6">
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
            <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <div className="text-3xl font-bold mb-2">{experience.price.toLocaleString()}원</div>
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
                      {experience.price.toLocaleString()}원 × {participants}명
                    </span>
                    <span>{totalPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>총 금액</span>
                    <span className="text-primary">{totalPrice.toLocaleString()}원</span>
                  </div>
                </div>

                <Button className="w-full" onClick={handleBooking} type="button" variant="default">
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
