import type { MeResponse, OrderDetailInfo } from '@/lib/api/types'
import type {
  SellerApplyRequestDto,
  MySettlementResponse,
  SettlementMonth,
} from '@/lib/api/types/seller'

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

export interface ProfileActions {
  setActiveTab: (tab: string) => void
  setIsSellerDialogOpen: (open: boolean) => void
  setIsAddressDialogOpen: (open: boolean) => void
  setIsDepositChargeDialogOpen: (open: boolean) => void
  setEditingAddressId: (id: number | null) => void
  setChargeAmount: (amount: string) => void
  setSellerApplication: (application: SellerApplyRequestDto) => void
  handleSellerApplication: () => Promise<void>
  handleDepositChargeClick: () => Promise<void>
  handleLogout: () => Promise<void>
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
  settlementData: MySettlementResponse | null
  settlementMonth: SettlementMonth | null

  // Farm state
  hasFarm: boolean | null
  isCheckingFarm: boolean

  // UI state
  activeTab: string
  isSellerDialogOpen: boolean
  isAddressDialogOpen: boolean
  isDepositChargeDialogOpen: boolean
  editingAddressId: number | null
  chargeAmount: string
  isCharging: boolean
  sellerApplication: SellerApplyRequestDto
}
