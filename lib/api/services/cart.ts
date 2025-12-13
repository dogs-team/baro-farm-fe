import { cartApi } from '../client'
import type { Cart, CartItem, AddToCartRequest } from '../types'

export const cartService = {
  // 장바구니 조회 (Buyer Service - Product와 동일한 패턴 적용)
  async getCart(): Promise<Cart> {
    return cartApi.get<Cart>('/api/cart')
  },

  // 장바구니에 상품 추가
  async addToCart(data: AddToCartRequest): Promise<CartItem> {
    return cartApi.post<CartItem>('/api/cart/items', data)
  },

  // 장바구니 상품 수량 변경
  async updateCartItem(itemId: number, quantity: number): Promise<CartItem> {
    return cartApi.patch<CartItem>(`/api/cart/items/${itemId}`, { quantity })
  },

  // 장바구니 상품 삭제
  async removeCartItem(itemId: number): Promise<void> {
    return cartApi.delete(`/api/cart/items/${itemId}`)
  },

  // 장바구니 비우기
  async clearCart(): Promise<void> {
    return cartApi.delete('/api/cart')
  },

  // 선택한 상품들 삭제
  async removeSelectedItems(itemIds: number[]): Promise<void> {
    return cartApi.post('/api/cart/items/delete', { itemIds })
  },
}
