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

  // Customer Management
  CUSTOMERS: {
    BASE: '/customers',
    LIST: '/customers',
    CREATE: '/customers',
    GET_BY_ID: (id) => `/customers/${id}`,
    UPDATE: (id) => `/customers/${id}`,
    DELETE: (id) => `/customers/${id}`,
    UPDATE_STATUS: (id) => `/customers/${id}/status`,
    RECALCULATE_STATS: (id) => `/customers/${id}/recalculate-stats`,
    WALLET: (id) => `/customers/${id}/wallet`,
    EXPORT_PDF: (id) => `/customers/${id}/export-pdf`,
    LEDGER: (id) => `/customers/${id}/ledger`,
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

  // Package Management
  PACKAGES: {
    BASE: '/packages',
    LIST: '/packages',
    CREATE: '/packages',
    GET_BY_ID: (id) => `/packages/${id}`,
    UPDATE: (id) => `/packages/${id}`,
    DELETE: (id) => `/packages/${id}`,
  },

  // Package Types (Master Data)
  PACKAGE_TYPES: {
    BASE: '/package-types',
    LIST: '/package-types',
  },

  // Order Management
  ORDERS: {
    BASE: '/orders',
    LIST: '/orders',
    CREATE: '/orders',
    GET_BY_ID: (id) => `/orders/${id}`,
    UPDATE: (id) => `/orders/${id}`,
    DELETE: (id) => `/orders/${id}`,
    BULK_UPDATE: '/orders/bulk-update',
    BULK_DELETE: '/orders/bulk-delete',
    SEARCH: '/orders/search',
    EXPORT: '/orders/export',
    EXPORT_PDF: (id) => `/orders/${id}/export-pdf`,
    STATS: '/orders/stats',
    ANALYTICS: '/orders/analytics',
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
    UPDATE_PAYMENT_STATUS: (id) => `/orders/${id}/payment-status`,
    GET_BY_CUSTOMER: (customerId) => `/orders/customer/${customerId}`,
    GET_ITEMS: (id) => `/orders/${id}/items`,
    UPDATE_ITEM: (orderId, itemId) => `/orders/${orderId}/items/${itemId}`,
    REMOVE_ITEM: (orderId, itemId) => `/orders/${orderId}/items/${itemId}`,
    ADD_ITEM: (orderId) => `/orders/${orderId}/items`,
    PRINT_INVOICE: (id) => `/orders/${id}/invoice`,
    PRINT_RECEIPT: (id) => `/orders/${id}/receipt`,
  },

  // Transactions (Wallet/Credit-Debit)
  TRANSACTIONS: {
    BASE: '/transactions',
    LIST: '/transactions',
    CREATE: '/transactions',
    GET_BY_ID: (id) => `/transactions/${id}`,
    UPDATE: (id) => `/transactions/${id}`,
    GET_BY_CUSTOMER: (customerId) => `/transactions/customer/${customerId}`,
    GET_BY_ORDER: (orderId) => `/transactions/order/${orderId}`,
  },

  // Payments
  PAYMENTS: {
    BASE: '/payments',
    CREATE: '/payments',
    GET_BY_ORDER: (orderId) => `/payments/order/${orderId}`,
    GET_BY_ID: (id) => `/payments/${id}`,
    EXPORT_PDF: (id) => `/payments/${id}/export-pdf`,
  },

  // Financial Management
  FINANCIAL_TRANSACTIONS: {
    BASE: '/financial-transactions',
    LIST: '/financial-transactions',
    CREATE: '/financial-transactions',
    GET_BY_ID: (id) => `/financial-transactions/${id}`,
    UPDATE: (id) => `/financial-transactions/${id}`,
    DELETE: (id) => `/financial-transactions/${id}`,
    STATS: '/financial-transactions/stats',
    EXPORT_PDF: '/financial-transactions/export-pdf',
  },

  FINANCIAL_CATEGORIES: {
    BASE: '/financial-categories',
    LIST: '/financial-categories',
    CREATE: '/financial-categories',
    GET_BY_ID: (id) => `/financial-categories/${id}`,
    UPDATE: (id) => `/financial-categories/${id}`,
    DELETE: (id) => `/financial-categories/${id}`,
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
