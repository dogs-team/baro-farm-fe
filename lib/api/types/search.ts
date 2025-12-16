// =====================
// Search Types
// =====================
export interface ProductSearchItem {
  productId: string // UUID
  productName: string
  price: number
  imageUrl?: string
}

export interface FarmSearchItem {
  farmId: string // UUID
  farmName: string
  address?: string
  imageUrl?: string
}

export interface ExperienceSearchItem {
  experienceId: string // UUID
  title: string
  pricePerPerson: number
  imageUrl?: string
}

export interface UnifiedSearchResponse {
  products: {
    content: ProductSearchItem[]
    totalElements: number
    totalPages: number
    page: number
    size: number
  }
  farms: {
    content: FarmSearchItem[]
    totalElements: number
    totalPages: number
    page: number
    size: number
  }
  experiences: {
    content: ExperienceSearchItem[]
    totalElements: number
    totalPages: number
    page: number
    size: number
  }
}

export interface ProductAutoItem {
  productId: string // UUID
  productName: string
}

export interface FarmAutoItem {
  farmId: string // UUID
  farmName: string
}

export interface ExperienceAutoItem {
  experienceId: string // UUID
  title: string
}

export interface UnifiedAutoCompleteResponse {
  products: ProductAutoItem[]
  farms: FarmAutoItem[]
  experiences: ExperienceAutoItem[]
}

export interface SearchParams {
  keyword: string
  type?: 'ALL' | 'PRODUCT' | 'EXPERIENCE' | 'FARM'
  page?: number
  size?: number
}

// Legacy type for backward compatibility
export interface SearchResult {
  products: Product[]
  experiences: Experience[]
  farms: Farm[]
  totalProducts: number
  totalExperiences: number
  totalFarms: number
}

// Import types for legacy compatibility
import type { Product } from './product'
import type { Experience } from './experience'
import type { Farm } from './farm'
