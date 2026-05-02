export function isEmployeeDemoModeEnabled(): boolean {
  return Boolean(import.meta.env?.DEV) && import.meta.env.VITE_EMPLOYEE_APP_DEMO === 'true'
}
