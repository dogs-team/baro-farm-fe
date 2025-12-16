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

export interface Experience {
  id: string // UUID
  farmId: string // UUID
  title: string
  description: string
  pricePerPerson: number
  capacity: number
  durationMinutes: number
  availableStartDate: string
  availableEndDate: string
  status: ExperienceStatus
  // Legacy fields for backward compatibility
  price?: number
  duration?: string
  maxParticipants?: number
  availableDates?: string[]
  category?: string
  tags?: string[]
  rating?: number
  reviewCount?: number
  createdAt?: string
  images?: string[]
  farmName?: string
  farmLocation?: string
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface ReservationRequest {
  experienceId: string // UUID
  buyerId: string // UUID
  reservedDate: string // date format: YYYY-MM-DD
  reservedTimeSlot: string
  headCount: number
  totalPrice: number
}

export interface ExperienceBooking {
  id: string // UUID (reservationId)
  experienceId: string // UUID
  experienceTitle?: string
  userId?: string // UUID
  buyerId?: string // UUID
  date?: string
  reservedDate?: string
  reservedTimeSlot?: string
  participants?: number
  headCount?: number
  totalPrice: number
  status: ReservationStatus
  createdAt?: string
}

// Legacy types for backward compatibility
export type BookingStatus = ReservationStatus

export interface CreateBookingRequest {
  experienceId: string
  date: string
  participants: number
}
