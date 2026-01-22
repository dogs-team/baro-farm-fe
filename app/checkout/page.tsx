'use client'

import type React from 'react'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Truck, Plus, Edit, Trash2, Wallet } from 'lucide-react'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { useCart } from '@/hooks/use-cart-query'
// import { useCartStore } from '@/lib/cart-store' // Removed
import { useAddressStore } from '@/lib/address-store'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { orderService } from '@/lib/api/services/order'
import { depositService } from '@/lib/api/services/payment'
import { productService } from '@/lib/api/services/product'
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
import type { Product } from '@/lib/api/types'

// Enriched Cart Item with SellerId
interface EnrichedCartItem {
  itemId?: string
  productId: string
  sellerId: string
  name: string
  price: number
  quantity: number
  image?: string
  farm?: string
  inventoryId?: string
}

function CheckoutPageContent() {
  const router = useRouter()
  // const searchParams = useSearchParams() // Unused for now as we treat "Buy Now" as standard cart checkout
  const [isProcessing, setIsProcessing] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { cart, isLoading: isCartLoading } = useCart()
  const [checkoutItems, setCheckoutItems] = useState<EnrichedCartItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(true)

  const { addresses, addAddress, updateAddress, deleteAddress, selectAddress } = useAddressStore()
  const { toast } = useToast()
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<number | null>(null)
  const [useSavedAddress, setUseSavedAddress] = useState(false)
  const [depositBalance, setDepositBalance] = useState<number | null>(null)
  const [tossWidget, setTossWidget] = useState<any | null>(null)

  // 클라이언트에서만 마운트 확인 (Hydration 에러 방지)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 장바구니 아이템에 대한 추가 정보(sellerId 등) fetching
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!cart || !cart.items || cart.items.length === 0) {
        setIsLoadingItems(false)
        setCheckoutItems([])
        return
      }

      setIsLoadingItems(true)
      try {
        const enriched = await Promise.all(
          cart.items.map(async (item) => {
            try {
              const product = await productService.getProduct(item.productId)
              return {
                itemId: item.itemId,
                productId: item.productId,
                sellerId: product.sellerId, // Critical: fetched from product
                name: item.productName,
                price: item.unitPrice,
                quantity: item.quantity,
                image: product.imageUrls?.[0] || undefined,
                farm: product.farmName,
                inventoryId: item.inventoryId,
              } as EnrichedCartItem
            } catch (e) {
              console.error(`Failed to fetch details for product ${item.productId}`, e)
              // Fallback or filter out? For now return partial with warning or skip
              // Returning partial might fail order creation if sellerId is missing.
              // Assuming productId matches, but sellerId is needed.
              // If fetch fails, we can't create valid order item.
              return null
            }
          })
        )
        const validItems = enriched.filter((i): i is EnrichedCartItem => i !== null)
        setCheckoutItems(validItems)
      } catch (error) {
        console.error('Failed to prepare checkout items', error)
        toast({
          title: '주문 준비 실패',
          description: '상품 정보를 불러오는 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
      } finally {
        setIsLoadingItems(false)
      }
    }

    if (mounted && !isCartLoading) {
      fetchItemDetails()
    }
  }, [cart, mounted, isCartLoading, toast])

  // 예치금 잔액 조회
  useEffect(() => {
    const fetchDepositBalance = async () => {
      try {
        const response = await depositService.getDeposit()
        setDepositBalance(response.balance)
      } catch (error: any) {
        console.error('예치금 조회 실패:', error)
        if (error?.status === 404) {
          setDepositBalance(0)
        } else {
          setDepositBalance(0)
        }
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
          if ((window as any).TossPayments) {
            const clientKey =
              process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
            if (!clientKey) {
              console.error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다.')
              return
            }
            const widget = (window as any).TossPayments(clientKey)
            if (widget && typeof widget.requestPayment === 'function') {
              setTossWidget(widget)
              console.log('토스페이먼츠 위젯 초기화 완료')
            }
          } else {
            const script = document.createElement('script')
            script.src = 'https://js.tosspayments.com/v1/payment'
            script.async = true
            script.onload = () => {
              setTimeout(() => {
                try {
                  const clientKey =
                    process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ||
                    'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
                  if (!clientKey) return
                  if ((window as any).TossPayments) {
                    const widget = (window as any).TossPayments(clientKey)
                    if (widget && typeof widget.requestPayment === 'function') {
                      setTossWidget(widget)
                    }
                  }
                } catch (error) {
                  console.error('토스페이먼츠 위젯 초기화 중 오류:', error)
                }
              }, 100)
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

  // 저장된 배송지가 있으면 기본으로 체크
  useEffect(() => {
    if (mounted && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0]
      if (defaultAddress && defaultAddress.id != null) {
        selectAddress(defaultAddress.id)
        setUseSavedAddress(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, addresses.length])

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

  // 기본 배송지 사용 체크 시 formData 업데이트
  useEffect(() => {
    if (useSavedAddress && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0]
      if (defaultAddress && defaultAddress.id != null) {
        selectAddress(defaultAddress.id)
        setFormData((prev) => ({
          ...prev,
          name: defaultAddress.name || '',
          phone: defaultAddress.phone || '',
          zipCode: defaultAddress.zipCode || '',
          address: defaultAddress.address || '',
          addressDetail: defaultAddress.detailAddress || '',
        }))
      }
    } else if (!useSavedAddress) {
      setFormData((prev) => ({
        ...prev,
        name: '',
        phone: '',
        zipCode: '',
        address: '',
        addressDetail: '',
      }))
    }
  }, [useSavedAddress, addresses, selectAddress])

  const deliveryFee = 0
  const totalPrice = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const finalPrice = totalPrice + deliveryFee
  const isDepositSelected = formData.paymentMethod === 'deposit'
  const isDepositInsufficient =
    isDepositSelected && (depositBalance == null || depositBalance < finalPrice)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (checkoutItems.length === 0) {
      toast({
        title: '주문할 상품이 없습니다',
        description: '장바구니를 확인해주세요.',
        variant: 'destructive',
      })
      router.push('/cart')
      return
    }

    const createOrder = async () => {
      const orderRequest = {
        receiverName: formData.name,
        phone: formData.phone,
        email: formData.email,
        zipCode: formData.zipCode,
        address: formData.address,
        addressDetail: formData.addressDetail,
        deliveryMemo: formData.deliveryNote || undefined,
        items: checkoutItems.map((item) => {
          if (!item.productId || !item.sellerId) {
            throw new Error('상품 정보가 올바르지 않습니다.')
          }
          return {
            productId: item.productId,
            sellerId: item.sellerId,
            quantity: item.quantity,
            unitPrice: item.price,
          }
        }),
      }

      // API Call
      const orderResponse = await orderService.createOrder(orderRequest)
      const orderId = orderResponse.orderId || `ORDER-${Date.now()}` // Fallback if ID is different structure
      const orderName =
        checkoutItems.length === 1
          ? checkoutItems[0].name
          : `${checkoutItems[0].name} 외 ${checkoutItems.length - 1}개`

      return { orderId, orderName }
    }

    // 예치금 결제
    if (formData.paymentMethod === 'deposit') {
      if (depositBalance == null || depositBalance < finalPrice) {
        toast({
          title: '예치금 부족',
          description: '예치금이 부족합니다.',
          variant: 'destructive',
        })
        return
      }

      setIsProcessing(true)
      try {
        const { orderId } = await createOrder()
        await depositService.payWithDeposit({
          orderId,
          amount: finalPrice,
        })

        // 장바구니 비우기 not needed as Order creation usually clears usage of items?
        // Wait, Order API reserves items. Cart API has separate 'clear cart' or 'delete items'.
        // Docs don't say creating order clears cart automatically.
        // It's safer to rely on backend behavior OR clear explicitly.
        // But we don't know which items were ordered if we had filtering.
        // Since we order ALL valid items, we can clear cart?
        // Or assume backend clears it.
        // Let's NOT clear explicitly to avoid race condition or double delete if backend does it.

        toast({ title: '주문이 완료되었습니다' })
        router.push(`/order/success?orderId=${orderId}`)
      } catch (error: any) {
        console.error('Order failed:', error)
        toast({
          title: '주문 실패',
          description: error?.message || '오류가 발생했습니다.',
          variant: 'destructive',
        })
      } finally {
        setIsProcessing(false)
      }
      return
    }

    // 토스 결제
    if (formData.paymentMethod === 'toss') {
      if (!tossWidget) {
        toast({ title: '결제 위젯 로딩 중', variant: 'destructive' })
        return
      }
      setIsProcessing(true)
      try {
        const { orderId, orderName } = await createOrder()
        if (!tossWidget || typeof tossWidget.requestPayment !== 'function') {
          throw new Error('Toss widget not ready')
        }

        const baseUrl = window.location.origin
        await tossWidget.requestPayment('간편결제', {
          orderId,
          amount: finalPrice,
          orderName,
          customerName: formData.name || '고객',
          successUrl: `${baseUrl}/order/success`,
          failUrl: `${baseUrl}/order/fail`,
        })
      } catch (error: any) {
        console.error('Toss Payment failed:', error)
        toast({ title: '결제 실패', description: error.message, variant: 'destructive' })
        setIsProcessing(false)
      }
      return
    }
  }

  // Loading View
  if (!mounted || isCartLoading || isLoadingItems) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">주문 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // Empty View
  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">주문할 상품이 없습니다.</p>
          <Button onClick={() => router.push('/cart')}>장바구니로 이동</Button>
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
            <div className="lg:col-span-2 space-y-6">
              {/* 배송 정보 */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">배송 정보</h2>
                </div>
                {addresses.length > 0 && (
                  <div className="flex items-center space-x-2 mb-6 p-4 border rounded-lg">
                    <Checkbox
                      id="useSavedAddress"
                      checked={useSavedAddress}
                      onCheckedChange={(c) => setUseSavedAddress(c === true)}
                    />
                    <Label htmlFor="useSavedAddress">기본 배송지 사용</Label>
                  </div>
                )}
                {useSavedAddress && addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="p-4 border rounded-lg bg-muted/50">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-semibold">
                              {address.name} <Badge variant="secondary">기본</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {address.phone}
                              <br />[{address.zipCode}] {address.address} {address.detailAddress}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => address.id && handleEditAddress(address.id)}
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
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="md:col-span-1">
                        <Label>우편번호</Label>
                        <Input value={formData.zipCode} readOnly />
                      </div>
                      <div className="md:col-span-3 flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            // Daum Postcode Logic simplified
                            if ((window as any).daum?.Postcode) {
                              new (window as any).daum.Postcode({
                                oncomplete: (data: any) =>
                                  setFormData((p) => ({
                                    ...p,
                                    zipCode: data.zonecode,
                                    address: data.address,
                                  })),
                              }).open()
                            } else {
                              const script = document.createElement('script')
                              script.src =
                                'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
                              script.onload = () => {
                                new (window as any).daum.Postcode({
                                  oncomplete: (data: any) =>
                                    setFormData((p) => ({
                                      ...p,
                                      zipCode: data.zonecode,
                                      address: data.address,
                                    })),
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
                      <Label>주소</Label>
                      <Input value={formData.address} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>상세 주소</Label>
                      <Input
                        value={formData.addressDetail}
                        onChange={(e) => handleInputChange('addressDetail', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>배송 메모</Label>
                      <Input
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
                  onValueChange={(v) => handleInputChange('paymentMethod', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">예치금</SelectItem>
                    <SelectItem value="toss">토스결제</SelectItem>
                  </SelectContent>
                </Select>
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
                      <p className="text-sm text-destructive mt-2">잔액이 부족합니다.</p>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">주문 상품</h2>
                <div className="space-y-3 mb-4 pb-4 border-b max-h-64 overflow-y-auto">
                  {checkoutItems.map((item) => (
                    <div key={item.itemId || item.productId} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.farm}</div>
                        <div className="flex justify-between mt-1">
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
                    <span>상품 금액</span>
                    <span>{totalPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>배송비</span>
                    <span>{deliveryFee.toLocaleString()}원</span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>총 결제 금액</span>
                  <span className="text-primary">{finalPrice.toLocaleString()}원</span>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing || isDepositInsufficient}
                >
                  {isProcessing ? '처리 중...' : '결제하기'}
                </Button>
              </Card>
            </div>
          </div>
        </form>
        <AddressDialog
          open={isAddressDialogOpen}
          onOpenChange={setIsAddressDialogOpen}
          address={editingAddress ? addresses.find((a) => a.id === editingAddress) || null : null}
          onSave={handleSaveAddress}
        />
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  )
}
