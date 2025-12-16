// lib/api/client.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

// ==========
// 환경 변수 및 기본 URL
// ==========

// 게이트웨이 기본값: 명시되지 않은 경우에도 항상 8080 게이트웨이를 사용
const GATEWAY_URL = (
  process.env.NEXT_PUBLIC_API_GATEWAY_URL &&
  process.env.NEXT_PUBLIC_API_GATEWAY_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_API_GATEWAY_URL
    : 'http://3.34.14.73:8080'
).replace(/\/$/, '')

export const API_URLS = {
  AUTH:
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL &&
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_AUTH_SERVICE_URL.replace(/\/$/, '')
      : `${GATEWAY_URL}/auth-service`,
  BUYER:
    process.env.NEXT_PUBLIC_BUYER_SERVICE_URL &&
    process.env.NEXT_PUBLIC_BUYER_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_BUYER_SERVICE_URL.replace(/\/$/, '')
      : `${GATEWAY_URL}/buyer-service`,
  SELLER:
    process.env.NEXT_PUBLIC_SELLER_SERVICE_URL &&
    process.env.NEXT_PUBLIC_SELLER_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_SELLER_SERVICE_URL.replace(/\/$/, '')
      : `${GATEWAY_URL}/seller-service`,
  ORDER:
    process.env.NEXT_PUBLIC_ORDER_SERVICE_URL &&
    process.env.NEXT_PUBLIC_ORDER_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_ORDER_SERVICE_URL.replace(/\/$/, '')
      : `${GATEWAY_URL}/order-service`,
  SUPPORT: `${GATEWAY_URL}/support-service`,
}

// ==========
// 토큰/유저 관리 (localStorage)
// ==========

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_ID_KEY = 'userId'
const USER_ROLE_KEY = 'userRole'

export type StoredTokens = {
  accessToken: string
  refreshToken?: string
  userId?: string
  userRole?: string
}

export const setAccessToken = (token: string | null) => {
  if (typeof window === 'undefined') return
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    return
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export const setRefreshToken = (token: string | null) => {
  if (typeof window === 'undefined') return
  if (!token) {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
    return
  }
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export const setUserId = (userId: string | null) => {
  if (typeof window === 'undefined') return
  if (!userId) {
    window.localStorage.removeItem(USER_ID_KEY)
    return
  }
  window.localStorage.setItem(USER_ID_KEY, userId)
}

export const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(USER_ID_KEY)
}

export const getUserIdFromToken = (): string | null => {
  const token = getAccessToken()
  if (!token) return null
  try {
    // JWT는 base64로 인코딩된 3부분으로 구성: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // payload 디코딩
    const payload = JSON.parse(atob(parts[1]))
    return payload.uid || payload.userId || null
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

export const setUserRole = (role: string | null) => {
  if (typeof window === 'undefined') return
  if (!role) {
    window.localStorage.removeItem(USER_ROLE_KEY)
    return
  }
  window.localStorage.setItem(USER_ROLE_KEY, role)
}

export const getUserRole = (): string | null => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(USER_ROLE_KEY)
}

export const setAuthTokens = (tokens: StoredTokens | null) => {
  if (!tokens) {
    setAccessToken(null)
    setRefreshToken(null)
    setUserId(null)
    setUserRole(null)
    return
  }

  setAccessToken(tokens.accessToken)
  if (tokens.refreshToken) {
    setRefreshToken(tokens.refreshToken)
  }
  if (tokens.userId) {
    setUserId(tokens.userId)
  }
}

// ==========
// 에러 타입
// ==========

export interface ApiError extends Error {
  status: number
  message: string
  code?: string
  details?: any
}

// ==========
// refreshToken 으로 accessToken 재발급
// ==========

const refreshAccessTokenWithRefreshToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    console.log('[ApiClient] refreshToken이 없습니다.')
    return false
  }

  try {
    const url = `${API_URLS.AUTH}/api/v1/auth/refresh`
    console.log('[ApiClient] refreshToken으로 accessToken 재발급 시도:', url)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      console.error('[ApiClient] refreshToken API 실패:', response.status, response.statusText)
      setAuthTokens(null)
      return false
    }

    const responseData = (await response.json()) as
      | {
          userId: string
          email: string
          accessToken: string
          refreshToken?: string
        }
      | {
          status: number
          data: {
            userId: string
            email: string
            accessToken: string
            refreshToken?: string
          }
          message?: string
        }

    let tokenData: { userId: string; email: string; accessToken: string; refreshToken?: string }
    if ('data' in responseData && (responseData as any).data) {
      tokenData = (responseData as any).data
    } else if ('accessToken' in responseData) {
      tokenData = responseData as {
        userId: string
        email: string
        accessToken: string
        refreshToken?: string
      }
    } else {
      console.error('[ApiClient] refreshToken 응답 구조가 올바르지 않습니다:', responseData)
      setAuthTokens(null)
      return false
    }

    setAuthTokens({
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken || refreshToken,
      userId: tokenData.userId,
    })

    console.log('[ApiClient] accessToken 재발급 성공 및 저장 완료.')
    return true
  } catch (error) {
    console.error('[ApiClient] refresh token failed:', error)
    setAuthTokens(null)
    return false
  }
}

