<template>
  <section class="employee-payroll" aria-labelledby="payroll-heading">
    <div class="employee-payroll__header">
      <div>
        <p class="employee-payroll__eyebrow">{{ t('payroll.eyebrow') }}</p>
        <h2 id="payroll-heading">{{ t('screen.payroll.title') }}</h2>
      </div>
      <EmployeeRefreshButton
        class="employee-payroll__refresh"
        :label="t('payroll.refresh')"
        :disabled="loading"
        @click="loadPayrolls"
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
        v-if="loading && payrolls.length === 0"
        tone="loading"
        :message="t('payroll.loading')"
      />

      <EmployeeStatePanel
        v-else-if="errorMessage && payrolls.length === 0"
        tone="error"
        :title="t('payroll.errorTitle')"
        :message="errorMessage"
        :action-label="t('app.retry')"
        @action="loadPayrolls"
      />

      <EmployeeStatePanel
        v-else-if="payrolls.length === 0"
        tone="empty"
        :title="t('payroll.emptyTitle')"
        :message="t('payroll.emptyDescription')"
        :action-label="t('payroll.refresh')"
        @action="loadPayrolls"
      />

      <template v-else>
        <section v-if="latest" class="employee-payroll-latest" aria-labelledby="payroll-summary-heading">
          <div class="employee-payroll-latest__top">
            <div>
              <span class="employee-payroll-latest__badge">{{ t('payroll.latestEyebrow') }}</span>
              <p class="employee-payroll-latest__period">{{ formatMonth(latest.payPeriodEnd) }}</p>
            </div>
            <span class="employee-payroll-latest__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M4 7h16v10H4z" />
                <path d="M7 10h5" />
                <path d="M16 10h1" />
                <path d="M7 14h10" />
              </svg>
            </span>
          </div>

          <div class="employee-payroll-latest__amount">
            <h3 id="payroll-summary-heading">{{ formatMoney(latest.netPay) }}</h3>
            <p>{{ t('payroll.netPayDescription') }}</p>
          </div>

          <div class="employee-payroll-latest__breakdown">
            <section
              class="employee-payroll-latest__section"
              :class="{ 'is-open': latestEarningsOpen }"
              aria-labelledby="payroll-latest-earnings-heading"
            >
              <button
                class="employee-payroll-latest__section-toggle"
                type="button"
                :aria-expanded="latestEarningsOpen"
                aria-controls="payroll-latest-earnings-list"
                :aria-label="t('payroll.toggleEarnings')"
                @click="latestEarningsOpen = !latestEarningsOpen"
              >
                <span>
                  <span id="payroll-latest-earnings-heading">{{ t('payroll.earnings') }}</span>
                  <strong>{{ formatMoney(latest.grossPay) }}</strong>
                </span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="m8 10 4 4 4-4" />
                </svg>
              </button>
              <dl id="payroll-latest-earnings-list" v-show="latestEarningsOpen">
                <div>
                  <dt>{{ t('payroll.basePay') }}</dt>
                  <dd>{{ formatMoney(latest.basePay) }}</dd>
                </div>
                <div>
                  <dt>{{ t('payroll.overtimePay') }}</dt>
                  <dd class="employee-payroll-latest__positive">{{ formatMoney(latest.overtimePay) }}</dd>
                </div>
                <div>
                  <dt>{{ t('payroll.nightPay') }}</dt>
                  <dd class="employee-payroll-latest__positive">{{ formatMoney(latest.nightPay) }}</dd>
                </div>
                <div>
                  <dt>{{ t('payroll.holidayPay') }}</dt>
                  <dd class="employee-payroll-latest__positive">{{ formatMoney(latest.holidayPay) }}</dd>
                </div>
                <div>
                  <dt>{{ t('payroll.weeklyHolidayPay') }}</dt>
                  <dd class="employee-payroll-latest__positive">{{ formatMoney(latest.weeklyHolidayPay) }}</dd>
                </div>
              </dl>
            </section>

            <section
              class="employee-payroll-latest__section"
              :class="{ 'is-open': latestDeductionsOpen }"
              aria-labelledby="payroll-latest-deductions-heading"
            >
              <button
                class="employee-payroll-latest__section-toggle"
                type="button"
                :aria-expanded="latestDeductionsOpen"
                aria-controls="payroll-latest-deductions-list"
                :aria-label="t('payroll.toggleDeductions')"
                @click="latestDeductionsOpen = !latestDeductionsOpen"
              >
                <span>
                  <span id="payroll-latest-deductions-heading">{{ t('payroll.deductions') }}</span>
                  <strong class="employee-payroll-latest__negative">
                    {{ formatMoney(negativeAmount(latest.totalDeductions)) }}
                  </strong>
                </span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="m8 10 4 4 4-4" />
                </svg>
              </button>
              <dl id="payroll-latest-deductions-list" v-show="latestDeductionsOpen">
                <div>
                  <dt>{{ t('payroll.nationalPension') }}</dt>
                  <dd class="employee-payroll-latest__negative">
                    {{ formatMoney(negativeAmount(latest.nationalPension)) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('payroll.healthInsurance') }}</dt>
                  <dd class="employee-payroll-latest__negative">
                    {{ formatMoney(negativeAmount(latest.healthInsurance)) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('payroll.longTermCare') }}</dt>
                  <dd class="employee-payroll-latest__negative">
                    {{ formatMoney(negativeAmount(latest.longTermCare)) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('payroll.employmentInsurance') }}</dt>
                  <dd class="employee-payroll-latest__negative">
                    {{ formatMoney(negativeAmount(latest.employmentInsurance)) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('payroll.incomeTax') }}</dt>
                  <dd class="employee-payroll-latest__negative">
                    {{ formatMoney(negativeAmount(latest.incomeTax)) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('payroll.localIncomeTax') }}</dt>
                  <dd class="employee-payroll-latest__negative">
                    {{ formatMoney(negativeAmount(latest.localIncomeTax)) }}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <button class="employee-payroll-latest__download" type="button" disabled>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 4v10" />
              <path d="m8 10 4 4 4-4" />
              <path d="M5 20h14" />
            </svg>
            <span>{{ t('payroll.downloadUnavailable') }}</span>
          </button>
        </section>

        <section class="employee-payroll-history" aria-labelledby="payroll-list-heading">
          <div class="employee-payroll-list__header">
            <h3 id="payroll-list-heading">{{ t('payroll.historyTitle') }}</h3>
            <span>{{ t('payroll.listCount', { count: historyPayrolls.length }) }}</span>
          </div>

          <button
            v-for="payroll in historyPayrolls"
            :key="payroll.payrollId"
            class="employee-payroll-card"
            :class="{ 'is-selected': selectedPayroll?.payrollId === payroll.payrollId }"
            type="button"
            @click="selectPayroll(payroll)"
          >
            <span class="employee-payroll-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M7 3v3" />
                <path d="M17 3v3" />
                <path d="M4 8h16" />
                <path d="M5 5h14v15H5z" />
                <path d="M8 12h2" />
                <path d="M12 12h2" />
                <path d="M8 16h2" />
                <path d="M12 16h2" />
              </svg>
            </span>
            <span class="employee-payroll-card__main">
              <span class="employee-payroll-card__period">{{ formatMonth(payroll.payPeriodEnd) }}</span>
              <span class="employee-payroll-card__meta">{{ formatPaidDate(payroll) }}</span>
            </span>
            <span class="employee-payroll-card__side">
              <span class="employee-payroll-card__amount">{{ formatMoney(payroll.netPay) }}</span>
              <span
                class="employee-payroll-status"
                :class="`employee-payroll-status--${payrollStatusTone(payroll.status)}`"
              >
                {{ t(payrollStatusKey(payroll.status)) }}
              </span>
            </span>
          </button>
        </section>
      </template>
    </template>
  </section>

  <section
    v-if="selectedPayroll"
    class="employee-payroll-detail"
    aria-labelledby="payroll-detail-heading"
  >
    <div class="employee-payroll-detail__header">
      <div>
        <p class="employee-payroll__eyebrow">{{ t('payroll.detailEyebrow') }}</p>
        <h2 id="payroll-detail-heading">{{ t('payroll.detailTitle') }}</h2>
      </div>
      <button
        class="employee-icon-button"
        type="button"
        :aria-label="t('payroll.closeDetail')"
        @click="selectedPayroll = null"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>

    <dl class="employee-payroll-detail__grid">
      <div>
        <dt>{{ t('payroll.period') }}</dt>
        <dd>{{ formatPeriod(selectedPayroll) }}</dd>
      </div>
      <div>
        <dt>{{ t('payroll.statusLabel') }}</dt>
        <dd>{{ t(payrollStatusKey(selectedPayroll.status)) }}</dd>
      </div>
      <div>
        <dt>{{ t('payroll.compensationType') }}</dt>
        <dd>{{ t(compensationTypeKey(selectedPayroll.compensationTypeSnapshot)) }}</dd>
      </div>
      <div>
        <dt>{{ t('payroll.netPay') }}</dt>
        <dd>{{ formatMoney(selectedPayroll.netPay) }}</dd>
      </div>
    </dl>

    <section class="employee-payroll-breakdown" aria-labelledby="payroll-earnings-heading">
      <h3 id="payroll-earnings-heading">{{ t('payroll.earnings') }}</h3>
      <dl>
        <div>
          <dt>{{ t('payroll.basePay') }}</dt>
          <dd>{{ formatMoney(selectedPayroll.basePay) }}</dd>
        </div>
        <div>
          <dt>{{ t('payroll.overtimePay') }}</dt>
          <dd>{{ formatMoney(selectedPayroll.overtimePay) }}</dd>
        </div>
        <div>
          <dt>{{ t('payroll.nightPay') }}</dt>
          <dd>{{ formatMoney(selectedPayroll.nightPay) }}</dd>
        </div>
        <div>
          <dt>{{ t('payroll.holidayPay') }}</dt>
          <dd>{{ formatMoney(selectedPayroll.holidayPay) }}</dd>
        </div>
        <div>
          <dt>{{ t('payroll.weeklyHolidayPay') }}</dt>
          <dd>{{ formatMoney(selectedPayroll.weeklyHolidayPay) }}</dd>
        </div>
      </dl>
    </section>

    <section class="employee-payroll-breakdown" aria-labelledby="payroll-deductions-heading">
      <h3 id="payroll-deductions-heading">{{ t('payroll.deductions') }}</h3>
      <dl>
        <div>
          <dt>{{ t('payroll.nationalPension') }}</dt>
          <dd>{{ formatMoney(selectedPayroll.nationalPension) }}</dd>
        </div>
        <div>
          <dt>{{ t('payroll.healthInsurance') }}</dt>
          <dd>{{ formatMoney(selectedPayroll.healthInsurance) }}</dd>
        </div>
        <div>
          <dt>{{ t('payroll.longTermCare') }}</dt>
          <dd>{{ formatMoney(selectedPayroll.longTermCare) }}</dd>
        </div>
        <div>
          <dt>{{ t('payroll.employmentInsurance') }}</dt>
          <dd>{{ formatMoney(selectedPayroll.employmentInsurance) }}</dd>
        </div>
        <div>
          <dt>{{ t('payroll.incomeTax') }}</dt>
          <dd>{{ formatMoney(selectedPayroll.incomeTax) }}</dd>
        </div>
        <div>
          <dt>{{ t('payroll.localIncomeTax') }}</dt>
          <dd>{{ formatMoney(selectedPayroll.localIncomeTax) }}</dd>
        </div>
      </dl>
    </section>

    <p v-if="hasSensitivePayrollPath(selectedPayroll)" class="employee-payroll-detail__warning">
      {{ t('payroll.sensitivePathWarning') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmployeeAppContext } from '@/app/employeeAppContext'
import { isForbidden, isUnauthorized } from '@/api/client'
import { loadMyPayrolls } from '@/api/payroll'
import type { PayrollResponse } from '@/api/types'
import EmployeeRefreshButton from '@/component/EmployeeRefreshButton.vue'
import EmployeeStatePanel from '@/component/EmployeeStatePanel.vue'
import {
  compensationTypeKey,
  hasSensitivePayrollPath,
  latestPayroll,
  payrollStatusKey,
  payrollStatusTone,
  sortPayrolls,
} from '@/payroll/payrollViewModel'

const { t, locale } = useI18n()
const { selectedStore, logout } = useEmployeeAppContext()

const loading = ref(false)
const errorMessage = ref('')
const payrollItems = ref<PayrollResponse[]>([])
const selectedPayroll = ref<PayrollResponse | null>(null)
const latestEarningsOpen = ref(false)
const latestDeductionsOpen = ref(false)
let payrollRequestId = 0

const payrolls = computed(() => sortPayrolls(payrollItems.value))
const latest = computed(() => latestPayroll(payrollItems.value))
const historyPayrolls = computed(() => {
  if (!latest.value || payrolls.value.length <= 1) {
    return payrolls.value
  }
  return payrolls.value.filter((payroll) => payroll.payrollId !== latest.value?.payrollId)
})

watch(
  () => selectedStore.value?.storeId,
  () => {
    payrollItems.value = []
    selectedPayroll.value = null
    latestEarningsOpen.value = false
    latestDeductionsOpen.value = false
    void loadPayrolls()
  },
  { immediate: true },
)

async function loadPayrolls(): Promise<void> {
  const storeId = selectedStore.value?.storeId
  const requestId = ++payrollRequestId

  if (!storeId) {
    payrollItems.value = []
    errorMessage.value = ''
    loading.value = false
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await loadMyPayrolls({ storeId, page: 0, size: 100 })
    if (requestId === payrollRequestId) {
      payrollItems.value = response
      if (
        selectedPayroll.value &&
        !response.some((item) => item.payrollId === selectedPayroll.value?.payrollId)
      ) {
        selectedPayroll.value = null
      }
    }
  } catch (error) {
    if (requestId !== payrollRequestId) {
      return
    }
    payrollItems.value = []
    selectedPayroll.value = null
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    errorMessage.value = isForbidden(error)
      ? t('payroll.permissionDenied')
      : t('payroll.errorDescription')
  } finally {
    if (requestId === payrollRequestId) {
      loading.value = false
    }
  }
}

function selectPayroll(payroll: PayrollResponse): void {
  selectedPayroll.value = payroll
}

function formatPeriod(payroll: PayrollResponse): string {
  return `${formatDate(payroll.payPeriodStart)} - ${formatDate(payroll.payPeriodEnd)}`
}

function formatMonth(value: string): string {
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
  }).format(toLocalDate(value))
}

function formatPaidDate(payroll: PayrollResponse): string {
  if (!payroll.paidAt) {
    return t('payroll.notPaidYet')
  }
  return t('payroll.paidOn', { date: formatDate(payroll.paidAt) })
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(toLocalDate(value))
}

function formatMoney(value: number | null): string {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

function negativeAmount(value: number | null): number {
  if (!value) {
    return 0
  }
  return -Math.abs(value)
}

function toLocalDate(value: string): Date {
  const [datePart] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day)
}
</script>
