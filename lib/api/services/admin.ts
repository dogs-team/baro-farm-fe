import { authApi } from '../client'
import type { AdminUserListParams, AdminUserPage, SellerStatusUpdateRequest } from '../types'

export const adminService = {
  async getUsers(params: AdminUserListParams): Promise<AdminUserPage> {
    const response = await authApi.get<{ data: AdminUserPage } | AdminUserPage>(
      '/api/v1/auth/admin/users',
      {
        params: {
          type: params.type,
          state: params.state,
          keyword: params.keyword,
          page: params.page,
          size: params.size,
          sort: params.sort,
        },
      }
    )

    return response && typeof response === 'object' && 'data' in response
      ? response.data
      : (response as AdminUserPage)
  },

  async updateSellerStatus(userId: string, data: SellerStatusUpdateRequest): Promise<void> {
    await authApi.post(`/api/v1/auth/sellers/${userId}/status`, data)
  },
}
