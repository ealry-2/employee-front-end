import type { AppAuthBootstrapResponse, AppStoreMembershipSummary } from '@/api/types'

export function selectInitialStore(
  bootstrap: Pick<AppAuthBootstrapResponse, 'stores' | 'selectedStore'>,
): AppStoreMembershipSummary | null {
  if (bootstrap.selectedStore) {
    return bootstrap.selectedStore
  }
  return bootstrap.stores[0] ?? null
}

export function formatOptionalText(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim()
  return normalized ? normalized : fallback
}
