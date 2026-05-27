import test from 'node:test'
import assert from 'node:assert/strict'
import {
  attendanceActionLabelKey,
  attendanceCurrentStatusKey,
  attendanceRecordStatusKey,
  attendanceRecordTone,
  buildClockInRequest,
  buildClockOutRequest,
  resolveOpenWorkSeconds,
  resolveTodayTotalWorkMinutes,
  resolveAttendanceAction,
  sortAttendanceRecords,
  toDurationParts,
} from '../src/attendance/attendanceViewModel.ts'
import type {
  AppAttendanceCurrentResponse,
  AppAttendanceCurrentStatus,
  AttendanceResponse,
  AttendanceStatus,
} from '../src/api/types.ts'

test('attendance status helpers map backend values to i18n keys and tones', () => {
  assert.equal(
    attendanceCurrentStatusKey('READY_TO_CLOCK_IN'),
    'attendance.currentStatus.readyToClockIn',
  )
  assert.equal(attendanceCurrentStatusKey('CLOCKED_IN'), 'attendance.currentStatus.clockedIn')
  assert.equal(attendanceActionLabelKey('CLOCK_OUT'), 'attendance.action.clockOut')
  assert.equal(attendanceRecordStatusKey('PENDING'), 'attendance.recordStatus.pending')
  assert.equal(attendanceRecordTone('APPROVED'), 'success')
  assert.equal(attendanceRecordTone('REJECTED'), 'warning')
})

test('resolveAttendanceAction fails closed when state is missing or inconsistent', () => {
  assert.equal(resolveAttendanceAction(null), 'NONE')
  assert.equal(resolveAttendanceAction(current({ nextAction: 'CLOCK_IN', canClockIn: true })), 'CLOCK_IN')
  assert.equal(resolveAttendanceAction(current({ nextAction: 'CLOCK_IN', canClockIn: false })), 'NONE')
  assert.equal(
    resolveAttendanceAction(
      current({
        nextAction: 'CLOCK_OUT',
        canClockOut: true,
        openAttendance: attendance('open', '2026-05-02T09:00:00'),
      }),
    ),
    'CLOCK_OUT',
  )
  assert.equal(resolveAttendanceAction(current({ nextAction: 'CLOCK_OUT', canClockOut: true })), 'NONE')
})

test('buildClockInRequest uses current-state employee, work date, and schedule id', () => {
  const request = buildClockInRequest(
    current({
      nextAction: 'CLOCK_IN',
      canClockIn: true,
      scheduledShift: {
        scheduleId: 'schedule-1',
        storeId: 'store-1',
        employeeId: 'employee-1',
        workDate: '2026-05-02',
        startTime: '09:00:00',
        endTime: '18:00:00',
        breakMinutes: 60,
        scheduledWorkMinutes: 480,
        status: 'SCHEDULED',
        memo: null,
        createdAt: null,
        updatedAt: null,
      },
    }),
  )

  assert.deepEqual(request, {
    storeId: 'store-1',
    employeeId: 'employee-1',
    workDate: '2026-05-02',
    scheduleId: 'schedule-1',
  })
})

test('buildClockOutRequest requires open attendance', () => {
  const openState = current({
    nextAction: 'CLOCK_OUT',
    canClockOut: true,
    openAttendance: attendance('open', '2026-05-02T09:00:00'),
  })

  assert.deepEqual(buildClockOutRequest(openState), {
    recordId: 'open',
  })
  assert.equal(buildClockOutRequest(current({ nextAction: 'CLOCK_OUT', canClockOut: true })), null)
})

test('sortAttendanceRecords keeps latest records first with stable record fallback', () => {
  const records = [
    attendance('a', '2026-05-02T09:00:00'),
    attendance('c', '2026-05-01T18:00:00', '2026-05-01'),
    attendance('b', '2026-05-02T12:00:00'),
  ]

  assert.deepEqual(sortAttendanceRecords(records).map((record) => record.recordId), ['b', 'a', 'c'])
})

test('toDurationParts converts minutes into hour and minute parts', () => {
  assert.deepEqual(toDurationParts(495), { hours: 8, minutes: 15 })
  assert.deepEqual(toDurationParts(35), { hours: 0, minutes: 35 })
  assert.equal(toDurationParts(null), null)
})

test('resolveOpenWorkSeconds only runs while an attendance record is open', () => {
  const serverTime = new Date('2026-05-02T09:00:07')
  assert.equal(
    resolveOpenWorkSeconds(
      current({
        status: 'CLOCKED_IN',
        openAttendance: attendance('open', '2026-05-02T09:00:00'),
      }),
      serverTime,
    ),
    7,
  )
  assert.equal(
    resolveOpenWorkSeconds(
      current({
        status: 'CLOCKED_OUT',
        latestAttendance: completedAttendance('done', 10),
      }),
      serverTime,
    ),
    0,
  )
})

test('resolveTodayTotalWorkMinutes adds completed records and the current open segment', () => {
  const completed = completedAttendance('done', 45)
  const open = attendance('open', '2026-05-02T09:45:00')
  assert.equal(
    resolveTodayTotalWorkMinutes(
      current({
        openAttendance: open,
        todayAttendances: [completed, open],
      }),
      new Date('2026-05-02T10:00:30'),
    ),
    60,
  )
  assert.equal(
    resolveTodayTotalWorkMinutes(
      current({
        status: 'CLOCKED_OUT',
        todayAttendances: [completed],
      }),
      new Date('2026-05-02T10:00:30'),
    ),
    45,
  )
})

function current(
  overrides: Partial<AppAttendanceCurrentResponse> = {},
): AppAttendanceCurrentResponse {
  const status: AppAttendanceCurrentStatus = overrides.status ?? 'READY_TO_CLOCK_IN'
  return {
    storeId: 'store-1',
    employeeId: 'employee-1',
    workDate: '2026-05-02',
    serverTime: '2026-05-02T08:55:00',
    status,
    nextAction: 'NONE',
    canClockIn: false,
    canClockOut: false,
    scheduledShift: null,
    openAttendance: null,
    latestAttendance: null,
    todayAttendances: [],
    ...overrides,
  }
}

function attendance(
  recordId: string,
  clockInAt: string,
  workDate = '2026-05-02',
  status: AttendanceStatus = 'PENDING',
): AttendanceResponse {
  return {
    recordId,
    scheduleId: null,
    employeeId: 'employee-1',
    storeId: 'store-1',
    workDate,
    clockInAt,
    clockOutAt: null,
    totalWorkMinutes: null,
    breakMinutes: null,
    overtimeMinutes: null,
    nightWorkMinutes: null,
    source: 'MANUAL',
    status,
    approvedBy: null,
    approvedAt: null,
    memo: null,
    createdAt: null,
    updatedAt: null,
  }
}

function completedAttendance(recordId: string, totalWorkMinutes: number): AttendanceResponse {
  return {
    ...attendance(recordId, '2026-05-02T08:00:00'),
    clockOutAt: '2026-05-02T08:45:00',
    totalWorkMinutes,
  }
}
