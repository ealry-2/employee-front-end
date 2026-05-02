import test from 'node:test'
import assert from 'node:assert/strict'
import { formatOptionalText, selectInitialStore } from '../src/session/bootstrapState.ts'
import type { AppStoreMembershipSummary } from '../src/api/types.ts'

const firstStore: AppStoreMembershipSummary = {
  storeId: 'store-1',
  name: '성수점',
  address: null,
  phone: null,
  displayOrder: 1,
  employeeId: 'employee-1',
  employeeName: '김직원',
  role: '바리스타',
  contactEmail: null,
  contactPhone: null,
  hireDate: '2026-01-01',
  employeeStatus: 'ACTIVE',
}

const selectedStore: AppStoreMembershipSummary = {
  ...firstStore,
  storeId: 'store-2',
  name: '강남점',
}

test('selectInitialStore prefers backend selectedStore', () => {
  assert.equal(selectInitialStore({ stores: [firstStore], selectedStore }), selectedStore)
})

test('selectInitialStore falls back to the first store', () => {
  assert.equal(selectInitialStore({ stores: [firstStore], selectedStore: null }), firstStore)
})

test('selectInitialStore returns null for empty memberships', () => {
  assert.equal(selectInitialStore({ stores: [], selectedStore: null }), null)
})

test('formatOptionalText handles blank values', () => {
  assert.equal(formatOptionalText('  ', '-'), '-')
  assert.equal(formatOptionalText('010-1234-5678', '-'), '010-1234-5678')
})
