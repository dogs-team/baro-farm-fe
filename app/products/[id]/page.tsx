'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Leaf,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { useCartStore } from '@/lib/cart-store'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { ReviewForm, ReviewList, ReviewSummary, type Review } from '@/components/review'
import { Header } from '@/components/layout/header'
import { productService } from '@/lib/api/services/product'
import type { Product } from '@/lib/api/types'

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { addItem, getTotalItems } = useCartStore()
  const { toast } = useToast()
  const cartItemsCount = mounted ? getTotalItems() : 0

  useEffect(() => {
    setMounted(true)
  }, [])

  // 상품 데이터 로드
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return

      setIsLoading(true)
      try {
        const data = await productService.getProduct(productId)
        setProduct(data)
      } catch (error) {
        console.error('상품 조회 실패:', error)
        toast({
          title: '상품 조회 실패',
          description: '상품 정보를 불러오는데 실패했습니다.',
          variant: 'destructive',
        })
        router.push('/products')
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted && productId) {
      fetchProduct()
    }
  }, [mounted, productId, router, toast])

  // 임시 더미 데이터 (API 실패 시 대체용)
  const dummyProduct = {
    id: 1,
    name: '유기농 방울토마토',
    farm: '햇살농장',
    farmId: 1,
    location: '충남 당진',
    price: 8500,
    originalPrice: 12000,
    images: [
      '/fresh-organic-cherry-tomatoes-on-vine.jpg',
      '/organic-cherry-tomatoes-in-basket.jpg',
      '/cherry-tomatoes-close-up.jpg',
    ],
    rating: 4.8,
    reviews: 124,
    tag: '베스트',
    category: '채소',
    description:
      '햇살농장에서 정성껏 키운 유기농 방울토마토입니다. 화학비료나 농약을 전혀 사용하지 않고 자연의 힘으로 키워낸 건강한 토마토입니다.',
    weight: '1kg',
    certification: '유기농 인증',
    delivery: '수확 후 당일 배송',
    features: ['100% 유기농 재배', '무농약, 무화학비료', '당일 수확 당일 배송', 'GAP 인증 농장'],
  }

  // API에서 가져온 상품 데이터를 표시 형식으로 변환
  const displayProduct = product
    ? {
        id: product.id,
        name: product.productName || product.name || '',
        farm: product.farmName || '',
        farmId: product.sellerId || '',
        location: product.farmLocation || '',
        price: product.price || 0,
        originalPrice:
          product.productStatus === 'DISCOUNTED' ? (product.price || 0) * 1.2 : product.price || 0,
        images: product.imageUrls || product.images || [],
        rating: product.rating || 0,
        reviews: product.reviewCount || 0,
        tag: '베스트', // TODO: 태그 정보 추가
        category: product.productCategory || product.category || '',
        description: product.description || '',
        weight: '1kg', // TODO: 무게 정보 추가
        certification: '유기농 인증', // TODO: 인증 정보 추가
        delivery: '수확 후 당일 배송', // TODO: 배송 정보 추가
        features: [
          '100% 유기농 재배',
          '무농약, 무화학비료',
          '당일 수확 당일 배송',
          'GAP 인증 농장',
        ], // TODO: 특징 정보 추가
      }
    : dummyProduct

  const reviews: Review[] = [
    {
      id: 1,
      author: '김**',
      rating: 5,
      date: '2024.12.01',
      content: '정말 신선하고 맛있어요! 시중에서 파는 것과는 비교가 안될 정도로 달고 신선합니다.',
      helpful: 24,
      verified: true,
    },
    {
      id: 2,
      author: '이**',
      rating: 5,
      date: '2024.11.28',
      content: '아이들이 너무 좋아해요. 농약 걱정 없이 먹을 수 있어서 좋습니다.',
      helpful: 18,
      verified: true,
    },
    {
      id: 3,
      author: '박**',
      rating: 4,
      date: '2024.11.25',
      content: '맛도 좋고 신선도도 좋은데, 포장이 조금 더 튼튼하면 좋겠어요.',
      helpful: 12,
      verified: false,
    },
  ]

  const ratingDistribution = [
    { rating: 5, count: 89 },
    { rating: 4, count: 25 },
    { rating: 3, count: 7 },
    { rating: 2, count: 2 },
    { rating: 1, count: 1 },
  ]

  const relatedProducts = [
    {
      id: 2,
      name: '무농약 상추',
      price: 5000,
      image: '/fresh-organic-lettuce.png',
      rating: 4.9,
    },
    {
      id: 5,
      name: '무농약 사과',
      price: 18000,
      image: '/images/apples.png',
      rating: 4.9,
    },
    {
      id: 6,
      name: '유기농 당근',
      price: 6500,
      image: '/fresh-organic-carrots.jpg',
      rating: 4.6,
    },
  ]

  const handleAddToCart = () => {
    if (!displayProduct) return

    addItem({
      id: Number(displayProduct.id) || 0, // TODO: UUID를 number로 변환하는 로직 개선 필요
      name: displayProduct.name,
      price: displayProduct.price,
      image: displayProduct.images[0] || '/placeholder.svg',
      farm: displayProduct.farm,
      quantity,
    })

    toast({
      title: '장바구니에 추가되었습니다',
      description: `${displayProduct.name} ${quantity}개가 장바구니에 담겼습니다.`,
      action: (
        <ToastAction altText="장바구니 보기" onClick={() => router.push('/cart')}>
          장바구니 보기
        </ToastAction>
      ),
    })

    setQuantity(1)
  }

  const handleBuyNow = async () => {
    if (!displayProduct) return

    console.log('[ProductDetail] handleBuyNow called:', {
      productId: displayProduct.id,
      quantity,
    })

    // 바로 구매: 선택한 수량만 장바구니에 추가 (기존 아이템은 유지)
    addItem({
      id: Number(displayProduct.id) || 0, // TODO: UUID를 number로 변환하는 로직 개선 필요
      name: displayProduct.name,
      price: displayProduct.price,
      image: displayProduct.images[0] || '/placeholder.svg',
      farm: displayProduct.farm,
      quantity,
      isBuyNow: true, // 바로 구매 플래그
    })

    console.log('[ProductDetail] addItem called, waiting for localStorage save...')

    toast({
      title: '주문 페이지로 이동합니다',
      description: `${displayProduct.name} ${quantity}개를 주문합니다.`,
    })

    // persist 미들웨어가 localStorage에 저장할 시간을 확보
    // 여러 프레임을 기다려서 상태 업데이트와 localStorage 저장이 완료되도록 함
    await new Promise((resolve) => {
      // URL 파라미터로 바로 구매 모드임을 표시
      const buyNowParam = '?buyNow=true'

      // 즉시 이동 (결제 페이지에서 localStorage를 확인하도록)
      console.log('[ProductDetail] Navigating to checkout with buyNow flag...')
      router.push(`/checkout${buyNowParam}`)

      // 약간의 지연 후 resolve (이동이 완료되도록)
      setTimeout(() => {
        resolve(undefined)
      }, 100)
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showCart />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (!displayProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Header showCart />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">상품을 찾을 수 없습니다.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showCart />

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={displayProduct.images[selectedImage] || '/placeholder.svg'}
                alt={displayProduct.name}
                fill
                className="object-cover"
                priority
              />
              <Badge className="absolute top-4 left-4">{displayProduct.tag}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {displayProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden bg-muted border-2 transition-colors ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image || '/placeholder.svg'}
                    alt={`${displayProduct.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Link
                href={`/farms/${displayProduct.farmId}`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-2"
              >
                <MapPin className="h-3 w-3" />
                <span>{displayProduct.farm}</span>
                <span className="mx-1">•</span>
                <span>{displayProduct.location}</span>
              </Link>
              <h1 className="text-3xl font-bold mb-4">{displayProduct.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-semibold">{displayProduct.rating}</span>
                </div>
                <span className="text-muted-foreground">({displayProduct.reviews}개 리뷰)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">
                  {(displayProduct.price || 0).toLocaleString()}원
                </span>
                {displayProduct.originalPrice > displayProduct.price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {(displayProduct.originalPrice || 0).toLocaleString()}원
                    </span>
                    <Badge variant="destructive">
                      {Math.round(
                        ((displayProduct.originalPrice - displayProduct.price) /
                          displayProduct.originalPrice) *
                          100
                      )}
                      % 할인
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {displayProduct.weight} 기준 가격 (배송비 별도)
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>{displayProduct.certification}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <span>{displayProduct.delivery}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Leaf className="h-4 w-4 text-primary" />
                <span>친환경 포장재 사용</span>
              </div>
            </div>

            <Card className="p-4 bg-muted/50">
              <h3 className="font-semibold mb-3">상품 특징</h3>
              <ul className="space-y-2">
                {displayProduct.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">수량</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  장바구니
                </Button>
                <Button className="flex-1" onClick={handleBuyNow}>
                  바로 구매
                </Button>
              </div>

              <div className="flex gap-2">
                {/* TODO: 찜하기 기능 추가 예정 */}
                {/* <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button> */}
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">상품 설명</h2>
              <p className="text-muted-foreground leading-relaxed">{displayProduct.description}</p>
            </Card>

            {/* Review Summary */}
            <ReviewSummary
              averageRating={displayProduct.rating}
              totalReviews={displayProduct.reviews}
              ratingDistribution={ratingDistribution}
            />

            {/* Review Form */}
            {showReviewForm && (
              <ReviewForm
                productId={String(displayProduct.id)}
                onSubmit={(review) => {
                  console.log('Review submitted:', review)
                  setShowReviewForm(false)
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            )}

            {/* Reviews */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">고객 리뷰 ({displayProduct.reviews})</h2>
                {!showReviewForm && (
                  <Button variant="outline" onClick={() => setShowReviewForm(true)}>
                    리뷰 작성
                  </Button>
                )}
              </div>
              <ReviewList reviews={reviews} />
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">판매 농장</h3>
              <Link
                href={`/farms/${displayProduct.farmId}`}
                className="block hover:opacity-80 transition-opacity"
              >
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted mb-3">
                  <Image
                    src="/sunny-farm-with-greenhouse.jpg"
                    alt={displayProduct.farm}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-semibold mb-1">{displayProduct.farm}</h4>
                <p className="text-sm text-muted-foreground mb-3">{displayProduct.location}</p>
              </Link>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href={`/farms/${displayProduct.farmId}`}>농장 방문하기</Link>
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">함께 구매하면 좋은 상품</h3>
              <div className="space-y-4">
                {relatedProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    className="flex gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 truncate">{item.name}</h4>
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="text-xs">{item.rating}</span>
                      </div>
                      <p className="font-semibold text-sm">
                        {(item.price || 0).toLocaleString()}원
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
