import { deliveryApi } from '../client'
import type { DeliveryDetailInfo, ShipDeliveryRequest } from '../types'

export const deliveryService = {
  // 배송 조회 (주문별)
  async getDeliveryByOrder(orderId: string): Promise<DeliveryDetailInfo> {
    return deliveryApi.get<DeliveryDetailInfo>(`/api/v1/deliveries/orders/${orderId}`)
  },

  // 배송 출고 처리
  async shipDelivery(deliveryId: string, data: ShipDeliveryRequest): Promise<DeliveryDetailInfo> {
    return deliveryApi.patch<DeliveryDetailInfo>(`/api/v1/deliveries/${deliveryId}/ship`, data)
  },
}
