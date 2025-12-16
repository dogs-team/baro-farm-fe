// =====================
// Delivery Types
// =====================
export type DeliveryStatus = 'READY' | 'SHIPPED' | 'DELIVERING' | 'DELIVERED'

export interface ShipDeliveryRequest {
  courier?: string
  trackingNumber?: string
}

export interface DeliveryDetailInfo {
  deliveryId: string // UUID
  orderId: string // UUID
  deliveryStatus: DeliveryStatus
  courier?: string
  trackingNumber?: string
  address?: Address
  shippedAt?: string // ISO date-time
  deliveredAt?: string // ISO date-time
}

// Legacy type for backward compatibility
export interface Delivery extends DeliveryDetailInfo {
  id?: number | string
  status?: DeliveryStatus
  carrier?: string
  estimatedDate?: string
  history?: DeliveryHistory[]
}

export interface DeliveryHistory {
  status: DeliveryStatus
  location?: string
  message?: string
  timestamp: string
}

// Import Address from order.ts to avoid duplication
import type { Address } from './order'
