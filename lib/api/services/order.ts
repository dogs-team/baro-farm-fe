import { orderApi } from '../client'
import type {
  OrderDetailInfo,
  OrderCreateRequest,
  OrderCancelInfo,
  PaginatedResponse,
  PaginationParams,
} from '../types'

export const orderService = {
  // 주문 목록 조회
  async getOrders(params?: PaginationParams): Promise<PaginatedResponse<OrderDetailInfo>> {
    const response = await orderApi.get<{ data: PaginatedResponse<OrderDetailInfo> }>(
      '/api/v1/orders',
      {
        params: params as Record<string, string | number | boolean | undefined>,
      }
    )
    // API 응답이 { status, data: { content, ... }, message } 형태이므로 data 필드 추출
    return response.data
  },

  // 주문 상세 조회
  async getOrder(orderId: string): Promise<OrderDetailInfo> {
    const response = await orderApi.get<{ data: OrderDetailInfo }>(`/api/v1/orders/${orderId}`)
    return response.data
  },

  // 주문 생성
  async createOrder(data: OrderCreateRequest): Promise<OrderDetailInfo> {
    const response = await orderApi.post<{ data: OrderDetailInfo }>('/api/v1/orders', data)
    return response.data
  },

  // 주문 취소
  async cancelOrder(orderId: string, data?: OrderCancelInfo): Promise<OrderCancelInfo> {
    const response = await orderApi.post<{ data: OrderCancelInfo }>(
      `/api/v1/orders/${orderId}/cancel`,
      data || {}
    )
    return response.data
  },
}
