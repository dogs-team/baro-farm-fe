export type DevDummyUser = {
  id: number | string
  email: string
  name: string
  phone?: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  sellerApproved?: boolean
  sellerId?: string
  createdAt?: string
}

export type DevSellerProduct = {
  id: string
  sellerId: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  status: 'ON_SALE' | 'SOLD_OUT' | 'STOPPED'
  createdAt: string
}

const DUMMY_USER_KEY = 'dummyUser'
const DEV_SELLER_PRODUCTS_KEY = 'devSellerProducts'

const safeParse = <T>(raw: string | null): T | null => {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const getDevDummyUser = (): DevDummyUser | null => {
  if (typeof window === 'undefined') return null
  return safeParse<DevDummyUser>(window.localStorage.getItem(DUMMY_USER_KEY))
}

export const getDevSellerId = (user: DevDummyUser | null): string | null => {
  if (!user) return null
  if (user.sellerId) return user.sellerId
  return String(user.id)
}

export const isApprovedSeller = (user: DevDummyUser | null): boolean => {
  return Boolean(user && user.role === 'SELLER' && user.sellerApproved)
}

export const getDevSellerProducts = (sellerId: string): DevSellerProduct[] => {
  if (typeof window === 'undefined') return []
  const all = safeParse<DevSellerProduct[]>(window.localStorage.getItem(DEV_SELLER_PRODUCTS_KEY))
  if (!all) return []
  return all.filter((item) => item.sellerId === sellerId)
}

export const createDevSellerProduct = (
  sellerId: string,
  input: Omit<DevSellerProduct, 'id' | 'sellerId' | 'createdAt'>
): DevSellerProduct => {
  if (typeof window === 'undefined') {
    throw new Error('Not available on server')
  }

  const next: DevSellerProduct = {
    id: `dev-product-${Date.now()}`,
    sellerId,
    createdAt: new Date().toISOString(),
    ...input,
  }

  const all =
    safeParse<DevSellerProduct[]>(window.localStorage.getItem(DEV_SELLER_PRODUCTS_KEY)) || []
  all.unshift(next)
  window.localStorage.setItem(DEV_SELLER_PRODUCTS_KEY, JSON.stringify(all))
  return next
}

export const deleteDevSellerProduct = (productId: string): void => {
  if (typeof window === 'undefined') return
  const all =
    safeParse<DevSellerProduct[]>(window.localStorage.getItem(DEV_SELLER_PRODUCTS_KEY)) || []
  const filtered = all.filter((item) => item.id !== productId)
  window.localStorage.setItem(DEV_SELLER_PRODUCTS_KEY, JSON.stringify(filtered))
}
