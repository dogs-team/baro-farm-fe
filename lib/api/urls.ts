const GATEWAY_URL = (
  process.env.NEXT_PUBLIC_API_GATEWAY_URL &&
  process.env.NEXT_PUBLIC_API_GATEWAY_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_API_GATEWAY_URL
    : 'http://3.34.14.73:8080'
).replace(/\/$/, '')

export const SERVICE_PREFIX = {
  USER: '/user-service',
  BUYER: '/shopping-service',
  ORDER: '/order-service',
  PAYMENT: '/payment-service',
  AI: '/ai-service',
  SUPPORT: '/support-service',
} as const

// [1] user-service는 인증과 판매자 관련 API를 함께 제공하므로 단일 base URL만 유지합니다.
const USER_SERVICE_URL =
  process.env.NEXT_PUBLIC_USER_SERVICE_URL &&
  process.env.NEXT_PUBLIC_USER_SERVICE_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_USER_SERVICE_URL.replace(/\/$/, '')
    : `${GATEWAY_URL}${SERVICE_PREFIX.USER}`

export const API_URLS = {
  USER: USER_SERVICE_URL,
  BUYER:
    process.env.NEXT_PUBLIC_BUYER_SERVICE_URL &&
    process.env.NEXT_PUBLIC_BUYER_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_BUYER_SERVICE_URL.replace(/\/$/, '')
      : `${GATEWAY_URL}${SERVICE_PREFIX.BUYER}`,
  ORDER:
    process.env.NEXT_PUBLIC_ORDER_SERVICE_URL &&
    process.env.NEXT_PUBLIC_ORDER_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_ORDER_SERVICE_URL.replace(/\/$/, '')
      : `${GATEWAY_URL}${SERVICE_PREFIX.ORDER}`,
  PAYMENT:
    process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL &&
    process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL.replace(/\/$/, '')
      : `${GATEWAY_URL}${SERVICE_PREFIX.PAYMENT}`,
  AI:
    process.env.NEXT_PUBLIC_AI_SERVICE_URL &&
    process.env.NEXT_PUBLIC_AI_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_AI_SERVICE_URL.replace(/\/$/, '')
      : `${GATEWAY_URL}${SERVICE_PREFIX.AI}`,
  SUPPORT: `${GATEWAY_URL}${SERVICE_PREFIX.SUPPORT}`,
} as const

export type ServiceName = keyof typeof API_URLS
