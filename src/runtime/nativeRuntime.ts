import { Capacitor } from '@capacitor/core'
import type { EmployeeNavRouteName } from '../app/navigation'

export type RuntimePlatform = 'web' | 'ios' | 'android'
export type RuntimeCapabilityState =
  | 'available'
  | 'browser-fallback'
  | 'native-plugin-unavailable'
  | 'unsupported'

export interface CapacitorRuntimeLike {
  getPlatform: () => string
  isNativePlatform: () => boolean
  isPluginAvailable?: (name: string) => boolean
}

export interface EmployeeRuntimeCapabilities {
  platform: RuntimePlatform
  nativeBridge: boolean
  appResume: RuntimeCapabilityState
  deepLink: RuntimeCapabilityState
  pushPermission: RuntimeCapabilityState
  secureStorage: RuntimeCapabilityState
}

const routeByPath = new Map<string, EmployeeNavRouteName>([
  ['/', 'home'],
  ['/schedule', 'schedule'],
  ['/attendance', 'attendance'],
  ['/payroll', 'payroll'],
  ['/contracts', 'contracts'],
  ['/notifications', 'notifications'],
])

export function getEmployeeRuntimeCapabilities(
  capacitor: CapacitorRuntimeLike = Capacitor,
): EmployeeRuntimeCapabilities {
  const platform = normalizePlatform(capacitor.getPlatform())
  const nativeBridge = capacitor.isNativePlatform()
  const hasAppPlugin = isPluginAvailable(capacitor, 'App')
  const hasPushPlugin = isPluginAvailable(capacitor, 'PushNotifications')
  const hasSecureStoragePlugin = isPluginAvailable(capacitor, 'SecureStorage')

  return {
    platform,
    nativeBridge,
    appResume: nativeBridge
      ? capabilityFromPlugin(hasAppPlugin)
      : 'browser-fallback',
    deepLink: nativeBridge
      ? capabilityFromPlugin(hasAppPlugin)
      : 'browser-fallback',
    pushPermission: nativeBridge
      ? capabilityFromPlugin(hasPushPlugin)
      : 'unsupported',
    secureStorage: nativeBridge
      ? capabilityFromPlugin(hasSecureStoragePlugin)
      : 'browser-fallback',
  }
}

export function resolveEmployeeDeepLinkRoute(url: string): EmployeeNavRouteName | null {
  if (/\s/.test(url)) {
    return null
  }
  let parsed: URL
  try {
    parsed = new URL(url, 'https://employee.il-log.local')
  } catch {
    return null
  }

  const path = normalizeDeepLinkPath(parsed)
  return routeByPath.get(path) ?? null
}

export function shouldUseNativePlugin(state: RuntimeCapabilityState): boolean {
  return state === 'available'
}

function normalizePlatform(platform: string): RuntimePlatform {
  if (platform === 'ios' || platform === 'android') {
    return platform
  }
  return 'web'
}

function isPluginAvailable(
  capacitor: CapacitorRuntimeLike,
  pluginName: string,
): boolean {
  return Boolean(capacitor.isPluginAvailable?.(pluginName))
}

function capabilityFromPlugin(available: boolean): RuntimeCapabilityState {
  return available ? 'available' : 'native-plugin-unavailable'
}

function normalizeDeepLinkPath(parsed: URL): string {
  const rawPath = parsed.pathname === '' ? '/' : parsed.pathname
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:' && parsed.hostname !== '') {
    return rawPath === '/' ? `/${parsed.hostname}` : rawPath
  }
  return rawPath
}
