import type {
  AppNotificationResponse,
  AppNotificationTargetType,
  AppNotificationType,
} from '../api/types'
import type { EmployeeNavRouteName } from '../app/navigation'

export type NotificationTone = 'planned' | 'success' | 'warning' | 'muted'
export type NotificationIcon = 'contract' | 'schedule' | 'payroll' | 'attendance' | 'system'

export function sortNotifications(
  notifications: AppNotificationResponse[],
): AppNotificationResponse[] {
  return [...notifications].sort((left, right) => {
    const readCompare = Number(left.read) - Number(right.read)
    if (readCompare !== 0) {
      return readCompare
    }
    const createdCompare = dateValue(right.createdAt).localeCompare(dateValue(left.createdAt))
    if (createdCompare !== 0) {
      return createdCompare
    }
    return right.notificationId.localeCompare(left.notificationId)
  })
}

export function notificationTypeKey(type: AppNotificationType): string {
  return `notifications.type.${toCamelCase(type)}`
}

export function notificationTargetKey(targetType: AppNotificationTargetType): string {
  return `notifications.target.${toCamelCase(targetType)}`
}

export function notificationTone(type: AppNotificationType): NotificationTone {
  if (type === 'CONTRACT_SIGNING_REQUEST' || type === 'SCHEDULE_UPDATED') {
    return 'planned'
  }
  if (type === 'CONTRACT_COMPLETED' || type === 'PAYROLL_AVAILABLE') {
    return 'success'
  }
  if (type === 'ATTENDANCE_STATUS_CHANGED') {
    return 'warning'
  }
  return 'muted'
}

export function notificationIcon(type: AppNotificationType): NotificationIcon {
  switch (type) {
    case 'CONTRACT_SIGNING_REQUEST':
    case 'CONTRACT_COMPLETED':
      return 'contract'
    case 'SCHEDULE_UPDATED':
      return 'schedule'
    case 'PAYROLL_AVAILABLE':
      return 'payroll'
    case 'ATTENDANCE_STATUS_CHANGED':
      return 'attendance'
    case 'SYSTEM':
      return 'system'
  }
}

export function resolveNotificationRoute(
  notification: AppNotificationResponse,
): EmployeeNavRouteName | null {
  if (!notification.targetId) {
    return null
  }
  switch (notification.targetType) {
    case 'CONTRACT':
      return 'contracts'
    case 'SCHEDULE':
      return 'schedule'
    case 'PAYROLL':
      return 'payroll'
    case 'ATTENDANCE':
      return 'attendance'
    case 'STORE':
      return 'settings'
    case 'NONE':
      return null
  }
}

function toCamelCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/_([a-z])/g, (_, character: string) => character.toUpperCase())
}

function dateValue(value: string | null): string {
  return value ?? ''
}
