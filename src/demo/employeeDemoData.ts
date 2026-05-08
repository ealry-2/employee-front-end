import type {
  AppAttendanceCurrentResponse,
  AppAuthBootstrapResponse,
  AppContractDetailResponse,
  AppContractListResponse,
  AppNotificationListResponse,
  AppNotificationResponse,
  AppScheduleListResponse,
  AttendanceQrClockInResponse,
  AttendanceResponse,
  LoginResponse,
  PayrollResponse,
  ScheduleResponse,
} from '../api/types'
import type {
  ClockInByQrRequest,
  ClockInEmployeeRequest,
  ClockOutEmployeeRequest,
} from '../api/attendance'
import type { LoadMyContractsRequest } from '../api/contracts'
import type { LoadMyNotificationsRequest, MarkNotificationReadRequest } from '../api/notifications'
import type { LoadMyPayrollsRequest } from '../api/payroll'
import type { LoadEmployeeSchedulesRequest } from '../api/schedule'

const demoUserId = 'demo-user-1'
const demoEmployeeId = 'demo-employee-1'
const demoStoreId = 'demo-store-1'
const secondaryStoreId = 'demo-store-2'

export function createDemoLoginResponse(): LoginResponse {
  return {
    accessToken: 'employee-demo-access-token',
    refreshToken: 'employee-demo-refresh-token',
    userId: demoUserId,
    email: 'employee.demo@illog.local',
    name: '김일로그',
    userType: 'EMPLOYEE',
    expiresIn: 3600,
  }
}

export function createDemoBootstrap(): AppAuthBootstrapResponse {
  const stores = [
    {
      storeId: demoStoreId,
      name: '일로그 성수점',
      address: '서울 성동구 연무장길 12',
      phone: '02-1234-5678',
      displayOrder: 1,
      employeeId: demoEmployeeId,
      employeeName: '김일로그',
      role: '오픈 바리스타',
      contactEmail: 'employee.demo@illog.local',
      contactPhone: '010-1234-5678',
      hireDate: '2025-11-03',
      employeeStatus: 'ACTIVE' as const,
    },
    {
      storeId: secondaryStoreId,
      name: '일로그 한남점',
      address: '서울 용산구 이태원로 55',
      phone: '02-9876-5432',
      displayOrder: 2,
      employeeId: 'demo-employee-2',
      employeeName: '김일로그',
      role: '주말 파트',
      contactEmail: 'employee.demo@illog.local',
      contactPhone: '010-1234-5678',
      hireDate: '2026-01-08',
      employeeStatus: 'ACTIVE' as const,
    },
  ]

  return {
    user: {
      userId: demoUserId,
      email: 'employee.demo@illog.local',
      name: '김일로그',
      userType: 'EMPLOYEE',
      status: 'ACTIVE',
      phone: '010-1234-5678',
      address: '서울 성동구',
      profileImageUrl: null,
    },
    stores,
    selectedStore: stores[0],
    hasStores: true,
  }
}

export function loadDemoSchedules(
  request: LoadEmployeeSchedulesRequest,
): AppScheduleListResponse {
  const schedules = createDemoSchedules(request.storeId).filter(
    (schedule) => schedule.workDate >= request.startDate && schedule.workDate <= request.endDate,
  )

  return {
    items: schedules,
    startDate: request.startDate,
    endDate: request.endDate,
    page: request.page ?? 0,
    size: request.size ?? 200,
    empty: schedules.length === 0,
  }
}

export function loadDemoScheduleDetail(storeId: string, scheduleId: string): ScheduleResponse {
  return (
    createDemoSchedules(storeId).find((schedule) => schedule.scheduleId === scheduleId) ??
    createDemoSchedules(storeId)[0]
  )
}

export function loadDemoAttendanceCurrent(storeId: string): AppAttendanceCurrentResponse {
  const today = formatDate(new Date())
  const now = new Date()
  const scheduledShift = createSchedule({
    scheduleId: `demo-schedule-${today}`,
    storeId,
    workDate: today,
    startTime: '09:00',
    endTime: '15:00',
    memo: '오픈 준비와 오전 피크 담당',
  })
  const openAttendance = createAttendance({
    recordId: 'demo-attendance-open',
    storeId,
    workDate: today,
    scheduleId: scheduledShift.scheduleId,
    clockInAt: setTime(now, 9, 2),
    clockOutAt: null,
    totalWorkMinutes: null,
  })

  return {
    storeId,
    employeeId: demoEmployeeId,
    workDate: today,
    serverTime: now.toISOString(),
    status: 'CLOCKED_IN',
    nextAction: 'CLOCK_OUT',
    canClockIn: false,
    canClockOut: true,
    scheduledShift,
    openAttendance,
    latestAttendance: openAttendance,
    todayAttendances: [openAttendance],
  }
}

