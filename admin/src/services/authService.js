// Authentication Service - API calls for authentication
import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'

const PERMISSION_ALIAS_MAP = {
  // User Management
  view_user: ['user:read'],
  create_user: ['user:write'],
  edit_user: ['user:write'],
  delete_user: ['user:delete'],
  
  // Role Management
  view_role: ['role:read'],
  create_role: ['role:write'],
  edit_role: ['role:write'],
  delete_role: ['role:delete'],
  view_permission: ['role:read'],
  
  // Settings Management
  view_setting: ['settings:read'],
  edit_setting: ['settings:write'],
  
  // Restaurant Settings Management
  view_restaurant_settings: ['restaurant_settings:read'],
  edit_restaurant_settings: ['restaurant_settings:write'],
  
  // Food Category Management
  view_food_category: ['food_category:read'],
  create_food_category: ['food_category:write'],
  edit_food_category: ['food_category:write'],
  delete_food_category: ['food_category:delete'],
  
  // Food Item Management
  view_food_item: ['food_item:read'],
  create_food_item: ['food_item:write'],
  edit_food_item: ['food_item:write'],
  delete_food_item: ['food_item:delete'],
  
  // Table Management
  view_table: ['table:read'],
  create_table: ['table:write'],
  edit_table: ['table:write'],
  delete_table: ['table:delete'],
  
  // Room Category Management
  view_room_type: ['room_type:read'],
  create_room_type: ['room_type:write'],
  edit_room_type: ['room_type:write'],
  delete_room_type: ['room_type:delete'],
  
  // Customer Management
  view_customer: ['customer:read'],
  create_customer: ['customer:write'],
  edit_customer: ['customer:write'],
  delete_customer: ['customer:delete'],
  view_customer_ledger: ['customer_ledger:read'],
  
  // Wallet Transaction Management
  view_wallet_transaction: ['wallet_transaction:read'],
  create_wallet_transaction: ['wallet_transaction:write'],
  edit_wallet_transaction: ['wallet_transaction:write'],
  delete_wallet_transaction: ['wallet_transaction:delete'],
  
  // Bill Management
  view_bill: ['bill:read'],
  create_bill: ['bill:create', 'bill:write'],
  edit_bill: ['bill:write'],
  delete_bill: ['bill:delete'],
  bill_payment: ['bill:payment'],
  view_pending_bill: ['pending_bill:read'],
  create_pending_bill: ['pending_bill:write'],
  
  // Staff Management
  view_staff: ['staff:read'],
  create_staff: ['staff:write'],
  edit_staff: ['staff:write'],
  delete_staff: ['staff:delete'],
  view_salary_payment: ['salary:read'],
  create_salary_payment: ['salary:write'],
  edit_salary_payment: ['salary:write'],
  delete_salary_payment: ['salary:delete'],
  staff_salary_report: ['staff_salary_report:read'],
  
  // Dashboard
  view_dashboard: ['dashboard:read'],
  
  // Report Management
  view_report: ['report:read'],
  
  // Special Permissions (no aliases needed, use canonical names directly)
  special_export_data: ['special_export_data'],
  special_import_data: ['special_import_data'],
  special_bulk_delete: ['special_bulk_delete'],
  special_bulk_update: ['special_bulk_update'],
  special_view_audit_logs: ['special_view_audit_logs'],
  special_manage_backups: ['special_manage_backups'],
  special_system_maintenance: ['special_system_maintenance'],
  special_override_restrictions: ['special_override_restrictions'],
}

const startCase = (value = '') =>
  value
    .toString()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const applyPermissionAliases = (permissionNames = []) => {
  const permissionSet = new Set(permissionNames)

  permissionNames.forEach((name) => {
    const aliases = PERMISSION_ALIAS_MAP[name]
    if (aliases) {
      aliases.forEach((alias) => permissionSet.add(alias))
    }
  })

  return Array.from(permissionSet)
}

const normalizeRole = (role) => ({
  id: role.id,
  name: role.name,
  description: role.description || '',
  isActive: role.is_active ?? true,
  isDeleted: role.is_deleted ?? false,
  createdAt: role.created_at || null,
  updatedAt: role.updated_at || null,
})

const normalizePermission = (permission) => ({
  id: permission.id,
  name: permission.name,
  label: permission.description || startCase(permission.name),
  description: permission.description || '',
  module: permission.module || 'general',
  submodule: permission.submodule || 'general',
  type: permission.type || null,
  isActive: permission.is_active ?? true,
  isDeleted: permission.is_deleted ?? false,
})

const normalizeUser = (apiUser, permissions = [], permissionsByModule = {}) => {
  const roles = Array.isArray(apiUser?.roles) ? apiUser.roles.map(normalizeRole) : []
  const primaryRole = roles[0] || null

  const permissionObjects = Array.isArray(permissions)
    ? permissions.map(normalizePermission)
    : []

  const canonicalPermissionNames = permissionObjects
    .filter((permission) => permission?.name)
    .map((permission) => permission.name)

  const permissionNamesWithAliases = applyPermissionAliases(canonicalPermissionNames)

  // Get avatar URL - prefer avatar_url, fallback to avatar
  const avatarUrl = apiUser.avatar_url || apiUser.avatar || null

  return {
    id: apiUser.id,
    firstName: apiUser.first_name || '',
    lastName: apiUser.last_name || '',
    email: apiUser.email || '',
    phone: apiUser.phone || '',
    status: apiUser.status || 'active',
    isActive: (apiUser.status || 'active') === 'active',
    address: apiUser.address || '',
    city: apiUser.city || '',
    state: apiUser.state || '',
    zipCode: apiUser.zip_code || apiUser.zipCode || '',
    country: apiUser.country || '',
    bio: apiUser.bio || '',
    dateOfBirth: apiUser.date_of_birth || apiUser.dateOfBirth || '',
    gender: apiUser.gender || '',
    avatar: avatarUrl, // Use avatar_url if available, otherwise avatar
    role: primaryRole?.name || null,
    roleId: primaryRole?.id || null,
    roles,
    roleNames: roles.map((role) => role.name),
    permissions: permissionNamesWithAliases,
    permissionIdentifiers: canonicalPermissionNames,
    permissionObjects,
    permissionsByModule,
    createdAt: apiUser.created_at || null,
    updatedAt: apiUser.updated_at || null,
    fullName: [apiUser.first_name, apiUser.last_name].filter(Boolean).join(' ').trim(),
  }
}

