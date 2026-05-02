import { createRouter, createWebHistory } from 'vue-router'
import { hasAccessToken } from '@/session/tokenStorage'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
