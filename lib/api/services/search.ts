import { searchApi } from '../client'
import type { SearchResult, SearchParams, Product, Experience, Farm } from '../types'

export const searchService = {
  // 통합 검색 (스웨거: GET /api/v1/search)
  async search(params: SearchParams): Promise<SearchResult> {
    return searchApi.get<SearchResult>('/api/v1/search', { params })
  },

  // 상품 검색 (추가 엔드포인트)
  async searchProducts(keyword: string, page?: number, size?: number): Promise<Product[]> {
    return searchApi.get<Product[]>('/api/v1/search/products', { params: { keyword, page, size } })
  },

  // 체험 검색 (추가 엔드포인트)
  async searchExperiences(keyword: string, page?: number, size?: number): Promise<Experience[]> {
    return searchApi.get<Experience[]>('/api/v1/search/experiences', {
      params: { keyword, page, size },
    })
  },

  // 농장 검색 (추가 엔드포인트)
  async searchFarms(keyword: string, page?: number, size?: number): Promise<Farm[]> {
    return searchApi.get<Farm[]>('/api/v1/search/farms', { params: { keyword, page, size } })
  },

  // 인기 검색어 조회 (추가 엔드포인트)
  async getPopularKeywords(): Promise<string[]> {
    return searchApi.get<string[]>('/api/v1/search/popular-keywords')
  },

  // 자동완성 (추가 엔드포인트)
  async getSuggestions(keyword: string): Promise<string[]> {
    return searchApi.get<string[]>('/api/v1/search/suggestions', { params: { keyword } })
  },

  // 상품 인덱싱 (테스트용) (스웨거: POST /api/v1/admin/search/products)
  async indexProduct(data: {
    productId: string
    productName: string
    productCategory: string
    price: number
    status: string
  }): Promise<{
    productId: string
    productName: string
    productCategory: string
    price: number
    status: string
    updatedAt: string
  }> {
    return searchApi.post('/api/v1/admin/search/products', data)
  },

  // 상품 삭제 (스웨거: DELETE /api/v1/admin/search/products/{productId})
  async deleteProductFromIndex(productId: string): Promise<void> {
    return searchApi.delete<void>(`/api/v1/admin/search/products/${productId}`)
  },
}
