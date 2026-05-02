export type TokenPersistence = 'session' | 'local'

const ACCESS_TOKEN_KEY = 'illog.employee.accessToken'
const REFRESH_TOKEN_KEY = 'illog.employee.refreshToken'
const ACTIVE_BUCKET_KEY = 'illog.employee.activeTokenBucket'

export function saveTokens(
  accessToken: string,
  refreshToken: string,
  persistence: TokenPersistence,
): void {
  clearTokens()
  const storage = persistence === 'local' ? window.localStorage : window.sessionStorage
  storage.setItem(ACCESS_TOKEN_KEY, accessToken)
  storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  window.localStorage.setItem(ACTIVE_BUCKET_KEY, persistence)
}

export function getActiveTokenPersistence(): TokenPersistence {
  const activeBucket = window.localStorage.getItem(ACTIVE_BUCKET_KEY)
  if (activeBucket === 'local' || activeBucket === 'session') {
    return activeBucket
  }
  if (window.sessionStorage.getItem(REFRESH_TOKEN_KEY)) {
    return 'session'
  }
  if (window.localStorage.getItem(REFRESH_TOKEN_KEY)) {
    return 'local'
  }
  return 'session'
}

export function getAccessToken(): string | null {
  return getToken(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return getToken(REFRESH_TOKEN_KEY)
}

export function hasAccessToken(): boolean {
  return Boolean(getAccessToken())
}

export function clearTokens(): void {
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(ACTIVE_BUCKET_KEY)
}

function getToken(key: string): string | null {
  const activeBucket = window.localStorage.getItem(ACTIVE_BUCKET_KEY)
  if (activeBucket === 'local') {
    return window.localStorage.getItem(key)
  }
  if (activeBucket === 'session') {
    return window.sessionStorage.getItem(key)
  }
  return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key)
}
