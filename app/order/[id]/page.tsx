'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  X,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  Printer,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { useToast } from '@/hooks/use-toast'

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  // 주문 데이터 (실제로는 API에서 가져옴)
  const order = {
    id: 'ORD-001234',
    orderNumber: 'ORD-001234',
    date: '2024.12.10 14:30',
    status: '배송 준비',
    items: [
      {
        id: 1,
        productId: 1,
        name: '유기농 방울토마토',
        image: '/fresh-organic-cherry-tomatoes.jpg',
        price: 8500,
        quantity: 2,
        subtotal: 17000,
      },
      {
        id: 2,
        productId: 2,
        name: '무농약 상추',
        image: '/fresh-organic-lettuce.png',
        price: 5000,
        quantity: 1,
        subtotal: 5000,
      },
    ],
    subtotal: 22000,
    deliveryFee: 0, // 무료 배송
    totalPrice: 22000,
    paymentMethod: '신용카드',
    paymentStatus: '결제 완료',
    deliveryInfo: {
      recipient: '김**',
      phone: '010-1234-5678',
      email: 'customer@example.com',
      address: '서울시 강남구 테헤란로 123',
      addressDetail: '101동 101호',
      zipCode: '06142',
      deliveryNote: '부재 시 문 앞에 놓아주세요',
    },
    deliveryHistory: [
      {
        status: '주문 접수',
        date: '2024.12.10 14:30',
        location: '서울시 강남구',
      },
      {
        status: '결제 완료',
        date: '2024.12.10 14:31',
        location: '서울시 강남구',
      },
    ],
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '주문 접수':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Package className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case '배송 준비':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Package className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case '배송 중':
        return (
          <Badge variant="default" className="bg-blue-600">
            <Truck className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case '배송 완료':
        return (
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case '주문 취소':
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm('주문을 취소하시겠습니까?')) return

    setIsProcessing(true)
    try {
      // TODO: API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: '주문이 취소되었습니다',
        description: '주문 취소가 완료되었습니다.',
      })
      router.push('/order')
    } catch (error) {
      toast({
        title: '주문 취소 실패',
        description: '주문 취소 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmDelivery = async () => {
    if (!confirm('배송 완료를 확인하시겠습니까?')) return

    setIsProcessing(true)
    try {
      // TODO: API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: '배송 완료 확인',
        description: '배송 완료가 확인되었습니다.',
      })
    } catch (error) {
      toast({
        title: '처리 실패',
        description: '처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrintInvoice = () => {
    window.print()
  }

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
              <p className="text-muted-foreground">주문번호: {order.orderNumber}</p>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">주문일시: {order.date}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrintInvoice}>
              <Printer className="h-4 w-4 mr-2" />
              송장 출력
            </Button>
            {order.status === '배송 준비' && (
              <Button variant="destructive" onClick={handleCancelOrder} disabled={isProcessing}>
                주문 취소
              </Button>
            )}
            {order.status === '배송 완료' && (
              <Button onClick={handleConfirmDelivery} disabled={isProcessing}>
                구매 확정
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">주문 상품</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                    <div className="flex-1">
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {item.price.toLocaleString()}원 × {item.quantity}개
                        </div>
                        <div className="font-semibold">{item.subtotal.toLocaleString()}원</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Delivery History */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">배송 현황</h2>
              <div className="space-y-4">
                {order.deliveryHistory.map((history, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {index < order.deliveryHistory.length - 1 && (
                        <div className="w-px h-12 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4 last:pb-0">
                      <div className="font-medium">{history.status}</div>
                      <div className="text-sm text-muted-foreground">{history.date}</div>
                      <div className="text-sm text-muted-foreground">{history.location}</div>
                    </div>
                  </div>
                ))}
              </div>
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
                  <span>{order.subtotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">배송비</span>
                  <span>{order.deliveryFee.toLocaleString()}원</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>총 결제금액</span>
                  <span className="text-primary">{order.totalPrice.toLocaleString()}원</span>
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
                  <span className="text-muted-foreground">결제 방법</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">결제 상태</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    {order.paymentStatus}
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
                  <div className="font-medium">{order.deliveryInfo.recipient}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">연락처</div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.deliveryInfo.phone}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">이메일</div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.deliveryInfo.email}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">배송지</div>
                  <div className="space-y-1">
                    <div>
                      [{order.deliveryInfo.zipCode}] {order.deliveryInfo.address}
                    </div>
                    <div>{order.deliveryInfo.addressDetail}</div>
                    {order.deliveryInfo.deliveryNote && (
                      <div className="text-sm text-muted-foreground mt-2">
                        <FileText className="h-3 w-3 inline mr-1" />
                        배송 요청사항: {order.deliveryInfo.deliveryNote}
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
