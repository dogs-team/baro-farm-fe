// =====================
// Payment Types
// =====================
export interface TossPaymentConfirmRequest {
  paymentKey: string
  orderId: string
  amount: number
}

export interface TossPaymentRefundRequest {
  paymentKey: string
  cancelReason: string
  cancelAmount?: number
}

export interface DepositChargeCreateRequest {
  amount: number
}

export interface DepositPaymentRequest {
  orderId: string // UUID
  amount: number
}

export interface DepositRefundRequest {
  orderId: string // UUID
  amount?: number
}

// Legacy types for backward compatibility
export interface Payment {
  id?: number
  orderId: number | string
  amount: number
  method?: PaymentMethod
  status?: PaymentStatus
  transactionId?: string
  paidAt?: string
  createdAt?: string
}

export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'KAKAO_PAY' | 'NAVER_PAY' | 'TOSS'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'

export interface CreatePaymentRequest {
  orderId: number | string
  method?: PaymentMethod
  amount: number
}
