'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: 문의하기 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: '문의 접수 완료',
        description: '문의사항이 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
      })
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      toast({
        title: '접수 실패',
        description: '문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">홈으로</span>
          </Link>
        </div>

        <div className="mb-8 text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">문의하기</h1>
          <p className="text-lg text-muted-foreground">궁금한 점이나 불편한 사항을 알려주세요</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 연락처 정보 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">연락처 정보</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">이메일</h3>
                <p className="text-sm text-muted-foreground">support@barofarm.com</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">전화번호</h3>
                <p className="text-sm text-muted-foreground">1588-0000</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">운영 시간</h3>
                <p className="text-sm text-muted-foreground">평일 09:00 - 18:00</p>
              </div>
            </div>
          </Card>

          {/* 문의 폼 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">문의하기</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">제목</Label>
                <Input
                  id="subject"
                  placeholder="문의 제목을 입력하세요"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">내용</Label>
                <Textarea
                  id="message"
                  placeholder="문의 내용을 입력하세요"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? '전송 중...' : '문의하기'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
