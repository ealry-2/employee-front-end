<template>
  <main class="employee-shell">
    <header class="employee-topbar">
      <div class="employee-topbar__branch">
        <RouterLink
          class="employee-topbar__brand-link"
          :to="{ name: 'schedule' }"
          :aria-label="t('app.brand')"
          :title="t('app.brand')"
        >
          <img
            class="employee-topbar__brand-logo"
            src="/favicon.png"
            alt=""
            aria-hidden="true"
          />
        </RouterLink>
        <h1 class="employee-sr-only">{{ pageTitle }}</h1>
      </div>
      <div class="employee-topbar__actions">
        <RouterLink
          class="employee-topbar__icon-link"
          :to="{ name: 'notifications' }"
          :aria-label="notificationLinkLabel"
          :title="notificationLinkLabel"
        >
          <svg
            class="employee-topbar__svg-icon employee-bell-icon"
            viewBox="0 0 32 32"
            focusable="false"
            aria-hidden="true"
          >
            <path
              class="employee-topbar__icon-stroke"
              d="M8.6 14.6c0-4.4 3-7.5 7.4-7.5s7.4 3.1 7.4 7.5v4.1l2.3 3.4c.5.8.1 1.9-.9 1.9H7.2c-1 0-1.4-1.1-.9-1.9l2.3-3.4v-4.1Z"
            />
            <path
              class="employee-topbar__icon-stroke"
              d="M12.8 24.3c.5 1.9 1.6 2.9 3.2 2.9s2.7-1 3.2-2.9"
            />
          </svg>
          <span
            v-if="unreadNotificationCount > 0"
            class="employee-topbar__notification-badge"
            aria-hidden="true"
          />
        </RouterLink>
        <RouterLink
          class="employee-topbar__icon-link"
          :to="{ name: 'settings' }"
          :aria-label="t('nav.settings')"
          :title="t('nav.settings')"
        >
          <svg
            class="employee-topbar__svg-icon employee-settings-icon"
            viewBox="0 0 32 32"
            focusable="false"
            aria-hidden="true"
          >
            <circle class="employee-topbar__icon-stroke" cx="16" cy="16" r="3.5" />
            <path
              class="employee-topbar__icon-stroke"
              d="M18.8 5.7 19.6 8c.2.5.6.9 1.1 1.1l2.3 1 1.9-1.1 2.1 3.6-1.9 1.3c-.4.3-.6.8-.6 1.3v1.6c0 .5.2 1 .6 1.3l1.9 1.3-2.1 3.6-1.9-1.1-2.3 1c-.5.2-.9.6-1.1 1.1l-.8 2.3h-5.6l-.8-2.3c-.2-.5-.6-.9-1.1-1.1l-2.3-1-1.9 1.1-2.1-3.6 1.9-1.3c.4-.3.6-.8.6-1.3v-1.6c0-.5-.2-1-.6-1.3l-1.9-1.3 2.1-3.6 1.9 1.1 2.3-1c.5-.2.9-.6 1.1-1.1l.8-2.3h5.6Z"
            />
          </svg>
        </RouterLink>
      </div>
    </header>

    <EmployeeStatePanel
      v-if="loading"
      tone="loading"
      :message="t('app.loading')"
    />

    <EmployeeStatePanel
      v-else-if="errorMessage"
      tone="error"
      :title="t('home.errorTitle')"
      :message="errorMessage"
      :action-label="t('app.retry')"
      @action="load"
    />

    <template v-else-if="bootstrap">
      <RouterView />
      <EmployeeToastOutlet />

      <nav class="employee-tabbar" :aria-label="t('nav.primary')">
        <RouterLink
          class="employee-tabbar__qr-action"
          :to="{ name: 'attendance', query: { qr: '1' } }"
          :aria-label="t('attendance.qrScan')"
          :title="t('attendance.qrScan')"
        >
          <svg
            class="employee-tabbar__qr-icon"
            viewBox="0 0 32 32"
            focusable="false"
            aria-hidden="true"
          >
            <path class="employee-tabbar__qr-icon-stroke" d="M7.2 12V9.2c0-1.1.9-2 2-2h4.6M18.2 7.2h4.6c1.1 0 2 .9 2 2V12M7.2 20v2.8c0 1.1.9 2 2 2h4.6M18.2 24.8h4.6c1.1 0 2-.9 2-2V20" />
            <path class="employee-tabbar__qr-icon-scanline" d="M6.4 16h19.2" />
          </svg>
        </RouterLink>
        <RouterLink
          v-for="item in employeeTabItems"
          :key="item.routeName"
          class="employee-tabbar__item"
          :class="[
            `employee-tabbar__item--${item.routeName}`,
            { 'is-active': route.name === item.routeName },
          ]"
          :to="{ name: item.routeName }"
        >
          <svg
            class="employee-tabbar__icon"
            :class="`employee-tabbar__icon--${item.routeName}`"
            viewBox="0 0 28 28"
            focusable="false"
            aria-hidden="true"
          >
            <g v-if="item.routeName === 'schedule'">
              <rect
                class="employee-tabbar__icon-stroke"
                x="5.4"
                y="6.5"
                width="17.2"
                height="16.2"
                rx="3"
              />
              <path
                class="employee-tabbar__icon-stroke"
                d="M9.2 4.2v4.8M18.8 4.2v4.8M5.8 11.3h16.4M9.5 15.2h2.2M15.6 15.2h2.2M9.5 19h2.2M15.6 19h2.2"
              />
            </g>
            <g v-else-if="item.routeName === 'attendance'">
              <circle class="employee-tabbar__icon-stroke" cx="14" cy="14" r="8.8" />
              <path class="employee-tabbar__icon-stroke" d="M14 8.9v5.4l4.2 2.5" />
            </g>
            <g v-else-if="item.routeName === 'payroll'">
              <path
                class="employee-tabbar__icon-fill"
                d="M7 4.9h14v18.2l-2.1-1.4-2.1 1.4-2.1-1.4-2.1 1.4-2.1-1.4L8.4 23 7 22.1V4.9Z"
              />
              <path class="employee-tabbar__icon-cutout" d="M10.2 9.1h7.6v2.1h-7.6zM10.2 13.1h7.6v2.1h-7.6z" />
            </g>
            <g v-else-if="item.routeName === 'contracts'">
              <path class="employee-tabbar__icon-stroke" d="M8 4.8h8.6L21 9.2v14H8v-18.4Z" />
              <path class="employee-tabbar__icon-stroke" d="M16.4 5.1v4.4h4.3M11 13.4h6.2M11 17.2h6.2M11 21h4.2" />
            </g>
          </svg>
          <span>{{ t(item.shortLabelKey) }}</span>
        </RouterLink>
      </nav>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { employeeAppContextKey } from '@/app/employeeAppContext'
