import { apiClient } from './client'
import type { EmployeeAxiosRequestConfig } from './client'
import type { AppAuthBootstrapResponse, AppUserSummary, LoginResponse } from './types'
import {
  createDemoBootstrap,
  createDemoLoginResponse,
} from '../demo/employeeDemoData'
import { isEmployeeDemoModeEnabled } from '../demo/employeeDemoMode'

export interface LoginRequest {
  email: string
  password: string
}

export interface UpdateAppProfileRequest {
  name: string
  phone: string | null
  address: string | null
  profileImageUrl: string | null
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  if (isEmployeeDemoModeEnabled()) {
    return createDemoLoginResponse()
  }

  const response = await apiClient.post<LoginResponse>('/api/auth/login', request, {
    skipAuthRefresh: true,
  } as EmployeeAxiosRequestConfig)
  return response.data
}

export async function loadAppBootstrap(): Promise<AppAuthBootstrapResponse> {
  if (isEmployeeDemoModeEnabled()) {
    return createDemoBootstrap()
  }

  const response = await apiClient.get<AppAuthBootstrapResponse>('/api/app/auth/bootstrap')
  return response.data
}

export async function updateAppProfile(
  request: UpdateAppProfileRequest,
): Promise<AppUserSummary> {
  if (isEmployeeDemoModeEnabled()) {
    const bootstrap = createDemoBootstrap()
    return {
      ...bootstrap.user,
      name: request.name,
      phone: request.phone,
      address: request.address,
      profileImageUrl: request.profileImageUrl,
    }
  }

  const response = await apiClient.put<AppUserSummary>('/api/app/auth/profile', request)
  return response.data
}

export async function logoutSession(): Promise<void> {
  if (isEmployeeDemoModeEnabled()) {
    return
  }

  await apiClient.post('/api/auth/logout', undefined, {
    skipAuthRefresh: true,
  } as EmployeeAxiosRequestConfig)
}
