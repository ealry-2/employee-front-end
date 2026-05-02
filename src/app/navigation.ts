export const employeeNavItems = [
  {
    routeName: 'home',
    labelKey: 'nav.home',
    shortLabelKey: 'nav.homeShort',
  },
  {
    routeName: 'schedule',
    labelKey: 'nav.schedule',
    shortLabelKey: 'nav.scheduleShort',
  },
  {
    routeName: 'attendance',
    labelKey: 'nav.attendance',
    shortLabelKey: 'nav.attendanceShort',
  },
  {
    routeName: 'payroll',
    labelKey: 'nav.payroll',
    shortLabelKey: 'nav.payrollShort',
  },
  {
    routeName: 'contracts',
    labelKey: 'nav.contracts',
    shortLabelKey: 'nav.contractsShort',
  },
] as const

export type EmployeeNavRouteName = (typeof employeeNavItems)[number]['routeName']

export function isEmployeeNavRouteName(value: unknown): value is EmployeeNavRouteName {
  return employeeNavItems.some((item) => item.routeName === value)
}
