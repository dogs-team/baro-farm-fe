import { aiApi } from '../client'
import type {
  ProductRecommendResponse,
  PersonalizedRecommendationResponse,
  RecipeRecommendResponse,
  RecipeTestRequest,
  PersonalizedRecommendParams,
  RecipeRecommendParams,
  SimilarProductsParams,
} from '../types'

export const recommendService = {
  /**
   * 개인화 추천 상품 조회
   * GET /api/v1/recommendations/personalized/{userId}?topK={count}
   *
   * @param params - 개인화 추천 파라미터
   * @returns 추천 상품 목록과 추천 근거
   */
  async getPersonalizedRecommendations(
    params: PersonalizedRecommendParams
  ): Promise<PersonalizedRecommendationResponse> {
    return aiApi.get<PersonalizedRecommendationResponse>(
      `/api/v1/recommendations/personalized/${params.userId}`,
      {
        params: {
          topK: params.topK ?? 5,
        },
      }
    )
  },

  /**
   * 사용자의 장바구니 기반 레시피 추천
   * GET /api/v1/recommendations/recipes/{userId}
   *
   * @param params - 레시피 추천 파라미터
   * @returns 레시피 추천 결과
   */
  async getRecipeRecommendation(params: RecipeRecommendParams): Promise<RecipeRecommendResponse> {
    return aiApi.get<RecipeRecommendResponse>(`/api/v1/recommendations/recipes/${params.userId}`)
  },

  /**
   * 레시피 추천 (테스트용)
   * POST /api/v1/recommendations/recipes/test
   *
   * @param cartData - 테스트용 장바구니 데이터
   * @returns 레시피 추천 결과
   */
  async getRecipeRecommendationTest(cartData: RecipeTestRequest): Promise<RecipeRecommendResponse> {
    return aiApi.post<RecipeRecommendResponse>('/api/v1/recommendations/recipes/test', cartData)
  },

  /**
   * 특정 상품과 유사한 상품 추천
   * GET /api/v1/recommendations/similar/{productId}?topK={count}
   *
   * @param params - 유사 상품 추천 파라미터
   * @returns 유사 상품 목록
   */
  async getSimilarProducts(params: SimilarProductsParams): Promise<ProductRecommendResponse[]> {
    return aiApi.get<ProductRecommendResponse[]>(
      `/api/v1/recommendations/similar/${params.productId}`,
      {
        params: {
          topK: params.topK ?? 3,
        },
      }
    )
  },
}
