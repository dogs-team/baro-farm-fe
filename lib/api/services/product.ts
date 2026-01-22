import { productApi, aiApi } from '../client'
import type {
  Product,
  ProductListParams,
  ProductCreateRequest,
  ProductUpdateRequest,
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

  // 상품 생성 (Multipart)
  async createProduct(data: ProductCreateRequest, images: File[]): Promise<Product> {
    const formData = new FormData()
    formData.append('data', JSON.stringify(data))
    if (images && images.length > 0) {
      images.forEach((file) => formData.append('images', file))
    }

    const userId = getUserId() || ''
    const userRole = getUserRole()

    // Header 설정은 ApiClient에서 자동으로 처리되지만, multipart/form-data의 경우
    // body가 FormData일 때 브라우저가 자동으로 Content-Type을 설정해야 함.
    // ApiClient의 buildHeaders에서 Content-Type: application/json을 강제하면 안됨.
    // -> ApiClient 수정 필요할 수 있음. 하지만 fetch는 Body가 FormData이면 Content-Type 헤더를 자동 설정함.
    // ApiClient의 request 메서드에서 options.body가 FormData인지 체크 필요.
    // 여기서는 일단 direct fetch에 가깝게 호출하거나 ApiClient가 이를 지원한다고 가정.
    // 현재 ApiClient 구현상 headers에 'Content-Type': 'application/json'이 기본값임.
    // 이를 덮어쓰기 위해 headers에 undefined를 주거나, ApiClient를 수정해야 함.
    // 여기서는 ApiClient.post 메서드를 사용하되, Content-Type을 null/undefined로 보내어 client.ts에서 처리하도록 유도하거나
    // client.ts를 수정해야 함. (client.ts 수정 없이 작동하려면 headers에 Content-Type을 명시적으로 제거해야 함)

    // client.ts의 buildHeaders를 보면:
    // const headers: Record<string, string> = { 'Content-Type': 'application/json', ... }
    // 따라서 여기서 Content-Type을 'multipart/form-data'로 줘도 boundary가 없어서 실패함.
    // 해결책: client.ts에서 body가 FormData이면 Content-Type 헤더를 삭제하도록 수정해야 함.
    // 다음 스텝에서 client.ts 수정 예정.

    const response = await productApi.post<{ data: Product }>('/api/v1/products', formData, {
      headers: {
        'X-User-Id': userId,
        'X-User-Role': userRole,
      },
    })
    return response.data
  },

  // 상품 상세 조회
  async getProduct(id: string): Promise<Product> {
    const response = await productApi.get<{ data: Product }>(`/api/v1/products/${id}`)
    return response.data
  },

  // 상품 수정 (Multipart)
  async updateProduct(
    id: string,
    data: ProductUpdateRequest,
    images: File[] | null
  ): Promise<Product> {
    const formData = new FormData()
    formData.append('data', JSON.stringify(data))

    // REPLACE 모드일 때만 이미지 전송
    if (data.imageUpdateMode === 'REPLACE' && images && images.length > 0) {
      images.forEach((file) => formData.append('images', file))
    }

    const userId = getUserId() || ''
    const userRole = getUserRole()

    const response = await productApi.patch<{ data: Product }>(`/api/v1/products/${id}`, formData, {
      headers: {
        'X-User-Id': userId,
        'X-User-Role': userRole,
      },
    })
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
