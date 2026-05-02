import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildScheduleMonthCells,
  groupSchedulesByDate,
  resolveScheduleDateRange,
  scheduleStatusKey,
  scheduleStatusTone,
  shiftScheduleCursor,
  sortSchedules,
} from '../src/schedule/scheduleViewModel.ts'
import type { ScheduleResponse } from '../src/api/types.ts'

test('resolveScheduleDateRange returns current month range for month and list modes', () => {
  assert.deepEqual(resolveScheduleDateRange('month', '2026-05-15'), {
    startDate: '2026-05-01',
    endDate: '2026-05-31',
  })
  assert.deepEqual(resolveScheduleDateRange('list', '2026-02-10'), {
    startDate: '2026-02-01',
    endDate: '2026-02-28',
  })
})

test('resolveScheduleDateRange returns monday to sunday for week mode', () => {
  assert.deepEqual(resolveScheduleDateRange('week', '2026-05-02'), {
    startDate: '2026-04-27',
    endDate: '2026-05-03',
  })
})

test('shiftScheduleCursor moves by view period', () => {
  assert.equal(shiftScheduleCursor('week', '2026-05-02', 1), '2026-05-09')
  assert.equal(shiftScheduleCursor('month', '2026-05-15', -1), '2026-04-01')
  assert.equal(shiftScheduleCursor('list', '2026-05-15', 1), '2026-06-01')
})

test('sortSchedules and groupSchedulesByDate keep stable chronological order', () => {
  const schedules = [
    schedule('b', '2026-05-02', '14:00:00'),
    schedule('a', '2026-05-01', '09:00:00'),
    schedule('c', '2026-05-02', '09:00:00'),
  ]

  assert.deepEqual(sortSchedules(schedules).map((item) => item.scheduleId), ['a', 'c', 'b'])
  assert.deepEqual(
    groupSchedulesByDate(schedules).map((group) => ({
      date: group.date,
      ids: group.schedules.map((item) => item.scheduleId),
    })),
    [
      { date: '2026-05-01', ids: ['a'] },
      { date: '2026-05-02', ids: ['c', 'b'] },
    ],
  )
})

test('buildScheduleMonthCells creates a stable six-week grid with schedule counts', () => {
  const cells = buildScheduleMonthCells('2026-05-15', [
    schedule('a', '2026-05-01', '09:00:00'),
    schedule('b', '2026-05-31', '09:00:00'),
  ])

  assert.equal(cells.length, 42)
  assert.equal(cells[0].date, '2026-04-26')
  assert.equal(cells[5].date, '2026-05-01')
  assert.equal(cells[5].schedules.length, 1)
  assert.equal(cells[35].date, '2026-05-31')
  assert.equal(cells[35].schedules.length, 1)
  assert.equal(cells[0].inCurrentMonth, false)
})

test('schedule status helpers map backend statuses to i18n and tone keys', () => {
  assert.equal(scheduleStatusKey('SCHEDULED'), 'schedule.status.scheduled')
  assert.equal(scheduleStatusTone('SCHEDULED'), 'planned')
  assert.equal(scheduleStatusTone('COMPLETED'), 'success')
  assert.equal(scheduleStatusTone('CANCELLED'), 'muted')
})

function schedule(
  scheduleId: string,
  workDate: string,
  startTime: string,
): ScheduleResponse {
  return {
    scheduleId,
    storeId: 'store-1',
    employeeId: 'employee-1',
    workDate,
    startTime,
    endTime: '18:00:00',
    breakMinutes: 60,
    scheduledWorkMinutes: 480,
    status: 'SCHEDULED',
    memo: null,
    createdAt: null,
    updatedAt: null,
  }
}
