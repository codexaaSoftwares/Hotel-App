import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'

const startCase = (value = '') =>
  value
    .toString()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const normalizePermission = (permission, fallbackModule = null, fallbackSubmodule = null) => ({
  id: permission.id,
  name: permission.name,
  label: permission.description || startCase(permission.name),
  description: permission.description || '',
  module: permission.module || fallbackModule || 'general',
  submodule: permission.submodule || fallbackSubmodule || 'general',
  type: permission.type || null,
  isActive: permission.is_active ?? true,
  isDeleted: permission.is_deleted ?? false,
})

const permissionService = {
  async getPermissions(options = {}) {
    try {
      const params = {}

      if (options.module) params.module = options.module
      if (options.submodule) params.submodule = options.submodule
      if (options.active !== undefined) params.active = options.active ? 1 : 0
      if (options.groupByModule) params.group_by_module = 1
      if (options.page) params.page = options.page
      if (options.limit) params.limit = options.limit
      if (options.search) params.search = options.search
      if (options.sortBy) params.sort_by = options.sortBy
      if (options.sortDirection) params.sort_direction = options.sortDirection

      const response = await apiClient.get('/permissions', { params })
      const payload = response.data || {}

      if (options.groupByModule) {
        const grouped = payload.data || {}
        const flattened = []

        Object.entries(grouped).forEach(([moduleKey, modulePermissions]) => {
          Object.entries(modulePermissions || {}).forEach(([submoduleKey, permissions]) => {
            (permissions || []).forEach((permission) => {
              flattened.push(normalizePermission(permission, moduleKey, submoduleKey))
            })
          })
        })

        return {
          success: payload.success ?? true,
          data: flattened,
          grouped,
        }
      }

      const rows = Array.isArray(payload.data) ? payload.data : []

      return {
        success: payload.success ?? true,
        data: rows.map((permission) => normalizePermission(permission)),
        meta: payload.meta || null,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },
}

export default permissionService

