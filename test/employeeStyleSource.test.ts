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
  assert.ok(appStyle.includes('.employee-payroll-latest'))
  assert.ok(appStyle.includes('.employee-payroll-history'))
  assert.ok(appStyle.includes('.employee-payroll-latest__breakdown'))
  assert.ok(appStyle.includes('.employee-payroll-latest__section'))
  assert.ok(appStyle.includes('.employee-payroll-latest__section-toggle'))
  assert.ok(appStyle.includes('box-shadow: 0 1.8rem 4rem rgba(13, 19, 38, 0.08);'))
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

test('employee payroll latest card keeps the full earnings and deductions breakdown', () => {
  const payrollSource = readSource('../src/views/PayrollView.vue')

  assert.ok(payrollSource.includes(':aria-expanded="latestEarningsOpen"'))
  assert.ok(payrollSource.includes(':aria-expanded="latestDeductionsOpen"'))
  assert.ok(payrollSource.includes('v-show="latestEarningsOpen"'))
  assert.ok(payrollSource.includes('v-show="latestDeductionsOpen"'))
  assert.ok(payrollSource.includes("t('payroll.toggleEarnings')"))
  assert.ok(payrollSource.includes("t('payroll.toggleDeductions')"))
  assert.ok(payrollSource.includes("t('payroll.basePay')"))
  assert.ok(payrollSource.includes("t('payroll.overtimePay')"))
  assert.ok(payrollSource.includes("t('payroll.nightPay')"))
  assert.ok(payrollSource.includes("t('payroll.holidayPay')"))
  assert.ok(payrollSource.includes("t('payroll.weeklyHolidayPay')"))
  assert.ok(payrollSource.includes("t('payroll.nationalPension')"))
  assert.ok(payrollSource.includes("t('payroll.healthInsurance')"))
  assert.ok(payrollSource.includes("t('payroll.longTermCare')"))
  assert.ok(payrollSource.includes("t('payroll.employmentInsurance')"))
  assert.ok(payrollSource.includes("t('payroll.incomeTax')"))
  assert.ok(payrollSource.includes("t('payroll.localIncomeTax')"))
  assert.ok(payrollSource.includes('latest.totalDeductions'))
  assert.equal(payrollSource.includes('employee-payroll-latest__summary'), false)
})

