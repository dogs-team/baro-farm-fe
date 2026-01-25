// =====================
// Product Types
// =====================
export type ProductCategory = 'FRUIT' | 'VEGETABLE' | 'GRAIN' | 'NUT' | 'ROOT' | 'MUSHROOM' | 'ETC'
export type ProductStatus = 'ON_SALE' | 'DISCOUNTED' | 'SOLD_OUT' | 'HIDDEN' | 'DELETED'

// 백엔드에서 그대로 반환하는 Product DB
export interface Product {
  id: string // UUID
  sellerId: string // UUID
  productName: string
  description: string
  productCategory: ProductCategory
  price: number
  stockQuantity: number
  productStatus: ProductStatus
  imageUrls: string[]
  createdAt: string
  updatedAt: string
  reviewCount?: number // 리뷰 개수 (옵셔널)
}

export type ImageUpdateMode = 'KEEP' | 'REPLACE' | 'CLEAR'

// 상품 생성 요청 (multipart/form-data로 전송)
export interface ProductCreateRequest {
  productName: string
  description: string
  categoryId: string // UUID
  price: number // Long
  stockQuantity: number // Integer
  productStatus?: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT' | 'DELETED'
  // imageUrls는 제거됨 - 이미지 파일은 FormData로 직접 전송
}

// 상품 수정 요청 (multipart/form-data로 전송)
export interface ProductUpdateRequest {
  productName?: string
  description?: string
  categoryId?: string // UUID
  price?: number // Long
  stockQuantity?: number // Integer
  productStatus?: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT' | 'DELETED'
  imageUpdateMode?: ImageUpdateMode
  // imageUrls는 제거됨 - 이미지 파일은 FormData로 직접 전송
}

// 상품 상세 정보 (API 응답)
export interface ProductDetailInfo {
  id: string // UUID
  sellerId: string // UUID
  productName: string
  description: string
  categoryId: string | null // UUID
  categoryCode: string | null
  categoryName: string | null
  price: number // Long
  stockQuantity: number // Integer
  productStatus: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT' | 'DELETED'
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
  imageUrls: string[] // 이미지 URL 배열
  positiveReviewSummary: string[] // 긍정 리뷰 요약
  negativeReviewSummary: string[] // 부정 리뷰 요약
}

export interface ProductListParams {
  category?: string
  minPrice?: number
  maxPrice?: number
  farmId?: number
  keyword?: string
}
