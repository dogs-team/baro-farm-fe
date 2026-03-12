'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { sellerService } from '@/lib/api/services/seller'
import { userService } from '@/lib/api/services/user'

export default function SellerDashboardPage() {
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [sellerId, setSellerId] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const currentUser = await userService.getCurrentUser()
        const isSeller = await sellerService.hasSellerAccess(currentUser.userId, currentUser.role)
        setAllowed(isSeller)
        setSellerId(isSeller ? currentUser.userId : null)
      } catch {
        setAllowed(false)
        setSellerId(null)
      } finally {
        setReady(true)
      }
    })()
  }, [])

  const productManageHref = useMemo(() => {
    if (!sellerId) return '/productManage'
    return `/productManage?sellerId=${encodeURIComponent(sellerId)}`
  }, [sellerId])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">판매자 대시보드</h1>
        <p className="text-muted-foreground mb-8">현재 로그인한 판매자 계정 기준 대시보드입니다.</p>

        {!ready ? (
          <Card className="p-6">로딩 중...</Card>
        ) : !allowed ? (
          <Card className="p-6 space-y-3">
            <p className="font-semibold">접근 권한이 없습니다.</p>
            <p className="text-sm text-muted-foreground">
              SELLER 권한 계정으로 로그인한 뒤 다시 확인해주세요.
            </p>
            <Button asChild>
              <Link href="/login">로그인으로 이동</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <h2 className="font-semibold mb-2">정산 내역</h2>
              <p className="text-sm text-muted-foreground mb-4">예정 API: 정산 조회</p>
              <Button variant="outline" disabled>
                준비 중
              </Button>
            </Card>

            <Card className="p-5">
              <h2 className="font-semibold mb-2">판매자 정보 수정</h2>
              <p className="text-sm text-muted-foreground mb-4">예정 API: 판매자 정보 수정</p>
              <Button variant="outline" disabled>
                준비 중
              </Button>
            </Card>

            <Card className="p-5">
              <h2 className="font-semibold mb-2">상품 CRUD</h2>
              <p className="text-sm text-muted-foreground mb-4">상품 관리 페이지로 이동</p>
              <Button asChild>
                <Link href={productManageHref}>상품관리</Link>
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
