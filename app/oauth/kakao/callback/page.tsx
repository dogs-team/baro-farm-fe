'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/lib/api/services/auth'
import { getErrorMessage, getErrorTitle } from '@/lib/utils/error-handler'

export default function KakaoCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  useEffect(() => {
    if (!code || !state) {
      toast({
        title: 'OAuth 응답 오류',
        description: 'code/state가 누락되었습니다.',
        variant: 'destructive',
      })
      return
    }

    const run = async () => {
      try {
        // [1] 백엔드 콜백 호출 -> HttpOnly cookie 발급
        await authService.oauthCallback({ provider: 'kakao', code, state })

        // [2] 로그인 상태 갱신 이벤트
        window.dispatchEvent(new Event('authStateChanged'))

        // [3] 완료 후 홈으로 이동
        router.replace('/')
      } catch (error: unknown) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        toast({
          title: getErrorTitle(error),
          description: getErrorMessage(error),
          variant: 'destructive',
        })
      }
    }

    void run()
  }, [router, searchParams, toast])

  if (!code || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 w-full max-w-md space-y-4">
          <h1 className="text-xl font-semibold">OAuth ?戨嫷 ?る</h1>
          <p className="text-sm text-muted-foreground">code/state臧€ ?勲澖?橃棃?惦媹??</p>
          <Button asChild className="w-full">
            <Link href="/login">搿滉犯?胳溂搿??措彊</Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 w-full max-w-md space-y-4">
          <h1 className="text-xl font-semibold">카카오 로그인 실패</h1>
          <p className="text-sm text-muted-foreground">다시 로그인 시도해 주세요.</p>
          <Button asChild className="w-full">
            <Link href="/login">로그인으로 이동</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-6 w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold">카카오 로그인 처리 중...</h1>
        <p className="text-sm text-muted-foreground">잠시만 기다려 주세요.</p>
      </Card>
    </div>
  )
}
