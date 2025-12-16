// =====================
// Review Types
// =====================
export type ReviewVisibility = 'PUBLIC' | 'PRIVATE'

export interface ReviewCreateRequest {
  orderItemId: string // UUID
  rating: number // 1-5
  reviewVisibility: ReviewVisibility
  content: string
}

export interface ReviewUpdateRequest {
  rating?: number
  reviewVisibility?: ReviewVisibility
  content?: string
}

export interface Review {
  id: string // UUID (reviewId)
  orderItemId?: string // UUID
  userId?: number | string
  userName?: string
  userImage?: string
  targetType?: 'PRODUCT' | 'EXPERIENCE' | 'FARM'
  targetId?: number | string
  productId?: string // UUID
  rating: number
  content: string
  reviewVisibility?: ReviewVisibility
  images?: string[]
  helpfulCount?: number
  createdAt?: string
}
