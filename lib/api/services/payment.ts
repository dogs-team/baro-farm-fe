import { paymentApi, orderApi, supportApi, checkCookies, API_URLS } from '../client'
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
  // 예치금 계정 생성 (회원가입 시 자동 생성)
  // [1] deposit API는 support-service로 이동됨
  async createDeposit(): Promise<void> {
    await supportApi.post('/api/v1/deposits/create')
  },

  // 예치금 조회
  // [1] deposit API는 support-service로 이동됨
  async getDeposit(): Promise<{ amount: number; userId?: string }> {
    // [1] 요청 전 상태 확인
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown'
    console.log('[DepositService] getDeposit 요청 전 상태:', {
      현재_Origin: currentOrigin,
      API_URL: API_URLS.SUPPORT,
      rewrites_사용: API_URLS.SUPPORT.startsWith('/'),
    })

    const response = await supportApi.get<{ data: { userId?: string; amount: number } }>(
      '/api/v1/deposits'
    )

    // [2] 응답 후 상태 확인
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const cookieInfo = checkCookies()
        const apiOrigin = API_URLS.SUPPORT.startsWith('/')
          ? currentOrigin
          : new URL(API_URLS.SUPPORT).origin

        console.log('[DepositService] getDeposit 응답 후 상태:', {
          access_token: cookieInfo.accessToken ? '있음 (일반 쿠키)' : '없음 또는 HttpOnly',
          refresh_token: cookieInfo.refreshToken ? '있음 (일반 쿠키)' : '없음 또는 HttpOnly',
          모든_쿠키: Object.keys(cookieInfo.allCookies),
          현재_Origin: currentOrigin,
          API_Origin: apiOrigin,
        })
      }, 100)
    }

    // API 응답이 { status, data: { userId, amount }, message } 형태이므로 data 필드 추출
    return response.data
  },

  // 예치금 충전 요청 생성
  // [1] deposit API는 support-service로 이동됨
  async createCharge(
    data: DepositChargeCreateRequest
  ): Promise<{ chargeId: string; amount: number }> {
    const response = await supportApi.post<{ data: { chargeId: string; amount: number } }>(
      '/api/v1/deposits/charges',
      data
    )
    // API 응답이 { status, data: { chargeId, amount }, message } 형태이므로 data 필드 추출
    return response.data || response
  },

  // 예치금으로 주문 결제
  // [1] deposit API는 support-service로 이동됨
  async payWithDeposit(data: DepositPaymentRequest): Promise<Payment> {
    return supportApi.post<Payment>('/api/v1/deposits/pay', data)
  },

  // 예치금 결제 환불
  // [1] deposit API는 support-service로 이동됨
  async refundDeposit(data: DepositRefundRequest): Promise<Payment> {
    return supportApi.post<Payment>('/api/v1/deposits/refund', data)
  },
}
