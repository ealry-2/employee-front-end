<template>
  <main class="employee-shell">
    <header class="employee-topbar">
      <div>
        <p class="employee-topbar__brand">{{ t('app.brand') }}</p>
        <h1 class="employee-topbar__title">{{ pageTitle }}</h1>
      </div>
      <button
        class="employee-icon-button"
        type="button"
        :aria-label="t('app.logout')"
        @click="logout"
      >
        <span aria-hidden="true">↗</span>
      </button>
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
      <section class="employee-store-strip" aria-labelledby="shell-store-heading">
        <div>
          <p id="shell-store-heading" class="employee-store-strip__label">
            {{ t('home.store') }}
          </p>
          <p class="employee-store-strip__value">
            {{ selectedStore ? selectedStore.name : t('home.emptyTitle') }}
          </p>
        </div>
        <select
          v-if="bootstrap.hasStores"
          class="employee-store-select"
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
      </section>

      <RouterView />

      <nav class="employee-tabbar" :aria-label="t('nav.primary')">
        <RouterLink
          v-for="item in employeeNavItems"
          :key="item.routeName"
          class="employee-tabbar__item"
          :to="{ name: item.routeName }"
        >
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
import { employeeNavItems, isEmployeeNavRouteName } from '@/app/navigation'
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
