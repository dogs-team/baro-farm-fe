'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Order {
  id: string
  date: string
  status: string
  items: string[]
  total: number
}

interface ProfileOrdersProps {
  orders: Order[]
}

export function ProfileOrders({ orders }: ProfileOrdersProps) {
  const router = useRouter()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '배송 완료':
        return <Badge variant="secondary">배송 완료</Badge>
      case '배송 중':
        return <Badge variant="default">배송 중</Badge>
      case '배송 준비':
        return <Badge variant="outline">배송 준비</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">주문 내역</h2>
        </div>
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>주문 내역이 없습니다.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer group"
                onClick={() => router.push(`/order/${order.id}`)}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      주문번호: {order.id}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-normal group-hover:text-gray-900 transition-colors">
                    {order.items.join(', ')}
                  </div>
                  <div className="text-xs text-gray-500">{order.date}</div>
                </div>
                <div className="flex flex-col md:items-end gap-2">
                  <div className="font-bold text-base text-gray-900 dark:text-white">
                    {order.total.toLocaleString()}원
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
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
