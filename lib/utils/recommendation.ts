/**
 * 추천 관련 유틸리티 함수
 */

import type { ProductRecommendResponse, RecipeRecommendResponse } from '../api/types'

/**
 * 개인화 추천이 비어있는지 확인
 *
 * @param recommendations - 추천 상품 목록
 * @returns 추천이 비어있으면 true
 */
export function isEmptyRecommendation(
  recommendations: ProductRecommendResponse[] | null | undefined
): boolean {
  return !recommendations || recommendations.length === 0
}

/**
 * 개인화 추천이 비어있을 때 표시할 메시지
 */
export const EMPTY_RECOMMENDATION_MESSAGES = {
  default: '아직 추천할 상품이 없습니다. 더 많은 상품을 둘러보시면 맞춤 추천을 받을 수 있습니다.',
  needMoreActivity: '추천 상품을 보려면 더 많은 활동이 필요합니다.',
  personalized: '맞춤 추천을 받으려면 더 많은 상품을 둘러보세요.',
} as const

/**
 * 레시피 추천이 실패했을 때 표시할 메시지
 */
export const RECIPE_RECOMMENDATION_MESSAGES = {
  cartEmpty: '레시피 추천을 받으려면 장바구니에 상품을 담아주세요.',
  cartNotFound: '장바구니를 찾을 수 없습니다.',
  default: '레시피 추천을 불러오는데 실패했습니다.',
} as const

/**
 * 에러 코드에 따른 메시지 반환
 *
 * @param error - 에러 객체
 * @returns 사용자에게 표시할 메시지
 */
export function getRecommendationErrorMessage(error: Error & { code?: string }): string {
  if (error.code === 'CART_NOT_FOUND') {
    return RECIPE_RECOMMENDATION_MESSAGES.cartEmpty
  }
  if (error.code === 'USER_PROFILE_NOT_FOUND') {
    return EMPTY_RECOMMENDATION_MESSAGES.needMoreActivity
  }
  return error.message || RECIPE_RECOMMENDATION_MESSAGES.default
}

/**
 * 추천 상품이 비어있는지 확인하고 메시지 반환
 *
 * @param recommendations - 추천 상품 목록
 * @param messageType - 표시할 메시지 타입
 * @returns 추천이 비어있으면 메시지, 아니면 null
 */
export function getEmptyRecommendationMessage(
  recommendations: ProductRecommendResponse[] | null | undefined,
  messageType: keyof typeof EMPTY_RECOMMENDATION_MESSAGES = 'default'
): string | null {
  if (isEmptyRecommendation(recommendations)) {
    return EMPTY_RECOMMENDATION_MESSAGES[messageType]
  }
  return null
}

/**
 * 가격 포맷팅 (천 단위 구분)
 *
 * @param price - 가격
 * @returns 포맷팅된 가격 문자열
 *
 * @example
 * formatPrice(12345) // "12,345원"
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`
}

/**
 * 레시피 조리법을 단계별로 분리
 *
 * @param instructions - 레시피 조리법 문자열
 * @returns 단계별로 분리된 배열
 *
 * @example
 * parseRecipeInstructions("1. 재료를 준비합니다.\n2. 끓는 물에 넣습니다.")
 * // ["재료를 준비합니다.", "끓는 물에 넣습니다."]
 */
export function parseRecipeInstructions(instructions: string): string[] {
  return instructions
    .split('\n')
    .map((step) => step.trim())
    .filter((step) => step.length > 0)
    .map((step) => {
      // "1. ", "2. " 같은 번호 제거
      return step.replace(/^\d+\.\s*/, '')
    })
}
