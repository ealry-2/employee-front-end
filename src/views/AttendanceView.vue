<template>
  <section class="employee-attendance" :aria-label="t('screen.attendance.title')">
    <EmployeeStatePanel
      v-if="!selectedStore"
      tone="empty"
      :title="t('home.emptyTitle')"
      :message="t('home.emptyDescription')"
    />

    <template v-else>
      <EmployeeStatePanel
        v-if="loading && !current"
        tone="loading"
        :message="t('attendance.loading')"
      />

      <EmployeeStatePanel
        v-else-if="errorMessage && !current"
        tone="error"
        :title="t('attendance.errorTitle')"
        :message="errorMessage"
        :action-label="t('app.retry')"
        @action="loadCurrent"
      />

      <template v-else-if="current">
        <section class="employee-attendance-card" aria-labelledby="attendance-status-heading">
          <div class="employee-attendance-card__clock">
            <time :datetime="displayClockIso">{{ displayClockTime }}</time>
            <span>{{ displayClockDate }}</span>
          </div>

          <button
            class="employee-attendance-ring-action"
            type="button"
            :disabled="actionDisabled"
            :aria-busy="actionSubmitting || qrScanSubmitting"
            :aria-label="primaryActionLabel"
            @click="submitAction"
          >
            <span class="employee-attendance-ring-action__icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" focusable="false">
                <path d="M14.1 15.1V7.8a1.7 1.7 0 0 1 3.4 0v6.1" />
                <path d="M17.5 12.2a1.7 1.7 0 0 1 3.4 0v2.2" />
                <path d="M20.9 13.1a1.7 1.7 0 0 1 3.4 0v3.9" />
                <path d="m14.1 17.2-1.4-1.4a1.8 1.8 0 0 0-2.5 2.6l4.1 4.8a6.3 6.3 0 0 0 4.9 2.2h0.3a4.8 4.8 0 0 0 4.8-4.8V17" />
              </svg>
            </span>
            <span>{{ primaryActionLabel }}</span>
          </button>

          <div class="employee-attendance-card__status">
            <h3 id="attendance-status-heading">
              {{ t(attendanceCurrentStatusKey(current.status)) }}
            </h3>
          </div>

          <dl class="employee-attendance-metrics">
            <div>
              <dt>
                <span class="employee-attendance-metric-icon employee-attendance-metric-icon--in" aria-hidden="true">
                  <svg viewBox="0 0 32 32" focusable="false">
                    <path class="employee-attendance-metric-icon__door" d="M13 10V7.8c0-1.1.9-2 2-2h9.2c1.1 0 2 .9 2 2v16.4c0 1.1-.9 2-2 2H15c-1.1 0-2-.9-2-2V22" />
                    <path class="employee-attendance-metric-icon__arrow" d="M5.2 16h16.8" />
                    <path class="employee-attendance-metric-icon__arrow" d="m18.2 12.2 3.8 3.8-3.8 3.8" />
                  </svg>
                </span>
                {{ t('attendance.checkInMetric') }}
              </dt>
              <dd>{{ attendanceMetric.checkIn }}</dd>
            </div>
            <div>
              <dt>
                <span class="employee-attendance-metric-icon employee-attendance-metric-icon--out" aria-hidden="true">
                  <svg viewBox="0 0 32 32" focusable="false">
                    <path class="employee-attendance-metric-icon__door" d="M13 10V7.8c0-1.1.9-2 2-2h9.2c1.1 0 2 .9 2 2v16.4c0 1.1-.9 2-2 2H15c-1.1 0-2-.9-2-2V22" />
                    <path class="employee-attendance-metric-icon__arrow" d="M23.2 16H6.8" />
                    <path class="employee-attendance-metric-icon__arrow" d="m10.6 12.2-3.8 3.8 3.8 3.8" />
                  </svg>
                </span>
                {{ t('attendance.checkOutMetric') }}
              </dt>
              <dd>{{ attendanceMetric.checkOut }}</dd>
            </div>
            <div>
              <dt>
                <span class="employee-attendance-metric-icon employee-attendance-metric-icon--total" aria-hidden="true">
                  <svg viewBox="0 0 32 32" focusable="false">
                    <circle cx="16" cy="16" r="9.5" />
                    <path d="M16 10.3v5.9l4 2.3" />
                  </svg>
                </span>
                {{ t('attendance.totalHoursMetric') }}
              </dt>
              <dd>{{ attendanceMetric.total }}</dd>
            </div>
          </dl>

          <p class="employee-attendance-card__description">
            {{ t(currentDescriptionKey) }}
          </p>

          <p v-if="actionError" class="employee-attendance-action-error" role="alert">
            {{ actionError }}
          </p>

          <p v-if="loading" class="employee-attendance-card__sync">
            {{ t('attendance.syncing') }}
          </p>
        </section>

        <section class="employee-attendance-history" aria-labelledby="attendance-history-heading">
          <div class="employee-attendance-history__header">
            <div>
              <p class="employee-attendance__eyebrow">{{ t('attendance.historyEyebrow') }}</p>
              <h3 id="attendance-history-heading">{{ t('attendance.historyTitle') }}</h3>
            </div>
            <span>{{ t('attendance.historyCount', { count: historyRecords.length }) }}</span>
          </div>

          <EmployeeStatePanel
            v-if="historyRecords.length === 0"
            tone="empty"
            :message="t('attendance.historyEmpty')"
          />

          <ol v-else class="employee-attendance-records">
            <li
              v-for="record in historyRecords"
              :key="record.recordId"
              class="employee-attendance-record-item"
            >
              <EmployeeWorkCard
                compact
                :title="selectedStore.name"
                :location="formatDate(record.workDate)"
                :memo="record.memo"
                :start-time="formatNullableTime(record.clockInAt)"
                :start-label="t('attendance.checkInMetric')"
                :end-time="formatNullableTime(record.clockOutAt, t('attendance.notClockedOutValue'))"
                :end-label="t('attendance.checkOutMetric')"
                :status-label="t(attendanceRecordStatusKey(record.status))"
                :status-tone="attendanceRecordTone(record.status)"
                :accessible-summary="formatAttendanceWindow(record)"
              >
                <template #footer>
                  <dl class="employee-attendance-record__meta">
                    <div>
                      <dt>{{ t('attendance.totalWork') }}</dt>
                      <dd>{{ formatDuration(record.totalWorkMinutes) }}</dd>
                    </div>
                  </dl>
                </template>
              </EmployeeWorkCard>
            </li>
          </ol>
        </section>
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useEmployeeAppContext } from '@/app/employeeAppContext'
import { isForbidden, isStateConflict, isUnauthorized } from '@/api/client'
import {
  clockInEmployee,
  clockInEmployeeByQr,
  clockOutEmployee,
  loadAttendanceCurrent,
} from '@/api/attendance'
import type { AppAttendanceCurrentResponse, AttendanceResponse } from '@/api/types'
import EmployeeStatePanel from '@/component/EmployeeStatePanel.vue'
import EmployeeWorkCard from '@/component/EmployeeWorkCard.vue'
import { registerBrowserResumeHandler, type ResumeHandlerCleanup } from '@/runtime/appResume'
import { getCurrentQrLocation, scanAttendanceQr } from '@/attendance/qrScanner'
import {
  attendanceActionLabelKey,
  attendanceCurrentStatusKey,
  attendanceRecordStatusKey,
  attendanceRecordTone,
  buildClockInRequest,
  buildClockOutRequest,
  resolveAttendanceAction,
  sortAttendanceRecords,
  toDurationParts,
} from '@/attendance/attendanceViewModel'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { selectedStore, logout } = useEmployeeAppContext()

