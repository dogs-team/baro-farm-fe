// lib/api/services/auth.ts
import { authApi, setAccessToken } from '../client'
import type {
  User,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  FarmerSignupRequest,
} from '../types'

// 스웨거 표출 순서 동일

export const authService = {
  // 이메일 인증 코드 요청 (send-code)
  async requestEmailVerification(email: string): Promise<void> {
    return authApi.post('/api/v1/auth/verification/email/verify-code', { email })
  },

  // 이메일 인증 코드 확인
  async verifyEmailCode(email: string, code: string): Promise<{ verified: boolean }> {
    return authApi.post('/api/v1/auth/verification/email/send-code', { email, code })
  },

  //====AUTH=====
  // 판매자 권한 부여 (Gateway를 통해 접근: POST /auth-service/{userId}/grant-seller)
  async grantSellerRole(userId: string): Promise<User> {
    return authApi.post<User>(`/api/v1/auth/${userId}/grant-seller`)
  },

  // 회원가입
  async signup(data: SignupRequest): Promise<User> {
    return authApi.post<User>('/api/v1/auth/signup', data)
  },

  // 리프레시 토큰 토큰 재발급
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await authApi.post<LoginResponse>('/api/v1/auth/refresh', { refreshToken })
    setAccessToken(response.accessToken)
    return response
  },

  // 이메일 인증 (토큰 기반)
  async verifyEmail(token: string): Promise<void> {
    return authApi.post('/api/v1/auth/verify-email', { token })
  },

  // 비밀번호 재설정 코드 요청
  async requestPasswordReset(email: string): Promise<void> {
    return authApi.post('/api/v1/auth/password/reset/request', { email })
  },

  // 비밀번호 재설정
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return authApi.post('/api/v1/auth/password/reset/confirm', { token, newPassword })
  },

  //TODO: url만 반영. 관련해 페이지에서 받는 곳 없음. 입력값 서버랑 맞춰야 함.
  // 비밀번호 변경 [따로 만든 것: 주어진 프론트 코드상 없음]
  async changePassword(token: string, newPassword: string): Promise<void> {
    return authApi.post('/api/v1/auth/password/reset/confirm', { token, newPassword })
  },

  // 로그아웃
  async logout(): Promise<void> {
    await authApi.post('/api/v1/auth/logout')
    setAccessToken(null)
  },

  // 일반 로그인
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await authApi.post<LoginResponse>('/api/v1/auth/login', data)
    setAccessToken(response.accessToken)
    return response
  },

  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<User> {
    return authApi.get<User>('/api/v1/auth/me')
  },
}
