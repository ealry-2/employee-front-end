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
  assert.ok(appStyle.includes('--employee-qr-guide: #7ee8f6;'))
  assert.ok(appStyle.includes('--employee-qr-corner: rgba(255, 255, 255, 0.96);'))
  assert.ok(appStyle.includes('center / 100% 0.24rem no-repeat'))
  assert.ok(appStyle.includes('linear-gradient(var(--employee-qr-corner), var(--employee-qr-corner)) left top'))
  assert.ok(appStyle.includes('linear-gradient(var(--employee-qr-corner), var(--employee-qr-corner)) right bottom'))
  assert.match(
    appStyle,
    /#cap-os-barcode-scanner-container\s*\{[\s\S]*?background:\s*transparent !important;[\s\S]*?\}/,
  )
  assert.doesNotMatch(
    appStyle,
    /#cap-os-barcode-scanner-container\s*\{[\s\S]*?var\(--employee-color-brand-navy\) !important;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /#cap-os-barcode-scanner-container-scanner video\s*\{[\s\S]*?z-index:\s*10001 !important;[\s\S]*?background:\s*transparent !important;[\s\S]*?filter:\s*saturate\(1\.04\) contrast\(1\.04\) brightness\(0\.96\);[\s\S]*?\}/,
  )
  assert.ok(appStyle.includes('background: var(--employee-color-tint-mint);'))
  assert.ok(appStyle.includes('.employee-payroll-latest'))
  assert.ok(appStyle.includes('.employee-payroll-history'))
  assert.ok(appStyle.includes('.employee-payroll-latest__breakdown'))
  assert.ok(appStyle.includes('.employee-payroll-latest__section'))
  assert.ok(appStyle.includes('.employee-payroll-latest__section-toggle'))
  assert.match(
    appStyle,
    /\.employee-payroll-latest__breakdown\s*\{[\s\S]*?padding:\s*0;[\s\S]*?\}/,
  )
  assert.ok(appStyle.includes('box-shadow: 0 1.8rem 4rem rgba(13, 19, 38, 0.08);'))
  assert.ok(appStyle.includes('.employee-record-card--selected-lavender.is-selected'))
  assert.ok(appStyle.includes('background: var(--employee-color-tint-lavender);'))
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

