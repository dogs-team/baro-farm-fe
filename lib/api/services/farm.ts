import { farmApi } from '../client'
import type {
  Farm,
  FarmCreateRequestDto,
  FarmUpdateRequestDto,
  PaginatedResponse,
  PaginationParams,
} from '../types'

export const farmService = {
  // 농장 목록 조회
  async getFarms(
    params?: PaginationParams & { keyword?: string; location?: string }
  ): Promise<PaginatedResponse<Farm>> {
    return farmApi.get<PaginatedResponse<Farm>>('/api/v1/farms', { params })
  },

  // 농장 정보 등록
  async createFarm(data: FarmCreateRequestDto): Promise<Farm> {
    return farmApi.post<Farm>('/api/v1/farms', data)
  },

  // 농장 상세 조회
  async getFarm(id: string): Promise<Farm> {
    return farmApi.get<Farm>(`/api/v1/farms/${id}`)
  },

  // 농장 정보 수정
  async updateFarm(id: string, data: FarmUpdateRequestDto): Promise<Farm> {
    return farmApi.put<Farm>(`/api/v1/farms/${id}`, data)
  },

  // 농장 삭제
  async deleteFarm(id: string): Promise<void> {
    return farmApi.delete<void>(`/api/v1/farms/${id}`)
  },
}