export function clockInDemoEmployee(request: ClockInEmployeeRequest): AttendanceResponse {
  return createAttendance({
    recordId: 'demo-attendance-clock-in',
    storeId: request.storeId,
    workDate: request.workDate,
    scheduleId: request.scheduleId ?? null,
    clockInAt: new Date().toISOString(),
    clockOutAt: null,
    totalWorkMinutes: null,
  })
}

export function clockInQrDemoEmployee(
  request: ClockInByQrRequest,
): AttendanceQrClockInResponse {
  const attendance = createAttendance({
    recordId: 'demo-attendance-qr-clock-in',
    storeId: request.storeId,
    workDate: formatDate(new Date()),
    clockInAt: new Date().toISOString(),
    clockOutAt: null,
    totalWorkMinutes: null,
    source: 'QR_SCAN',
  })

  return {
    attendance,
    distanceMeters: 12,
    radiusMeters: 500,
  }
}

export function clockOutDemoEmployee(request: ClockOutEmployeeRequest): AttendanceResponse {
  const today = formatDate(new Date())
  return createAttendance({
    recordId: request.recordId,
    storeId: demoStoreId,
    workDate: today,
    scheduleId: `demo-schedule-${today}`,
    clockInAt: setTime(new Date(), 9, 2),
    clockOutAt: new Date().toISOString(),
    totalWorkMinutes: 342,
    breakMinutes: null,
  })
}

export function loadDemoPayrolls(request: LoadMyPayrollsRequest): PayrollResponse[] {
  const today = new Date()
  const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  return [previousMonth, currentMonth].map((month, index) => ({
    payrollId: `demo-payroll-${index + 1}`,
    employeeId: demoEmployeeId,
    contractIdSnapshot: 'demo-contract-1',
    storeId: request.storeId,
    payPeriodStart: formatDate(month),
    payPeriodEnd: formatDate(new Date(month.getFullYear(), month.getMonth() + 1, 0)),
    compensationTypeSnapshot: 'HOURLY',
    baseHourlyWageSnapshot: 12000,
    monthlySalarySnapshot: null,
    annualSalarySnapshot: null,
    basePay: index === 0 ? 1320000 : 480000,
    overtimePay: index === 0 ? 96000 : 0,
    nightPay: 0,
    holidayPay: 0,
    weeklyHolidayPay: index === 0 ? 72000 : 24000,
    grossPay: index === 0 ? 1488000 : 504000,
    nationalPension: index === 0 ? 66960 : 0,
    healthInsurance: index === 0 ? 52500 : 0,
    longTermCare: index === 0 ? 6800 : 0,
    employmentInsurance: index === 0 ? 13390 : 0,
    incomeTax: index === 0 ? 18200 : 0,
    localIncomeTax: index === 0 ? 1820 : 0,
    totalDeductions: index === 0 ? 159670 : 0,
    netPay: index === 0 ? 1328330 : 504000,
    status: index === 0 ? 'PAID' : 'CONFIRMED',
    paidAt: index === 0 ? setTime(new Date(), 10, 0) : null,
    pdfPath: null,
    createdAt: setTime(new Date(), 9, 0),
    updatedAt: setTime(new Date(), 9, 0),
  }))
}

export function loadDemoContracts(request: LoadMyContractsRequest): AppContractListResponse {
  const items = createDemoContracts(request.storeId).filter(
    (contract) => !request.status || contract.status === request.status,
  )

  return {
    items,
    page: request.page ?? 0,
    size: request.size ?? 50,
    empty: items.length === 0,
  }
}

export function loadDemoContractDetail(
  request: LoadMyContractsRequest & { contractId: string },
): AppContractDetailResponse {
  const summary =
    createDemoContracts(request.storeId).find(
      (contract) => contract.contractId === request.contractId,
    ) ?? createDemoContracts(request.storeId)[0]

  return {
    summary,
    content:
      '근로 장소, 담당 업무, 임금, 근로 시간, 휴게 시간, 계약 기간을 포함한 직원 확인용 계약서 미리보기입니다. 실제 서명 토큰과 원본 저장 경로는 demo 응답에 포함하지 않습니다.',
  }
}

