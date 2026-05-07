import { apiClient } from './client'
import type { EmployeeAxiosRequestConfig } from './client'
import type {
  AppAuthBootstrapResponse,
  AppUserSummary,
  LoginResponse,
  MessageResponse,
  ResetTokenValidationResponse,
} from './types'
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

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyEmailRequest {
  email: string
  verificationCode: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
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

export async function forgotPassword(request: ForgotPasswordRequest): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>('/api/auth/forgot-password', request, {
    skipAuthRefresh: true,
  } as EmployeeAxiosRequestConfig)
  return response.data
}

export async function validateResetToken(token: string): Promise<ResetTokenValidationResponse> {
  const response = await apiClient.get<ResetTokenValidationResponse>(
    '/api/auth/reset-password/validate',
    {
      params: { token },
      skipAuthRefresh: true,
    } as EmployeeAxiosRequestConfig,
  )
  return response.data
}

export async function resetPassword(request: ResetPasswordRequest): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>('/api/auth/reset-password', request, {
    skipAuthRefresh: true,
  } as EmployeeAxiosRequestConfig)
  return response.data
}

export async function verifyEmail(request: VerifyEmailRequest): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>('/api/users/verify-email', request, {
    skipAuthRefresh: true,
  } as EmployeeAxiosRequestConfig)
  return response.data
}

export async function resendVerification(
  request: ResendVerificationRequest,
): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>(
    '/api/users/resend-verification',
    request,
    {
      skipAuthRefresh: true,
    } as EmployeeAxiosRequestConfig,
  )
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
