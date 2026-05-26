<template>
  <main class="employee-auth employee-invitation">
    <section class="employee-auth__panel" aria-labelledby="employee-invitation-title">
      <p class="employee-auth__brand">{{ t('app.brand') }}</p>
      <h1 id="employee-invitation-title" class="employee-auth__title">
        {{ t('employeeInvitation.title') }}
      </h1>
      <p class="employee-auth__subtitle">{{ t('employeeInvitation.subtitle') }}</p>

      <EmployeeStatePanel
        v-if="loading"
        tone="loading"
        :message="t('employeeInvitation.loading')"
      />

      <div v-else class="employee-invitation__content">
        <EmployeeStatePanel
          v-if="!token"
          tone="error"
          :message="t('employeeInvitation.invalidLink')"
        />

        <template v-else-if="invitation">
          <dl class="employee-invitation__summary">
            <div>
              <dt>{{ t('employeeInvitation.store') }}</dt>
              <dd>{{ invitation.storeName }}</dd>
            </div>
            <div>
              <dt>{{ t('employeeInvitation.employee') }}</dt>
              <dd>{{ invitation.employeeName }}</dd>
            </div>
            <div>
              <dt>{{ t('employeeInvitation.email') }}</dt>
              <dd>{{ invitation.email }}</dd>
            </div>
            <div v-if="invitation.hireDate">
              <dt>{{ t('employeeInvitation.hireDate') }}</dt>
              <dd>{{ invitation.hireDate }}</dd>
            </div>
            <div v-if="invitation.role">
              <dt>{{ t('employeeInvitation.role') }}</dt>
              <dd>{{ invitation.role }}</dd>
            </div>
          </dl>

          <p
            v-if="statusMessage"
            class="employee-auth__success"
            role="status"
          >
            {{ statusMessage }}
          </p>

          <form
            v-if="canSetupPassword"
            class="employee-auth__form"
            @submit.prevent="accept"
          >
            <label class="employee-field">
              <span class="employee-field__label">{{ t('employeeInvitation.password') }}</span>
              <input
                v-model="password"
                class="employee-field__control"
                type="password"
                autocomplete="new-password"
                required
              />
            </label>

            <label class="employee-field">
              <span class="employee-field__label">{{ t('employeeInvitation.confirmPassword') }}</span>
              <input
                v-model="confirmPassword"
                class="employee-field__control"
                type="password"
                autocomplete="new-password"
                required
              />
            </label>

            <label class="employee-check">
              <input v-model="agreeTerms" type="checkbox" />
              <span>{{ t('employeeInvitation.termsConsent') }}</span>
            </label>
            <label class="employee-check">
              <input v-model="agreePrivacy" type="checkbox" />
              <span>{{ t('employeeInvitation.privacyConsent') }}</span>
            </label>

            <p v-if="errorMessage" class="employee-auth__error" role="alert">
              {{ errorMessage }}
            </p>

            <div class="employee-invitation__actions">
              <button
                class="employee-secondary-button"
                type="button"
                :disabled="submitting"
                @click="decline"
              >
                {{ t('employeeInvitation.decline') }}
              </button>
              <button class="employee-primary-button" type="submit" :disabled="submitting">
                {{
                  submitting
                    ? t('employeeInvitation.accepting')
                    : t('employeeInvitation.accept')
                }}
              </button>
            </div>
          </form>

          <div v-else-if="canAcceptWithLogin" class="employee-auth__help">
            <p>{{ t('employeeInvitation.loginRequired') }}</p>
            <div class="employee-invitation__actions">
              <RouterLink
                v-if="!isLoggedIn"
                class="employee-primary-button employee-invitation__link-button"
                :to="loginRoute"
              >
                {{ t('employeeInvitation.login') }}
              </RouterLink>
              <button
                v-else
                class="employee-primary-button"
                type="button"
                :disabled="submitting"
                @click="accept"
              >
                {{
                  submitting
                    ? t('employeeInvitation.accepting')
                    : t('employeeInvitation.accept')
                }}
              </button>
              <button
                class="employee-secondary-button"
                type="button"
                :disabled="submitting"
                @click="decline"
              >
                {{ t('employeeInvitation.decline') }}
              </button>
            </div>
          </div>

          <div v-else-if="canDeclineOnly" class="employee-invitation__actions">
            <button
              class="employee-secondary-button"
              type="button"
              :disabled="submitting"
              @click="decline"
            >
              {{ t('employeeInvitation.decline') }}
            </button>
          </div>

          <p v-if="errorMessage && !canSetupPassword" class="employee-auth__error" role="alert">
            {{ errorMessage }}
          </p>
        </template>
      </div>

      <div class="employee-auth__links">
        <RouterLink to="/login">{{ t('authLinks.backToLogin') }}</RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  acceptEmployeeInvitation,
  declineEmployeeInvitation,
  loadEmployeeInvitation,
} from '@/api/auth'
import { isUnauthorized, resolveApiMessage } from '@/api/client'
import type { EmployeeInvitationResponse } from '@/api/types'
import EmployeeStatePanel from '@/component/EmployeeStatePanel.vue'
import { hasAccessToken } from '@/session/tokenStorage'

