// lib/api/client.ts
/* eslint-disable no-irregular-whitespace */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { validateUrl } from '../security'

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

// Next.js rewrites 사용 여부 (기본값: true)
// rewrites를 사용하면 같은 도메인으로 요청하여 SameSite=Strict 쿠키도 전송됨
const USE_REWRITES = process.env.NEXT_PUBLIC_USE_API_REWRITES !== 'false'

// API URL 설정
// rewrites 사용 시: 상대 경로 (/api/auth) - Next.js가 백엔드로 프록시
// rewrites 미사용 시: 절대 경로 (http://3.34.14.73:8080/auth-service)
export const API_URLS = {
  AUTH:
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL &&
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_AUTH_SERVICE_URL.replace(/\/$/, '')
      : USE_REWRITES
        ? '/api/auth'
        : `${GATEWAY_URL}/auth-service`,
  BUYER:
    process.env.NEXT_PUBLIC_BUYER_SERVICE_URL &&
    process.env.NEXT_PUBLIC_BUYER_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_BUYER_SERVICE_URL.replace(/\/$/, '')
      : USE_REWRITES
        ? '/api/buyer'
        : `${GATEWAY_URL}/buyer-service`,
  SELLER:
    process.env.NEXT_PUBLIC_SELLER_SERVICE_URL &&
    process.env.NEXT_PUBLIC_SELLER_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_SELLER_SERVICE_URL.replace(/\/$/, '')
      : USE_REWRITES
        ? '/api/seller'
        : `${GATEWAY_URL}/seller-service`,
  ORDER:
    process.env.NEXT_PUBLIC_ORDER_SERVICE_URL &&
    process.env.NEXT_PUBLIC_ORDER_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_ORDER_SERVICE_URL.replace(/\/$/, '')
      : USE_REWRITES
        ? '/api/order'
        : `${GATEWAY_URL}/order-service`,
  AI:
    process.env.NEXT_PUBLIC_AI_SERVICE_URL &&
    process.env.NEXT_PUBLIC_AI_SERVICE_URL.trim().length > 0
      ? process.env.NEXT_PUBLIC_AI_SERVICE_URL.replace(/\/$/, '')
      : USE_REWRITES
        ? '/api/ai'
        : `${GATEWAY_URL}/ai-service`,
  SUPPORT: USE_REWRITES ? '/api/support' : `${GATEWAY_URL}/support-service`,
}

// [초기화 로그] API URL 설정 확인
if (typeof window !== 'undefined') {
  console.log('[ApiClient] API URL 설정:', {
    rewrites_사용: USE_REWRITES,
    AUTH: API_URLS.AUTH,
    BUYER: API_URLS.BUYER,
    SELLER: API_URLS.SELLER,
    ORDER: API_URLS.ORDER,
    SUPPORT: API_URLS.SUPPORT,
    AI: API_URLS.AI,
    설명: USE_REWRITES
      ? '✅ rewrites 사용 - 같은 도메인으로 요청하여 SameSite=Strict 쿠키도 전송됨'
      : '⚠️ rewrites 미사용 - 크로스 오리진 요청 (포트가 다르면 SameSite=Strict 쿠키 미전송)',
  })
}

// ==========
// 토큰/유저 관리 (localStorage)
// ==========

const USER_ID_KEY = 'userId'
const USER_ROLE_KEY = 'userRole'

export type StoredTokens = {
  userId?: string
  userRole?: string
}

export const setAccessToken = (_token: string | null) => {
  // [1] HttpOnly cookie 기반 인증이라 localStorage에 토큰을 저장하지 않습니다.
  void _token
  // [1] HttpOnly cookie로만 토큰을 사용하므로 localStorage에 저장하지 않음
}

// ==========
// 쿠키 읽기 유틸리티 (디버깅용)
// ==========

/**
 * 브라우저 쿠키에서 특정 쿠키 값을 읽습니다.
 * HttpOnly 쿠키는 읽을 수 없습니다 (보안상의 이유로).
 * @param name 쿠키 이름
 * @returns 쿠키 값 또는 null (없거나 HttpOnly인 경우)
 */
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null

  try {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=')
      if (cookieName === name) {
        return decodeURIComponent(cookieValue || '')
      }
    }
  } catch (error) {
    console.error('[ApiClient] 쿠키 읽기 오류:', error)
  }

  return null
}

/**
 * 모든 쿠키를 확인합니다 (디버깅용)
 * @returns 쿠키 정보 객체
 */
