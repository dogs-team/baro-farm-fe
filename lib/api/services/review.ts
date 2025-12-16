import { reviewApi } from '../client'
import type {
  Review,
  ReviewCreateRequest,
  ReviewUpdateRequest,
  PaginatedResponse,
  PaginationParams,
} from '../types'

export const reviewService = {
  // 상품 리뷰 목록 조회
  async getProductReviews(
    productId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Review>> {
    const response = await reviewApi.get<
      { data: PaginatedResponse<Review> } | PaginatedResponse<Review>
    >(`/api/v1/products/${productId}/reviews`, {
      params,
    })
    // API 응답이 { status, data: { content, ... }, message } 형태이므로 data 필드 추출
    return 'data' in response && response.data
      ? response.data
      : (response as PaginatedResponse<Review>)
  },

  // 제품 리뷰 등록
  async createProductReview(productId: string, data: ReviewCreateRequest): Promise<Review> {
    return reviewApi.post<Review>(`/api/v1/products/${productId}/reviews`, data)
  },

  // 내 리뷰 목록 조회
  async getMyReviews(params?: PaginationParams): Promise<PaginatedResponse<Review>> {
    return reviewApi.get<PaginatedResponse<Review>>('/api/v1/me/reviews', { params })
  },

  // 리뷰 상세 조회
  async getReview(reviewId: string): Promise<Review> {
    return reviewApi.get<Review>(`/api/v1/reviews/${reviewId}`)
  },

  // 리뷰 수정
  async updateReview(reviewId: string, data: ReviewUpdateRequest): Promise<Review> {
    return reviewApi.put<Review>(`/api/v1/reviews/${reviewId}`, data)
  },

  // 리뷰 삭제
  async deleteReview(reviewId: string): Promise<void> {
    return reviewApi.delete(`/api/v1/reviews/${reviewId}`)
  },
}
