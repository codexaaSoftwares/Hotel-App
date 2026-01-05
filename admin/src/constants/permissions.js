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

  // Dashboard
  DASHBOARD_READ: 'dashboard:read',
  DASHBOARD_WRITE: 'dashboard:write',

  // Report Management
  REPORT_READ: 'report:read',
  REPORT_EXPORT: 'report:read', // Export uses same permission as view

  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',

  // Profile
  PROFILE_READ: 'profile:read',
  PROFILE_WRITE: 'profile:write',

  // Admin
  ADMIN_ACCESS: 'admin:access',
  SYSTEM_CONFIG: 'system:config',

  // Special Permissions
  EXPORT_DATA: 'special_export_data',
  IMPORT_DATA: 'special_import_data',
  BULK_DELETE: 'special_bulk_delete',
  BULK_UPDATE: 'special_bulk_update',
  VIEW_AUDIT_LOGS: 'special_view_audit_logs',
  MANAGE_BACKUPS: 'special_manage_backups',
  SYSTEM_MAINTENANCE: 'special_system_maintenance',
  VIEW_ALL_BRANCHES: 'special_view_all_branches',
  OVERRIDE_RESTRICTIONS: 'special_override_restrictions',
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
  ADMIN: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.SYSTEM_CONFIG,
  ],
  SPECIAL_PERMISSIONS: [
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.IMPORT_DATA,
    PERMISSIONS.BULK_DELETE,
    PERMISSIONS.BULK_UPDATE,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_BACKUPS,
    PERMISSIONS.SYSTEM_MAINTENANCE,
    PERMISSIONS.VIEW_ALL_BRANCHES,
    PERMISSIONS.OVERRIDE_RESTRICTIONS,
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