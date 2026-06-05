import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  employeeNavItems,
  employeeTabItems,
  isEmployeeNavRouteName,
} from '../src/app/navigation.ts'

const readSource = (relativePath: string): string => {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8')
}

test('employee nav exposes the planned primary app slices in order', () => {
  assert.deepEqual(
    employeeNavItems.map((item) => item.routeName),
    ['schedule', 'attendance', 'payroll', 'contracts', 'notifications', 'settings'],
  )
})

test('employee tab bar excludes top-bar and settings routes', () => {
  assert.deepEqual(
    employeeTabItems.map((item) => item.routeName),
    ['schedule', 'attendance', 'payroll', 'contracts'],
  )
})

test('isEmployeeNavRouteName accepts only shell tab route names', () => {
  assert.equal(isEmployeeNavRouteName('home'), false)
  assert.equal(isEmployeeNavRouteName('schedule'), true)
  assert.equal(isEmployeeNavRouteName('notifications'), true)
  assert.equal(isEmployeeNavRouteName('settings'), true)
  assert.equal(isEmployeeNavRouteName('login'), false)
  assert.equal(isEmployeeNavRouteName(undefined), false)
})

test('schedule is the canonical first shell route and tab target', () => {
  const routerSource = readSource('../src/router/index.ts')
  const shellSource = readSource('../src/component/EmployeeAppShell.vue')

  assert.match(routerSource, /path:\s*'',\s*redirect:\s*\{\s*name:\s*'schedule'\s*\}/)
  assert.match(routerSource, /path:\s*'schedule',\s*name:\s*'schedule',\s*component:\s*ScheduleView/)
  assert.doesNotMatch(routerSource, /path:\s*'schedule',\s*redirect:\s*\{\s*name:\s*'home'\s*\}/)
  assert.match(routerSource, /to\.name === 'login' && canUseEmployeeApp[\s\S]*?return \{\s*name:\s*'schedule'\s*\}/)
  assert.match(shellSource, /:to="\{\s*name:\s*'schedule'\s*\}"/)
  assert.match(shellSource, /item\.routeName === 'schedule'/)
  assert.doesNotMatch(shellSource, /item\.routeName === 'home'/)
})
