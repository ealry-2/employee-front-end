<template>
  <main class="employee-auth">
    <section class="employee-auth__panel" aria-labelledby="forgot-password-title">
      <p class="employee-auth__brand">{{ t('app.brand') }}</p>
      <h1 id="forgot-password-title" class="employee-auth__title">
        {{ t('forgotPassword.title') }}
      </h1>
      <p class="employee-auth__subtitle">{{ t('forgotPassword.subtitle') }}</p>

      <form class="employee-auth__form" @submit.prevent="submit">
        <label class="employee-field">
          <span class="employee-field__label">{{ t('forgotPassword.email') }}</span>
          <input
            v-model.trim="email"
            class="employee-field__control"
            type="email"
            autocomplete="email"
            required
          />
        </label>

        <p v-if="errorMessage" class="employee-auth__error" role="alert">{{ errorMessage }}</p>
        <p v-if="successMessage" class="employee-auth__success" role="status">{{ successMessage }}</p>

        <button class="employee-primary-button" type="submit" :disabled="submitting">
          {{
            submitting
              ? t('forgotPassword.submitting')
              : t('forgotPassword.submit')
          }}
        </button>
      </form>

      <div class="employee-auth__links">
        <RouterLink to="/login">{{ t('authLinks.backToLogin') }}</RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { forgotPassword } from '@/api/auth'
import { resolveApiMessage } from '@/api/client'

const { t } = useI18n()

const email = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function submit(): Promise<void> {
  if (submitting.value) {
    return
  }

  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await forgotPassword({ email: email.value })
    successMessage.value = response.message || t('forgotPassword.success')
  } catch (error) {
    errorMessage.value = resolveApiMessage(error, t('forgotPassword.failed'))
  } finally {
    submitting.value = false
  }
}
</script>
