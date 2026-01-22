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
import { authService } from '@/lib/api/services/auth'
import { getErrorMessage, getErrorTitle } from '@/lib/utils/error-handler'
import { setAccessToken, getSessionKey, setSessionKey } from '@/lib/api/client'
import { cartService } from '@/lib/api/services/cart'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 실제 API 호출
      const response = await authService.login({
        email,
        password,
      })

      toast({
        title: '로그인 성공',
        description: '환영합니다!',
      })

      // 0. 장바구니 병합 (비로그인 장바구니 -> 로그인 장바구니)
      const guestSessionKey = getSessionKey()
      if (guestSessionKey) {
        try {
          await cartService.mergeCart()
          // 병합 성공 후 세션 키 삭제 (더 이상 필요 없음)
          setSessionKey(null)
          console.log('장바구니 병합 완료')
        } catch (error) {
          console.error('장바구니 병합 실패:', error)
          // 병합 실패해도 로그인은 성공 처리 (사용자 경험 우선)
        }
      }

      router.push('/')

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
      }

      toast({
        title: '로그인 성공',
        description: '환영합니다!',
      })

      router.push('/')
    } catch (error: any) {
      console.error('Login error:', error)

      // 401 에러는 특별 처리
      if (error?.status === 401) {
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
                  const dummyToken = 'dummy-access-token-' + Date.now()
                  setAccessToken(dummyToken)

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
                  }

                  toast({
                    title: '빠른 로그인 완료',
                    description: '개발용 더미 계정으로 로그인되었습니다.',
                  })

                  // 0. 장바구니 병합 (비로그인 장바구니 -> 로그인 장바구니)
                  const guestSessionKey = getSessionKey()
                  if (guestSessionKey) {
                    // 개발용 더미 로그인에서는 API 호출이 불가능할 수 있으므로 try-catch로 감쌈
                    // (실제 API와 연동된 경우에만 작동)
                    try {
                      cartService
                        .mergeCart()
                        .then(() => {
                          setSessionKey(null)
                          console.log('장바구니 병합 완료')
                        })
                        .catch((e: any) => console.error('장바구니 병합 실패', e))
                    } catch (e) {
                      console.error(e)
                    }
                  }

                  router.push('/')
                }}
              >
                🚀 빠른 로그인 (개발용)
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

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">계정이 없으신가요? </span>
              <Link href="/signup" className="text-primary hover:underline font-medium">
                회원가입
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link href="/farmer/login" className="text-sm text-primary hover:underline">
                농가 회원이신가요?
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
