<template>
  <main class="employee-shell">
    <header class="employee-topbar">
      <div class="employee-topbar__branch">
        <RouterLink
          class="employee-topbar__brand-link"
          :to="{ name: 'home' }"
          :aria-label="t('app.brand')"
          :title="t('app.brand')"
        >
          <svg
            class="employee-topbar__brand-logo"
            viewBox="0 0 64 24"
            focusable="false"
            aria-hidden="true"
          >
            <path class="employee-topbar__brand-mark" d="M5 10.5h3.8v9.2H5v-9.2Z" />
            <path class="employee-topbar__brand-mark" d="M10.8 7.3h3.8v12.4h-3.8V7.3Z" />
            <path class="employee-topbar__brand-mark" d="M16.7 5h3.8v14.7h-3.8V5Z" />
            <path class="employee-topbar__brand-arrow" d="M6.9 4.2 2.9 9h2.4v5.8c3.7-1.5 5.8-4.5 5.8-8.8V9h2L6.9 4.2Z" />
            <path class="employee-topbar__brand-text" d="M25 8.1h3.5v11.6H25V8.1Z" />
            <path class="employee-topbar__brand-text" d="M31.3 5h3.5v14.7h-3.5V5Z" />
            <path class="employee-topbar__brand-text" d="M43.2 7.9c3.7 0 6.2 2.4 6.2 5.9 0 3.6-2.5 6.1-6.2 6.1s-6.2-2.5-6.2-6.1c0-3.5 2.5-5.9 6.2-5.9Zm0 3.1c-1.6 0-2.7 1.1-2.7 2.8 0 1.8 1.1 2.9 2.7 2.9s2.7-1.1 2.7-2.9c0-1.7-1.1-2.8-2.7-2.8Z" />
            <path class="employee-topbar__brand-text" d="M57.1 7.9c1.4 0 2.5.5 3.2 1.4V8.1H64v10.6c0 3.7-2.5 5.8-6.5 5.8-2.2 0-4.1-.6-5.5-1.7l1.4-2.8c1.1.8 2.4 1.2 3.8 1.2 2 0 3-1 3-2.7v-.4c-.8.8-1.8 1.2-3.1 1.2-3.3 0-5.7-2.3-5.7-5.7 0-3.4 2.4-5.7 5.7-5.7Zm.8 3.1c-1.7 0-2.8 1.1-2.8 2.7 0 1.7 1.1 2.7 2.8 2.7 1.6 0 2.7-1 2.7-2.7 0-1.6-1.1-2.7-2.7-2.7Z" />
          </svg>
        </RouterLink>
        <label class="employee-sr-only" for="employee-store-select">
          {{ t('home.stores') }}
        </label>
        <span v-if="bootstrap?.hasStores" class="employee-branch-picker">
          <select
            id="employee-store-select"
            class="employee-branch-picker__select"
            :value="selectedStore?.storeId ?? ''"
            :aria-label="t('home.stores')"
            @change="handleStoreSelect"
          >
            <option
              v-for="store in bootstrap.stores"
              :key="store.storeId"
              :value="store.storeId"
            >
              {{ store.name }}
            </option>
          </select>
          <span class="employee-branch-picker__chevron" aria-hidden="true">⌄</span>
        </span>
        <p v-else class="employee-branch-picker__fallback">
          {{ selectedStore ? selectedStore.name : t('home.emptyTitle') }}
        </p>
        <h1 class="employee-sr-only">{{ pageTitle }}</h1>
      </div>
      <div class="employee-topbar__actions">
        <RouterLink
          class="employee-topbar__icon-link"
          :to="{ name: 'notifications' }"
          :aria-label="t('nav.notifications')"
          :title="t('nav.notifications')"
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
        </RouterLink>
        <button
          class="employee-topbar__icon-button"
          type="button"
          :aria-label="t('app.logout')"
          :title="t('app.logout')"
          @click="logout"
        >
          <span class="employee-logout-icon" aria-hidden="true"></span>
        </button>
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

      <nav class="employee-tabbar" :aria-label="t('nav.primary')">
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
            <g v-if="item.routeName === 'home'">
              <path
                class="employee-tabbar__icon-fill"
                d="M4.4 12.8 14 5.1l9.6 7.7v10.6h-6.2v-6.8h-6.8v6.8H4.4V12.8Z"
              />
            </g>
            <g v-else-if="item.routeName === 'schedule'">
              <rect
                class="employee-tabbar__icon-stroke"
                x="6.1"
                y="6.9"
                width="15.8"
                height="17"
                rx="2.2"
              />
              <path class="employee-tabbar__icon-stroke" d="M9.4 4.6v4.6M18.6 4.6v4.6M6.7 11.3h14.6" />
              <path class="employee-tabbar__icon-dot" d="M10 15.2h.1M14 15.2h.1M18 15.2h.1M10 19.1h.1M14 19.1h.1M18 19.1h.1" />
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
import { computed, onMounted, provide, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { employeeAppContextKey } from '@/app/employeeAppContext'
import { employeeTabItems, isEmployeeNavRouteName } from '@/app/navigation'
import { isUnauthorized } from '@/api/client'
import { loadAppBootstrap, logoutSession } from '@/api/auth'
import type { AppAuthBootstrapResponse, AppStoreMembershipSummary } from '@/api/types'
import { clearTokens } from '@/session/tokenStorage'
import {
  clearSelectedStoreId,
  getPersistedSelectedStoreId,
  saveSelectedStoreId,
  selectInitialStore,
} from '@/session/bootstrapState'
import EmployeeStatePanel from './EmployeeStatePanel.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const bootstrap = ref<AppAuthBootstrapResponse | null>(null)
const selectedStore = ref<AppStoreMembershipSummary | null>(null)
const loading = ref(true)
const errorMessage = ref('')

const pageTitle = computed(() => {
  const routeName = route.name
  if (isEmployeeNavRouteName(routeName)) {
    return t(`screen.${routeName}.title`)
  }
  return t('home.title')
})

provide(employeeAppContextKey, {
  bootstrap,
  selectedStore,
  selectStore,
  reload: load,
  logout,
})

onMounted(load)

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

function handleStoreSelect(event: Event): void {
  const storeId = (event.target as HTMLSelectElement).value
  const store = bootstrap.value?.stores.find((candidate) => candidate.storeId === storeId)
  if (store) {
    selectStore(store)
  }
}

function selectStore(store: AppStoreMembershipSummary): void {
  selectedStore.value = store
  if (bootstrap.value) {
    saveSelectedStoreId(bootstrap.value.user.userId, store.storeId)
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
