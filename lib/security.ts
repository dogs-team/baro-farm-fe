/**
 * 보안 유틸리티 함수
 * SECURITY_INCIDENT_REPORT.md의 권장 사항에 따라 구현
 */

/**
 * 허용된 도메인 목록
 * API Gateway 및 허용된 서비스만 접근 가능
 */
const ALLOWED_DOMAINS = [
  '3.34.14.73', // API Gateway
  'localhost', // 로컬 개발 환경
  '127.0.0.1', // 로컬 개발 환경
  // 프로덕션 도메인 추가 시 여기에 추가
  // 'api.barofarm.com',
]

/**
 * URL 검증 함수
 * 허용된 도메인만 접근 가능하도록 검증
 *
 * @param url 검증할 URL
 * @returns 허용된 도메인이면 true, 아니면 false
 */
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname

    // localhost 및 127.0.0.1은 개발 환경에서만 허용
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // 프로덕션 환경에서는 차단
      if (process.env.NODE_ENV === 'production') {
        return false
      }
      return true
    }

    // 허용된 도메인 목록 확인
    return ALLOWED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
  } catch {
    // URL 파싱 실패 시 차단
    return false
  }
}

/**
 * 안전한 fetch 함수
 * URL 검증 후 fetch 실행
 *
 * @param url 요청할 URL
 * @param options fetch 옵션
 * @returns fetch 응답
 * @throws URL이 허용되지 않은 경우 Error
 */
export async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  if (!validateUrl(url)) {
    const error = new Error(`보안 정책 위반: 허용되지 않은 URL입니다. URL: ${url}`)
    console.error('[SECURITY]', error.message)
    throw error
  }

  return fetch(url, options)
}

/**
 * 의심스러운 패턴 감지
 * 로그 모니터링에 사용
 */
export const SUSPICIOUS_PATTERNS = [
  'javae',
  'minerd',
  'xmrig',
  'cpuminer',
  'pool.supportxmr',
  'accrochezvous',
  'base64.*bash',
  'eval.*exec',
] as const
