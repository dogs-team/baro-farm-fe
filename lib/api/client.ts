import { API_URLS, ServiceName } from './config'

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface ApiError {
  status: number
  message: string
  code?: string
  details?: string
  error?: string
  path?: string
  timestamp?: string
}

// Request Options
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

// Token Management
let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
  if (typeof window === 'undefined') return

  if (token) {
    localStorage.setItem('accessToken', token)
  } else {
    localStorage.removeItem('accessToken')
  }
}

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken')
  }
  return accessToken
}

export const setRefreshToken = (token: string | null) => {
  if (typeof window === 'undefined') return

  if (token) {
    localStorage.setItem('refreshToken', token)
  } else {
    localStorage.removeItem('refreshToken')
  }
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refreshToken')
}

export const setUserId = (userId: string | null) => {
  if (typeof window === 'undefined') return

  if (userId) {
    localStorage.setItem('userId', userId)
  } else {
    localStorage.removeItem('userId')
  }
}

export const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('userId')
}

// 모든 토큰과 사용자 정보 저장
export const setAuthTokens = (
  data: {
    accessToken: string
    refreshToken: string
    userId: string
  } | null
) => {
  if (data) {
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    setUserId(data.userId)
  } else {
    setAccessToken(null)
    setRefreshToken(null)
    setUserId(null)
  }
}

// JWT 토큰에서 userId 추출
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

// accessToken 만료 시 refreshToken으로 재발급 시도
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
      // 리프레시 토큰도 유효하지 않음 → 로그아웃 처리
      setAuthTokens(null)
      return false
    }

    const responseData = (await response.json()) as
      | {
          userId: string
          email: string
          accessToken: string
          refreshToken: string
        }
      | {
          status: number
          data: {
            userId: string
            email: string
            accessToken: string
            refreshToken: string
          }
          message?: string
        }

    // API 응답이 { status, data, message } 형태인지 확인
    let tokenData: {
      userId: string
      email: string
      accessToken: string
      refreshToken: string
    }
    if ('data' in responseData && responseData.data) {
      tokenData = responseData.data
    } else if ('accessToken' in responseData && 'refreshToken' in responseData) {
      tokenData = responseData as {
        userId: string
        email: string
        accessToken: string
        refreshToken: string
      }
    } else {
      console.error('[ApiClient] refreshToken 응답 구조가 올바르지 않습니다:', responseData)
      setAuthTokens(null)
      return false
    }

    console.log('[ApiClient] accessToken 재발급 성공')
    // userId, accessToken, refreshToken 모두 저장
    setAuthTokens({
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      userId: tokenData.userId,
    })

    return true
  } catch (error) {
    console.error('[ApiClient] refresh token failed:', error)
    setAuthTokens(null)
    return false
  }
}

// API Client Class
class ApiClient {
  private baseUrl: string

  constructor(service: ServiceName) {
    // [!!!] config.ts에서 이미 "GATEWAY_BASE + 서비스 prefix"까지 합쳐진 값이 들어옴
    // 예: http://localhost:8080/auth-service
    this.baseUrl = API_URLS[service]
  }

  private buildUrl(endpoint: string, params?: RequestOptions['params']) {
    // endpoint는 항상 "/..." 형태로 들어오는 걸 권장
    // (혹시 "api/v1"처럼 슬래시 없이 들어와도 안전하게 처리)
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

    let url = `${this.baseUrl}${normalizedEndpoint}`

    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
      const queryString = searchParams.toString()
      if (queryString) url += `?${queryString}`
    }

