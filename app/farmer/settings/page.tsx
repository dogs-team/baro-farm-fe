'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, User, Building2, CreditCard, Bell, Shield } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { FarmerNav } from '../components/farmer-nav'

export default function FarmerSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // TODO: 설정 저장 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: '설정 저장 완료',
        description: '설정이 성공적으로 저장되었습니다.',
      })
    } catch (error) {
      toast({
        title: '저장 실패',
        description: '설정 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">홈으로</span>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">농가 설정</h1>
          <p className="text-muted-foreground">농가 정보 및 계정 설정을 관리하세요</p>
        </div>

        <FarmerNav />

        <div className="grid gap-6 md:grid-cols-3">
          {/* 사이드바 */}
          <div className="md:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/farmer/settings')}
                >
                  <User className="h-4 w-4 mr-2" />
                  계정 정보
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/farmer/farm')}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  농장 정보
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  결제 정보
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  알림 설정
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  보안 설정
                </Button>
              </nav>
            </Card>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="md:col-span-2 space-y-6">
            {/* 계정 정보 */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">계정 정보</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="이메일 주소"
                    defaultValue="farmer@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input id="name" placeholder="이름" defaultValue="홍길동" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <Input id="phone" placeholder="전화번호" defaultValue="010-1234-5678" />
                </div>
              </div>
            </Card>

            {/* 농장 정보 */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">농장 정보</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="farmName">농장 이름</Label>
                  <Input id="farmName" placeholder="농장 이름" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">주소</Label>
                  <Input id="address" placeholder="농장 주소" />
                </div>
                <Button variant="outline" asChild>
                  <Link href="/farmer/farm">농장 정보 수정하기</Link>
                </Button>
              </div>
            </Card>

            {/* 저장 버튼 */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? '저장 중...' : '설정 저장'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