export const checkCookies = (): {
  accessToken: string | null
  refreshToken: string | null
  allCookies: Record<string, string>
  cookieString: string
} => {
  if (typeof window === 'undefined') {
    return {
      accessToken: null,
      refreshToken: null,
      allCookies: {},
      cookieString: '',
    }
  }

  const cookieString = document.cookie
  const allCookies: Record<string, string> = {}

  try {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name) {
        allCookies[name] = decodeURIComponent(value || '')
      }
    }
  } catch (error) {
    console.error('[ApiClient] 쿠키 파싱 오류:', error)
  }

  // 일반적인 토큰 쿠키 이름들 확인 (서버에서 access_token, refresh_token으로 설정)
  const accessToken =
    getCookie('access_token') || // 우선순위 1: 서버에서 사용하는 이름
    getCookie('accessToken') ||
    getCookie('token') ||
    getCookie('authToken') ||
    null

  const refreshToken =
    getCookie('refresh_token') || // 우선순위 1: 서버에서 사용하는 이름
    getCookie('refreshToken') ||
    null

  return {
    accessToken,
    refreshToken,
    allCookies,
    cookieString,
  }
}

export const getAccessToken = (): string | null => {
  // [2] HttpOnly cookie는 JS에서 읽을 수 없으므로 일반적으로 null
  //     하지만 일반 쿠키로 설정된 경우 읽을 수 있으므로 시도해봅니다
  //     서버에서 access_token으로 설정하므로 우선 확인
  const token =
    getCookie('access_token') || // 우선순위 1: 서버에서 사용하는 이름
    getCookie('accessToken') ||
    getCookie('token') ||
    getCookie('authToken')

  if (token) {
    console.log('[ApiClient] access_token 쿠키를 읽었습니다 (일반 쿠키)')
    return token
  }

  // HttpOnly 쿠키인 경우 null 반환
  return null
}

export const setRefreshToken = (_token: string | null) => {
  // [3] refresh token도 HttpOnly cookie로만 관리합니다.
  void _token
  // [3] refresh token 역시 HttpOnly cookie로만 사용
}

