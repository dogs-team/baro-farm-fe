import { productApi } from '../client'
import type { Product, ProductListParams, PaginatedResponse } from '../types'

export const productService = {
  // 상품 생성 (스웨거: POST /api/products)
  async createProduct(data: {
    name: string
    description?: string
    price: number
    category?: string
    images?: string[]
    stock?: number
  }): Promise<Product> {
    return productApi.post<Product>('/api/products', data)
  },

  // 상품 목록 조회 (추가 엔드포인트)
  async getProducts(params?: ProductListParams): Promise<PaginatedResponse<Product>> {
    return productApi.get<PaginatedResponse<Product>>('/api/products', { params })
  },

  // 상품 상세 조회 (스웨거: GET /api/products/{id})
  async getProduct(id: number): Promise<Product> {
    return productApi.get<Product>(`/api/products/${id}`)
  },

  // 상품 수정 (스웨거: PATCH /api/products/{id})
  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    return productApi.patch<Product>(`/api/products/${id}`, data)
  },

  // 상품 삭제 (스웨거: DELETE /api/products/{id})
  async deleteProduct(id: number): Promise<void> {
    return productApi.delete<void>(`/api/products/${id}`)
  },

  // 카테고리별 상품 조회
  async getProductsByCategory(
    category: string,
    params?: ProductListParams
  ): Promise<PaginatedResponse<Product>> {
    return productApi.get<PaginatedResponse<Product>>(`/api/products/category/${category}`, {
      params,
    })
  },

  // 농장별 상품 조회
  async getProductsByFarm(
    farmId: number,
    params?: ProductListParams
  ): Promise<PaginatedResponse<Product>> {
    return productApi.get<PaginatedResponse<Product>>(`/api/products/farm/${farmId}`, { params })
  },

  // 인기 상품 조회
  async getPopularProducts(limit?: number): Promise<Product[]> {
    return productApi.get<Product[]>('/api/products/popular', { params: { limit } })
  },

  // 신상품 조회
  async getNewProducts(limit?: number): Promise<Product[]> {
    return productApi.get<Product[]>('/api/products/new', { params: { limit } })
  },

  // 할인 상품 조회
  async getDiscountedProducts(limit?: number): Promise<Product[]> {
    return productApi.get<Product[]>('/api/products/discounted', { params: { limit } })
  },

  // 추천 상품 조회
  async getRecommendedProducts(productId: number, limit?: number): Promise<Product[]> {
    return productApi.get<Product[]>(`/api/products/${productId}/recommended`, {
      params: { limit },
    })
  },
}
