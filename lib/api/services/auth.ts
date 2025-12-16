// lib/api/services/auth.ts
import { authApi, setAccessToken, setRefreshToken, setAuthTokens } from '../client'
import type {
  LoginRequest,
  LoginResult,
  SignupRequest,
  SignUpResult,
  FarmerSignupRequest,
  MeResponse,
  TokenResult,
  SendCodeRequest,
  VerifyCodeRequest,
  RefreshTokenRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  PasswordChangeRequest,
  LogoutRequest,
} from '../types'

// 스웨거 표출 순서 동일

export const authService = {
  // 일반 로그인
  async login(data: LoginRequest): Promise<LoginResult> {
    const response = await authApi.post<LoginResult>('/api/v1/auth/login', data)
    // accessToken, refreshToken, userId 모두 localStorage에 저장
    setAuthTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      userId: response.userId,
    })
    return response
  },

  // 농가 로그인
  async farmerLogin(data: LoginRequest): Promise<LoginResult> {
    const response = await authApi.post<LoginResult>('/api/v1/auth/login', data)
    // accessToken, refreshToken, userId 모두 localStorage에 저장
    setAuthTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      userId: response.userId,
    })
    return response
  },

  // 일반 회원가입
  async signup(data: SignupRequest): Promise<SignUpResult> {
    const response = await authApi.post<SignUpResult>('/api/v1/auth/signup', data)
    // accessToken, refreshToken, userId 모두 localStorage에 저장
    setAuthTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      userId: response.userId,
    })
    return response
  },

  // 농가 회원가입
  async farmerSignup(data: FarmerSignupRequest): Promise<SignUpResult> {
    const response = await authApi.post<SignUpResult>('/api/v1/auth/signup', data)
    // accessToken, refreshToken, userId 모두 localStorage에 저장
    setAuthTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      userId: response.userId,
    })
    return response
  },

  // 토큰 갱신
  async refreshToken(refreshToken: string): Promise<TokenResult> {
    const response = await authApi.post<TokenResult>('/api/v1/auth/refresh', {
      refreshToken,
    } as RefreshTokenRequest)
    // 토큰 갱신 시 accessToken만 업데이트 (refreshToken과 userId는 유지)
    setAccessToken(response.accessToken)
    // refreshToken도 업데이트되는 경우를 대비
    if (response.refreshToken) {
      setRefreshToken(response.refreshToken)
    }
    return response
  },

  // 로그아웃
  async logout(data?: LogoutRequest): Promise<void> {
    await authApi.post('/api/v1/auth/logout', data || {})
    // 모든 토큰과 사용자 정보 삭제
    setAuthTokens(null)
  },

  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<MeResponse> {
    const response = await authApi.get<{ data: MeResponse } | MeResponse>('/api/v1/auth/me')
    // API 응답이 { status, data: { ... }, message } 형태이면 data 필드 추출
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    return response as MeResponse
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
