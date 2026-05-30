import { apiClient } from './client'
import { albaAttendancePath, albaStorePath, appStorePath } from './paths'
import type {
  AppAttendanceCurrentResponse,
  AttendanceQrClockInResponse,
  AttendanceResponse,
} from './types'
import {
  clockInDemoEmployee,
  clockInQrDemoEmployee,
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
}

export interface ClockInByQrRequest {
  storeId: string
  qrToken: string
  latitude: number
  longitude: number
  accuracyMeters?: number | null
}

export async function loadAttendanceCurrent(
  storeId: string,
): Promise<AppAttendanceCurrentResponse> {
  if (isEmployeeDemoModeEnabled()) {
    return loadDemoAttendanceCurrent(storeId)
  }

  const response = await apiClient.get<AppAttendanceCurrentResponse>(
    appStorePath(storeId, 'attendance', 'current'),
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
    albaStorePath(request.storeId, 'attendance', 'clock-in'),
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
    albaAttendancePath(request.recordId, 'clock-out'),
    {},
  )
  return response.data
}

export async function clockInEmployeeByQr(
  request: ClockInByQrRequest,
): Promise<AttendanceQrClockInResponse> {
  if (isEmployeeDemoModeEnabled()) {
    return clockInQrDemoEmployee(request)
  }

  const response = await apiClient.post<AttendanceQrClockInResponse>(
    appStorePath(request.storeId, 'attendance', 'qr-clock-in'),
    {
      qrToken: request.qrToken,
      latitude: request.latitude,
      longitude: request.longitude,
      accuracyMeters: request.accuracyMeters ?? null,
    },
  )
  return response.data
}
