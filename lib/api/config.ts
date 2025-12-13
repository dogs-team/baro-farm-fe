// API Service URLs Configuration
// 백엔드 모듈/포트 매핑:
// - eureka       : 8761 (Service Registry)
// - config       : 8888 (Config Server)
// - gateway      : 8080 (API Gateway) - 모든 요청은 Gateway를 통해 라우팅
// - baro-auth    : 8081 (auth)
// - baro-buyer   : 8082 (buyer, cart, product)
// - baro-seller  : 8085 (seller, farm)
// - baro-order   : 8087 (order, payment)
// - baro-support : 8089 (settlement, delivery, notification, experience, search, review)

// Gateway를 통한 접근 (프로덕션)
const GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://3.34.14.73:8080'

// 개발 환경에서도 Gateway를 통해 접근 (실제 서버와 통신)
// 로컬 개발 서버를 사용하려면 환경 변수로 설정
const isDevelopment = process.env.NODE_ENV === 'development'
const useLocalhost = process.env.NEXT_PUBLIC_USE_LOCALHOST === 'true'

export const API_URLS = {
  // Auth Module - Gateway를 통해 접근 (기본값)
  AUTH:
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8081' : GATEWAY_URL),

  // Buyer Module (buyer, cart, product → Gateway를 통해 접근)
  BUYER:
    process.env.NEXT_PUBLIC_BUYER_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8082' : GATEWAY_URL),
  CART:
    process.env.NEXT_PUBLIC_CART_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8082' : GATEWAY_URL),
  PRODUCT:
    process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8082' : GATEWAY_URL),

  // Seller Module (seller, farm → Gateway를 통해 접근)
  SELLER:
    process.env.NEXT_PUBLIC_SELLER_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8085' : GATEWAY_URL),
  FARM:
    process.env.NEXT_PUBLIC_FARM_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8085' : GATEWAY_URL),

  // Order Module (order, payment → Gateway를 통해 접근)
  ORDER:
    process.env.NEXT_PUBLIC_ORDER_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8087' : GATEWAY_URL),
  PAYMENT:
    process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8087' : GATEWAY_URL),

  // Support Module (모두 Gateway를 통해 접근)
  SETTLEMENT:
    process.env.NEXT_PUBLIC_SETTLEMENT_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8089' : GATEWAY_URL),
  DELIVERY:
    process.env.NEXT_PUBLIC_DELIVERY_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8089' : GATEWAY_URL),
  NOTIFICATION:
    process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8089' : GATEWAY_URL),
  EXPERIENCE:
    process.env.NEXT_PUBLIC_EXPERIENCE_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8089' : GATEWAY_URL),
  SEARCH:
    process.env.NEXT_PUBLIC_SEARCH_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8089' : GATEWAY_URL),
  REVIEW:
    process.env.NEXT_PUBLIC_REVIEW_SERVICE_URL ||
    (useLocalhost ? 'http://localhost:8089' : GATEWAY_URL),
} as const

export type ServiceName = keyof typeof API_URLS
