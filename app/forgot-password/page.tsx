'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: 비밀번호 재설정 이메일 발송 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsSent(true)
      toast({
        title: '이메일 발송 완료',
        description: '비밀번호 재설정 링크를 이메일로 보냈습니다.',
      })
    } catch (error) {
      toast({
        title: '발송 실패',
        description: '이메일 발송 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            로그인으로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold mb-2">비밀번호 찾기</h1>
          <p className="text-sm text-muted-foreground">
            등록하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일 주소</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일 주소를 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              <Mail className="h-4 w-4 mr-2" />
              {isLoading ? '발송 중...' : '재설정 링크 보내기'}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">이메일을 확인해주세요</h2>
              <p className="text-sm text-muted-foreground">
                {email}로 비밀번호 재설정 링크를 보냈습니다.
                <br />
                이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
              </p>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">로그인으로 돌아가기</Link>
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
