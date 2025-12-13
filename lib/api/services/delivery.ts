import { deliveryApi } from '../client'
import type { Delivery } from '../types'

export const deliveryService = {
  // 배송 조회 (Support Service - /api/v1/ 패턴 적용)
  async getDelivery(orderId: number): Promise<Delivery> {
    return deliveryApi.get<Delivery>(`/api/v1/deliveries/order/${orderId}`)
  },

  // 배송 추적
  async trackDelivery(trackingNumber: string): Promise<Delivery> {
    return deliveryApi.get<Delivery>(`/api/v1/deliveries/track/${trackingNumber}`)
  },
}
