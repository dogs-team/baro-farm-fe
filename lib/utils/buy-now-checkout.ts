export interface BuyNowCheckoutItem {
  productId: string
  sellerId: string
  name: string
  price: number
  quantity: number
  image: string
  farm: string
}

const BUY_NOW_CHECKOUT_KEY = 'barofarm-buy-now-item'

export function setBuyNowItem(item: BuyNowCheckoutItem) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(BUY_NOW_CHECKOUT_KEY, JSON.stringify(item))
  } catch (error) {
    console.error('[BuyNowCheckout] setBuyNowItem error:', error)
  }
}

export function getBuyNowItem(): BuyNowCheckoutItem | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(BUY_NOW_CHECKOUT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as BuyNowCheckoutItem
  } catch (error) {
    console.error('[BuyNowCheckout] getBuyNowItem error:', error)
    return null
  }
}

export function clearBuyNowItem() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(BUY_NOW_CHECKOUT_KEY)
  } catch (error) {
    console.error('[BuyNowCheckout] clearBuyNowItem error:', error)
  }
}
