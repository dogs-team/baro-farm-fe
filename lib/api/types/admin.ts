import type { PaginationParams, PaginatedResponse } from './common'

export type AdminUserType = 'SELLER' | 'CUSTOMER' | 'ADMIN'
export type AdminUserState = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'WITHDRAWN'
export type AdminSellerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
export type AdminSellerActionStatus = 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export interface AdminSellerApplicationResponse {
  userId: string
  email: string
  name: string
  phone: string
  userType: AdminUserType
  userState: AdminUserState
  sellerStatus: AdminSellerApplicationStatus
  storeName: string
  businessRegNo: string
  businessOwnerName: string
}

export interface AdminSellerApplicationListParams extends PaginationParams {
  sellerStatus?: AdminSellerApplicationStatus
}

export interface SellerStatusUpdateRequest {
  sellerStatus: AdminSellerActionStatus
  reason?: string
}

export type AdminSellerApplicationPage = PaginatedResponse<AdminSellerApplicationResponse>
