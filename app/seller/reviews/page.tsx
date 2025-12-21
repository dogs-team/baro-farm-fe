'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Star, Package } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { reviewService } from '@/lib/api/services/review'

interface Review {
  id: string
  productId: string
  productName: string
  customerName: string
  rating: number
  content: string
  createdAt: string
  images?: string[]
}

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true)
      try {
        // TODO: 판매자 상품 리뷰 조회 API 호출
        // const response = await sellerService.getSellerReviews({ page, size: 10 })
        // setReviews(response.content || [])
        // setTotalPages(response.totalPages || 0)

        // 임시 데이터
        await new Promise((resolve) => setTimeout(resolve, 500))
        setReviews([])
        setTotalPages(0)
      } catch (error) {
        console.error('리뷰 조회 실패:', error)
        setReviews([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [page])

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">마이페이지로</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">상품 리뷰 관리</h1>
          <p className="text-muted-foreground">판매하신 상품에 대한 리뷰를 확인하실 수 있습니다</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">리뷰를 불러오는 중...</div>
          </div>
        ) : reviews.length === 0 ? (
          <Card className="p-12 text-center">
            <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">리뷰가 없습니다</h3>
            <p className="text-muted-foreground mb-6">아직 상품에 대한 리뷰가 없습니다.</p>
            <Button asChild>
              <Link href="/farmer/products">상품 관리하기</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/products/${review.productId}`}
                        className="font-semibold text-lg hover:text-primary"
                      >
                        {review.productName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">{renderStars(review.rating)}</div>
                      <span className="text-sm text-muted-foreground">
                        {review.customerName} · {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{review.content}</p>
                  </div>
                </div>

                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`리뷰 이미지 ${index + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </Card>
            ))}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  이전
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  다음
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
