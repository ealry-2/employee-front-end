<template>
  <section class="employee-contracts" aria-labelledby="contracts-heading">
    <div class="employee-contracts__header">
      <h2 id="contracts-heading">{{ t('screen.contracts.title') }}</h2>
      <span v-if="contracts.length > 0" class="employee-contracts__count">
        {{ t('contracts.listCount', { count: contracts.length }) }}
      </span>
    </div>

    <EmployeeStatePanel
      v-if="!selectedStore"
      tone="empty"
      :title="t('home.emptyTitle')"
      :message="t('home.emptyDescription')"
    />

    <template v-else>
      <EmployeeStatePanel
        v-if="loading && contracts.length === 0"
        tone="loading"
        :message="t('contracts.loading')"
      />

      <EmployeeStatePanel
        v-else-if="errorMessage && contracts.length === 0"
        tone="error"
        :title="t('contracts.errorTitle')"
        :message="errorMessage"
        :action-label="t('app.retry')"
        @action="loadContracts"
      />

      <EmployeeStatePanel
        v-else-if="contracts.length === 0"
        tone="empty"
        :title="t('contracts.emptyTitle')"
        :message="t('contracts.emptyDescription')"
        :action-label="t('contracts.refresh')"
        @action="loadContracts"
      />

      <section v-else class="employee-contracts-list" :aria-label="t('contracts.listTitle')">
        <button
          v-for="contract in contracts"
          :key="contract.contractId"
          class="employee-contract-card"
          :class="{ 'is-selected': selectedContract?.contractId === contract.contractId }"
          type="button"
          @click="selectContract(contract)"
        >
          <span class="employee-contract-card__main">
            <span>{{ contract.title }}</span>
            <span>{{ formatDateRange(contract.workStartDate, contract.workEndDate) }}</span>
          </span>
          <span
            class="employee-work-status"
            :class="`employee-work-status--${contractStatusTone(contract.status)}`"
          >
            {{ t(contractStatusKey(contract.status)) }}
          </span>
          <span class="employee-contract-card__meta">
            {{ t(contractActionKey(contract)) }}
          </span>
        </button>
      </section>
    </template>
  </section>

  <section
    v-if="selectedContract"
    class="employee-contract-detail"
    aria-labelledby="contract-detail-heading"
  >
    <div class="employee-contract-detail__header">
      <div>
        <p class="employee-contract-detail__eyebrow">{{ t('contracts.detailEyebrow') }}</p>
        <h2 id="contract-detail-heading">{{ selectedContract.title }}</h2>
      </div>
      <button
        class="employee-contract-detail__close"
        type="button"
        :aria-label="t('contracts.closeDetail')"
        @click="closeDetail"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>

    <EmployeeStatePanel
      v-if="detailLoading"
      tone="loading"
      :message="t('contracts.detailLoading')"
    />

    <EmployeeStatePanel
      v-else-if="detailError"
      tone="error"
      :title="t('contracts.detailErrorTitle')"
      :message="detailError"
      :action-label="t('app.retry')"
      @action="reloadSelectedDetail"
    />

    <template v-else>
      <dl class="employee-contract-detail__grid">
        <div>
          <dt>{{ t('contracts.statusLabel') }}</dt>
          <dd>{{ t(contractStatusKey(selectedContract.status)) }}</dd>
        </div>
        <div>
          <dt>{{ t('contracts.workPeriod') }}</dt>
          <dd>{{ formatDateRange(selectedContract.workStartDate, selectedContract.workEndDate) }}</dd>
        </div>
        <div>
          <dt>{{ t('contracts.firstParty') }}</dt>
          <dd>{{ selectedContract.firstPartyName || t('contracts.notProvided') }}</dd>
        </div>
        <div>
          <dt>{{ t('contracts.completedAt') }}</dt>
          <dd>{{ formatOptionalDateTime(selectedContract.completedAt) }}</dd>
        </div>
      </dl>

      <div
        v-if="selectedContract.signingRequired"
        class="employee-contract-callout employee-contract-callout--planned"
      >
        <strong>{{ t('contracts.signingRequiredTitle') }}</strong>
        <p>{{ t('contracts.signingRequiredDescription') }}</p>
        <button class="employee-primary-button" type="button" disabled>
          {{ t('contracts.signingBoundary') }}
        </button>
      </div>

      <div
        v-else-if="selectedContract.documentPreviewAvailable"
        class="employee-contract-callout employee-contract-callout--success"
      >
        <strong>{{ t('contracts.documentReadyTitle') }}</strong>
        <p>{{ t('contracts.documentReadyDescription') }}</p>
      </div>

      <section class="employee-contract-document" aria-labelledby="contract-document-heading">
        <h3 id="contract-document-heading">{{ t('contracts.documentPreview') }}</h3>
        <p v-if="detailText">{{ detailText }}</p>
        <p v-else>{{ t('contracts.noPreview') }}</p>
      </section>

      <p v-if="unsafeContractFieldsDetected" class="employee-contract-detail__warning">
        {{ t('contracts.sensitiveFieldWarning') }}
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmployeeAppContext } from '@/app/employeeAppContext'
import { isForbidden, isUnauthorized } from '@/api/client'
import { loadMyContractDetail, loadMyContracts } from '@/api/contracts'
import type { AppContractDetailResponse, AppContractListItemResponse } from '@/api/types'
import EmployeeStatePanel from '@/component/EmployeeStatePanel.vue'
import {
  contractActionKey,
  contractStatusKey,
  contractStatusTone,
  hasUnsafeContractFields,
  plainContractText,
  sortContracts,
} from '@/contracts/contractViewModel'

