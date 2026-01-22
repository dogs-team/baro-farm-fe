import type { PaginationParams, PaginatedResponse } from './common'

export type AdminUserType = 'SELLER' | 'CUSTOMER' | 'ADMIN'
export type AdminUserState = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'WITHDRAWN'
export type SellerStatus = 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export interface AdminUserSummaryResponse {
  userId: string
  email: string
  name: string
  phone: string
  userType: AdminUserType
  userState: AdminUserState
  lastLoginAt?: string | null
  createdAt: string
}

export interface AdminUserListParams extends PaginationParams {
  type?: AdminUserType
  state?: AdminUserState
  keyword?: string
}

export interface SellerStatusUpdateRequest {
  sellerStatus: SellerStatus
  reason?: string
}

export type AdminUserPage = PaginatedResponse<AdminUserSummaryResponse>
