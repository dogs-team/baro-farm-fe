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
}

// Request Options
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

// Token Management
let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
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

// API Client Class
class ApiClient {
  private baseUrl: string

  constructor(service: ServiceName) {
    this.baseUrl = API_URLS[service]
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options

    // Build URL with query params
    let url = `${this.baseUrl}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    // Default headers
    // const headers: HeadersInit = {
    //   'Content-Type': 'application/json',
    //   ...fetchOptions.headers,
    // }
    // Default headers

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers instanceof Headers
        ? Object.fromEntries(fetchOptions.headers.entries())
        : Array.isArray(fetchOptions.headers)
          ? Object.fromEntries(fetchOptions.headers)
          : (fetchOptions.headers ?? {})),
    }

    // Add auth token if available
    const token = getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      })

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          status: response.status,
          message: errorData.message || response.statusText,
          code: errorData.code,
        } as ApiError
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T
      }

      return response.json()
    } catch (error) {
      if ((error as ApiError).status) {
        throw error
      }
      throw {
        status: 0,
        message: '네트워크 오류가 발생했습니다.',
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
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
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
