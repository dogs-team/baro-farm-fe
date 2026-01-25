// =====================
// Category Types
// =====================
export interface CategoryListItem {
  id: string // UUID
  name: string
  code: string
  parentId: string | null // UUID
  level: number // Integer (1차, 2차, 3차 등)
  sortOrder: number // Integer
}
