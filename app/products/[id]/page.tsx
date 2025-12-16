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
import {
  ReviewForm,
  ReviewList,
  ReviewSummary,
  type Review as ReviewComponentType,
} from '@/components/review'
import { Header } from '@/components/layout/header'
import { productService } from '@/lib/api/services/product'
import { reviewService } from '@/lib/api/services/review'
import { orderService } from '@/lib/api/services/order'
import type { Product, Review as ApiReview, OrderItem } from '@/lib/api/types'
import { getProductImages } from '@/lib/utils/product-images'

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [orderItemId, setOrderItemId] = useState<string | undefined>(undefined)
  const [isLoadingOrderItem, setIsLoadingOrderItem] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reviews, setReviews] = useState<ReviewComponentType[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [ratingDistribution, setRatingDistribution] = useState([
    { rating: 5, count: 0 },
    { rating: 4, count: 0 },
    { rating: 3, count: 0 },
    { rating: 2, count: 0 },
    { rating: 1, count: 0 },
  ])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
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

  // 리뷰 데이터 로드
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId || !mounted) return

      setIsLoadingReviews(true)
      try {
        const response = await reviewService.getProductReviews(productId, { page: 0, size: 50 })

        // reviewService에서 이미 data 필드를 추출했으므로 직접 사용
        const reviewsList = Array.isArray(response?.content) ? response.content : []

        // API Review 타입을 컴포넌트 Review 타입으로 변환
        const convertedReviews: ReviewComponentType[] = reviewsList.map((review: ApiReview) => {
          // userName에서 마지막 글자만 남기고 나머지는 **로 마스킹
          const userName = review.userName || '익명'
          const maskedName =
            userName.length > 1 ? `${userName[0]}${'*'.repeat(userName.length - 1)}` : userName

          // createdAt을 YYYY.MM.DD 형식으로 변환
          const dateStr = review.createdAt
            ? new Date(review.createdAt)
                .toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })
                .replace(/\. /g, '.')
                .replace(/\.$/, '')
            : ''

          // UUID를 number로 변환 (임시 - ReviewList 컴포넌트가 number를 기대함)
          // UUID의 첫 8자리를 16진수로 파싱하여 number로 변환
          let numericId = 0
          if (review.id) {
            try {
              // UUID 형식: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              // 첫 8자리를 16진수로 파싱
              const hexPart = review.id.replace(/-/g, '').substring(0, 8)
              numericId = parseInt(hexPart, 16) || 0
            } catch {
              // 파싱 실패 시 해시값 사용
              numericId = review.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
            }
          }

          return {
            id: numericId,
            author: maskedName,
            rating: review.rating || 0,
            date: dateStr,
            content: review.content || '',
            images: review.images || [],
            helpful: review.helpfulCount || 0,
            verified: !!review.orderItemId, // orderItemId가 있으면 구매확정으로 간주
          }
        })

        setReviews(convertedReviews)
        setTotalReviews(reviewsList.length)

        // 평균 평점 계산
        if (reviewsList.length > 0) {
          const sum = reviewsList.reduce((acc, r) => acc + (r.rating || 0), 0)
          const avg = sum / reviewsList.length
          setAverageRating(avg)
        } else {
          setAverageRating(0)
        }

        // 평점 분포 계산
        const distribution = [5, 4, 3, 2, 1].map((rating) => ({
          rating,
          count: reviewsList.filter((r: ApiReview) => r.rating === rating).length,
        }))
        setRatingDistribution(distribution)
      } catch (error: any) {
        console.error('리뷰 조회 실패:', error)
        // 리뷰 조회 실패는 에러 토스트를 표시하지 않고 빈 배열로 처리
        setReviews([])
        setTotalReviews(0)
        setAverageRating(0)
        setRatingDistribution([
          { rating: 5, count: 0 },
          { rating: 4, count: 0 },
          { rating: 3, count: 0 },
          { rating: 2, count: 0 },
          { rating: 1, count: 0 },
        ])
      } finally {
        setIsLoadingReviews(false)
      }
    }

    if (mounted && productId) {
      fetchReviews()
    }
  }, [mounted, productId])

  // 상품명에 따른 이미지 매핑은 lib/utils/product-images.ts의 getProductImages 함수 사용

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
    ? (() => {
        const productName = product.productName || product.name || ''
        const imageUrls = product.imageUrls || product.images || []
        // imageUrls가 비어있으면 productName에 맞는 이미지 사용
        const images = getProductImages(productName, product.id, imageUrls)

        return {
          id: product.id,
          name: productName,
          farm: product.farmName || '',
          farmId: product.sellerId || '',
          location: product.farmLocation || '',
          price: product.price || 0,
          originalPrice:
            product.productStatus === 'DISCOUNTED'
              ? (product.price || 0) * 1.2
              : product.price || 0,
          images,
          rating: averageRating > 0 ? averageRating : product.rating || 0,
          reviews: totalReviews > 0 ? totalReviews : product.reviewCount || 0,
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
      })()
    : dummyProduct

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
      productId: String(displayProduct.id),
      sellerId: String(displayProduct.farmId),
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
      productId: String(displayProduct.id),
      sellerId: String(displayProduct.farmId),
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
            {!isLoadingReviews && (
              <ReviewSummary
                averageRating={averageRating > 0 ? averageRating : displayProduct.rating}
                totalReviews={totalReviews > 0 ? totalReviews : displayProduct.reviews}
                ratingDistribution={ratingDistribution}
              />
            )}

            {/* Review Form */}
            {showReviewForm && (
              <ReviewForm
                productId={String(displayProduct.id)}
                orderItemId={orderItemId}
                onSubmit={(review) => {
                  console.log('Review submitted:', review)
                  setShowReviewForm(false)
                  // 리뷰 등록 후 리뷰 목록 새로고침
                  if (productId) {
                    const fetchReviews = async () => {
                      try {
                        const response = await reviewService.getProductReviews(productId, {
                          page: 0,
                          size: 50,
                        })
                        const reviewsList = Array.isArray(response?.content) ? response.content : []

                        const convertedReviews: ReviewComponentType[] = reviewsList.map(
                          (review: ApiReview) => {
                            const userName = review.userName || '익명'
                            const maskedName =
                              userName.length > 1
                                ? `${userName[0]}${'*'.repeat(userName.length - 1)}`
                                : userName

                            const dateStr = review.createdAt
                              ? new Date(review.createdAt)
                                  .toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                  })
                                  .replace(/\. /g, '.')
                                  .replace(/\.$/, '')
                              : ''

                            let numericId = 0
                            if (review.id) {
                              try {
                                const hexPart = review.id.replace(/-/g, '').substring(0, 8)
                                numericId = parseInt(hexPart, 16) || 0
                              } catch {
                                numericId = review.id
                                  .split('')
                                  .reduce((acc, char) => acc + char.charCodeAt(0), 0)
                              }
                            }

                            return {
                              id: numericId,
                              author: maskedName,
                              rating: review.rating || 0,
                              date: dateStr,
                              content: review.content || '',
                              images: review.images || [],
                              helpful: review.helpfulCount || 0,
                              verified: !!review.orderItemId,
                            }
                          }
                        )

                        setReviews(convertedReviews)
                        setTotalReviews(reviewsList.length)

                        if (reviewsList.length > 0) {
                          const sum = reviewsList.reduce((acc, r) => acc + (r.rating || 0), 0)
                          const avg = sum / reviewsList.length
                          setAverageRating(avg)
                        } else {
                          setAverageRating(0)
                        }

                        const distribution = [5, 4, 3, 2, 1].map((rating) => ({
                          rating,
                          count: reviewsList.filter((r: ApiReview) => r.rating === rating).length,
                        }))
                        setRatingDistribution(distribution)
                      } catch (error) {
                        console.error('리뷰 목록 새로고침 실패:', error)
                      }
                    }
                    fetchReviews()
                  }
                }}
                onCancel={() => {
                  setShowReviewForm(false)
                  setOrderItemId(undefined)
                }}
              />
            )}

            {/* Reviews */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  고객 리뷰 ({totalReviews > 0 ? totalReviews : displayProduct.reviews})
                </h2>
                {!showReviewForm && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      // 리뷰 작성 버튼 클릭 시 주문 내역 조회하여 orderItemId 찾기
                      setIsLoadingOrderItem(true)
                      try {
                        const ordersResponse = await orderService.getOrders({ page: 0, size: 100 })
                        const orders = ordersResponse.content || []

                        // 해당 상품이 포함된 주문 항목 찾기
                        let foundOrderItemId: string | undefined = undefined
                        for (const order of orders) {
                          if (order.items && Array.isArray(order.items)) {
                            const matchingItem = order.items.find((item: OrderItem) => {
                              // productId가 UUID 문자열이거나 number일 수 있음
                              const itemProductId = String(item.productId || '')
                              const targetProductId = String(displayProduct.id)
                              return itemProductId === targetProductId
                            })

                            if (matchingItem) {
                              // OrderItem의 id가 orderItemId (UUID 문자열 또는 number)
                              // API 응답에서 id가 string (UUID)인 경우와 number인 경우 모두 처리
                              if (matchingItem.id !== undefined && matchingItem.id !== null) {
                                // id가 있으면 string으로 변환
                                foundOrderItemId = String(matchingItem.id)
                              } else {
                                // id가 없는 경우, API 응답 구조를 확인해야 함
                                // 일부 API는 orderItemId를 별도 필드로 제공할 수 있음
                                console.warn(
                                  'OrderItem에 id가 없습니다. API 응답 구조를 확인해주세요.',
                                  matchingItem
                                )
                                // 임시로 orderId와 productId를 조합하여 사용 (실제로는 API 수정 필요)
                                if (order.orderId && matchingItem.productId) {
                                  // 이 방법은 권장되지 않음 - API에서 orderItemId를 제공해야 함
                                  console.warn(
                                    '임시 orderItemId 생성:',
                                    order.orderId,
                                    matchingItem.productId
                                  )
                                }
                              }
                              break
                            }
                          }
                        }

                        if (foundOrderItemId) {
                          setOrderItemId(foundOrderItemId)
                          setShowReviewForm(true)
                        } else {
                          toast({
                            title: '리뷰 작성 불가',
                            description:
                              '주문 내역이 없습니다. 상품을 구매한 후에 리뷰를 작성할 수 있습니다.',
                            variant: 'destructive',
                          })
                        }
                      } catch (error: any) {
                        console.error('주문 내역 조회 실패:', error)
                        toast({
                          title: '리뷰 작성 불가',
                          description: '주문 내역을 불러올 수 없습니다. 다시 시도해주세요.',
                          variant: 'destructive',
                        })
                      } finally {
                        setIsLoadingOrderItem(false)
                      }
                    }}
                    disabled={isLoadingOrderItem}
                  >
                    {isLoadingOrderItem ? '확인 중...' : '리뷰 작성'}
                  </Button>
                )}
              </div>
              {isLoadingReviews ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">리뷰를 불러오는 중...</p>
                </div>
              ) : (
                <ReviewList reviews={reviews} />
              )}
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
