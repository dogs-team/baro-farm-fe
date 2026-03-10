import { ApiClient } from './http-client'
import { API_URLS } from './urls'

// [1] userApi는 기존 auth/seller 경계가 합쳐진 현재 user-service의 단일 진입점입니다.
export const userApi = new ApiClient(API_URLS.USER)
export const buyerApi = new ApiClient(API_URLS.BUYER)
export const cartApi = buyerApi
export const orderApi = new ApiClient(API_URLS.ORDER)
export const paymentApi = new ApiClient(API_URLS.PAYMENT)
export const aiApi = new ApiClient(API_URLS.AI)
export const supportApi = new ApiClient(API_URLS.SUPPORT)

export const searchApi = aiApi
export const reviewApi = supportApi
export const notificationApi = supportApi
export const settlementApi = supportApi

export const productApi = new ApiClient(API_URLS.BUYER)
