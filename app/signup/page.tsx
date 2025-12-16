'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sprout, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/lib/api/services/auth'
import { depositService } from '@/lib/api/services/payment'
import { getErrorMessage, getErrorTitle } from '@/lib/utils/error-handler'

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerificationSent, setIsVerificationSent] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // 이메일 변경 시 인증 상태 초기화
    if (e.target.name === 'email') {
      setIsVerificationSent(false)
      setIsEmailVerified(false)
      setVerificationCode('')
    }
  }

  const handleRequestVerification = async () => {
    if (!formData.email) {
      toast({
        title: '이메일 입력 필요',
        description: '이메일 주소를 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: '이메일 형식 오류',
        description: '올바른 이메일 주소를 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await authService.requestEmailVerification(formData.email)
      setIsVerificationSent(true)
      toast({
        title: '인증 코드 발송',
        description: '이메일로 인증 코드를 발송했습니다.',
      })
    } catch (error: any) {
      console.error('Email verification request error:', error)

      toast({
        title: getErrorTitle(error),
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast({
        title: '인증 코드 입력 필요',
        description: '인증 코드를 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    setIsVerifying(true)
    try {
      const result = await authService.verifyEmailCode(formData.email, verificationCode)
      if (result.verified) {
        setIsEmailVerified(true)
        toast({
          title: '이메일 인증 완료',
          description: '이메일 인증이 완료되었습니다.',
        })
      } else {
        toast({
          title: '인증 실패',
          description: '인증 코드가 일치하지 않습니다.',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      console.error('Email verification error:', error)

      toast({
        title: getErrorTitle(error),
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isEmailVerified) {
      toast({
        title: '이메일 인증 필요',
        description: '이메일 인증을 완료해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: '비밀번호 불일치',
        description: '비밀번호가 일치하지 않습니다.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      await authService.signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
      })

      // 회원가입 성공 시 예치금 계정 생성
      try {
        await depositService.createDeposit()
      } catch (depositError) {
        // 예치금 계정 생성 실패는 로그만 남기고 회원가입은 성공으로 처리
        console.error('예치금 계정 생성 실패 (회원가입은 성공):', depositError)
      }

      toast({
        title: '회원가입 완료',
        description: '회원가입이 완료되었습니다. 로그인해주세요.',
      })

      router.push('/login')
    } catch (error: any) {
      console.error('Signup error:', error)

      // 409 에러는 특별 처리
      if (error?.status === 409) {
        toast({
          title: '회원가입 실패',
          description: '이미 사용 중인 이메일입니다.',
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
          <h1 className="text-2xl font-bold mb-2">회원가입</h1>
          <p className="text-muted-foreground">신선한 농산물을 만나보세요</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="홍길동"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isEmailVerified}
                  required
                  className={isEmailVerified ? 'flex-1' : 'flex-1'}
                />
                {!isEmailVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRequestVerification}
                    disabled={isLoading || !formData.email}
                  >
                    {isVerificationSent ? '재발송' : '인증'}
                  </Button>
                )}
                {isEmailVerified && (
                  <Button type="button" variant="outline" disabled className="text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    인증완료
                  </Button>
                )}
              </div>
            </div>

            {isVerificationSent && !isEmailVerified && (
              <div className="space-y-2">
                <Label htmlFor="verificationCode">인증 코드</Label>
                <div className="flex gap-2">
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="인증 코드 6자리"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isVerifying || !verificationCode}
                  >
                    확인
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  이메일로 발송된 6자리 인증 코드를 입력해주세요.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '가입 중...' : '회원가입'}
            </Button>
          </form>

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
              <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                로그인
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link href="/farmer/signup" className="text-sm text-primary hover:underline">
                농가로 등록하시겠어요?
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
