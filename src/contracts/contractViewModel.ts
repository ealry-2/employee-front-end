import type { AppContractListItemResponse, ContractStatus } from '../api/types'

export type ContractTone = 'planned' | 'success' | 'warning' | 'muted'

export function sortContracts(
  contracts: AppContractListItemResponse[],
): AppContractListItemResponse[] {
  return [...contracts].sort((left, right) => {
    const priorityCompare = contractPriority(right) - contractPriority(left)
    if (priorityCompare !== 0) {
      return priorityCompare
    }
    const updatedCompare = dateValue(right.updatedAt).localeCompare(dateValue(left.updatedAt))
    if (updatedCompare !== 0) {
      return updatedCompare
    }
    return right.contractId.localeCompare(left.contractId)
  })
}

export function contractStatusKey(status: ContractStatus): string {
  return `contracts.status.${status.toLowerCase()}`
}

export function contractStatusTone(status: ContractStatus): ContractTone {
  if (status === 'SIGNED') {
    return 'success'
  }
  if (status === 'PENDING') {
    return 'planned'
  }
  if (status === 'EXPIRED' || status === 'CANCELLED') {
    return 'warning'
  }
  return 'muted'
}

export function contractActionKey(contract: AppContractListItemResponse): string {
  if (contract.signingRequired) {
    return 'contracts.action.signRequired'
  }
  if (contract.documentPreviewAvailable) {
    return 'contracts.action.viewDocument'
  }
  return 'contracts.action.viewDetail'
}

export function contractPriority(contract: AppContractListItemResponse): number {
  if (contract.signingRequired) {
    return 3
  }
  if (contract.status === 'PENDING') {
    return 2
  }
  if (contract.status === 'SIGNED') {
    return 1
  }
  return 0
}

export function hasUnsafeContractFields(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  return ['pdfPath', 'signToken', 'creatorId', 'templateId', 'pendingSigners'].some(
    (key) => key in record,
  )
}

export function plainContractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function dateValue(value: string | null): string {
  return value ?? ''
}
