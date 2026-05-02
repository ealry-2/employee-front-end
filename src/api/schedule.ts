import { apiClient } from './client'
import type { AppScheduleListResponse, ScheduleResponse } from './types'

export interface LoadEmployeeSchedulesRequest {
  storeId: string
  startDate: string
  endDate: string
  page?: number
  size?: number
}

export async function loadEmployeeSchedules(
  request: LoadEmployeeSchedulesRequest,
): Promise<AppScheduleListResponse> {
  const response = await apiClient.get<AppScheduleListResponse>(
    `/api/app/stores/${encodeURIComponent(request.storeId)}/schedules`,
    {
      params: {
        startDate: request.startDate,
        endDate: request.endDate,
        page: request.page ?? 0,
        size: request.size ?? 200,
      },
    },
  )
  return response.data
}

export async function loadEmployeeScheduleDetail(
  storeId: string,
  scheduleId: string,
): Promise<ScheduleResponse> {
  const response = await apiClient.get<ScheduleResponse>(
    `/api/app/stores/${encodeURIComponent(storeId)}/schedules/${encodeURIComponent(scheduleId)}`,
  )
  return response.data
}
