'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Store, Package, Users, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { ProfileInfoSection } from './ProfileInfoSection'
import type { ProfileState, ProfileActions } from '../types'

interface SellerDashboardProps {
  state: ProfileState
  actions: ProfileActions
}

export function SellerDashboard({ state, actions }: SellerDashboardProps) {
  const router = useRouter()
  const { toast } = useToast()

  // 판매자 전환 다이얼로그 상태는 ProfileContainer에서 관리됨
  // 여기서는 UI만 렌더링

  const isSeller = state.user.role === 'SELLER'

  if (!isSeller) {
    // CUSTOMER일 때는 판매자로 전환 유도 UI 표시
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">판매자 모드로 전환하세요</h3>
          <p className="text-muted-foreground mb-6">
            농장에서 직접 생산한 상품을 판매하고 수익을 창출해보세요
          </p>
          <Dialog open={state.isSellerDialogOpen} onOpenChange={actions.setIsSellerDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="px-8">
                <Store className="h-5 w-5 mr-2" />
                판매자 전환하기
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>판매자 전환</DialogTitle>
                <DialogDescription>
                  판매자 권한을 신청합니다. 사업자 정보를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">상점 이름</Label>
                  <Input
                    id="storeName"
                    placeholder="상점 이름"
                    value={state.sellerApplication.storeName}
                    onChange={(e) =>
                      actions.setSellerApplication({
                        ...state.sellerApplication,
                        storeName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_reg_no">사업자 등록 번호</Label>
                  <Input
                    id="business_reg_no"
                    placeholder="예: 123-45-67890"
                    value={state.sellerApplication.business_reg_no}
                    onChange={(e) =>
                      actions.setSellerApplication({
                        ...state.sellerApplication,
                        business_reg_no: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_owner_name">사업자 대표자명</Label>
                  <Input
                    id="business_owner_name"
                    placeholder="사업자 대표자명"
                    value={state.sellerApplication.business_owner_name}
                    onChange={(e) =>
                      actions.setSellerApplication({
                        ...state.sellerApplication,
                        business_owner_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settlement_bank">정산 은행</Label>
                  <Input
                    id="settlement_bank"
                    placeholder="예: 국민은행"
                    value={state.sellerApplication.settlement_bank}
                    onChange={(e) =>
                      actions.setSellerApplication({
                        ...state.sellerApplication,
                        settlement_bank: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settlement_account">정산 계좌번호</Label>
                  <Input
                    id="settlement_account"
                    placeholder="정산 계좌번호"
                    value={state.sellerApplication.settlement_account}
                    onChange={(e) =>
                      actions.setSellerApplication({
                        ...state.sellerApplication,
                        settlement_account: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => actions.setIsSellerDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={actions.handleSellerApplication}>신청하기</Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    )
  }

  // 판매자일 때는 실제 판매자 대시보드 표시
  return (
    <div className="space-y-4">
      {/* Main Layout: Profile + Stats */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Profile Header - Left Side */}
        <ProfileInfoSection user={state.user} />

        {/* Middle Column: 판매 통계 */}
        <div className="space-y-4">
          {/* 이번 달 정산금액 */}
          <Card
            className="p-4 hover:bg-muted/50 transition-colors"
            onClick={() => router.push('/seller/settlement')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">이번 달 정산금액</div>
                <div className="text-2xl font-bold">
                  {state.isLoadingSettlement
                    ? '...'
                    : `${state.monthlySettlement?.toLocaleString()}원`}
                </div>
              </div>
            </div>
          </Card>

          {/* 총 판매 건수 */}
          <Card
            className="p-4 hover:bg-muted/50 transition-colors"
            onClick={() => router.push('/seller/orders')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">총 판매 건수</div>
                <div className="text-2xl font-bold">
                  {state.isLoadingOrders ? '...' : state.orderCount}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: 추가 통계 */}
        <div className="space-y-4">
          {/* 구매자 수 */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">구매자 수</div>
                <div className="text-2xl font-bold">0</div>
              </div>
            </div>
          </Card>

          {/* 리뷰 수 */}
          <Card
            className="p-4  hover:bg-muted/50 transition-colors"
            onClick={() => router.push('/seller/reviews')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Star className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">리뷰 수</div>
                <div className="text-2xl font-bold">
                  {state.isLoadingReviews ? '...' : state.reviewCount}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 정산 상세 정보 */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">정산 상세 정보</h2>
          {state.settlementMonth && (
            <Badge variant="outline" className="text-xs">
              {state.settlementMonth.year}년 {state.settlementMonth.monthValue}월
            </Badge>
          )}
        </div>
        {state.settlementData ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">총 매출 합계</div>
              <div className="text-xl font-bold text-green-600">
                {state.settlementData.totalSales.toLocaleString()}원
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">총 수수료 합계</div>
              <div className="text-xl font-bold text-red-600">
                -{state.settlementData.totalCommission.toLocaleString()}원
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">최종 지급 금액</div>
              <div className="text-xl font-bold text-blue-600">
                {state.settlementData.payoutAmount.toLocaleString()}원
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <div className="text-sm">아직 정산 데이터가 없습니다.</div>
            <div className="text-xs mt-1">판매 활동 후 정산 정보가 표시됩니다.</div>
          </div>
        )}
        {state.settlementData && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              정산 ID: {state.settlementData.statementId}
            </div>
          </div>
        )}
      </Card>

      {/* 판매 상품 목록 미리보기 */}
      <Card
        className="p-4  hover:bg-muted/50 transition-colors"
        onClick={() => router.push('/seller/products')}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">등록된 상품</h2>
          <Button variant="outline" size="sm">
            상품 관리
          </Button>
        </div>
        <div className="text-center py-6 text-muted-foreground">아직 등록된 상품이 없습니다.</div>
      </Card>

      {/* 최근 주문 현황 */}
      <Card
        className="p-4  hover:bg-muted/50 transition-colors"
        onClick={() => router.push('/seller/orders')}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">최근 주문 현황</h2>
          <Button variant="outline" size="sm">
            주문 관리
          </Button>
        </div>
        <div className="text-center py-6 text-muted-foreground">최근 주문이 없습니다.</div>
      </Card>
    </div>
  )
}
