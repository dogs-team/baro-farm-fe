// =====================
// Category Types
// =====================
export interface CategoryListItem {
  id: string
  name: string
  code: string
  parentId?: string | null
  level?: number | null
  sortOrder?: number | null
}
