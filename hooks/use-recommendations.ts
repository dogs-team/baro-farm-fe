'use client'

import { useState, useEffect, useCallback } from 'react'
import { recommendService } from '@/lib/api/services'
import { getUserId } from '@/lib/api/client'
import type {
  ProductRecommendResponse,
  PersonalizedRecommendationResponse,
  RecipeRecommendResponse,
  PersonalizedRecommendParams,
  RecipeRecommendParams,
  SimilarProductsParams,
} from '@/lib/api/types'

/**
 * 개인화 추천 상품 조회 훅
 *
 * @param topK - 추천할 상품 개수 (기본값: 5)
 * @param enabled - 훅 활성화 여부 (기본값: true)
 * @returns 추천 상품 목록과 추천 근거, 로딩 상태, 에러 상태
 *
 * @example
 * ```tsx
 * const { data: recommendations, isLoading, error } = usePersonalizedRecommendations(10);
 *
 * if (isLoading) return <LoadingSkeleton />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!recommendations || recommendations.products.length === 0) {
 *   return <EmptyRecommendationMessage />;
 * }
 *
 * return (
 *   <div>
 *     {recommendations.recommendationReason && (
 *       <p>{recommendations.recommendationReason}</p>
 *     )}
 *     {recommendations.products.map(product => (
 *       <ProductCard key={product.productId} product={product} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function usePersonalizedRecommendations(topK: number = 5, enabled: boolean = true) {
  const [data, setData] = useState<PersonalizedRecommendationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchRecommendations = useCallback(async () => {
    const userId = getUserId()

    if (!userId) {
      setError(new Error('사용자 ID가 없습니다. 로그인이 필요합니다.'))
      setData(null)
      return
    }

    if (!enabled) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const recommendations = await recommendService.getPersonalizedRecommendations({
        userId,
        topK,
      })
      setData(recommendations)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('개인화 추천을 불러오는데 실패했습니다.')
      setError(error)
      setData(null)
      console.error('개인화 추천 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }, [topK, enabled])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  return {
    data,
    isLoading,
    error,
    refetch: fetchRecommendations,
  }
}

/**
 * 레시피 추천 조회 훅
 *
 * @param enabled - 훅 활성화 여부 (기본값: true)
 * @returns 레시피 추천 결과, 로딩 상태, 에러 상태
 *
 * @example
 * ```tsx
 * const { data: recipe, isLoading, error } = useRecipeRecommendation();
 *
 * if (isLoading) return <LoadingSkeleton />;
 * if (error?.code === 'CART_NOT_FOUND') {
 *   return <EmptyCartMessage />;
 * }
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <div>
 *     <h2>{recipe.recipeName}</h2>
 *     <RecipeInstructions instructions={recipe.instructions} />
 *     <IngredientsList recipe={recipe} />
 *   </div>
 * );
 * ```
 */
export function useRecipeRecommendation(enabled: boolean = true) {
  const [data, setData] = useState<RecipeRecommendResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<(Error & { code?: string }) | null>(null)

  const fetchRecipe = useCallback(async () => {
    const userId = getUserId()

    if (!userId) {
      setError(new Error('사용자 ID가 없습니다. 로그인이 필요합니다.'))
      setData(null)
      return
    }

    if (!enabled) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const recipe = await recommendService.getRecipeRecommendation({ userId })
      setData(recipe)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('레시피 추천을 불러오는데 실패했습니다.')
      // API 에러에서 code 추출 시도
      if (err && typeof err === 'object' && 'code' in err) {
        ;(error as Error & { code?: string }).code = String(err.code)
      }
      setError(error as Error & { code?: string })
      setData(null)
      console.error('레시피 추천 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchRecipe()
  }, [fetchRecipe])

  return {
    data,
    isLoading,
    error,
    refetch: fetchRecipe,
  }
}

/**
 * 유사 상품 추천 조회 훅
 *
 * @param productId - 기준 상품 ID
 * @param topK - 추천할 상품 개수 (기본값: 3)
 * @param enabled - 훅 활성화 여부 (기본값: true)
 * @returns 유사 상품 목록, 로딩 상태, 에러 상태
 *
 * @example
 * ```tsx
 * const { data: similarProducts, isLoading, error } = useSimilarProducts(productId, 5);
 *
 * if (isLoading) return <ProductSkeleton />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!similarProducts || similarProducts.length === 0) {
 *   return null; // 유사 상품이 없으면 표시하지 않음
 * }
 *
 * return (
 *   <div>
 *     <h3>이런 상품은 어때요?</h3>
 *     <div className="grid grid-cols-3 gap-4">
 *       {similarProducts.map(product => (
 *         <ProductCard key={product.productId} product={product} />
 *       ))}
 *     </div>
 *   </div>
 * );
 * ```
 */
export function useSimilarProducts(
  productId: string | null | undefined,
  topK: number = 3,
  enabled: boolean = true
) {
  const [data, setData] = useState<ProductRecommendResponse[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchSimilarProducts = useCallback(async () => {
    if (!productId) {
      setData(null)
      return
    }

    if (!enabled) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const products = await recommendService.getSimilarProducts({
        productId,
        topK,
      })
      setData(products)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('유사 상품을 불러오는데 실패했습니다.')
      setError(error)
      setData(null)
      console.error('유사 상품 추천 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }, [productId, topK, enabled])

  useEffect(() => {
    fetchSimilarProducts()
  }, [fetchSimilarProducts])

  return {
    data,
    isLoading,
    error,
    refetch: fetchSimilarProducts,
  }
}
