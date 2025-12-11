'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Edit,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Store } from 'lucide-react'
import { getAccessToken, setAccessToken } from '@/lib/api/client'
import { authService } from '@/lib/api/services/auth'
import { useCartStore } from '@/lib/cart-store'
import { useAddressStore } from '@/lib/address-store'
import { AddressDialog } from '@/components/address/address-dialog'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const clearCart = useCartStore((state) => state.clearCart)
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useAddressStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [isSellerDialogOpen, setIsSellerDialogOpen] = useState(false)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [sellerApplication, setSellerApplication] = useState({
    farmName: '',
    farmAddress: '',
    farmDescription: '',
    businessNumber: '',
  })

  const user = {
    name: '김**',
    email: 'user@example.com',
    phone: '010-1234-5678',
    joinDate: '2024.01.15',
    avatar: '/placeholder.svg',
    role: 'BUYER', // BUYER or SELLER
  }

  const handleSellerApplication = async () => {
    if (!sellerApplication.farmName || !sellerApplication.farmAddress) {
      toast({
        title: '필수 항목 입력',
        description: '농장명과 주소를 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    try {
      // TODO: API 연동
      // await authService.requestSellerRole(sellerApplication)
      toast({
        title: '판매자 전환 신청 완료',
        description: '판매자 전환 신청이 완료되었습니다. 검토 후 승인됩니다.',
      })
      setIsSellerDialogOpen(false)
      setSellerApplication({
        farmName: '',
        farmAddress: '',
        farmDescription: '',
        businessNumber: '',
      })
    } catch (error) {
      toast({
        title: '신청 실패',
        description: '판매자 전환 신청 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleLogout = async () => {
    try {
      // API 로그아웃 시도 (실패해도 계속 진행)
      try {
        await authService.logout()
      } catch (error) {
        console.warn('로그아웃 API 호출 실패 (로컬 로그아웃 진행):', error)
      }

      // 로컬 스토리지 정리
      setAccessToken(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dummyUser')
        localStorage.removeItem('accessToken')
      }

      // 장바구니 비우기 (에러가 나도 계속 진행)
      try {
        clearCart()
      } catch (error) {
        console.warn('장바구니 비우기 실패 (계속 진행):', error)
      }

      // 이벤트 발생 (다른 컴포넌트에 알림)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authStateChanged'))
      }

      toast({
        title: '로그아웃되었습니다',
        description: '다음에 또 만나요!',
      })

      // 홈으로 리다이렉트
      router.push('/')
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error)
      toast({
        title: '로그아웃 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      })
    }
  }

  const stats = [
    { label: '주문 내역', value: '12', icon: Package },
    { label: '찜한 상품', value: '8', icon: Heart },
    { label: '작성한 리뷰', value: '5', icon: Star },
  ]

  const recentOrders = [
    {
      id: 'ORD-001234',
      date: '2024.12.10',
      status: '배송 완료',
      items: ['유기농 방울토마토', '무농약 상추'],
      total: 25000,
    },
    {
      id: 'ORD-001233',
      date: '2024.12.08',
      status: '배송 중',
      items: ['친환경 딸기'],
      total: 15000,
    },
    {
      id: 'ORD-001232',
      date: '2024.12.05',
      status: '배송 준비',
      items: ['유기농 감자'],
      total: 12000,
    },
  ]

  const favoriteProducts = [
    {
      id: 1,
      name: '유기농 방울토마토',
      price: 8500,
      image: '/fresh-organic-cherry-tomatoes.jpg',
      rating: 4.8,
    },
    {
      id: 2,
      name: '무농약 상추',
      price: 5000,
      image: '/fresh-organic-lettuce.png',
      rating: 4.9,
    },
  ]

  const handleSaveAddress = (addressData: Omit<import('@/lib/api/types').Address, 'id'>) => {
    if (editingAddressId) {
      updateAddress(editingAddressId, addressData)
      toast({
        title: '배송지가 수정되었습니다',
      })
    } else {
      addAddress(addressData)
      toast({
        title: '배송지가 추가되었습니다',
      })
    }
    setEditingAddressId(null)
    setIsAddressDialogOpen(false)
  }

  const handleEditAddress = (id: number) => {
    setEditingAddressId(id)
    setIsAddressDialogOpen(true)
  }

  const handleDeleteAddress = (id: number) => {
    deleteAddress(id)
    toast({
      title: '배송지가 삭제되었습니다',
    })
  }

  const handleSetDefaultAddress = (id: number) => {
    setDefaultAddress(id)
    toast({
      title: '기본 배송지로 설정되었습니다',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '배송 완료':
        return <Badge variant="secondary">배송 완료</Badge>
      case '배송 중':
        return <Badge variant="default">배송 중</Badge>
      case '배송 준비':
        return <Badge variant="outline">배송 준비</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
          <p className="text-muted-foreground">내 정보와 주문 내역을 관리하세요</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="orders">주문 내역</TabsTrigger>
            <TabsTrigger value="favorites">찜한 상품</TabsTrigger>
            <TabsTrigger value="role">역할 관리</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Profile Card */}
            <Card className="p-6">
              <div className="flex items-start gap-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={user.avatar || '/placeholder.svg'}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>가입일: {user.joinDate}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Card>
                )
              })}
            </div>

            {/* Recent Orders */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">최근 주문</h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                  전체보기
                </Button>
              </div>
              <div className="space-y-4">
                {recentOrders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/order/${order.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold">{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">{order.items.join(', ')}</div>
                      <div className="text-sm text-muted-foreground">{order.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{order.total.toLocaleString()}원</div>
                      <Button variant="ghost" size="sm" className="mt-2">
                        상세보기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">주문 내역</h2>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/order/${order.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold">주문번호: {order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {order.items.join(', ')}
                      </div>
                      <div className="text-sm text-muted-foreground">{order.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg mb-2">
                        {order.total.toLocaleString()}원
                      </div>
                      <Button variant="outline" size="sm">
                        상세보기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Role Management Tab */}
          <TabsContent value="role" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">역할 관리</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">구매자</h3>
                      {user.role === 'BUYER' && <Badge variant="default">현재 역할</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      농산물을 구매하고 농장 체험을 예약할 수 있습니다.
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 상품 구매 및 주문 관리</li>
                      <li>• 체험 예약</li>
                      <li>• 리뷰 작성</li>
                      <li>• 찜하기 및 장바구니</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Store className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">판매자 (농가)</h3>
                      {user.role === 'SELLER' && <Badge variant="default">현재 역할</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      농산물을 판매하고 농장 체험 프로그램을 운영할 수 있습니다.
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                      <li>• 상품 등록 및 판매</li>
                      <li>• 체험 프로그램 등록</li>
                      <li>• 주문 및 예약 관리</li>
                      <li>• 농장 정보 관리</li>
                      <li>• 매출 및 정산 관리</li>
                    </ul>
                    {user.role === 'BUYER' && (
                      <Dialog open={isSellerDialogOpen} onOpenChange={setIsSellerDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Store className="h-4 w-4 mr-2" />
                            판매자로 전환
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>판매자 전환 신청</DialogTitle>
                            <DialogDescription>
                              농장 정보를 입력하고 판매자 계정으로 전환하세요
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="farmName">농장명 *</Label>
                              <Input
                                id="farmName"
                                placeholder="햇살농장"
                                value={sellerApplication.farmName}
                                onChange={(e) =>
                                  setSellerApplication({
                                    ...sellerApplication,
                                    farmName: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="farmAddress">농장 주소 *</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="farmAddress"
                                  placeholder="경기도 양평군 양평읍 농장길 123"
                                  value={sellerApplication.farmAddress}
                                  onChange={(e) =>
                                    setSellerApplication({
                                      ...sellerApplication,
                                      farmAddress: e.target.value,
                                    })
                                  }
                                  required
                                />
                                <Button variant="outline" type="button">
                                  주소 검색
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="farmDescription">농장 소개</Label>
                              <Textarea
                                id="farmDescription"
                                placeholder="농장에 대한 간단한 소개를 작성해주세요"
                                value={sellerApplication.farmDescription}
                                onChange={(e) =>
                                  setSellerApplication({
                                    ...sellerApplication,
                                    farmDescription: e.target.value,
                                  })
                                }
                                rows={4}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="businessNumber">사업자 등록번호 (선택)</Label>
                              <Input
                                id="businessNumber"
                                placeholder="123-45-67890"
                                value={sellerApplication.businessNumber}
                                onChange={(e) =>
                                  setSellerApplication({
                                    ...sellerApplication,
                                    businessNumber: e.target.value,
                                  })
                                }
                              />
                              <p className="text-sm text-muted-foreground">
                                사업자 등록번호가 있으면 입력해주세요. 없어도 신청 가능합니다.
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsSellerDialogOpen(false)}>
                              취소
                            </Button>
                            <Button onClick={handleSellerApplication}>신청하기</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    {user.role === 'SELLER' && (
                      <div className="flex gap-2">
                        <Button asChild>
                          <Link href="/farmer/dashboard">판매자 대시보드로 이동</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">안내사항</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 판매자 전환 신청 후 검토가 진행됩니다.</li>
                    <li>• 승인까지 1-3 영업일이 소요될 수 있습니다.</li>
                    <li>• 판매자로 전환하더라도 구매자 기능은 계속 사용할 수 있습니다.</li>
                    <li>• 판매자 계정은 농장 정보 검증 후 활성화됩니다.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
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
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Profile Settings */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">프로필 정보</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input id="name" defaultValue={user.name} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" type="email" defaultValue={user.email} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">전화번호</Label>
                  <Input id="phone" defaultValue={user.phone} className="mt-1" />
                </div>
                <Button>저장</Button>
              </div>
            </Card>

            {/* Delivery Addresses */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">배송지 관리</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAddressId(null)
                    setIsAddressDialogOpen(true)
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  배송지 추가
                </Button>
              </div>
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    등록된 배송지가 없습니다
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 border rounded-lg flex items-start justify-between hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{address.name}</span>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              기본 배송지
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>{address.phone}</div>
                          <div>
                            [{address.zipCode}] {address.address} {address.detailAddress}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!address.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefaultAddress(address.id)}
                          >
                            기본 설정
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAddress(address.id)}
                        >
                          수정
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Payment Methods */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">결제 수단</h2>
                <Button variant="outline" size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  결제 수단 추가
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                등록된 결제 수단이 없습니다
              </div>
            </Card>

            {/* Account Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">계정 관리</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  비밀번호 변경
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 배송지 추가/수정 다이얼로그 */}
        <AddressDialog
          open={isAddressDialogOpen}
          onOpenChange={setIsAddressDialogOpen}
          address={
            editingAddressId ? addresses.find((addr) => addr.id === editingAddressId) || null : null
          }
          onSave={handleSaveAddress}
        />
      </div>
    </div>
  )
}
