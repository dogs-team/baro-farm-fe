'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useCartStore } from '@/lib/cart-store'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { DetailPageLayout } from '@/components/layout/detail-page-layout'
import {
  ProductMainSection,
  ProductSideSection,
  ProductReviewSection,
  ProductDescriptionSection,
  type DisplayProduct,
} from '@/components/product'
import { productService } from '@/lib/api/services/product'
import { sellerService } from '@/lib/api/services/seller'
import { reviewService } from '@/lib/api/services/review'
import type { Product, Review } from '@/lib/api/types'
import type { SellerInfoData } from '@/lib/api/types/seller'
import { cartService } from '@/lib/api/services/cart'

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [sellerInfo, setSellerInfo] = useState<SellerInfoData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addItem, getTotalItems } = useCartStore()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  // 상품 데이터 로드 (상품 + 농장 + 리뷰 정보)
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return

      setIsLoading(true)
      try {
        // 상품, 농장, 리뷰 정보를 병렬로 로드
        const [productData, reviewsData] = await Promise.all([
          productService.getProduct(productId),
          reviewService.getProductReviews(productId, { page: 0, size: 100 }).catch(() => ({
            content: [],
            totalElements: 0,
          })), // 리뷰 로드 실패 시 빈 배열로 처리
        ])

        // 판매자 정보 로드 (sellerId로 판매자 정보 조회)
        let sellerData: SellerInfoData | null = null
        if (productData.sellerId) {
          try {
            sellerData = await sellerService.getSellerInfo(productData.sellerId)
          } catch (error) {
            console.warn('판매자 정보 로드 실패:', error)
            // 판매자 정보 로드 실패 시 null로 처리
          }
        }

        setProduct(productData)
        setSellerInfo(sellerData)
        setReviews(reviewsData.content || [])
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
      fetchProductData()
    }
  }, [mounted, productId, router, toast])

  // 상품명에 따른 이미지 매핑은 lib/utils/product-images.ts의 getProductImages 함수 사용

  // API에서 가져온 상품 데이터를 표시 형식으로 변환
  const displayProduct: DisplayProduct | null = product
    ? (() => {
        const p = product! // product는 확실히 존재함

        // 리뷰 데이터로 평균 평점 계산
        const averageRating =
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0

        // Product 타입의 모든 필드를 유지하면서 UI 표시용 필드들 추가
        return {
          ...p,
          // UI 표시용 추가 필드들
          originalPrice: p.productStatus === 'DISCOUNTED' ? (p.price || 0) * 1.2 : p.price || 0,
          tag: '베스트', // TODO: 태그 정보 추가
          weight: '1kg', // TODO: 무게 정보 추가
          certification: '유기농 인증', // TODO: 인증 정보 추가
          delivery: '수확 후 당일 배송', // TODO: 배송 정보 추가

          // computed 필드들 (별도 API에서 가져온 데이터 사용)
          storeName: sellerInfo?.storeName || '',
          farmLocation: '', // 판매자 정보에서는 위치 정보가 없으므로 빈 문자열
          reviews: reviews.length,
          rating: averageRating,
        } as DisplayProduct
      })()
    : null

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

  const handleAddToCart = async () => {
    if (!displayProduct) return

    try {
      // 서버 API로 장바구니에 상품 추가
      await cartService.addItemToCart({
        productId: displayProduct.id,
        quantity,
        unitPrice: displayProduct.price,
        optionInfoJson: '',
      })

      // 로컬 스토어도 업데이트 (캐시 용도)
      addItem({
        id: Number(displayProduct.id) || 0, // TODO: UUID를 number로 변환하는 로직 개선 필요
        productId: String(displayProduct.id),
        sellerId: String(displayProduct.sellerId),
        name: displayProduct.productName,
        price: displayProduct.price,
        image: displayProduct.imageUrls[0] || '/placeholder.svg',
        farm: displayProduct.storeName || '',
        quantity,
      })

      toast({
        title: '장바구니에 추가되었습니다',
        description: `${displayProduct.productName} ${quantity}개가 장바구니에 담겼습니다.`,
        action: (
          <ToastAction altText="장바구니 보기" onClick={() => router.push('/cart')}>
            장바구니 보기
          </ToastAction>
        ),
      })

      setQuantity(1)
    } catch (error) {
      console.error('장바구니 추가 실패:', error)
      toast({
        title: '장바구니 추가 실패',
        description: '장바구니에 상품을 추가하는데 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleBuyNow = async () => {
    console.log('[ProductDetail] handleBuyNow called:', {
      productId,
      quantity,
      hasDisplayProduct: !!displayProduct,
      hasProduct: !!product,
      displayProduct,
      product,
    })

    if (!displayProduct) {
      console.error('[ProductDetail] No product data available for buy now')
      toast({
        title: '상품 정보를 불러올 수 없습니다',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      })
      return
    }

    const buyNowData = {
      productId: String(displayProduct.id),
      sellerId: String(displayProduct.sellerId),
      name: displayProduct.productName,
      price: Number(displayProduct.price),
      image: displayProduct.imageUrls[0] ?? '/placeholder.svg',
      store: displayProduct.storeName || '',
      quantity,
      timestamp: Date.now(),
    }

    console.log('[ProductDetail] Generated buy now data:', buyNowData)

    if (typeof window === 'undefined') {
      console.error('[ProductDetail] window is undefined, cannot save to sessionStorage')
      return
    }

    try {
      // sessionStorage에 저장
      sessionStorage.setItem('barofarm-buynow-item', JSON.stringify(buyNowData))
      console.log('[ProductDetail] Saved buy now data to sessionStorage')

      // 저장 확인
      const saved = sessionStorage.getItem('barofarm-buynow-item')
      if (!saved) {
        console.error('[ProductDetail] Failed to save to sessionStorage')
        toast({
          title: '저장 실패',
          description: '주문 정보를 저장하는데 실패했습니다.',
          variant: 'destructive',
        })
        return
      }

      console.log('[ProductDetail] Verification - saved data:', saved)

      toast({
        title: '주문 페이지로 이동합니다',
        description: `${buyNowData.name} ${quantity}개를 주문합니다.`,
      })

      // 저장 확인 후 페이지 이동
      console.log('[ProductDetail] Navigating to checkout with buy now data...')
      router.push('/checkout?buyNow=true')
    } catch (error) {
      console.error('[ProductDetail] Error saving to sessionStorage:', error)
      toast({
        title: '저장 실패',
        description: '주문 정보를 저장하는데 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <DetailPageLayout>
        <div className="text-center">로딩 중...</div>
      </DetailPageLayout>
    )
  }

  // API 로드 완료 후 상품 데이터가 없는 경우 (에러 또는 없는 상품)
  if (!product) {
    return (
      <DetailPageLayout>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">상품을 찾을 수 없습니다</h1>
          <p className="text-muted-foreground">
            요청하신 상품이 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
          <Button asChild>
            <Link href="/products">상품 목록으로 돌아가기</Link>
          </Button>
        </div>
      </DetailPageLayout>
    )
  }

  // displayProduct가 null인 경우 (데이터 변환 실패)
  if (!displayProduct) {
    return (
      <DetailPageLayout>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">상품 정보 처리 중 오류가 발생했습니다</h1>
          <p className="text-muted-foreground">상품 정보를 표시하는데 문제가 있습니다.</p>
          <Button asChild>
            <Link href="/products">상품 목록으로 돌아가기</Link>
          </Button>
        </div>
      </DetailPageLayout>
    )
  }

  return (
    <DetailPageLayout>
      {/* Product Detail */}
      <ProductMainSection
        product={displayProduct}
        quantity={quantity}
        selectedImage={selectedImage}
        onChangeQuantity={setQuantity}
        onChangeSelectedImage={setSelectedImage}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Product Description and Reviews */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
          <ProductDescriptionSection description={displayProduct.description} />

          <ProductReviewSection
            productId={productId}
            initialRating={displayProduct.rating || 0}
            initialTotalReviews={displayProduct.reviews || 0}
            initialRatingDistribution={[
              { rating: 5, count: 0 },
              { rating: 4, count: 0 },
              { rating: 3, count: 0 },
              { rating: 2, count: 0 },
              { rating: 1, count: 0 },
            ]}
          />
        </div>

        <ProductSideSection
          farm={displayProduct.storeName || ''}
          farmId={displayProduct.sellerId}
          location="" // 판매자 정보에서는 위치 정보가 없으므로 빈 문자열
          relatedProducts={relatedProducts}
        />
      </div>
    </DetailPageLayout>
  )
}
