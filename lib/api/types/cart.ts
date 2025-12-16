// =====================
// Cart Types
// =====================
export interface CartItemInfo {
  itemId: string // UUID
  productId: string // UUID
  quantity: number
  unitPrice: number
  productName?: string // Optional for display
  productImage?: string // Optional for display
}

export interface CartInfo {
  cartId: string // UUID
  buyerId: string // UUID
  items: CartItemInfo[]
  totalPrice: number
  createdAt: string
  updatedAt: string
}

export interface AddItemRequest {
  productId: string // UUID
  quantity: number
}

export interface UpdateQuantityRequest {
  quantity: number
}

export interface UpdateOptionRequest {
  // Option fields to be defined based on backend
  [key: string]: unknown
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
