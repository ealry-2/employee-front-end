import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const readSource = (relativePath: string): string => {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8')
}

test('employee app global styles follow the Editorial Workspace theme baseline', () => {
  const appStyle = readSource('../src/styles/app.scss')

  assert.ok(appStyle.includes('--employee-color-primary: #0955ab;'))
  assert.ok(appStyle.includes('--employee-color-link: #0b6bcb;'))
  assert.ok(appStyle.includes('--employee-color-brand-navy: #0d1326;'))
  assert.ok(appStyle.includes('--employee-color-on-primary: #ffffff;'))
  assert.ok(appStyle.includes('border-radius: 0.8rem;'))
  assert.ok(appStyle.includes('border-radius: 1.2rem;'))
  assert.ok(appStyle.includes('color: var(--employee-color-on-primary);'))
  assert.ok(appStyle.includes('background: var(--employee-color-success-soft);'))
  assert.ok(appStyle.includes('color: var(--employee-color-warning-text);'))
  assert.ok(appStyle.includes('color: var(--employee-color-error-text);'))
  assert.ok(appStyle.includes('--employee-color-primary-border: rgba(9, 85, 171, 0.34);'))
  assert.ok(appStyle.includes('.employee-schedule-day.has-schedules'))
  assert.ok(appStyle.includes('background: var(--employee-color-tint-sky);'))
  assert.ok(appStyle.includes('.employee-attendance-card'))
  assert.ok(appStyle.includes('background: var(--employee-color-tint-mint);'))
  assert.ok(appStyle.includes('.employee-payroll-summary'))
  assert.ok(appStyle.includes('background: var(--employee-color-tint-yellow);'))
  assert.ok(appStyle.includes('.employee-contract-card.is-selected'))
  assert.ok(appStyle.includes('background: var(--employee-color-tint-lavender);'))
  assert.ok(appStyle.includes('.employee-contract-document'))
  assert.ok(appStyle.includes('box-shadow: var(--employee-shadow-artifact);'))
  assert.ok(appStyle.includes('.employee-notifications__toolbar'))
  assert.ok(appStyle.includes('border-radius: 1.2rem;'))
  assert.equal(appStyle.includes('#6c3df4'), false)
  assert.equal(appStyle.includes('#5a2dd6'), false)
  assert.equal(appStyle.includes('#f1ecff'), false)
  assert.equal(appStyle.includes('rgba(108, 61, 244'), false)
  assert.equal(appStyle.includes('#0066cc'), false)
  assert.equal(appStyle.includes('#0071e3'), false)
  assert.equal(appStyle.includes('#2997ff'), false)
  assert.equal(appStyle.includes('translateX(0.6rem)'), false)
})

