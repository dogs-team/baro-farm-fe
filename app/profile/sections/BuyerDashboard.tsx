'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Star, Wallet, Heart, Truck, Home, X, CreditCard } from 'lucide-react'
import { ProfileInfoSection } from './ProfileInfoSection'
import { DepositChargeDialog } from '../dialogs/DepositChargeDialog'
import type { ProfileState, ProfileActions, RecentOrder } from '../types'

interface BuyerDashboardProps {
  state: ProfileState
  actions: ProfileActions
}

export function BuyerDashboard({ state, actions }: BuyerDashboardProps) {
  const router = useRouter()

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
      PENDING: '주문 대기',
      PAID: '결제 완료',
      PREPARING: '배송 준비',
      SHIPPED: '배송 중',
      COMPLETED: '배송 완료',
      CANCELED: '주문 취소',
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
      case '주문 대기':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Package className="h-3 w-3 mr-1" />
            주문 대기
          </Badge>
        )
      case '결제 완료':
        return (
          <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200">
            <CreditCard className="h-3 w-3 mr-1" />
            결제 완료
          </Badge>
        )
      case '배송 준비':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Package className="h-3 w-3 mr-1" />
            배송 준비
          </Badge>
        )
      case '배송 중':
        return (
          <Badge variant="default" className="bg-blue-600">
            <Truck className="h-3 w-3 mr-1" />
            배송 중
          </Badge>
        )
      case '배송 완료':
        return (
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            <Home className="h-3 w-3 mr-1" />
            배송 완료
          </Badge>
        )
      case '주문 취소':
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            주문 취소
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Main Layout: Profile + Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Header - Left Side */}
        <ProfileInfoSection user={state.user} />

        {/* Middle Column: 주문 내역, 작성한 리뷰 */}
        <div className="space-y-4">
          {/* 주문 내역 */}
          <Card
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => router.push('/orders')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">주문 내역</div>
                <div className="text-2xl font-bold">
                  {state.isLoadingOrders ? '...' : state.orderCount}
                </div>
              </div>
            </div>
          </Card>

          {/* 작성한 리뷰 */}
          <Card
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => router.push('/reviews')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">작성한 리뷰</div>
                <div className="text-2xl font-bold">
                  {state.isLoadingReviews ? '...' : state.reviewCount}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: 찜한 상품, 나의 예치금 */}
        <div className="space-y-4">
          {/* 찜한 상품 */}
          <Card
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => router.push('/wishlist')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Heart className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">찜한 상품</div>
                <div className="text-2xl font-bold">8</div>
              </div>
            </div>
          </Card>

          {/* 나의 예치금 */}
          <Card className="p-4 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">나의 예치금</div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">
                    {state.isLoadingDeposit
                      ? '...'
                      : typeof state.depositBalance === 'number'
                        ? `${state.depositBalance.toLocaleString()}원`
                        : '0원'}
                  </div>
                  <DepositChargeDialog
                    open={state.isDepositChargeDialogOpen}
                    onOpenChange={actions.setIsDepositChargeDialogOpen}
                    chargeAmount={state.chargeAmount}
                    onChargeAmountChange={actions.setChargeAmount}
                    depositBalance={state.depositBalance}
                    isCharging={state.isCharging}
                    onCharge={actions.handleDepositChargeClick}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Orders */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">최근 주문</h2>
        </div>
        <div className="space-y-3">
          {state.isLoadingOrders ? (
            <div className="text-center py-6 text-muted-foreground">주문 내역을 불러오는 중...</div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">주문 내역이 없습니다.</div>
          ) : (
            recentOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/order/${order.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{order.id}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {order.items.length > 0 ? order.items.join(', ') : '상품 정보 없음'}
                  </div>
                  <div className="text-xs text-muted-foreground">{order.date}</div>
                </div>
                <div className="text-right ml-2">
                  <div className="font-semibold text-sm">{order.total.toLocaleString()}원</div>
                  <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs cursor-pointer">
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
