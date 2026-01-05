import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'

const normalizeRole = (role) => ({
  id: role.id,
  name: role.name,
  description: role.description || '',
  isActive: role.is_active ?? true,
  isDeleted: role.is_deleted ?? false,
  createdAt: role.created_at || null,
  updatedAt: role.updated_at || null,
})

const normalizeUser = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles.map(normalizeRole) : []
  const primaryRole = roles[0] || null

  return {
    id: user.id,
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    email: user.email || '',
    phone: user.phone || '',
    status: user.status || 'active',
    isActive: (user.status || 'active') === 'active',
    address: user.address || '',
    city: user.city || '',
    country: user.country || '',
    bio: user.bio || '',
    role: primaryRole?.name || '',
    roleId: primaryRole?.id || null,
    roles,
    roleNames: roles.map((role) => role.name),
    createdAt: user.created_at || null,
    updatedAt: user.updated_at || null,
    fullName: [user.first_name, user.last_name].filter(Boolean).join(' ').trim(),
  }
}

const toRoleIdentifier = (value) => {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'number') {
    return value
  }

  const parsed = Number(value)
  if (!Number.isNaN(parsed)) {
    return parsed
  }

  return value
}

const serializeUserPayload = (userData, { isUpdate = false } = {}) => {
  const payload = {}

  if (userData.firstName !== undefined) payload.first_name = userData.firstName?.trim() || ''
  if (userData.lastName !== undefined) payload.last_name = userData.lastName?.trim() || ''
  if (userData.email !== undefined) payload.email = userData.email?.trim() || ''
  if (userData.phone !== undefined) payload.phone = userData.phone || ''
  if (userData.address !== undefined) payload.address = userData.address || ''
  if (userData.city !== undefined) payload.city = userData.city || ''
  if (userData.country !== undefined) payload.country = userData.country || ''
  if (userData.bio !== undefined) payload.bio = userData.bio || ''

  const status =
    userData.status ||
    (userData.isActive === false ? 'inactive' : userData.isActive === true ? 'active' : undefined)

  if (status) {
    payload.status = status
  }

  if (!isUpdate && userData.password) {
    payload.password = userData.password
  } else if (isUpdate && userData.password) {
    payload.password = userData.password
  }

  const roleIdentifiers = []

  if (Array.isArray(userData.roleIds)) {
    userData.roleIds.forEach((role) => {
      const identifier = toRoleIdentifier(role)
      if (identifier !== null) {
        roleIdentifiers.push(identifier)
      }
    })
  }

  if (userData.roleId !== undefined) {
    const identifier = toRoleIdentifier(userData.roleId)
    if (identifier !== null) {
      roleIdentifiers.push(identifier)
    }
  }

  if (Array.isArray(userData.roles)) {
    userData.roles.forEach((role) => {
      const identifier = toRoleIdentifier(role)
      if (identifier !== null) {
        roleIdentifiers.push(identifier)
      }
    })
  }

  if (userData.role !== undefined) {
    const identifier = toRoleIdentifier(userData.role)
    if (identifier !== null) {
      roleIdentifiers.push(identifier)
    }
  }

  if (roleIdentifiers.length > 0) {
    payload.roles = Array.from(new Set(roleIdentifiers))
  }

  return payload
}

const userService = {
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get('/users', {
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search,
          status: params.status,
          role: params.role,
          sort_by: params.sortBy,
          sort_direction: params.sortDirection,
        },
      })

      const payload = response.data || {}
      const rows = Array.isArray(payload.data) ? payload.data : []
      const meta = payload.meta || {}

      return {
        success: payload.success ?? true,
        data: rows.map(normalizeUser),
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

  async createUser(userData) {
    try {
      const payload = serializeUserPayload(userData, { isUpdate: false })
      const response = await apiClient.post('/users', payload)

      return {
        success: true,
        data: normalizeUser(response.data),
        message: 'User created successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async updateUser(userId, userData) {
    try {
      const payload = serializeUserPayload(userData, { isUpdate: true })
      const response = await apiClient.put(`/users/${userId}`, payload)

      return {
        success: true,
        data: normalizeUser(response.data),
        message: 'User updated successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/users/${userId}`)
      return {
        success: true,
        data: response.data,
        message: response.data?.message || 'User deleted successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },
}

export default userService
