import { productApi, aiApi } from '../client'
import type {
  Product,
  ProductListParams,
  ProductCreateRequest,
  ProductUpdateRequest,
  PaginatedResponse,
} from '../types'

export const productService = {
  // 상품 목록 조회
  async getProducts(params?: ProductListParams): Promise<PaginatedResponse<Product>> {
    const response = await productApi.get<{ data: PaginatedResponse<Product> }>(
      '/api/v1/products',
      {
        params: params as Record<string, string | number | boolean | undefined>,
      }
    )
    // API 응답이 { status, data: { content, ... }, message } 형태이므로 data 필드 추출
    return response.data
  },

  // 상품 생성
  async createProduct(data: ProductCreateRequest): Promise<Product> {
    return productApi.post<Product>('/api/v1/products', data)
  },

  // 상품 상세 조회
  async getProduct(id: string): Promise<Product> {
    const response = await productApi.get<{ data: Product }>(`/api/v1/products/${id}`)
    // API 응답이 { status, data: { ... }, message } 형태이므로 data 필드 추출
    return response.data
  },

  // 상품 수정
  async updateProduct(id: string, data: ProductUpdateRequest): Promise<Product> {
    return productApi.patch<Product>(`/api/v1/products/${id}`, data)
  },

  // 상품 삭제
  async deleteProduct(id: string): Promise<void> {
    return productApi.delete<void>(`/api/v1/products/${id}`)
  },

  // 실시간 랭킹 상품 조회 (주석처리)
  // async getRankingProducts(params?: { limit?: number }): Promise<Product[]> {
  //   try {
  //     // AI 서비스 랭킹 API 호출
  //     // Gateway 기준 경로: /ranking/products/top
  //     // 응답 형태는 [Product] 또는 { data: Product[] } 둘 다 대응
  //     const response = await aiApi.get<Product[] | { data: Product[] }>(
  //       '/ranking/products/top',
  //       {
  //         params: { limit: params?.limit || 3 },
  //       }
  //     )

  //     const data = Array.isArray(response) ? response : response?.data
  //     return data ?? []
  //   } catch (error) {
  //     console.error('랭킹 상품 조회 실패:', error)
  //     // 에러 발생 시 빈 배열 반환
  //     return []
  //   }
  // },
}
