// 토스페이먼츠 타입 정의
declare global {
  interface Window {
    TossPayments: (clientKey: string) => TossPaymentsInstance
  }
}

export interface TossPaymentsInstance {
  requestPayment: (method: string, options: TossPaymentOptions) => Promise<TossPaymentResult>
}

export interface TossPaymentOptions {
  amount: number
  orderId: string
  orderName: string
  customerName: string
  successUrl: string
  failUrl: string
}

export interface TossPaymentResult {
  paymentKey: string
  orderId: string
  amount: number
}

export {}
