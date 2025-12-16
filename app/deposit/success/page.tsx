'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sprout, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { paymentService } from '@/lib/api/services/payment'
import { useToast } from '@/hooks/use-toast'

function DepositSuccessPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  // 토스페이먼츠가 자동으로 추가하는 파라미터들
  const orderId = searchParams.get('orderId') || `DEPOSIT-${Date.now()}`
  const paymentKey = searchParams.get('paymentKey')
  const amount = searchParams.get('amount')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 예치금 결제 승인 처리
  useEffect(() => {
    const confirmDeposit = async () => {
      if (!paymentKey || !orderId || isProcessing) return

      setIsProcessing(true)
      setIsError(false)
      setErrorMessage(null)

      try {
        const paymentAmount = amount ? parseInt(amount) : 0

        console.log('[DepositSuccess] 예치금 결제 승인 API 호출:', {
          paymentKey,
          orderId,
          amount: paymentAmount,
        })

        await paymentService.confirmDeposit({
          paymentKey,
          orderId,
          amount: paymentAmount,
        })

        toast({
          title: '예치금 충전이 완료되었습니다',
          description: `${paymentAmount.toLocaleString()}원이 예치금으로 충전되었습니다.`,
        })
      } catch (error: unknown) {
        console.error('예치금 결제 승인 실패:', error)
        const err = error as { status?: number; message?: string }
        const errorMsg =
          err?.message ||
          (err?.status === 404
            ? '예치금 결제 승인 API를 찾을 수 없습니다. 관리자에게 문의해주세요.'
            : '예치금 결제 승인 중 오류가 발생했습니다.')

        setIsError(true)
        setErrorMessage(errorMsg)

        toast({
          title: '예치금 결제 승인 실패',
          description: errorMsg,
          variant: 'destructive',
        })

        // 404 에러인 경우 실패 페이지로 리다이렉트 (orderId 포함)
        if (err?.status === 404) {
          setTimeout(() => {
            router.push(`/deposit/fail?orderId=${encodeURIComponent(orderId)}`)
          }, 2000)
        }
      } finally {
        setIsProcessing(false)
      }
    }

    if (paymentKey) {
      confirmDeposit()
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
          {isProcessing ? (
            <>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <h1 className="text-3xl font-bold mb-4">예치금 충전 확인 중...</h1>
              <p className="text-muted-foreground mb-8">잠시만 기다려주세요.</p>
            </>
          ) : isError ? (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <h1 className="text-3xl font-bold mb-4 text-destructive">예치금 충전 승인 실패</h1>
              <p className="text-lg text-muted-foreground mb-2">
                충전 ID: <span className="font-mono font-semibold text-foreground">{orderId}</span>
              </p>
              {errorMessage && <p className="text-destructive mb-8">{errorMessage}</p>}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" variant="destructive" asChild>
                  <Link href="/deposit/fail">실패 페이지로 이동</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/profile">마이페이지로 이동</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>

              <h1 className="text-3xl font-bold mb-4">예치금 충전이 완료되었습니다!</h1>

              <p className="text-lg text-muted-foreground mb-2">
                충전 ID: <span className="font-mono font-semibold text-foreground">{orderId}</span>
              </p>

              <p className="text-muted-foreground mb-8">
                마이페이지에서 예치금 잔액을 확인하실 수 있습니다.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" asChild>
                  <Link href="/profile">마이페이지로 이동</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/">홈으로 돌아가기</Link>
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function DepositSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          로딩 중...
        </div>
      }
    >
      <DepositSuccessPageContent />
    </Suspense>
  )
}
