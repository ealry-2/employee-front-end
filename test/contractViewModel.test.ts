import test from 'node:test'
import assert from 'node:assert/strict'
import {
  contractActionKey,
  contractStatusKey,
  contractStatusTone,
  hasUnsafeContractFields,
  plainContractText,
  sortContracts,
} from '../src/contracts/contractViewModel.ts'
import type {
  AppContractListItemResponse,
  ContractStatus,
  EmployeeCompensationType,
} from '../src/api/types.ts'

test('sortContracts prioritizes signing-needed contracts before latest updates', () => {
  const contracts = [
    contract('signed-old', 'SIGNED', false, '2026-03-01T00:00:00Z'),
    contract('pending-later', 'PENDING', false, '2026-05-01T00:00:00Z'),
    contract('pending-sign', 'PENDING', true, '2026-04-01T00:00:00Z'),
    contract('draft', 'DRAFT', false, '2026-06-01T00:00:00Z'),
  ]

  assert.deepEqual(sortContracts(contracts).map((item) => item.contractId), [
    'pending-sign',
    'pending-later',
    'signed-old',
    'draft',
  ])
})

test('contract status and action helpers map backend values to i18n keys and tones', () => {
  assert.equal(contractStatusKey('PENDING'), 'contracts.status.pending')
  assert.equal(contractStatusTone('SIGNED'), 'success')
  assert.equal(contractStatusTone('PENDING'), 'planned')
  assert.equal(contractStatusTone('EXPIRED'), 'warning')
  assert.equal(contractStatusTone('DRAFT'), 'muted')
  assert.equal(contractActionKey(contract('a', 'PENDING', true)), 'contracts.action.signRequired')
  assert.equal(contractActionKey(contract('b', 'SIGNED', false)), 'contracts.action.viewDocument')
  assert.equal(contractActionKey(contract('c', 'DRAFT', false)), 'contracts.action.viewDetail')
})

test('hasUnsafeContractFields flags redaction-sensitive response fields', () => {
  assert.equal(hasUnsafeContractFields(contract('safe', 'SIGNED', false)), false)
  assert.equal(hasUnsafeContractFields({ ...contract('pdf', 'SIGNED', false), pdfPath: '/private/a.pdf' }), true)
  assert.equal(hasUnsafeContractFields({ signToken: 'raw-token' }), true)
  assert.equal(hasUnsafeContractFields(null), false)
})

test('plainContractText strips active markup and decodes expected entities', () => {
  const html = `
    <style>.x { color: red; }</style>
    <script>alert('x')</script>
    <p>근로&nbsp;계약 &amp; 확인</p>
    <p>&lt;서명완료&gt;</p>
  `

  assert.equal(plainContractText(html), '근로 계약 & 확인 <서명완료>')
})

function contract(
  contractId: string,
  status: ContractStatus,
  signingRequired: boolean,
  updatedAt: string | null = null,
  overrides: Partial<AppContractListItemResponse> = {},
): AppContractListItemResponse {
  return {
    contractId,
    title: `Contract ${contractId}`,
    status,
    presetType: 'LABOR_STANDARD',
    storeId: 'store-1',
    firstPartyName: 'Owner',
    secondPartyName: 'Employee',
    signingRequired,
    documentPreviewAvailable: status === 'SIGNED',
    pdfDownloadAvailable: status === 'SIGNED',
    compensationType: overrides.compensationType as EmployeeCompensationType ?? 'HOURLY',
    baseHourlyWage: 10000,
    monthlySalary: null,
    annualSalary: null,
    workStartDate: '2026-05-01',
    workEndDate: null,
    expiresAt: null,
    completedAt: null,
    createdAt: null,
    updatedAt,
    ...overrides,
  }
}
