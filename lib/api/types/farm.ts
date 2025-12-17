// =====================
// Farm Types
// =====================
export interface FarmCreateRequestDto {
  name: string
  description: string
  address: string
  phone: string
}

export interface FarmUpdateRequestDto {
  name?: string
  description?: string
  address?: string
  phone?: string
}

export interface Farm {
  id: string // UUID (may be number in some cases)
  name: string
  description: string
  address: string
  phone?: string
  images?: string[]
  ownerId?: number | string
  ownerName?: string
  rating?: number
  reviewCount?: number
  productCount?: number
  experienceCount?: number
  certifications?: string[]
  createdAt?: string
}
