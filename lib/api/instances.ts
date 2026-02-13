import { ApiClient } from './http-client'
import { API_URLS } from './urls'

export const authApi = new ApiClient(API_URLS.AUTH)
export const buyerApi = new ApiClient(API_URLS.BUYER)
export const cartApi = buyerApi
export const sellerApi = new ApiClient(API_URLS.SELLER)
export const orderApi = new ApiClient(API_URLS.ORDER)
export const paymentApi = new ApiClient(API_URLS.PAYMENT)
export const aiApi = new ApiClient(API_URLS.AI)
export const supportApi = new ApiClient(API_URLS.SUPPORT)

export const searchApi = aiApi
export const reviewApi = supportApi
export const notificationApi = supportApi
export const settlementApi = supportApi

export const productApi = new ApiClient(API_URLS.BUYER)
