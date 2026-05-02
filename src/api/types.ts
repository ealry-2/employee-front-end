export type UserType = 'OWNER' | 'EMPLOYEE'
export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED'
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'RESIGNED'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userId: string
  email: string
  name: string
  userType: UserType
  accessTokenExpiresIn?: number
}

export interface AppUserSummary {
  userId: string
  email: string
  name: string
  userType: UserType
  status: UserStatus
  phone: string | null
  address: string | null
}

export interface AppStoreMembershipSummary {
  storeId: string
  name: string
  address: string | null
  phone: string | null
  displayOrder: number | null
  employeeId: string | null
  employeeName: string | null
  role: string | null
  contactEmail: string | null
  contactPhone: string | null
  hireDate: string | null
  employeeStatus: EmployeeStatus
}

export interface AppAuthBootstrapResponse {
  user: AppUserSummary
  stores: AppStoreMembershipSummary[]
  selectedStore: AppStoreMembershipSummary | null
  hasStores: boolean
}
