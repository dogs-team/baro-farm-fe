import { cartApi } from '@/lib/api'
import type { CartInfo, CartItemInfo, AddItemRequest, UpdateQuantityRequest, UpdateOptionRequest } from '../types'

export const cartService = {
  // 장바구니 조회
  async getCart(): Promise<CartInfo> {
    const response = await cartApi.get<{ data: CartInfo }>('/api/v1/carts')
    // API 응답이 { status, data: { ... }, message } 형태이므로 data 필드 추출
    return response.data
  },

  // 장바구니에 상품 추가
  async addItemToCart(productId: string, request: AddItemRequest): Promise<CartItemInfo> {
    const response = await cartApi.post<{ data: CartItemInfo }>('/api/v1/carts/items', request)
    return response.data
  },

  // 장바구니 항목 수량 변경
  async updateItemQuantity(itemId: string, request: UpdateQuantityRequest): Promise<CartItemInfo> {
    const response = await cartApi.patch<{ data: CartItemInfo }>(
      `/api/v1/carts/items/${itemId}/quantity`,
      request
    )
    return response.data
  },

  // 장바구니 항목 옵션 변경
  async updateItemOption(itemId: string, request: UpdateOptionRequest): Promise<CartItemInfo> {
    const response = await cartApi.patch<{ data: CartItemInfo }>(
      `/api/v1/carts/items/${itemId}/option`,
      request
    )
    return response.data
  },

  // 비로그인 장바구니를 로그인 사용자 장바구니로 병합
  async mergeGuestCartToUserCart(): Promise<CartInfo> {
    const response = await cartApi.post<{ data: CartInfo }>('/api/v1/carts/merge')
    return response.data
  },

  // 장바구니 항목 삭제
  async deleteItemFromCart(itemId: string): Promise<void> {
    return cartApi.delete<void>(`/api/v1/carts/items/${itemId}`)
  },

  // 장바구니 비우기
  async clearCart(): Promise<void> {
    return cartApi.delete<void>('/api/v1/carts')
  },
}
