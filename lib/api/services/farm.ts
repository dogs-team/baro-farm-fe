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
    const response = await farmApi.get<{ data: PaginatedResponse<Farm> }>('/api/v1/farms', {
      params: params as Record<string, string | number | boolean | undefined> | undefined,
    })
    // API 응답이 { status, data: { content, ... }, message } 형태이므로 data 필드 추출
    return response.data
  },

  // 농장 정보 등록
  async createFarm(data: FarmCreateRequestDto): Promise<Farm> {
    return farmApi.post<Farm>('/api/v1/farms', data)
  },

  // 내 농장 목록 조회 (/api/v1/farms/me → PaginatedResponse<Farm>)
  async getMyFarms(params?: PaginationParams): Promise<PaginatedResponse<Farm>> {
    const response = await farmApi.get<{ data: PaginatedResponse<Farm> }>('/api/v1/farms/me', {
      params: params as Record<string, string | number | boolean | undefined> | undefined,
    })
    // API 응답이 { status, data: { content, ... }, message } 형태이므로 data 필드 추출
    return response.data
  },

  // 농장 상세 조회
  async getFarm(id: string): Promise<Farm> {
    const response = await farmApi.get<{ data: Farm }>(`/api/v1/farms/${id}`)
    // API 응답이 { status, data: { ... }, message } 형태이므로 data 필드 추출
    return response.data
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
