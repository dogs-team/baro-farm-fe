import { productApi, aiApi } from '../client'
import type {
  Product,
  ProductListParams,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductDetailInfo,
  PaginatedResponse,
} from '../types'
import { getUserId, getAccessToken } from '../client' // Assume client.ts exports helpers or use local storage directly

// Helper to get role (In a real app, this should be better managed)
const getUserRole = () => {
  if (typeof window === 'undefined') return 'SELLER'
  // Try to parse token or local storage
  return localStorage.getItem('userRole') || 'SELLER'
}

export const productService = {
  // 상품 목록 조회
  async getProducts(params?: ProductListParams): Promise<PaginatedResponse<Product>> {
    const response = await productApi.get<{ data: PaginatedResponse<Product> }>(
      '/api/v1/products',
      {
        params: params as Record<string, string | number | boolean | undefined>,
      }
    )
    return response.data
  },

  // 상품 생성 (multipart/form-data)
  async createProduct(data: ProductCreateRequest, images?: File[]): Promise<ProductDetailInfo> {
    const formData = new FormData()

    // JSON 데이터를 문자열로 변환하여 추가
    formData.append('data', JSON.stringify(data))

    // 이미지 파일 추가 (0개 이상)
    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file)
      })
    }

    const userId = getUserId() || ''
    const userRole = getUserRole()

    const response = await productApi.post<{ data: ProductDetailInfo }>(
      '/api/v1/products',
      formData,
      {
        headers: {
          'X-User-Id': userId,
          'X-User-Role': userRole,
        },
      }
    )
    return response.data
  },

  // 상품 상세 조회
  async getProduct(id: string): Promise<ProductDetailInfo> {
    const response = await productApi.get<{ data: ProductDetailInfo }>(`/api/v1/products/${id}`)
    // API 응답이 { status, data: { ... }, message } 형태이므로 data 필드 추출
    return response.data
  },

  // 상품 수정 (multipart/form-data)
  async updateProduct(
    id: string,
    data: ProductUpdateRequest,
    images?: File[]
  ): Promise<ProductDetailInfo> {
    const formData = new FormData()

    // JSON 데이터를 문자열로 변환하여 추가
    formData.append('data', JSON.stringify(data))

    // imageUpdateMode가 REPLACE일 때만 이미지 파일 추가
    if (data.imageUpdateMode === 'REPLACE' && images && images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file)
      })
    }

    const userId = getUserId() || ''
    const userRole = getUserRole()

    const response = await productApi.patch<{ data: ProductDetailInfo }>(
      `/api/v1/products/${id}`,
      formData,
      {
        headers: {
          'X-User-Id': userId,
          'X-User-Role': userRole,
        },
      }
    )
    return response.data
  },

  // 상품 삭제
  async deleteProduct(id: string): Promise<void> {
    const userId = getUserId() || ''
    const userRole = getUserRole()

    await productApi.delete<void>(`/api/v1/products/${id}`, {
      headers: {
        'X-User-Id': userId,
        'X-User-Role': userRole,
      },
    })
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
