<template>
  <section class="employee-attendance" aria-labelledby="attendance-heading">
    <div class="employee-attendance__header">
      <div>
        <p class="employee-attendance__eyebrow">{{ t('attendance.eyebrow') }}</p>
        <h2 id="attendance-heading">{{ t('screen.attendance.title') }}</h2>
      </div>
      <EmployeeRefreshButton
        class="employee-attendance__refresh"
        :label="t('attendance.refresh')"
        :disabled="loading || actionSubmitting || qrScanSubmitting"
        @click="loadCurrent"
      />
    </div>

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
          <div class="employee-attendance-card__top">
            <div>
              <p class="employee-attendance-card__label">{{ t('attendance.currentLabel') }}</p>
              <h3 id="attendance-status-heading">
                {{ t(attendanceCurrentStatusKey(current.status)) }}
              </h3>
            </div>
            <span
              class="employee-attendance-status"
              :class="`employee-attendance-status--${attendanceCurrentTone(current.status)}`"
            >
              {{ t(attendanceCurrentStatusKey(current.status)) }}
            </span>
          </div>

          <p class="employee-attendance-card__description">
            {{ t(currentDescriptionKey) }}
          </p>

          <dl class="employee-attendance-meta">
            <div>
              <dt>{{ t('attendance.serverTime') }}</dt>
              <dd>{{ formatDateTime(current.serverTime) }}</dd>
            </div>
            <div>
              <dt>{{ t('attendance.workDate') }}</dt>
              <dd>{{ formatDate(current.workDate) }}</dd>
            </div>
            <div>
              <dt>{{ t('attendance.scheduledShift') }}</dt>
              <dd>{{ formatSchedule(current.scheduledShift) }}</dd>
            </div>
            <div>
              <dt>{{ t('attendance.openAttendance') }}</dt>
              <dd>{{ formatAttendanceWindow(current.openAttendance) }}</dd>
            </div>
          </dl>

          <label v-if="attendanceAction === 'CLOCK_OUT'" class="employee-field employee-attendance-break">
            <span class="employee-field__label">{{ t('attendance.breakMinutes') }}</span>
            <input
              v-model="breakMinutesInput"
              class="employee-field__control"
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
              :aria-invalid="breakMinutesInvalid"
            />
            <span v-if="breakMinutesInvalid" class="employee-attendance-break__error">
              {{ t('attendance.breakInvalid') }}
            </span>
          </label>

          <p v-if="actionError" class="employee-attendance-action-error" role="alert">
            {{ actionError }}
          </p>

          <button
            class="employee-primary-button employee-attendance-action"
            type="button"
            :disabled="actionDisabled"
            :aria-busy="actionSubmitting || qrScanSubmitting"
            @click="submitAction"
          >
            {{ primaryActionLabel }}
          </button>

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
              class="employee-attendance-record"
            >
              <div class="employee-attendance-record__main">
                <span>{{ formatAttendanceWindow(record) }}</span>
                <span
                  class="employee-attendance-status"
                  :class="`employee-attendance-status--${attendanceRecordTone(record.status)}`"
                >
                  {{ t(attendanceRecordStatusKey(record.status)) }}
                </span>
              </div>
              <dl class="employee-attendance-record__meta">
                <div>
                  <dt>{{ t('attendance.totalWork') }}</dt>
                  <dd>{{ formatDuration(record.totalWorkMinutes) }}</dd>
                </div>
                <div>
                  <dt>{{ t('attendance.breakMinutes') }}</dt>
                  <dd>{{ formatDuration(record.breakMinutes) }}</dd>
                </div>
              </dl>
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
import type { AppAttendanceCurrentResponse, AttendanceResponse, ScheduleResponse } from '@/api/types'
import EmployeeRefreshButton from '@/component/EmployeeRefreshButton.vue'
import EmployeeStatePanel from '@/component/EmployeeStatePanel.vue'
import { registerBrowserResumeHandler, type ResumeHandlerCleanup } from '@/runtime/appResume'
import { getCurrentQrLocation, scanAttendanceQr } from '@/attendance/qrScanner'
import {
  attendanceActionLabelKey,
  attendanceCurrentStatusKey,
  attendanceCurrentTone,
  attendanceRecordStatusKey,
  attendanceRecordTone,
  buildClockInRequest,
  buildClockOutRequest,
  isValidBreakMinutesInput,
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
const breakMinutesInput = ref('')
let currentRequestId = 0
let cleanupResumeHandler: ResumeHandlerCleanup | null = null

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
const breakMinutesInvalid = computed(() => !isValidBreakMinutesInput(breakMinutesInput.value))
const actionDisabled = computed(
  () =>
    loading.value ||
    actionSubmitting.value ||
    qrScanSubmitting.value ||
    attendanceAction.value === 'NONE' ||
    (attendanceAction.value === 'CLOCK_OUT' && breakMinutesInvalid.value),
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
    breakMinutesInput.value = ''
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
  if (typeof document !== 'undefined') {
    cleanupResumeHandler = registerBrowserResumeHandler(() => {
      void loadCurrent()
    })
  }
})

onBeforeUnmount(() => {
  cleanupResumeHandler?.()
  cleanupResumeHandler = null
})

async function loadCurrent(): Promise<void> {
  const storeId = selectedStore.value?.storeId
  const requestId = ++currentRequestId

  if (!storeId) {
    current.value = null
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
      const request = buildClockOutRequest(current.value, breakMinutesInput.value)
      if (!request) {
        actionError.value = t('attendance.stateConflict')
        return
      }
      await clockOutEmployee(request)
      breakMinutesInput.value = ''
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(toLocalDate(value))
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(toLocalDateTime(value))
}

function formatSchedule(schedule: ScheduleResponse | null): string {
  if (!schedule) {
    return t('attendance.noSchedule')
  }
  return `${formatDate(schedule.workDate)} ${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`
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

function formatTime(value: string): string {
  if (value.includes('T')) {
    return value.slice(11, 16)
  }
  return value.slice(0, 5)
}

function toLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toLocalDateTime(value: string): Date {
  return new Date(value)
}
</script>
