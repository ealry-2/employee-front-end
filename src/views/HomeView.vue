<template>
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
    <div class="employee-section__header employee-profile-header">
      <div>
        <p class="employee-section__eyebrow">{{ t('home.greeting', { name: bootstrap.user.name }) }}</p>
        <h2 id="profile-heading">{{ t('home.profile') }}</h2>
      </div>
      <button
        class="employee-profile-edit"
        type="button"
        :aria-label="t('home.editProfile')"
        :title="t('home.editProfile')"
        @click="openProfileEditor"
      >
        <svg
          class="employee-profile-edit__icon"
          viewBox="0 0 24 24"
          focusable="false"
          aria-hidden="true"
        >
          <path d="M4.5 19.5h4.2L19.2 9a2.1 2.1 0 0 0 0-3l-1.2-1.2a2.1 2.1 0 0 0-3 0L4.5 15.3v4.2Z" />
          <path d="m13.8 6 4.2 4.2" />
        </svg>
      </button>
    </div>

    <div class="employee-profile-summary">
      <span class="employee-profile-avatar" aria-hidden="true">
        <img
          v-if="bootstrap.user.profileImageUrl"
          :src="bootstrap.user.profileImageUrl"
          alt=""
        />
        <span v-else>{{ profileInitial }}</span>
      </span>
      <div>
        <strong>{{ bootstrap.user.name }}</strong>
        <span>{{ bootstrap.user.email }}</span>
      </div>
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
        <dd>{{ formatOptionalText(bootstrap.user.phone, '-') }}</dd>
      </div>
      <div>
        <dt>{{ t('home.address') }}</dt>
        <dd>{{ formatOptionalText(bootstrap.user.address, '-') }}</dd>
      </div>
    </dl>
  </section>

  <section v-if="bootstrap && !bootstrap.hasStores" class="employee-state" aria-live="polite">
    <h2>{{ t('home.emptyTitle') }}</h2>
    <p class="employee-state__copy">{{ t('home.emptyDescription') }}</p>
  </section>

  <Teleport to="body">
    <div
      v-if="profileEditorOpen && bootstrap"
      class="employee-profile-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-profile-editor-heading"
      @click.self="closeProfileEditor"
    >
      <form class="employee-profile-editor" @submit.prevent="saveProfile">
        <header>
          <div>
            <p class="employee-section__eyebrow">{{ t('home.profileEditorEyebrow') }}</p>
            <h2 id="employee-profile-editor-heading">{{ t('home.editProfile') }}</h2>
          </div>
          <button
            class="employee-close-button"
            type="button"
            :aria-label="t('home.closeProfileEditor')"
            @click="closeProfileEditor"
          >
            ×
          </button>
        </header>

        <div class="employee-profile-editor__avatar">
          <span class="employee-profile-avatar employee-profile-avatar--large" aria-hidden="true">
            <img
              v-if="profileForm.profileImageUrl"
              :src="profileForm.profileImageUrl"
              alt=""
            />
            <span v-else>{{ profileFormInitial }}</span>
          </span>
          <label>
            <span>{{ t('home.profileImageUrl') }}</span>
            <input
              v-model.trim="profileForm.profileImageUrl"
              type="url"
              inputmode="url"
              autocomplete="url"
              :placeholder="t('home.profileImagePlaceholder')"
            />
          </label>
        </div>

        <label>
          <span>{{ t('home.name') }}</span>
          <input
            v-model.trim="profileForm.name"
            type="text"
            autocomplete="name"
            required
          />
        </label>
        <label>
          <span>{{ t('home.phone') }}</span>
          <input
            v-model.trim="profileForm.phone"
            type="tel"
            autocomplete="tel"
          />
        </label>
        <label>
          <span>{{ t('home.address') }}</span>
          <input
            v-model.trim="profileForm.address"
            type="text"
            autocomplete="street-address"
          />
        </label>

        <p v-if="profileError" class="employee-form-error">{{ profileError }}</p>

        <footer>
          <button
            class="employee-secondary-button"
            type="button"
            :disabled="profileSaving"
            @click="closeProfileEditor"
          >
            {{ t('app.close') }}
          </button>
          <button
            class="employee-primary-button"
            type="submit"
            :disabled="profileSaving || !profileForm.name.trim()"
          >
            {{ profileSaving ? t('home.savingProfile') : t('home.saveProfile') }}
          </button>
        </footer>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmployeeAppContext } from '@/app/employeeAppContext'
import { updateAppProfile } from '@/api/auth'
import { isUnauthorized } from '@/api/client'
import { showEmployeeToast } from '@/app/toast'
import { formatOptionalText } from '@/session/bootstrapState'

const { t } = useI18n()
const { bootstrap, selectedStore, selectStore, logout } = useEmployeeAppContext()

const profileEditorOpen = ref(false)
const profileSaving = ref(false)
const profileError = ref('')
const profileForm = reactive({
  name: '',
  phone: '',
  address: '',
  profileImageUrl: '',
})

const profileInitial = computed(() => makeInitial(bootstrap.value?.user.name ?? ''))
const profileFormInitial = computed(() => makeInitial(profileForm.name))

function openProfileEditor(): void {
  const user = bootstrap.value?.user
  if (!user) {
    return
  }
  profileForm.name = user.name
  profileForm.phone = user.phone ?? ''
  profileForm.address = user.address ?? ''
  profileForm.profileImageUrl = user.profileImageUrl ?? ''
  profileError.value = ''
  profileEditorOpen.value = true
}

function closeProfileEditor(): void {
  if (profileSaving.value) {
    return
  }
  profileEditorOpen.value = false
}

async function saveProfile(): Promise<void> {
  if (!bootstrap.value || !profileForm.name.trim()) {
    return
  }

  profileSaving.value = true
  profileError.value = ''

  try {
    const updatedUser = await updateAppProfile({
      name: profileForm.name.trim(),
      phone: nullableText(profileForm.phone),
      address: nullableText(profileForm.address),
      profileImageUrl: nullableText(profileForm.profileImageUrl),
    })
    bootstrap.value = {
      ...bootstrap.value,
      user: updatedUser,
    }
    profileEditorOpen.value = false
    showEmployeeToast(t('home.profileSaved'), 'success')
  } catch (error) {
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    profileError.value = t('home.profileSaveFailed')
  } finally {
    profileSaving.value = false
  }
}

function nullableText(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function makeInitial(name: string): string {
  const trimmed = name.trim()
  return trimmed.length > 0 ? trimmed.slice(0, 1) : '?'
}
</script>
