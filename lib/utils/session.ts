// =====================
// 세션 키 관리 유틸리티
// =====================
// 비로그인 사용자의 장바구니 관리를 위한 세션 키 생성 및 관리

const SESSION_KEY_STORAGE_KEY = 'sessionKey'

/**
 * 세션 키를 가져오거나 없으면 새로 생성
 * @returns 세션 키 (UUID 형식)
 */
export function getOrCreateSessionKey(): string {
  if (typeof window === 'undefined') {
    // SSR 환경에서는 빈 문자열 반환
    return ''
  }

  let sessionKey = window.localStorage.getItem(SESSION_KEY_STORAGE_KEY)

  if (!sessionKey) {
    // UUID v4 형식으로 세션 키 생성
    sessionKey = crypto.randomUUID()
    window.localStorage.setItem(SESSION_KEY_STORAGE_KEY, sessionKey)
  }

  return sessionKey
}

/**
 * 세션 키 가져오기 (생성하지 않음)
 * @returns 세션 키 또는 null
 */
export function getSessionKey(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(SESSION_KEY_STORAGE_KEY)
}

/**
 * 세션 키 삭제
 */
export function clearSessionKey(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(SESSION_KEY_STORAGE_KEY)
}

/**
 * 세션 키 설정
 * @param sessionKey 세션 키
 */
export function setSessionKey(sessionKey: string | null): void {
  if (typeof window === 'undefined') {
    return
  }
  if (!sessionKey) {
    window.localStorage.removeItem(SESSION_KEY_STORAGE_KEY)
    return
  }
  window.localStorage.setItem(SESSION_KEY_STORAGE_KEY, sessionKey)
}
