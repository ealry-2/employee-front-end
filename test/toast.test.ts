import test from 'node:test'
import assert from 'node:assert/strict'
import {
  clearEmployeeToasts,
  dismissEmployeeToast,
  showEmployeeToast,
  useEmployeeToasts,
} from '../src/app/toast.ts'

test('employee toast store shows and dismisses shared toast messages', () => {
  clearEmployeeToasts()
  const { toasts } = useEmployeeToasts()

  const id = showEmployeeToast('처리되었습니다.', 'success', 0)

  assert.equal(toasts.value.length, 1)
  assert.equal(toasts.value[0]?.id, id)
  assert.equal(toasts.value[0]?.message, '처리되었습니다.')
  assert.equal(toasts.value[0]?.tone, 'success')

  dismissEmployeeToast(id)

  assert.equal(toasts.value.length, 0)
})
