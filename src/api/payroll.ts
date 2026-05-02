import { apiClient } from './client'
import type { PayrollResponse } from './types'
import { loadDemoPayrolls } from '../demo/employeeDemoData'
import { isEmployeeDemoModeEnabled } from '../demo/employeeDemoMode'

export interface LoadMyPayrollsRequest {
  storeId: string
  page?: number
  size?: number
}

export async function loadMyPayrolls(
  request: LoadMyPayrollsRequest,
): Promise<PayrollResponse[]> {
  if (isEmployeeDemoModeEnabled()) {
    return loadDemoPayrolls(request)
  }

  const response = await apiClient.get<PayrollResponse[]>('/api/alba/my/payroll', {
    params: {
      storeId: request.storeId,
      page: request.page ?? 0,
      size: request.size ?? 50,
    },
  })
  return response.data
}
