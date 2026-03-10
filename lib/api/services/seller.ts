import { userApi } from '../client'
import { SellerApplyRequestDto, MySettlementResponse, SellerInfoData } from '../types'

export const sellerService = {
  // [1] 판매자 기능은 별도 seller-service가 아니라 현재 user-service를 통해 조회합니다.
  async applyForSeller(data: SellerApplyRequestDto): Promise<void> {
    return userApi.post('/api/v1/sellers/apply', data)
  },

  async getMySettlements(): Promise<MySettlementResponse> {
    const response = await userApi.get<{ data: MySettlementResponse }>('/api/v1/settlements/me')
    return response.data
  },

  async getSellerInfo(userId: string): Promise<SellerInfoData> {
    const response = await userApi.get<{ status: number; data: SellerInfoData; message: string }>(
      `/api/v1/sellers/sellerInfo/${userId}`
    )
    return response.data
  },
}
