// lib/api/services/auth.ts
import { authApi, setAuthTokens, setUserRole } from '../client'
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
  async login(data: LoginRequest): Promise<LoginResult> {
    const response = await authApi.post<LoginResult>('/api/v1/auth/login', data)
    // [1] HttpOnly cookie 기반이므로 userId만 로컬 캐시
    setAuthTokens({ userId: response.userId })
    return response
  },

  // 농가 로그인
  async farmerLogin(data: LoginRequest): Promise<LoginResult> {
    const response = await authApi.post<LoginResult>('/api/v1/auth/login', data)
    // [2] farmer login도 cookie 기반
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
  async refreshToken(): Promise<void> {
    // [9] cookie-based refresh (empty body)
    await authApi.post('/api/v1/auth/refresh')
  },

  // Logout
  async logout(data?: LogoutRequest): Promise<void> {
    await authApi.post('/api/v1/auth/logout', data || {})
    // [10] cookie is cleared by backend; remove local cache only
    setAuthTokens(null)
  },

  async getCurrentUser(): Promise<MeResponse> {
    const response = await authApi.get<{ data: MeResponse } | MeResponse>('/api/v1/auth/me')
    // API 응답이 { status, data: { ... }, message } 형태이면 data 필드 추출
    const userData =
      response && typeof response === 'object' && 'data' in response
        ? response.data
        : (response as MeResponse)

    // role을 localStorage에 저장 (X-User-Role 헤더에 사용)
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
