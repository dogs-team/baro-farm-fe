const USER_ID_KEY = 'userId'
const USER_ROLE_KEY = 'userRole'

export type StoredTokens = {
  userId?: string
  userRole?: string
}

export const setAccessToken = (_token: string | null) => {
  void _token
}

export const getAccessToken = (): string | null => {
  return null
}

export const setRefreshToken = (_token: string | null) => {
  void _token
}

export const getRefreshToken = (): string | null => {
  return null
}

export const setUserId = (userId: string | null) => {
  if (typeof window === 'undefined') return
  if (!userId) {
    window.localStorage.removeItem(USER_ID_KEY)
    return
  }
  window.localStorage.setItem(USER_ID_KEY, userId)
}

export const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(USER_ID_KEY)
}

export const getUserIdFromToken = (): string | null => {
  const token = getAccessToken()
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload.uid || payload.userId || null
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

export const setUserRole = (role: string | null) => {
  if (typeof window === 'undefined') return
  if (!role) {
    window.localStorage.removeItem(USER_ROLE_KEY)
    return
  }
  window.localStorage.setItem(USER_ROLE_KEY, role)
}

export const getUserRole = (): string | null => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(USER_ROLE_KEY)
}

export const setAuthTokens = (tokens: StoredTokens | null) => {
  if (!tokens) {
    setUserId(null)
    setUserRole(null)
    return
  }

  if (tokens.userId) {
    setUserId(tokens.userId)
  }
  if (tokens.userRole) {
    setUserRole(tokens.userRole)
  }
}
