'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, DollarSign, Calendar, Download } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import type { SettlementStatement } from '@/lib/api/types/seller'

export default function SellerSettlementPage() {
  const [settlements, setSettlements] = useState<SettlementStatement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>('')

  useEffect(() => {
    const fetchSettlements = async () => {
      setIsLoading(true)
      try {
        // TODO: 정산 내역 API 호출
        // const response = await sellerService.getSettlements()
        // setSettlements(response.content || [])

        // 임시 데이터
        await new Promise((resolve) => setTimeout(resolve, 500))
        setSettlements([])
      } catch (error) {
        console.error('정산 내역 조회 실패:', error)
        setSettlements([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettlements()
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline">대기중</Badge>
      case 'CONFIRMED':
        return <Badge variant="default">확정</Badge>
      case 'PAID':
        return <Badge variant="secondary">지급완료</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">취소됨</Badge>
      default:
        return <Badge>{status || '알 수 없음'}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">마이페이지로</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">정산 내역</h1>
          <p className="text-muted-foreground">판매 정산 내역을 확인하실 수 있습니다</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">정산 내역을 불러오는 중...</div>
          </div>
        ) : settlements.length === 0 ? (
          <Card className="p-12 text-center">
            <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">정산 내역이 없습니다</h3>
            <p className="text-muted-foreground mb-6">아직 정산 내역이 없습니다.</p>
            <Button asChild>
              <Link href="/farmer/dashboard">농가 대시보드로</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {settlements.map((settlement) => (
              <Card key={settlement.statement_id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">정산 명세서</h3>
                      {getStatusBadge(settlement.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(settlement.period_start)} ~ {formatDate(settlement.period_end)}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    다운로드
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">총 매출</div>
                    <div className="text-xl font-bold text-green-600">
                      {settlement.total_sales.toLocaleString()}원
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">수수료</div>
                    <div className="text-xl font-bold text-red-600">
                      -{settlement.total_commission.toLocaleString()}원
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">최종 지급 금액</div>
                    <div className="text-xl font-bold text-blue-600">
                      {settlement.payout_amount.toLocaleString()}원
                    </div>
                  </div>
                </div>

                {settlement.confirmed_at && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    확정일: {formatDate(settlement.confirmed_at)}
                  </div>
                )}
                {settlement.paid_at && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    지급일: {formatDate(settlement.paid_at)}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
