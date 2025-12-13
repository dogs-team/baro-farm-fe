import { notificationApi } from '../client'
import type { Notification, PaginatedResponse, PaginationParams } from '../types'

export const notificationService = {
  // 알림 목록 조회 (Support Service - /api/v1/ 패턴 적용)
  async getNotifications(params?: PaginationParams): Promise<PaginatedResponse<Notification>> {
    return notificationApi.get<PaginatedResponse<Notification>>('/api/v1/notifications', { params })
  },

  // 읽지 않은 알림 개수
  async getUnreadCount(): Promise<{ count: number }> {
    return notificationApi.get<{ count: number }>('/api/v1/notifications/unread-count')
  },

  // 알림 읽음 처리
  async markAsRead(id: number): Promise<void> {
    return notificationApi.patch(`/api/v1/notifications/${id}/read`)
  },

  // 모든 알림 읽음 처리
  async markAllAsRead(): Promise<void> {
    return notificationApi.patch('/api/v1/notifications/read-all')
  },

  // 알림 삭제
  async deleteNotification(id: number): Promise<void> {
    return notificationApi.delete(`/api/v1/notifications/${id}`)
  },
}
