// Notification Types
export interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  isRead: boolean
  createdAt: string
}

export type NotificationType =
  | 'ORDER_STATUS'
  | 'DELIVERY_STATUS'
  | 'PAYMENT'
  | 'PROMOTION'
  | 'REVIEW'
  | 'SYSTEM'