export function loadDemoNotifications(
  request: LoadMyNotificationsRequest,
): AppNotificationListResponse {
  const allItems = createDemoNotifications(request.storeId)
  const items = request.unreadOnly ? allItems.filter((item) => !item.read) : allItems

  return {
    items,
    page: request.page ?? 0,
    size: request.size ?? 50,
    empty: items.length === 0,
    unreadCount: allItems.filter((item) => !item.read).length,
  }
}

export function markDemoNotificationRead(
  request: MarkNotificationReadRequest,
): AppNotificationResponse {
  const notification =
    createDemoNotifications(request.storeId).find(
      (item) => item.notificationId === request.notificationId,
    ) ?? createDemoNotifications(request.storeId)[0]

  return {
    ...notification,
    read: true,
    readAt: new Date().toISOString(),
  }
}

function createDemoSchedules(storeId: string): ScheduleResponse[] {
  const today = new Date()
  return [
    createSchedule({
      scheduleId: 'demo-schedule-yesterday',
      storeId,
      workDate: formatDate(shiftDate(today, -1)),
      startTime: '10:00',
      endTime: '16:00',
      status: 'COMPLETED',
      memo: '마감 보조',
      coworkers: [
        {
          employeeId: 'demo-coworker-minji',
          name: '박민지',
          role: '마감',
          startTime: '12:00',
          endTime: '18:00',
        },
      ],
    }),
    createSchedule({
      scheduleId: `demo-schedule-${formatDate(today)}`,
      storeId,
      workDate: formatDate(today),
      startTime: '09:00',
      endTime: '15:00',
      memo: '오픈 준비와 오전 피크 담당',
      coworkers: [
        {
          employeeId: 'demo-coworker-seoyeon',
          name: '김서연',
          role: '오픈',
          startTime: '08:30',
          endTime: '14:00',
        },
        {
          employeeId: 'demo-coworker-jiho',
          name: '이지호',
          role: '바리스타',
          startTime: '10:00',
          endTime: '16:00',
        },
        {
          employeeId: 'demo-coworker-hana',
          name: '정하나',
          role: '캐셔',
          startTime: '11:00',
          endTime: '17:00',
        },
      ],
    }),
    createSchedule({
      scheduleId: 'demo-schedule-next',
      storeId,
      workDate: formatDate(shiftDate(today, 3)),
      startTime: '14:00',
      endTime: '20:00',
      memo: '재고 정리 포함',
      coworkers: [
        {
          employeeId: 'demo-coworker-minsu',
          name: '최민수',
          role: '마감',
          startTime: '15:00',
          endTime: '21:00',
        },
        {
          employeeId: 'demo-coworker-yuna',
          name: '한유나',
          role: '홀',
          startTime: '14:00',
          endTime: '20:00',
        },
      ],
    }),
  ]
}

function createSchedule(
  overrides: Partial<ScheduleResponse> & Pick<ScheduleResponse, 'scheduleId' | 'storeId' | 'workDate'>,
): ScheduleResponse {
  return {
    scheduleId: overrides.scheduleId,
    storeId: overrides.storeId,
    employeeId: demoEmployeeId,
    workDate: overrides.workDate,
    startTime: overrides.startTime ?? '09:00',
    endTime: overrides.endTime ?? '15:00',
    breakMinutes: overrides.breakMinutes ?? 30,
    scheduledWorkMinutes: overrides.scheduledWorkMinutes ?? 330,
    status: overrides.status ?? 'SCHEDULED',
    memo: overrides.memo ?? null,
    coworkers: overrides.coworkers ?? [],
    createdAt: overrides.createdAt ?? setTime(new Date(), 8, 0),
    updatedAt: overrides.updatedAt ?? setTime(new Date(), 8, 0),
  }
}

