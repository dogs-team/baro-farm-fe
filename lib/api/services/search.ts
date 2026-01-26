import { searchApi } from '../client'
import type {
  UnifiedSearchResponse,
  UnifiedAutoCompleteResponse,
  ProductAutoItem,
  FarmAutoItem,
  ExperienceAutoItem,
  SearchParams,
} from '../types'

export const searchService = {
  // 통합 검색
  async search(params: SearchParams): Promise<UnifiedSearchResponse> {
    // API 요구사항에 맞춰 keyword를 q로 매핑 및 엔드포인트 변경
    const queryParams: Record<string, any> = {
      q: params.keyword,
      type: params.type,
      page: params.page,
      size: params.size,
    }
    const response = await searchApi.get<{
      status: number
      data: UnifiedSearchResponse
      message: string | null
    }>('/api/v1/ai-service/search', { params: queryParams })
    return response.data
  },

  // 통합 자동완성
  async getAutocomplete(keyword: string): Promise<UnifiedAutoCompleteResponse> {
    return searchApi.get<UnifiedAutoCompleteResponse>('/api/v1/ai-service/search/autocomplete', {
      params: { keyword },
    })
  },

  // 상품 자동완성
  async getProductAutocomplete(keyword: string): Promise<ProductAutoItem[]> {
    return searchApi.get<ProductAutoItem[]>('/api/v1/ai-service/search/product/autocomplete', {
      params: { keyword },
    })
  },

  // 농장 자동완성
  async getFarmAutocomplete(keyword: string): Promise<FarmAutoItem[]> {
    return searchApi.get<FarmAutoItem[]>('/api/v1/ai-service/search/farm/autocomplete', {
      params: { keyword },
    })
  },

  // 체험 자동완성
  async getExperienceAutocomplete(keyword: string): Promise<ExperienceAutoItem[]> {
    return searchApi.get<ExperienceAutoItem[]>(
      '/api/v1/ai-service/search/experience/autocomplete',
      {
        params: { keyword },
      }
    )
  },
}
