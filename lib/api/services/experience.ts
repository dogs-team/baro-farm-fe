import { experienceApi } from '../client'
import type {
  Experience,
  ExperienceCreateRequest,
  ExperienceUpdateRequest,
  ExperienceBooking,
  ReservationRequest,
  PaginatedResponse,
  PaginationParams,
} from '../types'

export const experienceService = {
  // 체험 프로그램 목록 조회
  async getExperiences(
    params?: PaginationParams & { category?: string; farmId?: string }
  ): Promise<PaginatedResponse<Experience>> {
    const response = await experienceApi.get<{ data: PaginatedResponse<Experience> }>(
      '/api/v1/experiences',
      { params }
    )
    // API 응답이 { status, data: { content, ... }, message } 형태이므로 data 필드 추출
    return response.data
  },

  // 체험 프로그램 등록
  async createExperience(data: ExperienceCreateRequest): Promise<Experience> {
    const response = await experienceApi.post<{ data: Experience }>('/api/v1/experiences', data)
    return response.data
  },

  // 체험 프로그램 상세 조회
  async getExperience(id: string): Promise<Experience> {
    const response = await experienceApi.get<{ data: Experience }>(`/api/v1/experiences/${id}`)
    return response.data
  },

  // 체험 프로그램 수정
  async updateExperience(id: string, data: ExperienceUpdateRequest): Promise<Experience> {
    const response = await experienceApi.put<{ data: Experience }>(
      `/api/v1/experiences/${id}`,
      data
    )
    return response.data
  },

  // 체험 프로그램 삭제
  async deleteExperience(id: string): Promise<void> {
    return experienceApi.delete(`/api/v1/experiences/${id}`)
  },

  // 내 체험 프로그램 목록 조회
  async getMyExperiences(params?: PaginationParams): Promise<PaginatedResponse<Experience>> {
    const response = await experienceApi.get<{ data: PaginatedResponse<Experience> }>(
      '/api/v1/experiences/my-farm',
      {
        params,
      }
    )
    return response.data
  },
}

export const reservationService = {
  // 예약 등록
  async createReservation(data: ReservationRequest): Promise<ExperienceBooking> {
    const response = await experienceApi.post<{ data: ExperienceBooking }>(
      '/api/v1/reservations',
      data
    )
    return response.data
  },

  // 예약 목록 조회
  async getReservations(params?: PaginationParams): Promise<PaginatedResponse<ExperienceBooking>> {
    const response = await experienceApi.get<{ data: PaginatedResponse<ExperienceBooking> }>(
      '/api/v1/reservations',
      {
        params,
      }
    )
    return response.data
  },

  // 예약 상세 조회
  async getReservation(reservationId: string): Promise<ExperienceBooking> {
    const response = await experienceApi.get<{ data: ExperienceBooking }>(
      `/api/v1/reservations/${reservationId}`
    )
    return response.data
  },

  // 예약 상태 변경
  async updateReservationStatus(reservationId: string, status: string): Promise<ExperienceBooking> {
    const response = await experienceApi.put<{ data: ExperienceBooking }>(
      `/api/v1/reservations/${reservationId}/status`,
      {
        status,
      }
    )
    return response.data
  },

  // 예약 삭제
  async deleteReservation(reservationId: string): Promise<void> {
    return experienceApi.delete(`/api/v1/reservations/${reservationId}`)
  },
}
