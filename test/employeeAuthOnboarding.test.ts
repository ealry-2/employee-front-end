import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('employee app exposes public onboarding routes for invited employees', () => {
  const routerSource = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8')
  const authServiceSource = readFileSync(new URL('../src/api/auth.ts', import.meta.url), 'utf8')
  const forgotPasswordSource = readFileSync(
    new URL('../src/views/ForgotPasswordView.vue', import.meta.url),
    'utf8',
  )

  assert.match(routerSource, /'verify-email'/)
  assert.match(routerSource, /'forgot-password'/)
  assert.match(routerSource, /'reset-password'/)
  assert.match(routerSource, /PUBLIC_ROUTE_NAMES/)
  assert.match(authServiceSource, /\/api\/users\/verify-email/)
  assert.match(authServiceSource, /\/api\/users\/resend-verification/)
  assert.match(authServiceSource, /\/api\/auth\/forgot-password/)
  assert.match(authServiceSource, /\/api\/auth\/reset-password\/validate/)
  assert.match(authServiceSource, /\/api\/auth\/reset-password/)
  assert.match(forgotPasswordSource, /route\.query\.email/)
  assert.match(forgotPasswordSource, /forgotPassword\(\{ email: email\.value \}\)/)
})
