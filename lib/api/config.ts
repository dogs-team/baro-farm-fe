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
  AI: '/ai-service',
  PAYMENT: '/payment-service',
} as const

export const API_URLS = {
  // Auth Module
  AUTH: `${GATEWAY_BASE}${SERVICE_PREFIX.AUTH}`,

  // AI Module
  AI: `${GATEWAY_BASE}${SERVICE_PREFIX.AI}`,
  CART: `${GATEWAY_BASE}${SERVICE_PREFIX.BUYER}`,
  SEARCH: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,
  RANKING: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,
  RECOMMENDATION: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,

  // Buyer Module (buyer, inventory, product → buyer-service로 라우팅)
  BUYER: `${GATEWAY_BASE}${SERVICE_PREFIX.BUYER}`,
  PRODUCT: `${GATEWAY_BASE}${SERVICE_PREFIX.BUYER}`,
  INVENTORY: `${GATEWAY_BASE}${SERVICE_PREFIX.BUYER}`,

  // Seller Module (seller, farm → seller-service로 라우팅)
  SELLER: `${GATEWAY_BASE}${SERVICE_PREFIX.SELLER}`,
  FARM: `${GATEWAY_BASE}${SERVICE_PREFIX.SELLER}`,

  // Order Module (order, payment → order-service로 라우팅)
  ORDER: `${GATEWAY_BASE}${SERVICE_PREFIX.ORDER}`,
  PAYMENT: `${GATEWAY_BASE}${SERVICE_PREFIX.ORDER}`,
  // Payment Module (payment → payment-service로 라우팅)
  // PAYMENT: `${GATEWAY_BASE}${SERVICE_PREFIX.PAYMENT}`,

  // Support Module (delivery, notification, experience, search, review, deposit → support-service로 라우팅)
  // SETTLEMENT: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`, // 모듈 분리로 인한 주석 처리
  DELIVERY: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,
  NOTIFICATION: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,
  EXPERIENCE: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,
  REVIEW: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,
  DEPOSIT: `${GATEWAY_BASE}${SERVICE_PREFIX.SUPPORT}`,
} as const

export type ServiceName = keyof typeof API_URLS
