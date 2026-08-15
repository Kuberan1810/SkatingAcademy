export const ENDPOINTS = {
  auth: {
    login: "/api/v1/auth/login",
    register: "/api/v1/auth/register",
    me: "/api/v1/auth/me",
    logout: "/api/v1/auth/logout",
  },

  dashboard: {
    overview: "/api/v1/dashboard",
  },

  batches: {
    list: "/api/v1/batches",
    page: "/api/v1/batches-page",
    create: "/api/v1/batches",
    update: (id: number | string) =>
      `/api/v1/batches/${id}`,
    delete: (id: number | string) =>
      `/api/v1/batches/${id}`,
    detail: (id: number | string) =>
      `/api/v1/batches/${id}`,
    students: (id: number | string) =>
      `/api/v1/batches/${id}/students`,
  },

  students: {
    list: "/api/v1/students",
    page: "/api/v1/students/page",
    detail: (id: number | string) =>
      `/api/v1/students/${id}`,
    profile: (id: number | string) =>
      `/api/v1/students/${id}/profile`,
    create: "/api/v1/students",
    update: (id: number | string) =>
      `/api/v1/students/${id}`,
    delete: (id: number | string) =>
      `/api/v1/students/${id}`,
    importPreview:
      "/api/v1/students/import/preview",
    importConfirm:
      "/api/v1/students/import/confirm",
  },

  attendance: {
    confirm: "/api/v1/attendance",
    list: "/api/v1/attendance",
  },

  sessions: {
    start: "/api/v1/sessions/start",
    list: "/api/v1/sessions",
    detail: (id: number | string) =>
      `/api/v1/sessions/${id}`,
    completed: (id: number | string) =>
      `/api/v1/sessions/${id}/completed`,
  },

  fees: {
    page: "/api/v1/fees/page",
    payments: "/api/v1/fees/payments",
    collect: "/api/v1/fees/collect",
  },

  reports: {
    students: "/api/v1/reports/students",
    batches: "/api/v1/reports/batches",
    fees: "/api/v1/reports/fees",
    attendance: "/api/v1/reports/attendance",
  },

  settings: {
    profile: "/api/v1/settings/profile",
  },
} as const;