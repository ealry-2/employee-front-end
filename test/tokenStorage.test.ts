import test from 'node:test'
import assert from 'node:assert/strict'
import {
  clearTokens,
  getAccessToken,
  getActiveTokenPersistence,
  getRefreshToken,
  saveTokens,
} from '../src/session/tokenStorage.ts'

test('saveTokens stores session tokens in the active session bucket', () => {
  installWindowStorage()

  saveTokens('access-session', 'refresh-session', 'session')

  assert.equal(getAccessToken(), 'access-session')
  assert.equal(getRefreshToken(), 'refresh-session')
  assert.equal(getActiveTokenPersistence(), 'session')
  assert.equal(window.localStorage.getItem('illog.employee.accessToken'), null)
})

test('saveTokens stores local tokens and clears old session tokens', () => {
  installWindowStorage()

  saveTokens('access-session', 'refresh-session', 'session')
  saveTokens('access-local', 'refresh-local', 'local')

  assert.equal(getAccessToken(), 'access-local')
  assert.equal(getRefreshToken(), 'refresh-local')
  assert.equal(getActiveTokenPersistence(), 'local')
  assert.equal(window.sessionStorage.getItem('illog.employee.accessToken'), null)
})

test('clearTokens removes every token bucket and active marker', () => {
  installWindowStorage()

  saveTokens('access-local', 'refresh-local', 'local')
  clearTokens()

  assert.equal(getAccessToken(), null)
  assert.equal(getRefreshToken(), null)
  assert.equal(window.localStorage.getItem('illog.employee.activeTokenBucket'), null)
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
