// Seller Types
export interface SellerDashboard {
  totalSales: number
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  totalExperiences: number
  recentOrders: Order[]
  salesByMonth: { month: string; sales: number }[]
}

export interface Settlement {
  id: number
  sellerId: number
  amount: number
  fee: number
  netAmount: number
  status: SettlementStatus
  period: { start: string; end: string }
  settledAt?: string
  createdAt: string
}

export type SettlementStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

// Import Order for SellerDashboard
import type { Order } from './order'
