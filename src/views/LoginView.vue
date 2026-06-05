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

      <div v-if="canVerifyEmail" class="employee-auth__help">
        <p>{{ t('login.verifyHelp') }}</p>
        <button class="employee-secondary-button" type="button" @click="goToVerification">
          {{ t('login.verifyAction') }}
        </button>
      </div>

      <div class="employee-auth__links">
        <RouterLink to="/forgot-password">{{ t('authLinks.forgotPassword') }}</RouterLink>
        <RouterLink to="/verify-email">{{ t('authLinks.verifyEmail') }}</RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/api/auth'
import { resolveApiMessage } from '@/api/client'
import { saveTokens } from '@/session/tokenStorage'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const canVerifyEmail = ref(false)

function isEmailVerificationRequiredMessage(message: string): boolean {
  return message.includes('이메일 인증') || message.toLowerCase().includes('email verification')
}

async function submit(): Promise<void> {
  if (submitting.value) {
    return
  }

  submitting.value = true
  errorMessage.value = ''
  canVerifyEmail.value = false

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
    await router.replace(resolveRedirectAfterLogin() ?? { name: 'schedule' })
  } catch (error) {
    const message = resolveApiMessage(error, t('login.failed'))
    errorMessage.value = message
    canVerifyEmail.value = isEmailVerificationRequiredMessage(message)
  } finally {
    submitting.value = false
  }
}

function resolveRedirectAfterLogin(): string | null {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return null
  }
  return redirect
}

async function goToVerification(): Promise<void> {
  await router.push({
    name: 'verify-email',
    query: email.value.trim() ? { email: email.value.trim() } : undefined,
  })
}
</script>
