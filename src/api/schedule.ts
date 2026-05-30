import { apiClient } from './client'
import { appStorePath } from './paths'
import type { AppScheduleListResponse, ScheduleResponse } from './types'
import {
  loadDemoScheduleDetail,
  loadDemoSchedules,
} from '../demo/employeeDemoData'
import { isEmployeeDemoModeEnabled } from '../demo/employeeDemoMode'

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
  if (isEmployeeDemoModeEnabled()) {
    return loadDemoSchedules(request)
  }

  const response = await apiClient.get<AppScheduleListResponse>(
    appStorePath(request.storeId, 'schedules'),
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
  if (isEmployeeDemoModeEnabled()) {
    return loadDemoScheduleDetail(storeId, scheduleId)
  }

  const response = await apiClient.get<ScheduleResponse>(
    appStorePath(storeId, 'schedules', scheduleId),
  )
  return response.data
}
