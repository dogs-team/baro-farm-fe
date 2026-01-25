// =====================
// Cart Types
// =====================
export interface CartItemInfo {
  itemId: string // UUID
  productId: string // UUID
  productName: string
  productCategoryName: string
  quantity: number // Integer
  unitPrice: number // Long
  lineTotalPrice: number // Long
  inventoryId: string // UUID
  unit: number // Integer (재고 단위)
  // Legacy fields for backward compatibility
  optionInfoJson?: string
  productImage?: string // Optional for display
}

export interface CartInfo {
  cartId: string | null // UUID (null if empty)
  buyerId: string | null // UUID (null if guest)
  items: CartItemInfo[]
  totalPrice: number // Long
  createdAt: string | null // ISO 8601
  updatedAt: string | null // ISO 8601
}

// API Response Types
export interface CartResponse {
  status: number
  data: CartInfo
  message: string
}

export interface AddItemRequest {
  productId: string // UUID
  quantity: number // Integer
  unitPrice: number // Long
  inventoryId: string // UUID
  // Legacy fields for backward compatibility
  optionInfoJson?: string
}

export interface UpdateQuantityRequest {
  quantity: number
}

export interface UpdateOptionRequest {
  inventoryId: string // UUID - 변경할 재고 옵션 ID
}

// Legacy types for backward compatibility
export interface CartItem extends CartItemInfo {
  id?: number
  productName: string
  productImage: string
  farmName?: string
  price: number
}

export interface Cart extends CartInfo {
  id?: number
  userId?: number
  totalItems?: number
}

export interface AddToCartRequest extends AddItemRequest {
  productId: number | string
}
