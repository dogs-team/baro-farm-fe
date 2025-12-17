'use client'

import { Header } from '@/components/layout/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BuyerDashboard } from './sections/BuyerDashboard'
import { SellerDashboard } from './sections/SellerDashboard'
import { FarmDashboard } from './sections/FarmDashboard'
import type { ProfileState, ProfileActions } from './types'

interface ProfileViewProps {
  state: ProfileState
  actions: ProfileActions
}

export function ProfileView({ state, actions }: ProfileViewProps) {
  // 로딩 중이거나 사용자 정보가 없으면 로딩 표시
  if (!state.mounted || state.isLoadingUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">로딩 중...</div>
              <div className="text-sm text-muted-foreground">사용자 정보를 불러오는 중입니다.</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
          <p className="text-muted-foreground">내 정보와 주문 내역을 관리하세요</p>
        </div>

        <Tabs value={state.activeTab} onValueChange={actions.setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="buyer" className="cursor-pointer">
              구매자 대시보드
            </TabsTrigger>
            <TabsTrigger value="seller" className="cursor-pointer">
              판매자 대시보드
            </TabsTrigger>
            <TabsTrigger value="farm" className="cursor-pointer">
              농장 대시보드
            </TabsTrigger>
          </TabsList>

          {/* Buyer Dashboard Tab */}
          <TabsContent value="buyer" className="space-y-6">
            <BuyerDashboard state={state} actions={actions} />
          </TabsContent>

          {/* Seller Dashboard Tab */}
          <TabsContent value="seller" className="space-y-6">
            <SellerDashboard state={state} actions={actions} />
          </TabsContent>

          {/* Farm Dashboard Tab */}
          <TabsContent value="farm" className="space-y-6">
            <FarmDashboard state={state} actions={actions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
