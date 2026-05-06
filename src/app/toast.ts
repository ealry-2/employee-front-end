import { readonly, ref } from 'vue'

export type EmployeeToastTone = 'info' | 'success' | 'error'

export interface EmployeeToast {
  id: number
  message: string
  tone: EmployeeToastTone
}

const toasts = ref<EmployeeToast[]>([])
const toastTimers = new Map<number, ReturnType<typeof setTimeout>>()
let nextToastId = 0

export function showEmployeeToast(
  message: string,
  tone: EmployeeToastTone = 'info',
  durationMs = 3200,
): number {
  const id = ++nextToastId
  toasts.value = [...toasts.value, { id, message, tone }]

  if (durationMs > 0) {
    toastTimers.set(
      id,
      setTimeout(() => dismissEmployeeToast(id), durationMs),
    )
  }

  return id
}

export function dismissEmployeeToast(id: number): void {
  const timer = toastTimers.get(id)
  if (timer) {
    clearTimeout(timer)
    toastTimers.delete(id)
  }
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

export function clearEmployeeToasts(): void {
  for (const timer of toastTimers.values()) {
    clearTimeout(timer)
  }
  toastTimers.clear()
  toasts.value = []
}

export function useEmployeeToasts() {
  return {
    toasts: readonly(toasts),
    showToast: showEmployeeToast,
    dismissToast: dismissEmployeeToast,
    clearToasts: clearEmployeeToasts,
  }
}