import { employeeTabItems, isEmployeeNavRouteName } from '@/app/navigation'
import { isUnauthorized } from '@/api/client'
import { loadAppBootstrap, logoutSession } from '@/api/auth'
import { loadMyNotifications } from '@/api/notifications'
import type { AppAuthBootstrapResponse, AppStoreMembershipSummary } from '@/api/types'
import { clearTokens } from '@/session/tokenStorage'
import {
  clearSelectedStoreId,
  getPersistedSelectedStoreId,
  saveSelectedStoreId,
  selectInitialStore,
} from '@/session/bootstrapState'
import EmployeeStatePanel from './EmployeeStatePanel.vue'
import EmployeeToastOutlet from './EmployeeToastOutlet.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const bootstrap = ref<AppAuthBootstrapResponse | null>(null)
const selectedStore = ref<AppStoreMembershipSummary | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const unreadNotificationCount = ref(0)
let unreadNotificationRequestId = 0

const pageTitle = computed(() => {
  const routeName = route.name
  if (isEmployeeNavRouteName(routeName)) {
    return t(`screen.${routeName}.title`)
  }
  return t('screen.schedule.title')
})
const notificationLinkLabel = computed(() =>
  unreadNotificationCount.value > 0
    ? `${t('nav.notifications')} · ${t('notifications.unreadCount', { count: unreadNotificationCount.value })}`
    : t('nav.notifications'),
)

provide(employeeAppContextKey, {
  bootstrap,
  selectedStore,
  unreadNotificationCount,
  selectStore,
  refreshUnreadNotifications,
  reload: load,
  logout,
})

onMounted(load)

watch(
  () => selectedStore.value?.storeId,
  () => {
    void refreshUnreadNotifications()
  },
)

async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await loadAppBootstrap()
    bootstrap.value = response
    selectedStore.value = selectInitialStore(
      response,
      getPersistedSelectedStoreId(response.user.userId),
    )
  } catch (error) {
    if (isUnauthorized(error)) {
      clearCurrentSelectedStoreId()
      clearTokens()
      errorMessage.value = t('home.sessionExpired')
      await router.replace({ name: 'login' })
      return
    }
    errorMessage.value = t('home.errorTitle')
  } finally {
    loading.value = false
  }
}

function selectStore(store: AppStoreMembershipSummary): void {
  selectedStore.value = store
  if (bootstrap.value) {
    saveSelectedStoreId(bootstrap.value.user.userId, store.storeId)
  }
}

async function refreshUnreadNotifications(): Promise<void> {
  const storeId = selectedStore.value?.storeId
  const requestId = ++unreadNotificationRequestId

  if (!storeId) {
    unreadNotificationCount.value = 0
    return
  }

  try {
    const response = await loadMyNotifications({
      storeId,
      unreadOnly: true,
      page: 0,
      size: 1,
    })
    if (requestId === unreadNotificationRequestId) {
      unreadNotificationCount.value = response.unreadCount
    }
  } catch (error) {
    if (requestId !== unreadNotificationRequestId) {
      return
    }
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    unreadNotificationCount.value = 0
  }
}

async function logout(): Promise<void> {
  try {
    await logoutSession()
  } finally {
    clearCurrentSelectedStoreId()
    clearTokens()
    await router.replace({ name: 'login' })
  }
}

function clearCurrentSelectedStoreId(): void {
  const userId = bootstrap.value?.user.userId
  if (userId) {
    clearSelectedStoreId(userId)
  }
}
</script>
