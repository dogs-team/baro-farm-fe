import { orderApi } from '../client'
import type { Order, CreateOrderRequest, PaginatedResponse, PaginationParams } from '../types'

export const orderService = {
  // 주문 목록 조회 (Order Service - 일반 패턴 적용, v1 여부는 백엔드 확인 필요)
  async getOrders(params?: PaginationParams): Promise<PaginatedResponse<Order>> {
    return orderApi.get<PaginatedResponse<Order>>('/api/v1/orders', { params })
  },

  // 주문 상세 조회
  async getOrder(id: number): Promise<Order> {
    return orderApi.get<Order>(`/api/v1/orders/${id}`)
  },

  // 주문 번호로 조회
  async getOrderByNumber(orderNumber: string): Promise<Order> {
    return orderApi.get<Order>(`/api/v1/orders/number/${orderNumber}`)
  },

  // 주문 생성
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    return orderApi.post<Order>('/api/v1/orders', data)
  },

  // 주문 취소
  async cancelOrder(id: number, reason?: string): Promise<Order> {
    return orderApi.post<Order>(`/api/v1/orders/${id}/cancel`, { reason })
  },

  // 환불 요청
  async requestRefund(id: number, reason: string): Promise<Order> {
    return orderApi.post<Order>(`/api/v1/orders/${id}/refund`, { reason })
  },

  // 구매 확정
  async confirmOrder(id: number): Promise<Order> {
    return orderApi.post<Order>(`/api/v1/orders/${id}/confirm`)
  },
}
