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

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, getTotalPrice, addItem } = useCartStore()
  const { toast } = useToast()

  const deliveryFee = items.length > 0 ? 3000 : 0
  const totalPrice = getTotalPrice()
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
    router.push('/checkout')
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
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <Link
                      href={`/products/${item.id}`}
                      className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 block"
                    >
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          href={`/products/${item.id}`}
                          className="flex-1 hover:opacity-80 transition-opacity"
                        >
                          <h3 className="font-semibold mb-1">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.farm}</p>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const removedItem = item
                            removeItem(item.id)
                            toast({
                              title: '장바구니에서 삭제되었습니다',
                              description: `${removedItem.name}이(가) 장바구니에서 제거되었습니다.`,
                              action: (
                                <ToastAction
                                  altText="되돌리기"
                                  onClick={() => {
                                    addItem({
                                      id: removedItem.id,
                                      name: removedItem.name,
                                      price: removedItem.price,
                                      image: removedItem.image,
                                      farm: removedItem.farm,
                                      quantity: removedItem.quantity,
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
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
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
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold">
                            {(item.price * item.quantity).toLocaleString()}원
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.price.toLocaleString()}원 / 개
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
                  <span>30,000원 이상 구매 시 무료배송</span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
