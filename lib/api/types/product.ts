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
}

export interface ProductCreateRequest {
  productName: string
  description?: string
  productCategory: ProductCategory
  price: number
  stockQuantity: number
  productStatus?: ProductStatus
  imageUrls?: string[]
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
}
