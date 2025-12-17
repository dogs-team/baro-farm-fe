'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  ReviewForm,
  ReviewList,
  ReviewSummary,
  type Review as ReviewComponentType,
} from '@/components/review'
import { reviewService } from '@/lib/api/services/review'
import { orderService } from '@/lib/api/services/order'
import type { Review as ApiReview, OrderItem } from '@/lib/api/types'

interface RatingDistribution {
  rating: number
  count: number
}

interface ProductReviewSectionProps {
  productId: string
  initialRating: number
  initialTotalReviews: number
  initialRatingDistribution: RatingDistribution[]
}

export function ProductReviewSection({
  productId,
  initialRating,
  initialTotalReviews,
  initialRatingDistribution,
}: ProductReviewSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [orderItemId, setOrderItemId] = useState<string | undefined>(undefined)
  const [isLoadingOrderItem, setIsLoadingOrderItem] = useState(false)
  const [reviews, setReviews] = useState<ReviewComponentType[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [ratingDistribution, setRatingDistribution] =
    useState<RatingDistribution[]>(initialRatingDistribution)
  const [averageRating, setAverageRating] = useState(initialRating)
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews)
  const { toast } = useToast()

  // 리뷰 데이터 로드
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return

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

    fetchReviews()
  }, [productId])

  const handleReviewSubmit = async (review: any) => {
    console.log('Review submitted:', review)
    setShowReviewForm(false)
    // 리뷰 등록 후 리뷰 목록 새로고침
    const fetchReviews = async () => {
      try {
        const response = await reviewService.getProductReviews(productId, {
          page: 0,
          size: 50,
        })
        const reviewsList = Array.isArray(response?.content) ? response.content : []

        const convertedReviews: ReviewComponentType[] = reviewsList.map((review: ApiReview) => {
          const userName = review.userName || '익명'
          const maskedName =
            userName.length > 1 ? `${userName[0]}${'*'.repeat(userName.length - 1)}` : userName

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
            verified: !!review.orderItemId,
          }
        })

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

  const handleReviewFormCancel = () => {
    setShowReviewForm(false)
    setOrderItemId(undefined)
  }

  const handleWriteReviewClick = async () => {
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
            const targetProductId = String(productId)
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
              console.warn('OrderItem에 id가 없습니다. API 응답 구조를 확인해주세요.', matchingItem)
              // 임시로 orderId와 productId를 조합하여 사용 (실제로는 API 수정 필요)
              if (order.orderId && matchingItem.productId) {
                // 이 방법은 권장되지 않음 - API에서 orderItemId를 제공해야 함
                console.warn('임시 orderItemId 생성:', order.orderId, matchingItem.productId)
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
          description: '주문 내역이 없습니다. 상품을 구매한 후에 리뷰를 작성할 수 있습니다.',
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
  }

  return (
    <>
      {/* Review Summary */}
      {!isLoadingReviews && (
        <ReviewSummary
          averageRating={averageRating > 0 ? averageRating : 0}
          totalReviews={totalReviews > 0 ? totalReviews : 0}
          ratingDistribution={ratingDistribution}
        />
      )}

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          productId={String(productId)}
          orderItemId={orderItemId}
          onSubmit={handleReviewSubmit}
          onCancel={handleReviewFormCancel}
        />
      )}

      {/* Reviews */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">고객 리뷰 ({totalReviews > 0 ? totalReviews : 0})</h2>
          {!showReviewForm && (
            <Button
              variant="outline"
              onClick={handleWriteReviewClick}
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
    </>
  )
}
