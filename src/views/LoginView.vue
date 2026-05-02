<template>
  <main class="employee-auth">
    <section class="employee-auth__panel" aria-labelledby="login-title">
      <p class="employee-auth__brand">{{ t('app.brand') }}</p>
      <h1 id="login-title" class="employee-auth__title">{{ t('login.title') }}</h1>
      <p class="employee-auth__subtitle">{{ t('login.subtitle') }}</p>

      <form class="employee-auth__form" @submit.prevent="submit">
        <label class="employee-field">
          <span class="employee-field__label">{{ t('login.email') }}</span>
          <input
            v-model.trim="email"
            class="employee-field__control"
            type="email"
            autocomplete="email"
            required
          />
        </label>

        <label class="employee-field">
          <span class="employee-field__label">{{ t('login.password') }}</span>
          <input
            v-model="password"
            class="employee-field__control"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>

        <label class="employee-check">
          <input v-model="remember" type="checkbox" />
          <span>{{ t('login.remember') }}</span>
        </label>

        <p v-if="errorMessage" class="employee-auth__error" role="alert">{{ errorMessage }}</p>

        <button class="employee-primary-button" type="submit" :disabled="submitting">
          {{ submitting ? t('login.submitting') : t('login.submit') }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { login } from '@/api/auth'
import { saveTokens } from '@/session/tokenStorage'

const { t } = useI18n()
const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

async function submit(): Promise<void> {
  if (submitting.value) {
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    const response = await login({
      email: email.value,
      password: password.value,
    })

    if (response.userType !== 'EMPLOYEE') {
      errorMessage.value = t('login.employeeOnly')
      return
    }

    saveTokens(
      response.accessToken,
      response.refreshToken,
      remember.value ? 'local' : 'session',
    )
    await router.replace({ name: 'home' })
  } catch {
    errorMessage.value = t('login.failed')
  } finally {
    submitting.value = false
  }
}
</script>
