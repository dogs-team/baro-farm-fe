'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Minus, Plus, X, ShoppingCart, ArrowRight, Truck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart-store'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { Header } from '@/components/layout/header'
import { useCart } from '@/hooks/use-cart-query'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
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
}

const FALLBACK_ADDONS = [
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
    reason: '달콤함을 더해주는 자연 감미료',
  },
  {
    id: SAMPLE_PRODUCT_ID,
    name: '견과류 믹스',
    price: 9800,
    image: '/fresh-organic-lettuce.png',
    reason: '식감과 영양을 보완하는 토핑',
  },
  {
    id: SAMPLE_PRODUCT_ID,
    name: '생크림',
    price: 4500,
    image: '/fresh-organic-potatoes.jpg',
    reason: '디저트 마무리를 돕는 재료',
  },
]

export default function CartPage() {
  const router = useRouter()
  const { cart, isLoading, updateQuantity, deleteItem, addToCart } = useCart()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [showCheckoutRecommend, setShowCheckoutRecommend] = useState(false)

  // HEAD branch relies on hook for data, so we don't need manual loading state or useEffects here.
  // We keep the isFallbackCart logic only if we want to support that specific main branch feature,
  // but for now, we'll simplify and use the hook's real data.
  // If cart load fails, the hook handles error state.
  const isFallbackCart = false

  useEffect(() => {
    setMounted(true)
  }, [])

  const items = cart?.items || []
  const totalPrice = cart?.totalPrice || 0
  const deliveryFee = 0 // 무료 배송
  const finalPrice = totalPrice + deliveryFee

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: '장바구니가 비어있습니다',
        description: '상품을 장바구니에 담아주세요.',
        variant: 'destructive',
      })
      return
    }
    setShowCheckoutRecommend(true)
  }

  const handleProceedCheckout = () => {
    setShowCheckoutRecommend(false)
    router.push(isFallbackCart ? '/checkout?mock=true' : '/checkout')
  }

  // Loading Skeleton
  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Header showCart />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">장바구니</h1>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-24 h-24 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header showCart />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">장바구니</h1>

        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">장바구니가 비어있습니다</h2>
            <p className="text-muted-foreground mb-6">신선한 농산물을 장바구니에 담아보세요</p>
            <Button asChild>
              <Link href="/products">농산물 둘러보기</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.itemId} className="p-4">
                  <div className="flex gap-4">
                    <Link
                      href={`/products/${item.productId}`}
                      className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 block"
                    >
                      <Image
                        src={item.productImage || '/placeholder.svg'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          href={`/products/${item.productId}`}
                          className="flex-1 hover:opacity-80 transition-opacity"
                        >
                          <h3 className="font-semibold mb-1">{item.productName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.productCategoryName}
                          </p>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // Optimistic update handled by hook, but specific undo logic might be tricky without local state fallback
                            // For API-driven cart, "undo" usually implies re-adding via API
                            const removedItem = item
                            deleteItem(item.itemId)

                            toast({
                              title: '장바구니에서 삭제되었습니다',
                              description: `${removedItem.productName}이(가) 장바구니에서 제거되었습니다.`,
                              // Undo logic for API would be re-adding, but requires inventoryId etc which might be lost.
                              // Simple undo is re-add to cart
                              action: (
                                <ToastAction
                                  altText="되돌리기"
                                  onClick={() => {
                                    addToCart({
                                      productId: removedItem.productId,
                                      quantity: removedItem.quantity,
                                      unitPrice: removedItem.unitPrice,
                                      inventoryId: removedItem.inventoryId,
                                    })
                                  }}
                                >
                                  되돌리기
                                </ToastAction>
                              ),
                            })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity({ itemId: item.itemId, quantity: item.quantity - 1 })
                              } else {
                                // removing if quantity 1 -> handled by delete usually, or explicit remove
                                deleteItem(item.itemId)
                              }
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() =>
                              updateQuantity({ itemId: item.itemId, quantity: item.quantity + 1 })
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold">{item.lineTotalPrice.toLocaleString()}원</p>
                          <p className="text-sm text-muted-foreground">
                            {item.unitPrice.toLocaleString()}원 / 개
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">주문 요약</h2>

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

                <Button className="w-full mb-4" onClick={handleCheckout}>
                  주문하기
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>무료 배송</span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showCheckoutRecommend} onOpenChange={setShowCheckoutRecommend}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              이런 건 어떠세요?
              <Badge variant="secondary">추천</Badge>
            </DialogTitle>
            <DialogDescription>
              장바구니를 기준으로 레시피와 추가 구매 상품을 제안합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold whitespace-nowrap">오늘의 레시피</h3>
                <Badge variant="secondary">AI</Badge>
                <span className="text-xs text-muted-foreground">· {FALLBACK_RECIPE.name}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-4">
                    {FALLBACK_RECIPE.description}
                  </p>
                  <div className="text-[11px] text-muted-foreground space-y-1">
                    <div>조리 시간: {FALLBACK_RECIPE.cookTime}</div>
                    <div>난이도: {FALLBACK_RECIPE.difficulty}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium mb-2">추천 재료</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {FALLBACK_RECIPE.ingredients.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {FALLBACK_ADDONS.map((item) => (
                <div key={`addon-${item.name}`} className="border rounded-lg overflow-hidden">
                  <div className="relative aspect-[4/3] bg-muted">
                    <Image
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.reason}</p>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-green-600">
                        {item.price.toLocaleString()}원
                      </span>
                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <Link href={`/products/${item.id}`}>보기</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCheckoutRecommend(false)}>
              닫기
            </Button>
            <Button onClick={handleProceedCheckout}>그냥 주문하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
