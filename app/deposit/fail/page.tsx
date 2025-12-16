'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sprout, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function DepositFailPageContent() {
  const searchParams = useSearchParams()
  // 토스페이먼츠가 전달할 수 있는 파라미터들 확인
  const orderId =
    searchParams.get('orderId') ||
    searchParams.get('chargeId') ||
    searchParams.get('orderName') ||
    '알 수 없음'
  const paymentKey = searchParams.get('paymentKey')
  const errorCode = searchParams.get('errorCode')
  const errorMessage = searchParams.get('errorMessage')

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
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>

          <h1 className="text-3xl font-bold mb-4">예치금 충전에 실패했습니다</h1>

          <p className="text-lg text-muted-foreground mb-2">
            충전 ID: <span className="font-mono font-semibold text-foreground">{orderId}</span>
          </p>

          <p className="text-muted-foreground mb-4">
            예치금 충전 중 오류가 발생했습니다.
            <br />
            다시 시도하시거나 다른 결제 수단을 이용해주세요.
          </p>

          {(errorCode || errorMessage) && (
            <div className="mb-8 p-4 bg-destructive/10 rounded-lg text-left">
              {errorCode && (
                <p className="text-sm text-muted-foreground mb-1">
                  에러 코드: <span className="font-mono">{errorCode}</span>
                </p>
              )}
              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            </div>
          )}

          {!errorCode && !errorMessage && <div className="mb-8" />}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/profile">마이페이지로 돌아가기</Link>
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

export default function DepositFailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          로딩 중...
        </div>
      }
    >
      <DepositFailPageContent />
    </Suspense>
  )
}
