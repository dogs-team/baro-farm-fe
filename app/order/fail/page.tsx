'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sprout, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function OrderFailPage() {
  const searchParams = useSearchParams()
  // 토스페이먼츠가 자동으로 추가하는 파라미터들
  const orderId = searchParams.get('orderId') || '알 수 없음'
  const code = searchParams.get('code')
  const message = searchParams.get('message')

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

          <h1 className="text-3xl font-bold mb-4">결제가 실패했습니다</h1>

          <p className="text-lg text-muted-foreground mb-2">
            주문번호: <span className="font-mono font-semibold text-foreground">{orderId}</span>
          </p>

          <p className="text-muted-foreground mb-8">
            결제 처리 중 오류가 발생했습니다.
            <br />
            다시 시도하시거나 다른 결제 수단을 이용해주세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/cart">장바구니로 돌아가기</Link>
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
