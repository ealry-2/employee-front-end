import type { ScheduleResponse, ScheduleStatus } from '../api/types'

export type ScheduleViewMode = 'month' | 'week' | 'list'

export interface ScheduleDateRange {
  startDate: string
  endDate: string
}

export interface ScheduleGroup {
  date: string
  schedules: ScheduleResponse[]
}

export interface ScheduleMonthCell {
  date: string
  inCurrentMonth: boolean
  schedules: ScheduleResponse[]
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function resolveScheduleDateRange(
  mode: ScheduleViewMode,
  cursorDate: string,
): ScheduleDateRange {
  const cursor = parseDateOnly(cursorDate)
  if (mode === 'week') {
    const start = startOfWeek(cursor)
    return {
      startDate: formatDateOnly(start),
      endDate: formatDateOnly(addDays(start, 6)),
    }
  }

  const start = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1))
  const end = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0))
  return {
    startDate: formatDateOnly(start),
    endDate: formatDateOnly(end),
  }
}

export function shiftScheduleCursor(
  mode: ScheduleViewMode,
  cursorDate: string,
  direction: -1 | 1,
): string {
  const cursor = parseDateOnly(cursorDate)
  if (mode === 'week') {
    return formatDateOnly(addDays(cursor, direction * 7))
  }
  return formatDateOnly(
    new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + direction, 1)),
  )
}

export function sortSchedules(schedules: ScheduleResponse[]): ScheduleResponse[] {
  return [...schedules].sort((left, right) => {
    const dateCompare = left.workDate.localeCompare(right.workDate)
    if (dateCompare !== 0) {
      return dateCompare
    }
    const timeCompare = left.startTime.localeCompare(right.startTime)
    if (timeCompare !== 0) {
      return timeCompare
    }
    return left.scheduleId.localeCompare(right.scheduleId)
  })
}

export function groupSchedulesByDate(schedules: ScheduleResponse[]): ScheduleGroup[] {
  const groups = new Map<string, ScheduleResponse[]>()
  for (const schedule of sortSchedules(schedules)) {
    const group = groups.get(schedule.workDate) ?? []
    group.push(schedule)
    groups.set(schedule.workDate, group)
  }
  return Array.from(groups.entries()).map(([date, groupedSchedules]) => ({
    date,
    schedules: groupedSchedules,
  }))
}

export function buildScheduleMonthCells(
  cursorDate: string,
  schedules: ScheduleResponse[],
): ScheduleMonthCell[] {
  const cursor = parseDateOnly(cursorDate)
  const firstOfMonth = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1))
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getUTCDay())
  const byDate = new Map(groupSchedulesByDate(schedules).map((group) => [group.date, group.schedules]))

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index)
    const dateText = formatDateOnly(date)
    return {
      date: dateText,
      inCurrentMonth: date.getUTCMonth() === cursor.getUTCMonth(),
      schedules: byDate.get(dateText) ?? [],
    }
  })
}

export function scheduleStatusKey(status: ScheduleStatus): string {
  return `schedule.status.${status.toLowerCase()}`
}

export function scheduleStatusTone(status: ScheduleStatus): 'planned' | 'success' | 'muted' {
  if (status === 'COMPLETED') {
    return 'success'
  }
  if (status === 'CANCELLED') {
    return 'muted'
  }
  return 'planned'
}

export function todayDateText(): string {
  return formatDateOnly(new Date())
}

function parseDateOnly(value: string): Date {
  if (!DATE_PATTERN.test(value)) {
    throw new Error(`Invalid date: ${value}`)
  }
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function formatDateOnly(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function startOfWeek(date: Date): Date {
  const day = date.getUTCDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  return addDays(date, mondayOffset)
}
