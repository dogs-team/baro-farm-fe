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
    return searchApi.get<UnifiedSearchResponse>('/api/v1/search', { params })
  },

  // 통합 자동완성
  async getAutocomplete(keyword: string): Promise<UnifiedAutoCompleteResponse> {
    return searchApi.get<UnifiedAutoCompleteResponse>('/api/v1/search/autocomplete', {
      params: { keyword },
    })
  },

  // 상품 자동완성
  async getProductAutocomplete(keyword: string): Promise<ProductAutoItem[]> {
    return searchApi.get<ProductAutoItem[]>('/api/v1/search/product/autocomplete', {
      params: { keyword },
    })
  },

  // 농장 자동완성
  async getFarmAutocomplete(keyword: string): Promise<FarmAutoItem[]> {
    return searchApi.get<FarmAutoItem[]>('/api/v1/search/farm/autocomplete', {
      params: { keyword },
    })
  },

  // 체험 자동완성
  async getExperienceAutocomplete(keyword: string): Promise<ExperienceAutoItem[]> {
    return searchApi.get<ExperienceAutoItem[]>('/api/v1/search/experience/autocomplete', {
      params: { keyword },
    })
  },
}