export const getRefreshToken = (): string | null => {
  // [4] HttpOnly cookie는 JS에서 읽을 수 없지만, 일반 쿠키인 경우 시도
  //     서버에서 refresh_token으로 설정하므로 우선 확인
  const token =
    getCookie('refresh_token') || // 우선순위 1: 서버에서 사용하는 이름
    getCookie('refreshToken')

  if (token) {
    console.log('[ApiClient] refresh_token 쿠키를 읽었습니다 (일반 쿠키)')
    return token
  }

  // HttpOnly 쿠키인 경우 null 반환
  return null
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
    // [5] 쿠키 기반 인증이라 토큰은 서버에서 관리하고, 로컬 캐시는 정리합니다.

    // [5] ?? í°??cookie?¸ë¡??¨ì§€?ë¯€ë¡? ?? í° ?¬ì£¼ ?•ë¦¬??ìƒëžµ
    setUserId(null)
    setUserRole(null)
    return
  }

  if (tokens.userId) {
    setUserId(tokens.userId)
  }
  if (tokens.userRole) {
    setUserRole(tokens.userRole)
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
  // [1] HttpOnly cookie는 JavaScript에서 읽을 수 없으므로,
  //     쿠키 존재 여부를 직접 확인할 수 없습니다.
  //     브라우저가 자동으로 쿠키를 전송하므로 API 호출을 시도합니다.

  try {
    // [1-1] 쿠키 확인 (디버깅용)
    const cookieInfo = checkCookies()
    const hasAccessToken = cookieInfo.accessToken !== null
    const hasRefreshToken = cookieInfo.refreshToken !== null

    // 현재 도메인 확인
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown'
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown'
    // 상대 경로인 경우 현재 도메인 사용, 절대 URL인 경우 URL에서 도메인 추출
    const apiDomain = API_URLS.AUTH.startsWith('/')
      ? currentDomain
      : new URL(API_URLS.AUTH).hostname

    console.log('[ApiClient] 현재 브라우저 쿠키 상태:', {
      access_token: hasAccessToken ? '있음 (일반 쿠키)' : '없음 또는 HttpOnly',
      refresh_token: hasRefreshToken ? '있음 (일반 쿠키)' : '없음 또는 HttpOnly',
      모든_쿠키: Object.keys(cookieInfo.allCookies),
      쿠키_개수: Object.keys(cookieInfo.allCookies).length,
      쿠키_상세: cookieInfo.allCookies,
      설명:
        hasAccessToken || hasRefreshToken
          ? '일반 쿠키: JavaScript에서 읽을 수 있음'
          : 'HttpOnly 쿠키: JavaScript에서 읽을 수 없지만 브라우저가 자동으로 전송함',
    })

    console.log('[ApiClient] 도메인 정보:', {
      현재_도메인: currentDomain,
      현재_Origin: currentOrigin,
      API_도메인: apiDomain,
      도메인_일치:
        currentDomain === apiDomain ||
        apiDomain.includes(currentDomain) ||
        currentDomain.includes(apiDomain),
      주의:
        currentDomain !== apiDomain
          ? '⚠️ 도메인이 다릅니다! 쿠키가 전송되지 않을 수 있습니다.'
          : '✅ 도메인이 일치합니다.',
    })

    // [2] URL 생성: buildUrlFromBase 유틸리티 함수 사용
    const url = buildUrlFromBase(API_URLS.AUTH, '/api/v1/auth/refresh')

    console.log('[ApiClient] refreshToken으로 accessToken 재발급 시도:', url)
    console.log('[ApiClient] 요청 URL:', url)
    console.log('[ApiClient] 요청 메서드: POST')
    console.log('[ApiClient] credentials: include 설정됨')
    console.log('[ApiClient] ⚠️ HttpOnly 쿠키 동작 방식:')
    console.log('  - HttpOnly 쿠키는 JavaScript에서 읽을 수 없습니다 (보안상의 이유)')
    console.log(
      '  - 하지만 credentials: "include"로 설정하면 브라우저가 자동으로 쿠키를 요청에 포함시킵니다'
    )
    console.log('')
    console.log('[ApiClient] 📋 쿠키 전송 확인 방법:')
    console.log('  1. 브라우저 개발자 도구 > Network 탭 열기')
    console.log('  2. /api/v1/auth/refresh 요청 클릭')
    console.log('  3. Headers 탭 > Request Headers 확인')
    console.log('  4. Cookie: 헤더에서 refresh_token 확인')
    console.log('     - Cookie: refresh_token=... 가 있으면 쿠키가 전송된 것')
    console.log('     - Cookie: 헤더가 없거나 refresh_token이 없으면 쿠키가 전송되지 않은 것')
    console.log('')
    console.log('[ApiClient] 🔍 쿠키가 전송되지 않는 경우 가능한 원인:')
    console.log('  1. 쿠키 도메인 불일치 (예: 쿠키는 3.34.14.73, 요청은 localhost)')
    console.log(
      '     → 해결: 쿠키 도메인을 .3.34.14.73 또는 *로 설정하거나, 프론트엔드도 같은 도메인 사용'
    )
    console.log('  2. SameSite 정책 문제')
    console.log('     → 크로스 오리진 요청: SameSite=None; Secure 필요 (HTTPS)')
    console.log('     → 같은 도메인: SameSite=Lax 또는 Strict 가능')
    console.log('  3. 쿠키 경로 불일치')
    console.log('     → 해결: 쿠키 경로를 /로 설정')
    console.log('  4. CORS 설정 문제')
    console.log('     → 서버에서 Access-Control-Allow-Credentials: true 필요')
    console.log('     → Access-Control-Allow-Origin에 구체적인 도메인 필요 (와일드카드 * 불가)')
    console.log('  5. 쿠키가 만료되었거나 삭제됨')
    console.log('  6. 브라우저가 쿠키를 차단함 (보안 설정)')
    console.log('')
    console.log('[ApiClient] 📝 쿠키 설정 확인 방법:')
    console.log('  1. 개발자 도구 > Application > Cookies')
    console.log('  2. refresh_token 쿠키 클릭')
    console.log('  3. 다음 항목 확인:')
    console.log('     - Domain: 3.34.14.73 또는 .3.34.14.73')
    console.log('     - Path: /')
    console.log('     - SameSite: None (크로스 오리진) 또는 Lax/Strict (같은 도메인)')
    console.log('     - Secure: SameSite=None인 경우 필수')
    console.log('     - HttpOnly: 체크됨 (정상)')

    // [2] 크로스 오리진 요청에서 쿠키 전송을 위한 설정
    //     - credentials: 'include' 필수
    //     - 서버에서 CORS 설정에 Access-Control-Allow-Credentials: true 필요
    //     - SameSite=None인 경우 Secure 플래그 필요 (HTTPS)
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include', // [2] HttpOnly cookie (refreshToken)가 자동으로 전송됨
      headers: {
        'Content-Type': 'application/json',
      },
      // [2-1] HttpOnly cookie 기반이지만 서버가 body를 요구할 수 있으므로 빈 body 전송
      body: JSON.stringify({}),
    })

    // [2-2] 요청 후 쿠키 전송 여부 확인 안내
    console.log('[ApiClient] 요청 완료 - 쿠키 전송 확인:')
    console.log('  Network 탭에서 다음을 확인하세요:')
    console.log('  1. /api/v1/auth/refresh 요청 선택')
    console.log('  2. Headers 탭 > Request Headers')
    console.log('  3. Cookie: 헤더 확인')
    console.log('     ✅ Cookie: refresh_token=... 있으면: 쿠키 전송됨 (서버 인식 문제)')
    console.log(
      '     ❌ Cookie: 헤더 없거나 refresh_token 없으면: 쿠키 미전송 (도메인/경로/SameSite 문제)'
    )
    console.log('')
    console.log('[ApiClient] 크로스 오리진 쿠키 전송 조건:')
    console.log('  1. credentials: "include" 설정 ✅ (현재 설정됨)')
    console.log('  2. 서버 CORS: Access-Control-Allow-Credentials: true 필요')
    console.log('  3. 쿠키 SameSite=None인 경우 Secure 플래그 필요 (HTTPS)')
    console.log('  4. 쿠키 도메인이 요청 도메인과 일치하거나 포함되어야 함')

    // [3] 응답 헤더 확인 (디버깅용)
    const setCookieHeader = response.headers.get('Set-Cookie')
    console.log('[ApiClient] refresh 응답 상태:', response.status, response.statusText)
    console.log('[ApiClient] Set-Cookie 헤더 존재:', setCookieHeader ? '있음' : '없음')

    // [3-1] 쿠키 전송 여부 확인 안내
    if (response.status === 401) {
      console.log('')
      console.log('[ApiClient] ⚠️ 401 에러 발생 - 쿠키 전송 확인 필요:')
      console.log('  Network 탭에서 다음을 확인하세요:')
      console.log('  1. /api/v1/auth/refresh 요청 선택')
      console.log('  2. Headers 탭 > Request Headers')
      console.log('  3. Cookie: 헤더 확인')
      console.log('     - refresh_token이 있으면: 쿠키는 전송되었지만 서버가 인식하지 못함')
      console.log('     - refresh_token이 없으면: 쿠키가 전송되지 않음 (도메인/경로 문제 가능)')
      console.log('')
    }

    if (!response.ok) {
      // [4] 에러 응답 본문 읽기
      let errorMessage = `HTTP ${response.status} ${response.statusText}`
      let errorData: any = null

      try {
        const errorText = await response.text()
        console.log('[ApiClient] refresh 에러 응답 본문 (raw):', errorText)

        if (errorText) {
          try {
            errorData = JSON.parse(errorText)
            errorMessage = errorData.message || errorData.error || errorData.details || errorText
            console.error('[ApiClient] refreshToken API 실패 상세:', {
              status: response.status,
              statusText: response.statusText,
              message: errorMessage,
              data: errorData,
              rawText: errorText,
            })
          } catch {
            errorMessage = errorText
            console.error('[ApiClient] refreshToken API 실패 (JSON 파싱 실패):', {
              status: response.status,
              statusText: response.statusText,
              message: errorMessage,
              rawText: errorText,
            })
          }
        } else {
          console.error('[ApiClient] refreshToken API 실패 (응답 본문 없음):', {
            status: response.status,
            statusText: response.statusText,
          })
        }
      } catch (parseError) {
        console.error('[ApiClient] refreshToken API 실패 (응답 읽기 오류):', parseError)
      }

      // [5] 401 에러 분석 및 안내
      if (response.status === 401) {
        console.error('[ApiClient] ⚠️ 401 Unauthorized - refreshToken 문제:', {
          원인: [
            '1. refreshToken 쿠키가 없음 (로그인하지 않았거나 쿠키가 삭제됨)',
            '2. refreshToken 쿠키가 만료됨',
            '3. 쿠키 도메인/경로 불일치로 쿠키가 전송되지 않음',
            '4. SameSite 정책 문제',
          ],
          서버_응답: errorMessage,
          상세_정보: errorData,
          해결방법: [
            '1. 다시 로그인하여 refreshToken 쿠키를 재설정',
            '2. 브라우저 개발자 도구 > Application > Cookies에서 쿠키 확인',
            '3. 쿠키 도메인과 현재 도메인이 일치하는지 확인',
          ],
        })
      }

      // [6] 인증 상태 초기화
      setAuthTokens(null)
      return false
    }

    // [6] 성공: 서버가 Set-Cookie 헤더로 새로운 accessToken과 refreshToken을 설정함
    //     HttpOnly cookie이므로 JavaScript에서 읽을 수 없지만, 이후 요청에 자동으로 포함됨
    console.log('[ApiClient] accessToken 재발급 성공 (쿠키가 자동으로 설정됨)')
    return true

    /* [12] cookie 기반 refresh는 응답 body를 사용하지 않음
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
  */
  } catch (error) {
    // [7] 네트워크 오류 또는 기타 예외 처리
    const errorDetails = error as Error
    console.error('[ApiClient] refresh token failed (예외 발생):', {
      name: errorDetails.name,
      message: errorDetails.message,
      stack: errorDetails.stack,
      error: error,
    })

    // CORS 오류 확인
    if (
      errorDetails.message?.includes('Failed to fetch') ||
      errorDetails.message?.includes('CORS')
    ) {
      console.error('[ApiClient] CORS 또는 네트워크 연결 오류 가능성')
    }

    setAuthTokens(null)
    return false
  }
}

