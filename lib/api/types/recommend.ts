// =====================
// Recommendation Types
// =====================

/**
 * 상품 추천 응답
 * 개인화 추천, 유사 상품 추천에서 사용
 */
export interface ProductRecommendResponse {
  productId: string // UUID
  productName: string
  productCategoryName: string
  price: number // Long
}

/**
 * 부족한 재료별 상품 추천 응답
 */
export interface IngredientRecommendResponse {
  ingredientName: string
  products: ProductRecommendResponse[] // 최대 2개
}

/**
 * 레시피 추천 응답
 */
export interface RecipeRecommendResponse {
  recipeName: string
  ownedIngredients: string[] // 보유 중인 재료 목록
  missingCoreIngredients: string[] // 부족한 핵심 재료 목록
  missingRecommendations: IngredientRecommendResponse[] // 부족한 재료별 상품 추천
  instructions: string // 레시피 조리법
}

/**
 * 레시피 추천 테스트용 요청 Body
 */
export interface RecipeTestRequest {
  cartId: string | null // UUID
  buyerId: string | null // UUID
  items: Array<{
    productId: string // UUID
    productName: string
    quantity: number // Integer
    unitPrice: number // Long
    inventoryId: string // UUID
  }>
  totalPrice: number // Long
  createdAt: string | null // ISO 8601
  updatedAt: string | null // ISO 8601
}

/**
 * 개인화 추천 파라미터
 */
export interface PersonalizedRecommendParams {
  userId: string // UUID
  topK?: number // 기본값: 5
}

/**
 * 레시피 추천 파라미터
 */
export interface RecipeRecommendParams {
  userId: string // UUID
}

/**
 * 유사 상품 추천 파라미터
 */
export interface SimilarProductsParams {
  productId: string // UUID
  topK?: number // 기본값: 3
}
