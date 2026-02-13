/* eslint-disable @typescript-eslint/no-explicit-any */
import { validateUrl } from '../security'
import { API_URLS } from './urls'
import { getRefreshToken, setAuthTokens } from './session'

export interface ApiError extends Error {
  status: number
  message: string
  code?: string
  details?: any
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

const refreshAccessTokenWithRefreshToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken()
  if (refreshToken !== null && !refreshToken) {
    return false
  }

  try {
    const response = await fetch(`${API_URLS.AUTH}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      setAuthTokens(null)
      return false
    }

    return true
  } catch (error) {
    console.error('[ApiClient] refresh token failed:', error)
    setAuthTokens(null)
    return false
  }
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  private buildUrl(endpoint: string, params?: RequestOptions['params']): string {
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
    const hasBody = options && 'body' in options && options.body !== undefined
    if (hasBody && !(options!.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
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
          message = text || message
        }
      }
    } catch {
      // Ignore body parse/read failures and keep default message.
    }

    const error: ApiError = Object.assign(new Error(message), {
      status: response.status,
      message,
      code,
      details,
    })

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

    if (!validateUrl(url)) {
      const error = new Error(`보안 정책 위반: 허용되지 않은 URL입니다. URL: ${url}`) as ApiError
      Object.assign(error, {
        status: 403,
        message: '보안 정책 위반: 허용되지 않은 URL입니다.',
        code: 'SECURITY_VIOLATION',
        details: `URL: ${url}`,
      })
      throw error
    }

    const doFetch = async () => {
      const response = await fetch(url, {
        ...fetchOptions,
        credentials: fetchOptions.credentials ?? 'include',
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

export interface ApiResponse<T = any> {
  status: number
  data: T
  message?: string
}