function createAttendance(
  overrides: Partial<AttendanceResponse> &
    Pick<AttendanceResponse, 'recordId' | 'storeId' | 'workDate'>,
): AttendanceResponse {
  return {
    recordId: overrides.recordId,
    scheduleId: overrides.scheduleId ?? null,
    employeeId: overrides.employeeId ?? demoEmployeeId,
    storeId: overrides.storeId,
    workDate: overrides.workDate,
    clockInAt: overrides.clockInAt ?? null,
    clockOutAt: overrides.clockOutAt ?? null,
    totalWorkMinutes: overrides.totalWorkMinutes ?? null,
    breakMinutes: overrides.breakMinutes ?? 30,
    overtimeMinutes: overrides.overtimeMinutes ?? 0,
    nightWorkMinutes: overrides.nightWorkMinutes ?? 0,
    source: overrides.source ?? 'MANUAL',
    status: overrides.status ?? 'PENDING',
    approvedBy: overrides.approvedBy ?? null,
    approvedAt: overrides.approvedAt ?? null,
    memo: overrides.memo ?? null,
    createdAt: overrides.createdAt ?? setTime(new Date(), 9, 0),
    updatedAt: overrides.updatedAt ?? setTime(new Date(), 9, 0),
  }
}

function createDemoContracts(storeId: string) {
  const today = new Date()
  return [
    {
      contractId: 'demo-contract-1',
      title: '성수점 시간제 근로계약서',
      status: 'PENDING' as const,
      presetType: 'LABOR_STANDARD' as const,
      storeId,
      firstPartyName: '일로그 성수점',
      secondPartyName: '김일로그',
      signingRequired: true,
      documentPreviewAvailable: true,
      pdfDownloadAvailable: false,
      compensationType: 'HOURLY' as const,
      baseHourlyWage: 12000,
      monthlySalary: null,
      annualSalary: null,
      workStartDate: formatDate(shiftDate(today, -30)),
      workEndDate: null,
      expiresAt: shiftDate(today, 7).toISOString(),
      completedAt: null,
      createdAt: shiftDate(today, -2).toISOString(),
      updatedAt: shiftDate(today, -1).toISOString(),
    },
    {
      contractId: 'demo-contract-2',
      title: '주말 파트 근로계약서',
      status: 'SIGNED' as const,
      presetType: 'LABOR_STANDARD' as const,
      storeId,
      firstPartyName: '일로그 한남점',
      secondPartyName: '김일로그',
      signingRequired: false,
      documentPreviewAvailable: true,
      pdfDownloadAvailable: true,
      compensationType: 'HOURLY' as const,
      baseHourlyWage: 11800,
      monthlySalary: null,
      annualSalary: null,
      workStartDate: formatDate(shiftDate(today, -90)),
      workEndDate: null,
      expiresAt: null,
      completedAt: shiftDate(today, -75).toISOString(),
      createdAt: shiftDate(today, -80).toISOString(),
      updatedAt: shiftDate(today, -75).toISOString(),
    },
  ]
}

function createDemoNotifications(storeId: string): AppNotificationResponse[] {
  const today = new Date()
  return [
    {
      notificationId: 'demo-notification-1',
      type: 'CONTRACT_SIGNING_REQUEST',
      title: '서명이 필요한 계약서가 있습니다',
      body: '성수점 시간제 근로계약서를 확인해 주세요.',
      targetType: 'CONTRACT',
      targetId: 'demo-contract-1',
      read: false,
      readAt: null,
      createdAt: shiftDate(today, -1).toISOString(),
    },
    {
      notificationId: 'demo-notification-2',
      type: 'SCHEDULE_UPDATED',
      title: '이번 주 스케줄이 변경되었습니다',
      body: '토요일 근무 시간이 14:00 - 20:00으로 조정되었습니다.',
      targetType: 'SCHEDULE',
      targetId: `demo-schedule-${storeId}`,
      read: false,
      readAt: null,
      createdAt: setTime(today, 8, 30),
    },
    {
      notificationId: 'demo-notification-3',
      type: 'PAYROLL_AVAILABLE',
      title: '급여 명세가 확정되었습니다',
      body: '지난달 급여 명세를 확인할 수 있습니다.',
      targetType: 'PAYROLL',
      targetId: 'demo-payroll-1',
      read: true,
      readAt: shiftDate(today, -3).toISOString(),
      createdAt: shiftDate(today, -4).toISOString(),
    },
  ]
}

function shiftDate(date: Date, dayOffset: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayOffset)
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function setTime(date: Date, hours: number, minutes: number): string {
  const nextDate = new Date(date)
  nextDate.setHours(hours, minutes, 0, 0)
  return nextDate.toISOString()
}
