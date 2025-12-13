'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Truck, Plus, Edit, Trash2, Wallet } from 'lucide-react'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { useCartStore } from '@/lib/cart-store'
import { useAddressStore } from '@/lib/address-store'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { orderService } from '@/lib/api/services/order'
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
import { Checkbox } from '@/components/ui/checkbox'

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
  const [depositBalance, setDepositBalance] = useState<number | null>(null)
  const [tossWidget, setTossWidget] = useState<
    import('@/types/toss-payments').TossPaymentsInstance | null
  >(null)

  // 클라이언트에서만 마운트 확인 (Hydration 에러 방지)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 예치금 잔액 조회
  useEffect(() => {
    const fetchDepositBalance = async () => {
      try {
        // TODO: API 연동 - 예치금 조회 API 호출
        // const response = await userService.getDepositBalance()
        // setDepositBalance(response.balance)

        // 임시 데이터 (API 연동 전까지)
        setDepositBalance(50000)
      } catch (error) {
        console.error('예치금 조회 실패:', error)
        setDepositBalance(0)
      }
    }

    if (mounted) {
      fetchDepositBalance()
    }
  }, [mounted])

  // 토스페이먼츠 위젯 로드
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const loadTossWidget = () => {
        try {
          // 토스페이먼츠 위젯 스크립트가 이미 로드되어 있는지 확인
          if (window.TossPayments) {
            // 클라이언트 키는 환경 변수에서 가져오거나 테스트 키 사용
            const clientKey =
              process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
            if (!clientKey) {
              console.error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다.')
              return
            }
            const widget = window.TossPayments(clientKey)
            if (widget && typeof widget.requestPayment === 'function') {
              setTossWidget(widget)
              console.log('토스페이먼츠 위젯 초기화 완료')
            } else {
              console.error('토스페이먼츠 위젯 초기화 실패: requestPayment 함수가 없습니다.')
            }
          } else {
            // 토스페이먼츠 위젯 스크립트 로드
            const script = document.createElement('script')
            script.src = 'https://js.tosspayments.com/v1/payment'
            script.async = true
            script.onload = () => {
              // 스크립트 로드 후 약간의 지연을 두고 위젯 초기화
              setTimeout(() => {
                try {
                  const clientKey =
                    process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ||
                    'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
                  if (!clientKey) {
                    console.error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다.')
                    return
                  }
                  if (window.TossPayments) {
                    const widget = window.TossPayments(clientKey)
                    if (widget && typeof widget.requestPayment === 'function') {
                      setTossWidget(widget)
                      console.log('토스페이먼츠 위젯 초기화 완료')
                    } else {
                      console.error(
                        '토스페이먼츠 위젯 초기화 실패: requestPayment 함수가 없습니다.'
                      )
                    }
                  } else {
                    console.error(
                      '토스페이먼츠 스크립트 로드 후 TossPayments 객체를 찾을 수 없습니다.'
                    )
                  }
                } catch (error) {
                  console.error('토스페이먼츠 위젯 초기화 중 오류:', error)
                }
              }, 100)
            }
            script.onerror = () => {
              console.error('토스페이먼츠 스크립트 로드 실패')
            }
            document.body.appendChild(script)
          }
        } catch (error) {
          console.error('토스페이먼츠 위젯 로드 중 오류:', error)
        }
      }

      loadTossWidget()
    }
  }, [mounted])

  // 저장된 배송지가 있으면 기본으로 체크 (하지만 자동 입력은 하지 않음)
  useEffect(() => {
    if (mounted && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0]
      if (defaultAddress) {
        selectAddress(defaultAddress.id)
        // 기본 배송지 사용 여부는 사용자가 선택하도록 함
        setUseSavedAddress(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, addresses.length])

  // 기본 배송지 사용 체크 시 formData 업데이트
  useEffect(() => {
    if (useSavedAddress && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0]
      if (defaultAddress) {
        selectAddress(defaultAddress.id)
        setFormData((prev) => ({
          ...prev,
          name: defaultAddress.name,
          phone: defaultAddress.phone,
          zipCode: defaultAddress.zipCode,
          address: defaultAddress.address,
          addressDetail: defaultAddress.detailAddress,
        }))
      }
    } else if (!useSavedAddress) {
      // 체크 해제 시 주소 정보 초기화
      setFormData((prev) => ({
        ...prev,
        name: '',
        phone: '',
        zipCode: '',
        address: '',
        addressDetail: '',
      }))
    }
  }, [useSavedAddress, addresses])

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
    paymentMethod: 'deposit', // 기본값을 예치금으로 설정
  })

  // 체크아웃에 표시할 아이템과 총 가격 (클라이언트에서만 계산)
  const checkoutItems = mounted ? getCheckoutItems() : []
  const totalPrice = mounted ? getCheckoutTotalPrice() : 0
  const deliveryFee = 0 // 무료 배송
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

    // 예치금 결제 처리
    if (formData.paymentMethod === 'deposit') {
      if (depositBalance === null || depositBalance < finalPrice) {
        toast({
          title: '예치금 부족',
          description: '예치금이 부족합니다. 토스결제를 이용해주세요.',
          variant: 'destructive',
        })
        return
      }

      setIsProcessing(true)

      try {
        // TODO: Implement actual order processing with backend API
        console.log('[v0] Processing order with deposit:', {
          items: checkoutItems,
          formData,
          totalPrice: finalPrice,
          paymentMethod: 'deposit',
        })

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // 바로 구매로 추가된 아이템만 제거 (일반 장바구니 아이템은 유지)
        clearBuyNowItems()

        toast({
          title: '주문이 완료되었습니다',
          description: `총 ${finalPrice.toLocaleString()}원이 예치금으로 결제되었습니다.`,
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
      return
    }

    // 토스결제 처리
    if (formData.paymentMethod === 'toss') {
      if (!tossWidget) {
        toast({
          title: '결제 위젯 로딩 중',
          description: '결제 위젯을 불러오는 중입니다. 잠시 후 다시 시도해주세요.',
          variant: 'destructive',
        })
        return
      }

      setIsProcessing(true)

      try {
        // 1. 서버에서 주문 생성 (API 개별 연동 방식)
        // 주문 생성이 실패할 수 있으므로 try-catch로 처리
        let orderId: string
        let orderName: string

        try {
          const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0]
          const orderResponse = await orderService.createOrder({
            items: checkoutItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
            shippingAddressId: useSavedAddress && defaultAddress ? defaultAddress.id : 0, // TODO: 직접 입력 시 주소 저장 후 ID 사용
            paymentMethod: 'toss',
          })

          orderId = orderResponse.orderNumber || `ORDER-${orderResponse.id}`
          orderName =
            checkoutItems.length === 1
              ? checkoutItems[0].name
              : `${checkoutItems[0].name} 외 ${checkoutItems.length - 1}개`
        } catch (orderError: any) {
          console.error('주문 생성 실패:', orderError)
          // 주문 생성 실패 시 임시 주문 ID 생성 (테스트용)
          orderId = `ORDER-${Date.now()}`
          orderName =
            checkoutItems.length === 1
              ? checkoutItems[0].name
              : `${checkoutItems[0].name} 외 ${checkoutItems.length - 1}개`

          toast({
            title: '주문 생성 실패',
            description: '주문 생성 중 오류가 발생했습니다. 테스트 모드로 진행합니다.',
            variant: 'destructive',
          })
        }

        // 2. 토스페이먼츠 결제 위젯 열기 (클라이언트 키 사용)
        // 결제 성공 시 paymentKey와 orderId를 받아서 서버로 전달
        if (!tossWidget) {
          throw new Error(
            '토스페이먼츠 위젯이 초기화되지 않았습니다. 페이지를 새로고침 후 다시 시도해주세요.'
          )
        }

        if (typeof tossWidget.requestPayment !== 'function') {
          throw new Error('토스페이먼츠 위젯의 requestPayment 함수를 사용할 수 없습니다.')
        }

        // 토스페이먼츠 결제 위젯 열기 (예시 HTML 참고)
        // successUrl과 failUrl은 절대 경로여야 하며, 토스페이먼츠가 자동으로 paymentKey 등을 추가합니다
        const baseUrl = window.location.origin
        const successUrl = `${baseUrl}/order/success`
        const failUrl = `${baseUrl}/order/fail`

        console.log('토스페이먼츠 결제 요청:', {
          method: '간편결제',
          orderId,
          amount: finalPrice,
          orderName,
          successUrl,
          failUrl,
        })

        await tossWidget.requestPayment('간편결제', {
          company: '토스페이',
          orderId: orderId,
          amount: finalPrice,
          orderName: orderName,
          customerName: formData.name || '고객',
          successUrl: successUrl,
          failUrl: failUrl,
        })

        // 결제 성공 시 successUrl로 리다이렉트되므로 여기서는 처리하지 않음
        // 바로 구매로 추가된 아이템만 제거 (일반 장바구니 아이템은 유지)
        clearBuyNowItems()
      } catch (error: any) {
        console.error('토스 결제 실패:', error)

        // 사용자가 결제를 취소한 경우
        if (error.code === 'USER_CANCEL' || error.message?.includes('취소')) {
          toast({
            title: '결제가 취소되었습니다',
            description: '결제를 취소하셨습니다.',
          })
        } else if (error.message?.includes('위젯')) {
          toast({
            title: '결제 위젯 오류',
            description:
              '결제 위젯을 불러오는 중 오류가 발생했습니다. 페이지를 새로고침 후 다시 시도해주세요.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: '결제 실패',
            description:
              error.message ||
              error.toString() ||
              '결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
            variant: 'destructive',
          })
        }
        setIsProcessing(false)
      }
      return
    }

    // 기타 결제 수단 (현재는 사용하지 않음)
    toast({
      title: '지원하지 않는 결제 수단',
      description: '예치금 또는 토스결제를 선택해주세요.',
      variant: 'destructive',
    })
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
                      onCheckedChange={(checked) => {
                        setUseSavedAddress(checked === true)
                      }}
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
                            onClick={() => handleEditAddress(address.id)}
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
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            // 다음 주소 API 호출
                            if (typeof window !== 'undefined' && (window as any).daum?.Postcode) {
                              new (window as any).daum.Postcode({
                                oncomplete: (data: any) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    zipCode: data.zonecode,
                                    address: data.address,
                                  }))
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
                                    setFormData((prev) => ({
                                      ...prev,
                                      zipCode: data.zonecode,
                                      address: data.address,
                                    }))
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
                    <SelectItem value="deposit">예치금</SelectItem>
                    <SelectItem value="toss">토스결제</SelectItem>
                  </SelectContent>
                </Select>

                {/* 예치금 잔액 표시 */}
                {formData.paymentMethod === 'deposit' && depositBalance !== null && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">예치금 잔액</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {depositBalance.toLocaleString()}원
                    </div>
                    {depositBalance < finalPrice && (
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

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isProcessing}
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
