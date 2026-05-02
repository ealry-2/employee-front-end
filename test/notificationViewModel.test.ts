import test from 'node:test'
import assert from 'node:assert/strict'
import {
  notificationTargetKey,
  notificationTone,
  notificationTypeKey,
  resolveNotificationRoute,
  sortNotifications,
} from '../src/notifications/notificationViewModel.ts'
import type {
  AppNotificationResponse,
  AppNotificationTargetType,
  AppNotificationType,
} from '../src/api/types.ts'

test('sortNotifications keeps unread notifications first and then latest created order', () => {
  const notifications = [
    notification('read-latest', 'SYSTEM', 'NONE', null, true, '2026-05-03T00:00:00Z'),
    notification('unread-old', 'SYSTEM', 'NONE', null, false, '2026-05-01T00:00:00Z'),
    notification('unread-new', 'SYSTEM', 'NONE', null, false, '2026-05-02T00:00:00Z'),
  ]

  assert.deepEqual(sortNotifications(notifications).map((item) => item.notificationId), [
    'unread-new',
    'unread-old',
    'read-latest',
  ])
})

test('notification helpers map backend enum values to i18n keys and tones', () => {
  assert.equal(notificationTypeKey('CONTRACT_SIGNING_REQUEST'), 'notifications.type.contractSigningRequest')
  assert.equal(notificationTargetKey('PAYROLL'), 'notifications.target.payroll')
  assert.equal(notificationTone('CONTRACT_SIGNING_REQUEST'), 'planned')
  assert.equal(notificationTone('PAYROLL_AVAILABLE'), 'success')
  assert.equal(notificationTone('ATTENDANCE_STATUS_CHANGED'), 'warning')
  assert.equal(notificationTone('SYSTEM'), 'muted')
})

test('resolveNotificationRoute maps valid notification targets to shell routes', () => {
  assert.equal(resolveNotificationRoute(notification('contract', 'CONTRACT_COMPLETED', 'CONTRACT')), 'contracts')
  assert.equal(resolveNotificationRoute(notification('schedule', 'SCHEDULE_UPDATED', 'SCHEDULE')), 'home')
  assert.equal(resolveNotificationRoute(notification('payroll', 'PAYROLL_AVAILABLE', 'PAYROLL')), 'payroll')
  assert.equal(resolveNotificationRoute(notification('attendance', 'ATTENDANCE_STATUS_CHANGED', 'ATTENDANCE')), 'attendance')
  assert.equal(resolveNotificationRoute(notification('store', 'SYSTEM', 'STORE')), 'home')
})

test('resolveNotificationRoute fails closed when target payload is missing', () => {
  assert.equal(resolveNotificationRoute(notification('none', 'SYSTEM', 'NONE', null)), null)
  assert.equal(resolveNotificationRoute(notification('missing', 'PAYROLL_AVAILABLE', 'PAYROLL', null)), null)
})

function notification(
  notificationId: string,
  type: AppNotificationType,
  targetType: AppNotificationTargetType,
  targetId: string | null = '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  read = false,
  createdAt = '2026-05-02T00:00:00Z',
): AppNotificationResponse {
  return {
    notificationId,
    type,
    title: notificationId,
    body: 'body',
    targetType,
    targetId,
    read,
    readAt: read ? '2026-05-02T01:00:00Z' : null,
    createdAt,
  }
}
