import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createDemoBootstrap, loadDemoSchedules } from '../src/demo/employeeDemoData.ts'

test('employee demo data provides a usable bootstrap without owner/admin fields', () => {
  const bootstrap = createDemoBootstrap()

  assert.equal(bootstrap.user.userType, 'EMPLOYEE')
  assert.equal('profileImageUrl' in bootstrap.user, true)
  assert.equal(bootstrap.hasStores, true)
  assert.equal(bootstrap.selectedStore?.storeId, bootstrap.stores[0].storeId)
  assert.ok(bootstrap.stores.every((store) => store.employeeStatus === 'ACTIVE'))
})

test('employee demo schedules are filtered by requested date range', () => {
  const bootstrap = createDemoBootstrap()
  const storeId = bootstrap.selectedStore?.storeId ?? ''
  const schedules = loadDemoSchedules({
    storeId,
    startDate: '1900-01-01',
    endDate: '1900-01-31',
  })

  assert.deepEqual(schedules.items, [])
  assert.equal(schedules.empty, true)
})

test('employee demo schedules keep coworker summaries for schedule cards', () => {
  const bootstrap = createDemoBootstrap()
  const storeId = bootstrap.selectedStore?.storeId ?? ''
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const todayDate = `${yyyy}-${mm}-${dd}`
  const schedules = loadDemoSchedules({
    storeId,
    startDate: todayDate,
    endDate: todayDate,
  })

  const todaysSchedule = schedules.items.find((schedule) => schedule.workDate === todayDate)

  assert.ok(todaysSchedule)
  assert.equal(todaysSchedule.coworkers?.length, 3)
  assert.equal(todaysSchedule.coworkers?.[0]?.name, '김서연')
})

test('router uses dev-only demo mode as an auth guard input', () => {
  const source = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8')

  assert.match(source, /isEmployeeDemoModeEnabled\(\) \|\| hasAccessToken\(\)/)
  assert.match(source, /to\.name === 'login' && canUseEmployeeApp/)
})

test('employee demo mode requires Vite dev mode and an explicit flag', () => {
  const source = readFileSync(
    new URL('../src/demo/employeeDemoMode.ts', import.meta.url),
    'utf8',
  )

  assert.match(source, /import\.meta\.env\?\.DEV/)
  assert.match(source, /VITE_EMPLOYEE_APP_DEMO === 'true'/)
})
