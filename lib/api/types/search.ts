// =====================
// Search Types
// =====================

// 공통 응답 형식
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

// 페이지네이션 타입
export interface CustomPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

// 상품 검색 응답
export interface ProductSearchResponse {
  productId: string // UUID
  productName: string
  productCategoryName: string
  price: number // Long
}

// 체험 검색 응답
export interface ExperienceSearchResponse {
  experienceId: string // UUID
  experienceName: string
  pricePerPerson: number // Long
  capacity: number // Integer
  durationMinutes: number // Integer
}

// 통합 검색 응답
export interface UnifiedSearchResponse {
  products: CustomPage<ProductSearchResponse>
  experiences: CustomPage<ExperienceSearchResponse>
}

// 통합 자동완성 응답
export interface UnifiedAutoCompleteResponse {
  products: Array<{
    productId: string
    productName: string
  }>
  experiences: Array<{
    experienceId: string
    experienceName: string
  }>
}

// 상품 자동완성 아이템
export interface ProductAutoItem {
  productId: string // UUID
  productName: string
}

// 체험 자동완성 아이템
export interface ExperienceAutoItem {
  experienceId: string // UUID
  experienceName: string
}

// 통합 검색 파라미터
export interface UnifiedSearchParams {
  q: string // 검색어
  page?: number // 기본값: 0
  size?: number // 기본값: 10
}

// 통합 자동완성 파라미터
export interface UnifiedAutocompleteParams {
  q: string // 자동완성 키워드
  pSize?: number // 상품 자동완성 개수, 기본값: 5
  eSize?: number // 체험 자동완성 개수, 기본값: 5
}

// 상품 검색 파라미터 (필터링 지원)
export interface ProductSearchParams {
  keyword?: string
  categories?: string[] // 카테고리 필터 (배열, 여러 개 가능)
  priceMin?: number
  priceMax?: number
  page?: number // 기본값: 0
  size?: number // 기본값: 20
}

// 상품 자동완성 파라미터
export interface ProductAutocompleteParams {
  query: string
  size?: number // 기본값: 5
}

// 체험 검색 파라미터
export interface ExperienceSearchParams {
  keyword?: string
  page?: number // 기본값: 0
  size?: number // 기본값: 20
}

// 체험 자동완성 파라미터
export interface ExperienceAutocompleteParams {
  query: string
  size?: number // 기본값: 5
}

// =====================
// Legacy Types (하위 호환성)
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

export interface SearchParams {
  keyword: string
  type?: 'ALL' | 'PRODUCT' | 'EXPERIENCE' | 'FARM'
  page?: number
  size?: number
}

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
