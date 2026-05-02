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
        <section v-if="latest" class="employee-payroll-summary" aria-labelledby="payroll-summary-heading">
          <div>
            <p class="employee-payroll__eyebrow">{{ t('payroll.latestEyebrow') }}</p>
            <h3 id="payroll-summary-heading">{{ formatPeriod(latest) }}</h3>
          </div>
          <strong>{{ formatMoney(latest.netPay) }}</strong>
          <dl class="employee-payroll-summary__grid">
            <div>
              <dt>{{ t('payroll.grossPay') }}</dt>
              <dd>{{ formatMoney(latest.grossPay) }}</dd>
            </div>
            <div>
              <dt>{{ t('payroll.totalDeductions') }}</dt>
              <dd>{{ formatMoney(latest.totalDeductions) }}</dd>
            </div>
            <div>
              <dt>{{ t('payroll.statusLabel') }}</dt>
              <dd>
                <span
                  class="employee-payroll-status"
                  :class="`employee-payroll-status--${payrollStatusTone(latest.status)}`"
                >
                  {{ t(payrollStatusKey(latest.status)) }}
                </span>
              </dd>
            </div>
            <div>
              <dt>{{ t('payroll.compensationType') }}</dt>
              <dd>{{ t(compensationTypeKey(latest.compensationTypeSnapshot)) }}</dd>
            </div>
          </dl>
        </section>

        <section class="employee-payroll-list" aria-labelledby="payroll-list-heading">
          <div class="employee-payroll-list__header">
            <div>
              <p class="employee-payroll__eyebrow">{{ t('payroll.listEyebrow') }}</p>
              <h3 id="payroll-list-heading">{{ t('payroll.listTitle') }}</h3>
            </div>
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
            <span class="employee-payroll-card__period">{{ formatPeriod(payroll) }}</span>
            <span
              class="employee-payroll-status"
              :class="`employee-payroll-status--${payrollStatusTone(payroll.status)}`"
            >
              {{ t(payrollStatusKey(payroll.status)) }}
            </span>
            <span class="employee-payroll-card__amount">{{ formatMoney(payroll.netPay) }}</span>
            <span class="employee-payroll-card__meta">
              {{ t(compensationTypeKey(payroll.compensationTypeSnapshot)) }}
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
let payrollRequestId = 0

const payrolls = computed(() => sortPayrolls(payrollItems.value))
const latest = computed(() => latestPayroll(payrollItems.value))

watch(
  () => selectedStore.value?.storeId,
  () => {
    payrollItems.value = []
    selectedPayroll.value = null
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

function toLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}
</script>
