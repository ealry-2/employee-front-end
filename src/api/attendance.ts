import { apiClient } from './client'
import type { AppAttendanceCurrentResponse, AttendanceResponse } from './types'
import {
  clockInDemoEmployee,
  clockOutDemoEmployee,
  loadDemoAttendanceCurrent,
} from '../demo/employeeDemoData'
import { isEmployeeDemoModeEnabled } from '../demo/employeeDemoMode'

export interface ClockInEmployeeRequest {
  storeId: string
  employeeId: string
  workDate: string
  scheduleId?: string | null
}

export interface ClockOutEmployeeRequest {
  recordId: string
  breakMinutes?: number | null
}

export async function loadAttendanceCurrent(
  storeId: string,
): Promise<AppAttendanceCurrentResponse> {
  if (isEmployeeDemoModeEnabled()) {
    return loadDemoAttendanceCurrent(storeId)
  }

  const response = await apiClient.get<AppAttendanceCurrentResponse>(
    `/api/app/stores/${encodeURIComponent(storeId)}/attendance/current`,
  )
  return response.data
}

export async function clockInEmployee(
  request: ClockInEmployeeRequest,
): Promise<AttendanceResponse> {
  if (isEmployeeDemoModeEnabled()) {
    return clockInDemoEmployee(request)
  }

  const response = await apiClient.post<AttendanceResponse>(
    `/api/alba/stores/${encodeURIComponent(request.storeId)}/attendance/clock-in`,
    {
      employeeId: request.employeeId,
      workDate: request.workDate,
      scheduleId: request.scheduleId ?? null,
    },
  )
  return response.data
}

export async function clockOutEmployee(
  request: ClockOutEmployeeRequest,
): Promise<AttendanceResponse> {
  if (isEmployeeDemoModeEnabled()) {
    return clockOutDemoEmployee(request)
  }

  const response = await apiClient.post<AttendanceResponse>(
    `/api/alba/attendance/${encodeURIComponent(request.recordId)}/clock-out`,
    {
      breakMinutes: request.breakMinutes ?? null,
    },
  )
  return response.data
}
