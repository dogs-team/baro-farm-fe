const GATEWAY_URL = (
  process.env.NEXT_PUBLIC_API_GATEWAY_URL &&
  process.env.NEXT_PUBLIC_API_GATEWAY_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_API_GATEWAY_URL
    : 'http://3.34.14.73:8080'
).replace(/\/$/, '')

export const SERVICE_PREFIX = {
  AUTH: '/auth-service',
  BUYER: '/buyer-service',
  SELLER: '/seller-service',
  ORDER: '/order-service',
  PAYMENT: '/payment-service',
  AI: '/ai-service',
  SUPPORT: '/support-service',
} as const

export const API_URLS = {
  AUTH:
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL &&
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_AUTH_SERVICE_URL.replace(/\/$/, '')
      : `${GATEWAY_URL}${SERVICE_PREFIX.AUTH}`,
  BUYER:
    process.env.NEXT_PUBLIC_BUYER_SERVICE_URL &&
    process.env.NEXT_PUBLIC_BUYER_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_BUYER_SERVICE_URL.replace(/\/$/, '')
      : `${GATEWAY_URL}${SERVICE_PREFIX.BUYER}`,
  SELLER:
    process.env.NEXT_PUBLIC_SELLER_SERVICE_URL &&
    process.env.NEXT_PUBLIC_SELLER_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_SELLER_SERVICE_URL.replace(/\/$/, '')
      : `${GATEWAY_URL}${SERVICE_PREFIX.SELLER}`,
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
