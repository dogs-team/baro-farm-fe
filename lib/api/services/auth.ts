import { authApi, setAccessToken } from '../client'
import type {
  User,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  FarmerSignupRequest,
} from '../types'

export const authService = {
  // 일반 로그인
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await authApi.post<LoginResponse>('/api/auth/login', data)
    setAccessToken(response.accessToken)
    return response
  },

  // 농가 로그인
  async farmerLogin(data: LoginRequest): Promise<LoginResponse> {
    const response = await authApi.post<LoginResponse>('/api/auth/farmer/login', data)
    setAccessToken(response.accessToken)
    return response
  },

  // 일반 회원가입
  async signup(data: SignupRequest): Promise<User> {
    return authApi.post<User>('/api/auth/signup', data)
  },

  // 농가 회원가입
  async farmerSignup(data: FarmerSignupRequest): Promise<User> {
    return authApi.post<User>('/api/auth/farmer/signup', data)
  },

  // 로그아웃
  async logout(): Promise<void> {
    await authApi.post('/api/auth/logout')
    setAccessToken(null)
  },

  // 토큰 갱신
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await authApi.post<LoginResponse>('/api/auth/refresh', { refreshToken })
    setAccessToken(response.accessToken)
    return response
  },

  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<User> {
    return authApi.get<User>('/api/auth/me')
  },

  // 비밀번호 재설정 요청
  async requestPasswordReset(email: string): Promise<void> {
    return authApi.post('/api/auth/password/reset-request', { email })
  },

  // 비밀번호 재설정
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return authApi.post('/api/auth/password/reset', { token, newPassword })
  },

  // 이메일 인증 코드 요청
  // async requestEmailVerification(email: string): Promise<void> {
  //   return authApi.post('/api/auth/email/verification-request', { email })
  // },

  // 이메일 인증 코드 요청 (send-code)
  async requestEmailVerification(email: string): Promise<void> {
    return authApi.post('/api/auth/verification/email/send-code', { email })
  },

  // 이메일 인증 코드 확인
  async verifyEmailCode(email: string, code: string): Promise<{ verified: boolean }> {
    return authApi.post('/api/auth/email/verify-code', { email, code })
  },

  // 이메일 인증 (토큰 기반)
  async verifyEmail(token: string): Promise<void> {
    return authApi.post('/api/auth/verify-email', { token })
  },

  // 판매자 전환 요청
  async requestSellerRole(data: {
    farmName: string
    farmAddress: string
    farmDescription?: string
    businessNumber?: string
  }): Promise<User> {
    return authApi.post('/api/auth/request-seller-role', data)
  },
}
