import { userApi } from '../client'
import type {
  AdminSellerApplicationListParams,
  AdminSellerApplicationPage,
  SellerStatusUpdateRequest,
} from '../types'

export const adminService = {
  async getSellerApplications(
    params: AdminSellerApplicationListParams
  ): Promise<AdminSellerApplicationPage> {
    return userApi.get<AdminSellerApplicationPage>('/api/v1/admin/sellers/applications', {
      params: {
        sellerStatus: params.sellerStatus,
        page: params.page,
        size: params.size,
        sort: params.sort,
      },
    })
  },

  async updateSellerStatus(userId: string, data: SellerStatusUpdateRequest): Promise<void> {
    await userApi.post(`/api/v1/admin/sellers/${userId}/status`, data)
  },
}
