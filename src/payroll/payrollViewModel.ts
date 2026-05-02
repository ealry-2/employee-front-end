import type { EmployeeCompensationType, PayrollResponse, PayrollStatus } from '../api/types'

export type PayrollTone = 'planned' | 'success' | 'muted'

export interface PayrollTotals {
  earnings: number
  deductions: number
  netPay: number
}

export function sortPayrolls(payrolls: PayrollResponse[]): PayrollResponse[] {
  return [...payrolls].sort((left, right) => {
    const endCompare = right.payPeriodEnd.localeCompare(left.payPeriodEnd)
    if (endCompare !== 0) {
      return endCompare
    }
    const startCompare = right.payPeriodStart.localeCompare(left.payPeriodStart)
    if (startCompare !== 0) {
      return startCompare
    }
    return right.payrollId.localeCompare(left.payrollId)
  })
}

export function payrollStatusKey(status: PayrollStatus): string {
  return `payroll.status.${status.toLowerCase()}`
}

export function payrollStatusTone(status: PayrollStatus): PayrollTone {
  if (status === 'PAID') {
    return 'success'
  }
  if (status === 'CONFIRMED') {
    return 'planned'
  }
  return 'muted'
}

export function compensationTypeKey(type: EmployeeCompensationType | null): string {
  return `payroll.compensation.${(type ?? 'HOURLY').toLowerCase()}`
}

export function calculatePayrollTotals(payroll: PayrollResponse): PayrollTotals {
  return {
    earnings:
      money(payroll.basePay) +
      money(payroll.overtimePay) +
      money(payroll.nightPay) +
      money(payroll.holidayPay) +
      money(payroll.weeklyHolidayPay),
    deductions: money(payroll.totalDeductions),
    netPay: money(payroll.netPay),
  }
}

export function latestPayroll(payrolls: PayrollResponse[]): PayrollResponse | null {
  return sortPayrolls(payrolls)[0] ?? null
}

export function hasSensitivePayrollPath(payroll: PayrollResponse): boolean {
  return Boolean(payroll.pdfPath)
}

function money(value: number | null): number {
  return value ?? 0
}