// ==========
// ApiClient 구현
// ==========

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  private buildUrl(endpoint: string, params?: RequestOptions['params']): string {
    // endpoint가 '/'로 시작하면 URL(base, endpoint) 사용 시 base의 path가 사라지므로
    // 직접 문자열로 합쳐서 path를 보존한다. (예: http://host/buyer-service + /api/v1/products)
    const base = this.baseUrl.replace(/\/$/, '')
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = new URL(base + path)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        url.searchParams.append(key, String(value))
      })
    }
    return url.toString()
  }

  private buildHeaders(options?: RequestInit): HeadersInit {
    const headers: Record<string, string> = {}

    // JSON 기본 헤더 (FormData인 경우 제외)
    const hasBody = options && 'body' in options && options.body !== undefined
    if (hasBody && !(options!.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    // Authorization 헤더
    const token = getAccessToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // 주문/예치금 등에서 사용하는 X-User-Id 헤더
    const userId = getUserId()
    if (userId) {
      headers['X-User-Id'] = userId
    }

    // 상품 등록 등에서 사용하는 X-User-Role 헤더
    const userRole = getUserRole()
    if (userRole) {
      headers['X-User-Role'] = userRole
    }

    return {
      ...headers,
      ...(options?.headers || {}),
    }
  }

  private async parseError(response: Response, url: string): Promise<ApiError> {
    let message = '요청 중 오류가 발생했습니다.'
    let code: string | undefined
    let details: any

    try {
      const text = await response.text()
      if (text) {
        try {
          const data = JSON.parse(text)
          message = data.message || data.error || message
          code = data.code
          details = data
        } catch {
          // JSON 파싱 실패 시 텍스트를 메시지로 사용
          message = text || message
        }
      }
    } catch {
      // ignore text read error
    }

    const error: ApiError = Object.assign(new Error(message), {
      status: response.status,
      message,
      code,
      details,
    })

    // 에러 로깅 시 순환 참조 방지를 위해 각 속성을 개별적으로 로깅
    console.error('[ApiClient] API Error:')
    console.error('  URL:', url)
    console.error('  Status:', response.status)
    console.error('  Status Text:', response.statusText)
    console.error('  Message:', message)
    if (code) {
      console.error('  Code:', code)
    }
    if (details) {
      try {
        console.error('  Details:', JSON.stringify(details, null, 2))
      } catch {
        console.error('  Details: [직렬화 불가능한 객체]')
      }
    }

    return error
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    const url = this.buildUrl(endpoint, params)

    const doFetch = async () => {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: this.buildHeaders(fetchOptions),
      })

      if (!response.ok) {
        throw await this.parseError(response, url)
      }

      if (response.status === 204) {
        return {} as T
      }

      const text = await response.text()
      if (!text) return {} as T

      return JSON.parse(text) as T
    }

    try {
      return await doFetch()
    } catch (error: any) {
      const apiError = error as ApiError

      // 401 → refreshToken으로 한 번 재시도
      if (apiError.status === 401) {
        const refreshed = await refreshAccessTokenWithRefreshToken()
        if (refreshed) {
          return await doFetch()
        }
        setAuthTokens(null)
      }

      if (apiError.status !== undefined) {
        throw apiError
      }

      const networkError = error as Error
      let errorMessage = '네트워크 오류가 발생했습니다.'

      if (networkError.message) {
        if (networkError.message.includes('Failed to fetch')) {
          errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
        } else if (networkError.message.includes('NetworkError')) {
          errorMessage = '네트워크 연결이 끊어졌습니다.'
        } else if (networkError.message.includes('timeout')) {
          errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.'
        } else {
          errorMessage = `연결 오류: ${networkError.message}`
        }
      }

      const wrapped: ApiError = Object.assign(new Error(errorMessage), {
        status: 0,
        message: errorMessage,
        code: 'NETWORK_ERROR',
        details: networkError.message,
      })

      throw wrapped
    }
  }

  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<T> {
    const isFormData = body instanceof FormData
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  put<T>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<T> {
    const isFormData = body instanceof FormData
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  patch<T>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<T> {
    const isFormData = body instanceof FormData
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// ==========
// 서비스별 클라이언트 인스턴스
// ==========

export const authApi = new ApiClient(API_URLS.AUTH)
export const buyerApi = new ApiClient(API_URLS.BUYER)
// 장바구니는 Buyer 서비스 사용
export const cartApi = buyerApi
export const sellerApi = new ApiClient(API_URLS.SELLER)
export const orderApi = new ApiClient(API_URLS.ORDER)
export const paymentApi = orderApi // 결제/예치금은 Order 서비스 사용

// Support 서비스 (검색, 리뷰, 체험, 정산, 배송 등)
const supportApi = new ApiClient(API_URLS.SUPPORT)
export const searchApi = supportApi
export const reviewApi = supportApi
export const experienceApi = supportApi
export const notificationApi = supportApi
export const settlementApi = supportApi

// 상품/농장 등은 Buyer/Seller 조합으로 사용
export const productApi = new ApiClient(API_URLS.BUYER)
export const farmApi = new ApiClient(API_URLS.SELLER)
export const deliveryApi = new ApiClient(API_URLS.ORDER)
