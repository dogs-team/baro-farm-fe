'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCartStore } from '@/lib/cart-store'
import { useAddressStore } from '@/lib/address-store'
import { useToast } from '@/hooks/use-toast'
import { orderService } from '@/lib/api/services/order'
import { depositService } from '@/lib/api/services/payment'
import { CheckoutView, type CheckoutItem } from './CheckoutView'
import { Button } from '@/components/ui/button'
import type { Address } from '@/lib/api/types'

export function CheckoutContainer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 바로 구매 데이터 확인 (sessionStorage에서 직접 읽기)
  const [buyNowItem, setBuyNowItem] = useState<any>(null)
  const isBuyNow = searchParams.get('buyNow') === 'true'

  useEffect(() => {
    if (!mounted) return
    if (!isBuyNow) return
    if (typeof window === 'undefined') return

    console.log('[Checkout] Loading buy now item from sessionStorage')

    const stored = sessionStorage.getItem('barofarm-buynow-item')
    console.log('[Checkout] Stored data:', stored)

    if (!stored) {
      console.log('[Checkout] No buy now item found')
      return
    }

    try {
      const parsed = JSON.parse(stored)
      console.log('[Checkout] Parsed buy now item:', parsed)
      setBuyNowItem(parsed)
    } catch (e) {
      console.error('[Checkout] Failed to parse buy now item', e)
    }
  }, [mounted, isBuyNow])

  const { items } = useCartStore()
  const { addresses, selectedAddressId, addAddress, updateAddress, deleteAddress, selectAddress } =
    useAddressStore()
  const { toast } = useToast()
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
        const response = await depositService.getDeposit()
        setDepositBalance(response.amount)
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
          if (window.TossPayments) {
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
            const script = document.createElement('script')
            script.src = 'https://js.tosspayments.com/v1/payment'
            script.async = true
            script.onload = () => {
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

  // 체크아웃 아이템이 없으면 장바구니로 리다이렉트
  useEffect(() => {
    if (!mounted) {
      setIsLoadingItems(false)
      return
    }

    let redirectTimeout: NodeJS.Timeout | null = null
    let checkCount = 0
    let intervalId: NodeJS.Timeout | null = null
    let isCleanedUp = false
    let hasBuyNowInStorage = false
    const maxChecks = isBuyNow ? 30 : 10

    const checkItems = () => {
      if (isCleanedUp) return true

      checkCount++
      console.log('[Checkout] Checking items:', {
        isBuyNow,
        checkCount,
        maxChecks,
        checkoutItemsLength: checkoutItems.length,
        itemsLength: items.length,
        hasBuyNowInStorage,
      })

      if (checkoutItems.length > 0 || items.length > 0) {
        if (redirectTimeout) {
          clearTimeout(redirectTimeout)
          redirectTimeout = null
        }
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
        setIsLoadingItems(false)
        isCleanedUp = true
        console.log('[Checkout] Items found, staying on checkout page')
        return true
      }

      if (checkoutItems.length === 0 && items.length === 0) {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('barofarm-cart')
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as {
                state?: { items?: Array<{ id: number; isBuyNow?: boolean }> }
              }
              const buyNowItems = parsed.state?.items?.filter((i) => {
                const isBuyNow = i.isBuyNow
                return (
                  isBuyNow === true ||
                  (typeof isBuyNow === 'string' && isBuyNow === 'true') ||
                  (typeof isBuyNow === 'number' && isBuyNow === 1)
                )
              })
              if (buyNowItems && buyNowItems.length > 0) {
                hasBuyNowInStorage = true
                console.log(
                  '[Checkout] Buy now items found in localStorage, waiting for Zustand restore...',
                  {
                    checkCount,
                    maxChecks,
                    isBuyNow,
                    buyNowItemsCount: buyNowItems.length,
                    buyNowItems: buyNowItems.map((i) => ({ id: i.id, isBuyNow: i.isBuyNow })),
                  }
                )
                return false
              } else {
                hasBuyNowInStorage = false
              }
            } catch (e) {
              console.error('[Checkout] Error parsing localStorage:', e)
              hasBuyNowInStorage = false
            }
          } else {
            hasBuyNowInStorage = false
          }
        }

        if (checkCount >= maxChecks && !hasBuyNowInStorage) {
          console.log('[Checkout] No items found after max checks, redirecting to cart...')
          setIsLoadingItems(false)
          isCleanedUp = true
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          if (!redirectTimeout) {
            redirectTimeout = setTimeout(() => {
              router.push('/cart')
            }, 100)
          }
          return true
        }
      }

      return false
    }

    const immediateResult = checkItems()
    if (immediateResult === true) {
      return
    }

    const checkInterval = isBuyNow ? 50 : 100
    intervalId = setInterval(() => {
      const result = checkItems()
      if (result === true) {
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
      }
    }, checkInterval)

    const maxWaitTimeout = setTimeout(() => {
      if (isCleanedUp) return

      console.log('[Checkout] 최대 대기 시간 도달, 로딩 종료 (무한 로딩 방지)')
      setIsLoadingItems(false)
      isCleanedUp = true

      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      if (redirectTimeout) {
        clearTimeout(redirectTimeout)
        redirectTimeout = null
      }

      let finalHasBuyNow = false
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('barofarm-cart')
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as {
              state?: { items?: Array<{ id: number; isBuyNow?: boolean }> }
            }
            const buyNowItems = parsed.state?.items?.filter((i) => {
              const isBuyNow = i.isBuyNow
              return (
                isBuyNow === true ||
                (typeof isBuyNow === 'string' && isBuyNow === 'true') ||
                (typeof isBuyNow === 'number' && isBuyNow === 1)
              )
            })
            if (buyNowItems && buyNowItems.length > 0) {
              finalHasBuyNow = true
            }
          } catch (e) {
            console.error('[Checkout] 최종 확인 중 에러:', e)
          }
        }
      }

      if (checkoutItems.length === 0 && items.length === 0 && !finalHasBuyNow) {
        console.log('[Checkout] 최대 대기 시간 후에도 아이템 없음, 장바구니로 리다이렉트')
        router.push('/cart')
      } else if (finalHasBuyNow) {
        console.log(
          '[Checkout] 최대 대기 시간 도달했지만 localStorage에 바로 구매 아이템 있음, 페이지 유지'
        )
        toast({
          title: '주문 정보를 불러오는 중',
          description: '잠시만 기다려주세요...',
        })
      }
    }, maxChecks * 100)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
      clearTimeout(maxWaitTimeout)
      if (redirectTimeout) {
        clearTimeout(redirectTimeout)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isBuyNow])

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    addressDetail: '',
    zipCode: '',
    deliveryNote: '',
    paymentMethod: 'deposit',
  })

  // 체크아웃에 표시할 아이템과 총 가격
  const checkoutItems: CheckoutItem[] = mounted
    ? isBuyNow
      ? buyNowItem
        ? [
            {
              id: Number(buyNowItem.productId) || 0,
              productId: buyNowItem.productId,
              sellerId: buyNowItem.sellerId,
              name: buyNowItem.name,
              price: buyNowItem.price,
              image: buyNowItem.image,
              farm: buyNowItem.farm,
              quantity: buyNowItem.quantity,
              options: buyNowItem.options,
              isBuyNow: true,
            },
          ]
        : []
      : items.map((item) => ({
          id: item.id,
          productId: item.productId || String(item.id),
          sellerId: item.sellerId || '',
          name: item.name,
          price: item.price,
          image: item.image,
          farm: item.farm,
          quantity: item.quantity,
          options: item.options,
        }))
    : []

  const isLoadingBuyNow = isBuyNow && !buyNowItem
  const [isLoadingItems, setIsLoadingItems] = useState(true)
  const totalPrice = mounted
    ? isBuyNow
      ? buyNowItem
        ? buyNowItem.price * buyNowItem.quantity
        : 0
      : items.reduce((total, item) => total + item.price * item.quantity, 0)
    : 0
  const deliveryFee = 0
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

  const handleSaveAddress = (addressData: Omit<Address, 'id'>) => {
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
      if (isBuyNow) {
        toast({
          title: '주문 정보를 불러오는 중입니다',
          description: '잠시만 기다려주세요.',
        })
        return
      }

      toast({
        title: '장바구니가 비어있습니다',
        description: '상품을 장바구니에 담아주세요.',
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
          const productId = item.productId
          const sellerId = item.sellerId

          if (!productId || !sellerId) {
            throw new Error(
              '상품 정보가 올바르지 않습니다. 상품 상세 페이지에서 다시 시도해주세요.'
            )
          }

          return {
            productId,
            sellerId,
            quantity: item.quantity,
            unitPrice: item.price,
          }
        }),
      }

      const orderResponse = await orderService.createOrder(orderRequest)
      const orderId = orderResponse.orderId || `ORDER-${orderResponse.orderId}`
      const orderName =
        checkoutItems.length === 1
          ? checkoutItems[0].name
          : `${checkoutItems[0].name} 외 ${checkoutItems.length - 1}개`

      return { orderId, orderName }
    }

    if (formData.paymentMethod === 'deposit') {
      if (depositBalance == null || depositBalance < finalPrice) {
        toast({
          title: '예치금 부족',
          description: '예치금이 부족합니다. 토스결제를 이용해주세요.',
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

        toast({
          title: '주문이 완료되었습니다',
          description: `총 ${finalPrice.toLocaleString()}원이 예치금으로 결제되었습니다.`,
        })

        router.push(`/order/success?orderId=${orderId}`)
      } catch (error: any) {
        console.error('예치금 결제 실패:', error)
        toast({
          title: '주문 실패',
          description: error?.message || '예치금 결제 중 오류가 발생했습니다. 다시 시도해주세요.',
          variant: 'destructive',
        })
      } finally {
        setIsProcessing(false)
      }
      return
    }

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
        let orderId: string
        let orderName: string

        try {
          const order = await createOrder()
          orderId = order.orderId
          orderName = order.orderName
        } catch (orderError: any) {
          console.error('주문 생성 실패:', orderError)
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

        if (!tossWidget) {
          throw new Error(
            '토스페이먼츠 위젯이 초기화되지 않았습니다. 페이지를 새로고침 후 다시 시도해주세요.'
          )
        }

        if (typeof tossWidget.requestPayment !== 'function') {
          throw new Error('토스페이먼츠 위젯의 requestPayment 함수를 사용할 수 없습니다.')
        }

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
          orderId: orderId,
          amount: finalPrice,
          orderName: orderName,
          customerName: formData.name || '고객',
          successUrl: successUrl,
          failUrl: failUrl,
        })

        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('barofarm-buynow-item')
        }
      } catch (error: any) {
        console.error('토스 결제 실패:', error)

        if (error.code === 'USER_CANCEL' || error.message?.includes('취소')) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('barofarm-buynow-item')
          }
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

    toast({
      title: '지원하지 않는 결제 수단',
      description: '예치금 또는 토스결제를 선택해주세요.',
      variant: 'destructive',
    })
  }

  // 로딩 상태
  if (!mounted || isLoadingItems || isLoadingBuyNow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">주문 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 아이템이 없으면 장바구니로 리다이렉트
  if (checkoutItems.length === 0 && items.length === 0 && !isBuyNow) {
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
    <CheckoutView
      formData={formData}
      onInputChange={handleInputChange}
      addresses={addresses}
      useSavedAddress={useSavedAddress}
      onUseSavedAddressChange={setUseSavedAddress}
      isAddressDialogOpen={isAddressDialogOpen}
      onAddressDialogOpenChange={setIsAddressDialogOpen}
      editingAddress={editingAddress}
      onEditAddress={handleEditAddress}
      onSaveAddress={handleSaveAddress}
      checkoutItems={checkoutItems}
      totalPrice={totalPrice}
      deliveryFee={deliveryFee}
      finalPrice={finalPrice}
      depositBalance={depositBalance}
      isDepositSelected={isDepositSelected}
      isDepositInsufficient={isDepositInsufficient}
      isProcessing={isProcessing}
      onSubmit={handleSubmit}
    />
  )
}
