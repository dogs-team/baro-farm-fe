'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  addBuyNowItem,
  removeBuyNowItem,
  isBuyNowItem,
  getBuyNowQuantity,
  cleanupOldBuyNowItems,
} from '@/lib/utils/buy-now-storage'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  farm: string
  productId?: string // 실제 상품 UUID
  sellerId?: string // 판매자 UUID
  maxQuantity?: number
  isBuyNow?: boolean // 바로 구매로 추가된 아이템인지 표시
}

interface CartStore {
  items: CartItem[]
  buyNowOriginalQuantities: Record<number, number> // 바로 구매 전 원래 수량 저장
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number; isBuyNow?: boolean }) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  clearBuyNowItems: () => void // 바로 구매 아이템만 제거하고 원래 수량 복원 (주문 완료 시)
  restoreBuyNowItems: () => void // 바로 구매 아이템을 원래 수량으로 복원 (체크아웃 페이지 취소 시)
  getTotalItems: () => number
  getTotalPrice: () => number
  getCheckoutItems: () => CartItem[] // 체크아웃 페이지에 표시할 아이템
  getCheckoutTotalPrice: () => number // 체크아웃 페이지에 표시할 총 가격
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      buyNowOriginalQuantities: {},

      addItem: (item) => {
        const items = get().items
        const existingItem = items.find((i) => i.id === item.id)

        console.log('[CartStore] addItem called:', {
          itemId: item.id,
          itemName: item.name,
          quantity: item.quantity,
          isBuyNow: item.isBuyNow,
          existingItem: existingItem ? { ...existingItem } : null,
          currentItems: items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            isBuyNow: i.isBuyNow,
          })),
        })

        // 바로 구매인 경우
        if (item.isBuyNow) {
          const buyNowQuantity = item.quantity ?? 1
          console.log('[CartStore] Buy Now mode - quantity:', buyNowQuantity)

          // sessionStorage에 바로 구매 아이템 저장
          addBuyNowItem(item.id, buyNowQuantity)

          if (existingItem) {
            // 기존 아이템이 있으면 원래 수량을 저장하고 선택한 수량으로 임시 변경
            const currentOriginalQuantities = get().buyNowOriginalQuantities
            const newOriginalQuantities = { ...currentOriginalQuantities }

            // 기존 아이템이 isBuyNow가 false인 경우에만 원래 수량 저장
            // (이미 isBuyNow: true인 경우는 원래 수량이 이미 저장되어 있거나, 수량만 업데이트)
            if (!isBuyNowItem(item.id) && !newOriginalQuantities[item.id]) {
              newOriginalQuantities[item.id] = existingItem.quantity
              console.log(
                '[CartStore] Saved original quantity:',
                existingItem.quantity,
                'for item:',
                item.id
              )
            }

            // 수량을 선택한 수량으로 변경하고 isBuyNow 플래그 설정
            const updatedItems = items.map((i) => {
              if (i.id === item.id) {
                return { ...i, quantity: buyNowQuantity, isBuyNow: true }
              }
              // 다른 아이템은 sessionStorage를 확인하여 isBuyNow 설정
              return { ...i, isBuyNow: isBuyNowItem(i.id) }
            })

            console.log(
              '[CartStore] Updated items:',
              updatedItems.map((i) => ({ id: i.id, quantity: i.quantity, isBuyNow: i.isBuyNow }))
            )

            // 상태 업데이트
            set({
              items: updatedItems,
              buyNowOriginalQuantities: newOriginalQuantities,
            })

            // 상태 업데이트 후 즉시 확인
            const verifyState = get()
            console.log('[CartStore] State updated. New state:', {
              items: verifyState.items.map((i) => ({
                id: i.id,
                quantity: i.quantity,
                isBuyNow: i.isBuyNow,
              })),
              buyNowOriginalQuantities: verifyState.buyNowOriginalQuantities,
            })

            // localStorage에 직접 확인
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('barofarm-cart')
              if (stored) {
                const parsed = JSON.parse(stored) as { state?: { items?: CartItem[] } }
                console.log('[CartStore] localStorage state (after set):', {
                  items: parsed.state?.items?.map((i: CartItem) => ({
                    id: i.id,
                    quantity: i.quantity,
                    isBuyNow: i.isBuyNow,
                  })),
                  rawJson: stored.substring(0, 1000), // 처음 1000자 (isBuyNow 확인용)
                })
              }
            }
          } else {
            // 장바구니에 없을 때만 추가
            const newItem = { ...item, quantity: buyNowQuantity, isBuyNow: true as boolean }
            console.log('[CartStore] Adding new item:', {
              id: newItem.id,
              quantity: newItem.quantity,
              isBuyNow: newItem.isBuyNow,
            })
            // sessionStorage에 이미 저장되어 있음 (위에서 addBuyNowItem 호출)
            set({
              items: [...items, newItem],
            })
            const verifyState = get()
            console.log('[CartStore] State updated. New state:', {
              items: verifyState.items.map((i) => ({
                id: i.id,
                quantity: i.quantity,
                isBuyNow: i.isBuyNow,
              })),
            })

            // localStorage에 직접 확인
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('barofarm-cart')
              if (stored) {
                const parsed = JSON.parse(stored) as { state?: { items?: CartItem[] } }
                console.log('[CartStore] localStorage state (after set):', {
                  items: parsed.state?.items?.map((i: CartItem) => ({
                    id: i.id,
                    quantity: i.quantity,
                    isBuyNow: i.isBuyNow,
                  })),
                  rawJson: stored.substring(0, 1000), // 처음 1000자 (isBuyNow 확인용)
                })
              }
            }
          }
        } else {
          // 일반 장바구니 추가: 기존 아이템이 있으면 수량 누적
          if (existingItem) {
            set({
              items: items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + (item.quantity || 1), isBuyNow: false }
                  : { ...i, isBuyNow: i.isBuyNow ?? false }
              ),
            })
          } else {
            set({
              items: [
                ...items,
                { ...item, quantity: item.quantity || 1, isBuyNow: false as boolean },
              ],
            })
          }
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      clearBuyNowItems: () => {
        const items = get().items
        const originalQuantities = get().buyNowOriginalQuantities

        // sessionStorage에서 바로 구매 아이템 제거
        items.forEach((item) => {
          if (isBuyNowItem(item.id)) {
            removeBuyNowItem(item.id)
          }
        })

        // isBuyNow 아이템 처리
        const processedItems = items
          .map((item) => {
            if (isBuyNowItem(item.id)) {
              // 원래 수량이 저장되어 있으면 복원
              if (originalQuantities[item.id]) {
                return {
                  ...item,
                  quantity: originalQuantities[item.id],
                  isBuyNow: false,
                }
              }
              // 원래 수량이 없으면 제거 (장바구니에 없었던 경우)
              return null
            }
            return item
          })
          .filter((item): item is CartItem => item !== null)

        set({
          items: processedItems,
          buyNowOriginalQuantities: {},
        })
      },

      restoreBuyNowItems: () => {
        const items = get().items
        const originalQuantities = get().buyNowOriginalQuantities

        // sessionStorage에서 바로 구매 아이템 제거
        items.forEach((item) => {
          if (isBuyNowItem(item.id)) {
            removeBuyNowItem(item.id)
          }
        })

        // isBuyNow 아이템 처리
        const processedItems = items
          .map((item) => {
            if (isBuyNowItem(item.id)) {
              // 원래 수량이 저장되어 있으면 복원 (장바구니에 있던 아이템)
              if (originalQuantities[item.id]) {
                return {
                  ...item,
                  quantity: originalQuantities[item.id],
                  isBuyNow: false,
                }
              }
              // 원래 수량이 없으면 제거 (장바구니에 없었던 아이템)
              return null
            }
            return item
          })
          .filter((item): item is CartItem => item !== null)

        set({
          items: processedItems,
          buyNowOriginalQuantities: {},
        })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getCheckoutItems: () => {
        let items = get().items
        console.log(
          '[CartStore] getCheckoutItems - raw items from Zustand:',
          JSON.stringify(
            items.map((i) => ({ id: i.id, quantity: i.quantity, isBuyNow: i.isBuyNow }))
          )
        )

        // Zustand가 복원하지 못한 경우 localStorage에서 직접 읽기
        if (items.length === 0 && typeof window !== 'undefined') {
          const stored = localStorage.getItem('barofarm-cart')
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as {
                state?: {
                  items?: Array<{ id: number; isBuyNow?: boolean; [key: string]: unknown }>
                }
              }
              const storedItems = parsed.state?.items
              if (storedItems && storedItems.length > 0) {
                console.log(
                  '[CartStore] getCheckoutItems - Zustand 복원 실패 감지, localStorage에서 직접 읽기'
                )
                // localStorage에서 읽은 아이템을 CartItem 형식으로 변환
                // sessionStorage를 확인하여 isBuyNow 설정
                items = storedItems.map((item) => {
                  const buyNowQty = getBuyNowQuantity(item.id)
                  const isBuyNow = buyNowQty !== null
                  return {
                    ...item,
                    isBuyNow,
                    quantity: buyNowQty !== null ? buyNowQty : item.quantity,
                  } as CartItem
                })
                console.log(
                  '[CartStore] getCheckoutItems - localStorage items:',
                  JSON.stringify(
                    items.map((i) => ({ id: i.id, quantity: i.quantity, isBuyNow: i.isBuyNow }))
                  )
                )
              }
            } catch (e) {
              console.error('[CartStore] getCheckoutItems - localStorage 파싱 에러:', e)
            }
          }
        }

        // sessionStorage에서 바로 구매 아이템 확인
        const buyNowItems = items.filter((item) => isBuyNowItem(item.id))

        // sessionStorage에 있는데 items에 없는 경우 수량 업데이트
        const updatedItems = items.map((item) => {
          if (isBuyNowItem(item.id)) {
            const buyNowQty = getBuyNowQuantity(item.id)
            if (buyNowQty !== null && buyNowQty !== item.quantity) {
              return { ...item, quantity: buyNowQty, isBuyNow: true }
            }
            return { ...item, isBuyNow: true }
          }
          return { ...item, isBuyNow: false }
        })

        console.log(
          '[CartStore] getCheckoutItems - buyNowItems after filter:',
          JSON.stringify(
            buyNowItems.map((i) => ({ id: i.id, quantity: i.quantity, isBuyNow: i.isBuyNow }))
          )
        )
        const result = buyNowItems.length > 0 ? buyNowItems : updatedItems
        console.log(
          '[CartStore] getCheckoutItems result:',
          JSON.stringify(
            result.map((i) => ({ id: i.id, quantity: i.quantity, isBuyNow: i.isBuyNow }))
          )
        )
        return result
      },

      getCheckoutTotalPrice: () => {
        // getCheckoutItems를 직접 호출 (순환 참조 방지)
        const items = get().items
        const buyNowItems = items.filter((item) => isBuyNowItem(item.id))
        const checkoutItems = buyNowItems.length > 0 ? buyNowItems : items
        return checkoutItems.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'barofarm-cart',
      onRehydrateStorage: () => (state, error) => {
        // 오래된 sessionStorage 아이템 정리
        if (typeof window !== 'undefined') {
          cleanupOldBuyNowItems()
        }

        // localStorage에서 복원 후 sessionStorage와 동기화
        console.log('[CartStore] onRehydrateStorage called:', {
          hasState: !!state,
          error,
          items: state?.items?.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            isBuyNow: isBuyNowItem(i.id),
          })),
        })

        // localStorage에서 직접 확인
        let localStorageItems: CartItem[] | undefined
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('barofarm-cart')
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as { state?: { items?: CartItem[] } }
              localStorageItems = parsed.state?.items
              console.log(
                '[CartStore] onRehydrateStorage - localStorage items:',
                localStorageItems?.map((i) => ({
                  id: i.id,
                  quantity: i.quantity,
                  isBuyNow: i.isBuyNow,
                }))
              )
            } catch (e) {
              console.error('[CartStore] onRehydrateStorage - failed to parse localStorage:', e)
            }
          }
        }

        if (state?.items) {
          console.log(
            '[CartStore] onRehydrateStorage - items before fix:',
            state.items.map((i) => ({ id: i.id, quantity: i.quantity, isBuyNow: i.isBuyNow }))
          )

          // localStorage에서 직접 가져온 items를 우선 사용 (더 최신일 수 있음)
          const itemsToFix = localStorageItems || state.items

          // sessionStorage를 확인하여 isBuyNow 설정
          state.items = itemsToFix.map((item) => {
            const buyNowQty = getBuyNowQuantity(item.id)
            const isBuyNow = buyNowQty !== null
            const fixed = {
              ...item,
              isBuyNow,
              // sessionStorage에 수량이 있으면 업데이트
              quantity: buyNowQty !== null ? buyNowQty : item.quantity,
            }
            console.log('[CartStore] onRehydrateStorage fix item:', {
              id: item.id,
              isBuyNow,
              quantity: fixed.quantity,
            })
            return fixed
          })

          console.log(
            '[CartStore] onRehydrateStorage - items after fix:',
            state.items.map((i) => ({ id: i.id, quantity: i.quantity, isBuyNow: i.isBuyNow }))
          )
        }
      },
      merge: (persistedState, currentState): CartStore => {
        // localStorage에서 복원할 때 isBuyNow가 제대로 처리되도록 보장
        // persistedState는 { state: { ... }, version: 0 } 형태 또는 직접 상태 객체
        console.log('[CartStore] merge called:', {
          persistedState: persistedState ? JSON.stringify(persistedState).substring(0, 1000) : null,
          currentStateKeys: currentState ? Object.keys(currentState) : null,
        })

        // localStorage에서 직접 확인 (persistedState가 잘못된 경우 대비)
        let localStorageItems: CartItem[] | undefined
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('barofarm-cart')
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as { state?: { items?: CartItem[] } }
              localStorageItems = parsed.state?.items
              console.log(
                '[CartStore] merge - localStorage items:',
                localStorageItems?.map((i) => ({
                  id: i.id,
                  quantity: i.quantity,
                  isBuyNow: i.isBuyNow,
                }))
              )
            } catch (e) {
              console.error('[CartStore] merge - failed to parse localStorage:', e)
            }
          }
        }

        // persistedState가 { state: { ... } } 형태인 경우
        if (persistedState && typeof persistedState === 'object' && 'state' in persistedState) {
          const persisted = persistedState as {
            state: { items?: CartItem[]; buyNowOriginalQuantities?: Record<number, number> }
          }
          console.log(
            '[CartStore] merge - persisted.state.items:',
            persisted.state?.items?.map((i) => ({
              id: i.id,
              quantity: i.quantity,
              isBuyNow: i.isBuyNow,
            }))
          )

          // localStorage에서 직접 가져온 items를 우선 사용 (더 최신일 수 있음)
          // localStorageItems가 있으면 항상 우선 사용
          const itemsToMerge = localStorageItems ?? persisted.state?.items
          console.log(
            '[CartStore] merge - itemsToMerge source:',
            localStorageItems ? 'localStorage' : 'persistedState',
            'itemsToMerge:',
            itemsToMerge?.map((i) => ({ id: i.id, quantity: i.quantity, isBuyNow: i.isBuyNow }))
          )

          if (itemsToMerge) {
            // sessionStorage를 확인하여 isBuyNow 설정
            const mergedItems = itemsToMerge.map((item) => {
              const buyNowQty = getBuyNowQuantity(item.id)
              const isBuyNow = buyNowQty !== null
              const merged = {
                ...item,
                isBuyNow,
                // sessionStorage에 수량이 있으면 업데이트
                quantity: buyNowQty !== null ? buyNowQty : item.quantity,
              }
              console.log('[CartStore] merge item:', {
                id: item.id,
                isBuyNow,
                quantity: merged.quantity,
              })
              return merged
            })

            // 병합된 상태 반환 (함수들은 currentState에서 유지, 상태만 병합)
            return {
              ...currentState, // 함수들 포함
              items: mergedItems,
              buyNowOriginalQuantities: persisted.state.buyNowOriginalQuantities || {},
            }
          }

          // items가 없어도 다른 상태는 병합 (함수들은 currentState에서 유지)
          return {
            ...currentState, // 함수들 포함
            ...persisted.state,
          }
        }

        // persistedState가 직접 상태 객체인 경우 (구버전 호환)
        if (persistedState && typeof persistedState === 'object' && 'items' in persistedState) {
          const persisted = persistedState as {
            items?: CartItem[]
            buyNowOriginalQuantities?: Record<number, number>
          }
          const itemsToMerge = localStorageItems || persisted.items
          if (itemsToMerge) {
            // sessionStorage를 확인하여 isBuyNow 설정
            const mergedItems = itemsToMerge.map((item) => {
              const buyNowQty = getBuyNowQuantity(item.id)
              const isBuyNow = buyNowQty !== null
              return {
                ...item,
                isBuyNow,
                quantity: buyNowQty !== null ? buyNowQty : item.quantity,
              }
            })
            return {
              ...currentState, // 함수들 포함
              items: mergedItems,
              buyNowOriginalQuantities: persisted.buyNowOriginalQuantities || {},
            }
          }
        }

        console.log('[CartStore] merge - returning currentState')
        return currentState // 함수들 포함
      },
    }
  )
)
