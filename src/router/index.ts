import { createRouter, createWebHistory } from 'vue-router'
import { hasAccessToken } from '@/session/tokenStorage'
import EmployeeAppShell from '@/component/EmployeeAppShell.vue'
import AttendanceView from '@/views/AttendanceView.vue'
import ContractsView from '@/views/ContractsView.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import NotificationsView from '@/views/NotificationsView.vue'
import PayrollView from '@/views/PayrollView.vue'
import ScheduleView from '@/views/ScheduleView.vue'

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
          component: HomeView,
        },
        {
          path: 'schedule',
          name: 'schedule',
          component: ScheduleView,
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
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
  ],
})

router.beforeEach((to) => {
  if (to.name !== 'login' && !hasAccessToken()) {
    return { name: 'login' }
  }
  if (to.name === 'login' && hasAccessToken()) {
    return { name: 'home' }
  }
  return true
})
