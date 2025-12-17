import { sellerApi, settlementApi } from '../client'
import {
  SellerApplyRequestDto,
  MySettlementResponse,
  PaginatedResponse,
  PaginationParams,
  SellerInfoData,
} from '../types'

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

  // 판매자 정보 조회
  async getSellerInfo(userId: string): Promise<SellerInfoData> {
    const response = await sellerApi.get<{ status: number; data: SellerInfoData; message: string }>(
      `/api/v1/sellers/sellerInfo/${userId}`
    )
    return response.data
  },

  // 정산 내역 조회 (support-service 사용)
  // async getSettlements(params?: PaginationParams): Promise<PaginatedResponse<Settlement>> {
  //   try {
  //     const response = await settlementApi.get<{ data: PaginatedResponse<Settlement> }>(
  //       '/api/v1/settlements',
  //       {
  //         params: params as Record<string, string | number | boolean | undefined> | undefined,
  //       }
  //     )
  //     // API 응답이 { status, data: { content, ... }, message } 형태이므로 data 필드 추출
  //     return response.data
  //   } catch (error: unknown) {
  //     // 404 에러는 정산 내역이 없는 것으로 처리 (정상 케이스)
  //     if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
  //       // 빈 페이지네이션 응답 반환
  //       return {
  //         content: [],
  //         page: params?.page || 0,
  //         size: params?.size || 20,
  //         totalElements: 0,
  //         totalPages: 0,
  //         hasNext: false,
  //         hasPrevious: false,
  //       }
  //     }
  //     // 다른 에러는 그대로 throw
  //     throw error
  //   }
  // },
}
