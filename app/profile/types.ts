import type { MeResponse, OrderDetailInfo } from '@/lib/api/types'

export interface ProfileUser extends MeResponse {
  name?: string
  phone?: string
  avatar?: string
}

export interface RecentOrder {
  id: string
  date: string
  status: string
  items: string[]
  total: number
}

export interface ProfileStats {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}

export interface SellerApplication {
  farmName: string
  farmAddress: string
  farmDescription: string
  businessNumber: string
}

export interface ProfileState {
  // User state
  user: ProfileUser
  isLoadingUser: boolean
  mounted: boolean

  // Orders state
  orders: OrderDetailInfo[]
  isLoadingOrders: boolean
  orderCount: number

  // Reviews state
  reviewCount: number
  isLoadingReviews: boolean

  // Deposit state
  depositBalance: number | null
  isLoadingDeposit: boolean

  // Seller state
  monthlySettlement: number | null
  isLoadingSettlement: boolean

  // UI state
  activeTab: string
  isSellerDialogOpen: boolean
  isAddressDialogOpen: boolean
  isDepositChargeDialogOpen: boolean
  editingAddressId: number | null
  chargeAmount: string
  isCharging: boolean
  sellerApplication: SellerApplication
}