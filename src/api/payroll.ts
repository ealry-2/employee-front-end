import { apiClient } from './client'
import type { PayrollResponse } from './types'

export interface LoadMyPayrollsRequest {
  storeId: string
  page?: number
  size?: number
}

export async function loadMyPayrolls(
  request: LoadMyPayrollsRequest,
): Promise<PayrollResponse[]> {
  const response = await apiClient.get<PayrollResponse[]>('/api/alba/my/payroll', {
    params: {
      storeId: request.storeId,
      page: request.page ?? 0,
      size: request.size ?? 50,
    },
  })
  return response.data
}
