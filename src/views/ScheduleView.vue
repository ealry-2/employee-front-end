<template>
  <section class="employee-schedule" :aria-label="t('screen.schedule.title')">
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
        v-else-if="mode !== 'month' && schedules.length === 0"
        tone="empty"
        :title="t('schedule.emptyTitle')"
        :message="t('schedule.emptyDescription')"
        :action-label="t('schedule.today')"
        @action="goToday"
      />

      <template v-else>
        <template v-if="mode === 'month'">
          <section
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
                  'is-selected': cell.date === selectedMonthDate,
                  'has-schedules': cell.schedules.length > 0,
                }"
                type="button"
                :aria-label="monthCellLabel(cell.date, cell.schedules.length)"
                @click="selectMonthDate(cell)"
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

          <section class="employee-schedule-month-agenda" :aria-label="t('schedule.monthAgendaTitle')">
            <header class="employee-schedule-month-agenda__header">
              <h3>{{ t('schedule.monthAgendaTitle') }}</h3>
              <span>{{ selectedMonthDateLabel }}</span>
            </header>
            <p
              v-if="selectedMonthSchedules.length === 0"
              class="employee-schedule-month-agenda__empty"
            >
              {{ t('schedule.selectedDateEmpty') }}
            </p>
            <EmployeeWorkCard
              v-for="schedule in selectedMonthSchedules"
              :key="schedule.scheduleId"
              class="employee-schedule-month-agenda__card"
              :title="selectedStore.name"
              :location="selectedStore.address || t('schedule.notProvided')"
              :memo="schedule.memo"
              :start-time="formatTime(schedule.startTime)"
              :start-label="t('schedule.startLabel')"
              :end-time="formatTime(schedule.endTime)"
              :end-label="t('schedule.endLabel')"
              :status-label="t(scheduleStatusKey(schedule.status))"
              :status-tone="scheduleStatusTone(schedule.status)"
              :accessible-summary="scheduleAccessibleSummary(schedule)"
              interactive
              @select="openSchedule(schedule)"
            >
              <template #footer>
                <div
                  v-if="scheduleCoworkers(schedule).length > 0"
                  class="employee-schedule-coworkers"
                  :aria-label="t('schedule.coworkers')"
                >
                  <button
                    class="employee-schedule-coworker-toggle"
                    type="button"
                    :aria-expanded="openCoworkerListScheduleId === schedule.scheduleId"
                    @click="toggleCoworkerList(schedule)"
                  >
                    <span class="employee-schedule-coworker-stack" aria-hidden="true">
                      <span
                        v-for="coworker in visibleCoworkers(schedule)"
                        :key="coworker.employeeId"
                        class="employee-schedule-coworker-badge"
                      >
                        {{ coworkerInitial(coworker.name) }}
                      </span>
                    </span>
                    {{ coworkerListLabel(schedule) }}
                  </button>
                </div>
              </template>

              <div
                v-if="openCoworkerListScheduleId === schedule.scheduleId"
                class="employee-schedule-coworker-list"
              >
                <button
                  v-for="coworker in scheduleCoworkers(schedule)"
                  :key="coworker.employeeId"
                  class="employee-schedule-coworker-row"
                  type="button"
                  @click="openCoworkerDetail(schedule, coworker)"
                >
                  <span class="employee-schedule-coworker-badge" aria-hidden="true">
                    {{ coworkerInitial(coworker.name) }}
                  </span>
                  <span>
                    <strong>{{ coworker.name }}</strong>
                    <small>{{ coworkerSummary(coworker) }}</small>
                  </span>
                </button>
              </div>
            </EmployeeWorkCard>
          </section>
        </template>

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

            <EmployeeWorkCard
              v-for="schedule in group.schedules"
              :key="schedule.scheduleId"
              :title="selectedStore.name"
              :location="selectedStore.address || t('schedule.notProvided')"
              :memo="schedule.memo"
              :start-time="formatTime(schedule.startTime)"
              :start-label="t('schedule.startLabel')"
              :end-time="formatTime(schedule.endTime)"
              :end-label="t('schedule.endLabel')"
              :status-label="t(scheduleStatusKey(schedule.status))"
              :status-tone="scheduleStatusTone(schedule.status)"
              :accessible-summary="scheduleAccessibleSummary(schedule)"
              interactive
              @select="openSchedule(schedule)"
            >
              <template #footer>
                <div
                  v-if="scheduleCoworkers(schedule).length > 0"
                  class="employee-schedule-coworkers"
                  :aria-label="t('schedule.coworkers')"
                >
                  <button
                    class="employee-schedule-coworker-toggle"
                    type="button"
                    :aria-expanded="openCoworkerListScheduleId === schedule.scheduleId"
                    @click="toggleCoworkerList(schedule)"
                  >
                    <span class="employee-schedule-coworker-stack" aria-hidden="true">
                      <span
                        v-for="coworker in visibleCoworkers(schedule)"
                        :key="coworker.employeeId"
                        class="employee-schedule-coworker-badge"
                      >
                        {{ coworkerInitial(coworker.name) }}
                      </span>
                    </span>
                    {{ coworkerListLabel(schedule) }}
                  </button>
                </div>
              </template>

              <div
                v-if="openCoworkerListScheduleId === schedule.scheduleId"
                class="employee-schedule-coworker-list"
              >
                <button
                  v-for="coworker in scheduleCoworkers(schedule)"
                  :key="coworker.employeeId"
                  class="employee-schedule-coworker-row"
                  type="button"
                  @click="openCoworkerDetail(schedule, coworker)"
                >
                  <span class="employee-schedule-coworker-badge" aria-hidden="true">
                    {{ coworkerInitial(coworker.name) }}
                  </span>
                  <span>
                    <strong>{{ coworker.name }}</strong>
                    <small>{{ coworkerSummary(coworker) }}</small>
                  </span>
                </button>
              </div>
            </EmployeeWorkCard>
          </article>
        </section>
      </template>
    </template>
  </section>

  <div
    v-if="selectedSchedule || detailLoading || detailError"
    class="employee-schedule-detail-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="schedule-detail-heading"
    @click.self="closeDetail"
  >
    <section class="employee-schedule-detail">
      <div class="employee-schedule-detail__header">
        <div>
          <p class="employee-schedule__eyebrow">{{ t('schedule.detailEyebrow') }}</p>
          <h2 id="schedule-detail-heading">{{ t('schedule.detailTitle') }}</h2>
        </div>
        <button
          class="employee-close-button"
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
              class="employee-work-status"
              :class="`employee-work-status--${scheduleStatusTone(selectedSchedule.status)}`"
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
  </div>

  <div
    v-if="selectedCoworker"
    class="employee-schedule-coworker-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="schedule-coworker-heading"
    @click.self="closeCoworkerDetail"
  >
    <section class="employee-schedule-coworker-modal__panel">
      <header>
        <div>
          <p class="employee-schedule__eyebrow">{{ t('schedule.coworkerModalEyebrow') }}</p>
          <h2 id="schedule-coworker-heading">{{ selectedCoworker.coworker.name }}</h2>
        </div>
        <button
          class="employee-close-button"
          type="button"
          :aria-label="t('schedule.closeCoworkerDetail')"
          @click="closeCoworkerDetail"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>
      <dl class="employee-schedule-coworker-modal__grid">
        <div>
          <dt>{{ t('schedule.coworkerRole') }}</dt>
          <dd>{{ selectedCoworker.coworker.role || t('schedule.notProvided') }}</dd>
        </div>
        <div>
          <dt>{{ t('schedule.detailTime') }}</dt>
          <dd>{{ coworkerSummary(selectedCoworker.coworker) }}</dd>
        </div>
        <div>
          <dt>{{ t('schedule.detailDate') }}</dt>
          <dd>{{ formatDate(selectedCoworker.schedule.workDate) }}</dd>
        </div>
        <div>
          <dt>{{ t('home.store') }}</dt>
          <dd>{{ selectedStore?.name || t('schedule.notProvided') }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmployeeAppContext } from '@/app/employeeAppContext'
