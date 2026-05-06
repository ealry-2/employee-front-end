import { inject } from 'vue'
import type { InjectionKey, Ref } from 'vue'
import type { AppAuthBootstrapResponse, AppStoreMembershipSummary } from '@/api/types'

export interface EmployeeAppContext {
  bootstrap: Ref<AppAuthBootstrapResponse | null>
  selectedStore: Ref<AppStoreMembershipSummary | null>
  unreadNotificationCount: Ref<number>
  selectStore: (store: AppStoreMembershipSummary) => void
  refreshUnreadNotifications: () => Promise<void>
  reload: () => Promise<void>
  logout: () => Promise<void>
}

export const employeeAppContextKey: InjectionKey<EmployeeAppContext> =
  Symbol('employeeAppContext')

export function useEmployeeAppContext(): EmployeeAppContext {
  const context = inject(employeeAppContextKey)
  if (!context) {
    throw new Error('Employee app context is not available')
  }
  return context
}