const current = ref<AppAttendanceCurrentResponse | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const actionError = ref('')
const actionSubmitting = ref(false)
const qrScanSubmitting = ref(false)
const liveServerTime = ref<Date | null>(null)
let currentRequestId = 0
let cleanupResumeHandler: ResumeHandlerCleanup | null = null
let liveClockTimer: ReturnType<typeof setInterval> | null = null
let serverClockBaseMs: number | null = null
let clientClockBaseMs: number | null = null

const attendanceAction = computed(() => resolveAttendanceAction(current.value))
const currentDescriptionKey = computed(() => {
  if (!current.value) {
    return 'attendance.currentDescription.none'
  }
  return `attendance.currentDescription.${current.value.status
    .toLowerCase()
    .replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())}`
})
const historyRecords = computed(() => sortAttendanceRecords(current.value?.todayAttendances ?? []))
const attendanceMetric = computed(() => buildAttendanceMetric(current.value, liveServerTime.value))
const displayClockIso = computed(() => liveServerTime.value?.toISOString() ?? current.value?.serverTime ?? '')
const displayClockTime = computed(() =>
  liveServerTime.value ? formatClockTime(liveServerTime.value) : t('attendance.noTimeValue'),
)
const displayClockDate = computed(() =>
  liveServerTime.value ? formatLongDate(liveServerTime.value) : '',
)
const actionDisabled = computed(
  () =>
    loading.value ||
    actionSubmitting.value ||
    qrScanSubmitting.value ||
    attendanceAction.value === 'NONE',
)
const primaryActionLabel = computed(() => {
  if (qrScanSubmitting.value) {
    return t('attendance.qrScanning')
  }
  if (actionSubmitting.value) {
    return t('attendance.action.submitting')
  }
  return t(attendanceActionLabelKey(attendanceAction.value))
})

