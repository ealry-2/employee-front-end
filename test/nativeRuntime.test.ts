import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getEmployeeRuntimeCapabilities,
  resolveEmployeeDeepLinkRoute,
  shouldUseNativePlugin,
  type CapacitorRuntimeLike,
} from '../src/runtime/nativeRuntime.ts'

test('getEmployeeRuntimeCapabilities keeps browser fallback explicit on web', () => {
  const capabilities = getEmployeeRuntimeCapabilities(capacitor('web', false, []))

  assert.deepEqual(capabilities, {
    platform: 'web',
    nativeBridge: false,
    appResume: 'browser-fallback',
    deepLink: 'browser-fallback',
    pushPermission: 'unsupported',
    secureStorage: 'browser-fallback',
  })
})

test('getEmployeeRuntimeCapabilities fails closed when native plugins are missing', () => {
  const capabilities = getEmployeeRuntimeCapabilities(capacitor('ios', true, []))

  assert.equal(capabilities.platform, 'ios')
  assert.equal(capabilities.nativeBridge, true)
  assert.equal(capabilities.appResume, 'native-plugin-unavailable')
  assert.equal(capabilities.deepLink, 'native-plugin-unavailable')
  assert.equal(capabilities.pushPermission, 'native-plugin-unavailable')
  assert.equal(capabilities.secureStorage, 'native-plugin-unavailable')
})

test('getEmployeeRuntimeCapabilities reports only installed native plugin surfaces as available', () => {
  const capabilities = getEmployeeRuntimeCapabilities(capacitor('android', true, ['App']))

  assert.equal(capabilities.appResume, 'available')
  assert.equal(capabilities.deepLink, 'available')
  assert.equal(capabilities.pushPermission, 'native-plugin-unavailable')
  assert.equal(capabilities.secureStorage, 'native-plugin-unavailable')
})

test('resolveEmployeeDeepLinkRoute maps known app paths and rejects unknown links', () => {
  assert.equal(resolveEmployeeDeepLinkRoute('/'), 'schedule')
  assert.equal(resolveEmployeeDeepLinkRoute('/schedule'), 'schedule')
  assert.equal(resolveEmployeeDeepLinkRoute('/notifications'), 'notifications')
  assert.equal(resolveEmployeeDeepLinkRoute('/settings'), 'settings')
  assert.equal(resolveEmployeeDeepLinkRoute('https://employee.il-log.com/contracts'), 'contracts')
  assert.equal(resolveEmployeeDeepLinkRoute('illog://app/payroll'), 'payroll')
  assert.equal(resolveEmployeeDeepLinkRoute('https://employee.il-log.com/admin'), null)
  assert.equal(resolveEmployeeDeepLinkRoute('not a url with spaces'), null)
})

test('shouldUseNativePlugin only allows explicitly available native plugin state', () => {
  assert.equal(shouldUseNativePlugin('available'), true)
  assert.equal(shouldUseNativePlugin('browser-fallback'), false)
  assert.equal(shouldUseNativePlugin('native-plugin-unavailable'), false)
  assert.equal(shouldUseNativePlugin('unsupported'), false)
})

function capacitor(
  platform: string,
  native: boolean,
  plugins: string[],
): CapacitorRuntimeLike {
  return {
    getPlatform: () => platform,
    isNativePlatform: () => native,
    isPluginAvailable: (name: string) => plugins.includes(name),
  }
}
