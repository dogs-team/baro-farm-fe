// =====================
// Experience Types
// =====================
export type ExperienceStatus = 'ON_SALE' | 'CLOSED'

export interface ExperienceCreateRequest {
  farmId: string // UUID
  title: string
  description: string
  pricePerPerson: number
  capacity: number
  durationMinutes: number
  availableStartDate: string // ISO date-time
  availableEndDate: string // ISO date-time
  status?: ExperienceStatus
}

export interface ExperienceUpdateRequest {
  title?: string
  description?: string
  pricePerPerson?: number
  capacity?: number
  durationMinutes?: number
  availableStartDate?: string
  availableEndDate?: string
  status?: ExperienceStatus
}

// FARM_EXPERIENCE (체험 프로그램)
export interface Experience {
  experienceId: string // PK, UUID
  farmId: string // FK → FARM.farm_id, UUID
  title: string
  description: string
  pricePerPerson: number // BigInteger
  capacity: number // Integer
  durationMinutes: number // Integer
  availableStartDate: string // Date
  availableEndDate: string // Date
  status: ExperienceStatus // Enum: ON_SALE, CLOSED
  createdAt?: string
  updatedAt?: string
}

// 현재 프로젝트에서 사용하지 않는 레거시 타입들 제거됨
// - ExperienceTimeSlot
// - ReservationStatus
// - ReservationRequest
// - ExperienceBooking
