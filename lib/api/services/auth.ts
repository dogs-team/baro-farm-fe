// lib/api/services/auth.ts
import { authApi, setAuthTokens, setUserRole, checkCookies, API_URLS } from '../client'
import type {
  LoginRequest,
  LoginResult,
  SignupRequest,
  SignUpResult,
  FarmerSignupRequest,
  MeResponse,
  SendCodeRequest,
  VerifyCodeRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  PasswordChangeRequest,
  LogoutRequest,
  WithdrawRequest,
  OAuthStateResponse,
  OAuthCallbackRequest,
  OAuthCallbackResult,
} from '../types'

// 스웨거 표출 순서 동일

export const authService = {
  // 일반 로그인
  // [1] 서버가 응답 헤더의 Set-Cookie로 accessToken과 refreshToken을 HttpOnly cookie로 설정
  // [2] 브라우저가 자동으로 쿠키를 저장하며, 이후 모든 요청에 자동으로 포함됨 (credentials: 'include')
  // [3] JavaScript에서는 쿠키를 읽을 수 없으므로, userId만 localStorage에 캐시
  async login(data: LoginRequest): Promise<LoginResult> {
    // [1] 로그인 요청 전 쿠키 상태 확인
    const beforeCookies = typeof window !== 'undefined' ? document.cookie : ''
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown'
    console.log('[AuthService] 로그인 요청 전 상태:', {
      쿠키: beforeCookies || '쿠키 없음',
      현재_Origin: currentOrigin,
      API_URL: API_URLS.AUTH,
    })

    const response = await authApi.post<LoginResult>('/api/v1/auth/login', data)

    // [2] 로그인 응답 후 쿠키 상태 확인
    if (typeof window !== 'undefined') {
      // 쿠키 설정 대기 (서버가 Set-Cookie 헤더로 쿠키를 설정하는 시간)
      setTimeout(() => {
        const afterCookies = document.cookie
        const cookieInfo = checkCookies()
        const apiOrigin = new URL(API_URLS.AUTH).origin

        console.log('[AuthService] 로그인 응답 후 쿠키 상태:', {
          쿠키_문자열: afterCookies || '쿠키 없음',
          access_token: cookieInfo.accessToken ? '있음 (일반 쿠키)' : '없음 또는 HttpOnly',
          refresh_token: cookieInfo.refreshToken ? '있음 (일반 쿠키)' : '없음 또는 HttpOnly',
          모든_쿠키: Object.keys(cookieInfo.allCookies),
          쿠키_개수: Object.keys(cookieInfo.allCookies).length,
          현재_Origin: currentOrigin,
          API_Origin: apiOrigin,
          주의: 'HttpOnly 쿠키는 JavaScript에서 읽을 수 없습니다.',
        })

        // [2-1] 쿠키가 없는 경우 진단
        if (
          !cookieInfo.accessToken &&
          !cookieInfo.refreshToken &&
          Object.keys(cookieInfo.allCookies).length === 0
        ) {
          console.warn('[AuthService] ⚠️ 쿠키가 설정되지 않았습니다!')
          console.warn('  가능한 원인:')
          console.warn('  1. 서버가 Set-Cookie 헤더를 보내지 않음')
          console.warn('  2. 쿠키 도메인 불일치 (쿠키는 다른 도메인에 저장됨)')
          console.warn('  3. SameSite 정책으로 인한 차단')
          console.warn('  4. 브라우저 보안 설정으로 인한 차단')
          console.warn('')
          console.warn('  확인 방법:')
          console.warn('  1. Network 탭 > /api/v1/auth/login 요청 선택')
          console.warn('  2. Headers 탭 > Response Headers 확인')
          console.warn('  3. Set-Cookie: 헤더 확인')
          console.warn(
            '     - Set-Cookie: access_token=... 있으면: 서버는 쿠키를 설정했지만 브라우저가 저장하지 않음'
          )
          console.warn('     - Set-Cookie: 헤더 없으면: 서버가 쿠키를 설정하지 않음')
          console.warn('  4. Application > Cookies에서 다른 도메인 확인:')
          console.warn(`     - ${apiOrigin} (API 서버 도메인)`)
          console.warn(`     - ${currentOrigin} (현재 프론트엔드 도메인)`)
        }
      }, 200) // 쿠키 설정 대기 시간 증가
    }

    // HttpOnly cookie는 브라우저가 자동으로 관리하므로, userId만 로컬 캐시
    setAuthTokens({ userId: response.userId })

    // [3] 로그인 성공 후 쿠키 설정 확인 안내
    console.log('[AuthService] 로그인 성공:', {
      userId: response.userId,
      안내: '서버가 Set-Cookie 헤더로 쿠키를 설정해야 합니다.',
      확인_방법: [
        '1. Network 탭 > /api/v1/auth/login 요청 선택',
        '2. Headers 탭 > Response Headers 확인',
        '3. Set-Cookie: 헤더에서 access_token, refresh_token 확인',
        '4. Set-Cookie 헤더가 없으면 서버가 쿠키를 설정하지 않은 것',
      ],
      쿠키_탭_확인: [
        `Application > Cookies > ${currentOrigin} 확인`,
        `Application > Cookies > ${new URL(API_URLS.AUTH).origin} 확인`,
        '쿠키가 다른 도메인에 저장되었을 수 있습니다',
      ],
    })

    return response
  },

  // 농가 로그인
  // [1] 서버가 응답 헤더의 Set-Cookie로 accessToken과 refreshToken을 HttpOnly cookie로 설정
  // [2] 일반 로그인과 동일한 방식으로 쿠키 기반 인증 사용
  async farmerLogin(data: LoginRequest): Promise<LoginResult> {
    const response = await authApi.post<LoginResult>('/api/v1/auth/login', data)
    setAuthTokens({ userId: response.userId })
    return response
  },

  // 일반 회원가입
  async signup(data: SignupRequest): Promise<SignUpResult> {
    const response = await authApi.post<SignUpResult>('/api/v1/auth/signup', data)
    // [3] 회원가입 직후 userId만 캐시
    setAuthTokens({ userId: response.userId })
    return response
  },

  // 농가 회원가입
  async farmerSignup(data: FarmerSignupRequest): Promise<SignUpResult> {
    const response = await authApi.post<SignUpResult>('/api/v1/auth/signup', data)
    // [4] farmer signup도 cookie 기반
    setAuthTokens({ userId: response.userId })
    return response
  },

  // OAuth state 발급
  // OAuth state
  // OAuth state
  async requestOauthState(): Promise<OAuthStateResponse> {
    // [5] credentials: 'include' is applied by ApiClient
    return authApi.post<OAuthStateResponse>('/api/v1/auth/oauth/state')
  },

  // OAuth callback
  async oauthCallback(data: OAuthCallbackRequest): Promise<OAuthCallbackResult> {
    // [6] backend callback expects query params (GET)
    const response = await authApi.get<OAuthCallbackResult>('/api/v1/auth/oauth/callback', {
      params: {
        provider: data.provider,
        code: data.code,
        state: data.state,
      },
    })
    // [7] cookie is set by backend; cache only userId
    setAuthTokens({ userId: response.userId })
    return response
  },

  // Withdraw account
  async withdraw(data?: WithdrawRequest): Promise<void> {
    // [8] cookie-based auth; server expires cookies
    await authApi.post('/api/v1/auth/me/withdraw', data || {})
  },

  // Refresh token
  // [1] HttpOnly cookie (refreshToken)가 자동으로 전송됨
  // [2] 서버가 새로운 accessToken과 refreshToken을 Set-Cookie 헤더로 설정
  // [3] 응답 body는 없으며, 쿠키만 업데이트됨
  async refreshToken(): Promise<void> {
    await authApi.post('/api/v1/auth/refresh')
  },

  // Logout
  // [1] 서버가 Set-Cookie 헤더로 쿠키를 만료시켜 삭제함
  // [2] 로컬 캐시(userId, userRole)도 정리
  async logout(data?: LogoutRequest): Promise<void> {
    await authApi.post('/api/v1/auth/logout', data || {})
    setAuthTokens(null)
  },

  // 현재 사용자 정보 조회
  // [1] HttpOnly cookie (accessToken)가 자동으로 전송됨 (credentials: 'include')
  // [2] 서버는 Set-Cookie 헤더로 토큰을 설정하지만, 클라이언트는 읽을 수 없음
  async getCurrentUser(): Promise<MeResponse> {
    const response = await authApi.get<{ data: MeResponse } | MeResponse>('/api/v1/auth/me')
    // API 응답이 { status, data: { ... }, message } 형태이면 data 필드 추출
    const userData =
      response && typeof response === 'object' && 'data' in response
        ? response.data
        : (response as MeResponse)

    // role을 localStorage에 저장 (UI에서 사용)
    if (userData.role) {
      setUserRole(userData.role)
    }

    return userData
  },

  // 비밀번호 재설정 코드 요청
  async requestPasswordReset(email: string): Promise<void> {
    return authApi.post('/api/v1/auth/password/reset/request', { email } as PasswordResetRequest)
  },

  // 비밀번호 재설정 완료
  async resetPassword(data: PasswordResetConfirmRequest): Promise<void> {
    return authApi.post('/api/v1/auth/password/reset/confirm', data)
  },

  // 비밀번호 변경
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    return authApi.post('/api/v1/auth/password/change', data)
  },

  // 이메일 인증 코드 발송
  async requestEmailVerification(email: string): Promise<void> {
    return authApi.post('/api/v1/auth/verification/email/send-code', { email } as SendCodeRequest)
  },

  // 이메일 인증코드 검증
  async verifyEmailCode(email: string, code: string): Promise<{ verified: boolean }> {
    const response = await authApi.post<{ verified?: boolean }>(
      '/api/v1/auth/verification/email/verify-code',
      {
        email,
        code,
      } as VerifyCodeRequest
    )
    // response body가 없거나 verified 필드가 없어도 200 OK면 인증 성공으로 처리
    // (에러가 발생하면 ApiClient에서 throw되므로 여기까지 오면 성공)
    return { verified: response?.verified ?? true }
  },

  // 이메일 인증 (토큰 기반)
  async verifyEmail(token: string): Promise<void> {
    return authApi.post('/api/v1/auth/verify-email', { token })
  },

  // 판매자 권한 부여
  async grantSellerRole(userId: string): Promise<void> {
    return authApi.post<void>(`/api/v1/auth/${userId}/grant-seller`)
  },
}
