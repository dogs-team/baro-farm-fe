'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Truck, Edit, Wallet } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AddressDialog } from '@/components/address/address-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import type { Address } from '@/lib/api/types'

export interface CheckoutItem {
  id: number
  productId: string
  sellerId: string
  name: string
  price: number
  image: string
  farm: string
  quantity: number
  options?: string
  isBuyNow?: boolean
}

export interface CheckoutViewProps {
  // Form Data
  formData: {
    name: string
    phone: string
    email: string
    address: string
    addressDetail: string
    zipCode: string
    deliveryNote: string
    paymentMethod: string
  }
  onInputChange: (field: string, value: string) => void

  // Address
  addresses: Address[]
  useSavedAddress: boolean
  onUseSavedAddressChange: (checked: boolean) => void
  isAddressDialogOpen: boolean
  onAddressDialogOpenChange: (open: boolean) => void
  editingAddress: number | null
  onEditAddress: (id: number) => void
  onSaveAddress: (addressData: Omit<Address, 'id'>) => void

  // Checkout Items
  checkoutItems: CheckoutItem[]
  totalPrice: number
  deliveryFee: number
  finalPrice: number

  // Payment
  depositBalance: number | null
  isDepositSelected: boolean
  isDepositInsufficient: boolean
  isProcessing: boolean
  onSubmit: (e: React.FormEvent) => void
  isMockCheckout?: boolean
}

type RecipeRecommendation = {
  name: string
  description: string
  cookTime: string
  difficulty: string
  ingredients: string[]
}

type AddOnRecommendation = {
  id: string
  name: string
  price: number
  image: string
  reason: string
}

const RECOMMENDATIONS_TIMEOUT_MS = 3000
const SAMPLE_PRODUCT_ID = 'c33e13c9-43d2-4b50-8630-3e9605a0b63b'

const FALLBACK_RECIPE: RecipeRecommendation = {
  name: '딸기 요거트 볼',
  description: '장바구니 구성에 맞춰 간단히 만들 수 있는 상큼한 디저트 레시피입니다.',
  cookTime: '10분',
  difficulty: '쉬움',
  ingredients: ['딸기', '그릭요거트', '견과류', '꿀'],
}

const FALLBACK_ADDONS: AddOnRecommendation[] = [
  {
    id: SAMPLE_PRODUCT_ID,
    name: '그릭요거트',
    price: 6800,
    image: '/images/strawberries.png',
    reason: '딸기와 잘 어울리는 베이스 재료',
  },
  {
    id: SAMPLE_PRODUCT_ID,
    name: '국산 꿀',
    price: 12000,
    image: '/fresh-organic-cherry-tomatoes.jpg',
    reason: '디저트 풍미를 높여주는 자연 감미료',
  },
  {
    id: SAMPLE_PRODUCT_ID,
    name: '견과류 믹스',
    price: 9800,
    image: '/fresh-organic-lettuce.png',
    reason: '식감을 살려주는 토핑 추천',
  },
  {
    id: SAMPLE_PRODUCT_ID,
    name: '생크림',
    price: 4500,
    image: '/fresh-organic-potatoes.jpg',
    reason: '디저트와 궁합이 좋은 추가 재료',
  },
]

