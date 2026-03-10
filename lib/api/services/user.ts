import { userApi, setAuthTokens, setUserRole } from '../client'
import type {
  FarmerSignupRequest,
  LoginRequest,
  LoginResult,
  LogoutRequest,
  MeResponse,
  OAuthCallbackRequest,
  OAuthCallbackResult,
  OAuthStateResponse,
  PasswordChangeRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  SendCodeRequest,
  SignUpResult,
  SignupRequest,
  VerifyCodeRequest,
  WithdrawRequest,
} from '../types'

export const userService = {
  // [1] 로그인/회원가입 응답의 userId만 로컬 캐시에 남기고 인증 자체는 쿠키 기반으로 유지합니다.
  async login(data: LoginRequest): Promise<LoginResult> {
    const response = await userApi.post<LoginResult>('/api/v1/auth/login', data)
    setAuthTokens({ userId: response.userId })
    return response
  },

  async farmerLogin(data: LoginRequest): Promise<LoginResult> {
    const response = await userApi.post<LoginResult>('/api/v1/auth/login', data)
    setAuthTokens({ userId: response.userId })
    return response
  },

  async signup(data: SignupRequest): Promise<SignUpResult> {
    const response = await userApi.post<SignUpResult>('/api/v1/auth/signup', data)
    setAuthTokens({ userId: response.userId })
    return response
  },

  async farmerSignup(data: FarmerSignupRequest): Promise<SignUpResult> {
    const response = await userApi.post<SignUpResult>('/api/v1/auth/signup', data)
    setAuthTokens({ userId: response.userId })
    return response
  },

  // [2] OAuth 시작 전에 서버가 state를 발급하고, 콜백에서는 같은 state를 다시 검증합니다.
  async requestOauthState(): Promise<OAuthStateResponse> {
    return userApi.post<OAuthStateResponse>('/api/v1/auth/oauth/state')
  },

  async oauthCallback(data: OAuthCallbackRequest): Promise<OAuthCallbackResult> {
    const response = await userApi.get<OAuthCallbackResult>('/api/v1/auth/oauth/callback', {
      params: {
        provider: data.provider,
        code: data.code,
        state: data.state,
      },
    })
    setAuthTokens({ userId: response.userId })
    return response
  },

  async withdraw(data?: WithdrawRequest): Promise<void> {
    await userApi.post('/api/v1/auth/me/withdraw', data || {})
  },

  async refreshToken(): Promise<void> {
    await userApi.post('/api/v1/auth/refresh')
  },

  // [3] 로그아웃은 서버 쿠키를 정리한 뒤 프론트 캐시도 함께 비웁니다.
  async logout(data?: LogoutRequest): Promise<void> {
    await userApi.post('/api/v1/auth/logout', data || {})
    setAuthTokens(null)
  },

  async getCurrentUser(): Promise<MeResponse> {
    const response = await userApi.get<{ data: MeResponse } | MeResponse>('/api/v1/auth/me')
    const userData =
      response && typeof response === 'object' && 'data' in response
        ? response.data
        : (response as MeResponse)

    if (userData.role) {
      setUserRole(userData.role)
    }

    return userData
  },

  async requestPasswordReset(email: string): Promise<void> {
    return userApi.post('/api/v1/auth/password/reset/request', { email } as PasswordResetRequest)
  },

  async resetPassword(data: PasswordResetConfirmRequest): Promise<void> {
    return userApi.post('/api/v1/auth/password/reset/confirm', data)
  },

  async changePassword(data: PasswordChangeRequest): Promise<void> {
    return userApi.post('/api/v1/auth/password/change', data)
  },

  async requestEmailVerification(email: string): Promise<void> {
    return userApi.post('/api/v1/auth/verification/email/send-code', { email } as SendCodeRequest)
  },

  async verifyEmailCode(email: string, code: string): Promise<{ verified: boolean }> {
    const response = await userApi.post<{ verified?: boolean }>(
      '/api/v1/auth/verification/email/verify-code',
      {
        email,
        code,
      } as VerifyCodeRequest
    )
    return { verified: response?.verified ?? true }
  },

  async verifyEmail(token: string): Promise<void> {
    return userApi.post('/api/v1/auth/verify-email', { token })
  },

  async grantSellerRole(userId: string): Promise<void> {
    return userApi.post<void>(`/api/v1/auth/${userId}/grant-seller`)
  },
}
