'use client'

import { useState, useEffect, use } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Package,
  Truck,
  X,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  FileText,
  Printer,
  Home,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { useToast } from '@/hooks/use-toast'
import { orderService } from '@/lib/api/services/order'
import type { OrderDetailInfo, OrderStatus } from '@/lib/api/types'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [order, setOrder] = useState<OrderDetailInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // params Promise unwrap
  const { id } = use(params)

  // 주문 상세 조회
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return

      setIsLoading(true)
      setError(null)
      try {
        const orderData = await orderService.getOrder(id)
        setOrder(orderData)
      } catch (err) {
        console.error('주문 상세 조회 실패:', err)
        setError('주문 정보를 불러오는데 실패했습니다.')
        toast({
          title: '주문 조회 실패',
          description: '주문 정보를 불러올 수 없습니다.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [id, toast])

  // 주문 상태를 한글로 변환
  const getStatusText = (status: OrderStatus | string): string => {
    switch (status) {
      case 'PENDING':
        return '주문 대기'
      case 'PAID':
        return '결제 완료'
      case 'PREPARING':
        return '배송 준비'
      case 'SHIPPED':
        return '배송 중'
      case 'COMPLETED':
        return '배송 완료'
      case 'CANCELED':
        return '주문 취소'
      default:
        return status
    }
  }

  // 날짜 포맷팅
  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 배송 현황 생성 (주문 상태에 따라)
  const getDeliveryHistory = () => {
    if (!order) return []
    const history = []

    if (order.createdAt) {
      history.push({
        status: '주문 접수',
        date: formatDateTime(order.createdAt),
        location: order.address || '',
      })
    }

    if (order.status === 'PAID') {
      history.push({
        status: '결제 완료',
        date: formatDateTime(order.updatedAt || order.createdAt),
        location: order.address || '',
      })
    }

    if (order.status === 'PREPARING') {
      history.push({
        status: '배송 준비',
        date: formatDateTime(order.updatedAt || order.createdAt),
        location: order.address || '',
      })
    }

    if (order.status === 'SHIPPED') {
      history.push({
        status: '배송 중',
        date: formatDateTime(order.updatedAt || order.createdAt),
        location: order.address || '',
      })
    }

    if (order.status === 'COMPLETED') {
      history.push({
        status: '배송 완료',
        date: formatDateTime(order.updatedAt || order.createdAt),
        location: order.address || '',
      })
    }

    if (order.status === 'CANCELED') {
      history.push({
        status: '주문 취소',
        date: formatDateTime(order.updatedAt || order.createdAt),
        location: order.address || '',
      })
    }

    return history
  }

  // 상품 금액 계산
  const calculateSubtotal = (): number => {
    if (!order?.items) return 0
    return order.items.reduce((sum, item) => {
      // API 응답: totalPrice (총 금액) 우선 사용, 없으면 unitPrice * quantity 계산
      const totalPrice = item.totalPrice ?? (item.unitPrice ?? 0) * (item.quantity ?? 0)
      return sum + totalPrice
    }, 0)
  }

  const subtotal = calculateSubtotal()
  const deliveryFee = 0 // API에서 배송비 정보가 없으면 0으로 설정
  const totalPrice = order?.totalAmount || subtotal + deliveryFee

  const getStatusBadge = (status: OrderStatus | string) => {
    const statusText = getStatusText(status)
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Package className="h-3 w-3 mr-1" />
            {statusText}
          </Badge>
        )
      case 'PAID':
        return (
          <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200">
            <CreditCard className="h-3 w-3 mr-1" />
            {statusText}
          </Badge>
        )
      case 'PREPARING':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Package className="h-3 w-3 mr-1" />
            {statusText}
          </Badge>
        )
      case 'SHIPPED':
        return (
          <Badge variant="default" className="bg-blue-600">
            <Truck className="h-3 w-3 mr-1" />
            {statusText}
          </Badge>
        )
      case 'COMPLETED':
        return (
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            <Home className="h-3 w-3 mr-1" />
            {statusText}
          </Badge>
        )
      case 'CANCELED':
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            {statusText}
          </Badge>
        )
      default:
        return <Badge>{statusText}</Badge>
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return

    const confirmMessage =
      '주문 전체를 취소하시겠습니까?\n\n' +
      '※ 참고사항:\n' +
      '- 부분 취소는 불가능하며, 주문 전체만 취소할 수 있습니다.\n' +
      '- 취소된 주문은 복구할 수 없습니다.'

    if (!confirm(confirmMessage)) return

    setIsProcessing(true)
    try {
      await orderService.cancelOrder(order.orderId, {
        orderId: order.orderId,
        cancelReason: '고객 요청',
      })
      toast({
        title: '주문이 취소되었습니다',
        description: '주문 전체가 취소되었습니다.',
      })
      // 주문 정보 다시 불러오기
      const updatedOrder = await orderService.getOrder(order.orderId)
      setOrder(updatedOrder)
      router.refresh()
    } catch (error) {
      console.error('주문 취소 실패:', error)
      toast({
        title: '주문 취소 실패',
        description: '주문 취소 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrintInvoice = () => {
    window.print()
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-muted-foreground">주문 정보를 불러오는 중...</div>
          </div>
        </div>
      </div>
    )
  }

  // 에러 발생
  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <Card className="p-6">
            <div className="text-center py-12">
              <div className="text-destructive mb-4">
                {error || '주문 정보를 불러올 수 없습니다.'}
              </div>
              <Button onClick={() => router.push('/orders')}>주문 내역으로 돌아가기</Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const deliveryHistory = getDeliveryHistory()
  const statusText = getStatusText(order.status)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>

        {/* Order Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">주문 상세</h1>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">주문번호: {order.orderId}</p>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              주문일시: {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrintInvoice}>
              <Printer className="h-4 w-4 mr-2" />
              송장 출력
            </Button>
            {order.status === 'PENDING' && (
              <div className="flex flex-col items-end gap-2">
                <Button variant="destructive" onClick={handleCancelOrder} disabled={isProcessing}>
                  주문 취소
                </Button>
                <p className="text-xs text-muted-foreground text-right max-w-[200px]">
                  * 부분 취소 불가, 주문 전체만 취소 가능
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">주문 상품</h2>
              {!order.items || order.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">주문 상품이 없습니다.</div>
              ) : (
                <div className="space-y-4">
                  {order.items.map((item, index) => {
                    // API 응답: unitPrice (개당 단가), totalPrice (총 금액)
                    const unitPrice = item.unitPrice ?? 0
                    const quantity = item.quantity ?? 0
                    const totalPrice = item.totalPrice ?? unitPrice * quantity
                    const itemId = item.id ?? index
                    const productId = item.productId

                    return (
                      <div
                        key={itemId}
                        className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                      >
                        <Link href={`/products/${productId}`} className="flex-shrink-0">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={item.productImage || '/placeholder.svg'}
                              alt={item.productName || '상품'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </Link>
                        <div className="flex-1">
                          <Link href={`/products/${productId}`}>
                            <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                              {item.productName || '상품명 없음'}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              {unitPrice.toLocaleString()}원 × {quantity}개
                            </div>
                            <div className="font-semibold">{totalPrice.toLocaleString()}원</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Delivery History */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">배송 현황</h2>
              {deliveryHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  배송 현황 정보가 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveryHistory.map((history, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {index < deliveryHistory.length - 1 && (
                          <div className="w-px h-12 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4 last:pb-0">
                        <div className="font-medium">{history.status}</div>
                        <div className="text-sm text-muted-foreground">{history.date}</div>
                        {history.location && (
                          <div className="text-sm text-muted-foreground">{history.location}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">주문 요약</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">상품 금액</span>
                  <span>{subtotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">배송비</span>
                  <span>{deliveryFee.toLocaleString()}원</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>총 결제금액</span>
                  <span className="text-primary">{totalPrice.toLocaleString()}원</span>
                </div>
              </div>
            </Card>

            {/* Payment Info */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                결제 정보
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">결제 상태</span>
                  <Badge
                    variant={order.status === 'CANCELED' ? 'destructive' : 'secondary'}
                    className={
                      order.status === 'CANCELED'
                        ? ''
                        : 'bg-green-50 text-green-700 border-green-200'
                    }
                  >
                    {order.status === 'CANCELED'
                      ? '취소됨'
                      : order.status === 'PAID'
                        ? '결제 완료'
                        : '결제 대기'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Delivery Info */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                배송 정보
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">받는 분</div>
                  <div className="font-medium">{order.receiverName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">연락처</div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.phone}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">이메일</div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.email}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">배송지</div>
                  <div className="space-y-1">
                    <div>
                      [{order.zipCode}] {order.address}
                    </div>
                    <div>{order.addressDetail}</div>
                    {order.deliveryMemo && (
                      <div className="text-sm text-muted-foreground mt-2">
                        <FileText className="h-3 w-3 inline mr-1" />
                        배송 요청사항: {order.deliveryMemo}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/products">쇼핑 계속하기</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/profile/orders">주문 내역 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
