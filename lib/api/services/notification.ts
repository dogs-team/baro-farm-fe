import { notificationApi } from '../client'
import type { Notification, PaginatedResponse, PaginationParams } from '../types'

type NotificationPageResponse =
  | PaginatedResponse<Notification>
  | { data: PaginatedResponse<Notification> }

type UnreadCountResponse = { count: number } | { data: { count: number } }

export const notificationService = {
  async getNotifications(params?: PaginationParams): Promise<PaginatedResponse<Notification>> {
    const response = await notificationApi.get<NotificationPageResponse>('/api/v1/notifications', {
      params: params as Record<string, string | number | boolean | undefined>,
    })
    return 'data' in response && response.data
      ? response.data
      : (response as PaginatedResponse<Notification>)
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await notificationApi.get<UnreadCountResponse>(
      '/api/v1/notifications/unread-count'
    )
    return 'data' in response && response.data ? response.data : (response as { count: number })
  },

  async markAsRead(id: number): Promise<void> {
    await notificationApi.patch<void>(`/api/v1/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await notificationApi.post<void>('/api/v1/notifications/read-all')
  },

  async deleteNotification(id: number): Promise<void> {
    await notificationApi.delete<void>(`/api/v1/notifications/${id}`)
  },
}
