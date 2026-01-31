// API Endpoints Configuration

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // User Management
  USERS: {
    BASE: '/users',
    LIST: '/users',
    CREATE: '/users',
    GET_BY_ID: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    BULK_DELETE: '/users/bulk-delete',
    EXPORT: '/users/export',
    IMPORT: '/users/import',
    SEARCH: '/users/search',
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/profile/avatar',
    DELETE_AVATAR: '/users/profile/avatar',
    CHANGE_STATUS: (id) => `/users/${id}/status`,
    RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
  },

  // Role Management
  ROLES: {
    BASE: '/roles',
    LIST: '/roles',
    CREATE: '/roles',
    GET_BY_ID: (id) => `/roles/${id}`,
    UPDATE: (id) => `/roles/${id}`,
    DELETE: (id) => `/roles/${id}`,
    GET_PERMISSIONS: '/roles/permissions',
    ASSIGN_PERMISSIONS: (id) => `/roles/${id}/permissions`,
    GET_USERS_WITH_ROLE: (id) => `/roles/${id}/users`,
  },

  // Permission Management
  PERMISSIONS: {
    BASE: '/permissions',
    LIST: '/permissions',
    GROUPS: '/permissions/groups',
    ASSIGN_TO_ROLE: '/permissions/assign-to-role',
    ASSIGN_TO_USER: '/permissions/assign-to-user',
  },

  // Dashboard
  DASHBOARD: {
    BASE: '/dashboard',
    STATS: '/dashboard/stats',
    CHARTS: '/dashboard/charts',
    RECENT_ACTIVITIES: '/dashboard/activities',
    QUICK_ACTIONS: '/dashboard/quick-actions',
  },

  // Reports
  REPORTS: {
    BASE: '/reports',
    LIST: '/reports',
    CREATE: '/reports',
    GET_BY_ID: (id) => `/reports/${id}`,
    UPDATE: (id) => `/reports/${id}`,
    DELETE: (id) => `/reports/${id}`,
    EXPORT: (id) => `/reports/${id}/export`,
    GENERATE: '/reports/generate',
    TEMPLATES: '/reports/templates',
  },

  // Settings
  SETTINGS: {
    BASE: '/settings',
    GENERAL: '/settings/general',
    SECURITY: '/settings/security',
    NOTIFICATIONS: '/settings/notifications',
    THEME: '/settings/theme',
    SYSTEM: '/settings/system',
    BACKUP: '/settings/backup',
    RESTORE: '/settings/restore',
  },

  // Audit Logs
  AUDIT: {
    BASE: '/audit',
    LOGS: '/audit/logs',
    EXPORT: '/audit/export',
    SEARCH: '/audit/search',
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id) => `/notifications/${id}`,
    DELETE_ALL: '/notifications/delete-all',
    PREFERENCES: '/notifications/preferences',
  },

  // Branch Management
  BRANCHES: {
    BASE: '/branches',
    LIST: '/branches',
    CREATE: '/branches',
    GET_BY_ID: (id) => `/branches/${id}`,
    UPDATE: (id) => `/branches/${id}`,
    DELETE: (id) => `/branches/${id}`,
  },

  // Customer Management
  CUSTOMERS: {
    BASE: '/customers',
    LIST: '/customers',
    CREATE: '/customers',
    GET_BY_ID: (id) => `/customers/${id}`,
    UPDATE: (id) => `/customers/${id}`,
    DELETE: (id) => `/customers/${id}`,
  },

  // Wallet Transaction Management
  WALLET_TRANSACTIONS: {
    BASE: '/wallet-transactions',
    LIST: '/wallet-transactions',
    CREATE: '/wallet-transactions',
    GET_BY_ID: (id) => `/wallet-transactions/${id}`,
    UPDATE: (id) => `/wallet-transactions/${id}`,
    DELETE: (id) => `/wallet-transactions/${id}`,
    GET_BY_CUSTOMER: (customerId) => `/customers/${customerId}/wallet-transactions`,
    EXPORT_CUSTOMER_LEDGER: (customerId) => `/customers/${customerId}/wallet-transactions/export`,
  },

  // Bill Management
  BILLS: {
    BASE: '/bills',
    LIST: '/bills',
    CREATE: '/bills',
    GET_BY_ID: (id) => `/bills/${id}`,
    UPDATE: (id) => `/bills/${id}`,
    DELETE: (id) => `/bills/${id}`,
    GET_BY_TABLE: (tableId) => `/bills/table/${tableId}`,
    PROCESS_PAYMENT: (id) => `/bills/${id}/process-payment`,
  },

  // Reports
  REPORTS: {
    BASE: '/reports',
    SALES: '/reports/sales',
    LEDGER: '/reports/ledger',
    BRANCH: '/reports/branch',
    STAFF: '/reports/staff',
    EXPORT: (type) => `/reports/${type}/export`,
  },

  // Staff Management
  STAFF: {
    BASE: '/staff',
    LIST: '/staff',
    CREATE: '/staff',
    GET_BY_ID: (id) => `/staff/${id}`,
    UPDATE: (id) => `/staff/${id}`,
    DELETE: (id) => `/staff/${id}`,
  },

  // Salary Payments
  SALARY_PAYMENTS: {
    BASE: '/salary-payments',
    LIST: '/salary-payments',
    CREATE: '/salary-payments',
    GET_BY_ID: (id) => `/salary-payments/${id}`,
    UPDATE: (id) => `/salary-payments/${id}`,
    DELETE: (id) => `/salary-payments/${id}`,
    GET_BY_STAFF: (staffId) => `/staff/${staffId}/salary-payments`,
  },

  // Expense Category Management
  EXPENSE_CATEGORIES: {
    BASE: '/expense-categories',
    LIST: '/expense-categories',
    CREATE: '/expense-categories',
    GET_BY_ID: (id) => `/expense-categories/${id}`,
    UPDATE: (id) => `/expense-categories/${id}`,
    DELETE: (id) => `/expense-categories/${id}`,
  },

  // Expense Management
  EXPENSES: {
    BASE: '/expenses',
    LIST: '/expenses',
    CREATE: '/expenses',
    GET_BY_ID: (id) => `/expenses/${id}`,
    UPDATE: (id) => `/expenses/${id}`,
    DELETE: (id) => `/expenses/${id}`,
  },
}

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
}

// API Response Status Codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
}

// API Error Messages
export const API_ERRORS = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access denied. You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT: 'Request timeout. Please try again.',
}

// Request Configuration
export const REQUEST_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
}

export default {
  API_ENDPOINTS,
  HTTP_METHODS,
  API_STATUS,
  API_ERRORS,
  REQUEST_CONFIG,
}
