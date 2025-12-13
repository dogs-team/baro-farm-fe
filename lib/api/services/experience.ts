import { experienceApi } from '../client'
import type {
  Experience,
  ExperienceBooking,
  CreateBookingRequest,
  PaginatedResponse,
  PaginationParams,
} from '../types'

export const experienceService = {
  // 체험 프로그램 목록 조회 (Support Service - /api/v1/ 패턴 적용)
  async getExperiences(
    params?: PaginationParams & { category?: string; farmId?: number }
  ): Promise<PaginatedResponse<Experience>> {
    return experienceApi.get<PaginatedResponse<Experience>>('/api/v1/experiences', { params })
  },

  // 체험 프로그램 상세 조회
  async getExperience(id: number): Promise<Experience> {
    return experienceApi.get<Experience>(`/api/v1/experiences/${id}`)
  },

  // 인기 체험 프로그램 조회
  async getPopularExperiences(limit?: number): Promise<Experience[]> {
    return experienceApi.get<Experience[]>('/api/v1/experiences/popular', { params: { limit } })
  },

  // 농장별 체험 프로그램 조회
  async getExperiencesByFarm(farmId: number): Promise<Experience[]> {
    return experienceApi.get<Experience[]>(`/api/v1/experiences/farm/${farmId}`)
  },

  // 예약 가능 날짜 조회
  async getAvailableDates(
    experienceId: number,
    month: string
  ): Promise<{ date: string; available: number }[]> {
    return experienceApi.get(`/api/v1/experiences/${experienceId}/available-dates`, {
      params: { month },
    })
  },

  // 체험 예약
  async createBooking(data: CreateBookingRequest): Promise<ExperienceBooking> {
    return experienceApi.post<ExperienceBooking>('/api/v1/bookings', data)
  },

  // 내 예약 목록 조회
  async getMyBookings(params?: PaginationParams): Promise<PaginatedResponse<ExperienceBooking>> {
    return experienceApi.get<PaginatedResponse<ExperienceBooking>>('/api/v1/bookings/my', {
      params,
    })
  },

  // 예약 상세 조회
  async getBooking(id: number): Promise<ExperienceBooking> {
    return experienceApi.get<ExperienceBooking>(`/api/v1/bookings/${id}`)
  },

  // 예약 취소
  async cancelBooking(id: number, reason?: string): Promise<ExperienceBooking> {
    return experienceApi.post<ExperienceBooking>(`/api/v1/bookings/${id}/cancel`, { reason })
  },
}
