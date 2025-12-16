'use client'

import { useRouter } from 'next/navigation'
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
import { useToast } from '@/hooks/use-toast'
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
import { useCartStore } from '@/lib/cart-store'
import { setAccessToken } from '@/lib/api/client'
import { authService } from '@/lib/api/services/auth'
import type { ProfileState, ProfileActions, RecentOrder, ProfileStats } from '../types'

interface ProfileOverviewProps {
  state: ProfileState
  actions: ProfileActions
}

export function ProfileOverview({ state, actions }: ProfileOverviewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const clearCart = useCartStore((state) => state.clearCart)

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

  const stats: ProfileStats[] = [
    {
      label: '주문 내역',
      value: state.isLoadingOrders ? '조회 중...' : String(state.orderCount),
      icon: Package,
    },
    // TODO: 찜하기 기능 추가 예정
    // { label: '찜한 상품', value: '8', icon: Heart },
    {
      label: '작성한 리뷰',
      value: state.isLoadingReviews ? '조회 중...' : String(state.reviewCount),
      icon: Star,
    },
  ]

  // 예치금 카드 추가 (구매자, 판매자 모두)
  const depositStat: ProfileStats = {
    label: '예치금',
    value: state.isLoadingDeposit
      ? '조회 중...'
      : typeof state.depositBalance === 'number'
        ? `${state.depositBalance.toLocaleString()}원`
        : '0원',
    icon: Wallet,
  }

  // 판매자일 경우 정산금액 카드 추가
  const sellerStats: ProfileStats[] =
    state.user.role === 'SELLER'
      ? [
          {
            label: '이번 달 정산금액',
            value: state.isLoadingSettlement
              ? '조회 중...'
              : state.monthlySettlement !== null
                ? `${state.monthlySettlement.toLocaleString()}원`
                : '0원',
            icon: DollarSign,
          },
        ]
      : []

  // 주문 데이터를 표시 형식으로 변환
  const recentOrders: RecentOrder[] = state.orders.map((order) => {
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

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted">
            <Image
              src={state.user.avatar || '/placeholder.svg'}
              alt={state.user.name || state.user.email || '사용자 프로필'}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{state.user.name || state.user.email}</h2>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{state.user.email}</span>
                  </div>
                  {state.user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{state.user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {state.user.role === 'SELLER' ? '판매자' : '구매자'}
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
        className={`grid gap-6 ${state.user.role === 'SELLER' ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}
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
            open={state.isDepositChargeDialogOpen}
            onOpenChange={actions.setIsDepositChargeDialogOpen}
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
                    value={state.chargeAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      if (value) {
                        actions.setChargeAmount(parseInt(value, 10).toLocaleString())
                      } else {
                        actions.setChargeAmount('')
                      }
                    }}
                    disabled={state.isCharging}
                  />
                  <div className="flex gap-2">
                    {[10000, 50000, 100000, 500000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => actions.setChargeAmount(amount.toLocaleString())}
                        disabled={state.isCharging}
                      >
                        {amount.toLocaleString()}원
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    현재 잔액:{' '}
                    {typeof state.depositBalance === 'number' ? state.depositBalance.toLocaleString() : 0}
                    원
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    actions.setIsDepositChargeDialogOpen(false)
                    actions.setChargeAmount('')
                  }}
                  disabled={state.isCharging}
                >
                  취소
                </Button>
                <Button onClick={actions.handleDepositChargeClick} disabled={state.isCharging || !state.chargeAmount}>
                  {state.isCharging ? '충전 중...' : '충전하기'}
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
          <Button variant="ghost" size="sm" onClick={() => actions.setActiveTab('orders')}>
            전체보기
          </Button>
        </div>
        <div className="space-y-4">
          {state.isLoadingOrders ? (
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
    </div>
  )
}