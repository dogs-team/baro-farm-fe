import { paymentApi } from '../client'
import type { Payment, CreatePaymentRequest } from '../types'

export const paymentService = {
  // 결제 생성 (Order Service - 일반 패턴 적용, v1 여부는 백엔드 확인 필요)
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    return paymentApi.post<Payment>('/api/v1/payments', data)
  },

  // 결제 조회
  async getPayment(id: number): Promise<Payment> {
    return paymentApi.get<Payment>(`/api/v1/payments/${id}`)
  },

  // 주문별 결제 조회
  async getPaymentByOrder(orderId: number): Promise<Payment> {
    return paymentApi.get<Payment>(`/api/v1/payments/order/${orderId}`)
  },

  // 결제 취소
  async cancelPayment(id: number, reason?: string): Promise<Payment> {
    return paymentApi.post<Payment>(`/api/v1/payments/${id}/cancel`, { reason })
  },

  // 결제 확인 (PG 콜백) - 토스페이먼츠 결제 승인
  // 서버에서 시크릿 키를 사용하여 결제 승인 처리
  async confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<Payment> {
    return paymentApi.post<Payment>('/api/v1/payments/confirm', {
      paymentKey,
      orderId,
      amount,
    })
  },
}
