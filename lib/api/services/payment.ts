import { paymentApi, orderApi } from '../client'
import type {
  TossPaymentConfirmRequest,
  TossPaymentRefundRequest,
  DepositChargeCreateRequest,
  DepositPaymentRequest,
  DepositRefundRequest,
  Payment,
} from '../types'

export const paymentService = {
  // 토스 결제 승인
  async confirmPayment(data: TossPaymentConfirmRequest): Promise<Payment> {
    return paymentApi.post<Payment>('/api/v1/payments/toss/confirm', data)
  },

  // 토스 결제 환불
  async refundPayment(data: TossPaymentRefundRequest): Promise<Payment> {
    return paymentApi.post<Payment>('/api/v1/payments/toss/refund', data)
  },

  // 토스 예치금 충전 승인
  async confirmDeposit(data: TossPaymentConfirmRequest): Promise<Payment> {
    return paymentApi.post<Payment>('/api/v1/payments/toss/confirm/deposit', data)
  },
}

export const depositService = {
  // 예치금 조회
  async getDeposit(): Promise<{ balance: number }> {
    return orderApi.get<{ balance: number }>('/api/v1/deposits')
  },

  // 예치금 충전 요청 생성
  async createCharge(
    data: DepositChargeCreateRequest
  ): Promise<{ chargeId: string; amount: number }> {
    return orderApi.post<{ chargeId: string; amount: number }>('/api/v1/deposits/charges', data)
  },

  // 예치금으로 주문 결제
  async payWithDeposit(data: DepositPaymentRequest): Promise<Payment> {
    return orderApi.post<Payment>('/api/v1/deposits/pay', data)
  },

  // 예치금 결제 환불
  async refundDeposit(data: DepositRefundRequest): Promise<Payment> {
    return orderApi.post<Payment>('/api/v1/deposits/refund', data)
  },
}
