<template>
  <section class="employee-schedule" aria-labelledby="schedule-heading">
    <div class="employee-schedule__header">
      <div>
        <p class="employee-schedule__eyebrow">{{ t('schedule.eyebrow') }}</p>
        <h2 id="schedule-heading">{{ t('screen.schedule.title') }}</h2>
      </div>
      <button
        class="employee-secondary-button employee-schedule__today"
        type="button"
        @click="goToday"
      >
        {{ t('schedule.today') }}
      </button>
    </div>

    <EmployeeStatePanel
      v-if="!selectedStore"
      tone="empty"
      :title="t('home.emptyTitle')"
      :message="t('home.emptyDescription')"
    />

    <template v-else>
      <div class="employee-schedule__controls">
        <div class="employee-segmented" role="group" :aria-label="t('schedule.viewMode')">
          <button
            v-for="item in viewModeItems"
            :key="item.mode"
            class="employee-segmented__button"
            :class="{ 'is-selected': mode === item.mode }"
            type="button"
            :aria-pressed="mode === item.mode"
            @click="setMode(item.mode)"
          >
            {{ t(item.labelKey) }}
          </button>
        </div>

        <div v-if="mode !== 'month'" class="employee-schedule-range">
          <button
            class="employee-icon-button employee-schedule-range__button"
            type="button"
            :aria-label="t('schedule.previous')"
            @click="movePeriod(-1)"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <p>{{ rangeLabel }}</p>
          <button
            class="employee-icon-button employee-schedule-range__button"
            type="button"
            :aria-label="t('schedule.next')"
            @click="movePeriod(1)"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      <EmployeeStatePanel
        v-if="loading"
        tone="loading"
        :message="t('schedule.loading')"
      />

      <EmployeeStatePanel
        v-else-if="errorMessage"
        tone="error"
        :title="t('schedule.errorTitle')"
        :message="errorMessage"
        :action-label="t('app.retry')"
        @action="loadSchedules"
      />

      <EmployeeStatePanel
        v-else-if="schedules.length === 0"
        tone="empty"
        :title="t('schedule.emptyTitle')"
        :message="t('schedule.emptyDescription')"
        :action-label="t('schedule.today')"
        @action="goToday"
      />

      <template v-else>
        <section
          v-if="mode === 'month'"
          class="employee-schedule-month"
          :aria-label="t('schedule.monthView')"
        >
          <header class="employee-schedule-month__header">
            <h3>{{ rangeLabel }}</h3>
            <div class="employee-schedule-month__nav">
              <button
                class="employee-schedule-month__nav-button"
                type="button"
                :aria-label="t('schedule.previous')"
                @click="movePeriod(-1)"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                class="employee-schedule-month__nav-button"
                type="button"
                :aria-label="t('schedule.next')"
                @click="movePeriod(1)"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </header>
          <div class="employee-schedule-month__weekdays" aria-hidden="true">
            <span v-for="weekday in weekdayLabels" :key="weekday">{{ weekday }}</span>
          </div>
          <div class="employee-schedule-month__grid">
            <button
              v-for="cell in monthCells"
              :key="cell.date"
              class="employee-schedule-day"
              :class="{
                'is-muted': !cell.inCurrentMonth,
                'is-today': cell.date === today,
                'has-schedules': cell.schedules.length > 0,
              }"
              type="button"
              :disabled="cell.schedules.length === 0"
              :aria-label="monthCellLabel(cell.date, cell.schedules.length)"
              @click="openSchedule(cell.schedules[0])"
            >
              <span class="employee-schedule-day__number">{{ dayNumber(cell.date) }}</span>
              <span
                v-if="cell.schedules.length > 0"
                class="employee-schedule-day__indicators"
                aria-hidden="true"
              >
                <span
                  v-for="dot in scheduleDots(cell.schedules.length)"
                  :key="dot"
                  class="employee-schedule-day__dot"
                ></span>
              </span>
            </button>
          </div>
        </section>

        <section
          v-else
          class="employee-schedule-list"
          :aria-label="mode === 'week' ? t('schedule.weekView') : t('schedule.listView')"
        >
          <article
            v-for="group in groupedSchedules"
            :key="group.date"
            class="employee-schedule-group"
          >
            <header class="employee-schedule-group__header">
              <span>{{ formatDate(group.date) }}</span>
              <span>{{ t('schedule.shiftCount', { count: group.schedules.length }) }}</span>
            </header>

            <button
              v-for="schedule in group.schedules"
              :key="schedule.scheduleId"
              class="employee-schedule-card"
              type="button"
              @click="openSchedule(schedule)"
            >
              <span class="employee-schedule-card__time">
                {{ formatTimeRange(schedule) }}
              </span>
              <span
                class="employee-schedule-status"
                :class="`employee-schedule-status--${scheduleStatusTone(schedule.status)}`"
              >
                {{ t(scheduleStatusKey(schedule.status)) }}
              </span>
              <span v-if="schedule.memo" class="employee-schedule-card__memo">
                {{ schedule.memo }}
              </span>
            </button>
          </article>
        </section>
      </template>
    </template>
  </section>

  <section
    v-if="selectedSchedule || detailLoading || detailError"
    class="employee-schedule-detail"
    aria-labelledby="schedule-detail-heading"
  >
    <div class="employee-schedule-detail__header">
      <div>
        <p class="employee-schedule__eyebrow">{{ t('schedule.detailEyebrow') }}</p>
        <h2 id="schedule-detail-heading">{{ t('schedule.detailTitle') }}</h2>
      </div>
      <button
        class="employee-icon-button"
        type="button"
        :aria-label="t('schedule.closeDetail')"
        @click="closeDetail"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>

    <EmployeeStatePanel
      v-if="detailLoading"
      tone="loading"
      :message="t('schedule.detailLoading')"
    />

    <EmployeeStatePanel
      v-else-if="detailError"
      tone="error"
      :title="t('schedule.detailErrorTitle')"
      :message="detailError"
      :action-label="t('app.retry')"
      @action="retryDetail"
    />

    <dl v-else-if="selectedSchedule" class="employee-schedule-detail__grid">
      <div>
        <dt>{{ t('schedule.detailDate') }}</dt>
        <dd>{{ formatDate(selectedSchedule.workDate) }}</dd>
      </div>
      <div>
        <dt>{{ t('schedule.detailTime') }}</dt>
        <dd>{{ formatTimeRange(selectedSchedule) }}</dd>
      </div>
      <div>
        <dt>{{ t('schedule.detailDuration') }}</dt>
        <dd>{{ formatDuration(selectedSchedule.scheduledWorkMinutes) }}</dd>
      </div>
      <div>
        <dt>{{ t('schedule.detailBreak') }}</dt>
        <dd>{{ formatBreak(selectedSchedule.breakMinutes) }}</dd>
      </div>
      <div>
        <dt>{{ t('schedule.detailStatus') }}</dt>
        <dd>
          <span
            class="employee-schedule-status"
            :class="`employee-schedule-status--${scheduleStatusTone(selectedSchedule.status)}`"
          >
            {{ t(scheduleStatusKey(selectedSchedule.status)) }}
          </span>
        </dd>
      </div>
      <div class="employee-schedule-detail__memo">
        <dt>{{ t('schedule.detailMemo') }}</dt>
        <dd>{{ selectedSchedule.memo || t('schedule.noMemo') }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmployeeAppContext } from '@/app/employeeAppContext'
