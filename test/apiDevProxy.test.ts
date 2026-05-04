import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('employee app dev server follows the admin-style api base and proxy contract', () => {
  const viteConfig = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8')
  const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8')
  const devEnv = readFileSync(new URL('../.env.development', import.meta.url), 'utf8')

  assert.match(viteConfig, /loadEnv\(mode, process\.cwd\(\), ''\)/)
  assert.match(viteConfig, /VITE_DEV_PROXY_TARGET/)
  assert.match(viteConfig, /proxy:\s*\{/)
  assert.match(viteConfig, /'\/illog-api':\s*\{/)
  assert.match(viteConfig, /target:\s*devProxyTarget/)
  assert.match(viteConfig, /changeOrigin:\s*true/)
  assert.match(viteConfig, /rewrite:\s*path => path\.replace\(\^?/)
  assert.match(envExample, /VITE_API_BASE_URL=https:\/\/api\.il-log\.com/)
  assert.match(envExample, /VITE_API_BASE_URL=\/illog-api/)
  assert.match(envExample, /VITE_DEV_PROXY_TARGET=https:\/\/api\.il-log\.com/)
  assert.match(devEnv, /VITE_API_BASE_URL=\/illog-api/)
  assert.match(devEnv, /VITE_DEV_PROXY_TARGET=http:\/\/localhost:8080/)
  assert.doesNotMatch(viteConfig, /VITE_API_PROXY_TARGET/)
})
