import { productApi } from '../client'
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
}
