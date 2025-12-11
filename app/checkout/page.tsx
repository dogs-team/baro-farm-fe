'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Truck, Plus, Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { useCartStore } from '@/lib/cart-store'
import { useAddressStore } from '@/lib/address-store'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AddressDialog } from '@/components/address/address-dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getCheckoutItems, getCheckoutTotalPrice, clearBuyNowItems, restoreBuyNowItems } =
    useCartStore()
  const { addresses, selectedAddressId, addAddress, updateAddress, deleteAddress, selectAddress } =
    useAddressStore()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<number | null>(null)
  const [useSavedAddress, setUseSavedAddress] = useState(false)

  // 클라이언트에서만 마운트 확인 (Hydration 에러 방지)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 저장된 배송지가 있으면 기본으로 사용
  useEffect(() => {
    if (mounted && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0]
      if (defaultAddress) {
        selectAddress(defaultAddress.id)
        setUseSavedAddress(true)
        // 저장된 배송지 정보를 formData에 자동 입력
        setFormData((prev) => ({
          ...prev,
          name: defaultAddress.name,
          phone: defaultAddress.phone,
          zipCode: defaultAddress.zipCode,
          address: defaultAddress.address,
          addressDetail: defaultAddress.detailAddress,
        }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, addresses.length])

  // 선택된 배송지가 변경되면 formData 업데이트
  useEffect(() => {
    if (useSavedAddress && selectedAddressId) {
      const selected = addresses.find((addr) => addr.id === selectedAddressId)
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          name: selected.name,
          phone: selected.phone,
          zipCode: selected.zipCode,
          address: selected.address,
          addressDetail: selected.detailAddress,
        }))
      }
    }
  }, [selectedAddressId, useSavedAddress, addresses])

  // 체크아웃 페이지를 벗어날 때 원래 수량으로 복원
  useEffect(() => {
    return () => {
      // 컴포넌트가 unmount될 때 (페이지를 벗어날 때) 원래 수량으로 복원
      restoreBuyNowItems()
    }
  }, [restoreBuyNowItems])

  // 체크아웃 아이템이 없으면 장바구니로 리다이렉트 (렌더링 중 router.push 방지)
  useEffect(() => {
    if (mounted) {
      const checkoutItems = getCheckoutItems()
      // 아이템이 없고, 일반 장바구니 아이템도 없으면 리다이렉트
      if (checkoutItems.length === 0 && items.length === 0) {
        router.push('/cart')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, router, items.length])

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    addressDetail: '',
    zipCode: '',
    deliveryNote: '',
    paymentMethod: 'card',
  })

  // 체크아웃에 표시할 아이템과 총 가격 (클라이언트에서만 계산)
  const checkoutItems = mounted ? getCheckoutItems() : []
  const totalPrice = mounted ? getCheckoutTotalPrice() : 0
  const deliveryFee = checkoutItems.length > 0 ? 3000 : 0
  const finalPrice = totalPrice + deliveryFee

  // 디버깅 로그
  useEffect(() => {
    if (mounted) {
      console.log('[CheckoutPage] State:', {
        allItems: items.map((i) => ({ id: i.id, quantity: i.quantity, isBuyNow: i.isBuyNow })),
        checkoutItems: checkoutItems.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          isBuyNow: i.isBuyNow,
        })),
        totalPrice,
        finalPrice,
      })
    }
  }, [mounted, items, checkoutItems, totalPrice, finalPrice])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // 직접 입력 시 저장된 배송지 사용 해제
    if (useSavedAddress) {
      setUseSavedAddress(false)
      selectAddress(null)
    }
  }

  const handleSaveAddress = (addressData: Omit<import('@/lib/api/types').Address, 'id'>) => {
    if (editingAddress) {
      updateAddress(editingAddress, addressData)
      toast({
        title: '배송지가 수정되었습니다',
      })
    } else {
      addAddress(addressData)
      toast({
        title: '배송지가 추가되었습니다',
      })
    }
    setEditingAddress(null)
  }

  const handleEditAddress = (id: number) => {
    setEditingAddress(id)
    setIsAddressDialogOpen(true)
  }

  const handleDeleteAddress = (id: number) => {
    deleteAddress(id)
    toast({
      title: '배송지가 삭제되었습니다',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (checkoutItems.length === 0) {
      toast({
        title: '장바구니가 비어있습니다',
        description: '상품을 장바구니에 담아주세요.',
        variant: 'destructive',
      })
      router.push('/cart')
      return
    }

    setIsProcessing(true)

    try {
      // TODO: Implement actual order processing with backend API
      console.log('[v0] Processing order:', {
        items: checkoutItems,
        formData,
        totalPrice: finalPrice,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 바로 구매로 추가된 아이템만 제거 (일반 장바구니 아이템은 유지)
      clearBuyNowItems()

      toast({
        title: '주문이 완료되었습니다',
        description: `총 ${finalPrice.toLocaleString()}원이 결제되었습니다.`,
      })

      router.push('/order/success')
    } catch {
      toast({
        title: '주문 실패',
        description: '주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // 체크아웃 아이템이 없으면 로딩 표시 (useEffect에서 리다이렉트 처리)
  if (!mounted || checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showCart />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">주문/결제</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Info */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">배송 정보</h2>
                  </div>
                  {addresses.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUseSavedAddress(!useSavedAddress)
                        if (!useSavedAddress && selectedAddressId) {
                          const selected = addresses.find((addr) => addr.id === selectedAddressId)
                          if (selected) {
                            setFormData((prev) => ({
                              ...prev,
                              name: selected.name,
                              phone: selected.phone,
                              zipCode: selected.zipCode,
                              address: selected.address,
                              addressDetail: selected.detailAddress,
                            }))
                          }
                        }
                      }}
                    >
                      {useSavedAddress ? '직접 입력' : '저장된 배송지 사용'}
                    </Button>
                  )}
                </div>

                {useSavedAddress && addresses.length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label>배송지 선택</Label>
                      <RadioGroup
                        value={selectedAddressId?.toString() || ''}
                        onValueChange={(value) => {
                          selectAddress(parseInt(value, 10))
                        }}
                      >
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50"
                          >
                            <RadioGroupItem
                              value={address.id.toString()}
                              id={`address-${address.id}`}
                              className="mt-1"
                            />
                            <Label
                              htmlFor={`address-${address.id}`}
                              className="flex-1 cursor-pointer space-y-1"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{address.name}</span>
                                {address.isDefault && (
                                  <Badge variant="secondary" className="text-xs">
                                    기본
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <div>{address.phone}</div>
                                <div>
                                  [{address.zipCode}] {address.address} {address.detailAddress}
                                </div>
                              </div>
                            </Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditAddress(address.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setEditingAddress(null)
                        setIsAddressDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      배송지 추가
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">받는 분 이름</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
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
                          onChange={(e) => handleInputChange('phone', e.target.value)}
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
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="md:col-span-1 space-y-2">
                        <Label htmlFor="zipCode">우편번호</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          required
                        />
                      </div>
                      <div className="md:col-span-3 flex items-end">
                        <Button type="button" variant="outline">
                          주소 검색
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">주소</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressDetail">상세 주소</Label>
                      <Input
                        id="addressDetail"
                        value={formData.addressDetail}
                        onChange={(e) => handleInputChange('addressDetail', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryNote">배송 메모 (선택)</Label>
                      <Input
                        id="deliveryNote"
                        placeholder="배송 시 요청사항을 입력해주세요"
                        value={formData.deliveryNote}
                        onChange={(e) => handleInputChange('deliveryNote', e.target.value)}
                      />
                    </div>
                    {addresses.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setEditingAddress(null)
                          setIsAddressDialogOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />이 주소를 배송지로 저장
                      </Button>
                    )}
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
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">신용/체크카드</SelectItem>
                    <SelectItem value="transfer">계좌이체</SelectItem>
                    <SelectItem value="phone">휴대폰 결제</SelectItem>
                    <SelectItem value="kakao">카카오페이</SelectItem>
                    <SelectItem value="naver">네이버페이</SelectItem>
                  </SelectContent>
                </Select>
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
                        <h4 className="text-sm font-medium truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.farm}</p>
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

                <Button type="submit" className="w-full" disabled={isProcessing}>
                  {isProcessing ? '처리 중...' : `${finalPrice.toLocaleString()}원 결제하기`}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  주문 완료 시 개인정보 처리방침 및 이용약관에 동의한 것으로 간주합니다.
                </p>
              </Card>
            </div>
          </div>
        </form>

        {/* 배송지 추가/수정 다이얼로그 */}
        <AddressDialog
          open={isAddressDialogOpen}
          onOpenChange={setIsAddressDialogOpen}
          address={
            editingAddress ? addresses.find((addr) => addr.id === editingAddress) || null : null
          }
          onSave={handleSaveAddress}
        />
      </div>
    </div>
  )
}
