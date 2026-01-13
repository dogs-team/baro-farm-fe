'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sprout, Package, Calendar, MapPin, Plus, Settings, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { farmService } from '@/lib/api/services/farm'
import type { Farm } from '@/lib/api/types'
import type { ProfileState, ProfileActions } from '../types'

interface FarmDashboardProps {
  state: ProfileState
  actions: ProfileActions
}

export function FarmDashboard({ state, actions }: FarmDashboardProps) {
  const router = useRouter()
  const [myFarms, setMyFarms] = useState<Farm[]>([])
  const [isLoadingFarms, setIsLoadingFarms] = useState(false)

  // 내 농장 목록 조회
  useEffect(() => {
    const fetchMyFarms = async () => {
      if (!state.mounted || state.user.role !== 'SELLER') {
        setIsLoadingFarms(false)
        return
      }

      setIsLoadingFarms(true)
      try {
        const response = await farmService.getMyFarms({ page: 0, size: 10 })
        setMyFarms(response.content || [])
      } catch (error) {
        console.error('농장 목록 조회 실패:', error)
        setMyFarms([])
      } finally {
        setIsLoadingFarms(false)
      }
    }

    fetchMyFarms()
  }, [state.mounted, state.user.role])

  // 판매자가 아닌 경우
  if (state.user.role !== 'SELLER') {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center">
          <Sprout className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">농장 대시보드</h3>
          <p className="text-muted-foreground mb-6">
            판매자 권한이 필요합니다. 판매자로 전환하시면 농장을 관리할 수 있습니다.
          </p>
          <Button asChild>
            <Link href="/profile">판매자 대시보드로 이동</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 농가 대시보드로 가기 버튼 */}
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">상세 운영 대시보드</p>
          <p className="text-base font-semibold">농가 운영 현황을 한눈에 보기</p>
        </div>
        <Button asChild>
          <Link href="/farmer/dashboard">
            <ExternalLink className="h-4 w-4 mr-2" />
            농가 대시보드로 가기
          </Link>
        </Button>
      </Card>

      {/* 내 농장 목록 */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">내 농장</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/farmer/farm">
              <Settings className="h-4 w-4 mr-2" />
              농장 관리
            </Link>
          </Button>
        </div>
        {isLoadingFarms ? (
          <div className="text-center py-8 text-muted-foreground">농장 정보를 불러오는 중...</div>
        ) : myFarms.length === 0 ? (
          <div className="text-center py-8">
            <Sprout className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">등록된 농장이 없습니다.</p>
            <Button asChild>
              <Link href="/farmer/farm">
                <Plus className="h-4 w-4 mr-2" />
                농장 등록하기
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {myFarms.map((farm) => (
              <div
                key={farm.id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{farm.name}</h3>
                    {farm.rating && (
                      <Badge variant="secondary" className="text-xs">
                        ⭐ {farm.rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                  {farm.address && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{farm.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {farm.productCount !== undefined && <span>상품 {farm.productCount}개</span>}
                    {farm.experienceCount !== undefined && (
                      <span>체험 {farm.experienceCount}개</span>
                    )}
                    {farm.reviewCount !== undefined && <span>리뷰 {farm.reviewCount}개</span>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/farms/${farm.id}`}>상세보기</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 빠른 액션 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push('/farmer/products')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">상품 관리</div>
              <div className="text-xs text-muted-foreground">등록된 상품 보기</div>
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push('/farmer/experiences')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">체험 관리</div>
              <div className="text-xs text-muted-foreground">등록된 체험 보기</div>
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push('/farmer/products/new')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Plus className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">상품 등록</div>
              <div className="text-xs text-muted-foreground">새 상품 등록하기</div>
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push('/farmer/farm')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Settings className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">농장 설정</div>
              <div className="text-xs text-muted-foreground">농장 정보 수정</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
