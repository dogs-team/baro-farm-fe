import { farmApi } from '../client'
import type { Farm, PaginatedResponse, PaginationParams } from '../types'

export const farmService = {
  // 농장 목록 조회 (스웨거: GET /api/v1/farms)
  async getFarms(
    params?: PaginationParams & { keyword?: string; location?: string }
  ): Promise<PaginatedResponse<Farm>> {
    return farmApi.get<PaginatedResponse<Farm>>('/api/v1/farms', { params })
  },

  // 농장 상세 조회 (스웨거: GET /api/v1/farms/{id})
  async getFarm(id: number): Promise<Farm> {
    return farmApi.get<Farm>(`/api/v1/farms/${id}`)
  },

  // 농장 정보 등록 (스웨거: POST /api/v1/farms)
  async createFarm(data: {
    name: string
    address: string
    description?: string
    phone?: string
    email?: string
    images?: string[]
  }): Promise<Farm> {
    return farmApi.post<Farm>('/api/v1/farms', data)
  },

  // 농장 정보 수정 (스웨거: PUT /api/v1/farms/{id})
  async updateFarm(id: number, data: Partial<Farm>): Promise<Farm> {
    return farmApi.put<Farm>(`/api/v1/farms/${id}`, data)
  },

  // 농장 삭제 (스웨거: DELETE /api/v1/farms/{id})
  async deleteFarm(id: number): Promise<void> {
    return farmApi.delete<void>(`/api/v1/farms/${id}`)
  },

  // 인기 농장 조회 (추가 엔드포인트)
  async getPopularFarms(limit?: number): Promise<Farm[]> {
    return farmApi.get<Farm[]>('/api/v1/farms/popular', { params: { limit } })
  },

  // 근처 농장 조회 (추가 엔드포인트)
  async getNearbyFarms(lat: number, lng: number, radius?: number): Promise<Farm[]> {
    return farmApi.get<Farm[]>('/api/v1/farms/nearby', { params: { lat, lng, radius } })
  },
}
