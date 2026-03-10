'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sprout } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { userService } from '@/lib/api/services/user'
import { setUserRole } from '@/lib/api/client'
import { getErrorMessage, getErrorTitle } from '@/lib/utils/error-handler'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOauthLoading, setIsOauthLoading] = useState(false)

  const handleKakaoLogin = async () => {
    setIsOauthLoading(true)

    try {
      const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID
      if (!clientId) {
        throw new Error('Kakao client id is missing')
      }

      // [1] state 발급 -> 카카오 authorize로 리다이렉트
      const { state } = await userService.requestOauthState()
      const redirectUri = `${window.location.origin}/oauth/kakao/callback`
      const authorizeUrl = new URL('https://kauth.kakao.com/oauth/authorize')

      authorizeUrl.searchParams.set('client_id', clientId)
      authorizeUrl.searchParams.set('redirect_uri', redirectUri)
      authorizeUrl.searchParams.set('response_type', 'code')
      authorizeUrl.searchParams.set('state', state)

      window.location.href = authorizeUrl.toString()
    } catch (error: unknown) {
      console.error('Kakao login error:', error)
      toast({
        title: getErrorTitle(error),
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsOauthLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 실제 API 호출
      await userService.login({
        email,
        password,
      })

      // 더미 사용자 정보를 localStorage에 저장 (농가 등록 페이지에서 사용)
      if (typeof window !== 'undefined') {
        const dummyUser = {
          id: 1,
          email: email || 'user@example.com',
          name: '홍길동',
          phone: '010-1234-5678',
          role: 'BUYER' as const,
          createdAt: new Date().toISOString(),
        }
        localStorage.setItem('dummyUser', JSON.stringify(dummyUser))
        setUserRole('BUYER')
      }

      // 로그인 상태 변경 이벤트 발생 (헤더 등에서 상태 업데이트)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authStateChanged'))
      }

      toast({
        title: '로그인 성공',
        description: '환영합니다!',
      })

      router.push('/')
    } catch (error: unknown) {
      console.error('Login error:', error)

      // 401 에러는 특별 처리
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        (error as { status: number }).status === 401
      ) {
        toast({
          title: '로그인 실패',
          description: '이메일 또는 비밀번호가 올바르지 않습니다.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: getErrorTitle(error),
          description: getErrorMessage(error),
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">바로팜</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">로그인</h1>
          <p className="text-muted-foreground">신선한 농산물을 만나보세요</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">비밀번호</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  비밀번호 찾기
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          {/* 개발 환경: 빠른 로그인 버튼 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEmail('user@example.com')
                  setPassword('password')
                  // 자동으로 로그인 처리
                  if (typeof window !== 'undefined') {
                    const dummyUser = {
                      id: 1,
                      email: 'user@example.com',
                      name: '홍길동',
                      phone: '010-1234-5678',
                      role: 'BUYER' as const,
                      createdAt: new Date().toISOString(),
                    }
                    localStorage.setItem('dummyUser', JSON.stringify(dummyUser))
                    setUserRole('BUYER')
                    // 로그인 상태 변경 이벤트 발생 (헤더 등에서 상태 업데이트)
                    window.dispatchEvent(new Event('authStateChanged'))
                  }

                  toast({
                    title: '빠른 로그인 완료',
                    description: '개발용 더미 계정으로 로그인되었습니다.',
                  })

                  router.push('/')
                }}
              >
                🚀 빠른 로그인 (개발용)
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    const dummySeller = {
                      id: 'seller-dev-001',
                      email: 'seller@example.com',
                      name: '개발용 판매자',
                      phone: '010-0000-0000',
                      role: 'SELLER' as const,
                      sellerApproved: true,
                      sellerId: 'seller-dev-001',
                      createdAt: new Date().toISOString(),
                    }
                    localStorage.setItem('dummyUser', JSON.stringify(dummySeller))
                    setUserRole('SELLER')
                    window.dispatchEvent(new Event('authStateChanged'))
                  }

                  toast({
                    title: 'SELLER 빠른 로그인 완료',
                    description: '개발용 승인 판매자 계정으로 진입합니다.',
                  })

                  router.push('/dashboard')
                }}
              >
                빠른 SELLER 로그인 (개발용)
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                개발 환경에서만 표시됩니다
              </p>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleKakaoLogin}
                disabled={isOauthLoading}
              >
                {isOauthLoading ? '카카오 로그인 중...' : '카카오로 로그인'}
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">계정이 없으신가요? </span>
              <Link href="/signup" className="text-primary hover:underline font-medium">
                회원가입
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm text-primary hover:underline">
                농가 회원이신가요?
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
