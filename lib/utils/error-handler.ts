import type { ApiError } from '@/lib/api/client'

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 */
export function getErrorMessage(error: unknown): string {
  const apiError = error as ApiError

  // ApiError 형식인 경우
  if (apiError?.status !== undefined) {
    // 이미 명확한 메시지가 있으면 그대로 사용
    if (apiError.message && !apiError.message.includes('오류 코드')) {
      return apiError.message
    }

    // 상태 코드별 기본 메시지
    switch (apiError.status) {
      case 0:
        return apiError.message || '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
      case 400:
        return apiError.message || '잘못된 요청입니다. 입력 정보를 확인해주세요.'
      case 401:
        return '인증이 필요합니다. 로그인해주세요.'
      case 403:
        return '접근 권한이 없습니다.'
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.'
      case 409:
        return '이미 존재하는 데이터입니다.'
      case 422:
        return apiError.message || '입력 데이터가 올바르지 않습니다.'
      case 429:
        return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      case 503:
        return '서비스를 일시적으로 사용할 수 없습니다.'
      default:
        return apiError.message || `오류가 발생했습니다. (오류 코드: ${apiError.status})`
    }
  }

  // 일반 Error 객체인 경우
  if (error instanceof Error) {
    return error.message
  }

  // 알 수 없는 에러
  return '알 수 없는 오류가 발생했습니다.'
}

/**
 * API 에러의 제목을 반환
 */
export function getErrorTitle(error: unknown): string {
  const apiError = error as ApiError

  if (apiError?.status !== undefined) {
    switch (apiError.status) {
      case 0:
        return '연결 오류'
      case 400:
        return '잘못된 요청'
      case 401:
        return '인증 필요'
      case 403:
        return '권한 없음'
      case 404:
        return '찾을 수 없음'
      case 409:
        return '중복 오류'
      case 422:
        return '입력 오류'
      case 429:
        return '요청 제한'
      case 500:
        return '서버 오류'
      case 503:
        return '서비스 불가'
      default:
        return '오류 발생'
    }
  }

  return '오류 발생'
}