import { isUnauthorized } from '@/api/client'
import { loadEmployeeScheduleDetail, loadEmployeeSchedules } from '@/api/schedule'
import type { ScheduleResponse } from '@/api/types'
import EmployeeStatePanel from '@/component/EmployeeStatePanel.vue'
import {
  buildScheduleMonthCells,
  groupSchedulesByDate,
  resolveScheduleDateRange,
  scheduleStatusKey,
  scheduleStatusTone,
  shiftScheduleCursor,
  sortSchedules,
  todayDateText,
} from '@/schedule/scheduleViewModel'
import type { ScheduleMonthCell, ScheduleViewMode } from '@/schedule/scheduleViewModel'

const { t, locale } = useI18n()
const { selectedStore, logout } = useEmployeeAppContext()

const viewModeItems: { mode: ScheduleViewMode; labelKey: string }[] = [
  { mode: 'month', labelKey: 'schedule.mode.month' },
  { mode: 'week', labelKey: 'schedule.mode.week' },
  { mode: 'list', labelKey: 'schedule.mode.list' },
]

const mode = ref<ScheduleViewMode>('month')
const cursorDate = ref(todayDateText())
const today = todayDateText()
const loading = ref(false)
const errorMessage = ref('')
const scheduleItems = ref<ScheduleResponse[]>([])
const selectedSchedule = ref<ScheduleResponse | null>(null)
const detailLoading = ref(false)
const detailError = ref('')
const detailScheduleId = ref('')
let scheduleRequestId = 0
let detailRequestId = 0

