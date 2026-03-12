// =====================
// Product Types
// =====================
export type ProductCategory = 'FRUIT' | 'VEGETABLE' | 'GRAIN' | 'NUT' | 'ROOT' | 'MUSHROOM' | 'ETC'
export type ProductStatus = 'ON_SALE' | 'DISCOUNTED' | 'SOLD_OUT' | 'HIDDEN' | 'DELETED'

export interface ProductInventoryOption {
  inventoryId: string
  quantity: number
  unit: number
}

export interface Product {
  id: string // UUID
  sellerId: string // UUID
  productName: string
  description: string
  categoryId: string
  categoryCode?: string
  categoryName?: string
  price: number
  productStatus: ProductStatus
  imageUrls: string[]
  inventoryOptions?: ProductInventoryOption[]
  stockQuantity?: number
  productCategory?: ProductCategory
  farmName?: string
  createdAt: string
  updatedAt: string
  reviewCount?: number // 리뷰 개수 (옵셔널)
  positiveReviewSummary?: string[]
  negativeReviewSummary?: string[]
}

export interface ProductCreateRequest {
  productName: string
  description?: string
  categoryId: string
  price: number
  inventoryOptions: ProductInventoryOptionRequest[]
  productStatus?: ProductStatus
}

export interface ProductInventoryOptionRequest {
  quantity: number
  unit: number
}

export interface ProductUpdateRequest {
  productName?: string
  description?: string
  productCategory?: ProductCategory
  price?: number
  stockQuantity?: number
  productStatus?: ProductStatus
  imageUrls?: string[]
}

export interface ProductListParams {
  category?: string
  minPrice?: number
  maxPrice?: number
  farmId?: number
  keyword?: string
  page?: number
  size?: number
  sort?: string
}
