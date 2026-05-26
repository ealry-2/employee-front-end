export type UserType = 'OWNER' | 'EMPLOYEE'
export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED'
export type EmployeeStatus =
  | 'INVITED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'RESIGNED'
export type ScheduleStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
export type AttendanceStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type AttendanceSource = 'MANUAL' | 'AUTO_SCHEDULE' | 'QR_SCAN'
export type EmployeeCompensationType = 'HOURLY' | 'MONTHLY' | 'ANNUAL'
export type PayrollStatus = 'DRAFT' | 'CONFIRMED' | 'PAID'
export type ContractStatus = 'DRAFT' | 'PENDING' | 'SIGNED' | 'CANCELLED' | 'EXPIRED'
export type AppNotificationType =
  | 'CONTRACT_SIGNING_REQUEST'
  | 'CONTRACT_COMPLETED'
  | 'SCHEDULE_UPDATED'
  | 'PAYROLL_AVAILABLE'
  | 'ATTENDANCE_STATUS_CHANGED'
  | 'SYSTEM'
export type AppNotificationTargetType =
  | 'NONE'
  | 'CONTRACT'
  | 'SCHEDULE'
  | 'PAYROLL'
  | 'ATTENDANCE'
  | 'STORE'
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
  expiresIn?: number
}

export interface MessageResponse {
  message: string
}

export interface ResetTokenValidationResponse {
  valid: boolean
  email: string
}

export interface AcceptEmployeeInvitationRequest {
  password: string | null
  confirmPassword: string | null
  agreeTerms: boolean
  agreePrivacy: boolean
}

export interface EmployeeInvitationResponse {
  invitationStatus: string
  email: string
  employeeName: string
  storeName: string
  hireDate: string | null
  role: string | null
  employeeStatus: EmployeeStatus
  userStatus: UserStatus
  requiresLogin: boolean
  requiresPasswordSetup: boolean
  expiresAt: string | null
}

export interface AppUserSummary {
  userId: string
  email: string
  name: string
  userType: UserType
  status: UserStatus
  phone: string | null
  address: string | null
  profileImageUrl: string | null
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

export interface ScheduleCoworkerSummary {
  employeeId: string
  name: string
  role: string | null
  startTime: string | null
  endTime: string | null
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
  coworkers?: ScheduleCoworkerSummary[]
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

export interface AttendanceQrClockInResponse {
  attendance: AttendanceResponse
  distanceMeters: number
  radiusMeters: number
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
  firstPartyName: string | null
  signingRequired: boolean
  workStartDate: string | null
  workEndDate: string | null
  completedAt: string | null
  updatedAt: string | null
}

export interface AppContractDetailResponse {
  summary: AppContractListItemResponse
  content: string
}

export interface AppContractSigningSessionResponse {
  signingUrl: string
}

export interface AppContractListResponse {
  items: AppContractListItemResponse[]
  page: number
  size: number
  empty: boolean
}

export interface AppNotificationResponse {
  notificationId: string
  type: AppNotificationType
  title: string
  body: string
  targetType: AppNotificationTargetType
  targetId: string | null
  read: boolean
  readAt: string | null
  createdAt: string | null
}

export interface AppNotificationListResponse {
  items: AppNotificationResponse[]
  page: number
  size: number
  empty: boolean
  unreadCount: number
}
