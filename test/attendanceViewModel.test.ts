import test from 'node:test'
import assert from 'node:assert/strict'
import {
  attendanceActionLabelKey,
  attendanceCurrentStatusKey,
  attendanceCurrentTone,
  attendanceRecordStatusKey,
  attendanceRecordTone,
  buildClockInRequest,
  buildClockOutRequest,
  isValidBreakMinutesInput,
  parseBreakMinutesInput,
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
  assert.equal(attendanceCurrentTone('CLOCKED_IN'), 'success')
  assert.equal(attendanceCurrentTone('NO_SCHEDULE'), 'warning')
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

test('buildClockOutRequest requires open attendance and valid optional break minutes', () => {
  const openState = current({
    nextAction: 'CLOCK_OUT',
    canClockOut: true,
    openAttendance: attendance('open', '2026-05-02T09:00:00'),
  })

  assert.deepEqual(buildClockOutRequest(openState, ''), {
    recordId: 'open',
    breakMinutes: null,
  })
  assert.deepEqual(buildClockOutRequest(openState, '30'), {
    recordId: 'open',
    breakMinutes: 30,
  })
  assert.equal(buildClockOutRequest(openState, '-1'), null)
  assert.equal(buildClockOutRequest(current({ nextAction: 'CLOCK_OUT', canClockOut: true }), '10'), null)
})

test('break minute parsing keeps blank optional and rejects unsafe values', () => {
  assert.equal(isValidBreakMinutesInput(''), true)
  assert.equal(isValidBreakMinutesInput('0'), true)
  assert.equal(isValidBreakMinutesInput('15'), true)
  assert.equal(isValidBreakMinutesInput('1.5'), false)
  assert.equal(isValidBreakMinutesInput('-1'), false)
  assert.equal(parseBreakMinutesInput(''), null)
  assert.equal(parseBreakMinutesInput('45'), 45)
  assert.equal(parseBreakMinutesInput('bad'), null)
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
