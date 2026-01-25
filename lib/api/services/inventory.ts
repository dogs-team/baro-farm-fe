import { buyerApi } from '../client'
import type { InventoryInfo } from '../types'

export const inventoryService = {
  async getInventoriesByProductId(productId: string): Promise<InventoryInfo[]> {
    const response = await buyerApi.get<{ data: InventoryInfo[] }>('/api/v1/inventories', {
      params: { productId },
    })
    return response.data
  },
}
