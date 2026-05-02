import { apiClient } from './client'
import type { AppNotificationListResponse, AppNotificationResponse } from './types'

export interface LoadMyNotificationsRequest {
  storeId: string
  unreadOnly?: boolean
  page?: number
  size?: number
}

export interface MarkNotificationReadRequest {
  storeId: string
  notificationId: string
}

export async function loadMyNotifications(
  request: LoadMyNotificationsRequest,
): Promise<AppNotificationListResponse> {
  const response = await apiClient.get<AppNotificationListResponse>(
    `/api/app/stores/${encodeURIComponent(request.storeId)}/notifications`,
    {
      params: {
        unreadOnly: request.unreadOnly,
        page: request.page ?? 0,
        size: request.size ?? 50,
      },
    },
  )
  return response.data
}

export async function markNotificationRead(
  request: MarkNotificationReadRequest,
): Promise<AppNotificationResponse> {
  const response = await apiClient.post<AppNotificationResponse>(
    `/api/app/stores/${encodeURIComponent(request.storeId)}/notifications/${encodeURIComponent(
      request.notificationId,
    )}/read`,
  )
  return response.data
}
