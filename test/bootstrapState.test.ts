import test from 'node:test'
import assert from 'node:assert/strict'
import {
  clearSelectedStoreId,
  formatOptionalText,
  getPersistedSelectedStoreId,
  saveSelectedStoreId,
  selectInitialStore,
} from '../src/session/bootstrapState.ts'
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

test('selectInitialStore prefers a valid persisted store id', () => {
  assert.equal(
    selectInitialStore({ stores: [firstStore, selectedStore], selectedStore }, firstStore.storeId),
    firstStore,
  )
})

test('selectInitialStore ignores an invalid persisted store id', () => {
  assert.equal(
    selectInitialStore({ stores: [firstStore], selectedStore }, 'missing-store'),
    selectedStore,
  )
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

test('selected store persistence is scoped by user id', () => {
  installWindowStorage()

  saveSelectedStoreId('user-1', 'store-1')
  saveSelectedStoreId('user-2', 'store-2')

  assert.equal(getPersistedSelectedStoreId('user-1'), 'store-1')
  assert.equal(getPersistedSelectedStoreId('user-2'), 'store-2')

  clearSelectedStoreId('user-1')

  assert.equal(getPersistedSelectedStoreId('user-1'), null)
  assert.equal(getPersistedSelectedStoreId('user-2'), 'store-2')
})

function installWindowStorage(): void {
  globalThis.window = {
    localStorage: new MemoryStorage(),
    sessionStorage: new MemoryStorage(),
  } as unknown as Window & typeof globalThis
}

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length(): number {
    return this.values.size
  }

  clear(): void {
    this.values.clear()
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}
