'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartService } from '@/lib/api/services/cart'
import type { AddItemRequest } from '@/lib/api/types'
import { useToast } from '@/hooks/use-toast'

export const CART_QUERY_KEY = ['cart']

export function useCart() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Ensure session key matches logic if needed, or remove if moving to cookie auth.
  // Since we accepted Main client.ts (cookie only), setting session key here might be redundant but harmless.
  // However, Main client.ts REMOVED getSessionKey/setSessionKey exports?
  // Let's check Main client.ts again.
  // If they are removed, this hook will fail to compile.

  // We should remove session key logic if client.ts doesn't support it.

  // 1. Fetch Cart
  const {
    data: cart,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      try {
        return await cartService.getCart()
      } catch (err: any) {
        if (err.status === 404) {
          return null
        }
        throw err
      }
    },
    retry: false,
  })

  // 2. Add Item Mutation
  const addToCartMutation = useMutation({
    mutationFn: (data: AddItemRequest) => cartService.addItemToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      toast({
        title: '장바구니에 담았습니다.',
        description: '장바구니에서 확인하실 수 있습니다.',
      })
    },
    onError: (error: any) => {
      console.error('Add to cart failed:', error)
      toast({
        title: '장바구니 추가 실패',
        description: error.message || '다시 시도해주세요.',
        variant: 'destructive',
      })
    },
  })

  // 3. Update Quantity Mutation
  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateItemQuantity(itemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
    },
    onError: (error: any) => {
      console.error('Update quantity failed:', error)
      toast({
        title: '수량 변경 실패',
        description: error.message || '다시 시도해주세요.',
        variant: 'destructive',
      })
    },
  })

  // 4. Delete Item Mutation
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => cartService.deleteItemFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      toast({
        title: '상품이 삭제되었습니다.',
      })
    },
    onError: (error: any) => {
      console.error('Delete item failed:', error)
      toast({
        title: '삭제 실패',
        description: error.message || '다시 시도해주세요.',
        variant: 'destructive',
      })
    },
  })

  // 5. Clear Cart Mutation
  const clearCartMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
    },
    onError: (error: any) => {
      console.error('Clear cart failed:', error)
    },
  })

  return {
    cart,
    isLoading,
    isError,
    error,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAdding: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
  }
}
