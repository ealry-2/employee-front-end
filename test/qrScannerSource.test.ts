import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const readSource = (relativePath: string): string => {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8')
}

test('web QR scanner close guard cancels before plugin stop can block the UI', () => {
  const scannerSource = readSource('../src/attendance/qrScanner.ts')

  assert.ok(scannerSource.includes('installWebScannerCloseGuard'))
  assert.ok(scannerSource.includes("document.addEventListener('pointerdown'"))
  assert.ok(scannerSource.includes("document.addEventListener('click'"))
  assert.ok(scannerSource.includes('event.stopImmediatePropagation()'))
  assert.ok(scannerSource.includes('Promise.race'))
  assert.ok(scannerSource.includes('forceCloseWebScanner()'))
  assert.ok(scannerSource.includes("rejectClose(new Error('QR scan cancelled.'))"))
})
