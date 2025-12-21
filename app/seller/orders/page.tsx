'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SellerOrder {
  id: string
  productName: string
  customerName: string
  quantity: number
  amount: number
  status: string
  orderDate: string
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        // TODO: 판매자 주문 목록 API 호출
        // const response = await sellerService.getSellerOrders({ status: statusFilter })
        // setOrders(response.content || [])

        // 임시 데이터
        await new Promise((resolve) => setTimeout(resolve, 500))
        setOrders([])
      } catch (error) {
        console.error('주문 목록 조회 실패:', error)
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline">배송 준비</Badge>
      case 'PAID':
        return <Badge variant="default">배송 중</Badge>
      case 'DELIVERED':
        return <Badge variant="secondary">배송 완료</Badge>
      case 'CANCELED':
        return <Badge variant="destructive">취소됨</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">마이페이지로</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">판매 주문 관리</h1>
          <p className="text-muted-foreground">판매하신 주문 내역을 관리하실 수 있습니다</p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="PENDING">배송 준비</SelectItem>
              <SelectItem value="PAID">배송 중</SelectItem>
              <SelectItem value="DELIVERED">배송 완료</SelectItem>
              <SelectItem value="CANCELED">취소됨</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">주문 내역을 불러오는 중...</div>
          </div>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">주문 내역이 없습니다</h3>
            <p className="text-muted-foreground mb-6">아직 판매된 주문이 없습니다.</p>
            <Button asChild>
              <Link href="/farmer/products">상품 관리하기</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">주문번호: {order.id}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      상품: {order.productName} x {order.quantity}
                    </p>
                    <p className="text-sm text-muted-foreground">주문일: {order.orderDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{order.amount.toLocaleString()}원</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
