import { apiClient } from './client'
import { appStorePath } from './paths'
import type {
  AppContractDetailResponse,
  AppContractListResponse,
  AppContractSigningSessionResponse,
  ContractStatus,
} from './types'
import {
  loadDemoContractDetail,
  loadDemoContractSigningSession,
  loadDemoContracts,
} from '../demo/employeeDemoData'
import { isEmployeeDemoModeEnabled } from '../demo/employeeDemoMode'

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

export interface CreateMyContractSigningSessionRequest {
  storeId: string
  contractId: string
}

export async function loadMyContracts(
  request: LoadMyContractsRequest,
): Promise<AppContractListResponse> {
  if (isEmployeeDemoModeEnabled()) {
    return loadDemoContracts(request)
  }

  const response = await apiClient.get<AppContractListResponse>(
    appStorePath(request.storeId, 'contracts'),
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
  if (isEmployeeDemoModeEnabled()) {
    return loadDemoContractDetail(request)
  }

  const response = await apiClient.get<AppContractDetailResponse>(
    appStorePath(request.storeId, 'contracts', request.contractId),
  )
  return response.data
}

export async function createMyContractSigningSession(
  request: CreateMyContractSigningSessionRequest,
): Promise<AppContractSigningSessionResponse> {
  if (isEmployeeDemoModeEnabled()) {
    return loadDemoContractSigningSession(request)
  }

  const response = await apiClient.post<AppContractSigningSessionResponse>(
    appStorePath(request.storeId, 'contracts', request.contractId, 'signing-session'),
  )
  return response.data
}
