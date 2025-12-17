'use client'

import { useEffect, useMemo, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { reservationService } from '@/lib/api/services/experience'
import type { ExperienceBooking } from '@/lib/api/types'
import { getUserId } from '@/lib/api/client'
import { Calendar, Clock, Users } from 'lucide-react'

export default function BookingsPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<ExperienceBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [buyerId, setBuyerId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    setBuyerId(getUserId())
  }, [])

  useEffect(() => {
    const fetchBookings = async () => {
      if (!mounted) return
      const uid = getUserId()
      if (!uid) {
        setIsLoading(false)
        return
      }
      setBuyerId(uid)
      setIsLoading(true)
      try {
        const response = await reservationService.getReservations({
          page: 0,
          size: 50,
          // buyerId 필터가 없을 수 있으므로, 일단 전체 조회 후 클라이언트에서 필터
        } as any)
        const list = Array.isArray(response?.content) ? response.content : []
        const filtered = list.filter((item) => !item.buyerId || item.buyerId === uid)
        setBookings(filtered)
      } catch (error) {
        console.error('예약 내역 조회 실패:', error)
        toast({
          title: '예약 내역을 불러오지 못했습니다',
          description: '잠시 후 다시 시도해주세요.',
          variant: 'destructive',
        })
        setBookings([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchBookings()
  }, [mounted, toast])

  const displayBookings = useMemo(() => {
    return bookings.map((b) => ({
      id: b.id,
      experienceTitle: b.experienceTitle || '체험 프로그램',
      date: b.date || b.reservedDate || '',
      time: b.reservedTimeSlot || '',
      headCount: b.headCount ?? b.participants ?? 0,
      totalPrice: b.totalPrice,
      status: b.status?.toLowerCase() || 'pending',
    }))
  }, [bookings])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <Badge variant="default">확정</Badge>
      case 'cancelled':
        return <Badge variant="destructive">취소</Badge>
      default:
        return <Badge variant="outline">대기중</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showCart />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">예약 내역</h1>
          <p className="text-muted-foreground">고객님이 예약한 체험 프로그램 목록입니다.</p>
        </div>

        {!buyerId && (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">로그인이 필요합니다</h2>
            <p className="text-muted-foreground mb-4">예약 내역을 보시려면 로그인해주세요.</p>
            <Button asChild>
              <a href="/login">로그인하기</a>
            </Button>
          </Card>
        )}

        {buyerId && (
          <>
            {isLoading ? (
              <div className="text-center py-16 text-muted-foreground">
                예약 내역을 불러오는 중...
              </div>
            ) : displayBookings.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-lg font-semibold mb-2">예약 내역이 없습니다</h3>
                <p className="text-muted-foreground">새로운 체험을 예약해보세요.</p>
                <Button className="mt-4" asChild>
                  <a href="/experiences">체험 둘러보기</a>
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayBookings.map((booking) => (
                  <Card key={booking.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold">{booking.experienceTitle}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{booking.date || '날짜 미정'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{booking.time || '시간 미정'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{booking.headCount}명</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {booking.totalPrice?.toLocaleString() ?? 0}원
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
