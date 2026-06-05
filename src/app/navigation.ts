export const employeeNavItems = [
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
  {
    routeName: 'notifications',
    labelKey: 'nav.notifications',
    shortLabelKey: 'nav.notificationsShort',
  },
  {
    routeName: 'settings',
    labelKey: 'nav.settings',
    shortLabelKey: 'nav.settingsShort',
  },
] as const

export type EmployeeNavRouteName = (typeof employeeNavItems)[number]['routeName']

export const employeeTabItems = employeeNavItems.filter(
  (item) => item.routeName !== 'notifications' && item.routeName !== 'settings',
)

export function isEmployeeNavRouteName(value: unknown): value is EmployeeNavRouteName {
  return employeeNavItems.some((item) => item.routeName === value)
}
