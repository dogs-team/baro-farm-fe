import { sellerApi } from '../client'
import type { SellerApplyRequestDto } from '../types'

export const sellerService = {
  // 판매자 신청
  async applyForSeller(data: SellerApplyRequestDto): Promise<void> {
    return sellerApi.post('/api/v1/sellers/apply', data)
  },
}
