// =====================
// Auth Types
// =====================
export interface User {
  id: number
  email: string
  name: string
  phone: string
  userType: 'BUYER' | 'SELLER' | 'ADMIN'
  marketing_consent: boolean
  createdAt: string
  updatedAt: string
}

// Request Types
export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  name: string
  phone: string
  marketingConsent?: boolean
}

export interface FarmerSignupRequest extends SignupRequest {
  farmName: string
  farmAddress: string
  farmDescription?: string
  businessNumber?: string
}

export interface SendCodeRequest {
  email: string
}

export interface VerifyCodeRequest {
  email: string
  code: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirmRequest {
  email: string
  code: string
  newPassword: string
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}

export interface LogoutRequest {
  refreshToken?: string
}

export interface WithdrawRequest {
  reason?: 'USER_WITHDRAW'
}

// Response Types
export interface LoginResult {
  userId: string // UUID
  email: string
}

export interface SignUpResult {
  userId: string // UUID
  email: string
}

export interface TokenResult {
  userId: string // UUID
  email: string
}

export interface OAuthStateResponse {
  state: string
}

export interface OAuthCallbackRequest {
  provider: 'kakao'
  code: string
  state: string
}

export interface OAuthCallbackResult {
  userId: string // UUID
  email: string
}

export interface MeResponse {
  userId: string // UUID
  email: string
  role: string
}

// Legacy types for backward compatibility
export interface LoginResponse extends LoginResult {
  user?: User // Optional for backward compatibility
}
