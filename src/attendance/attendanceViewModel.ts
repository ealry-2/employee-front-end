import type {
  AppAttendanceCurrentResponse,
  AppAttendanceCurrentStatus,
  AppAttendanceNextAction,
  AttendanceResponse,
  AttendanceStatus,
} from '../api/types'

export type AttendanceTone = 'planned' | 'success' | 'warning' | 'muted'

export interface ClockInViewRequest {
  storeId: string
  employeeId: string
  workDate: string
  scheduleId: string | null
}

export interface ClockOutViewRequest {
  recordId: string
}

export function attendanceCurrentStatusKey(
  status: AppAttendanceCurrentStatus,
): string {
  return `attendance.currentStatus.${toCamelCaseKey(status)}`
}

export function attendanceRecordStatusKey(status: AttendanceStatus): string {
  return `attendance.recordStatus.${status.toLowerCase()}`
}

export function attendanceRecordTone(status: AttendanceStatus): AttendanceTone {
  if (status === 'APPROVED') {
    return 'success'
  }
  if (status === 'REJECTED') {
    return 'warning'
  }
  return 'planned'
}

export function resolveAttendanceAction(
  current: AppAttendanceCurrentResponse | null,
): AppAttendanceNextAction {
  if (!current) {
    return 'NONE'
  }
  if (current.nextAction === 'CLOCK_OUT' && current.canClockOut && current.openAttendance) {
    return 'CLOCK_OUT'
  }
  if (current.nextAction === 'CLOCK_IN' && current.canClockIn) {
    return 'CLOCK_IN'
  }
  return 'NONE'
}

export function attendanceActionLabelKey(action: AppAttendanceNextAction): string {
  return `attendance.action.${toCamelCaseKey(action)}`
}

export function buildClockInRequest(
  current: AppAttendanceCurrentResponse | null,
): ClockInViewRequest | null {
  if (resolveAttendanceAction(current) !== 'CLOCK_IN' || !current) {
    return null
  }
  return {
    storeId: current.storeId,
    employeeId: current.employeeId,
    workDate: current.workDate,
    scheduleId: current.scheduledShift?.scheduleId ?? null,
  }
}

export function buildClockOutRequest(
  current: AppAttendanceCurrentResponse | null,
): ClockOutViewRequest | null {
  if (resolveAttendanceAction(current) !== 'CLOCK_OUT' || !current?.openAttendance) {
    return null
  }
  return {
    recordId: current.openAttendance.recordId,
  }
}

export function sortAttendanceRecords(
  records: AttendanceResponse[],
): AttendanceResponse[] {
  return [...records].sort((left, right) => {
    const dateCompare = right.workDate.localeCompare(left.workDate)
    if (dateCompare !== 0) {
      return dateCompare
    }
    const leftClockIn = left.clockInAt ?? ''
    const rightClockIn = right.clockInAt ?? ''
    const timeCompare = rightClockIn.localeCompare(leftClockIn)
    if (timeCompare !== 0) {
      return timeCompare
    }
    return right.recordId.localeCompare(left.recordId)
  })
}

export function toDurationParts(
  minutes: number | null,
): { hours: number; minutes: number } | null {
  if (minutes == null) {
    return null
  }
  return {
    hours: Math.floor(minutes / 60),
    minutes: minutes % 60,
  }
}

export function resolveOpenWorkSeconds(
  current: AppAttendanceCurrentResponse | null,
  serverTime: Date | null,
): number {
  const openAttendance = current?.openAttendance
  if (!openAttendance?.clockInAt || openAttendance.clockOutAt || !serverTime) {
    return 0
  }
  const startedAt = new Date(openAttendance.clockInAt).getTime()
  const serverTimeMs = serverTime.getTime()
  if (!Number.isFinite(startedAt) || !Number.isFinite(serverTimeMs) || serverTimeMs < startedAt) {
    return 0
  }
  return Math.floor((serverTimeMs - startedAt) / 1000)
}

export function resolveTodayTotalWorkMinutes(
  current: AppAttendanceCurrentResponse | null,
  serverTime: Date | null,
): number | null {
  if (!current) {
    return null
  }
  const completedMinutes = current.todayAttendances.reduce((total, record) => {
    if (!record.clockOutAt || record.totalWorkMinutes == null) {
      return total
    }
    return total + record.totalWorkMinutes
  }, 0)
  return completedMinutes + Math.floor(resolveOpenWorkSeconds(current, serverTime) / 60)
}

function toCamelCaseKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
}
