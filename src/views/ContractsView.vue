<template>
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

      <div class="employee-contract-detail__actions">
        <button
          v-if="selectedContract.signingRequired"
          class="employee-primary-button"
          type="button"
          :disabled="signingSessionLoading"
          @click="startSigningSession"
        >
          {{ signingSessionLoading ? t('contracts.openingSigning') : t('contracts.startSigning') }}
        </button>

        <button
          class="employee-secondary-button"
          type="button"
          @click="openPreviewDialog"
        >
          {{ t('contracts.documentPreview') }}
        </button>
      </div>

      <p
        v-if="signingSessionError"
        class="employee-contract-detail__action-error"
        role="alert"
      >
        {{ signingSessionError }}
      </p>

      <p v-if="unsafeContractFieldsDetected" class="employee-contract-detail__warning">
        {{ t('contracts.sensitiveFieldWarning') }}
      </p>
    </template>
  </section>

  <EmployeeRecordList
    class="employee-contracts"
    title-id="contracts-heading"
    :title="t('screen.contracts.title')"
    :count-label="contracts.length > 0 ? t('contracts.listCount', { count: contracts.length }) : ''"
    :heading-level="2"
  >
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

      <template v-else>
        <EmployeeRecordCard
          v-for="contract in contracts"
          :key="contract.contractId"
          class="employee-contract-card"
          selected-tone="lavender"
          :selected="selectedContract?.contractId === contract.contractId"
          :icon-class="`employee-contract-card__icon--${contractIconTone(contract)}`"
          @select="selectContract(contract)"
        >
          <template #icon>
            <svg class="employee-contract-card__svg" viewBox="0 0 24 24" focusable="false">
              <path class="employee-contract-card__baseline" d="M4.5 18.5h15" />
              <g v-if="contract.status === 'SIGNED'">
                <path
                  class="employee-contract-card__signature-fill"
                  d="M5.4 14.2c1.1-2.8 2.3-2.8 2.9.1.4 1.9 1.5 2 2.5.2 1-1.8 2.2-2.1 3.1-.5.8 1.3 2 1.6 3.6.7"
                />
                <path class="employee-contract-card__check" d="M16.5 8.6l1.5 1.5 3-3.4" />
              </g>
              <g v-else>
                <path class="employee-contract-card__signature-empty" d="M5.4 14.2h8.2" />
                <path class="employee-contract-card__pen" d="M15.2 7.7l2.9 2.9" />
                <path class="employee-contract-card__pen" d="M14.4 11.4l3.9-3.9 1.5 1.5-3.9 3.9-2.4.9z" />
              </g>
            </svg>
          </template>

          <span class="employee-contract-card__title">{{ contract.title }}</span>
          <span class="employee-contract-card__date">
            {{ formatDateRange(contract.workStartDate, contract.workEndDate) }}
          </span>
          <span class="employee-contract-card__meta">
            {{ t(contractActionKey(contract)) }}
          </span>

          <template #side>
            <span
              class="employee-work-status"
              :class="`employee-work-status--${contractStatusTone(contract.status)}`"
            >
              {{ t(contractStatusKey(contract.status)) }}
            </span>
          </template>
        </EmployeeRecordCard>
      </template>
    </template>
  </EmployeeRecordList>

  <Teleport to="body">
    <section
      v-if="previewDialogOpen"
      class="employee-contract-preview-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contract-preview-dialog-heading"
      ref="previewDialogElement"
      tabindex="-1"
      @keydown.esc="closePreviewDialog"
    >
      <header class="employee-contract-preview-dialog__header">
        <div>
          <p class="employee-contract-detail__eyebrow">{{ t('contracts.documentPreview') }}</p>
          <h2 id="contract-preview-dialog-heading">
            {{ selectedContract?.title ?? t('contracts.documentPreview') }}
          </h2>
        </div>
        <button
          class="employee-contract-detail__close"
          type="button"
          :aria-label="t('contracts.closePreview')"
          @click="closePreviewDialog"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <div class="employee-contract-preview-dialog__body">
        <p v-if="detailText">{{ detailText }}</p>
        <p v-else>{{ t('contracts.noPreview') }}</p>
      </div>
    </section>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmployeeAppContext } from '@/app/employeeAppContext'
import { isForbidden, isUnauthorized } from '@/api/client'
import {
  createMyContractSigningSession,
  loadMyContractDetail,
  loadMyContracts,
} from '@/api/contracts'
import type { AppContractDetailResponse, AppContractListItemResponse } from '@/api/types'
import EmployeeRecordCard from '@/component/EmployeeRecordCard.vue'
import EmployeeRecordList from '@/component/EmployeeRecordList.vue'
import EmployeeStatePanel from '@/component/EmployeeStatePanel.vue'
import {
  contractActionKey,
  contractIconTone,
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
const signingSessionLoading = ref(false)
const errorMessage = ref('')
const detailError = ref('')
const signingSessionError = ref('')
const previewDialogOpen = ref(false)
const previewDialogElement = ref<HTMLElement | null>(null)
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
  signingSessionError.value = ''
  previewDialogOpen.value = false
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
  signingSessionError.value = ''
  previewDialogOpen.value = false

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

async function startSigningSession(): Promise<void> {
  const contract = selectedContract.value
  const storeId = selectedStore.value?.storeId
  if (!contract || !storeId || signingSessionLoading.value) {
    return
  }

  signingSessionLoading.value = true
  signingSessionError.value = ''

  try {
    const response = await createMyContractSigningSession({
      storeId,
      contractId: contract.contractId,
    })
    window.location.assign(response.signingUrl)
  } catch (error) {
    if (isUnauthorized(error)) {
      await logout()
      return
    }
    if (selectedContract.value?.contractId === contract.contractId) {
      signingSessionError.value = isForbidden(error)
        ? t('contracts.signingUnavailable')
        : t('contracts.signingSessionFailed')
    }
  } finally {
    signingSessionLoading.value = false
  }
}

async function openPreviewDialog(): Promise<void> {
  previewDialogOpen.value = true
  await nextTick()
  previewDialogElement.value?.focus()
}

function closePreviewDialog(): void {
  previewDialogOpen.value = false
}

function closeDetail(): void {
  selectedContract.value = null
  selectedDetail.value = null
  detailError.value = ''
  detailLoading.value = false
  signingSessionError.value = ''
  signingSessionLoading.value = false
  previewDialogOpen.value = false
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
