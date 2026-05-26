import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const readSource = (relativePath: string): string =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')

test('employee invitation onboarding has public route, API calls, and consent screen copy', () => {
  const routerSource = readSource('../src/router/index.ts')
  const authSource = readSource('../src/api/auth.ts')
  const typesSource = readSource('../src/api/types.ts')
  const viewSource = readSource('../src/views/EmployeeInvitationView.vue')
  const i18nSource = readSource('../src/i18n/index.ts')

  assert.match(routerSource, /'employee-invitation'/)
  assert.match(routerSource, /employee-invitations\/:token/)
  assert.match(routerSource, /PUBLIC_ROUTE_NAMES/)

  assert.match(authSource, /\/api\/app\/employee-invitations\/\$\{encodeURIComponent\(token\)\}/)
  assert.match(authSource, /acceptEmployeeInvitation/)
  assert.match(authSource, /declineEmployeeInvitation/)

  assert.match(typesSource, /EmployeeInvitationResponse/)
  assert.match(typesSource, /requiresPasswordSetup/)
  assert.match(typesSource, /requiresLogin/)

  assert.match(viewSource, /agreeTerms/)
  assert.match(viewSource, /agreePrivacy/)
  assert.match(viewSource, /acceptEmployeeInvitation/)
  assert.match(viewSource, /declineEmployeeInvitation/)

  assert.match(i18nSource, /employeeInvitation:/)
  assert.match(i18nSource, /termsConsent/)
  assert.match(i18nSource, /privacyConsent/)
})
