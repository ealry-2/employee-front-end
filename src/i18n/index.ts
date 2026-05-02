import { createI18n } from 'vue-i18n'

export const messages = {
  ko: {
    app: {
      brand: '일로그 직원앱',
      loading: '불러오는 중',
      retry: '다시 시도',
      logout: '로그아웃',
    },
    nav: {
      primary: '직원 앱 주요 메뉴',
      home: '홈',
      homeShort: '홈',
      schedule: '일정',
      scheduleShort: '일정',
      attendance: '출퇴근',
      attendanceShort: '출퇴근',
      payroll: '급여',
      payrollShort: '급여',
      contracts: '계약',
      contractsShort: '계약',
    },
    screen: {
      home: {
        title: '오늘의 근무',
      },
      schedule: {
        title: '내 일정',
      },
      attendance: {
        title: '출퇴근',
      },
      payroll: {
        title: '내 급여',
      },
      contracts: {
        title: '내 계약',
      },
    },
    feature: {
      eyebrow: '다음 단계 준비됨',
      schedule: {
        description: '선택한 사업장 기준으로 내 근무 일정 화면을 연결할 자리입니다.',
      },
      attendance: {
        description: '현재 근무 상태와 출퇴근 체크 화면을 연결할 자리입니다.',
      },
      payroll: {
        description: '월별 급여 목록과 상세 금액 화면을 연결할 자리입니다.',
      },
      contracts: {
        description: '서명 필요 계약과 계약 상세 화면을 연결할 자리입니다.',
      },
    },
    login: {
      title: '직원 로그인',
      subtitle: '근무 일정, 출퇴근, 급여와 계약을 확인합니다.',
      email: '이메일',
      password: '비밀번호',
      remember: '로그인 유지',
      submit: '로그인',
      submitting: '로그인 중',
      employeeOnly: '직원 계정으로 로그인해주세요.',
      failed: '로그인할 수 없습니다. 입력값을 확인해주세요.',
    },
    home: {
      title: '오늘의 근무',
      greeting: '{name}님',
      store: '현재 사업장',
      stores: '소속 사업장',
      profile: '내 정보',
      role: '역할',
      hireDate: '입사일',
      phone: '연락처',
      email: '이메일',
      emptyTitle: '활성 소속 사업장이 없습니다',
      emptyDescription: '사업주가 직원 등록을 완료했는지 확인해주세요.',
      errorTitle: '직원 앱 정보를 불러오지 못했습니다',
      sessionExpired: '세션이 만료되었습니다. 다시 로그인해주세요.',
      upcomingReady: '일정, 출퇴근, 급여, 계약 화면은 이 홈 위에 이어서 붙입니다.',
    },
  },
  en: {
    app: {
      brand: 'il-log employee',
      loading: 'Loading',
      retry: 'Retry',
      logout: 'Log out',
    },
    nav: {
      primary: 'Employee app primary menu',
      home: 'Home',
      homeShort: 'Home',
      schedule: 'Schedule',
      scheduleShort: 'Schedule',
      attendance: 'Attendance',
      attendanceShort: 'Clock',
      payroll: 'Payroll',
      payrollShort: 'Pay',
      contracts: 'Contracts',
      contractsShort: 'Contracts',
    },
    screen: {
      home: {
        title: 'Today at work',
      },
      schedule: {
        title: 'My schedule',
      },
      attendance: {
        title: 'Attendance',
      },
      payroll: {
        title: 'My payroll',
      },
      contracts: {
        title: 'My contracts',
      },
    },
    feature: {
      eyebrow: 'Ready for the next slice',
      schedule: {
        description: 'This area is ready for the selected store schedule screen.',
      },
      attendance: {
        description: 'This area is ready for current attendance and clock actions.',
      },
      payroll: {
        description: 'This area is ready for monthly payroll list and detail screens.',
      },
      contracts: {
        description: 'This area is ready for signing-needed contracts and contract details.',
      },
    },
    login: {
      title: 'Employee login',
      subtitle: 'Check your shifts, attendance, payroll, and contracts.',
      email: 'Email',
      password: 'Password',
      remember: 'Keep me signed in',
      submit: 'Log in',
      submitting: 'Logging in',
      employeeOnly: 'Please use an employee account.',
      failed: 'Could not log in. Check your credentials.',
    },
    home: {
      title: 'Today at work',
      greeting: 'Hi, {name}',
      store: 'Current store',
      stores: 'Stores',
      profile: 'Profile',
      role: 'Role',
      hireDate: 'Hire date',
      phone: 'Phone',
      email: 'Email',
      emptyTitle: 'No active store membership',
      emptyDescription: 'Ask the owner to finish employee registration.',
      errorTitle: 'Could not load employee app data',
      sessionExpired: 'Your session expired. Please log in again.',
      upcomingReady: 'Schedule, attendance, payroll, and contract screens will attach to this home.',
    },
  },
} as const

export const i18n = createI18n({
  legacy: false,
  locale: 'ko',
  fallbackLocale: 'en',
  messages,
})
