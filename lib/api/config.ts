// lib/api/config.ts

// API Service URLs Configuration
// 모든 요청은 Gateway를 통해 라우팅 (NEXT_PUBLIC_GATEWAY_URL)

// 로컬 개발 환경에서는 실제 서버 URL 사용 (localhost:8080은 로컬 Gateway가 아닌 경우)
// 프로덕션에서는 환경 변수로 설정된 Gateway URL 사용
const GATEWAY_BASE = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://3.34.14.73:8080'

// Gateway 라우팅 규칙(prefix)과 1:1로 맞춤
export const SERVICE_PREFIX = {
  AUTH: '/auth-service',
  BUYER: '/buyer-service',
  SELLER: '/seller-service',
  ORDER: '/order-service',
  SUPPORT: '/support-service',
} as const

export const API_URLS = {
  // Auth Module
  AUTH: `${GATEWAY_BASE}${SERVICE_PREFIX.AUTH}`,

  // Buyer Module (buyer, cart, product → buyer-service로 라우팅)
  BUYER: `${GATEWAY_BASE}${SERVICE_PREFIX.BUYER}`,
  CART: `${GATEWAY_BASE}${SERVICE_PREFIX.BUYER}`,
  PRODUCT: `${GATEWAY_BASE}${SERVICE_PREFIX.BUYER}`,

  // Seller Module (seller, farm → seller-service로 라우팅)
  SELLER: `${GATEWAY_BASE}${SERVICE_PREFIX.SELLER}`,
  FARM: `${GATEWAY_BASE}${SERVICE_PREFIX.SELLER}`,

  // Order Module (order, payment → order-service로 라우팅)
  ORDER: `${GATEWAY_BASE}${SERVICE_PREFIX.ORDER}`,
  PAYMENT: `${GATEWAY_BASE}${SERVICE_PREFIX.ORDER}`,

  // Support Module (settlement, delivery, notification, experience, search, review → support-service로 라우팅)
  SETTLEMENT: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,
  DELIVERY: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,
  NOTIFICATION: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,
  EXPERIENCE: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,
  SEARCH: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,
  REVIEW: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,
} as const

export type ServiceName = keyof typeof API_URLS
