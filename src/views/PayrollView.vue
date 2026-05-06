<template>
  <section class="employee-payroll" :aria-label="t('screen.payroll.title')">
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
        <section
          v-if="selectedPayroll"
          class="employee-payroll-latest"
          aria-labelledby="payroll-summary-heading"
        >
          <div class="employee-payroll-latest__top">
            <p class="employee-payroll-latest__period">
              {{ formatMonth(selectedPayroll.payPeriodEnd) }}
            </p>
            <button
              class="employee-payroll-latest__close"
              type="button"
              :aria-label="t('payroll.closeDetail')"
              @click="closeSelectedPayroll"
            >
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div class="employee-payroll-latest__amount">
            <h3 id="payroll-summary-heading">{{ formatMoney(selectedPayroll.netPay) }}</h3>
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
                  <strong>{{ formatMoney(selectedPayroll.grossPay) }}</strong>
                </span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="m8 10 4 4 4-4" />
                </svg>
              </button>
              <dl id="payroll-latest-earnings-list" v-show="latestEarningsOpen">
                <div>
                  <dt>{{ t('payroll.basePay') }}</dt>
                  <dd>{{ formatMoney(selectedPayroll.basePay) }}</dd>
                </div>
                <div>
                  <dt>{{ t('payroll.overtimePay') }}</dt>
                  <dd class="employee-payroll-latest__positive">
                    {{ formatMoney(selectedPayroll.overtimePay) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('payroll.nightPay') }}</dt>
                  <dd class="employee-payroll-latest__positive">
                    {{ formatMoney(selectedPayroll.nightPay) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('payroll.holidayPay') }}</dt>
                  <dd class="employee-payroll-latest__positive">
                    {{ formatMoney(selectedPayroll.holidayPay) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('payroll.weeklyHolidayPay') }}</dt>
                  <dd class="employee-payroll-latest__positive">
                    {{ formatMoney(selectedPayroll.weeklyHolidayPay) }}
                  </dd>
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
                    {{ formatMoney(negativeAmount(selectedPayroll.totalDeductions)) }}
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
                    {{ formatMoney(negativeAmount(selectedPayroll.nationalPension)) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('payroll.healthInsurance') }}</dt>
                  <dd class="employee-payroll-latest__negative">
                    {{ formatMoney(negativeAmount(selectedPayroll.healthInsurance)) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('payroll.longTermCare') }}</dt>
                  <dd class="employee-payroll-latest__negative">
                    {{ formatMoney(negativeAmount(selectedPayroll.longTermCare)) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('payroll.employmentInsurance') }}</dt>
                  <dd class="employee-payroll-latest__negative">
                    {{ formatMoney(negativeAmount(selectedPayroll.employmentInsurance)) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('payroll.incomeTax') }}</dt>
                  <dd class="employee-payroll-latest__negative">
                    {{ formatMoney(negativeAmount(selectedPayroll.incomeTax)) }}
                  </dd>
                </div>
                <div>
                  <dt>{{ t('payroll.localIncomeTax') }}</dt>
                  <dd class="employee-payroll-latest__negative">
                    {{ formatMoney(negativeAmount(selectedPayroll.localIncomeTax)) }}
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
            <span>{{ t('payroll.listCount', { count: payrolls.length }) }}</span>
          </div>

          <button
            v-for="payroll in payrolls"
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
                class="employee-work-status"
                :class="`employee-work-status--${payrollStatusTone(payroll.status)}`"
              >
                {{ t(payrollStatusKey(payroll.status)) }}
              </span>
            </span>
          </button>
        </section>
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmployeeAppContext } from '@/app/employeeAppContext'
import { isForbidden, isUnauthorized } from '@/api/client'
import { loadMyPayrolls } from '@/api/payroll'
import type { PayrollResponse } from '@/api/types'
import EmployeeStatePanel from '@/component/EmployeeStatePanel.vue'
import {
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
      if (selectedPayroll.value) {
        selectedPayroll.value =
          response.find((item) => item.payrollId === selectedPayroll.value?.payrollId) ?? null
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
  latestEarningsOpen.value = false
  latestDeductionsOpen.value = false
}

function closeSelectedPayroll(): void {
  selectedPayroll.value = null
  latestEarningsOpen.value = false
  latestDeductionsOpen.value = false
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