test('employee notifications use searchable grouped list with category icons', () => {
  const appStyle = readSource('../src/styles/app.scss')
  const notificationsSource = readSource('../src/views/NotificationsView.vue')
  const shellSource = readSource('../src/component/EmployeeAppShell.vue')
  const toastSource = readSource('../src/component/EmployeeToastOutlet.vue')

  assert.ok(notificationsSource.includes('class="employee-notifications__search"'))
  assert.ok(notificationsSource.includes("t('notifications.searchPlaceholder')"))
  assert.ok(notificationsSource.includes('class="employee-notifications__filter"'))
  assert.ok(notificationsSource.includes('class="employee-notifications__mark-all"'))
  assert.ok(notificationsSource.includes('showEmployeeToast'))
  assert.equal(notificationsSource.includes('feedbackMessage'), false)
  assert.equal(notificationsSource.includes('employee-notifications__feedback'), false)
  assert.ok(shellSource.includes('<EmployeeToastOutlet />'))
  assert.ok(toastSource.includes('class="employee-toast-region"'))
  assert.ok(toastSource.includes('<TransitionGroup name="employee-toast">'))
  assert.ok(toastSource.includes('role="status"'))
  assert.ok(toastSource.includes("t('app.close')"))
  assert.ok(notificationsSource.includes('groupedNotifications'))
  assert.ok(notificationsSource.includes('employee-notifications-group'))
  assert.ok(notificationsSource.includes('employee-notification-card__icon--'))
  assert.ok(notificationsSource.includes('notificationIcon(notification.type)'))
  assert.ok(notificationsSource.includes('formatRelativeTime(notification.createdAt)'))
  assert.ok(notificationsSource.includes('markAllVisibleAsRead'))
  assert.equal(notificationsSource.includes('employee-notification-status'), false)
  assert.equal(notificationsSource.includes('employee-notification-card__meta'), false)
  assert.match(
    appStyle,
    /\.employee-notifications__search\s*\{[\s\S]*?border-radius:\s*9999px;[\s\S]*?background:\s*var\(--employee-color-surface-subtle\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-notifications__filter\.is-active strong\s*\{[\s\S]*?background:\s*var\(--employee-color-primary\);[\s\S]*?color:\s*var\(--employee-color-on-primary\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-notification-card__icon\s*\{[\s\S]*?width:\s*6\.2rem;[\s\S]*?height:\s*6\.2rem;[\s\S]*?border-radius:\s*9999px;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-notification-card__dot\s*\{[\s\S]*?background:\s*var\(--employee-color-primary\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-toast-region\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?bottom:\s*calc\(12\.4rem \+ env\(safe-area-inset-bottom\)\);[\s\S]*?z-index:\s*90;[\s\S]*?pointer-events:\s*none;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-toast\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto;[\s\S]*?border:\s*0;[\s\S]*?background:\s*rgba\(232, 242, 255, 0\.96\);[\s\S]*?pointer-events:\s*auto;[\s\S]*?\}/,
  )
  assert.doesNotMatch(
    appStyle.match(/\.employee-toast\s*\{[^}]*\}/)?.[0] ?? '',
    /box-shadow:/,
  )
  assert.match(
    appStyle,
    /\.employee-toast--success\s*\{[\s\S]*?color:\s*var\(--employee-color-primary\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /@media \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*?\.employee-toast-enter-active,\s*\.employee-toast-leave-active\s*\{[\s\S]*?opacity 0\.22s ease,[\s\S]*?transform 0\.22s ease;[\s\S]*?\}[\s\S]*?\.employee-toast-enter-from,\s*\.employee-toast-leave-to\s*\{[\s\S]*?opacity:\s*0;[\s\S]*?transform:\s*translateY\(1rem\);[\s\S]*?\}/,
  )
})

test('employee schedule month calendar follows the open admin calendar layout', () => {
  const appStyle = readSource('../src/styles/app.scss')
  const scheduleSource = readSource('../src/views/ScheduleView.vue')
  const scheduleCardHoverBlock =
    appStyle.match(
      /\.employee-schedule-card:hover,\s*\.employee-schedule-card:focus-within\s*\{[^}]*\}/,
    )?.[0] ?? ''

  assert.ok(scheduleSource.includes('v-if="mode !== \'month\'" class="employee-schedule-range"'))
  assert.ok(scheduleSource.includes('class="employee-schedule-month__header"'))
  assert.ok(scheduleSource.includes('class="employee-schedule-day__indicators"'))
  assert.ok(scheduleSource.includes("'is-selected': cell.date === selectedMonthDate"))
  assert.ok(scheduleSource.includes('class="employee-schedule-month-agenda"'))
  assert.ok(scheduleSource.includes('selectedMonthSchedules'))
  assert.ok(scheduleSource.includes('@click="selectMonthDate(cell)"'))
  assert.ok(scheduleSource.includes("t('schedule.selectedDateEmpty')"))
  assert.ok(scheduleSource.includes('syncSelectedMonthDate()'))
  assert.doesNotMatch(scheduleSource, /:disabled="cell\.schedules\.length === 0"/)
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
  assert.ok(
    appStyle.includes(`.employee-schedule-month-agenda {
  display: grid;
  gap: 1rem;
  margin-top: 2rem;
  padding: 0 0.2rem;
}`),
  )
  assert.match(
    appStyle,
    /\.employee-schedule-month-agenda__empty\s*\{[\s\S]*?border:\s*1px solid var\(--employee-color-border\);[\s\S]*?color:\s*var\(--employee-color-text-muted\);[\s\S]*?\}/,
  )
  assert.ok(scheduleSource.includes('class="employee-schedule-card__summary"'))
  assert.ok(scheduleSource.includes('class="employee-schedule-card__times"'))
  assert.ok(scheduleSource.includes('class="employee-schedule-card__footer"'))
  assert.ok(scheduleSource.includes('class="employee-schedule-status"'))
  assert.ok(scheduleSource.includes('class="employee-close-button"'))
  assert.ok(scheduleSource.includes('class="employee-schedule-detail-modal"'))
  assert.ok(scheduleSource.includes('@click.self="closeDetail"'))
  assert.doesNotMatch(scheduleSource, /class="employee-icon-button"[\s\S]*?closeDetail/)
  assert.ok(scheduleSource.includes('class="employee-schedule-coworkers"'))
  assert.ok(scheduleSource.includes('class="employee-schedule-coworker-toggle"'))
  assert.ok(scheduleSource.includes("t('schedule.coworkerGroupLabel'"))
  assert.doesNotMatch(scheduleSource, /scheduleShiftLabel/)
  assert.doesNotMatch(scheduleSource, /employee-schedule-card__badge/)
  assert.ok(scheduleSource.includes('openCoworkerDetail(schedule, coworker)'))
  assert.ok(scheduleSource.includes('role="dialog"'))
  assert.ok(scheduleSource.includes('aria-labelledby="schedule-coworker-heading"'))
  assert.ok(scheduleSource.includes('coworkerSummary(coworker)'))
  assert.match(
    appStyle,
    /\.employee-schedule-card__summary\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto;[\s\S]*?min-height:\s*12rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-card:hover,\s*\.employee-schedule-card:focus-within\s*\{[\s\S]*?border-color:\s*var\(--employee-color-primary\);[\s\S]*?background:\s*var\(--employee-color-surface\);[\s\S]*?\}/,
  )
  assert.doesNotMatch(scheduleCardHoverBlock, /background:\s*var\(--employee-color-tint-sky\);/)
  assert.match(
    appStyle,
    /\.employee-schedule-card__times strong\s*\{[\s\S]*?font-size:\s*1\.95rem;[\s\S]*?font-weight:\s*800;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-card__footer\s*\{[\s\S]*?justify-content:\s*space-between;[\s\S]*?border-top:\s*1px solid var\(--employee-color-border\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-status\s*\{[\s\S]*?border:\s*1px solid currentColor;[\s\S]*?background:\s*transparent;[\s\S]*?margin-left:\s*auto;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-close-button\s*\{[\s\S]*?border:\s*0;[\s\S]*?border-radius:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-detail-modal\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?place-items:\s*center;[\s\S]*?background:\s*rgba\(9, 13, 22, 0\.48\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-detail\s*\{[\s\S]*?width:\s*min\(100%, 42rem\);[\s\S]*?max-height:\s*min\(78vh, 62rem\);[\s\S]*?overflow:\s*auto;[\s\S]*?border-radius:\s*1\.8rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-coworker-toggle\s*\{[\s\S]*?display:\s*inline-flex;[\s\S]*?border-radius:\s*9999px;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-coworker-toggle:hover,\s*\.employee-schedule-coworker-toggle\[aria-expanded="true"\]\s*\{[\s\S]*?background:\s*var\(--employee-color-surface-subtle\);[\s\S]*?color:\s*var\(--employee-color-primary\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-coworker-badge\s*\{[\s\S]*?width:\s*3rem;[\s\S]*?height:\s*3rem;[\s\S]*?border-radius:\s*9999px;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-coworker-modal\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?place-items:\s*center;[\s\S]*?\}/,
  )
})

test('employee shell keeps store switching in settings and uses notification bell, settings gear, and plain bottom tab bar', () => {
  const appStyle = readSource('../src/styles/app.scss')
  const shellSource = readSource('../src/component/EmployeeAppShell.vue')
  const navSource = readSource('../src/app/navigation.ts')

  assert.equal(shellSource.includes('class="employee-topbar__store-name"'), false)
  assert.equal(shellSource.includes('class="employee-branch-picker__fallback"'), false)
  assert.equal(shellSource.includes('class="employee-branch-picker__select"'), false)
  assert.equal(shellSource.includes('id="employee-store-select"'), false)
  assert.equal(shellSource.includes('@change="handleStoreSelect"'), false)
  assert.ok(shellSource.includes('class="employee-topbar__brand-link"'))
  assert.ok(shellSource.includes('class="employee-topbar__brand-logo"'))
  assert.ok(shellSource.includes('src="/favicon.png"'))
  assert.equal(shellSource.includes('employee-topbar__brand-mark'), false)
  assert.equal(shellSource.includes('employee-topbar__brand-text'), false)
  assert.equal(shellSource.includes('employee-topbar__brand-arrow'), false)
  assert.equal(shellSource.includes('class="employee-branch-picker__chevron-icon"'), false)
  assert.equal(shellSource.includes('class="employee-topbar__brand"'), false)
  assert.ok(shellSource.includes(':to="{ name: \'home\' }"'))
  assert.ok(shellSource.includes(':to="{ name: \'notifications\' }"'))
  assert.ok(shellSource.includes('v-if="unreadNotificationCount > 0"'))
  assert.ok(shellSource.includes('class="employee-topbar__notification-badge"'))
  assert.ok(shellSource.includes('loadMyNotifications'))
  assert.ok(shellSource.includes('refreshUnreadNotifications'))
  assert.ok(shellSource.includes(':to="{ name: \'settings\' }"'))
  assert.ok(shellSource.includes(':aria-label="t(\'nav.settings\')"'))
  assert.ok(shellSource.includes('class="employee-tabbar__qr-action"'))
  assert.ok(shellSource.includes(':to="{ name: \'attendance\', query: { qr: \'1\' } }"'))
  assert.ok(shellSource.includes(':aria-label="t(\'attendance.qrScan\')"'))
  assert.ok(shellSource.includes('class="employee-tabbar__qr-icon"'))
  assert.ok(shellSource.includes('class="employee-tabbar__qr-icon-scanline"'))
  assert.ok(shellSource.includes('class="employee-topbar__svg-icon employee-bell-icon"'))
  assert.ok(shellSource.includes('class="employee-topbar__svg-icon employee-settings-icon"'))
  assert.ok(shellSource.includes('M18.8 5.7 19.6 8'))
  assert.equal(shellSource.includes('M16 5.8v3M16 23.2v3'), false)
  assert.equal(shellSource.includes('employee-menu-icon'), false)
  assert.equal(shellSource.includes('@click="logout"'), false)
  assert.ok(shellSource.includes('viewBox="0 0 32 32"'))
  assert.ok(shellSource.includes('v-for="item in employeeTabItems"'))
  assert.ok(shellSource.includes("{ 'is-active': route.name === item.routeName }"))
  assert.ok(shellSource.includes('<svg'))
  assert.ok(shellSource.includes('viewBox="0 0 28 28"'))
  assert.ok(shellSource.includes('employee-tabbar__icon-stroke'))
  assert.ok(shellSource.includes('employee-tabbar__icon-fill'))
  assert.equal(shellSource.includes('class="employee-store-strip"'), false)
  assert.ok(navSource.includes("item.routeName !== 'notifications' && item.routeName !== 'settings'"))
  assert.equal(navSource.includes("routeName: 'schedule'"), false)
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
    /\.employee-topbar__brand-link\s*\{[\s\S]*?width:\s*6\.8rem;[\s\S]*?height:\s*2\.4rem;[\s\S]*?overflow:\s*hidden;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-topbar__brand-logo\s*\{[\s\S]*?width:\s*100%;[\s\S]*?height:\s*100%;[\s\S]*?object-fit:\s*cover;[\s\S]*?\}/,
  )
  assert.equal(appStyle.includes('.employee-topbar__brand-mark'), false)
  assert.equal(appStyle.includes('.employee-topbar__brand-text'), false)
  assert.equal(appStyle.includes('.employee-topbar__brand-arrow'), false)
  assert.equal(appStyle.includes('.employee-topbar__store-name'), false)
  assert.equal(appStyle.includes('.employee-branch-picker__fallback'), false)
  assert.equal(appStyle.includes('.employee-branch-picker__chevron-stroke'), false)
  assert.ok(appStyle.includes('.employee-topbar__notification-badge'))
  assert.equal(appStyle.includes('.employee-topbar__icon-link.router-link-active::after'), false)
  assert.match(
    appStyle,
    /\.employee-tabbar\s*\{[\s\S]*?grid-template-columns:\s*repeat\(5, minmax\(0, 1fr\)\);[\s\S]*?border-top:\s*1px solid[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-tabbar__qr-action\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?top:\s*-2\.8rem;[\s\S]*?width:\s*6\.4rem;[\s\S]*?border-radius:\s*2rem;[\s\S]*?background:\s*var\(--employee-color-primary\);[\s\S]*?transform:\s*translateX\(-50%\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-tabbar__qr-icon-stroke\s*\{[\s\S]*?stroke:\s*var\(--employee-color-on-primary\);[\s\S]*?stroke-width:\s*2;[\s\S]*?stroke-linecap:\s*round;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-tabbar__qr-icon-scanline\s*\{[\s\S]*?stroke:\s*#54b2e9;[\s\S]*?stroke-width:\s*2;[\s\S]*?stroke-linecap:\s*round;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-tabbar__item--home\s*\{[\s\S]*?grid-column:\s*1;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-tabbar__item--attendance\s*\{[\s\S]*?grid-column:\s*2;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-tabbar__item--payroll\s*\{[\s\S]*?grid-column:\s*4;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-tabbar__item--contracts\s*\{[\s\S]*?grid-column:\s*5;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-tabbar__item\.is-active\s*\{[\s\S]*?color:\s*var\(--employee-color-primary\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-tabbar__item\s*\{[\s\S]*?grid-template-rows:\s*3\.2rem 1\.5rem;[\s\S]*?gap:\s*0\.1rem;[\s\S]*?min-height:\s*5\.9rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-tabbar__item span\s*\{[\s\S]*?max-height:\s*1\.5rem;[\s\S]*?opacity:\s*1;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-tabbar__qr-icon\s*\{[\s\S]*?width:\s*5\.1rem;[\s\S]*?height:\s*5\.1rem;[\s\S]*?\}/,
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
  assert.equal(appStyle.includes('.employee-topbar__icon-button'), false)
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
