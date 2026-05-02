import test from 'node:test'
import assert from 'node:assert/strict'
import {
  employeeNavItems,
  employeeTabItems,
  isEmployeeNavRouteName,
} from '../src/app/navigation.ts'

test('employee nav exposes the planned primary app slices in order', () => {
  assert.deepEqual(
    employeeNavItems.map((item) => item.routeName),
    ['home', 'attendance', 'payroll', 'contracts', 'notifications', 'settings'],
  )
})

test('employee tab bar excludes top-bar and settings routes', () => {
  assert.deepEqual(
    employeeTabItems.map((item) => item.routeName),
    ['home', 'attendance', 'payroll', 'contracts'],
  )
})

test('isEmployeeNavRouteName accepts only shell tab route names', () => {
  assert.equal(isEmployeeNavRouteName('home'), true)
  assert.equal(isEmployeeNavRouteName('schedule'), false)
  assert.equal(isEmployeeNavRouteName('notifications'), true)
  assert.equal(isEmployeeNavRouteName('settings'), true)
  assert.equal(isEmployeeNavRouteName('login'), false)
  assert.equal(isEmployeeNavRouteName(undefined), false)
})
