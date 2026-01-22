import { productApi } from '../client'
import type { CategoryListItem } from '../types/category'

const extractCategoryList = (response: unknown): CategoryListItem[] => {
  if (Array.isArray(response)) return response as CategoryListItem[]
  if (!response || typeof response !== 'object') return []

  const record = response as Record<string, unknown>
  const data = record.data
  if (Array.isArray(data)) return data as CategoryListItem[]

  if (data && typeof data === 'object') {
    const dataRecord = data as Record<string, unknown>
    if (Array.isArray(dataRecord.content)) return dataRecord.content as CategoryListItem[]
    if (Array.isArray(dataRecord.data)) return dataRecord.data as CategoryListItem[]
  }

  if (Array.isArray(record.content)) return record.content as CategoryListItem[]
  return []
}

export const categoryService = {
  async getCategories(parentId?: string): Promise<CategoryListItem[]> {
    const response = await productApi.get<unknown>('/api/v1/categories', {
      params: parentId ? { parentId } : undefined,
    })

    const categories = extractCategoryList(response)
    return categories.map((category) => {
      const record = category as Record<string, unknown>
      const normalizedName =
        category.name ||
        (typeof record.categoryName === 'string' ? record.categoryName : '') ||
        (typeof record.title === 'string' ? record.title : '') ||
        (typeof record.label === 'string' ? record.label : '') ||
        (typeof record.displayName === 'string' ? record.displayName : '') ||
        (typeof record.value === 'string' ? record.value : '') ||
        category.code ||
        category.id

      return {
        ...category,
        name: normalizedName,
      }
    })
  },
}
