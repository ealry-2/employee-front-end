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
      <label class="employee-notifications__search">
        <span class="employee-sr-only">{{ t('notifications.searchLabel') }}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.2 4.2" />
        </svg>
        <input
          v-model.trim="searchQuery"
          type="search"
          :placeholder="t('notifications.searchPlaceholder')"
        />
      </label>

      <div class="employee-notifications__toolbar" role="group" :aria-label="t('notifications.filterLabel')">
        <div class="employee-notifications__filters">
          <button
            type="button"
            class="employee-notifications__filter"
            :class="{ 'is-active': !unreadOnly }"
            :aria-pressed="!unreadOnly"
            @click="unreadOnly = false"
          >
            <span>{{ t('notifications.allFilter') }}</span>
            <strong>{{ totalCount }}</strong>
          </button>
          <button
            type="button"
            class="employee-notifications__filter"
            :class="{ 'is-active': unreadOnly }"
            :aria-pressed="unreadOnly"
            @click="unreadOnly = true"
          >
            <span>{{ t('notifications.unreadFilter') }}</span>
            <strong>{{ unreadCount }}</strong>
          </button>
        </div>
        <button
          class="employee-notifications__mark-all"
          type="button"
          :disabled="visibleUnreadCount === 0 || markingAllRead"
          @click="markAllVisibleAsRead"
        >
          {{ t('notifications.markAllRead') }}
        </button>
      </div>

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
        v-else-if="visibleNotifications.length === 0"
        tone="empty"
        :title="t('notifications.emptyTitle')"
        :message="emptyMessage"
        :action-label="t('notifications.refresh')"
        @action="loadNotifications"
      />

      <section v-else class="employee-notifications-list" aria-labelledby="notifications-list-heading">
        <h3 id="notifications-list-heading" class="employee-sr-only">{{ t('notifications.listTitle') }}</h3>

        <section
          v-for="group in groupedNotifications"
          :key="group.key"
          class="employee-notifications-group"
          :aria-labelledby="`notifications-group-${group.key}`"
        >
          <h4 :id="`notifications-group-${group.key}`">{{ group.label }}</h4>

          <button
            v-for="notification in group.items"
            :key="notification.notificationId"
            class="employee-notification-card"
            :class="{ 'is-read': notification.read }"
            type="button"
            :disabled="readingNotificationId === notification.notificationId"
            @click="openNotification(notification)"
          >
            <span
              class="employee-notification-card__icon"
              :class="`employee-notification-card__icon--${notificationIcon(notification.type)}`"
              aria-hidden="true"
            >
              <svg
                class="employee-notification-card__svg"
                viewBox="0 0 28 28"
                focusable="false"
              >
                <g v-if="notificationIcon(notification.type) === 'contract'">
                  <path d="M8 4.8h8.6L21 9.2v14H8z" />
                  <path d="M16.4 5.1v4.4h4.3M11 13.4h6.2M11 17.2h6.2M11 21h4.2" />
                </g>
                <g v-else-if="notificationIcon(notification.type) === 'schedule'">
                  <path d="M8 4.8v3M20 4.8v3M5.5 9.2h17M6.5 6.4h15v16.2h-15z" />
                  <path d="M10.2 13.2h3M15.8 13.2h2M10.2 17.5h7.4" />
                </g>
                <g v-else-if="notificationIcon(notification.type) === 'payroll'">
                  <path d="M7.5 5.5h13v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z" />
                  <path d="M10.6 10.2h6.8M10.6 14h6.8M10.6 17.8h4" />
                </g>
                <g v-else-if="notificationIcon(notification.type) === 'attendance'">
                  <circle cx="14" cy="14" r="8.8" />
                  <path d="M14 8.8v5.5l4 2.4" />
                </g>
                <g v-else>
                  <path d="M7.2 12.8c0-4 2.7-6.8 6.8-6.8s6.8 2.8 6.8 6.8v4l2 3H5.2l2-3z" />
                  <path d="M11.2 20.2c.5 1.5 1.4 2.3 2.8 2.3s2.3-.8 2.8-2.3" />
                </g>
              </svg>
            </span>

            <span class="employee-notification-card__main">
              <span>{{ notification.title }}</span>
              <span>{{ notification.body }}</span>
            </span>

            <span class="employee-notification-card__side">
              <span v-if="!notification.read" class="employee-notification-card__dot" aria-hidden="true" />
              <span>{{ formatRelativeTime(notification.createdAt) }}</span>
            </span>
          </button>
        </section>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useEmployeeAppContext } from '@/app/employeeAppContext'
import { showEmployeeToast } from '@/app/toast'
import { isForbidden, isUnauthorized } from '@/api/client'
import { loadMyNotifications, markNotificationRead } from '@/api/notifications'
import type { AppNotificationResponse } from '@/api/types'
import EmployeeRefreshButton from '@/component/EmployeeRefreshButton.vue'
import EmployeeStatePanel from '@/component/EmployeeStatePanel.vue'
import {
  notificationIcon,
  notificationTypeKey,
  resolveNotificationRoute,
  sortNotifications,
} from '@/notifications/notificationViewModel'

const { t, locale } = useI18n()
const router = useRouter()
const {
  selectedStore,
  unreadNotificationCount,
  logout,
} = useEmployeeAppContext()

const loading = ref(false)
const errorMessage = ref('')
const notificationItems = ref<AppNotificationResponse[]>([])
const unreadOnly = ref(false)
const unreadCount = ref(0)
const searchQuery = ref('')
const readingNotificationId = ref<string | null>(null)
const markingAllRead = ref(false)
let notificationRequestId = 0

