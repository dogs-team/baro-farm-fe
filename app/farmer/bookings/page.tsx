'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Sprout,
  Calendar,
  Users,
  Phone,
  Mail,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Settings,
  LogOut,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useSearchParams, useRouter } from 'next/navigation'
import { reservationService, experienceService, farmService } from '@/lib/api/services'
import type {
  BookingStatus,
  ExperienceBooking,
  PaginationParams,
  Experience,
} from '@/lib/api/types'
import { FarmerNav } from '../components/farmer-nav'

interface BookingItem {
  id: string
  experienceTitle: string
  date: string
  time: string
  participants: number
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  status: BookingStatus | string // ReservationStatus를 소문자로 변환한 값도 허용
  totalPrice: number
  createdAt?: string
  notes?: string
}

export default function FarmerBookingsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlExperienceId = searchParams.get('experienceId')
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [selectedFarmId, setSelectedFarmId] = useState<string | undefined>(undefined)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | undefined>(
    urlExperienceId || undefined
  )
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(false)
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)

  // 농장 목록 조회
  useEffect(() => {
    const fetchMyFarms = async () => {
      if (!mounted) return
      try {
        const response = await farmService.getMyFarms({ page: 0, size: 20 })
        const content = Array.isArray(response?.content) ? response.content : []

        if (content.length > 0) {
          const firstFarm = content[0]
          setSelectedFarmId(firstFarm.id)
        }
      } catch (error: unknown) {
        console.error('농장 목록 조회 실패:', error)
        const errorMessage =
          error instanceof Error ? error.message : '농장 정보를 불러오는 중 오류가 발생했습니다.'
        toast({
          title: '농장 목록 조회 실패',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    }
    fetchMyFarms()
  }, [mounted, toast])

  // 체험 목록 조회
  useEffect(() => {
    const fetchExperiences = async () => {
      if (!mounted || !selectedFarmId) return

      setIsLoadingExperiences(true)
      try {
        const response = await experienceService.getExperiences({
          farmId: selectedFarmId,
          page: 0,
          size: 100,
        })
        const content = Array.isArray(response?.content) ? response.content : []
        setExperiences(content)

        // URL에 experienceId가 있으면 해당 체험 선택, 없으면 첫 번째 체험 선택
        // API 응답에는 experienceId 필드가 있지만 타입에는 id 필드만 있음
        if (
          urlExperienceId &&
          content.some(
            (exp) => (exp as any).experienceId === urlExperienceId || exp.id === urlExperienceId
          )
        ) {
          setSelectedExperienceId(urlExperienceId)
        } else if (content.length > 0 && !selectedExperienceId) {
          const firstExp = content[0]
          setSelectedExperienceId((firstExp as any).experienceId || firstExp.id)
        }
      } catch (error: unknown) {
        console.error('체험 목록 조회 실패:', error)
        const errorMessage =
          error instanceof Error ? error.message : '체험 정보를 불러오는 중 오류가 발생했습니다.'
        toast({
          title: '체험 목록 조회 실패',
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setIsLoadingExperiences(false)
      }
    }
    fetchExperiences()
  }, [mounted, selectedFarmId, urlExperienceId, toast])

  // 체험 선택 변경 시 URL 업데이트
  const handleExperienceChange = (experienceId: string) => {
    setSelectedExperienceId(experienceId)
    router.push(`/farmer/bookings?experienceId=${experienceId}`)
  }

  // 예약 목록 조회
  const fetchBookings = async (params: PaginationParams & { experienceId?: string | null }) => {
    if (!params.experienceId) {
      setBookings([])
      return
    }

    setIsLoadingBookings(true)
    try {
      const response = await reservationService.getReservations(params)
      const content = Array.isArray(response?.content) ? response.content : []
      const mapped: BookingItem[] = content.map((booking: ExperienceBooking) => ({
        id: booking.id,
        experienceTitle: booking.experienceTitle || '체험 프로그램',
        date: booking.date || booking.reservedDate || '',
        time: booking.reservedTimeSlot || '',
        participants: booking.participants ?? booking.headCount ?? 0,
        status: (booking.status || 'PENDING').toLowerCase() as BookingStatus,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt,
      }))
      setBookings(mapped)
    } catch (error) {
      console.error('예약 목록 조회 실패:', error)
      toast({
        title: '예약 목록 조회 실패',
        description: '예약 정보를 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingBookings(false)
    }
  }

  useEffect(() => {
    if (!mounted || !selectedExperienceId) return

    fetchBookings({
      page: 0,
      size: 100,
      experienceId: selectedExperienceId,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, selectedExperienceId])

  // 마운트 확인
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConfirmBooking = (id: string) => {
    toast({
      title: '예약 확정 완료',
      description: '예약이 확정되었습니다.',
    })
  }

  const handleCancelBooking = (id: string) => {
    toast({
      title: '예약 취소 완료',
      description: '예약이 취소되었습니다.',
    })
  }

  const handleCompleteBooking = (id: string) => {
    toast({
      title: '체험 완료 처리',
      description: '체험이 완료 처리되었습니다.',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default">확정</Badge>
      case 'pending':
        return <Badge variant="outline">대기중</Badge>
      case 'completed':
        return <Badge variant="secondary">완료</Badge>
      case 'cancelled':
        return <Badge variant="destructive">취소</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.experienceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // ReservationStatus는 대문자이지만, toLowerCase()로 소문자로 변환했으므로 소문자로 비교
  const upcomingBookings = filteredBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  )
  const completedBookings = filteredBookings.filter((b) => b.status === 'completed')
  const cancelledBookings = filteredBookings.filter((b) => b.status === 'cancelled')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">바로팜</span>
            </Link>
            <Badge variant="secondary">농가</Badge>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">고객 페이지</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>햇</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>햇살농장</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/farmer/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    설정
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <FarmerNav />
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">예약 관리</h1>
          <p className="text-muted-foreground">체험 예약을 관리하세요</p>
        </div>

        {/* Experience Selection */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-semibold whitespace-nowrap">체험 선택:</Label>
              <Select
                value={selectedExperienceId || ''}
                onValueChange={handleExperienceChange}
                disabled={isLoadingExperiences || experiences.length === 0}
              >
                <SelectTrigger className="w-full sm:w-80">
                  <SelectValue
                    placeholder={
                      isLoadingExperiences ? '체험 목록 로딩 중...' : '체험을 선택하세요'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {experiences.map((exp) => {
                    const expId = (exp as any).experienceId || exp.id
                    return (
                      <SelectItem key={expId} value={expId}>
                        {exp.title} {exp.status === 'CLOSED' && '(종료)'}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            {experiences.length === 0 && !isLoadingExperiences && selectedFarmId && (
              <p className="text-sm text-muted-foreground">
                등록된 체험이 없습니다. 체험을 먼저 등록해주세요.
              </p>
            )}
          </div>
        </Card>

        {/* Search and Filter */}
        {selectedExperienceId && (
          <Card className="p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="예약번호, 고객명, 체험명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="confirmed">확정</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="cancelled">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        )}

        {/* Tabs */}
        {selectedExperienceId ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="upcoming">예정된 예약 ({upcomingBookings.length})</TabsTrigger>
              <TabsTrigger value="completed">완료된 예약 ({completedBookings.length})</TabsTrigger>
              <TabsTrigger value="cancelled">취소된 예약 ({cancelledBookings.length})</TabsTrigger>
            </TabsList>

            {/* Upcoming Bookings */}
            <TabsContent value="upcoming">
              <div className="space-y-4">
                {upcomingBookings.map((booking, index) => (
                  <Card key={`upcoming-${booking.id || index}`} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{booking.experienceTitle}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {booking.date} {booking.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{booking.participants}명</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>
                              {booking.customerName} ({booking.customerPhone})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{booking.customerEmail}</span>
                          </div>
                        </div>
                        {booking.notes && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm">
                              <span className="font-semibold">메모: </span>
                              {booking.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-muted-foreground mb-1">예약번호</div>
                        <div className="font-semibold mb-2">{booking.id}</div>
                        <div className="text-lg font-bold text-primary">
                          {booking.totalPrice.toLocaleString()}원
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking)
                          setIsDetailDialogOpen(true)
                        }}
                      >
                        상세보기
                      </Button>
                      {(booking.status === 'pending' || booking.status === 'PENDING') && (
                        <>
                          <Button size="sm" onClick={() => handleConfirmBooking(booking.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            확정
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            취소
                          </Button>
                        </>
                      )}
                      {(booking.status === 'confirmed' || booking.status === 'CONFIRMED') && (
                        <Button size="sm" onClick={() => handleCompleteBooking(booking.id)}>
                          완료 처리
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
                {upcomingBookings.length === 0 && (
                  <Card className="p-12">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">예정된 예약이 없습니다</h3>
                      <p className="text-muted-foreground">
                        새로운 예약이 들어오면 여기에 표시됩니다
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Completed Bookings */}
            <TabsContent value="completed">
              <div className="space-y-4">
                {completedBookings.map((booking, index) => (
                  <Card key={`completed-${booking.id || index}`} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{booking.experienceTitle}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {booking.date} {booking.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{booking.participants}명</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{booking.customerName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-muted-foreground mb-1">예약번호</div>
                        <div className="font-semibold mb-2">{booking.id}</div>
                        <div className="text-lg font-bold">
                          {booking.totalPrice.toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Cancelled Bookings */}
            <TabsContent value="cancelled">
              <div className="space-y-4">
                {cancelledBookings.map((booking, index) => (
                  <Card key={`cancelled-${booking.id || index}`} className="p-6 opacity-60">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{booking.experienceTitle}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {booking.date} {booking.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{booking.participants}명</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{booking.customerName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-muted-foreground mb-1">예약번호</div>
                        <div className="font-semibold">{booking.id}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">체험을 선택해주세요</h3>
              <p className="text-muted-foreground">
                위에서 체험을 선택하면 해당 체험의 예약 목록을 확인할 수 있습니다
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>예약 상세 정보</DialogTitle>
            <DialogDescription>예약 번호: {selectedBooking?.id}</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">체험명</div>
                  <div className="font-semibold">{selectedBooking.experienceTitle}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">상태</div>
                  <div>{getStatusBadge(selectedBooking.status)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">날짜</div>
                  <div className="font-semibold">{selectedBooking.date}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">시간</div>
                  <div className="font-semibold">{selectedBooking.time}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">참가 인원</div>
                  <div className="font-semibold">{selectedBooking.participants}명</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">총 금액</div>
                  <div className="font-semibold text-primary">
                    {selectedBooking.totalPrice.toLocaleString()}원
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">고객 정보</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedBooking.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedBooking.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedBooking.customerEmail}</span>
                  </div>
                </div>
              </div>
              {selectedBooking.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">고객 메모</h4>
                  <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
