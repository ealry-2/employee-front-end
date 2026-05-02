<template>
  <section class="employee-hero">
    <p class="employee-hero__eyebrow">
      {{ t('home.greeting', { name: bootstrap?.user.name ?? '' }) }}
    </p>
    <h2 class="employee-hero__store">
      {{ selectedStore ? selectedStore.name : t('home.emptyTitle') }}
    </h2>
    <p class="employee-hero__copy">
      {{
        selectedStore
          ? formatOptionalText(selectedStore.address, t('home.store'))
          : t('home.emptyDescription')
      }}
    </p>
  </section>

  <section v-if="bootstrap?.hasStores" class="employee-section" aria-labelledby="store-heading">
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
        @click="selectStore(store)"
      >
        <span class="employee-store-card__name">{{ store.name }}</span>
        <span class="employee-store-card__meta">
          {{ formatOptionalText(store.role, t('home.role')) }}
        </span>
      </button>
    </div>
  </section>

  <section v-if="selectedStore && bootstrap" class="employee-section" aria-labelledby="profile-heading">
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
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useEmployeeAppContext } from '@/app/employeeAppContext'
import { formatOptionalText } from '@/session/bootstrapState'

const { t } = useI18n()
const { bootstrap, selectedStore, selectStore } = useEmployeeAppContext()
</script>
