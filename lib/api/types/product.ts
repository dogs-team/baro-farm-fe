// =====================
// Product Types
// =====================
export type ProductCategory = 'FRUIT' | 'VEGETABLE' | 'GRAIN' | 'NUT' | 'ROOT' | 'MUSHROOM' | 'ETC'
export type ProductStatus = 'ON_SALE' | 'DISCOUNTED' | 'SOLD_OUT' | 'HIDDEN' | 'DELETED'

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
  // Legacy fields for backward compatibility
  name?: string
  images?: string[]
  category?: string
  stock?: number
  farmId?: number
  farmName?: string
  farmLocation?: string
  rating?: number
  reviewCount?: number
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