watch(
  () => selectedStore.value?.storeId,
  () => {
    current.value = null
    actionError.value = ''
    void loadCurrent()
  },
  { immediate: true },
)

watch(
  () => [route.query.qr, selectedStore.value?.storeId] as const,
  ([qr]) => {
    if (qr === '1') {
      void startQrClockIn()
    }
  },
  { immediate: true },
)

onMounted(() => {
  startLiveClock()
  if (typeof document !== 'undefined') {
    cleanupResumeHandler = registerBrowserResumeHandler(() => {
      void loadCurrent()
    })
  }
})

onBeforeUnmount(() => {
  cleanupResumeHandler?.()
  cleanupResumeHandler = null
  stopLiveClock()
})

async function loadCurrent(): Promise<void> {
  const storeId = selectedStore.value?.storeId
  const requestId = ++currentRequestId

  if (!storeId) {
    current.value = null
    resetLiveClock()
    loading.value = false
    errorMessage.value = ''
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await loadAttendanceCurrent(storeId)
    if (requestId === currentRequestId) {
      current.value = response
      syncLiveClock(response.serverTime)
    }
  } catch (error) {
    if (requestId !== currentRequestId) {
      return
    }
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    errorMessage.value = isForbidden(error)
      ? t('attendance.permissionDenied')
      : t('attendance.errorDescription')
  } finally {
    if (requestId === currentRequestId) {
      loading.value = false
    }
  }
}

async function submitAction(): Promise<void> {
  if (actionSubmitting.value || actionDisabled.value) {
    return
  }

  actionSubmitting.value = true
  actionError.value = ''

  try {
    if (attendanceAction.value === 'CLOCK_IN') {
      const request = buildClockInRequest(current.value)
      if (!request) {
        actionError.value = t('attendance.stateConflict')
        return
      }
      await clockInEmployee(request)
    } else if (attendanceAction.value === 'CLOCK_OUT') {
      const request = buildClockOutRequest(current.value)
      if (!request) {
        actionError.value = t('attendance.stateConflict')
        return
      }
      await clockOutEmployee(request)
    } else {
      actionError.value = t('attendance.noAvailableAction')
      return
    }
  } catch (error) {
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    if (isForbidden(error)) {
      actionError.value = t('attendance.permissionDenied')
    } else if (isStateConflict(error)) {
      actionError.value = t('attendance.stateConflict')
    } else {
      actionError.value = t('attendance.actionFailed')
    }
  } finally {
    await loadCurrent()
    actionSubmitting.value = false
  }
}

async function startQrClockIn(): Promise<void> {
  if (qrScanSubmitting.value) {
    return
  }

  const storeId = selectedStore.value?.storeId
  await clearQrQuery()
  if (!storeId) {
    actionError.value = t('attendance.qrNoStore')
    return
  }

  qrScanSubmitting.value = true
  actionError.value = ''

  try {
    const qrToken = await scanAttendanceQr({
      instructions: t('attendance.qrInstructions'),
      button: t('attendance.qrScanButton'),
    })
    if (!qrToken) {
      actionError.value = t('attendance.qrEmpty')
      return
    }

    const location = await getCurrentQrLocation()
    await clockInEmployeeByQr({
      storeId,
      qrToken,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracyMeters: location.accuracyMeters,
    })
  } catch (error) {
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    actionError.value = resolveQrErrorMessage(error)
  } finally {
    await loadCurrent()
    qrScanSubmitting.value = false
  }
}

async function clearQrQuery(): Promise<void> {
  if (route.query.qr !== '1') {
    return
  }
  const query = { ...route.query }
  delete query.qr
  await router.replace({ query })
}

function resolveQrErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      const message = (data as { message?: unknown; error?: unknown }).message
      const fallback = (data as { message?: unknown; error?: unknown }).error
      if (typeof message === 'string' && message.length > 0) {
        return message
      }
      if (typeof fallback === 'string' && fallback.length > 0) {
        return fallback
      }
    }
  }
  if (error instanceof Error && /cancel/i.test(error.message)) {
    return t('attendance.qrCancelled')
  }
  if (isForbidden(error)) {
    return t('attendance.permissionDenied')
  }
  if (isStateConflict(error)) {
    return t('attendance.stateConflict')
  }
  return t('attendance.qrFailed')
}

function startLiveClock(): void {
  if (liveClockTimer) {
    return
  }
  liveClockTimer = setInterval(updateLiveClock, 1000)
}

function stopLiveClock(): void {
  if (!liveClockTimer) {
    return
  }
  clearInterval(liveClockTimer)
  liveClockTimer = null
}

function syncLiveClock(serverTime: string): void {
  const parsed = toLocalDateTime(serverTime).getTime()
  if (!Number.isFinite(parsed)) {
    resetLiveClock()
    return
  }
  serverClockBaseMs = parsed
  clientClockBaseMs = Date.now()
  liveServerTime.value = new Date(parsed)
}

function resetLiveClock(): void {
  serverClockBaseMs = null
  clientClockBaseMs = null
  liveServerTime.value = null
}

function updateLiveClock(): void {
  if (serverClockBaseMs == null || clientClockBaseMs == null) {
    return
  }
  liveServerTime.value = new Date(serverClockBaseMs + (Date.now() - clientClockBaseMs))
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(toLocalDate(value))
}

function formatLongDate(value: Date): string {
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'long',
  }).format(value)
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(toLocalDateTime(value))
}

function formatClockTime(value: Date): string {
  return new Intl.DateTimeFormat(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(value)
}

function formatAttendanceWindow(record: AttendanceResponse | null): string {
  if (!record?.clockInAt) {
    return t('attendance.noAttendance')
  }
  const start = formatDateTime(record.clockInAt)
  if (!record.clockOutAt) {
    return t('attendance.clockInOnly', { time: start })
  }
  return `${start} - ${formatTime(record.clockOutAt)}`
}

function formatDuration(minutes: number | null): string {
  const parts = toDurationParts(minutes)
  if (!parts) {
    return t('attendance.notProvided')
  }
  if (parts.hours === 0) {
    return t('schedule.durationMinutes', { minutes: parts.minutes })
  }
  return t('schedule.durationHoursMinutes', {
    hours: parts.hours,
    minutes: parts.minutes,
  })
}

function formatMetricDuration(minutes: number | null): string {
  const parts = toDurationParts(minutes)
  if (!parts) {
    return t('attendance.noTimeValue')
  }
  return `${String(parts.hours).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}`
}

function formatTime(value: string): string {
  if (value.includes('T')) {
    return new Intl.DateTimeFormat(locale.value, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(toLocalDateTime(value))
  }
  return value.slice(0, 5)
}

function formatNullableTime(value: string | null, fallback = t('attendance.noTimeValue')): string {
  return value ? formatTime(value) : fallback
}

function buildAttendanceMetric(
  currentState: AppAttendanceCurrentResponse | null,
  serverTime: Date | null,
): {
  checkIn: string
  checkOut: string
  total: string
} {
  const record =
    currentState?.openAttendance ??
    currentState?.latestAttendance ??
    sortAttendanceRecords(currentState?.todayAttendances ?? [])[0] ??
    null
  if (!record) {
    return {
      checkIn: t('attendance.noTimeValue'),
      checkOut: t('attendance.noTimeValue'),
      total: t('attendance.noTimeValue'),
    }
  }
  return {
    checkIn: formatNullableTime(record.clockInAt),
    checkOut: formatNullableTime(record.clockOutAt, t('attendance.notClockedOutValue')),
    total: formatMetricDuration(record.totalWorkMinutes ?? estimateOpenWorkMinutes(record, serverTime)),
  }
}

function estimateOpenWorkMinutes(
  record: AttendanceResponse,
  serverTime: Date | null,
): number | null {
  if (!record.clockInAt || record.clockOutAt || !serverTime) {
    return null
  }
  const startedAt = toLocalDateTime(record.clockInAt).getTime()
  const serverTimeMs = serverTime.getTime()
  if (!Number.isFinite(startedAt) || !Number.isFinite(serverTimeMs)) {
    return null
  }
  if (serverTimeMs < startedAt) {
    return 0
  }
  return Math.floor((serverTimeMs - startedAt) / 60000)
}

function toLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toLocalDateTime(value: string): Date {
  return new Date(value)
}
</script>