const currentRange = computed(() => resolveScheduleDateRange(mode.value, cursorDate.value))
const schedules = computed(() => sortSchedules(scheduleItems.value))
const groupedSchedules = computed(() => groupSchedulesByDate(schedules.value))
const monthCells = computed<ScheduleMonthCell[]>(() =>
  buildScheduleMonthCells(cursorDate.value, schedules.value),
)
const rangeLabel = computed(() => {
  const range = currentRange.value
  if (mode.value === 'week') {
    return `${formatDate(range.startDate)} - ${formatDate(range.endDate)}`
  }
  return formatMonth(cursorDate.value)
})
const weekdayLabels = computed(() => [
  t('schedule.weekday.sun'),
  t('schedule.weekday.mon'),
  t('schedule.weekday.tue'),
  t('schedule.weekday.wed'),
  t('schedule.weekday.thu'),
  t('schedule.weekday.fri'),
  t('schedule.weekday.sat'),
])

watch(
  [() => selectedStore.value?.storeId, mode, cursorDate],
  () => {
    void loadSchedules()
  },
  { immediate: true },
)

async function loadSchedules(): Promise<void> {
  const storeId = selectedStore.value?.storeId
  const requestId = ++scheduleRequestId
  selectedSchedule.value = null
  detailError.value = ''
  detailScheduleId.value = ''

  if (!storeId) {
    scheduleItems.value = []
    loading.value = false
    errorMessage.value = ''
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await loadEmployeeSchedules({
      storeId,
      startDate: currentRange.value.startDate,
      endDate: currentRange.value.endDate,
      page: 0,
      size: 200,
    })
    if (requestId === scheduleRequestId) {
      scheduleItems.value = response.items
    }
  } catch (error) {
    if (requestId !== scheduleRequestId) {
      return
    }
    scheduleItems.value = []
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    errorMessage.value = t('schedule.errorDescription')
  } finally {
    if (requestId === scheduleRequestId) {
      loading.value = false
    }
  }
}

function setMode(nextMode: ScheduleViewMode): void {
  mode.value = nextMode
}

function movePeriod(direction: -1 | 1): void {
  cursorDate.value = shiftScheduleCursor(mode.value, cursorDate.value, direction)
}

function goToday(): void {
  cursorDate.value = todayDateText()
}

async function openSchedule(schedule: ScheduleResponse): Promise<void> {
  const storeId = selectedStore.value?.storeId
  if (!storeId) {
    return
  }

  const requestId = ++detailRequestId
  selectedSchedule.value = schedule
  detailScheduleId.value = schedule.scheduleId
  detailLoading.value = true
  detailError.value = ''

  try {
    const response = await loadEmployeeScheduleDetail(storeId, schedule.scheduleId)
    if (requestId === detailRequestId) {
      selectedSchedule.value = response
    }
  } catch (error) {
    if (requestId !== detailRequestId) {
      return
    }
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    detailError.value = t('schedule.detailErrorDescription')
  } finally {
    if (requestId === detailRequestId) {
      detailLoading.value = false
    }
  }
}

function retryDetail(): void {
  const schedule = schedules.value.find((item) => item.scheduleId === detailScheduleId.value)
  if (schedule) {
    void openSchedule(schedule)
  }
}

function closeDetail(): void {
  selectedSchedule.value = null
  detailError.value = ''
  detailScheduleId.value = ''
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(toLocalDate(value))
}

function formatMonth(value: string): string {
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
  }).format(toLocalDate(value))
}

function formatTimeRange(schedule: ScheduleResponse): string {
  return `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`
}

function formatTime(value: string): string {
  return value.slice(0, 5)
}

function formatDuration(minutes: number | null): string {
  if (minutes == null) {
    return t('schedule.notProvided')
  }
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (hours === 0) {
    return t('schedule.durationMinutes', { minutes: remainder })
  }
  return t('schedule.durationHoursMinutes', { hours, minutes: remainder })
}

function formatBreak(minutes: number | null): string {
  if (minutes == null) {
    return t('schedule.notProvided')
  }
  return t('schedule.durationMinutes', { minutes })
}

function monthCellLabel(date: string, count: number): string {
  return t('schedule.monthCellLabel', {
    date: formatDate(date),
    count,
  })
}

function dayNumber(date: string): string {
  return String(Number(date.slice(8, 10)))
}

function scheduleDots(count: number): number[] {
  return Array.from({ length: Math.min(count, 2) }, (_, index) => index)
}

function toLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}
</script>
