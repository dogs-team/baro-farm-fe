'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sprout, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { paymentService } from '@/lib/api/services/payment'
import { useToast } from '@/hooks/use-toast'

function OrderSuccessPageContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  // 토스페이먼츠가 자동으로 추가하는 파라미터들
  const orderId = searchParams.get('orderId') || `ORD-${Date.now()}`
  const paymentKey = searchParams.get('paymentKey')
  const amount = searchParams.get('amount')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 결제 승인 처리 (서버에서 시크릿 키로 처리)
  useEffect(() => {
    const confirmPayment = async () => {
      if (!paymentKey || !orderId || isProcessing) return

      setIsProcessing(true)
      try {
        const paymentAmount = amount ? parseInt(amount) : 0

        console.log('[OrderSuccess] 결제 승인 API 호출:', {
          paymentKey,
          orderId,
          amount: paymentAmount,
        })

        await paymentService.confirmPayment({
          paymentKey,
          orderId,
          amount: paymentAmount,
        })

        setIsError(false)
        setErrorMessage(null)
        toast({
          title: '결제가 완료되었습니다',
          description: '주문이 성공적으로 처리되었습니다.',
        })
      } catch (error: any) {
        console.error('결제 승인 실패:', error)
        setIsError(true)
        setErrorMessage(error?.message || '결제 승인 중 오류가 발생했습니다.')
        toast({
          title: '결제 승인 실패',
          description: error?.message || '결제 승인 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
      } finally {
        setIsProcessing(false)
      }
    }

    if (paymentKey) {
      // 토스 결제인 경우에만 승인 처리
      confirmPayment()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentKey, orderId])

  const title = isError ? '결제 승인에 실패했습니다' : '주문이 완료되었습니다!'
  const description = isError
    ? errorMessage || '결제 승인 중 오류가 발생했습니다. 다시 시도해주세요.'
    : '신선한 농산물이 곧 배송될 예정입니다.\n주문 내역은 이메일로도 발송되었습니다.'

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
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            {isError ? (
              <XCircle className="h-12 w-12 text-destructive" />
            ) : (
              <CheckCircle className="h-12 w-12 text-primary" />
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4">{title}</h1>

          <p className="text-lg text-muted-foreground mb-2">
            주문번호: <span className="font-mono font-semibold text-foreground">{orderId}</span>
          </p>

          <p className="text-muted-foreground mb-8" style={{ whiteSpace: 'pre-line' }}>
            {description}
          </p>

          <div className="flex items-center justify-center mb-2">
            {isError && (
              <span className="text-sm text-destructive">
                {errorMessage || '결제 승인 중 오류가 발생했습니다.'}
              </span>
            )}
            {isProcessing && !isError && (
              <span className="text-sm text-muted-foreground">결제를 확인하는 중입니다...</span>
            )}
          </div>

          <div className="flex flex-col sm-flex-row gap-3 justify-center mt-4">
            {!isError && (
              <Button size="lg" asChild>
                <Link href="/orders">주문 내역 보기</Link>
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <Link href={isError ? '/checkout' : '/'}>
                {isError ? '다시 결제 시도하기' : '홈으로 돌아가기'}
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          로딩 중...
        </div>
      }
    >
      <OrderSuccessPageContent />
    </Suspense>
  )
}
