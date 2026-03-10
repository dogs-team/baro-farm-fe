'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { userService } from '@/lib/api/services/user'
import { getErrorMessage, getErrorTitle } from '@/lib/utils/error-handler'

function KakaoCallbackPageContent() {
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
        await userService.oauthCallback({ provider: 'kakao', code, state })
        window.dispatchEvent(new Event('authStateChanged'))
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
  }, [code, router, state, toast])

  if (!code || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 w-full max-w-md space-y-4">
          <h1 className="text-xl font-semibold">OAuth 응답 오류</h1>
          <p className="text-sm text-muted-foreground">code/state가 누락되었습니다.</p>
          <Button asChild className="w-full">
            <Link href="/login">로그인으로 이동</Link>
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

export default function KakaoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="p-6 w-full max-w-md space-y-4">
            <h1 className="text-xl font-semibold">카카오 로그인 처리 중...</h1>
            <p className="text-sm text-muted-foreground">잠시만 기다려 주세요.</p>
          </Card>
        </div>
      }
    >
      <KakaoCallbackPageContent />
    </Suspense>
  )
}
