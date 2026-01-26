'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart, ArrowRight, Truck, Loader2, Sparkles, ChefHat } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart-store'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Header } from '@/components/layout/header'
import { cartService } from '@/lib/api/services/cart'
import { CartItem } from '@/components/cart/cart-item'
import { useEffect, useState } from 'react'
import type { CartInfo, CartItemInfo } from '@/lib/api/types/cart'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { recommendService } from '@/lib/api/services/recommend'
import { getUserId } from '@/lib/api/client'
import { getProductImage } from '@/lib/utils/product-images'

const CART_TIMEOUT_MS = 4000
const PRODUCT_DETAIL_TIMEOUT_MS = 2000
const SAMPLE_PRODUCT_ID = 'c33e13c9-43d2-4b50-8630-3e9605a0b63b'
const FALLBACK_CART: CartInfo = {
  cartId: 'fallback-cart',
  buyerId: 'guest',
  items: [
    {
      itemId: 'fallback-item-1',
      productId: SAMPLE_PRODUCT_ID,
      quantity: 2,
      unitPrice: 15000,
      lineTotalPrice: 30000,
      productName: '친환경 딸기',
      productImage: '/images/strawberries.png',
    },
    {
      itemId: 'fallback-item-2',
      productId: SAMPLE_PRODUCT_ID,
      quantity: 1,
      unitPrice: 8500,
      lineTotalPrice: 8500,
      productName: '유기농 방울토마토',
      productImage: '/fresh-organic-cherry-tomatoes.jpg',
    },
  ],
  totalPrice: 38500,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const FALLBACK_RECIPE = {
  name: '딸기 요거트 볼',
  description: '장바구니 구성에 어울리는 빠른 디저트 레시피입니다.',
  cookTime: '10분',
  difficulty: '쉬움',
  ingredients: ['딸기', '그릭요거트', '견과류', '꿀'],
  ownedIngredients: ['딸기'],
  missingCoreIngredients: ['그릭요거트', '견과류', '꿀'],
}

const FALLBACK_ADDONS: Array<{
  id: string
  name: string
  price: number
  image: string
  reason: string
  category?: string
}> = [
  {
    id: SAMPLE_PRODUCT_ID,
    name: '그릭요거트',
    price: 6800,
    image: '/images/strawberries.png',
    reason: '딸기와 잘 어울리는 베이스 재료',
    category: '유제품',
  },
  {
    id: SAMPLE_PRODUCT_ID,
    name: '국산 꿀',
    price: 12000,
    image: '/fresh-organic-cherry-tomatoes.jpg',
    reason: '달콤함을 더해주는 자연 감미료',
    category: '식품',
  },
  {
    id: SAMPLE_PRODUCT_ID,
    name: '견과류 믹스',
    price: 9800,
    image: '/fresh-organic-lettuce.png',
    reason: '식감과 영양을 보완하는 토핑',
    category: '견과류',
  },
  {
    id: SAMPLE_PRODUCT_ID,
    name: '생크림',
    price: 4500,
    image: '/fresh-organic-potatoes.jpg',
    reason: '디저트 마무리를 돕는 재료',
    category: '유제품',
  },
]

export default function CartPage() {
  const router = useRouter()
  const { clearCart, addItem } = useCartStore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [cartData, setCartData] = useState<CartInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingItem, setUpdatingItem] = useState<string | null>(null)
  const [isFallbackCart, setIsFallbackCart] = useState(false)
  const [showCheckoutRecommend, setShowCheckoutRecommend] = useState(false)
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false)
  const [recipeRecommendation, setRecipeRecommendation] = useState<{
    name: string
    description: string
    cookTime: string
    difficulty: string
    ingredients: string[]
    ownedIngredients: string[]
    missingCoreIngredients: string[]
    instructions?: string
  } | null>(null)
  const [addOnRecommendations, setAddOnRecommendations] = useState<
    Array<{
      id: string
      name: string
      price: number
      image: string
      reason: string
      category?: string
    }>
  >([])

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
        let timeoutId: ReturnType<typeof setTimeout> | null = null
        const timeoutPromise = new Promise<null>((resolve) => {
          timeoutId = setTimeout(() => resolve(null), CART_TIMEOUT_MS)
        })

        const serverCart = await Promise.race([cartService.getCart(), timeoutPromise])

        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        if (!serverCart) {
          console.warn('[Cart] Fallback cart used due to timeout')
          setCartData(FALLBACK_CART)
          syncLocalCart(FALLBACK_CART.items)
          setIsFallbackCart(true)
          return
        }
        console.log('장바구니 데이터 로드 성공:', serverCart)
        setCartData(serverCart)
        setIsFallbackCart(false)

        // 헤더 카운트를 위해 로컬 스토어 동기화
        if (serverCart?.items) {
          syncLocalCart(serverCart.items)
        }
      } catch (error) {
        console.error('장바구니 데이터 로드 실패:', error)
        console.error('에러 상세:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          error: error,
        })
        setCartData(FALLBACK_CART)
        syncLocalCart(FALLBACK_CART.items)
        setIsFallbackCart(true)
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

      const shouldFetchDetails = !item.productName || !item.productImage
      if (shouldFetchDetails) {
        try {
          const { productService } = await import('@/lib/api/services/product')
          const timeoutPromise = new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), PRODUCT_DETAIL_TIMEOUT_MS)
          })
          const product = await Promise.race([
            productService.getProduct(item.productId),
            timeoutPromise,
          ])
          if (product) {
            productName = product.productName || productName
            productImage = product.imageUrls?.[0] || productImage
            sellerId = product.sellerId || ''
            // farm data not available from product API, keeping default
          }
        } catch (error) {
          console.warn(`상품 ${item.productId} 정보 조회 실패, 기본값 사용:`, error)
        }
      }

      addItem({
        id: index + 1, // 고유한 숫자 ID 부여 (1부터 시작)
        productId: item.productId,
        sellerId: sellerId,
        inventoryId: item.inventoryId || undefined,
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
    setShowCheckoutRecommend(true)
  }

  // 추천 데이터 가져오기 (장바구니 로드 시 미리 호출)
  useEffect(() => {
    if (!mounted || !cartData || cartItems.length === 0 || loading) return

    const fetchRecommendations = async () => {
      setIsRecommendationsLoading(true)
      try {
        const userId = getUserId()
        let recipeData = null
        let addOnProducts: Array<{
          id: string
          name: string
          price: number
          image: string
          reason: string
          category?: string
        }> = []

        // 먼저 테스트용 API 시도
        try {
          recipeData = await recommendService.getRecipeRecommendationTest({
            cartId: cartData.cartId,
            buyerId: userId || cartData.buyerId || null,
            items: cartItems.map((item) => ({
              productId: item.productId,
              productName: item.productName || '상품',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              inventoryId: item.inventoryId || '',
            })),
            totalPrice: totalPrice,
            createdAt: cartData.createdAt,
            updatedAt: cartData.updatedAt,
          })
          console.log('[Cart] Recipe recommendation test API success:', recipeData)
        } catch (error) {
          console.warn('[Cart] Test recipe recommendation failed:', error)
          // 테스트 API 실패 시 사용자 ID가 있으면 일반 API 시도
          if (userId) {
            try {
              recipeData = await recommendService.getRecipeRecommendation({ userId })
              console.log('[Cart] Recipe recommendation API success:', recipeData)
            } catch (error2) {
              console.warn('[Cart] Recipe recommendation API also failed:', error2)
            }
          }
        }

        // 레시피 데이터 정규화
        const normalizedRecipe = recipeData
          ? {
              name: recipeData.recipeName || FALLBACK_RECIPE.name,
              description: `장바구니에 담긴 ${recipeData.ownedIngredients?.length || 0}가지 재료로 만들 수 있는 레시피입니다.`,
              cookTime: '15분',
              difficulty: '쉬움',
              ingredients: [
                ...(recipeData.ownedIngredients || []),
                ...(recipeData.missingCoreIngredients || []),
              ],
              ownedIngredients: recipeData.ownedIngredients || [],
              missingCoreIngredients: recipeData.missingCoreIngredients || [],
              instructions: recipeData.instructions || '',
            }
          : null

        // 부족한 재료별 상품 추천 수집
        if (recipeData?.missingRecommendations && recipeData.missingRecommendations.length > 0) {
          const { productService } = await import('@/lib/api/services/product')

          for (const ingredientRec of recipeData.missingRecommendations) {
            for (const product of ingredientRec.products) {
              let productImage = getProductImage(product.productName, product.productId)

              // 실제 상품 정보를 가져와서 이미지 URL 업데이트
              try {
                const productDetail = await productService.getProduct(product.productId)
                if (productDetail?.imageUrls && productDetail.imageUrls.length > 0) {
                  productImage = productDetail.imageUrls[0]
                }
              } catch (error) {
                console.warn(`상품 ${product.productId} 이미지 조회 실패, 기본 이미지 사용:`, error)
              }

              addOnProducts.push({
                id: product.productId,
                name: product.productName,
                price: product.price,
                image: productImage,
                reason: `${ingredientRec.ingredientName} 재료로 추천`,
                category: product.productCategoryName,
              })
            }
          }
        }

        // 최대 10개까지 표시 (더 많은 추천 표시)
        addOnProducts = addOnProducts.slice(0, 10)

        setRecipeRecommendation(normalizedRecipe || FALLBACK_RECIPE)
        setAddOnRecommendations(addOnProducts.length > 0 ? addOnProducts : FALLBACK_ADDONS)
      } catch (error) {
        console.warn('[Cart] Fallback recommendations used:', error)
        setRecipeRecommendation(FALLBACK_RECIPE)
        setAddOnRecommendations(FALLBACK_ADDONS)
      } finally {
        setIsRecommendationsLoading(false)
      }
    }

    fetchRecommendations()
  }, [mounted, cartData, cartItems, totalPrice, loading])

  const handleProceedCheckout = () => {
    setShowCheckoutRecommend(false)
    router.push(isFallbackCart ? '/checkout?mock=true' : '/checkout')
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

      <Dialog open={showCheckoutRecommend} onOpenChange={setShowCheckoutRecommend}>
        <DialogContent className="max-w-none w-[98vw] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <DialogTitle className="text-xl font-bold">이런 건 어떠세요?</DialogTitle>
            </div>
            <DialogDescription>장바구니 내역을 분석하여 추천해드려요</DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {isRecommendationsLoading ? (
              <div className="space-y-6">
                {/* 레시피 스켈레톤 */}
                <div className="p-4 border rounded-lg">
                  <Skeleton className="h-5 w-32 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                {/* 상품 스켈레톤 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-5">
                      <Skeleton className="w-full aspect-square rounded-lg mb-4" />
                      <Skeleton className="h-6 w-full mb-3" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-5 w-24 mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 레시피 섹션 */}
                {recipeRecommendation && (
                  <div className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <ChefHat className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">오늘의 레시피</h3>
                      <Badge variant="secondary" className="text-xs">
                        AI
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-bold mb-2">{recipeRecommendation.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {recipeRecommendation.description}
                        </p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>⏱️ {recipeRecommendation.cookTime}</span>
                          <span>📊 {recipeRecommendation.difficulty}</span>
                        </div>
                      </div>
                      {(recipeRecommendation.ownedIngredients.length > 0 ||
                        recipeRecommendation.missingCoreIngredients.length > 0) && (
                        <div className="space-y-3">
                          {recipeRecommendation.ownedIngredients.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <span className="text-green-600">✓</span>
                                장바구니에 담긴 재료 ({recipeRecommendation.ownedIngredients.length}
                                개)
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {recipeRecommendation.ownedIngredients.map((ingredient) => (
                                  <Badge
                                    key={ingredient}
                                    variant="outline"
                                    className="text-xs bg-green-50 text-green-700 border-green-200"
                                  >
                                    {ingredient}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {recipeRecommendation.missingCoreIngredients.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <span className="text-orange-600">⚠</span>
                                부족한 재료 ({recipeRecommendation.missingCoreIngredients.length}개)
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {recipeRecommendation.missingCoreIngredients.map((ingredient) => (
                                  <Badge
                                    key={ingredient}
                                    variant="outline"
                                    className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                                  >
                                    {ingredient}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {recipeRecommendation.instructions && (
                        <div className="pt-3 border-t">
                          <h5 className="text-sm font-semibold mb-2">조리 방법</h5>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                            {recipeRecommendation.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 추가 상품 추천 섹션 */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">추가 구매 추천</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(addOnRecommendations.length > 0 ? addOnRecommendations : FALLBACK_ADDONS).map(
                      (item: {
                        id: string
                        name: string
                        price: number
                        image: string
                        reason: string
                        category?: string
                      }) => (
                        <div
                          key={`addon-${item.id}-${item.name}`}
                          className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col"
                        >
                          <div className="relative aspect-square bg-muted">
                            <Image
                              src={item.image || '/placeholder.svg'}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <h4 className="font-semibold text-lg mb-2">{item.name}</h4>
                            <p className="text-sm text-muted-foreground mb-3 flex-shrink-0">
                              {item.reason}
                            </p>
                            {item.category && (
                              <Badge variant="outline" className="text-xs mb-4 w-fit">
                                {item.category}
                              </Badge>
                            )}
                            <div className="mt-auto space-y-3">
                              <div className="text-lg font-bold text-primary">
                                {item.price.toLocaleString()}원
                              </div>
                              <Button variant="outline" size="default" className="w-full" asChild>
                                <Link href={`/products/${item.id}`}>상품 보기</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t gap-2">
            <Button variant="outline" onClick={() => setShowCheckoutRecommend(false)}>
              닫기
            </Button>
            <Button onClick={handleProceedCheckout} className="bg-green-600 hover:bg-green-700">
              주문하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