export function CheckoutView({
  formData,
  onInputChange,
  addresses,
  useSavedAddress,
  onUseSavedAddressChange,
  isAddressDialogOpen,
  onAddressDialogOpenChange,
  editingAddress,
  onEditAddress,
  onSaveAddress,
  checkoutItems,
  totalPrice,
  deliveryFee,
  finalPrice,
  depositBalance,
  isDepositSelected,
  isDepositInsufficient,
  isProcessing,
  onSubmit,
  isMockCheckout,
}: CheckoutViewProps) {
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false)
  const [recipeRecommendation, setRecipeRecommendation] = useState<RecipeRecommendation | null>(
    null
  )
  const [addOnRecommendations, setAddOnRecommendations] = useState<AddOnRecommendation[]>([])

  useEffect(() => {
    if (!showRecommendations) return

    const fetchRecommendations = async () => {
      setIsRecommendationsLoading(true)
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), RECOMMENDATIONS_TIMEOUT_MS)

        const payload = {
          items: checkoutItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        }

        const response = await fetch('/api/recommendations/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error('Failed to load checkout recommendations')
        }

        const data = await response.json()
        const recipe = data?.recipe || data?.data?.recipe
        const addons = data?.addons || data?.data?.addons || data?.products || data?.data?.products

        const normalizedRecipe: RecipeRecommendation | null = recipe
          ? {
              name: recipe.name || recipe.recipeName || FALLBACK_RECIPE.name,
              description: recipe.description || FALLBACK_RECIPE.description,
              cookTime: recipe.cookTime || FALLBACK_RECIPE.cookTime,
              difficulty: recipe.difficulty || FALLBACK_RECIPE.difficulty,
              ingredients: Array.isArray(recipe.ingredients)
                ? recipe.ingredients
                : FALLBACK_RECIPE.ingredients,
            }
          : null

        const normalizedAddons: AddOnRecommendation[] = Array.isArray(addons)
          ? addons.slice(0, 5).map((item: any) => ({
              id: String(item.productId || item.id || SAMPLE_PRODUCT_ID),
              name: item.productName || item.name || '추천 상품',
              price: Number(item.price) || 0,
              image: item.imageUrl || item.image || '/placeholder.svg',
              reason: item.reason || '장바구니 구성과 잘 어울리는 상품',
            }))
          : []

        if (!normalizedRecipe && normalizedAddons.length === 0) {
          throw new Error('Empty recommendations')
        }

        setRecipeRecommendation(normalizedRecipe || FALLBACK_RECIPE)
        setAddOnRecommendations(normalizedAddons.length > 0 ? normalizedAddons : FALLBACK_ADDONS)
      } catch (error) {
        console.warn('[Checkout] Fallback recommendations used:', error)
        setRecipeRecommendation(FALLBACK_RECIPE)
        setAddOnRecommendations(FALLBACK_ADDONS)
      } finally {
        setIsRecommendationsLoading(false)
      }
    }

    fetchRecommendations()
  }, [checkoutItems, showRecommendations])

  return (
    <div className="min-h-screen bg-background">
      <Header showCart />

      <div className="container mx-auto px-4 py-8">
        {isMockCheckout && (
          <Badge variant="secondary" className="mb-4 inline-flex">
            예시 데이터
          </Badge>
        )}
        <h1 className="text-3xl font-bold mb-8">주문/결제</h1>

        <form onSubmit={onSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Info */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">배송 정보</h2>
                </div>

                {/* 기본 배송지 사용 체크박스 */}
                {addresses.length > 0 && (
                  <div className="flex items-center space-x-2 mb-6 p-4 border rounded-lg">
                    <Checkbox
                      id="useSavedAddress"
                      checked={useSavedAddress}
                      onCheckedChange={(checked) => onUseSavedAddressChange(checked === true)}
                    />
                    <Label htmlFor="useSavedAddress" className="cursor-pointer flex-1">
                      기본 배송지 사용
                    </Label>
                  </div>
                )}

                {useSavedAddress && addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{address.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                기본 배송지
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>{address.phone}</div>
                              <div>
                                [{address.zipCode}] {address.address} {address.detailAddress}
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (address.id != null) {
                                onEditAddress(address.id)
                              }
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">받는 분 이름</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => onInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">휴대폰 번호</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="010-1234-5678"
                          value={formData.phone}
                          onChange={(e) => onInputChange('phone', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">이메일</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={(e) => onInputChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="md:col-span-1 space-y-2">
                        <Label htmlFor="zipCode">우편번호</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => onInputChange('zipCode', e.target.value)}
                          required
                        />
                      </div>
                      <div className="md:col-span-3 flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            // 다음 주소 API 호출
                            if (typeof window !== 'undefined' && (window as any).daum?.Postcode) {
                              new (window as any).daum.Postcode({
                                oncomplete: (data: any) => {
                                  onInputChange('zipCode', data.zonecode)
                                  onInputChange('address', data.address)
                                },
                              }).open()
                            } else {
                              // 다음 주소 API 스크립트 동적 로드
                              const script = document.createElement('script')
                              script.src =
                                'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
                              script.onload = () => {
                                new (window as any).daum.Postcode({
                                  oncomplete: (data: any) => {
                                    onInputChange('zipCode', data.zonecode)
                                    onInputChange('address', data.address)
                                  },
                                }).open()
                              }
                              document.body.appendChild(script)
                            }
                          }}
                        >
                          주소 검색
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">주소</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => onInputChange('address', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressDetail">상세 주소</Label>
                      <Input
                        id="addressDetail"
                        value={formData.addressDetail}
                        onChange={(e) => onInputChange('addressDetail', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryNote">배송 메모 (선택)</Label>
                      <Input
                        id="deliveryNote"
                        placeholder="배송 시 요청사항을 입력해주세요"
                        value={formData.deliveryNote}
                        onChange={(e) => onInputChange('deliveryNote', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Payment Method */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">결제 수단</h2>
                </div>

                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => onInputChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">예치금</SelectItem>
                    <SelectItem value="toss">토스결제</SelectItem>
                  </SelectContent>
                </Select>

                {/* 예치금 잔액 표시 */}
                {isDepositSelected && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">예치금 잔액</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {(depositBalance ?? 0).toLocaleString()}원
                    </div>
                    {isDepositInsufficient && (
                      <p className="text-sm text-destructive mt-2">
                        예치금이 부족합니다. 토스결제를 이용해주세요.
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">주문 상품</h2>

                <div className="space-y-3 mb-4 pb-4 border-b max-h-64 overflow-y-auto">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mt-1">
                          <h4 className="text-sm font-medium truncate">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.farm}</p>
                        </div>
                        {item.options && (
                          <p className="text-xs text-muted-foreground">
                            옵션:{' '}
                            {(() => {
                              try {
                                const parsed = JSON.parse(item.options)
                                return typeof parsed === 'string'
                                  ? parsed
                                  : typeof parsed === 'object'
                                    ? Object.entries(parsed)
                                        .map(([key, value]) => `${key}: ${value}`)
                                        .join(', ')
                                    : String(parsed)
                              } catch {
                                return item.options
                              }
                            })()}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">{item.quantity}개</span>
                          <span className="text-sm font-semibold">
                            {(item.price * item.quantity).toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-4 pb-4 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">상품 금액</span>
                    <span>{totalPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">배송비</span>
                    <span>{deliveryFee.toLocaleString()}원</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>총 결제 금액</span>
                  <span className="text-primary">{finalPrice.toLocaleString()}원</span>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setShowRecommendations(true)}
                  disabled={
                    isProcessing ||
                    (formData.paymentMethod === 'deposit' &&
                      (depositBalance == null || depositBalance < finalPrice))
                  }
                >
                  {isProcessing
                    ? '처리 중...'
                    : finalPrice > 0
                      ? formData.paymentMethod === 'deposit'
                        ? `${finalPrice.toLocaleString()}원 예치금 결제`
                        : `${finalPrice.toLocaleString()}원 토스결제`
                      : '결제하기'}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  주문 완료 시 개인정보 처리방침 및 이용약관에 동의한 것으로 간주합니다.
                </p>
              </Card>
            </div>
          </div>
        </form>

        {/* 배송지 추가/수정 다이얼로그 */}
        {showRecommendations && (
          <section className="mt-12">
            <div className="flex flex-col gap-2 mb-6">
              <h2 className="text-2xl font-bold">결제 전 추천</h2>
              <p className="text-sm text-muted-foreground">
                장바구니 내역을 기반으로 레시피와 추가 구매 상품을 추천해요.
              </p>
            </div>

            {isRecommendationsLoading ? (
              <div className="text-sm text-muted-foreground">추천 정보를 불러오는 중...</div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">오늘의 레시피</h3>
                    <Badge variant="secondary">AI 추천</Badge>
                  </div>
                  <h4 className="text-xl font-bold mb-2">
                    {recipeRecommendation?.name || FALLBACK_RECIPE.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {recipeRecommendation?.description || FALLBACK_RECIPE.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span>
                      조리 시간: {recipeRecommendation?.cookTime || FALLBACK_RECIPE.cookTime}
                    </span>
                    <span>
                      난이도: {recipeRecommendation?.difficulty || FALLBACK_RECIPE.difficulty}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold">추천 재료</h5>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      {(recipeRecommendation?.ingredients || FALLBACK_RECIPE.ingredients).map(
                        (ingredient) => (
                          <li key={ingredient}>{ingredient}</li>
                        )
                      )}
                    </ul>
                  </div>
                </Card>

                <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
                  {(addOnRecommendations.length > 0 ? addOnRecommendations : FALLBACK_ADDONS).map(
                    (item) => (
                      <Card key={`addon-${item.id}-${item.name}`} className="p-4">
                        <div className="flex gap-4">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={item.image || '/placeholder.svg'}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{item.name}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{item.reason}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-primary">
                                {item.price.toLocaleString()}원
                              </span>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/products/${item.id}`}>상품 보기</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        <AddressDialog
          open={isAddressDialogOpen}
          onOpenChange={onAddressDialogOpenChange}
          address={
            editingAddress ? addresses.find((addr) => addr.id === editingAddress) || null : null
          }
          onSave={onSaveAddress}
        />
      </div>
    </div>
  )
}
