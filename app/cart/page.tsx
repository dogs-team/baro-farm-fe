'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart, ArrowRight, Truck, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart-store'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Header } from '@/components/layout/header'
import { cartService } from '@/lib/api/services/cart'
import { CartItem } from '@/components/cart/cart-item'
import { useEffect, useState } from 'react'
import type { CartInfo, CartItemInfo } from '@/lib/api/types/cart'

export default function CartPage() {
  const router = useRouter()
  const { clearCart, addItem } = useCartStore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [cartData, setCartData] = useState<CartInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingItem, setUpdatingItem] = useState<string | null>(null)

  // 클라이언트에서만 마운트 확인 (Hydration 에러 방지)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 서버 장바구니 데이터 가져오기 및 로컬 스토어 동기화
  useEffect(() => {
    const loadCartData = async () => {
      if (!mounted) return

      try {
        setLoading(true)
        const serverCart = await cartService.getCart()
        console.log('장바구니 데이터 로드 성공:', serverCart)
        setCartData(serverCart)

        // 헤더 카운트를 위해 로컬 스토어 동기화
        if (serverCart?.items) {
          await syncLocalCart(serverCart.items)
        }
      } catch (error) {
        console.error('장바구니 데이터 로드 실패:', error)
        console.error('에러 상세:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          error: error,
        })
        toast({
          title: '장바구니 로드 실패',
          description:
            error instanceof Error ? error.message : '장바구니 데이터를 불러오는데 실패했습니다.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadCartData()
  }, [mounted, toast, clearCart, addItem])

  // 수량 변경 핸들러
  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    // 1개 미만으로는 떨어지지 않도록 제한
    if (newQuantity < 1) {
      return
    }

    try {
      setUpdatingItem(itemId)
      await cartService.updateItemQuantity(itemId, { quantity: newQuantity })
      // 장바구니 데이터 새로고침
      const updatedCart = await cartService.getCart()
      setCartData(updatedCart)

      // 로컬 스토어도 동기화
      if (updatedCart?.items) {
        await syncLocalCart(updatedCart.items)
      }

      toast({
        title: '수량이 변경되었습니다',
        description: '장바구니 수량이 성공적으로 업데이트되었습니다.',
      })
    } catch (error) {
      console.error('수량 변경 실패:', error)
      toast({
        title: '수량 변경 실패',
        description: '수량 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingItem(null)
    }
  }

  // 수량 변경 시 로컬 스토어 동기화 헬퍼 함수
  const syncLocalCart = async (items: CartItemInfo[]) => {
    clearCart()
    for (let index = 0; index < items.length; index++) {
      const item = items[index]

      // 상품 정보 가져오기 (sellerId, farm 등)
      let productName = item.productName || '상품명'
      let productImage = item.productImage || '/placeholder.svg'
      let sellerId = ''
      let farm = '농장'

      try {
        const { productService } = await import('@/lib/api/services/product')
        const product = await productService.getProduct(item.productId)
        productName = product.productName || productName
        productImage = product.imageUrls?.[0] || productImage
        sellerId = product.sellerId || ''
        farm = product.farmName || product.farm?.name || '농장'
      } catch (error) {
        console.warn(`상품 ${item.productId} 정보 조회 실패, 기본값 사용:`, error)
      }

      addItem({
        id: index + 1, // 고유한 숫자 ID 부여 (1부터 시작)
        productId: item.productId,
        sellerId: sellerId,
        name: productName,
        price: item.unitPrice,
        image: productImage,
        farm: farm,
        quantity: item.quantity,
        options: item.optionInfoJson || undefined,
      })
    }
  }

  // 상품 삭제 핸들러
  const handleRemoveItem = async (itemId: string) => {
    try {
      await cartService.deleteItemFromCart(itemId)
      // 장바구니 데이터 새로고침
      const updatedCart = await cartService.getCart()
      setCartData(updatedCart)

      // 로컬 스토어도 동기화
      if (updatedCart?.items) {
        await syncLocalCart(updatedCart.items)
      }

      toast({
        title: '장바구니에서 삭제되었습니다',
        description: '상품이 장바구니에서 제거되었습니다.',
      })
    } catch (error) {
      console.error('상품 삭제 실패:', error)
      toast({
        title: '삭제 실패',
        description: '상품 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const deliveryFee = 0 // 무료 배송
  const cartItems = cartData?.items || []
  const totalPrice = cartData?.totalPrice || 0
  const finalPrice = totalPrice + deliveryFee

  const handleCheckout = () => {
    if (!cartData || cartItems.length === 0) {
      toast({
        title: '장바구니가 비어있습니다',
        description: '상품을 장바구니에 담아주세요.',
        variant: 'destructive',
      })
      return
    }
    router.push('/checkout')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header showCart />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">장바구니</h1>
          <p className="text-gray-600">선택한 상품들을 확인하고 주문해보세요</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <p className="text-gray-500">장바구니를 불러오는 중...</p>
          </div>
        ) : !cartData || cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900">장바구니가 비어있습니다</h2>
            <p className="text-gray-600 mb-6">신선한 농산물을 장바구니에 담아보세요</p>
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/products">농산물 둘러보기</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  상품 목록 ({cartItems.length}개)
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item: CartItemInfo) => (
                    <CartItem
                      key={item.itemId}
                      item={item}
                      isUpdating={updatingItem === item.itemId}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-24">
                <h2 className="text-lg font-bold mb-4 text-gray-900">주문 요약</h2>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">상품 금액</span>
                    <span className="font-medium text-sm">{totalPrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">배송비</span>
                    <div className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-sm text-green-600">무료 배송</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 mb-4 border-t border-gray-200">
                  <span className="text-base font-bold text-gray-900">총 결제 금액</span>
                  <span className="text-lg font-bold text-green-600">
                    {finalPrice.toLocaleString()}원
                  </span>
                </div>

                <Button
                  className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white py-2.5 text-base font-semibold"
                  onClick={handleCheckout}
                  size="sm"
                >
                  주문하기
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