test('employee payroll selected card keeps the full earnings and deductions breakdown', () => {
  const appStyle = readSource('../src/styles/app.scss')
  const payrollSource = readSource('../src/views/PayrollView.vue')
  const recordListSource = readSource('../src/component/EmployeeRecordList.vue')
  const recordCardSource = readSource('../src/component/EmployeeRecordCard.vue')

  assert.ok(payrollSource.includes('v-if="selectedPayroll"'))
  assert.ok(payrollSource.includes('v-for="payroll in payrolls"'))
  assert.ok(payrollSource.includes('<EmployeeRecordList'))
  assert.ok(payrollSource.includes('<EmployeeRecordCard'))
  assert.ok(payrollSource.includes('import EmployeeRecordList'))
  assert.ok(payrollSource.includes('import EmployeeRecordCard'))
  assert.ok(recordListSource.includes('class="employee-record-list__header"'))
  assert.ok(recordListSource.includes('class="employee-record-list__count"'))
  assert.ok(recordListSource.includes('class="employee-record-list__items"'))
  assert.ok(recordCardSource.includes('class="employee-record-card"'))
  assert.ok(recordCardSource.includes('class="employee-record-card__icon"'))
  assert.ok(recordCardSource.includes('class="employee-record-card__main"'))
  assert.ok(recordCardSource.includes('class="employee-record-card__side"'))
  assert.equal(payrollSource.includes('employee-payroll__header'), false)
  assert.equal(payrollSource.includes('employee-payroll__eyebrow'), false)
  assert.equal(payrollSource.includes('<EmployeeRefreshButton'), false)
  assert.equal(payrollSource.includes('import EmployeeRefreshButton'), false)
  assert.equal(appStyle.includes('.employee-payroll__header'), false)
  assert.equal(appStyle.includes('.employee-payroll__eyebrow'), false)
  assert.equal(appStyle.includes('.employee-payroll__refresh'), false)
  assert.ok(payrollSource.includes("t('payroll.closeDetail')"))
  assert.ok(payrollSource.includes('@click="closeSelectedPayroll"'))
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
  assert.ok(payrollSource.includes('selectedPayroll.totalDeductions'))
  assert.ok(payrollSource.includes('class="employee-work-status"'))
  assert.ok(payrollSource.includes('`employee-work-status--${payrollStatusTone(payroll.status)}`'))
  assert.ok(payrollSource.includes('employee-payroll-card__icon--${payrollIconTone(payroll.status)}'))
  assert.ok(payrollSource.includes('class="employee-payroll-card__svg"'))
  assert.ok(payrollSource.includes('employee-payroll-card__bag'))
  assert.ok(payrollSource.includes('employee-payroll-card__bag-won'))
  assert.ok(payrollSource.includes('employee-payroll-card__status-badge--paid'))
  assert.ok(payrollSource.includes('employee-payroll-card__status-badge--confirmed'))
  assert.ok(payrollSource.includes('employee-payroll-card__status-badge--draft'))
  assert.ok(payrollSource.includes('employee-payroll-card__status-check'))
  assert.ok(payrollSource.includes('employee-payroll-card__status-clock'))
  assert.ok(payrollSource.includes('employee-payroll-card__status-clock-hand'))
  assert.ok(payrollSource.includes('employee-payroll-card__status-dash'))
  assert.ok(payrollSource.includes('>₩</text>'))
  assert.ok(payrollSource.includes('payrollIconTone'))
  assert.ok(payrollSource.includes("payroll.status === 'PAID'"))
  assert.ok(payrollSource.includes("payroll.status === 'CONFIRMED'"))
  assert.equal(payrollSource.match(/employee-payroll-card__status-check/g)?.length, 1)
  assert.equal(payrollSource.includes('employee-payroll-card__bill-fill'), false)
  assert.equal(payrollSource.includes('employee-payroll-card__won-text'), false)
  assert.equal(payrollSource.includes('employee-payroll-card__coin'), false)
  assert.equal(payrollSource.includes('employee-payroll-status'), false)
  assert.equal(payrollSource.includes('employee-payroll-latest__badge'), false)
  assert.equal(payrollSource.includes('employee-payroll-latest__icon'), false)
  assert.equal(payrollSource.includes('employee-payroll-latest__summary'), false)
  assert.equal(payrollSource.includes('class="employee-payroll-detail"'), false)
  assert.equal(payrollSource.includes('employee-payroll-breakdown'), false)
  assert.equal(appStyle.includes('.employee-payroll-status'), false)
  assert.match(
    appStyle,
    /\.employee-payroll-card__icon--confirmed\s*\{[\s\S]*?background:\s*var\(--employee-color-primary-soft\);[\s\S]*?color:\s*var\(--employee-color-primary\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-payroll-card__icon--paid\s*\{[\s\S]*?background:\s*var\(--employee-color-success-soft\);[\s\S]*?color:\s*var\(--employee-color-success-text\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-record-card__icon \.employee-payroll-card__svg\s*\{[\s\S]*?width:\s*3\.4rem;[\s\S]*?height:\s*3\.4rem;[\s\S]*?overflow:\s*visible;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-payroll-card__bag\s*\{[\s\S]*?fill:\s*currentColor;[\s\S]*?opacity:\s*0\.74;[\s\S]*?stroke:\s*none;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-payroll-card__bag-won\s*\{[\s\S]*?fill:\s*var\(--employee-color-surface-raised\);[\s\S]*?font-size:\s*11px;[\s\S]*?font-weight:\s*900;[\s\S]*?text-anchor:\s*middle;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-payroll-card__status-badge\s*\{[\s\S]*?stroke:\s*var\(--employee-color-surface-raised\);[\s\S]*?stroke-width:\s*1\.6;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-payroll-card__status-check,\s*\.employee-payroll-card__status-dash,\s*\.employee-payroll-card__status-clock,\s*\.employee-payroll-card__status-clock-hand\s*\{[\s\S]*?stroke:\s*var\(--employee-color-on-primary\);[\s\S]*?stroke-width:\s*2\.1;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-payroll-card__status-clock\s*\{[\s\S]*?stroke-width:\s*1\.7;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-payroll-card__status-clock-hand\s*\{[\s\S]*?stroke-width:\s*1\.5;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-record-list\s*\{[\s\S]*?gap:\s*1\.6rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-record-list__items\s*\{[\s\S]*?gap:\s*1\.2rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-record-list__count\s*\{[\s\S]*?align-self:\s*flex-start;[\s\S]*?width:\s*max-content;[\s\S]*?max-width:\s*100%;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-record-card\s*\{[\s\S]*?grid-template-columns:\s*4\.4rem minmax\(0, 1fr\) auto;[\s\S]*?min-height:\s*8\.8rem;[\s\S]*?padding:\s*1\.2rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-payroll-history\s*\{[\s\S]*?margin-top:\s*0;[\s\S]*?padding:\s*0;[\s\S]*?\}/,
  )
})

test('employee contract selected detail renders above the contract list', () => {
  const contractsSource = readSource('../src/views/ContractsView.vue')
  const detailIndex = contractsSource.indexOf('class="employee-contract-detail"')
  const listIndex = contractsSource.indexOf('class="employee-contracts"')

  assert.ok(detailIndex > -1)
  assert.ok(listIndex > -1)
  assert.ok(detailIndex < listIndex)
  assert.ok(contractsSource.includes('@click="closeDetail"'))
  assert.ok(contractsSource.includes('@select="selectContract(contract)"'))
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

test('employee settings keeps store choice compact and supports editable profile with avatar', () => {
  const appStyle = readSource('../src/styles/app.scss')
  const settingsSource = readSource('../src/views/HomeView.vue')
  const authSource = readSource('../src/api/auth.ts')
  const typesSource = readSource('../src/api/types.ts')

  assert.equal(settingsSource.includes('class="employee-hero"'), false)
  assert.ok(settingsSource.includes('class="employee-store-list"'))
  assert.ok(settingsSource.includes('class="employee-profile-summary"'))
  assert.ok(settingsSource.includes('class="employee-profile-avatar"'))
  assert.ok(settingsSource.includes('bootstrap.user.profileImageUrl'))
  assert.ok(settingsSource.includes('openProfileEditor'))
  assert.ok(settingsSource.includes('class="employee-profile-edit"'))
  assert.ok(settingsSource.includes('class="employee-profile-edit__icon"'))
  assert.ok(settingsSource.includes(':aria-label="t(\'home.editProfile\')"'))
  assert.equal(settingsSource.includes('class="employee-secondary-button employee-profile-edit"'), false)
  assert.ok(settingsSource.includes('class="employee-profile-modal"'))
  assert.ok(settingsSource.includes('role="dialog"'))
  assert.ok(settingsSource.includes('updateAppProfile'))
  assert.ok(settingsSource.includes('showEmployeeToast'))
  assert.ok(authSource.includes("apiClient.put<AppUserSummary>('/api/app/auth/profile'"))
  assert.ok(typesSource.includes('profileImageUrl: string | null'))
  assert.match(
    appStyle,
    /\.employee-profile-summary\s*\{[\s\S]*?display:\s*flex;[\s\S]*?border-top:\s*1px solid var\(--employee-color-border\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-profile-avatar\s*\{[\s\S]*?width:\s*5\.6rem;[\s\S]*?border-radius:\s*9999px;[\s\S]*?background:\s*var\(--employee-color-primary-soft\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-profile-edit\s*\{[\s\S]*?display:\s*grid;[\s\S]*?width:\s*4\.4rem;[\s\S]*?border:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-profile-edit__icon\s*\{[\s\S]*?width:\s*2\.4rem;[\s\S]*?stroke:\s*currentColor;[\s\S]*?stroke-width:\s*2\.2;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-profile-modal\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?place-items:\s*center;[\s\S]*?background:\s*rgba\(9, 13, 22, 0\.48\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-profile-editor\s*\{[\s\S]*?width:\s*min\(100%, 42rem\);[\s\S]*?max-height:\s*min\(82vh, 64rem\);[\s\S]*?overflow:\s*auto;[\s\S]*?\}/,
  )
})

test('employee schedule month calendar follows the open admin calendar layout', () => {
  const appStyle = readSource('../src/styles/app.scss')
  const scheduleSource = readSource('../src/views/ScheduleView.vue')
  const attendanceSource = readSource('../src/views/AttendanceView.vue')
  const workCardSource = readSource('../src/component/EmployeeWorkCard.vue')
  const scheduleCardHoverBlock =
    appStyle.match(
      /\.employee-work-card:hover,\s*\.employee-work-card:focus-within\s*\{[^}]*\}/,
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
  assert.ok(scheduleSource.includes('v-else-if="mode !== \'month\' && schedules.length === 0"'))
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
    /\.employee-schedule-month__nav-button\s*\{[\s\S]*?width:\s*4\.4rem;[\s\S]*?border:\s*0;[\s\S]*?border-radius:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?font-size:\s*3\.4rem;[\s\S]*?pointer-events:\s*auto;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-range__button\s*\{[\s\S]*?width:\s*4\.4rem;[\s\S]*?border-radius:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?font-size:\s*3\.2rem;[\s\S]*?\}/,
  )
  assert.doesNotMatch(
    appStyle,
    /\.employee-schedule-month__nav\s*\{[\s\S]*?padding-top:\s*4\.2rem;/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-day\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*1fr 1\.9rem 0\.9rem 1fr;[\s\S]*?place-items:\s*center;[\s\S]*?min-height:\s*4\.4rem;[\s\S]*?padding:\s*0\.25rem 0\.2rem 0\.4rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-month__grid\s*\{[\s\S]*?grid-auto-rows:\s*4\.4rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-day__number\s*\{[\s\S]*?grid-row:\s*2;[\s\S]*?height:\s*1\.9rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-schedule-day__indicators\s*\{[\s\S]*?grid-row:\s*3;[\s\S]*?height:\s*0\.9rem;[\s\S]*?pointer-events:\s*none;[\s\S]*?\}/,
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
  assert.ok(scheduleSource.includes('<EmployeeWorkCard'))
  assert.ok(scheduleSource.includes('import EmployeeWorkCard'))
  assert.ok(attendanceSource.includes('<EmployeeWorkCard'))
  assert.ok(attendanceSource.includes('class="employee-attendance-record-item"'))
  assert.ok(workCardSource.includes('class="employee-work-card__summary"'))
  assert.ok(workCardSource.includes('class="employee-work-card__times"'))
  assert.ok(workCardSource.includes('class="employee-work-card__footer"'))
  assert.ok(workCardSource.includes('class="employee-work-status"'))
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
    /\.employee-work-card__summary\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto;[\s\S]*?min-height:\s*12rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-work-card:hover,\s*\.employee-work-card:focus-within\s*\{[\s\S]*?border-color:\s*var\(--employee-color-primary\);[\s\S]*?background:\s*var\(--employee-color-surface\);[\s\S]*?\}/,
  )
  assert.doesNotMatch(scheduleCardHoverBlock, /background:\s*var\(--employee-color-tint-sky\);/)
  assert.match(
    appStyle,
    /\.employee-work-card__times strong\s*\{[\s\S]*?font-size:\s*1\.95rem;[\s\S]*?font-weight:\s*800;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-work-card__footer\s*\{[\s\S]*?justify-content:\s*space-between;[\s\S]*?border-top:\s*1px solid var\(--employee-color-border\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-work-status\s*\{[\s\S]*?align-self:\s*center;[\s\S]*?width:\s*max-content;[\s\S]*?min-height:\s*2\.6rem;[\s\S]*?border:\s*1px solid currentColor;[\s\S]*?background:\s*transparent;[\s\S]*?padding:\s*0 0\.8rem;[\s\S]*?font-size:\s*1\.15rem;[\s\S]*?margin-left:\s*auto;[\s\S]*?\}/,
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
    /\.employee-topbar\s*\{[\s\S]*?max\(1\.4rem,\s*env\(safe-area-inset-top\)\)[\s\S]*?0\.8rem;[\s\S]*?\}/,
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
  const shellRule = appStyle.match(/\.employee-shell\s*\{[\s\S]*?\}/)?.[0] ?? ''
  assert.equal(shellRule.includes('max-width'), false)
  assert.match(
    appStyle,
    /\.employee-tabbar\s*\{[\s\S]*?grid-template-columns:\s*repeat\(5, minmax\(0, 1fr\)\);[\s\S]*?border-top:\s*1px solid[\s\S]*?\}/,
  )
  const tabbarRule = appStyle.match(/\.employee-tabbar\s*\{[\s\S]*?\}/)?.[0] ?? ''
  assert.equal(tabbarRule.includes('max-width'), false)
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
  const contractsSource = readSource('../src/views/ContractsView.vue')
  const notificationsSource = readSource('../src/views/NotificationsView.vue')
  const screenSources = [
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
  assert.equal(attendanceSource.includes('<EmployeeRefreshButton'), false)
  assert.equal(attendanceSource.includes('import EmployeeRefreshButton'), false)
  assert.equal(attendanceSource.includes('class="employee-attendance__header"'), false)
  assert.equal(attendanceSource.includes('id="attendance-heading"'), false)
  assert.ok(attendanceSource.includes(':aria-label="t(\'screen.attendance.title\')"'))
  assert.ok(attendanceSource.includes('employee-attendance-metric-icon__door'))
  assert.ok(attendanceSource.includes('employee-attendance-metric-icon__arrow'))
  assert.ok(attendanceSource.includes('d="M5.2 16h16.8"'))
  assert.ok(attendanceSource.includes('d="M23.2 16H6.8"'))
  assert.equal(appStyle.includes('.employee-attendance__header'), false)
  assert.equal(appStyle.includes('.employee-attendance__refresh'), false)
  const attendanceActionRule = appStyle.match(/\.employee-attendance-ring-action\s*\{[\s\S]*?\}/)?.[0] ?? ''
  assert.equal(attendanceActionRule.includes('box-shadow'), false)
  const disabledAttendanceActionRule = appStyle.match(/\.employee-attendance-ring-action:disabled\s*\{[\s\S]*?\}/)?.[0] ?? ''
  assert.equal(disabledAttendanceActionRule.includes('box-shadow'), false)
  assert.equal(appStyle.includes('.employee-attendance-metric-icon--in svg,'), false)
  assert.equal(appStyle.includes('.employee-attendance-metric-icon__arrow {'), false)
  assert.match(appStyle, /\.employee-attendance-metric-icon svg\s*\{[\s\S]*?stroke-width:\s*2\.2;[\s\S]*?\}/)
  assert.match(
    appStyle,
    /\.employee-refresh-button\s*\{[\s\S]*?width:\s*4\.4rem;[\s\S]*?height:\s*4\.4rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-refresh-button__stroke\s*\{[\s\S]*?stroke:\s*currentColor;[\s\S]*?stroke-linecap:\s*round;[\s\S]*?\}/,
  )
})

test('employee contracts list avoids nested card headers', () => {
  const appStyle = readSource('../src/styles/app.scss')
  const contractsSource = readSource('../src/views/ContractsView.vue')

  assert.ok(contractsSource.includes('<EmployeeRecordList'))
  assert.ok(contractsSource.includes('<EmployeeRecordCard'))
  assert.ok(contractsSource.includes('import EmployeeRecordList'))
  assert.ok(contractsSource.includes('import EmployeeRecordCard'))
  assert.ok(contractsSource.includes('title-id="contracts-heading"'))
  assert.ok(contractsSource.includes(':heading-level="2"'))
  assert.ok(contractsSource.includes('employee-contract-card__icon--${contractIconTone(contract)}'))
  assert.ok(contractsSource.includes('class="employee-contract-card__svg"'))
  assert.ok(contractsSource.includes('employee-contract-card__signature-fill'))
  assert.ok(contractsSource.includes('employee-contract-card__signature-empty'))
  assert.ok(contractsSource.includes('class="employee-contract-detail__close"'))
  assert.ok(contractsSource.includes('class="employee-work-status"'))
  assert.ok(contractsSource.includes('contractStatusKey(contract.status)'))
  assert.ok(contractsSource.includes('contractIconTone(contract)'))
  assert.ok(contractsSource.includes('class="employee-contract-detail__actions"'))
  assert.ok(contractsSource.includes('@click="startSigningSession"'))
  assert.ok(contractsSource.includes('@click="openPreviewDialog"'))
  assert.ok(contractsSource.includes('class="employee-contract-preview-dialog"'))
  assert.ok(contractsSource.includes('role="dialog"'))
  assert.ok(contractsSource.includes('aria-modal="true"'))
  assert.ok(contractsSource.includes('ref="previewDialogElement"'))
  assert.ok(contractsSource.includes('@keydown.esc="closePreviewDialog"'))
  assert.ok(contractsSource.includes('import { computed, nextTick, ref, watch } from'))
  assert.ok(contractsSource.includes('previewDialogElement.value?.focus()'))
  assert.ok(contractsSource.includes('createMyContractSigningSession'))
  assert.ok(contractsSource.includes("t('contracts.startSigning')"))
  assert.ok(contractsSource.includes("t('contracts.documentPreview')"))
  assert.ok(contractsSource.includes('signingSessionError'))
  assert.equal(contractsSource.includes("t('contracts.signingBoundary')"), false)
  assert.equal(contractsSource.includes("t('contracts.signingRequiredTitle')"), false)
  assert.equal(contractsSource.includes("t('contracts.signingRequiredDescription')"), false)
  assert.equal(contractsSource.includes("t('contracts.signingAppInstruction')"), false)
  assert.equal(contractsSource.includes('class="employee-contract-callout'), false)
  assert.equal(contractsSource.includes('class="employee-contract-document"'), false)
  assert.equal(contractsSource.includes('employee-contract-callout--success'), false)
  assert.equal(contractsSource.includes("t('contracts.documentReadyTitle')"), false)
  assert.equal(contractsSource.includes("t('contracts.documentReadyDescription')"), false)
  assert.ok(contractsSource.includes(':disabled="signingSessionLoading"'))
  assert.doesNotMatch(contractsSource, /class="employee-icon-button"[\s\S]*?closeDetail/)
  assert.equal(contractsSource.includes("t('contracts.eyebrow')"), false)
  assert.equal(contractsSource.includes('<EmployeeRefreshButton'), false)
  assert.equal(contractsSource.includes('import EmployeeRefreshButton'), false)
  assert.equal(contractsSource.includes('class="employee-contracts__header"'), false)
  assert.equal(contractsSource.includes('class="employee-contracts__count"'), false)
  assert.equal(contractsSource.includes('employee-contracts-list__header'), false)
  assert.equal(contractsSource.includes('contracts-list-heading'), false)
  assert.equal(contractsSource.includes('employee-contract-status'), false)
  assert.equal(contractsSource.includes('contractStatusShortKey'), false)
  assert.equal(contractsSource.includes("t('contracts.listEyebrow')"), false)
  assert.equal(appStyle.includes('.employee-contract-status'), false)
  assert.equal(appStyle.includes('.employee-contracts__eyebrow'), false)
  assert.equal(appStyle.includes('.employee-contracts__actions'), false)
  assert.match(
    appStyle,
    /\.employee-record-list__title\s*\{[\s\S]*?font-size:\s*2rem;[\s\S]*?line-height:\s*1\.2;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-record-list__count\s*\{[\s\S]*?align-self:\s*flex-start;[\s\S]*?width:\s*max-content;[\s\S]*?max-width:\s*100%;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-contract-detail__close\s*\{[\s\S]*?border:\s*0;[\s\S]*?border-radius:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?font-size:\s*3rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-record-card__icon\s*\{[\s\S]*?width:\s*4\.4rem;[\s\S]*?height:\s*4\.4rem;[\s\S]*?border-radius:\s*9999px;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-contract-card__icon--signed\s*\{[\s\S]*?background:\s*var\(--employee-color-success-soft\);[\s\S]*?color:\s*var\(--employee-color-success-text\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-contract-card__signature-empty\s*\{[\s\S]*?stroke-dasharray:\s*1\.6 2\.2;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-record-card\s*\{[\s\S]*?grid-template-columns:\s*4\.4rem minmax\(0, 1fr\) auto;[\s\S]*?min-width:\s*0;[\s\S]*?min-height:\s*8\.8rem;[\s\S]*?padding:\s*1\.2rem;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-contract-card__title\s*\{[\s\S]*?overflow-wrap:\s*anywhere;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-contract-detail__actions\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*repeat\(auto-fit, minmax\(14rem, 1fr\)\);[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-contract-detail__actions \.employee-primary-button,\s*\.employee-contract-detail__actions \.employee-secondary-button\s*\{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-contract-preview-dialog\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?inset:\s*0;[\s\S]*?z-index:\s*80;[\s\S]*?\}/,
  )
  assert.match(
    appStyle,
    /\.employee-record-card--selected-lavender\.is-selected\s*\{[\s\S]*?background:\s*var\(--employee-color-tint-lavender\);[\s\S]*?\}/,
  )
  assert.equal(appStyle.includes('.employee-contracts-list'), false)
  assert.equal(appStyle.includes('.employee-contracts__header'), false)
  assert.equal(appStyle.includes('.employee-contracts__count'), false)
  assert.equal(appStyle.includes('.employee-contract-callout'), false)
  assert.equal(appStyle.includes('.employee-contract-document'), false)
  assert.equal(appStyle.includes('.employee-contract-callout--success'), false)
})
