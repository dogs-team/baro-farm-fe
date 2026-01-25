import { aiApi } from '../client'
import type {
  UnifiedSearchResponse,
  UnifiedAutoCompleteResponse,
  ProductSearchResponse,
  ExperienceSearchResponse,
  ProductAutoItem,
  ExperienceAutoItem,
  UnifiedSearchParams,
  UnifiedAutocompleteParams,
  ProductSearchParams,
  ProductAutocompleteParams,
  ExperienceSearchParams,
  ExperienceAutocompleteParams,
  CustomPage,
  ApiResponse,
} from '../types'

export const searchService = {
  /**
   * 통합 검색
   * GET /api/v1/search?q={keyword}&page={page}&size={size}
   *
   * @param params - 검색 파라미터
   * @returns 통합 검색 결과 (상품 + 체험)
   */
  async unifiedSearch(params: UnifiedSearchParams): Promise<UnifiedSearchResponse> {
    const response = await aiApi.get<ApiResponse<UnifiedSearchResponse>>('/api/v1/search', {
      params: {
        q: params.q,
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    })

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '통합 검색 실패')
    }

    return response.data
  },

  /**
   * 통합 자동완성
   * GET /api/v1/search/autocomplete?q={keyword}&pSize={productSize}&eSize={experienceSize}
   *
   * @param params - 자동완성 파라미터
   * @returns 통합 자동완성 결과
   */
  async unifiedAutocomplete(
    params: UnifiedAutocompleteParams
  ): Promise<UnifiedAutoCompleteResponse> {
    const response = await aiApi.get<ApiResponse<UnifiedAutoCompleteResponse>>(
      '/api/v1/search/autocomplete',
      {
        params: {
          q: params.q,
          pSize: params.pSize ?? 5,
          eSize: params.eSize ?? 5,
        },
      }
    )

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '통합 자동완성 실패')
    }

    return response.data
  },

  /**
   * 상품 검색 (필터링 지원)
   * GET /api/v1/search/product?keyword={keyword}&categories={categories}&priceMin={min}&priceMax={max}&page={page}&size={size}
   *
   * @param params - 상품 검색 파라미터
   * @returns 상품 검색 결과 (페이지네이션)
   */
  async productSearch(params: ProductSearchParams): Promise<CustomPage<ProductSearchResponse>> {
    const queryParams: Record<string, any> = {}

    if (params.keyword) {
      queryParams.keyword = params.keyword
    }

    // categories는 배열로 여러 개 전송 가능 (예: categories=과일&categories=채소)
    if (params.categories && params.categories.length > 0) {
      queryParams.categories = params.categories
    }

    if (params.priceMin !== undefined) {
      queryParams.priceMin = params.priceMin
    }

    if (params.priceMax !== undefined) {
      queryParams.priceMax = params.priceMax
    }

    queryParams.page = params.page ?? 0
    queryParams.size = params.size ?? 20

    // 상품/체험 단독 검색 API는 CustomPage<T> 형식으로 직접 반환
    return aiApi.get<CustomPage<ProductSearchResponse>>('/api/v1/search/product', {
      params: queryParams,
    })
  },

  /**
   * 상품 자동완성
   * GET /api/v1/search/product/autocomplete?query={keyword}&size={size}
   *
   * @param params - 상품 자동완성 파라미터
   * @returns 상품 자동완성 결과 배열
   */
  async productAutocomplete(params: ProductAutocompleteParams): Promise<ProductAutoItem[]> {
    return aiApi.get<ProductAutoItem[]>('/api/v1/search/product/autocomplete', {
      params: {
        query: params.query,
        size: params.size ?? 5,
      },
    })
  },

  /**
   * 체험 검색
   * GET /api/v1/search/experience?keyword={keyword}&page={page}&size={size}
   *
   * @param params - 체험 검색 파라미터
   * @returns 체험 검색 결과 (페이지네이션)
   */
  async experienceSearch(
    params: ExperienceSearchParams
  ): Promise<CustomPage<ExperienceSearchResponse>> {
    const queryParams: Record<string, any> = {}

    if (params.keyword) {
      queryParams.keyword = params.keyword
    }

    queryParams.page = params.page ?? 0
    queryParams.size = params.size ?? 20

    // 상품/체험 단독 검색 API는 CustomPage<T> 형식으로 직접 반환
    return aiApi.get<CustomPage<ExperienceSearchResponse>>('/api/v1/search/experience', {
      params: queryParams,
    })
  },

  /**
   * 체험 자동완성
   * GET /api/v1/search/experience/autocomplete?query={keyword}&size={size}
   *
   * @param params - 체험 자동완성 파라미터
   * @returns 체험 자동완성 결과 배열
   */
  async experienceAutocomplete(
    params: ExperienceAutocompleteParams
  ): Promise<ExperienceAutoItem[]> {
    return aiApi.get<ExperienceAutoItem[]>('/api/v1/search/experience/autocomplete', {
      params: {
        query: params.query,
        size: params.size ?? 5,
      },
    })
  },

  // =====================
  // Legacy Methods (하위 호환성)
  // =====================

  /**
   * @deprecated unifiedSearch를 사용하세요
   */
  async search(params: {
    keyword: string
    type?: string
    page?: number
    size?: number
  }): Promise<UnifiedSearchResponse> {
    return this.unifiedSearch({
      q: params.keyword,
      page: params.page,
      size: params.size,
    })
  },

  /**
   * @deprecated unifiedAutocomplete를 사용하세요
   */
  async getAutocomplete(keyword: string): Promise<UnifiedAutoCompleteResponse> {
    return this.unifiedAutocomplete({ q: keyword })
  },

  /**
   * @deprecated productAutocomplete를 사용하세요
   */
  async getProductAutocomplete(keyword: string): Promise<ProductAutoItem[]> {
    return this.productAutocomplete({ query: keyword })
  },

  /**
   * @deprecated experienceAutocomplete를 사용하세요
   */
  async getExperienceAutocomplete(keyword: string): Promise<ExperienceAutoItem[]> {
    return this.experienceAutocomplete({ query: keyword })
  },
}
