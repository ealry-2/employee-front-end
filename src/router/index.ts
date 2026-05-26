import { createRouter, createWebHistory } from 'vue-router'
import { isEmployeeDemoModeEnabled } from '@/demo/employeeDemoMode'
import { hasAccessToken } from '@/session/tokenStorage'
import EmployeeAppShell from '@/component/EmployeeAppShell.vue'
import AttendanceView from '@/views/AttendanceView.vue'
import ContractsView from '@/views/ContractsView.vue'
import EmailVerificationView from '@/views/EmailVerificationView.vue'
import EmployeeInvitationView from '@/views/EmployeeInvitationView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import LoginView from '@/views/LoginView.vue'
import NotificationsView from '@/views/NotificationsView.vue'
import PayrollView from '@/views/PayrollView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import ScheduleView from '@/views/ScheduleView.vue'
import SettingsView from '@/views/HomeView.vue'

const PUBLIC_ROUTE_NAMES = new Set([
  'login',
  'verify-email',
  'forgot-password',
  'reset-password',
  'employee-invitation',
])

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: EmployeeAppShell,
      children: [
        {
          path: '',
          name: 'home',
          component: ScheduleView,
        },
        {
          path: 'schedule',
          redirect: { name: 'home' },
        },
        {
          path: 'attendance',
          name: 'attendance',
          component: AttendanceView,
        },
        {
          path: 'payroll',
          name: 'payroll',
          component: PayrollView,
        },
        {
          path: 'contracts',
          name: 'contracts',
          component: ContractsView,
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: NotificationsView,
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsView,
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: EmailVerificationView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
    },
    {
      path: '/employee-invitations/:token',
      name: 'employee-invitation',
      component: EmployeeInvitationView,
    },
  ],
})

router.beforeEach((to) => {
  const canUseEmployeeApp = isEmployeeDemoModeEnabled() || hasAccessToken()
  const isPublicRoute = typeof to.name === 'string' && PUBLIC_ROUTE_NAMES.has(to.name)

  if (!isPublicRoute && !canUseEmployeeApp) {
    return { name: 'login' }
  }
  if (to.name === 'login' && canUseEmployeeApp) {
    return { name: 'home' }
  }
  return true
})
