import { authApi, setAccessToken } from '../client'
import type {
  User,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  FarmerSignupRequest,
} from '../types'

export const authService = {
  // 일반 로그인 (Gateway를 통해 접근: POST /api/auth/login)
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await authApi.post<LoginResponse>('/api/auth/login', data)
    setAccessToken(response.accessToken)
    return response
  },

  // 농가 로그인 (추가 엔드포인트가 있다면 사용)
  async farmerLogin(data: LoginRequest): Promise<LoginResponse> {
    const response = await authApi.post<LoginResponse>('/api/auth/login', data)
    setAccessToken(response.accessToken)
    return response
  },

  // 일반 회원가입 (Gateway를 통해 접근: POST /api/auth/signup)
  async signup(data: SignupRequest): Promise<User> {
    return authApi.post<User>('/api/auth/signup', data)
  },

  // 농가 회원가입 (Gateway를 통해 접근: POST /api/auth/signup)
  async farmerSignup(data: FarmerSignupRequest): Promise<User> {
    return authApi.post<User>('/api/auth/signup', data)
  },

  // 로그아웃 (Gateway를 통해 접근: POST /api/auth/logout)
  async logout(): Promise<void> {
    await authApi.post('/api/auth/logout')
    setAccessToken(null)
  },

  // 토큰 갱신 (Gateway를 통해 접근: POST /api/auth/refresh)
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await authApi.post<LoginResponse>('/api/auth/refresh', { refreshToken })
    setAccessToken(response.accessToken)
    return response
  },

  // 현재 사용자 정보 조회 (Gateway를 통해 접근: GET /api/auth/me)
  async getCurrentUser(): Promise<User> {
    return authApi.get<User>('/api/auth/me')
  },

  // 비밀번호 재설정 코드 발송 (Gateway를 통해 접근: POST /api/auth/password/reset/request)
  async requestPasswordReset(email: string): Promise<void> {
    return authApi.post('/api/auth/password/reset/request', { email })
  },

  // 비밀번호 재설정 완료 (Gateway를 통해 접근: POST /api/auth/password/reset/confirm)
  async resetPassword(data: { email: string; code: string; newPassword: string }): Promise<void> {
    return authApi.post('/api/auth/password/reset/confirm', data)
  },

  // 이메일 인증 코드 요청
  // async requestEmailVerification(email: string): Promise<void> {
  //   return authApi.post('/api/auth/email/verification-request', { email })
  // },

  // 이메일 인증 코드 요청 (send-code)
  async requestEmailVerification(email: string): Promise<void> {
    return authApi.post('/api/auth/verification/email/send-code', { email })
  },

  // 이메일 인증코드 검증 (Gateway를 통해 접근: POST /api/auth/verification/email/verify)
  async verifyEmailCode(email: string, code: string): Promise<{ verified: boolean }> {
    return authApi.post('/api/auth/verification/email/verify', { email, code })
  },

  // 이메일 인증 (토큰 기반) - 스웨거에 없음, 필요시 추가
  async verifyEmail(token: string): Promise<void> {
    return authApi.post('/api/auth/verify-email', { token })
  },

  // 판매자 권한 부여 (Gateway를 통해 접근: POST /api/auth/{userId}/grant-seller)
  async grantSellerRole(userId: string): Promise<User> {
    return authApi.post<User>(`/api/auth/${userId}/grant-seller`)
  },

  // 판매자 전환 요청 (기존 메서드 유지)
  async requestSellerRole(data: {
    farmName: string
    farmAddress: string
    farmDescription?: string
    businessNumber?: string
  }): Promise<User> {
    return authApi.post('/api/auth/request-seller-role', data)
  },
}
