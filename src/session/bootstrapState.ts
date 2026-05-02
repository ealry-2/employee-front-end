import type { AppAuthBootstrapResponse, AppStoreMembershipSummary } from '@/api/types'

const SELECTED_STORE_KEY_PREFIX = 'illog.employee.selectedStoreId.'

export function selectInitialStore(
  bootstrap: Pick<AppAuthBootstrapResponse, 'stores' | 'selectedStore'>,
  persistedStoreId: string | null = null,
): AppStoreMembershipSummary | null {
  const persistedStore = bootstrap.stores.find((store) => store.storeId === persistedStoreId)
  if (persistedStore) {
    return persistedStore
  }
  if (bootstrap.selectedStore) {
    return bootstrap.selectedStore
  }
  return bootstrap.stores[0] ?? null
}

export function formatOptionalText(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim()
  return normalized ? normalized : fallback
}

export function getPersistedSelectedStoreId(userId: string): string | null {
  return window.localStorage.getItem(getSelectedStoreKey(userId))
}

export function saveSelectedStoreId(userId: string, storeId: string): void {
  window.localStorage.setItem(getSelectedStoreKey(userId), storeId)
}

export function clearSelectedStoreId(userId: string): void {
  window.localStorage.removeItem(getSelectedStoreKey(userId))
}

function getSelectedStoreKey(userId: string): string {
  return `${SELECTED_STORE_KEY_PREFIX}${userId}`
}