import { isUnauthorized } from '@/api/client'
import { loadEmployeeScheduleDetail, loadEmployeeSchedules } from '@/api/schedule'
import type { ScheduleCoworkerSummary, ScheduleResponse } from '@/api/types'
import EmployeeStatePanel from '@/component/EmployeeStatePanel.vue'
import EmployeeWorkCard from '@/component/EmployeeWorkCard.vue'
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
const selectedMonthDate = ref(today)
const selectedSchedule = ref<ScheduleResponse | null>(null)
const openCoworkerListScheduleId = ref('')
const selectedCoworker = ref<{
  schedule: ScheduleResponse
  coworker: ScheduleCoworkerSummary
} | null>(null)
const detailLoading = ref(false)
const detailError = ref('')
const detailScheduleId = ref('')
let scheduleRequestId = 0
let detailRequestId = 0

const currentRange = computed(() => resolveScheduleDateRange(mode.value, cursorDate.value))
const schedules = computed(() => sortSchedules(scheduleItems.value))
const groupedSchedules = computed(() => groupSchedulesByDate(schedules.value))
const selectedMonthSchedules = computed(() =>
  schedules.value.filter((schedule) => schedule.workDate === selectedMonthDate.value),
)
const selectedMonthDateLabel = computed(() => formatDate(selectedMonthDate.value))
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
      syncSelectedMonthDate()
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
  selectedMonthDate.value = todayDateText()
}

