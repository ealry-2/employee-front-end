import { apiClient } from './client'
import type {
  AppContractDetailResponse,
  AppContractListResponse,
  ContractStatus,
} from './types'

export interface LoadMyContractsRequest {
  storeId: string
  status?: ContractStatus
  page?: number
  size?: number
}

export interface LoadMyContractDetailRequest {
  storeId: string
  contractId: string
}

export async function loadMyContracts(
  request: LoadMyContractsRequest,
): Promise<AppContractListResponse> {
  const response = await apiClient.get<AppContractListResponse>(
    `/api/app/stores/${encodeURIComponent(request.storeId)}/contracts`,
    {
      params: {
        status: request.status,
        page: request.page ?? 0,
        size: request.size ?? 50,
      },
    },
  )
  return response.data
}

export async function loadMyContractDetail(
  request: LoadMyContractDetailRequest,
): Promise<AppContractDetailResponse> {
  const response = await apiClient.get<AppContractDetailResponse>(
    `/api/app/stores/${encodeURIComponent(request.storeId)}/contracts/${encodeURIComponent(
      request.contractId,
    )}`,
  )
  return response.data
}
