<template>
  <main class="employee-auth">
    <section class="employee-auth__panel" aria-labelledby="reset-password-title">
      <p class="employee-auth__brand">{{ t('app.brand') }}</p>
      <h1 id="reset-password-title" class="employee-auth__title">
        {{ t('resetPassword.title') }}
      </h1>
      <p class="employee-auth__subtitle">{{ t('resetPassword.subtitle') }}</p>

      <EmployeeStatePanel
        v-if="validating"
        tone="loading"
        :message="t('resetPassword.validating')"
      />

      <form v-else class="employee-auth__form" @submit.prevent="submit">
        <label class="employee-field">
          <span class="employee-field__label">{{ t('resetPassword.email') }}</span>
          <input
            v-model="email"
            class="employee-field__control"
            type="email"
            autocomplete="email"
            readonly
          />
        </label>

        <label class="employee-field">
          <span class="employee-field__label">{{ t('resetPassword.newPassword') }}</span>
          <input
            v-model="newPassword"
            class="employee-field__control"
            type="password"
            autocomplete="new-password"
            required
          />
        </label>

        <label class="employee-field">
          <span class="employee-field__label">{{ t('resetPassword.confirmPassword') }}</span>
          <input
            v-model="confirmPassword"
            class="employee-field__control"
            type="password"
            autocomplete="new-password"
            required
          />
        </label>

        <p v-if="errorMessage" class="employee-auth__error" role="alert">{{ errorMessage }}</p>
        <p v-if="successMessage" class="employee-auth__success" role="status">{{ successMessage }}</p>

        <button
          class="employee-primary-button"
          type="submit"
          :disabled="submitting || !token || !email"
        >
          {{
            submitting
              ? t('resetPassword.submitting')
              : t('resetPassword.submit')
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
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { resetPassword, validateResetToken } from '@/api/auth'
import { resolveApiMessage } from '@/api/client'
import EmployeeStatePanel from '@/component/EmployeeStatePanel.vue'

const { t } = useI18n()
const route = useRoute()

const token = typeof route.query.token === 'string' ? route.query.token : ''

const email = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const validating = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  void validate()
})

async function validate(): Promise<void> {
  if (!token) {
    errorMessage.value = t('resetPassword.invalidLink')
    return
  }

  validating.value = true
  errorMessage.value = ''

  try {
    const response = await validateResetToken(token)
    email.value = response.email
  } catch (error) {
    errorMessage.value = resolveApiMessage(error, t('resetPassword.invalidLink'))
  } finally {
    validating.value = false
  }
}

async function submit(): Promise<void> {
  if (submitting.value) {
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = t('resetPassword.passwordMismatch')
    return
  }

  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await resetPassword({
      token,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    })
    successMessage.value = response.message || t('resetPassword.success')
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    errorMessage.value = resolveApiMessage(error, t('resetPassword.failed'))
  } finally {
    submitting.value = false
  }
}
</script>