function selectMonthDate(cell: ScheduleMonthCell): void {
  selectedMonthDate.value = cell.date
  openCoworkerListScheduleId.value = ''
}

function syncSelectedMonthDate(): void {
  if (mode.value !== 'month') {
    return
  }
  const range = currentRange.value
  if (selectedMonthDate.value >= range.startDate && selectedMonthDate.value <= range.endDate) {
    return
  }
  selectedMonthDate.value =
    today >= range.startDate && today <= range.endDate ? today : range.startDate
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

function scheduleCoworkers(schedule: ScheduleResponse): ScheduleCoworkerSummary[] {
  return schedule.coworkers ?? []
}

function visibleCoworkers(schedule: ScheduleResponse): ScheduleCoworkerSummary[] {
  return scheduleCoworkers(schedule).slice(0, 2)
}

function toggleCoworkerList(schedule: ScheduleResponse): void {
  openCoworkerListScheduleId.value =
    openCoworkerListScheduleId.value === schedule.scheduleId ? '' : schedule.scheduleId
}

function openCoworkerDetail(
  schedule: ScheduleResponse,
  coworker: ScheduleCoworkerSummary,
): void {
  selectedCoworker.value = { schedule, coworker }
}

function closeCoworkerDetail(): void {
  selectedCoworker.value = null
}

function coworkerInitial(name: string): string {
  return name.trim().slice(0, 1)
}

function coworkerListLabel(schedule: ScheduleResponse): string {
  return t('schedule.coworkerGroupLabel', { count: scheduleCoworkers(schedule).length })
}

function coworkerSummary(coworker: ScheduleCoworkerSummary): string {
  if (!coworker.startTime || !coworker.endTime) {
    return coworker.role || t('schedule.notProvided')
  }
  const timeRange = `${formatTime(coworker.startTime)} - ${formatTime(coworker.endTime)}`
  if (!coworker.role) {
    return timeRange
  }
  return `${coworker.role} · ${timeRange}`
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

function scheduleAccessibleSummary(schedule: ScheduleResponse): string {
  return `${formatTimeRange(schedule)} ${t(scheduleStatusKey(schedule.status))}`
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