const { t, locale } = useI18n()
const { selectedStore, logout } = useEmployeeAppContext()

const loading = ref(false)
const detailLoading = ref(false)
const errorMessage = ref('')
const detailError = ref('')
const contractItems = ref<AppContractListItemResponse[]>([])
const selectedContract = ref<AppContractListItemResponse | null>(null)
const selectedDetail = ref<AppContractDetailResponse | null>(null)
let contractRequestId = 0
let detailRequestId = 0

const contracts = computed(() => sortContracts(contractItems.value))
const detailText = computed(() => plainContractText(selectedDetail.value?.content ?? ''))
const unsafeContractFieldsDetected = computed(
  () =>
    hasUnsafeContractFields(selectedContract.value) ||
    hasUnsafeContractFields(selectedDetail.value?.summary),
)

watch(
  () => selectedStore.value?.storeId,
  () => {
    contractItems.value = []
    closeDetail()
    void loadContracts()
  },
  { immediate: true },
)

async function loadContracts(): Promise<void> {
  const storeId = selectedStore.value?.storeId
  const requestId = ++contractRequestId

  if (!storeId) {
    contractItems.value = []
    errorMessage.value = ''
    loading.value = false
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await loadMyContracts({ storeId, page: 0, size: 100 })
    if (requestId === contractRequestId) {
      contractItems.value = response.items
      if (
        selectedContract.value &&
        !response.items.some((item) => item.contractId === selectedContract.value?.contractId)
      ) {
        closeDetail()
      }
    }
  } catch (error) {
    if (requestId !== contractRequestId) {
      return
    }
    contractItems.value = []
    closeDetail()
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    errorMessage.value = isForbidden(error)
      ? t('contracts.permissionDenied')
      : t('contracts.errorDescription')
  } finally {
    if (requestId === contractRequestId) {
      loading.value = false
    }
  }
}

async function selectContract(contract: AppContractListItemResponse): Promise<void> {
  selectedContract.value = contract
  selectedDetail.value = null
  detailError.value = ''
  await loadContractDetail(contract.contractId)
}

async function reloadSelectedDetail(): Promise<void> {
  if (!selectedContract.value) {
    return
  }
  await loadContractDetail(selectedContract.value.contractId)
}

async function loadContractDetail(contractId: string): Promise<void> {
  const storeId = selectedStore.value?.storeId
  const requestId = ++detailRequestId

  if (!storeId) {
    return
  }

  detailLoading.value = true
  detailError.value = ''

  try {
    const response = await loadMyContractDetail({ storeId, contractId })
    if (requestId === detailRequestId) {
      selectedDetail.value = response
      selectedContract.value = response.summary
    }
  } catch (error) {
    if (requestId !== detailRequestId) {
      return
    }
    selectedDetail.value = null
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    detailError.value = isForbidden(error)
      ? t('contracts.permissionDenied')
      : t('contracts.detailErrorDescription')
  } finally {
    if (requestId === detailRequestId) {
      detailLoading.value = false
    }
  }
}

function closeDetail(): void {
  selectedContract.value = null
  selectedDetail.value = null
  detailError.value = ''
  detailLoading.value = false
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) {
    return t('contracts.notProvided')
  }
  return `${formatOptionalDate(start)} - ${formatOptionalDate(end)}`
}

function formatOptionalDate(value: string | null): string {
  if (!value) {
    return t('contracts.openEnded')
  }
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(toLocalDate(value))
}

function formatOptionalDateTime(value: string | null): string {
  if (!value) {
    return t('contracts.notProvided')
  }
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function toLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}
</script>
