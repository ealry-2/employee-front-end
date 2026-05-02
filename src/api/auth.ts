import { apiClient } from './client'
import type { EmployeeAxiosRequestConfig } from './client'
import type { AppAuthBootstrapResponse, LoginResponse } from './types'

export interface LoginRequest {
  email: string
  password: string
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', request, {
    skipAuthRefresh: true,
  } as EmployeeAxiosRequestConfig)
  return response.data
}

export async function loadAppBootstrap(): Promise<AppAuthBootstrapResponse> {
  const response = await apiClient.get<AppAuthBootstrapResponse>('/api/app/auth/bootstrap')
  return response.data
}

export async function logoutSession(): Promise<void> {
  await apiClient.post('/api/auth/logout', undefined, {
    skipAuthRefresh: true,
  } as EmployeeAxiosRequestConfig)
}
