<template>
  <section class="employee-notifications" aria-labelledby="notifications-heading">
    <div class="employee-notifications__header">
      <div>
        <p class="employee-notifications__eyebrow">{{ t('notifications.eyebrow') }}</p>
        <h2 id="notifications-heading">{{ t('screen.notifications.title') }}</h2>
      </div>
      <EmployeeRefreshButton
        class="employee-notifications__refresh"
        :label="t('notifications.refresh')"
        :disabled="loading"
        @click="loadNotifications"
      />
    </div>

    <EmployeeStatePanel
      v-if="!selectedStore"
      tone="empty"
      :title="t('home.emptyTitle')"
      :message="t('home.emptyDescription')"
    />

    <template v-else>
      <div class="employee-notifications__toolbar" role="group" :aria-label="t('notifications.filterLabel')">
        <label class="employee-check">
          <input v-model="unreadOnly" type="checkbox" />
          <span>{{ t('notifications.unreadOnly') }}</span>
        </label>
        <span>{{ t('notifications.unreadCount', { count: unreadCount }) }}</span>
      </div>

      <p v-if="feedbackMessage" class="employee-notifications__feedback">
        {{ feedbackMessage }}
      </p>

      <EmployeeStatePanel
        v-if="loading && notifications.length === 0"
        tone="loading"
        :message="t('notifications.loading')"
      />

      <EmployeeStatePanel
        v-else-if="errorMessage && notifications.length === 0"
        tone="error"
        :title="t('notifications.errorTitle')"
        :message="errorMessage"
        :action-label="t('app.retry')"
        @action="loadNotifications"
      />

      <EmployeeStatePanel
        v-else-if="notifications.length === 0"
        tone="empty"
        :title="t('notifications.emptyTitle')"
        :message="emptyMessage"
        :action-label="t('notifications.refresh')"
        @action="loadNotifications"
      />

      <section v-else class="employee-notifications-list" aria-labelledby="notifications-list-heading">
        <div class="employee-notifications-list__header">
          <div>
            <p class="employee-notifications__eyebrow">{{ t('notifications.listEyebrow') }}</p>
            <h3 id="notifications-list-heading">{{ t('notifications.listTitle') }}</h3>
          </div>
          <span>{{ t('notifications.listCount', { count: notifications.length }) }}</span>
        </div>

        <button
          v-for="notification in notifications"
          :key="notification.notificationId"
          class="employee-notification-card"
          :class="{ 'is-read': notification.read }"
          type="button"
          :disabled="readingNotificationId === notification.notificationId"
          @click="openNotification(notification)"
        >
          <span
            class="employee-notification-status"
            :class="`employee-notification-status--${notificationTone(notification.type)}`"
          >
            {{ t(notificationTypeKey(notification.type)) }}
          </span>
          <span class="employee-notification-card__main">
            <span>{{ notification.title }}</span>
            <span>{{ notification.body }}</span>
          </span>
          <span class="employee-notification-card__meta">
            {{ t(notificationTargetKey(notification.targetType)) }}
            ·
            {{ formatOptionalDateTime(notification.createdAt) }}
            ·
            {{ notification.read ? t('notifications.read') : t('notifications.unread') }}
          </span>
        </button>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useEmployeeAppContext } from '@/app/employeeAppContext'
import { isForbidden, isUnauthorized } from '@/api/client'
import { loadMyNotifications, markNotificationRead } from '@/api/notifications'
import type { AppNotificationResponse } from '@/api/types'
import EmployeeRefreshButton from '@/component/EmployeeRefreshButton.vue'
import EmployeeStatePanel from '@/component/EmployeeStatePanel.vue'
import {
  notificationTargetKey,
  notificationTone,
  notificationTypeKey,
  resolveNotificationRoute,
  sortNotifications,
} from '@/notifications/notificationViewModel'

const { t, locale } = useI18n()
const router = useRouter()
const { selectedStore, logout } = useEmployeeAppContext()

const loading = ref(false)
const errorMessage = ref('')
const feedbackMessage = ref('')
const notificationItems = ref<AppNotificationResponse[]>([])
const unreadOnly = ref(false)
const unreadCount = ref(0)
const readingNotificationId = ref<string | null>(null)
let notificationRequestId = 0

const notifications = computed(() => sortNotifications(notificationItems.value))
const emptyMessage = computed(() =>
  unreadOnly.value
    ? t('notifications.emptyUnreadDescription')
    : t('notifications.emptyDescription'),
)

watch(
  () => selectedStore.value?.storeId,
  () => {
    notificationItems.value = []
    unreadCount.value = 0
    feedbackMessage.value = ''
    void loadNotifications()
  },
  { immediate: true },
)

watch(unreadOnly, () => {
  notificationItems.value = []
  feedbackMessage.value = ''
  void loadNotifications()
})

async function loadNotifications(): Promise<void> {
  const storeId = selectedStore.value?.storeId
  const requestId = ++notificationRequestId

  if (!storeId) {
    notificationItems.value = []
    unreadCount.value = 0
    errorMessage.value = ''
    loading.value = false
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await loadMyNotifications({
      storeId,
      unreadOnly: unreadOnly.value,
      page: 0,
      size: 100,
    })
    if (requestId === notificationRequestId) {
      notificationItems.value = response.items
      unreadCount.value = response.unreadCount
    }
  } catch (error) {
    if (requestId !== notificationRequestId) {
      return
    }
    notificationItems.value = []
    unreadCount.value = 0
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    errorMessage.value = isForbidden(error)
      ? t('notifications.permissionDenied')
      : t('notifications.errorDescription')
  } finally {
    if (requestId === notificationRequestId) {
      loading.value = false
    }
  }
}

async function openNotification(notification: AppNotificationResponse): Promise<void> {
  const storeId = selectedStore.value?.storeId
  if (!storeId || readingNotificationId.value) {
    return
  }

  feedbackMessage.value = ''
  readingNotificationId.value = notification.notificationId

  try {
    let updated = notification
    if (!notification.read) {
      updated = await markNotificationRead({
        storeId,
        notificationId: notification.notificationId,
      })
      replaceNotification(updated)
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }

    const routeName = resolveNotificationRoute(updated)
    if (!routeName) {
      feedbackMessage.value = t('notifications.noDestination')
      return
    }
    await router.push({ name: routeName })
  } catch (error) {
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    feedbackMessage.value = isForbidden(error)
      ? t('notifications.permissionDenied')
      : t('notifications.readFailed')
  } finally {
    readingNotificationId.value = null
  }
}

function replaceNotification(updated: AppNotificationResponse): void {
  notificationItems.value = notificationItems.value.map((item) =>
    item.notificationId === updated.notificationId ? updated : item,
  )
}

function formatOptionalDateTime(value: string | null): string {
  if (!value) {
    return t('notifications.notProvided')
  }
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
</script>
