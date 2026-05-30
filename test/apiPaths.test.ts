import test from 'node:test'
import assert from 'node:assert/strict'
import {
  albaAttendancePath,
  albaStorePath,
  appStorePath,
} from '../src/api/paths.ts'

test('employee app api path helpers preserve encoded store-scoped routes', () => {
  assert.equal(
    appStorePath('store/one', 'contracts', 'contract 1', 'signing-session'),
    '/api/app/stores/store%2Fone/contracts/contract%201/signing-session',
  )
  assert.equal(
    appStorePath('store#2', 'attendance', 'qr-clock-in'),
    '/api/app/stores/store%232/attendance/qr-clock-in',
  )
})

test('employee legacy alba path helpers preserve employee-safe route boundaries', () => {
  assert.equal(
    albaStorePath('store/one', 'attendance', 'clock-in'),
    '/api/alba/stores/store%2Fone/attendance/clock-in',
  )
  assert.equal(
    albaAttendancePath('record/42', 'clock-out'),
    '/api/alba/attendance/record%2F42/clock-out',
  )
})
