import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculatePayrollTotals,
  compensationTypeKey,
  hasSensitivePayrollPath,
  latestPayroll,
  payrollStatusKey,
  payrollStatusTone,
  sortPayrolls,
} from '../src/payroll/payrollViewModel.ts'
import type { EmployeeCompensationType, PayrollResponse, PayrollStatus } from '../src/api/types.ts'

test('sortPayrolls keeps latest pay periods first with stable id fallback', () => {
  const payrolls = [
    payroll('a', '2026-03-01', '2026-03-31'),
    payroll('c', '2026-04-01', '2026-04-30'),
    payroll('b', '2026-04-01', '2026-04-30'),
  ]

  assert.deepEqual(sortPayrolls(payrolls).map((item) => item.payrollId), ['c', 'b', 'a'])
  assert.equal(latestPayroll(payrolls)?.payrollId, 'c')
})

test('payroll status and compensation helpers map backend values to i18n keys and tones', () => {
  assert.equal(payrollStatusKey('DRAFT'), 'payroll.status.draft')
  assert.equal(payrollStatusTone('DRAFT'), 'muted')
  assert.equal(payrollStatusTone('CONFIRMED'), 'planned')
  assert.equal(payrollStatusTone('PAID'), 'success')
  assert.equal(compensationTypeKey('MONTHLY'), 'payroll.compensation.monthly')
})

test('calculatePayrollTotals sums earnings and preserves net pay and deductions', () => {
  const result = calculatePayrollTotals(
    payroll('a', '2026-04-01', '2026-04-30', {
      basePay: 1000000,
      overtimePay: 100000,
      nightPay: 20000,
      holidayPay: 30000,
      weeklyHolidayPay: 50000,
      totalDeductions: 120000,
      netPay: 1080000,
    }),
  )

  assert.deepEqual(result, {
    earnings: 1200000,
    deductions: 120000,
    netPay: 1080000,
  })
})

test('hasSensitivePayrollPath flags any unexpected pdf path exposure', () => {
  assert.equal(hasSensitivePayrollPath(payroll('a', '2026-04-01', '2026-04-30')), false)
  assert.equal(
    hasSensitivePayrollPath(payroll('b', '2026-04-01', '2026-04-30', { pdfPath: '/internal/file.pdf' })),
    true,
  )
})

function payroll(
  payrollId: string,
  payPeriodStart: string,
  payPeriodEnd: string,
  overrides: Partial<PayrollResponse> = {},
): PayrollResponse {
  return {
    payrollId,
    employeeId: 'employee-1',
    contractIdSnapshot: 'contract-1',
    storeId: 'store-1',
    payPeriodStart,
    payPeriodEnd,
    compensationTypeSnapshot: overrides.compensationTypeSnapshot as EmployeeCompensationType ?? 'HOURLY',
    baseHourlyWageSnapshot: 10000,
    monthlySalarySnapshot: null,
    annualSalarySnapshot: null,
    basePay: 1000000,
    overtimePay: 0,
    nightPay: 0,
    holidayPay: 0,
    weeklyHolidayPay: 0,
    grossPay: 1000000,
    nationalPension: 45000,
    healthInsurance: 35450,
    longTermCare: 4542,
    employmentInsurance: 9000,
    incomeTax: 0,
    localIncomeTax: 0,
    totalDeductions: 93992,
    netPay: 906008,
    status: overrides.status as PayrollStatus ?? 'DRAFT',
    paidAt: null,
    pdfPath: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  }
}
