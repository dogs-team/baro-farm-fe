'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProfileState, RecentOrder } from '../types'

interface ProfileOrdersProps {
  state: ProfileState
}

export function ProfileOrders({ state }: ProfileOrdersProps) {
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
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">주문 내역</h2>
        {state.isLoadingOrders ? (
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
    </div>
  )
}