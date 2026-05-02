import { apiClient } from './client'
import type { AppAttendanceCurrentResponse, AttendanceResponse } from './types'

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
  const response = await apiClient.get<AppAttendanceCurrentResponse>(
    `/api/app/stores/${encodeURIComponent(storeId)}/attendance/current`,
  )
  return response.data
}

export async function clockInEmployee(
  request: ClockInEmployeeRequest,
): Promise<AttendanceResponse> {
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
  const response = await apiClient.post<AttendanceResponse>(
    `/api/alba/attendance/${encodeURIComponent(request.recordId)}/clock-out`,
    {
      breakMinutes: request.breakMinutes ?? null,
    },
  )
  return response.data
}