test('employee schedule month calendar follows the open admin calendar layout', () => {
  const appStyle = readSource('../src/styles/app.scss')
  const scheduleSource = readSource('../src/views/ScheduleView.vue')

  assert.ok(scheduleSource.includes('v-if="mode !== \'month\'" class="employee-schedule-range"'))
  assert.ok(scheduleSource.includes('class="employee-schedule-month__header"'))
  assert.ok(scheduleSource.includes('class="employee-schedule-day__indicators"'))
  assert.ok(scheduleSource.includes("'is-selected': cell.date === selectedMonthDate"))
  assert.ok(scheduleSource.includes('class="employee-schedule-month-agenda"'))
  assert.ok(scheduleSource.includes('selectedMonthSchedules'))
  assert.ok(scheduleSource.includes('@click="selectMonthDate(cell)"'))
  assert.ok(scheduleSource.includes('<section class="employee-schedule" :aria-label="t(\'screen.schedule.title\')"'))
  assert.equal(scheduleSource.includes('class="employee-schedule__header"'), false)
  assert.equal(scheduleSource.includes('class="employee-secondary-button employee-schedule__today"'), false)
  assert.equal(scheduleSource.includes('employee-schedule-day__count'), false)
  assert.equal(appStyle.includes('.employee-schedule__today'), false)
  assert.match(
    appStyle,
    /\.employee-schedule-day\s*\{[\s\S]*?border:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-day__dot\s*\{[\s\S]*?border-radius:\s*9999px;[\s\S]*?background:\s*#54b2e9;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-month\s*\{[\s\S]*?border-radius:\s*2\.4rem;[\s\S]*?padding:\s*1\.8rem 1\.2rem 2rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-month__header\s*\{[\s\S]*?align-items:\s*center;[\s\S]*?margin-bottom:\s*1\.8rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-month__header h3\s*\{[\s\S]*?grid-column:\s*1 \/ -1;[\s\S]*?text-align:\s*center;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-month__nav\s*\{[\s\S]*?grid-column:\s*1 \/ -1;[\s\S]*?justify-content:\s*space-between;[\s\S]*?pointer-events:\s*none;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-month__nav-button\s*\{[\s\S]*?width:\s*4\.4rem;[\s\S]*?border:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?pointer-events:\s*auto;[\s\S]*?\}/,
  )
  assert.doesNotMatch(
    appStyle,
    /\.employee-schedule-month__nav\s*\{[\s\S]*?padding-top:\s*4\.2rem;/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-day\s*\{[\s\S]*?min-height:\s*4\.4rem;[\s\S]*?padding:\s*0\.25rem 0\.2rem 0\.4rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-month__grid\s*\{[\s\S]*?grid-auto-rows:\s*4\.4rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-day__indicators\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?bottom:\s*0\.48rem;[\s\S]*?transform:\s*translateX\(-50%\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-month-agenda\s*\{[\s\S]*?margin-top:\s*1\.2rem;[\s\S]*?border-radius:\s*1\.2rem;[\s\S]*?\}/,
  )
})

test('employee shell uses top store picker, notification bell, and plain bottom tab bar', () => {
  const appStyle = readSource('../src/styles/app.scss')
  const shellSource = readSource('../src/component/EmployeeAppShell.vue')
  const navSource = readSource('../src/app/navigation.ts')

  assert.ok(shellSource.includes('class="employee-branch-picker__select"'))
  assert.ok(shellSource.includes('class="employee-topbar__brand-link"'))
  assert.ok(shellSource.includes('class="employee-topbar__brand-logo"'))
  assert.ok(shellSource.includes('class="employee-branch-picker__chevron-icon"'))
  assert.equal(shellSource.includes('class="employee-topbar__brand"'), false)
  assert.ok(shellSource.includes(':to="{ name: \'notifications\' }"'))
  assert.ok(shellSource.includes('class="employee-topbar__svg-icon employee-bell-icon"'))
  assert.ok(shellSource.includes('class="employee-topbar__svg-icon employee-menu-icon"'))
  assert.ok(shellSource.includes('viewBox="0 0 32 32"'))
  assert.ok(shellSource.includes('v-for="item in employeeTabItems"'))
  assert.ok(shellSource.includes("{ 'is-active': route.name === item.routeName }"))
  assert.ok(shellSource.includes('<svg'))
  assert.ok(shellSource.includes('viewBox="0 0 28 28"'))
  assert.ok(shellSource.includes('employee-tabbar__icon-stroke'))
  assert.ok(shellSource.includes('employee-tabbar__icon-fill'))
  assert.equal(shellSource.includes('class="employee-store-strip"'), false)
  assert.ok(navSource.includes("item.routeName !== 'notifications'"))
  assert.match(
    appStyle,
    /\.employee-topbar\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?backdrop-filter:\s*saturate\(180%\) blur\(18px\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-topbar__branch\s*\{[\s\S]*?display:\s*flex;[\s\S]*?align-items:\s*center;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-topbar__brand-logo\s*\{[\s\S]*?width:\s*5\.2rem;[\s\S]*?height:\s*2rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-branch-picker__chevron\s*\{[\s\S]*?top:\s*50%;[\s\S]*?place-items:\s*center;[\s\S]*?transform:\s*translateY\(-50%\);[\s\S]*?\}/,
  )
  assert.ok(appStyle.includes('.employee-branch-picker__chevron-stroke'))
  assert.match(
    appStyle,
    /\.employee-tabbar\s*\{[\s\S]*?grid-template-columns:\s*repeat\(5, minmax\(0, 1fr\)\);[\s\S]*?border-top:\s*1px solid[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-tabbar__item\.is-active\s*\{[\s\S]*?color:\s*var\(--employee-color-primary\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-tabbar__icon\s*\{[\s\S]*?width:\s*3\.2rem;[\s\S]*?height:\s*3\.2rem;[\s\S]*?\}/,
  )
  assert.ok(appStyle.includes('.employee-tabbar__icon-stroke'))
  assert.ok(appStyle.includes('.employee-tabbar__icon-fill'))
  assert.ok(appStyle.includes('.employee-tabbar__icon-cutout'))
  assert.ok(appStyle.includes('.employee-topbar__icon-stroke'))
  assert.equal(appStyle.includes('.employee-bell-icon::before'), false)
  assert.equal(appStyle.includes('.employee-bell-icon::after'), false)
  assert.equal(appStyle.includes('.employee-logout-icon::before'), false)
  assert.equal(appStyle.includes('.employee-logout-icon::after'), false)
  assert.equal(appStyle.includes('.employee-tabbar__icon--home::before'), false)
  assert.equal(appStyle.includes('.employee-tabbar__icon--schedule::before'), false)
  assert.equal(appStyle.includes("content: '⌂'"), false)
  assert.doesNotMatch(
    appStyle,
    /\.employee-tabbar__item\.is-active\s*\{[\s\S]*?background:\s*var\(--employee-color-primary\);/,
  )
})

test('employee refresh controls use icon-only buttons in repeated screen headers', () => {
  const appStyle = readSource('../src/styles/app.scss')
  const refreshSource = readSource('../src/component/EmployeeRefreshButton.vue')
  const attendanceSource = readSource('../src/views/AttendanceView.vue')
  const payrollSource = readSource('../src/views/PayrollView.vue')
  const contractsSource = readSource('../src/views/ContractsView.vue')
  const notificationsSource = readSource('../src/views/NotificationsView.vue')
  const screenSources = [
    attendanceSource,
    payrollSource,
    contractsSource,
    notificationsSource,
  ]

  assert.ok(refreshSource.includes('class="employee-refresh-button"'))
  assert.ok(refreshSource.includes(':aria-label="label"'))
  assert.ok(refreshSource.includes(':title="label"'))
  assert.ok(refreshSource.includes('employee-refresh-button__icon'))
  assert.equal(refreshSource.includes('{{ label }}'), false)
  for (const source of screenSources) {
    assert.ok(source.includes('<EmployeeRefreshButton'))
    assert.ok(source.includes('import EmployeeRefreshButton'))
    assert.equal(source.includes('employee-secondary-button employee-'), false)
  }
  assert.match(
    appStyle,
    /\.employee-refresh-button\s*\{[\s\S]*?width:\s*4\.4rem;[\s\S]*?height:\s*4\.4rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-refresh-button__stroke\s*\{[\s\S]*?stroke:\s*currentColor;[\s\S]*?stroke-linecap:\s*round;[\s\S]*?\}/,
  )
})
