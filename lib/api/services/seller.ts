import { sellerApi } from '../client'
import type {
  SellerApplyRequestDto,
  Settlement,
  PaginatedResponse,
  PaginationParams,
} from '../types'

export const sellerService = {
  // 판매자 신청
  async applyForSeller(data: SellerApplyRequestDto): Promise<void> {
    return sellerApi.post('/api/v1/sellers/apply', data)
  },

  // 정산 내역 조회
  async getSettlements(params?: PaginationParams): Promise<PaginatedResponse<Settlement>> {
    const response = await sellerApi.get<{ data: PaginatedResponse<Settlement> }>(
      '/api/v1/settlements',
      {
        params: params as Record<string, string | number | boolean | undefined> | undefined,
      }
    )
    // API 응답이 { status, data: { content, ... }, message } 형태이므로 data 필드 추출
    return response.data
  },
}
