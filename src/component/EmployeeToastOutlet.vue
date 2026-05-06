<template>
  <Teleport to="body">
    <section
      v-if="toasts.length > 0"
      class="employee-toast-region"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup name="employee-toast">
        <article
          v-for="toast in toasts"
          :key="toast.id"
          class="employee-toast"
          :class="`employee-toast--${toast.tone}`"
        >
          <span>{{ toast.message }}</span>
          <button
            class="employee-toast__close"
            type="button"
            :aria-label="t('app.close')"
            @click="dismissToast(toast.id)"
          >
            <span aria-hidden="true">×</span>
          </button>
        </article>
      </TransitionGroup>
    </section>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useEmployeeToasts } from '@/app/toast'

const { t } = useI18n()
const { toasts, dismissToast } = useEmployeeToasts()
</script>
