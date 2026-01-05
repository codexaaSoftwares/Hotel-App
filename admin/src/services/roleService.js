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

const normalizeRole = (role) => ({
  id: role.id,
  name: role.name,
  description: role.description || '',
  isActive: role.is_active ?? true,
  isDeleted: role.is_deleted ?? false,
  permissions: Array.isArray(role.permissions)
    ? role.permissions.map(normalizePermission)
    : [],
  createdAt: role.created_at || null,
  updatedAt: role.updated_at || null,
})

const serializeRolePayload = (roleData) => {
  const payload = {}

  if (roleData.name !== undefined) payload.name = roleData.name?.trim()
  if (roleData.description !== undefined) payload.description = roleData.description || ''
  if (roleData.isActive !== undefined) payload.is_active = Boolean(roleData.isActive)

  return payload
}

const enhanceRoleError = (errorResponse) => {
  if (!errorResponse || errorResponse.status !== 422 || !errorResponse.errors) {
    return errorResponse
  }

  const { errors } = errorResponse
  const nameErrors = Array.isArray(errors.name) ? errors.name : []

  if (nameErrors.includes('validation.unique')) {
    return {
      ...errorResponse,
      message: 'Role name already exists. Please choose a different name.',
    }
  }

  if (nameErrors.includes('validation.required')) {
    return {
      ...errorResponse,
      message: 'Role name is required.',
    }
  }

  return errorResponse
}

const roleService = {
  async getRoles(params = {}) {
    try {
      const response = await apiClient.get('/roles', {
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search,
          active: params.active,
          sort_by: params.sortBy,
          sort_direction: params.sortDirection,
        },
      })

      const payload = response.data || {}
      const rows = Array.isArray(payload.data) ? payload.data : []
      const meta = payload.meta || {}

      return {
        success: payload.success ?? true,
        data: rows.map(normalizeRole),
        meta: {
          total: meta.total ?? rows.length,
          page: meta.page ?? params.page ?? 1,
          limit: meta.limit ?? params.limit ?? 20,
          totalPages: meta.totalPages ?? 1,
          hasNext: meta.hasNext ?? false,
          hasPrev: meta.hasPrev ?? false,
          sortBy: meta.sortBy ?? params.sortBy ?? null,
          sortDirection: meta.sortDirection ?? params.sortDirection ?? null,
        },
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getRoleById(id) {
    try {
      const response = await apiClient.get(`/roles/${id}`)
      return {
        success: true,
        data: normalizeRole(response.data),
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async createRole(roleData) {
    try {
      const payload = serializeRolePayload(roleData)
      const response = await apiClient.post('/roles', payload)

      if (Array.isArray(roleData.permissions) && roleData.permissions.length) {
        await apiClient.put(`/roles/${response.data.id}/permissions`, {
          permissions: roleData.permissions,
        })
        const roleWithPermissions = await apiClient.get(`/roles/${response.data.id}`)
        return {
          success: true,
          data: normalizeRole(roleWithPermissions.data),
          message: 'Role created successfully',
        }
      }

      return {
        success: true,
        data: normalizeRole(response.data),
        message: 'Role created successfully',
      }
    } catch (error) {
      return enhanceRoleError(handleApiError(error))
    }
  },

  async updateRole(roleId, roleData) {
    try {
      const payload = serializeRolePayload(roleData)
      const response = await apiClient.put(`/roles/${roleId}`, payload)

      if (Array.isArray(roleData.permissions)) {
        await apiClient.put(`/roles/${roleId}/permissions`, {
          permissions: roleData.permissions,
        })
        const roleWithPermissions = await apiClient.get(`/roles/${roleId}`)
        return {
          success: true,
          data: normalizeRole(roleWithPermissions.data),
          message: 'Role updated successfully',
        }
      }

      return {
        success: true,
        data: normalizeRole(response.data),
        message: 'Role updated successfully',
      }
    } catch (error) {
      return enhanceRoleError(handleApiError(error))
    }
  },

  async deleteRole(roleId) {
    try {
      const response = await apiClient.delete(`/roles/${roleId}`)
      return {
        success: true,
        data: response.data,
        message: response.data?.message || 'Role deleted successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async updateRolePermissions(roleId, permissions) {
    try {
      const response = await apiClient.put(`/roles/${roleId}/permissions`, {
        permissions,
      })
      return {
        success: true,
        data: normalizeRole(response.data),
        message: 'Role permissions updated successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },
}

export default roleService