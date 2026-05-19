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

  // Dashboard
  DASHBOARD_READ: 'dashboard:read',
  DASHBOARD_WRITE: 'dashboard:write',

  // Report Management
  REPORT_READ: 'report:read',
  REPORT_EXPORT: 'report:read', // Export uses same permission as view
  SALES_REPORT_READ: 'sales_report:read',
  EXPENSE_REPORT_READ: 'expense_report:read',
  GST_REPORT_READ: 'gst_report:read',
  CUSTOMER_PENDING_REPORT_READ: 'customer_pending_report:read',
  CUSTOMER_LEDGER_REPORT_READ: 'customer_ledger_report:read',
  STAFF_SALARY_REPORT_READ: 'staff_salary_report:read',
  BUSINESS_DASHBOARD_READ: 'business_dashboard:read',

  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',

  // Profile
  PROFILE_READ: 'profile:read',
  PROFILE_WRITE: 'profile:write',

  // Restaurant Management
  FOOD_CATEGORY_READ: 'food_category:read',
  FOOD_CATEGORY_WRITE: 'food_category:write',
  FOOD_CATEGORY_DELETE: 'food_category:delete',
  FOOD_ITEM_READ: 'food_item:read',
  FOOD_ITEM_WRITE: 'food_item:write',
  FOOD_ITEM_DELETE: 'food_item:delete',
  TABLE_READ: 'table:read',
  TABLE_WRITE: 'table:write',
  TABLE_DELETE: 'table:delete',
  RESTAURANT_SETTINGS_READ: 'restaurant_settings:read',
  RESTAURANT_SETTINGS_WRITE: 'restaurant_settings:write',

  // POS & Billing
  BILL_READ: 'bill:read',
  BILL_WRITE: 'bill:write',
  BILL_DELETE: 'bill:delete',
  BILL_CREATE: 'bill:create',
  BILL_PAYMENT: 'bill:payment',
  PENDING_BILL_READ: 'pending_bill:read',
  PENDING_BILL_WRITE: 'pending_bill:write',

  // Customer Management
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_WRITE: 'customer:write',
  CUSTOMER_DELETE: 'customer:delete',
  CUSTOMER_LEDGER_READ: 'view_customer_ledger',

  // Wallet Transaction Management
  WALLET_TRANSACTION_READ: 'view_wallet_transaction',
  WALLET_TRANSACTION_CREATE: 'create_wallet_transaction',
  WALLET_TRANSACTION_EDIT: 'edit_wallet_transaction',
  WALLET_TRANSACTION_DELETE: 'delete_wallet_transaction',

  // Staff Management
  STAFF_READ: 'staff:read',
  STAFF_WRITE: 'staff:write',
  STAFF_DELETE: 'staff:delete',
  SALARY_READ: 'salary:read',
  SALARY_WRITE: 'salary:write',

  // Expense Management
  EXPENSE_CATEGORY_READ: 'expense_category:read',
  EXPENSE_CATEGORY_WRITE: 'expense_category:write',
  EXPENSE_CATEGORY_DELETE: 'expense_category:delete',
  EXPENSE_READ: 'expense:read',
  EXPENSE_WRITE: 'expense:write',
  EXPENSE_DELETE: 'expense:delete',

  // Module-Specific Permissions
  // Restaurant Module
  RESTAURANT_DASHBOARD_READ: 'restaurant_dashboard:read',
  
  // Hotel Room Module (Planned)
  HOTEL_ROOM_DASHBOARD_READ: 'hotel_room_dashboard:read',
  ROOM_READ: 'room:read',
  ROOM_WRITE: 'room:write',
  ROOM_DELETE: 'room:delete',
  // Room Category Management (permission names use room_type for backward compatibility)
  ROOM_TYPE_READ: 'room_type:read',
  ROOM_TYPE_WRITE: 'room_type:write',
  ROOM_TYPE_DELETE: 'room_type:delete',
  BOOKING_READ: 'booking:read',
  BOOKING_WRITE: 'booking:write',
  BOOKING_DELETE: 'booking:delete',
  HOTEL_SETTINGS_READ: 'hotel_settings:read',
  HOTEL_SETTINGS_WRITE: 'hotel_settings:write',
  ADDON_SERVICE_READ: 'view_addon_service',
  ADDON_SERVICE_WRITE: 'create_addon_service',
  ADDON_SERVICE_DELETE: 'delete_addon_service',
  OCCUPANCY_REPORT_READ: 'occupancy_report:read',
  REVENUE_REPORT_READ: 'revenue_report:read',
  BOOKING_REPORT_READ: 'booking_report:read',
  
  // Banquet Hall Module (Planned)
  BANQUET_DASHBOARD_READ: 'banquet_dashboard:read',
  HALL_READ: 'hall:read',
  HALL_WRITE: 'hall:write',
  HALL_DELETE: 'hall:delete',
  BANQUET_BOOKING_READ: 'banquet_booking:read',
  BANQUET_BOOKING_WRITE: 'banquet_booking:write',
  BANQUET_BOOKING_DELETE: 'banquet_booking:delete',
  BANQUET_SETTINGS_READ: 'banquet_settings:read',
  BANQUET_SETTINGS_WRITE: 'banquet_settings:write',
  BANQUET_REPORT_READ: 'banquet_report:read',
  BANQUET_REVENUE_REPORT_READ: 'banquet_revenue_report:read',

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