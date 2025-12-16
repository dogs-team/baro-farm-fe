// =====================
// Order Types
// =====================
export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELED'

export interface OrderItemRequest {
  productId: string // UUID
  sellerId: string // UUID
  quantity: number
  unitPrice?: number
}

export interface OrderCreateRequest {
  receiverName: string
  phone: string
  email: string
  zipCode: string
  address: string
  addressDetail: string
  deliveryMemo?: string
  items: OrderItemRequest[]
}

export interface OrderDetailInfo {
  orderId: string // UUID
  totalAmount: number
  receiverName: string
  phone: string
  email: string
  zipCode: string
  address: string
  addressDetail: string
  deliveryMemo?: string
  status: OrderStatus
  // Additional fields may exist
  items?: OrderItem[]
  createdAt?: string
  updatedAt?: string
}

export interface OrderCancelInfo {
  orderId: string // UUID
  cancelReason?: string
  canceledAt?: string
}

// Legacy types for backward compatibility
export interface OrderItem {
  id?: number
  productId: number | string
  productName?: string
  productImage?: string
  price: number
  quantity: number
  subtotal?: number
}

export interface Order extends OrderDetailInfo {
  id?: number
  orderNumber?: string
  userId?: number
  shippingFee?: number
  finalPrice?: number
  shippingAddress?: Address
  paymentMethod?: string
}

export interface CreateOrderRequest {
  items: { productId: number | string; quantity: number }[]
  shippingAddressId?: number
  paymentMethod?: string
}

export interface Address {
  receiverName: string
  receiverPhone: string
  postalCode: string
  addressLine1: string
  addressLine2?: string
  // Legacy fields for backward compatibility
  id?: number
  name?: string
  phone?: string
  zipCode?: string
  address?: string
  detailAddress?: string
  isDefault?: boolean
}
