'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sprout, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { paymentService } from '@/lib/api/services/payment'
import { useToast } from '@/hooks/use-toast'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  // 토스페이먼츠가 자동으로 추가하는 파라미터들
  const orderId = searchParams.get('orderId') || `ORD-${Date.now()}`
  const paymentKey = searchParams.get('paymentKey')
  const amount = searchParams.get('amount')
  const [isProcessing, setIsProcessing] = useState(false)

  // 결제 승인 처리 (서버에서 시크릿 키로 처리) - HTML 예시 참고
  useEffect(() => {
    const confirmPayment = async () => {
      if (!paymentKey || !orderId || isProcessing) return

      setIsProcessing(true)
      try {
        // 서버에서 결제 승인 처리 (서버에서 시크릿 키 사용)
        // HTML 예시의 success.html 참고
        // 토스페이먼츠가 URL에 자동으로 추가한 파라미터 사용
        const paymentAmount = amount ? parseInt(amount) : 0
        const payload = {
          paymentKey,
          orderId,
          amount: paymentAmount,
        }

        // 백엔드 API 호출
        const response = await fetch('/api/v1/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error(`결제 승인 실패: ${response.status}`)
        }

        const data = await response.json()

        // 결제 승인 성공
        toast({
          title: '결제가 완료되었습니다',
          description: '주문이 성공적으로 처리되었습니다.',
        })
      } catch (error: any) {
        console.error('결제 승인 실패:', error)
        toast({
          title: '결제 승인 실패',
          description: error.message || '결제 승인 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
      } finally {
        setIsProcessing(false)
      }
    }

    if (paymentKey) {
      confirmPayment()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentKey, orderId])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">바로팜</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>

          <h1 className="text-3xl font-bold mb-4">주문이 완료되었습니다!</h1>

          <p className="text-lg text-muted-foreground mb-2">
            주문번호: <span className="font-mono font-semibold text-foreground">{orderId}</span>
          </p>

          <p className="text-muted-foreground mb-8">
            신선한 농산물이 곧 배송될 예정입니다.
            <br />
            주문 내역은 이메일로도 발송되었습니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/orders">주문 내역 보기</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
