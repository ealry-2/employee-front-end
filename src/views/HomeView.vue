<template>
  <main class="employee-shell">
    <header class="employee-topbar">
      <div>
        <p class="employee-topbar__brand">{{ t('app.brand') }}</p>
        <h1 class="employee-topbar__title">{{ t('home.title') }}</h1>
      </div>
      <button class="employee-icon-button" type="button" :aria-label="t('app.logout')" @click="logout">
        <span aria-hidden="true">↗</span>
      </button>
    </header>

    <section v-if="loading" class="employee-state" aria-live="polite">
      <p>{{ t('app.loading') }}</p>
    </section>

    <section v-else-if="errorMessage" class="employee-state employee-state--error" role="alert">
      <h2>{{ t('home.errorTitle') }}</h2>
      <p>{{ errorMessage }}</p>
      <button class="employee-secondary-button" type="button" @click="load">{{ t('app.retry') }}</button>
    </section>

    <template v-else-if="bootstrap">
      <section class="employee-hero">
        <p class="employee-hero__eyebrow">{{ t('home.greeting', { name: bootstrap.user.name }) }}</p>
        <h2 class="employee-hero__store">
          {{ selectedStore ? selectedStore.name : t('home.emptyTitle') }}
        </h2>
        <p class="employee-hero__copy">
          {{ selectedStore ? formatOptionalText(selectedStore.address, t('home.store')) : t('home.emptyDescription') }}
        </p>
      </section>

      <section v-if="bootstrap.hasStores" class="employee-section" aria-labelledby="store-heading">
        <div class="employee-section__header">
          <h2 id="store-heading">{{ t('home.stores') }}</h2>
          <span>{{ bootstrap.stores.length }}</span>
        </div>
        <div class="employee-store-list">
          <button
            v-for="store in bootstrap.stores"
            :key="store.storeId"
            class="employee-store-card"
            :class="{ 'is-selected': store.storeId === selectedStore?.storeId }"
            type="button"
            @click="selectedStore = store"
          >
            <span class="employee-store-card__name">{{ store.name }}</span>
            <span class="employee-store-card__meta">{{ formatOptionalText(store.role, t('home.role')) }}</span>
          </button>
        </div>
      </section>

      <section v-if="selectedStore" class="employee-section" aria-labelledby="profile-heading">
        <div class="employee-section__header">
          <h2 id="profile-heading">{{ t('home.profile') }}</h2>
        </div>
        <dl class="employee-profile-grid">
          <div>
            <dt>{{ t('home.role') }}</dt>
            <dd>{{ formatOptionalText(selectedStore.role, '-') }}</dd>
          </div>
          <div>
            <dt>{{ t('home.hireDate') }}</dt>
            <dd>{{ formatOptionalText(selectedStore.hireDate, '-') }}</dd>
          </div>
          <div>
            <dt>{{ t('home.phone') }}</dt>
            <dd>{{ formatOptionalText(selectedStore.contactPhone ?? bootstrap.user.phone, '-') }}</dd>
          </div>
          <div>
            <dt>{{ t('home.email') }}</dt>
            <dd>{{ formatOptionalText(selectedStore.contactEmail ?? bootstrap.user.email, '-') }}</dd>
          </div>
        </dl>
      </section>

      <section class="employee-next-panel">
        <p>{{ t('home.upcomingReady') }}</p>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { isUnauthorized } from '@/api/client'
import { loadAppBootstrap } from '@/api/auth'
import type { AppAuthBootstrapResponse, AppStoreMembershipSummary } from '@/api/types'
import { clearTokens } from '@/session/tokenStorage'
import { formatOptionalText, selectInitialStore } from '@/session/bootstrapState'

const { t } = useI18n()
const router = useRouter()

const bootstrap = ref<AppAuthBootstrapResponse | null>(null)
const selectedStore = ref<AppStoreMembershipSummary | null>(null)
const loading = ref(true)
const errorMessage = ref('')

onMounted(load)

async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await loadAppBootstrap()
    bootstrap.value = response
    selectedStore.value = selectInitialStore(response)
  } catch (error) {
    if (isUnauthorized(error)) {
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

async function logout(): Promise<void> {
  clearTokens()
  await router.replace({ name: 'login' })
}
</script>
