<template>
  <section class="employee-feature-panel" aria-labelledby="feature-title">
    <p class="employee-feature-panel__eyebrow">{{ t('feature.eyebrow') }}</p>
    <h2 id="feature-title">{{ title }}</h2>
    <p>{{ description }}</p>
    <dl class="employee-feature-panel__context">
      <div>
        <dt>{{ t('home.store') }}</dt>
        <dd>{{ selectedStore ? selectedStore.name : t('home.emptyTitle') }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmployeeAppContext } from '@/app/employeeAppContext'

const props = defineProps<{
  featureKey: 'schedule' | 'attendance' | 'payroll' | 'contracts'
}>()

const { t } = useI18n()
const { selectedStore } = useEmployeeAppContext()

const title = computed(() => t(`screen.${props.featureKey}.title`))
const description = computed(() => t(`feature.${props.featureKey}.description`))
</script>