const { t } = useI18n()
const route = useRoute()

const token = typeof route.params.token === 'string' ? route.params.token : ''
const invitation = ref<EmployeeInvitationResponse | null>(null)
const loading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeTerms = ref(false)
const agreePrivacy = ref(false)

const isLoggedIn = computed(() => hasAccessToken())
const isOpenInvitation = computed(
  () => invitation.value?.invitationStatus === 'INVITED',
)
const canSetupPassword = computed(
  () => isOpenInvitation.value && invitation.value?.requiresPasswordSetup === true,
)
const canAcceptWithLogin = computed(
  () => isOpenInvitation.value && invitation.value?.requiresLogin === true,
)
const canDeclineOnly = computed(
  () =>
    isOpenInvitation.value &&
    !canSetupPassword.value &&
    !canAcceptWithLogin.value,
)
const loginRoute = computed(() => ({
  name: 'login',
  query: {
    redirect: route.fullPath,
  },
}))
const statusMessage = computed(() => {
  if (!invitation.value) {
    return ''
  }
  if (invitation.value.invitationStatus === 'ACCEPTED') {
    return t('employeeInvitation.accepted')
  }
  if (invitation.value.invitationStatus === 'DECLINED') {
    return t('employeeInvitation.declined')
  }
  if (invitation.value.invitationStatus === 'EXPIRED') {
    return t('employeeInvitation.expired')
  }
  return ''
})

onMounted(() => {
  void load()
})

async function load(): Promise<void> {
  if (!token) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    invitation.value = await loadEmployeeInvitation(token)
  } catch (error) {
    errorMessage.value = resolveApiMessage(error, t('employeeInvitation.invalidLink'))
  } finally {
    loading.value = false
  }
}

async function accept(): Promise<void> {
  if (!token || submitting.value) {
    return
  }

  if (canSetupPassword.value) {
    if (password.value !== confirmPassword.value) {
      errorMessage.value = t('employeeInvitation.passwordMismatch')
      return
    }
    if (!agreeTerms.value || !agreePrivacy.value) {
      errorMessage.value = t('employeeInvitation.consentRequired')
      return
    }
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    invitation.value = await acceptEmployeeInvitation(token, {
      password: canSetupPassword.value ? password.value : null,
      confirmPassword: canSetupPassword.value ? confirmPassword.value : null,
      agreeTerms: agreeTerms.value,
      agreePrivacy: agreePrivacy.value,
    })
    password.value = ''
    confirmPassword.value = ''
  } catch (error) {
    errorMessage.value = isUnauthorized(error)
      ? t('employeeInvitation.loginRequired')
      : resolveApiMessage(error, t('employeeInvitation.acceptFailed'))
  } finally {
    submitting.value = false
  }
}

async function decline(): Promise<void> {
  if (!token || submitting.value) {
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    invitation.value = await declineEmployeeInvitation(token)
  } catch (error) {
    errorMessage.value = resolveApiMessage(error, t('employeeInvitation.declineFailed'))
  } finally {
    submitting.value = false
  }
}
</script>