const notifications = computed(() => sortNotifications(notificationItems.value))
const totalCount = computed(() => notificationItems.value.length)
const visibleNotifications = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()
  return notifications.value.filter((notification) => {
    if (unreadOnly.value && notification.read) {
      return false
    }
    if (!normalizedQuery) {
      return true
    }
    return `${notification.title} ${notification.body} ${t(notificationTypeKey(notification.type))}`
      .toLowerCase()
      .includes(normalizedQuery)
  })
})
const visibleUnreadCount = computed(
  () => visibleNotifications.value.filter((notification) => !notification.read).length,
)
const groupedNotifications = computed(() => groupNotificationsByDay(visibleNotifications.value))
const emptyMessage = computed(() =>
  searchQuery.value
    ? t('notifications.emptySearchDescription')
    : unreadOnly.value
    ? t('notifications.emptyUnreadDescription')
    : t('notifications.emptyDescription'),
)

watch(
  () => selectedStore.value?.storeId,
  () => {
    notificationItems.value = []
    unreadCount.value = 0
    void loadNotifications()
  },
  { immediate: true },
)

async function loadNotifications(): Promise<void> {
  const storeId = selectedStore.value?.storeId
  const requestId = ++notificationRequestId

  if (!storeId) {
    notificationItems.value = []
    unreadCount.value = 0
    unreadNotificationCount.value = 0
    errorMessage.value = ''
    loading.value = false
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await loadMyNotifications({
      storeId,
      unreadOnly: false,
      page: 0,
      size: 100,
    })
    if (requestId === notificationRequestId) {
      notificationItems.value = response.items
      unreadCount.value = response.unreadCount
      unreadNotificationCount.value = response.unreadCount
    }
  } catch (error) {
    if (requestId !== notificationRequestId) {
      return
    }
    notificationItems.value = []
    unreadCount.value = 0
    unreadNotificationCount.value = 0
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

async function markAllVisibleAsRead(): Promise<void> {
  const storeId = selectedStore.value?.storeId
  const unreadNotifications = visibleNotifications.value.filter((notification) => !notification.read)
  if (!storeId || unreadNotifications.length === 0 || markingAllRead.value) {
    return
  }

  markingAllRead.value = true

  try {
    const updatedNotifications = await Promise.all(
      unreadNotifications.map((notification) =>
        markNotificationRead({
          storeId,
          notificationId: notification.notificationId,
        }),
      ),
    )
    for (const updated of updatedNotifications) {
      replaceNotification(updated)
    }
    unreadCount.value = Math.max(0, unreadCount.value - updatedNotifications.length)
    unreadNotificationCount.value = Math.max(
      0,
      unreadNotificationCount.value - updatedNotifications.length,
    )
    showEmployeeToast(t('notifications.markAllReadDone'), 'success')
  } catch (error) {
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    showEmployeeToast(
      isForbidden(error)
        ? t('notifications.permissionDenied')
        : t('notifications.markAllReadFailed'),
      'error',
    )
  } finally {
    markingAllRead.value = false
  }
}

async function openNotification(notification: AppNotificationResponse): Promise<void> {
  const storeId = selectedStore.value?.storeId
  if (!storeId || readingNotificationId.value) {
    return
  }

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
      unreadNotificationCount.value = Math.max(0, unreadNotificationCount.value - 1)
    }

    const routeName = resolveNotificationRoute(updated)
    if (!routeName) {
      showEmployeeToast(t('notifications.noDestination'), 'info')
      return
    }
    await router.push({ name: routeName })
  } catch (error) {
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    showEmployeeToast(
      isForbidden(error)
        ? t('notifications.permissionDenied')
        : t('notifications.readFailed'),
      'error',
    )
  } finally {
    readingNotificationId.value = null
  }
}

function replaceNotification(updated: AppNotificationResponse): void {
  notificationItems.value = notificationItems.value.map((item) =>
    item.notificationId === updated.notificationId ? updated : item,
  )
}

function formatRelativeTime(value: string | null): string {
  if (!value) {
    return t('notifications.notProvided')
  }

  const diffMs = new Date(value).getTime() - Date.now()
  const absMs = Math.abs(diffMs)
  const formatter = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (absMs < hour) {
    return formatter.format(Math.round(diffMs / minute), 'minute')
  }
  if (absMs < day) {
    return formatter.format(Math.round(diffMs / hour), 'hour')
  }
  return formatter.format(Math.round(diffMs / day), 'day')
}

function groupNotificationsByDay(
  items: AppNotificationResponse[],
): Array<{ key: string; label: string; items: AppNotificationResponse[] }> {
  const groups = new Map<string, AppNotificationResponse[]>()
  for (const notification of items) {
    const key = dateGroupKey(notification.createdAt)
    groups.set(key, [...(groups.get(key) ?? []), notification])
  }
  return [...groups.entries()].map(([key, groupItems]) => ({
    key,
    label: dateGroupLabel(key),
    items: groupItems,
  }))
}

function dateGroupKey(value: string | null): string {
  if (!value) {
    return 'unknown'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'unknown'
  }
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function dateGroupLabel(key: string): string {
  if (key === 'unknown') {
    return t('notifications.notProvided')
  }

  const today = dateGroupKey(new Date().toISOString())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = dateGroupKey(yesterday.toISOString())

  if (key === today) {
    return t('notifications.today')
  }
  if (key === yesterdayKey) {
    return t('notifications.yesterday')
  }
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${key}T00:00:00`))
}
</script>