    return url
  }

  private buildHeaders(fetchOptions: RequestOptions) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers instanceof Headers
        ? Object.fromEntries(fetchOptions.headers.entries())
        : Array.isArray(fetchOptions.headers)
          ? Object.fromEntries(fetchOptions.headers)
          : (fetchOptions.headers ?? {})),
    }

    const token = getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`

      // JWT 토큰에서 userId 추출하여 X-User-Id 헤더 추가
      const userId = getUserIdFromToken()
      if (userId) {
        headers['X-User-Id'] = userId
      }
    }

    return headers
  }

  private async parseError(response: Response, url: string): Promise<ApiError> {
    let errorData: Record<string, unknown> = {}

    try {
      const text = await response.text()
      if (text) errorData = JSON.parse(text) as Record<string, unknown>
    } catch {
      // JSON 파싱 실패 시 빈 객체 유지
    }

    const getStringValue = (value: unknown): string | undefined => {
      return typeof value === 'string' ? value : undefined
    }

    const errorMessage =
      getStringValue(errorData.message) ||
      getStringValue(errorData.error) ||
      getStringValue(errorData.details) ||
      getStringValue(errorData.errorMessage) ||
      response.statusText ||
      '알 수 없는 오류가 발생했습니다.'

    let statusMessage = ''
    switch (response.status) {
      case 400:
        statusMessage = '잘못된 요청입니다.'
        break
      case 401:
        statusMessage = '인증이 필요합니다. 로그인해주세요.'
        break
      case 403:
        statusMessage = '접근 권한이 없습니다.'
        break
      case 404:
        statusMessage = '요청한 리소스를 찾을 수 없습니다.'
        break
      case 409:
        statusMessage = '이미 존재하는 데이터입니다.'
        break
      case 422:
        statusMessage = '입력 데이터가 올바르지 않습니다.'
        break
      case 500:
        statusMessage = '서버 오류가 발생했습니다.'
        break
      case 503:
        statusMessage = '서비스를 일시적으로 사용할 수 없습니다.'
        break
      default:
        statusMessage = `서버 오류 (${response.status})`
    }

    return {
      status: response.status,
      message: errorMessage !== response.statusText ? errorMessage : statusMessage,
      code: getStringValue(errorData.code) || getStringValue(errorData.error),
      details: getStringValue(errorData.details) || getStringValue(errorData.message),
      error: getStringValue(errorData.error),
      path: getStringValue(errorData.path) || url,
      timestamp: getStringValue(errorData.timestamp),
    }
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

      // 204 No Content
      if (response.status === 204) {
        return {} as T
      }

      // 응답이 비어있을 가능성도 방어 (ex: 200인데 body 없음)
      const text = await response.text()
      if (!text) return {} as T

      return JSON.parse(text) as T
    }

    try {
      return await doFetch()
    } catch (error) {
      const apiError = error as ApiError

      // accessToken 만료(401) 시 refreshToken으로 한 번만 재시도
      if (apiError.status === 401) {
        const refreshed = await refreshAccessTokenWithRefreshToken()
        if (refreshed) {
          // 새 accessToken으로 한 번 더 시도
          return await doFetch()
        }
        // refreshToken도 만료/실패 → 토큰 모두 제거 (사실상 로그아웃 상태)
        setAuthTokens(null)
      }

      // 이미 ApiError면 그대로 throw
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

      throw {
        status: 0,
        message: errorMessage,
        code: 'NETWORK_ERROR',
        details: networkError.message,
      } as ApiError
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Create API clients for each service
export const authApi = new ApiClient('AUTH')
export const buyerApi = new ApiClient('BUYER')
export const cartApi = new ApiClient('CART')
export const productApi = new ApiClient('PRODUCT')
export const sellerApi = new ApiClient('SELLER')
export const farmApi = new ApiClient('FARM')
export const orderApi = new ApiClient('ORDER')
export const paymentApi = new ApiClient('PAYMENT')
export const settlementApi = new ApiClient('SETTLEMENT')
export const deliveryApi = new ApiClient('DELIVERY')
export const notificationApi = new ApiClient('NOTIFICATION')
export const experienceApi = new ApiClient('EXPERIENCE')
export const searchApi = new ApiClient('SEARCH')
export const reviewApi = new ApiClient('REVIEW')
