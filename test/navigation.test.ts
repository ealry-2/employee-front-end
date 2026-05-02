import test from 'node:test'
import assert from 'node:assert/strict'
import { employeeNavItems, isEmployeeNavRouteName } from '../src/app/navigation.ts'

test('employee nav exposes the planned primary app slices in order', () => {
  assert.deepEqual(
    employeeNavItems.map((item) => item.routeName),
    ['home', 'schedule', 'attendance', 'payroll', 'contracts', 'notifications'],
  )
})

test('isEmployeeNavRouteName accepts only shell tab route names', () => {
  assert.equal(isEmployeeNavRouteName('home'), true)
  assert.equal(isEmployeeNavRouteName('schedule'), true)
  assert.equal(isEmployeeNavRouteName('notifications'), true)
  assert.equal(isEmployeeNavRouteName('login'), false)
  assert.equal(isEmployeeNavRouteName(undefined), false)
})
