import { userApi } from '../client'
import {
  SellerApplyRequestDto,
  MySettlementResponse,
  SellerInfoBulkItem,
  SellerInfoData,
} from '../types'

const normalizeBulkSellerInfo = (
  response:
    | { data?: unknown }
    | SellerInfoBulkItem[]
    | Record<string, SellerInfoData>
    | unknown
): SellerInfoBulkItem[] => {
  const raw =
    response && typeof response === 'object' && 'data' in response
      ? (response as { data?: unknown }).data
      : response

  if (Array.isArray(raw)) {
    return raw as SellerInfoBulkItem[]
  }

  if (raw && typeof raw === 'object') {
    return Object.entries(raw as Record<string, SellerInfoData>).map(([userId, value]) => ({
      userId,
      ...value,
    }))
  }

  return []
}

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

  async getSellerInfoBulks(userIds: string[]): Promise<SellerInfoBulkItem[]> {
    if (userIds.length === 0) {
      return []
    }

    try {
      const response = await userApi.post<
        { data?: SellerInfoBulkItem[] | Record<string, SellerInfoData> } | SellerInfoBulkItem[]
      >('/api/v1/sellers/sellerInfo/bulks', userIds)

      return normalizeBulkSellerInfo(response)
    } catch (error) {
      const apiError = error as { status?: number }
      if (apiError.status !== 404) {
        throw error
      }

      // Bulk endpoint가 없으면 단건 조회로 보완합니다.
      const results = await Promise.allSettled(
        userIds.map(async (userId) => {
          const info = await sellerService.getSellerInfo(userId)
          return {
            userId,
            ...info,
          } satisfies SellerInfoBulkItem
        })
      )

      const fulfilled = results.filter(
        (
          result
        ): result is PromiseFulfilledResult<
          SellerInfoBulkItem & {
            userId: string
          }
        > => {
          return result.status === 'fulfilled'
        }
      )

      return fulfilled.map((result) => result.value)
    }
  },
}
