// Backward-compatible facade.
// Keep existing imports working while internal API layers are split by responsibility.

export { API_URLS } from './urls'

export {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  setUserId,
  getUserId,
  getUserIdFromToken,
  setUserRole,
  getUserRole,
  setAuthTokens,
} from './session'
export type { StoredTokens } from './session'

export type { ApiError, RequestOptions, ApiResponse } from './http-client'

export {
  userApi,
  buyerApi,
  cartApi,
  orderApi,
  paymentApi,
  aiApi,
  supportApi,
  searchApi,
  reviewApi,
  notificationApi,
  settlementApi,
  productApi,
} from './instances'
