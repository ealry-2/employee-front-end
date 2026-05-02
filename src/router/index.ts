import { createRouter, createWebHistory } from 'vue-router'
import { hasAccessToken } from '@/session/tokenStorage'
import EmployeeAppShell from '@/component/EmployeeAppShell.vue'
import FeaturePlaceholderView from '@/views/FeaturePlaceholderView.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'

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
          component: FeaturePlaceholderView,
          props: { featureKey: 'schedule' },
        },
        {
          path: 'attendance',
          name: 'attendance',
          component: FeaturePlaceholderView,
          props: { featureKey: 'attendance' },
        },
        {
          path: 'payroll',
          name: 'payroll',
          component: FeaturePlaceholderView,
          props: { featureKey: 'payroll' },
        },
        {
          path: 'contracts',
          name: 'contracts',
          component: FeaturePlaceholderView,
          props: { featureKey: 'contracts' },
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
