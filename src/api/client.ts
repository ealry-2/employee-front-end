import axios, { AxiosError } from 'axios'
import { getAccessToken } from '@/session/tokenStorage'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''

export const apiClient = axios.create({
  baseURL: configuredBaseUrl,
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function isUnauthorized(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401
}
