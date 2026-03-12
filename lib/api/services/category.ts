import { productApi } from '../client'
import type { CategoryListItem } from '../types'

export const categoryService = {
  async getCategories(parentId?: string): Promise<CategoryListItem[]> {
    const response = await productApi.get<{ data: CategoryListItem[] }>('/api/v1/categories', {
      params: {
        parentId,
      },
    })

    return Array.isArray(response?.data) ? response.data : []
  },

  async getCategoryTree(): Promise<CategoryListItem[]> {
    const result: CategoryListItem[] = []

    const visit = async (parentId?: string) => {
      let items: CategoryListItem[] = []

      try {
        items = await categoryService.getCategories(parentId)
      } catch (error) {
        const apiError = error as { status?: number }
        if (apiError.status !== 404) {
          console.error('[CategoryService] failed to load categories:', { parentId, error })
        }
        return
      }

      const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)

      for (const item of sorted) {
        result.push(item)
        await visit(item.id)
      }
    }

    await visit()
    return result
  },
}
