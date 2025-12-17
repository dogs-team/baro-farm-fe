'use client'

import { Card } from '@/components/ui/card'
import { Sprout } from 'lucide-react'

interface FarmDashboardProps {
  state: any // TODO: 타입 정의
  actions: any // TODO: 타입 정의
}

export function FarmDashboard({ state, actions }: FarmDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">농장 대시보드</h2>
      </div>

      <Card className="p-12 text-center">
        <Sprout className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">농장 관리 기능</h3>
        <p className="text-muted-foreground">농장 관리 및 모니터링 기능이 곧 제공될 예정입니다.</p>
      </Card>
    </div>
  )
}
