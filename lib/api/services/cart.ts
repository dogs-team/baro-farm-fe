import { cartApi } from '../client'
import type {
  CartInfo,
  CartItemInfo,
  AddItemRequest,
  UpdateQuantityRequest,
  UpdateOptionRequest,
} from '../types'

export const cartService = {
  // 장바구니 조회
  async getCart(): Promise<CartInfo> {
    return cartApi.get<CartInfo>('/api/v1/carts')
  },

  // 장바구니에 상품 추가
  async addToCart(data: AddItemRequest): Promise<CartItemInfo> {
    return cartApi.post<CartItemInfo>('/api/v1/carts/items', data)
  },

  // 장바구니 항목 수량 변경
  async updateCartItem(itemId: string, data: UpdateQuantityRequest): Promise<CartItemInfo> {
    return cartApi.patch<CartItemInfo>(`/api/v1/carts/items/${itemId}/quantity`, data)
  },

  // 장바구니 항목 옵션 변경
  async updateCartItemOption(itemId: string, data: UpdateOptionRequest): Promise<CartItemInfo> {
    return cartApi.patch<CartItemInfo>(`/api/v1/carts/items/${itemId}/option`, data)
  },

  // 장바구니 항목 삭제
  async removeCartItem(itemId: string): Promise<void> {
    return cartApi.delete(`/api/v1/carts/items/${itemId}`)
  },

  // 장바구니 비우기
  async clearCart(): Promise<void> {
    return cartApi.delete('/api/v1/carts')
  },

  // 비로그인 장바구니 병합
  async mergeCart(cartItems: CartItemInfo[]): Promise<CartInfo> {
    return cartApi.post<CartInfo>('/api/v1/carts/merge', { cartItems })
  },
}
