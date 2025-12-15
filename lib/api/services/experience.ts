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
    return experienceApi.get<PaginatedResponse<Experience>>('/api/v1/experiences', { params })
  },

  // 체험 프로그램 등록
  async createExperience(data: ExperienceCreateRequest): Promise<Experience> {
    return experienceApi.post<Experience>('/api/v1/experiences', data)
  },

  // 체험 프로그램 상세 조회
  async getExperience(id: string): Promise<Experience> {
    return experienceApi.get<Experience>(`/api/v1/experiences/${id}`)
  },

  // 체험 프로그램 수정
  async updateExperience(id: string, data: ExperienceUpdateRequest): Promise<Experience> {
    return experienceApi.put<Experience>(`/api/v1/experiences/${id}`, data)
  },

  // 체험 프로그램 삭제
  async deleteExperience(id: string): Promise<void> {
    return experienceApi.delete(`/api/v1/experiences/${id}`)
  },

  // 내 체험 프로그램 목록 조회
  async getMyExperiences(params?: PaginationParams): Promise<PaginatedResponse<Experience>> {
    return experienceApi.get<PaginatedResponse<Experience>>('/api/v1/experiences/my-farm', {
      params,
    })
  },
}

export const reservationService = {
  // 예약 등록
  async createReservation(data: ReservationRequest): Promise<ExperienceBooking> {
    return experienceApi.post<ExperienceBooking>('/api/v1/reservations', data)
  },

  // 예약 목록 조회
  async getReservations(params?: PaginationParams): Promise<PaginatedResponse<ExperienceBooking>> {
    return experienceApi.get<PaginatedResponse<ExperienceBooking>>('/api/v1/reservations', {
      params,
    })
  },

  // 예약 상세 조회
  async getReservation(reservationId: string): Promise<ExperienceBooking> {
    return experienceApi.get<ExperienceBooking>(`/api/v1/reservations/${reservationId}`)
  },

  // 예약 상태 변경
  async updateReservationStatus(reservationId: string, status: string): Promise<ExperienceBooking> {
    return experienceApi.put<ExperienceBooking>(`/api/v1/reservations/${reservationId}/status`, {
      status,
    })
  },

  // 예약 삭제
  async deleteReservation(reservationId: string): Promise<void> {
    return experienceApi.delete(`/api/v1/reservations/${reservationId}`)
  },
}
