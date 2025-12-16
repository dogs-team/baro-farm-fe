import { sellerApi } from '../client'
import type { SellerApplyRequestDto, MySettlementResponse } from '../types'

export const sellerService = {
  // 판매자 신청
  async applyForSeller(data: SellerApplyRequestDto): Promise<void> {
    return sellerApi.post('/api/v1/sellers/apply', data)
  },

  // 내 정산 정보 조회
  async getMySettlements(): Promise<MySettlementResponse> {
    const response = await sellerApi.get<{ data: MySettlementResponse }>('/api/v1/settlements/me')
    return response.data
  },
}
