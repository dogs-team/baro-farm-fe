'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Package,
  MapPin,
  Settings,
  LogOut,
  Edit,
  Phone,
  Mail,
  ShoppingBag,
  Star,
  DollarSign,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Store } from 'lucide-react'
import { setAccessToken } from '@/lib/api/client'
import { authService } from '@/lib/api/services/auth'
import { useCartStore } from '@/lib/cart-store'
import { useAddressStore } from '@/lib/address-store'
import { AddressDialog } from '@/components/address/address-dialog'
import { sellerService } from '@/lib/api/services/seller'
import { depositService } from '@/lib/api/services/payment'
import { orderService } from '@/lib/api/services/order'
import { reviewService } from '@/lib/api/services/review'
import type { MeResponse, OrderDetailInfo } from '@/lib/api/types'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const clearCart = useCartStore((state) => state.clearCart)
  const { addresses, addAddress, updateAddress, deleteAddress } = useAddressStore()
  // TODO: 기본 배송지 설정 기능 추가 예정
  // const { setDefaultAddress } = useAddressStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [isSellerDialogOpen, setIsSellerDialogOpen] = useState(false)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [isDepositChargeDialogOpen, setIsDepositChargeDialogOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [monthlySettlement, setMonthlySettlement] = useState<number | null>(null)
  const [isLoadingSettlement, setIsLoadingSettlement] = useState(false)
  const [depositBalance, setDepositBalance] = useState<number | null>(null)
  const [isLoadingDeposit, setIsLoadingDeposit] = useState(false)
  const [chargeAmount, setChargeAmount] = useState<string>('')
  const [isCharging, setIsCharging] = useState(false)
  const [sellerApplication, setSellerApplication] = useState({
    farmName: '',
    farmAddress: '',
    farmDescription: '',
    businessNumber: '',
  })

  // 실제 API에서 가져온 사용자 정보
  const [user, setUser] = useState<MeResponse & { name?: string; phone?: string; avatar?: string }>(
    {
      userId: '',
      email: '',
      role: 'BUYER',
    }
  )
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [mounted, setMounted] = useState(false)

  // 주문 내역 상태
  const [orders, setOrders] = useState<OrderDetailInfo[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [orderCount, setOrderCount] = useState(0)

  // 리뷰 개수 상태
  const [reviewCount, setReviewCount] = useState(0)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [tossWidget, setTossWidget] = useState<
    import('@/types/toss-payments').TossPaymentsInstance | null
  >(null)

  const handleSellerApplication = async () => {
    if (!sellerApplication.farmName || !sellerApplication.farmAddress) {
      toast({
        title: '필수 항목 입력',
        description: '농장명과 주소를 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    try {
      // grantSellerRole API 호출 (현재 사용자의 userId로 판매자 권한 부여)
      await authService.grantSellerRole(user.userId)

      toast({
        title: '판매자 전환 완료',
        description: '판매자 권한이 부여되었습니다. 페이지를 새로고침합니다.',
      })

      setIsSellerDialogOpen(false)
      setSellerApplication({
        farmName: '',
        farmAddress: '',
        farmDescription: '',
        businessNumber: '',
      })

      // 사용자 정보 다시 조회하여 역할 업데이트
      const updatedUser = await authService.getCurrentUser()
      setUser({
        ...updatedUser,
        name: updatedUser.email?.split('@')[0] || '사용자',
        phone: '',
        avatar: '/placeholder.svg',
      })

      // 페이지 새로고침
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: unknown) {
      console.error('판매자 전환 실패:', error)
      toast({
        title: '신청 실패',
        description:
          (error as { message?: string })?.message || '판매자 전환 신청 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleLogout = async () => {
    try {
      // API 로그아웃 시도 (실패해도 계속 진행)
      try {
        await authService.logout()
      } catch (error) {
        console.warn('로그아웃 API 호출 실패 (로컬 로그아웃 진행):', error)
      }

      // 로컬 스토리지 정리
      setAccessToken(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dummyUser')
        localStorage.removeItem('accessToken')
      }

      // 장바구니 비우기 (에러가 나도 계속 진행)
      try {
        clearCart()
      } catch (error) {
        console.warn('장바구니 비우기 실패 (계속 진행):', error)
      }

      // 이벤트 발생 (다른 컴포넌트에 알림)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authStateChanged'))
      }

      toast({
        title: '로그아웃되었습니다',
        description: '다음에 또 만나요!',
      })

      // 홈으로 리다이렉트
      router.push('/')
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error)
      toast({
        title: '로그아웃 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      })
    }
  }

  // 마운트 확인
  useEffect(() => {
    setMounted(true)
  }, [])

  // 사용자 정보 조회
  useEffect(() => {
    const fetchUser = async () => {
      if (!mounted) return

      setIsLoadingUser(true)
      try {
        const currentUser = await authService.getCurrentUser()
        console.log('현재 사용자 정보:', currentUser)
        setUser({
          ...currentUser,
          name: currentUser.email?.split('@')[0] || '사용자', // 이메일에서 이름 추출 (임시)
          phone: '', // TODO: 전화번호는 별도 API에서 가져와야 할 수 있음
          avatar: '/placeholder.svg',
        })
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error)
        toast({
          title: '사용자 정보 조회 실패',
          description: '다시 시도해주세요.',
          variant: 'destructive',
        })
        // 로그인되지 않은 경우 홈으로 리다이렉트
        router.push('/')
      } finally {
        setIsLoadingUser(false)
      }
    }

    fetchUser()
  }, [mounted, router, toast])

  // 주문 내역 조회
  useEffect(() => {
    const fetchOrders = async () => {
      if (!mounted || !user.userId) return

      setIsLoadingOrders(true)
      try {
        const response = await orderService.getOrders({ page: 0, size: 10 })
        setOrders(response.content || [])
        setOrderCount(response.totalElements || 0)
      } catch (error) {
        console.error('주문 내역 조회 실패:', error)
        setOrders([])
        setOrderCount(0)
      } finally {
        setIsLoadingOrders(false)
      }
    }

    fetchOrders()
  }, [mounted, user.userId])

  // 리뷰 개수 조회
  useEffect(() => {
    const fetchReviewCount = async () => {
      if (!mounted || !user.userId) return

      setIsLoadingReviews(true)
      try {
        const response = await reviewService.getMyReviews({ page: 0, size: 1 })
        setReviewCount(response.totalElements || 0)
      } catch (error) {
        console.error('리뷰 개수 조회 실패:', error)
        setReviewCount(0)
      } finally {
        setIsLoadingReviews(false)
      }
    }

    fetchReviewCount()
  }, [mounted, user.userId])

  // 이번달 정산금액 조회 (판매자만)
  useEffect(() => {
    const fetchMonthlySettlement = async () => {
      if (!mounted || user.role !== 'SELLER') return

      setIsLoadingSettlement(true)
      try {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1

        const response = await sellerService.getSettlements({
          page: 1,
          size: 100,
        })

        // 이번달 정산금액 계산 (COMPLETED 상태만)
        const currentMonthSettlements = response.content.filter((settlement) => {
          const settlementDate = new Date(settlement.period.start)
          return (
            settlementDate.getFullYear() === year &&
            settlementDate.getMonth() + 1 === month &&
            settlement.status === 'COMPLETED'
          )
        })

        const totalAmount = currentMonthSettlements.reduce(
          (sum, settlement) => sum + settlement.netAmount,
          0
        )

        setMonthlySettlement(totalAmount)
      } catch (error) {
        console.error('정산금액 조회 실패:', error)
        // API 실패 시에도 UI는 표시 (에러는 무시)
      } finally {
        setIsLoadingSettlement(false)
      }
    }

    fetchMonthlySettlement()
  }, [mounted, user.role])

  // 예치금 조회 함수 (재사용 가능하도록 분리)
  const fetchDepositBalance = async () => {
    setIsLoadingDeposit(true)
    try {
      const response = await depositService.getDeposit()
      setDepositBalance(response.balance)
    } catch (error: unknown) {
      // 404 에러인 경우 예치금 계정이 없는 것으로 처리 (정상)
      if ((error as { status?: number })?.status === 404) {
        console.log('예치금 계정 없음 (정상):', error?.message || '예치금 계정이 없습니다.')
        setDepositBalance(0)
      } else {
        // 다른 에러인 경우 상세 정보 로깅
        const err = error as {
          status?: number
          message?: string
          code?: string
          details?: string
        }
        console.error('예치금 조회 실패:', {
          status: err?.status,
          message: err?.message,
          code: err?.code,
          details: err?.details,
          error: error,
        })
        setDepositBalance(0)
      }
    } finally {
      setIsLoadingDeposit(false)
    }
  }

  // 예치금 조회 (구매자, 판매자 모두)
  useEffect(() => {
    if (mounted) {
      fetchDepositBalance()
    }
  }, [mounted])

  // 토스페이먼츠 위젯 로드 (예치금 충전용)
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return

    const loadTossWidget = () => {
      try {
        if (window.TossPayments) {
          const clientKey =
            process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
          if (!clientKey) {
            console.error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다.')
            return
          }
          const widget = window.TossPayments(clientKey)
          if (widget && typeof widget.requestPayment === 'function') {
            setTossWidget(widget)
            console.log('[Profile] 토스페이먼츠 위젯 초기화 완료')
          } else {
            console.error(
              '[Profile] 토스페이먼츠 위젯 초기화 실패: requestPayment 함수가 없습니다.'
            )
          }
        } else {
          const script = document.createElement('script')
          script.src = 'https://js.tosspayments.com/v1/payment'
          script.async = true
          script.onload = () => {
            setTimeout(() => {
              try {
                const clientKey =
                  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
                if (!clientKey) {
                  console.error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다.')
                  return
                }
                if (window.TossPayments) {
                  const widget = window.TossPayments(clientKey)
                  if (widget && typeof widget.requestPayment === 'function') {
                    setTossWidget(widget)
                    console.log('[Profile] 토스페이먼츠 위젯 초기화 완료')
                  } else {
                    console.error(
                      '[Profile] 토스페이먼츠 위젯 초기화 실패: requestPayment 함수가 없습니다.'
                    )
                  }
                } else {
                  console.error(
                    '[Profile] 토스페이먼츠 스크립트 로드 후 TossPayments 객체를 찾을 수 없습니다.'
                  )
                }
              } catch (error) {
                console.error('[Profile] 토스페이먼츠 위젯 초기화 중 오류:', error)
              }
            }, 100)
          }
          script.onerror = () => {
            console.error('[Profile] 토스페이먼츠 스크립트 로드 실패')
          }
          document.body.appendChild(script)
        }
      } catch (error) {
        console.error('[Profile] 토스페이먼츠 위젯 로드 중 오류:', error)
      }
    }

    loadTossWidget()
  }, [mounted])

  // 예치금 충전 처리
  const handleDepositCharge = async () => {
    const amount = parseInt(chargeAmount.replace(/,/g, ''), 10)

    if (!amount || amount < 1000) {
      toast({
        title: '충전 금액 오류',
        description: '최소 1,000원 이상 충전 가능합니다.',
        variant: 'destructive',
      })
      return
    }

    if (amount > 1000000) {
      toast({
        title: '충전 금액 오류',
        description: '최대 1,000,000원까지 충전 가능합니다.',
        variant: 'destructive',
      })
      return
    }

    setIsCharging(true)
    try {
      const response = await depositService.createCharge({ amount })
      const chargeId = response.chargeId
      const chargeAmount = response.amount

      if (!tossWidget || typeof tossWidget.requestPayment !== 'function') {
        toast({
          title: '결제 위젯 로딩 중',
          description: '결제 위젯을 불러오는 중입니다. 잠시 후 다시 시도해주세요.',
          variant: 'destructive',
        })
        return
      }

      const baseUrl = typeof window !== 'undefined' && window.location ? window.location.origin : ''
      const successUrl = `${baseUrl}/deposit/success`
      const failUrl = `${baseUrl}/deposit/fail`

      console.log('[Profile] 예치금 충전 요청:', {
        chargeId,
        amount: chargeAmount,
        successUrl,
        failUrl,
      })

      await tossWidget.requestPayment('간편결제', {
        orderId: chargeId,
        amount: chargeAmount,
        orderName: '예치금 충전',
        customerName: user.name || user.email || '고객',
        successUrl,
        failUrl,
      })

      // 결제 성공 시 successUrl로 이동하므로 여기서는 다이얼로그만 닫음
      setIsDepositChargeDialogOpen(false)
      setChargeAmount('')
    } catch (error: unknown) {
      console.error('예치금 충전 실패:', error)
      toast({
        title: '충전 실패',
        description:
          (error as { message?: string })?.message || '예치금 충전 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsCharging(false)
    }
  }

  const stats = [
    {
      label: '주문 내역',
      value: isLoadingOrders ? '조회 중...' : String(orderCount),
      icon: Package,
    },
    // TODO: 찜하기 기능 추가 예정
    // { label: '찜한 상품', value: '8', icon: Heart },
    {
      label: '작성한 리뷰',
      value: isLoadingReviews ? '조회 중...' : String(reviewCount),
      icon: Star,
    },
  ]

  // 예치금 카드 추가 (구매자, 판매자 모두)
  const depositStat = {
    label: '예치금',
    value: isLoadingDeposit
      ? '조회 중...'
      : typeof depositBalance === 'number'
        ? `${depositBalance.toLocaleString()}원`
        : '0원',
    icon: Wallet,
  }

  // 판매자일 경우 정산금액 카드 추가
  const sellerStats =
    user.role === 'SELLER'
      ? [
          {
            label: '이번 달 정산금액',
            value: isLoadingSettlement
              ? '조회 중...'
              : monthlySettlement !== null
                ? `${monthlySettlement.toLocaleString()}원`
                : '0원',
            icon: DollarSign,
          },
        ]
      : []

  // 주문 데이터를 표시 형식으로 변환
  const recentOrders = orders.map((order) => {
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : ''

    // 주문 상태를 한글로 변환
    const statusMap: Record<string, string> = {
      PENDING: '배송 준비',
      PAID: '배송 중',
      CANCELED: '취소됨',
    }
    const status = statusMap[order.status] || order.status

    // 주문 항목 이름 추출 (items가 있으면 사용, 없으면 빈 배열)
    const items = order.items?.map((item) => item.productName || '상품') || []

    return {
      id: order.orderId,
      date: orderDate,
      status,
      items,
      total: order.totalAmount || 0,
    }
  })

  // TODO: 찜하기 기능 추가 예정
  // const favoriteProducts = [
  //   {
  //     id: 1,
  //     name: '유기농 방울토마토',
  //     price: 8500,
  //     image: '/fresh-organic-cherry-tomatoes.jpg',
  //     rating: 4.8,
  //   },
  //   {
  //     id: 2,
  //     name: '무농약 상추',
  //     price: 5000,
  //     image: '/fresh-organic-lettuce.png',
  //     rating: 4.9,
  //   },
  // ]

  const handleSaveAddress = (addressData: Omit<import('@/lib/api/types').Address, 'id'>) => {
    if (editingAddressId) {
      updateAddress(editingAddressId, addressData)
      toast({
        title: '배송지가 수정되었습니다',
      })
    } else {
      addAddress(addressData)
      toast({
        title: '배송지가 추가되었습니다',
      })
    }
    setEditingAddressId(null)
    setIsAddressDialogOpen(false)
  }

  const handleEditAddress = (id: number) => {
    setEditingAddressId(id)
    setIsAddressDialogOpen(true)
  }

  const handleDeleteAddress = (id: number) => {
    deleteAddress(id)
    toast({
      title: '배송지가 삭제되었습니다',
    })
  }

  // TODO: 기본 배송지 설정 기능 추가 예정
  // const handleSetDefaultAddress = (id: number) => {
  //   setDefaultAddress(id)
  //   toast({
  //     title: '기본 배송지로 설정되었습니다',
  //   })
  // }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '배송 완료':
        return <Badge variant="secondary">배송 완료</Badge>
      case '배송 중':
        return <Badge variant="default">배송 중</Badge>
      case '배송 준비':
        return <Badge variant="outline">배송 준비</Badge>
      case '취소됨':
        return <Badge variant="destructive">취소됨</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // 로딩 중이거나 사용자 정보가 없으면 로딩 표시
  if (!mounted || isLoadingUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">로딩 중...</div>
              <div className="text-sm text-muted-foreground">사용자 정보를 불러오는 중입니다.</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
          <p className="text-muted-foreground">내 정보와 주문 내역을 관리하세요</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="orders">주문 내역</TabsTrigger>
            {/* TODO: 찜하기 기능 추가 예정 */}
            {/* <TabsTrigger value="favorites">찜한 상품</TabsTrigger> */}
            <TabsTrigger value="role">역할 관리</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Profile Card */}
            <Card className="p-6">
              <div className="flex items-start gap-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={user.avatar || '/placeholder.svg'}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{user.name || user.email}</h2>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {user.role === 'SELLER' ? '판매자' : '구매자'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div
              className={`grid gap-6 ${user.role === 'SELLER' ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}
            >
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Card>
                )
              })}
              {/* 예치금 카드 (구매자, 판매자 모두) */}
              <Card key={depositStat.label} className="p-6 border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <depositStat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1 text-primary">{depositStat.value}</div>
                <div className="text-sm text-muted-foreground mb-3">{depositStat.label}</div>
                <Dialog
                  open={isDepositChargeDialogOpen}
                  onOpenChange={setIsDepositChargeDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Wallet className="h-4 w-4 mr-2" />
                      예치금 충전
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>예치금 충전</DialogTitle>
                      <DialogDescription>
                        충전할 금액을 입력해주세요. (최소 1,000원)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="chargeAmount">충전 금액</Label>
                        <Input
                          id="chargeAmount"
                          type="text"
                          placeholder="10,000"
                          value={chargeAmount}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '')
                            if (value) {
                              setChargeAmount(parseInt(value, 10).toLocaleString())
                            } else {
                              setChargeAmount('')
                            }
                          }}
                          disabled={isCharging}
                        />
                        <div className="flex gap-2">
                          {[10000, 50000, 100000, 500000].map((amount) => (
                            <Button
                              key={amount}
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => setChargeAmount(amount.toLocaleString())}
                              disabled={isCharging}
                            >
                              {amount.toLocaleString()}원
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          현재 잔액:{' '}
                          {typeof depositBalance === 'number' ? depositBalance.toLocaleString() : 0}
                          원
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDepositChargeDialogOpen(false)
                          setChargeAmount('')
                        }}
                        disabled={isCharging}
                      >
                        취소
                      </Button>
                      <Button onClick={handleDepositCharge} disabled={isCharging || !chargeAmount}>
                        {isCharging ? '충전 중...' : '충전하기'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Card>
              {/* 판매자 정산금액 카드 */}
              {sellerStats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className="p-6 border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-1 text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Card>
                )
              })}
            </div>

            {/* Recent Orders */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">최근 주문</h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                  전체보기
                </Button>
              </div>
              <div className="space-y-4">
                {isLoadingOrders ? (
                  <div className="text-center py-8 text-muted-foreground">
                    주문 내역을 불러오는 중...
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    주문 내역이 없습니다.
                  </div>
                ) : (
                  recentOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/order/${order.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold">{order.id}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.length > 0 ? order.items.join(', ') : '상품 정보 없음'}
                        </div>
                        <div className="text-sm text-muted-foreground">{order.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{order.total.toLocaleString()}원</div>
                        <Button variant="ghost" size="sm" className="mt-2">
                          상세보기
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">주문 내역</h2>
              {isLoadingOrders ? (
                <div className="text-center py-8 text-muted-foreground">
                  주문 내역을 불러오는 중...
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">주문 내역이 없습니다.</div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/order/${order.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold">주문번호: {order.id}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {order.items.length > 0 ? order.items.join(', ') : '상품 정보 없음'}
                        </div>
                        <div className="text-sm text-muted-foreground">{order.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg mb-2">
                          {order.total.toLocaleString()}원
                        </div>
                        <Button variant="outline" size="sm">
                          상세보기
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Role Management Tab */}
          <TabsContent value="role" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">역할 관리</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">구매자</h3>
                      {(user.role === 'USER' || user.role === 'BUYER') && (
                        <Badge variant="default">현재 역할</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      농산물을 구매하고 농장 체험을 예약할 수 있습니다.
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 상품 구매 및 주문 관리</li>
                      <li>• 체험 예약</li>
                      <li>• 리뷰 작성</li>
                      <li>• 장바구니</li>
                      {/* TODO: 찜하기 기능 추가 예정 */}
                      {/* <li>• 찜하기</li> */}
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Store className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">판매자 (농가)</h3>
                      {user.role === 'SELLER' && <Badge variant="default">현재 역할</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      농산물을 판매하고 농장 체험 프로그램을 운영할 수 있습니다.
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                      <li>• 상품 등록 및 판매</li>
                      <li>• 체험 프로그램 등록</li>
                      <li>• 주문 및 예약 관리</li>
                      <li>• 농장 정보 관리</li>
                      <li>• 매출 및 정산 관리</li>
                    </ul>
                    {/* role이 USER 인 경우에만 판매자 전환 버튼 표시 */}
                    {user.role === 'USER' && user.userId && (
                      <Dialog open={isSellerDialogOpen} onOpenChange={setIsSellerDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="mt-2">
                            <Store className="h-4 w-4 mr-2" />
                            판매자로 전환
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>판매자 전환 신청</DialogTitle>
                            <DialogDescription>
                              농장 정보를 입력하고 판매자 계정으로 전환하세요
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="farmName">농장명 *</Label>
                              <Input
                                id="farmName"
                                placeholder="햇살농장"
                                value={sellerApplication.farmName}
                                onChange={(e) =>
                                  setSellerApplication({
                                    ...sellerApplication,
                                    farmName: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="farmAddress">농장 주소 *</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="farmAddress"
                                  placeholder="경기도 양평군 양평읍 농장길 123"
                                  value={sellerApplication.farmAddress}
                                  onChange={(e) =>
                                    setSellerApplication({
                                      ...sellerApplication,
                                      farmAddress: e.target.value,
                                    })
                                  }
                                  required
                                />
                                <Button variant="outline" type="button">
                                  주소 검색
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="farmDescription">농장 소개</Label>
                              <Textarea
                                id="farmDescription"
                                placeholder="농장에 대한 간단한 소개를 작성해주세요"
                                value={sellerApplication.farmDescription}
                                onChange={(e) =>
                                  setSellerApplication({
                                    ...sellerApplication,
                                    farmDescription: e.target.value,
                                  })
                                }
                                rows={4}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="businessNumber">사업자 등록번호 (선택)</Label>
                              <Input
                                id="businessNumber"
                                placeholder="123-45-67890"
                                value={sellerApplication.businessNumber}
                                onChange={(e) =>
                                  setSellerApplication({
                                    ...sellerApplication,
                                    businessNumber: e.target.value,
                                  })
                                }
                              />
                              <p className="text-sm text-muted-foreground">
                                사업자 등록번호가 있으면 입력해주세요. 없어도 신청 가능합니다.
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsSellerDialogOpen(false)}>
                              취소
                            </Button>
                            <Button onClick={handleSellerApplication}>신청하기</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    {user.role === 'SELLER' && (
                      <div className="flex flex-wrap gap-2">
                        <Button asChild>
                          <Link href="/farmer/dashboard">판매자 대시보드로 이동</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/farmer/farm">내 농장 관리</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/farmer/experiences">체험 프로그램 관리</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">안내사항</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 판매자 전환 신청 후 검토가 진행됩니다.</li>
                    <li>• 승인까지 1-3 영업일이 소요될 수 있습니다.</li>
                    <li>• 판매자로 전환하더라도 구매자 기능은 계속 사용할 수 있습니다.</li>
                    <li>• 판매자 계정은 농장 정보 검증 후 활성화됩니다.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TODO: 찜하기 기능 추가 예정 */}
          {/* Favorites Tab */}
          {/* <TabsContent value="favorites" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">찜한 상품</h2>
              {favoriteProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">찜한 상품이 없습니다</p>
                  <Button asChild>
                    <Link href="/products">상품 둘러보기</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {favoriteProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden group hover:shadow-lg transition-shadow"
                    >
                      <Link href={`/products/${product.id}`}>
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          <Image
                            src={product.image || '/placeholder.svg'}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">{product.name}</h3>
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="text-sm font-medium">{product.rating}</span>
                          </div>
                          <div className="text-lg font-bold">
                            {product.price.toLocaleString()}원
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent> */}

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Profile Settings */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">프로필 정보</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    defaultValue={user.name || user.email?.split('@')[0] || ''}
                    className="mt-1"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    이름은 이메일에서 자동으로 추출됩니다.
                  </p>
                </div>
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user.email}
                    className="mt-1"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">이메일은 변경할 수 없습니다.</p>
                </div>
                {user.phone && (
                  <div>
                    <Label htmlFor="phone">전화번호</Label>
                    <Input id="phone" defaultValue={user.phone} className="mt-1" disabled />
                  </div>
                )}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    프로필 정보 수정 기능은 추후 추가 예정입니다.
                  </p>
                </div>
              </div>
            </Card>

            {/* Delivery Addresses */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">배송지 관리</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAddressId(addresses.length > 0 ? addresses[0].id : null)
                    setIsAddressDialogOpen(true)
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {addresses.length > 0 ? '배송지 수정' : '배송지 등록'}
                </Button>
              </div>
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    등록된 배송지가 없습니다
                    <br />
                    <span className="text-xs">
                      배송지는 1개만 등록 가능하며 기본 배송지로 설정됩니다.
                    </span>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 border rounded-lg flex items-start justify-between hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{address.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            기본 배송지
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>{address.phone}</div>
                          <div>
                            [{address.zipCode}] {address.address} {address.detailAddress}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAddress(address.id)}
                        >
                          수정
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Payment Methods - 숨김 처리 */}
            {/* <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">결제 수단</h2>
                <Button variant="outline" size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  결제 수단 추가
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                등록된 결제 수단이 없습니다
              </div>
            </Card> */}

            {/* Account Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">계정 관리</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  비밀번호 변경
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 배송지 추가/수정 다이얼로그 */}
        <AddressDialog
          open={isAddressDialogOpen}
          onOpenChange={setIsAddressDialogOpen}
          address={
            editingAddressId ? addresses.find((addr) => addr.id === editingAddressId) || null : null
          }
          onSave={handleSaveAddress}
        />
      </div>
    </div>
  )
}
