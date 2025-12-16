'use client'

import { Header } from '@/components/layout/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileOverview } from './sections/ProfileOverview'
import { ProfileOrders } from './sections/ProfileOrders'
import { ProfileSettings } from './sections/ProfileSettings'
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="orders">주문 내역</TabsTrigger>
            {/* TODO: 찜하기 기능 추가 예정 */}
            {/* <TabsTrigger value="favorites">찜한 상품</TabsTrigger> */}
            <TabsTrigger value="role">역할 관리</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <ProfileOverview state={state} actions={actions} />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <ProfileOrders state={state} />
          </TabsContent>

          {/* Role Management Tab */}
          <TabsContent value="role" className="space-y-6">
            {/* TODO: ProfileRole 컴포넌트가 삭제되어 임시로 빈 상태로 표시 */}
            <div className="text-center py-8 text-muted-foreground">
              역할 관리 기능은 현재 개발 중입니다.
            </div>
          </TabsContent>

          {/* TODO: 찜하기 기능 추가 예정 */}
          {/* Favorites Tab */}
          {/* <TabsContent value="favorites" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">찜한 상품</h2>
              {favoriteProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">찜한 상품이 없습니다</p>
                  <Button asChild>
                    <Link href="/products">상품 둘러보기</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {favoriteProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden group hover:shadow-lg transition-shadow"
                    >
                      <Link href={`/products/${product.id}`}>
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          <Image
                            src={product.image || '/placeholder.svg'}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">{product.name}</h3>
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="text-sm font-medium">{product.rating}</span>
                          </div>
                          <div className="text-lg font-bold">
                            {product.price.toLocaleString()}원
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent> */}

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <ProfileSettings state={state} actions={actions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}