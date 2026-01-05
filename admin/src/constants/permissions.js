// Permission System for Role-Based Access Control

// Define all available permissions
export const PERMISSIONS = {
  // User Management
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',

  // Role Management
  ROLE_READ: 'role:read',
  ROLE_WRITE: 'role:write',
  ROLE_DELETE: 'role:delete',
  ROLE_MANAGE: 'role:manage',

  // Branch Management
  BRANCH_READ: 'branch:read',
  BRANCH_WRITE: 'branch:write',
  BRANCH_DELETE: 'branch:delete',
  BRANCH_MANAGE: 'branch:manage',

  // Package Management
  PACKAGE_READ: 'package:read',
  PACKAGE_WRITE: 'package:write',
  PACKAGE_DELETE: 'package:delete',
  PACKAGE_MANAGE: 'package:manage',

  // Customer Management
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_WRITE: 'customer:write',
  CUSTOMER_DELETE: 'customer:delete',
  CUSTOMER_MANAGE: 'customer:manage',

  // Order Management
  ORDER_READ: 'order:read',
  ORDER_WRITE: 'order:write',
  ORDER_DELETE: 'order:delete',
  ORDER_MANAGE: 'order:manage',

  // Payment Management
  PAYMENT_READ: 'payment:read',
  PAYMENT_WRITE: 'payment:write',
  PAYMENT_DELETE: 'payment:delete',
  PAYMENT_MANAGE: 'payment:manage',

  // Financial Transaction Management
  FINANCIAL_TRANSACTION_READ: 'view_financial_transaction',
  FINANCIAL_TRANSACTION_WRITE: 'create_financial_transaction',
  FINANCIAL_TRANSACTION_EDIT: 'edit_financial_transaction',
  FINANCIAL_TRANSACTION_DELETE: 'delete_financial_transaction',
  FINANCIAL_TRANSACTION_MANAGE: 'view_financial_transaction',

  // Financial Category Management
  FINANCIAL_CATEGORY_READ: 'view_financial_category',
  FINANCIAL_CATEGORY_WRITE: 'create_financial_category',
  FINANCIAL_CATEGORY_EDIT: 'edit_financial_category',
  FINANCIAL_CATEGORY_DELETE: 'delete_financial_category',
  FINANCIAL_CATEGORY_MANAGE: 'view_financial_category',
  
  // Report Management
  REPORT_READ: 'report:read',
  REPORT_EXPORT: 'report:read', // Export uses same permission as view

  // Transaction Management (alias for payment)
  TRANSACTION_READ: 'transaction:read',
  TRANSACTION_WRITE: 'transaction:write',
  TRANSACTION_DELETE: 'transaction:delete',

  // Dashboard
  DASHBOARD_READ: 'dashboard:read',
  DASHBOARD_WRITE: 'dashboard:write',

  // Reports
  REPORT_READ: 'report:read',
  REPORT_EXPORT: 'report:export',

  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',

  // Profile
  PROFILE_READ: 'profile:read',
  PROFILE_WRITE: 'profile:write',

  // Admin
  ADMIN_ACCESS: 'admin:access',
  SYSTEM_CONFIG: 'system:config',
}

// Define roles and their permissions
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
}

// Role-Permission mapping
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    // All permissions
    ...Object.values(PERMISSIONS),
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_WRITE,
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.BRANCH_WRITE,
    PERMISSIONS.BRANCH_DELETE,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.DASHBOARD_WRITE,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_WRITE,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_WRITE,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.BRANCH_WRITE,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.DASHBOARD_WRITE,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_WRITE,
  ],
  [ROLES.USER]: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_WRITE,
  ],
  [ROLES.GUEST]: [
    PERMISSIONS.DASHBOARD_READ,
  ],
}

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_MANAGE,
  ],
  ROLE_MANAGEMENT: [
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_WRITE,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.ROLE_MANAGE,
  ],
  BRANCH_MANAGEMENT: [
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.BRANCH_WRITE,
    PERMISSIONS.BRANCH_DELETE,
    PERMISSIONS.BRANCH_MANAGE,
  ],
  DASHBOARD: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.DASHBOARD_WRITE,
  ],
  REPORTS: [
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT,
  ],
  SETTINGS: [
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_WRITE,
  ],
  PROFILE: [
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_WRITE,
  ],
  FINANCIAL_MANAGEMENT: [
    PERMISSIONS.FINANCIAL_TRANSACTION_READ,
    PERMISSIONS.FINANCIAL_TRANSACTION_WRITE,
    PERMISSIONS.FINANCIAL_TRANSACTION_EDIT,
    PERMISSIONS.FINANCIAL_TRANSACTION_DELETE,
    PERMISSIONS.FINANCIAL_CATEGORY_READ,
    PERMISSIONS.FINANCIAL_CATEGORY_WRITE,
    PERMISSIONS.FINANCIAL_CATEGORY_EDIT,
    PERMISSIONS.FINANCIAL_CATEGORY_DELETE,
  ],
  ADMIN: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.SYSTEM_CONFIG,
  ],
}

// Helper functions
export const getPermissionsByRole = (role) => {
  return ROLE_PERMISSIONS[role] || []
}

export const hasPermission = (userPermissions, permission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false
  return userPermissions.includes(permission)
}

export const hasAnyPermission = (userPermissions, permissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false
  return permissions.some(permission => userPermissions.includes(permission))
}

export const hasAllPermissions = (userPermissions, permissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false
  return permissions.every(permission => userPermissions.includes(permission))
}

export const hasRole = (userRole, role) => {
  return userRole === role
}

export const hasAnyRole = (userRole, roles) => {
  return roles.includes(userRole)
}

// Route protection based on permissions
export const getRoutePermissions = () => {
  return {
    '/dashboard': [PERMISSIONS.DASHBOARD_READ],
    '/users': [PERMISSIONS.USER_READ],
    '/users/create': [PERMISSIONS.USER_WRITE],
    '/users/edit/:id': [PERMISSIONS.USER_WRITE],
    '/users/delete/:id': [PERMISSIONS.USER_DELETE],
    '/roles': [PERMISSIONS.ROLE_READ],
    '/roles/create': [PERMISSIONS.ROLE_WRITE],
    '/roles/edit/:id': [PERMISSIONS.ROLE_WRITE],
    '/roles/delete/:id': [PERMISSIONS.ROLE_DELETE],
    '/reports': [PERMISSIONS.REPORT_READ],
    '/reports/company-health': [PERMISSIONS.REPORT_READ],
    '/financial/transactions': [PERMISSIONS.FINANCIAL_TRANSACTION_READ],
    '/financial/categories': [PERMISSIONS.FINANCIAL_CATEGORY_READ],
    '/settings': [PERMISSIONS.SETTINGS_READ],
    '/profile': [PERMISSIONS.PROFILE_READ],
    '/admin': [PERMISSIONS.ADMIN_ACCESS],
  }
}

export default {
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
  getPermissionsByRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  getRoutePermissions,
}