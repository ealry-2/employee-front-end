export type UserType = 'OWNER' | 'EMPLOYEE'
export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED'
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'RESIGNED'
export type ScheduleStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
export type AttendanceStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type AttendanceSource = 'MANUAL' | 'AUTO_SCHEDULE'
export type EmployeeCompensationType = 'HOURLY' | 'MONTHLY' | 'ANNUAL'
export type PayrollStatus = 'DRAFT' | 'CONFIRMED' | 'PAID'
export type ContractStatus = 'DRAFT' | 'PENDING' | 'SIGNED' | 'CANCELLED' | 'EXPIRED'
export type ContractPresetType = 'NONE' | 'LABOR_STANDARD'
export type AppAttendanceCurrentStatus =
  | 'NO_SCHEDULE'
  | 'READY_TO_CLOCK_IN'
  | 'CLOCKED_IN'
  | 'CLOCKED_OUT'
export type AppAttendanceNextAction = 'CLOCK_IN' | 'CLOCK_OUT' | 'NONE'

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

export interface ScheduleResponse {
  scheduleId: string
  storeId: string
  employeeId: string | null
  workDate: string
  startTime: string
  endTime: string
  breakMinutes: number | null
  scheduledWorkMinutes: number | null
  status: ScheduleStatus
  memo: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface AppScheduleListResponse {
  items: ScheduleResponse[]
  startDate: string
  endDate: string
  page: number
  size: number
  empty: boolean
}

export interface AttendanceResponse {
  recordId: string
  scheduleId: string | null
  employeeId: string
  storeId: string
  workDate: string
  clockInAt: string | null
  clockOutAt: string | null
  totalWorkMinutes: number | null
  breakMinutes: number | null
  overtimeMinutes: number | null
  nightWorkMinutes: number | null
  source: AttendanceSource
  status: AttendanceStatus
  approvedBy: string | null
  approvedAt: string | null
  memo: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface AppAttendanceCurrentResponse {
  storeId: string
  employeeId: string
  workDate: string
  serverTime: string
  status: AppAttendanceCurrentStatus
  nextAction: AppAttendanceNextAction
  canClockIn: boolean
  canClockOut: boolean
  scheduledShift: ScheduleResponse | null
  openAttendance: AttendanceResponse | null
  latestAttendance: AttendanceResponse | null
  todayAttendances: AttendanceResponse[]
}

export interface PayrollResponse {
  payrollId: string
  employeeId: string
  contractIdSnapshot: string | null
  storeId: string
  payPeriodStart: string
  payPeriodEnd: string
  compensationTypeSnapshot: EmployeeCompensationType | null
  baseHourlyWageSnapshot: number | null
  monthlySalarySnapshot: number | null
  annualSalarySnapshot: number | null
  basePay: number | null
  overtimePay: number | null
  nightPay: number | null
  holidayPay: number | null
  weeklyHolidayPay: number | null
  grossPay: number | null
  nationalPension: number | null
  healthInsurance: number | null
  longTermCare: number | null
  employmentInsurance: number | null
  incomeTax: number | null
  localIncomeTax: number | null
  totalDeductions: number | null
  netPay: number | null
  status: PayrollStatus
  paidAt: string | null
  pdfPath: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface AppContractListItemResponse {
  contractId: string
  title: string
  status: ContractStatus
  presetType: ContractPresetType | null
  storeId: string
  firstPartyName: string | null
  secondPartyName: string | null
  signingRequired: boolean
  documentPreviewAvailable: boolean
  pdfDownloadAvailable: boolean
  compensationType: EmployeeCompensationType | null
  baseHourlyWage: number | null
  monthlySalary: number | null
  annualSalary: number | null
  workStartDate: string | null
  workEndDate: string | null
  expiresAt: string | null
  completedAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface AppContractDetailResponse {
  summary: AppContractListItemResponse
  content: string
}

export interface AppContractListResponse {
  items: AppContractListItemResponse[]
  page: number
  size: number
  empty: boolean
}