const storeSession = (token, user) => {
  if (token) {
    localStorage.setItem('access_token', token)
  }

  if (user) {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

const clearSession = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
  localStorage.removeItem('app_settings')
}

const authService = {
  /**
   * Login user
   * @param {Object} credentials - User credentials { email, password }
   * @returns {Promise<{success: boolean, data?: {token: string, user: object}}>}
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      const { token, user, permissions, permissionsByModule, settings } = response.data || {}

      if (!token || !user) {
        return {
          success: false,
          data: null,
          message: 'Invalid authentication response received from server.',
        }
      }

      const normalizedUser = normalizeUser(user, permissions, permissionsByModule)
      storeSession(token, normalizedUser)

      // Store settings in localStorage for easy access
      if (settings) {
        localStorage.setItem('app_settings', JSON.stringify(settings))
      }

      return {
        success: true,
        data: {
          token,
          user: normalizedUser,
          settings: settings || null,
        },
        message: 'Login successful',
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('[AuthService] Login failed', {
          status: error.response.status,
          data: error.response.data,
          email: credentials.email,
        })
      }

      clearSession()
      return handleApiError(error)
    }
  },

  /**
   * Logout user
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      // Log error but continue clearing the local session
      console.warn('[AuthService] Logout request failed', error)
    } finally {
      clearSession()
    }

    return {
      success: true,
      message: 'Logout successful',
    }
  },

  /**
   * Forgot password
   * @param {String} email - User email
   * @returns {Promise}
   */
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email })
      
      // Backend returns success message even if user doesn't exist (for security)
      // So we always return success: true if we get a 200 response
      if (response.status === 200 || response.data?.message) {
        return {
          success: true,
          data: response.data,
          message: response.data?.message || 'If that email exists, password reset instructions have been sent.',
        }
      }
      
      return {
        success: false,
        data: null,
        message: 'Failed to send password reset email. Please try again.',
      }
    } catch (error) {
      const errorResponse = handleApiError(error)
      // Even on error, don't reveal if user exists
      if (errorResponse.status === 500) {
        return {
          success: false,
          data: null,
          message: 'Failed to send password reset email. Please check your email configuration or try again later.',
        }
      }
      return errorResponse
    }
  },

  /**
   * Reset password with token
   * @param {Object} data - { token, email, password, password_confirmation }
   * @returns {Promise}
   */
  async resetPassword(data) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token: data.token,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation || data.password,
      })
      
      // Check if response has success field
      if (response.data?.success) {
        return {
          success: true,
          data: response.data,
          message: response.data?.message || 'Password reset successfully',
        }
      }
      
      // Fallback for older response format
      return {
        success: true,
        data: response.data,
        message: response.data?.message || 'Password reset successfully',
      }
    } catch (error) {
      const errorResponse = handleApiError(error)
      
      // Map backend validation errors to frontend format
      if (errorResponse.errors && typeof errorResponse.errors === 'object') {
        const mappedErrors = {}
        Object.keys(errorResponse.errors).forEach(key => {
          if (key === 'email') {
            mappedErrors.email = Array.isArray(errorResponse.errors[key]) 
              ? errorResponse.errors[key][0] 
              : errorResponse.errors[key]
          } else if (key === 'password') {
            mappedErrors.password = Array.isArray(errorResponse.errors[key]) 
              ? errorResponse.errors[key][0] 
              : errorResponse.errors[key]
          } else {
            mappedErrors[key] = Array.isArray(errorResponse.errors[key]) 
              ? errorResponse.errors[key][0] 
              : errorResponse.errors[key]
          }
        })
        errorResponse.errors = mappedErrors
      }
      
      return errorResponse
    }
  },

  /**
   * Fetch authenticated user using existing token
   * @returns {Promise<{success: boolean, data?: object}>}
   */
  async fetchCurrentUser() {
    try {
      const response = await apiClient.get('/auth/user')
      const { user, permissions, permissionsByModule, settings } = response.data || {}

      if (!user) {
        return {
          success: false,
          data: null,
          message: 'Unable to load authenticated user.',
        }
      }

      const normalizedUser = normalizeUser(user, permissions, permissionsByModule)
      localStorage.setItem('user', JSON.stringify(normalizedUser))

      // Store settings in localStorage for easy access
      if (settings) {
        localStorage.setItem('app_settings', JSON.stringify(settings))
      }

      return {
        success: true,
        data: normalizedUser,
        settings: settings || null,
      }
    } catch (error) {
      if (error.response?.status === 401) {
        clearSession()
      }
      return handleApiError(error)
    }
  },

  /**
   * Check if user is authenticated
   * @returns {Boolean}
   */
  isAuthenticated() {
    const token = localStorage.getItem('access_token')
    return Boolean(token)
  },

  /**
   * Get stored auth token
   * @returns {String|null}
   */
  getToken() {
    return localStorage.getItem('access_token')
  },

  /**
   * Get stored user object (if any)
   * @returns {Object|null}
   */
  getStoredUser() {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('[AuthService] Failed to parse stored user', error)
      return null
    }
  },
}

export default authService