// ==========
// URL 생성 유틸리티 (공통 로직)
// ==========

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

/**
 * URL 생성 헬퍼 함수 (공통 로직)
 * baseUrl과 endpoint를 결합하여 최종 URL을 생성
 * rewrites 사용 시 상대 경로 처리 포함
 * @param baseUrl - 기본 URL (상대 경로 또는 절대 URL)
 * @param endpoint - 엔드포인트 경로
 * @param params - 쿼리 파라미터 (선택)
 * @returns 최종 URL 문자열
 */
export function buildUrlFromBase(
  baseUrl: string,
  endpoint: string,
  params?: RequestOptions['params']
): string {
  const isRelativeBase = baseUrl.startsWith('/')

  if (isRelativeBase) {
    // 상대 경로인 경우: 직접 문자열 결합
    const base = baseUrl.replace(/\/$/, '')
    let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

    // rewrites 규칙: /api/auth/:path* → /auth-service/api/:path*
    // endpoint가 /api/로 시작하면 baseUrl과 중복되므로 /api/ 제거
    // 예: baseUrl=/api/auth, endpoint=/api/v1/auth/login → /api/auth/v1/auth/login
    if (path.startsWith('/api/')) {
      // /api/auth-service/api/... 형태가 되지 않도록 /api/ 제거
      path = path.replace(/^\/api\//, '/')
    }

    let url = base + path

    // 쿼리 파라미터 추가
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        searchParams.append(key, String(value))
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    return url
  }

  // 절대 URL인 경우: 기존 로직 사용
  // endpoint가 '/'로 시작하면 URL(base, endpoint) 사용 시 base의 path가 사라지므로
  // 직접 문자열로 합쳐서 path를 보존한다. (예: http://host/buyer-service + /api/v1/products)
  const base = baseUrl.replace(/\/$/, '')
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

// ==========
// ApiClient 구현
// ==========

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  private buildUrl(endpoint: string, params?: RequestOptions['params']): string {
    return buildUrlFromBase(this.baseUrl, endpoint, params)
  }

  private buildHeaders(options?: RequestInit): HeadersInit {
    const headers: Record<string, string> = {}

    // JSON 기본 헤더 (FormData인 경우 제외)
    const hasBody = options && 'body' in options && options.body !== undefined
    if (hasBody && !(options!.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    // Authorization 헤더
    // [8] cookie 인증이므로 Authorization 헤더 미사용

    // 주문/예치금 등에서 사용하는 X-User-Id 헤더
    // [9] X-User-Id 헤더는 사용하지 않음

    // 상품 등록 등에서 사용하는 X-User-Role 헤더
    // [10] X-User-Role 헤더는 사용하지 않음

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

    // 보안: URL 검증 (SECURITY_INCIDENT_REPORT.md)
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
      // [11-1] HttpOnly 쿠키는 credentials: 'include'로 자동 전송됨
      //        JavaScript에서 읽을 수 없지만, 브라우저가 자동으로 Cookie 헤더에 포함시킴
      const credentials = fetchOptions.credentials ?? 'include'

      // [11-2] 크로스 오리진 쿠키 전송 진단
      if (typeof window !== 'undefined') {
        const currentOrigin = window.location.origin
        // 상대 경로인 경우 (rewrites 사용) 크로스 오리진이 아님
        const isRelativePath = url.startsWith('/')
        const apiOrigin = isRelativePath ? currentOrigin : new URL(url).origin

        if (!isRelativePath && currentOrigin !== apiOrigin) {
          console.log('[ApiClient] ⚠️ 크로스 오리진 요청 감지:', {
            현재_Origin: currentOrigin,
            API_Origin: apiOrigin,
            주의: '포트가 다르면 SameSite=Strict 쿠키가 전송되지 않습니다!',
            해결방법: [
              '1. 서버에서 쿠키를 SameSite=None; Secure로 설정 (HTTPS 필요)',
              '2. 또는 Next.js rewrites 사용 (NEXT_PUBLIC_USE_API_REWRITES=true)',
              '3. 또는 프론트엔드와 백엔드를 같은 포트에서 실행',
            ],
          })
        } else if (isRelativePath) {
          // rewrites 사용 중 - 같은 도메인으로 요청하므로 쿠키 전송 가능
          console.log('[ApiClient] ✅ rewrites 사용 중 - 같은 도메인으로 요청:', {
            요청_URL: url,
            현재_Origin: currentOrigin,
            설명: 'Next.js가 백엔드로 프록시하므로 SameSite=Strict 쿠키도 전송됩니다',
          })
        }
      }

      const response = await fetch(url, {
        ...fetchOptions,
        credentials, // [11] 모든 인증 요청은 cookie 포함 (HttpOnly 쿠키 자동 전송)
        headers: this.buildHeaders(fetchOptions),
      })

      // [11-3] 응답 후 쿠키 전송 여부 확인
      if (typeof window !== 'undefined' && !response.ok && response.status === 401) {
        const currentOrigin = window.location.origin
        // 상대 경로인 경우 현재 origin 사용, 절대 URL인 경우 URL에서 origin 추출
        const isRelativeUrl = url.startsWith('/')
        const apiOrigin = isRelativeUrl ? currentOrigin : new URL(url).origin

        if (!isRelativeUrl && currentOrigin !== apiOrigin) {
          console.warn('[ApiClient] ⚠️ 401 에러 - 크로스 오리진 쿠키 전송 문제 가능성:', {
            현재_Origin: currentOrigin,
            API_Origin: apiOrigin,
            원인: 'SameSite=Strict 쿠키는 포트가 다른 경우 전송되지 않습니다',
            확인방법: [
              '1. Network 탭 > 요청 선택 > Headers 탭',
              '2. Request Headers에서 Cookie: 헤더 확인',
              '3. Cookie: 헤더가 없으면 쿠키가 전송되지 않은 것',
            ],
            해결방법: [
              '서버에서 쿠키를 SameSite=None; Secure로 변경 (HTTPS 필요)',
              '또는 프론트엔드와 백엔드를 같은 도메인/포트에서 실행',
            ],
          })
        }
      }

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

      // [5] 401 Unauthorized → HttpOnly cookie (refreshToken)로 accessToken 재발급 시도
      if (apiError.status === 401) {
        console.log('[ApiClient] 401 에러 발생, refreshToken으로 재발급 시도')
        const refreshed = await refreshAccessTokenWithRefreshToken()
        if (refreshed) {
          console.log('[ApiClient] accessToken 재발급 성공, 원래 요청 재시도')
          return await doFetch()
        }
        // [6] refresh 실패: 로그인 상태가 아니거나 refreshToken이 만료됨
        console.warn('[ApiClient] refreshToken으로 재발급 실패, 인증 상태 초기화')
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
export const paymentApi = orderApi // 결제는 Order 서비스 사용 (예치금은 support-service로 이동)
export const aiApi = new ApiClient(API_URLS.AI)

// Support 서비스 (검색, 리뷰, 체험, 정산, 배송, 예치금 등)
export const supportApi = new ApiClient(API_URLS.SUPPORT)
export const searchApi = supportApi
export const reviewApi = supportApi
export const experienceApi = supportApi
export const notificationApi = supportApi
export const settlementApi = supportApi
// depositService는 supportApi를 사용 (support-service로 이동됨)

// 상품/농장 등은 Buyer/Seller 조합으로 사용
export const productApi = new ApiClient(API_URLS.BUYER)
export const farmApi = new ApiClient(API_URLS.SELLER)
export const deliveryApi = new ApiClient(API_URLS.ORDER)

// ==========
// 타입 정의
// ==========

export interface ApiResponse<T = any> {
  status: number
  data: T
  message?: string
}
