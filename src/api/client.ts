import axios from 'axios'
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import type { LoginResponse } from './types'
import {
  clearTokens,
  getAccessToken,
  getActiveTokenPersistence,
  getRefreshToken,
  saveTokens,
} from '@/session/tokenStorage'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''

export type EmployeeAxiosRequestConfig = AxiosRequestConfig & {
  skipAuthRefresh?: boolean
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  skipAuthRefresh?: boolean
  hasRetriedAfterRefresh?: boolean
}

export const apiClient = axios.create({
  baseURL: configuredBaseUrl,
  timeout: 15000,
})

const refreshClient = axios.create({
  baseURL: configuredBaseUrl,
  timeout: 15000,
})

let refreshRequest: Promise<LoginResponse> | null = null

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const requestConfig = error.config as RetryableRequestConfig | undefined
    if (
      !requestConfig ||
      requestConfig.skipAuthRefresh ||
      requestConfig.hasRetriedAfterRefresh ||
      isAuthRefreshExcluded(requestConfig.url)
    ) {
      return Promise.reject(error)
    }

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearTokens()
      return Promise.reject(error)
    }

    requestConfig.hasRetriedAfterRefresh = true

    try {
      await refreshEmployeeTokens(refreshToken)
      return apiClient(requestConfig)
    } catch (refreshError) {
      clearTokens()
      return Promise.reject(refreshError)
    }
  },
)

export function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}

export function isForbidden(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 403
}

export function isStateConflict(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false
  }
  const status = error.response?.status
  return status === 400 || status === 409 || status === 422
}

async function refreshEmployeeTokens(refreshToken: string): Promise<LoginResponse> {
  if (!refreshRequest) {
    const persistence = getActiveTokenPersistence()
    refreshRequest = refreshClient
      .post<LoginResponse>('/api/auth/refresh', { refreshToken })
      .then((response) => {
        if (response.data.userType !== 'EMPLOYEE') {
          throw new Error('Refresh response is not for an employee account')
        }
        saveTokens(response.data.accessToken, response.data.refreshToken, persistence)
        return response.data
      })
      .finally(() => {
        refreshRequest = null
      })
  }
  return refreshRequest
}

function isAuthRefreshExcluded(url: string | undefined): boolean {
  return (
    url === '/api/auth/login' ||
    url === '/api/auth/logout' ||
    url === '/api/auth/refresh'
  )
}
