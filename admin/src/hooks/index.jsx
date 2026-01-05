import { useState, useEffect, useCallback } from 'react'
import { useAuth as useAuthContext } from '../context/AuthContext'
import userService from '../services/userService'
import roleService from '../services/roleService'

// useAuth Hook - Authentication state management (Context wrapper)
export const useAuth = () => useAuthContext()

// useApi Hook - API request management
export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (apiCall) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall()
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    request,
  }
}

// useLocalStorage Hook - Local storage management
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

// useDebounce Hook - Debounced values
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// useToggle Hook - Boolean state toggle
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue(prev => !prev), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return [value, { toggle, setTrue, setFalse }]
}

// usePermissions Hook - Permission checking
export const usePermissions = () => {
  const { user } = useAuth()

  const hasPermission = useCallback((permission) => {
    if (!user) return false
    // Check both aliases (e.g., 'branch:write') and canonical names (e.g., 'create_branch', 'edit_branch')
    const hasAlias = user.permissions && user.permissions.includes(permission)
    const hasCanonical = user.permissionIdentifiers && user.permissionIdentifiers.includes(permission)
    return hasAlias || hasCanonical
  }, [user])

  const hasAnyPermission = useCallback((permissions) => {
    if (!user || !user.permissions) return false
    return permissions.some(permission => user.permissions.includes(permission))
  }, [user])

  const hasAllPermissions = useCallback((permissions) => {
    if (!user || !user.permissions) return false
    return permissions.every(permission => user.permissions.includes(permission))
  }, [user])

  const hasRole = useCallback((role) => {
    if (!user) return false
    return user.role === role
  }, [user])

  const hasAnyRole = useCallback((roles) => {
    if (!user) return false
    return roles.includes(user.role)
  }, [user])

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    user,
  }
}

// useUserManagement Hook - User management operations
export const useUserManagement = () => {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await userService.getUsers(params)
      if (response.success) {
        setUsers(response.data || [])
        setMeta(response.meta || null)
      } else {
        setError(response.message || 'Failed to fetch users')
      }
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createUser = useCallback(async (userData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await userService.createUser(userData)
      if (response.success && response.data) {
        setUsers((prev) => [...prev, response.data])
      } else {
        setError(response.message || 'Failed to create user')
      }
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (userId, userData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await userService.updateUser(userId, userData)
      if (response.success && response.data) {
        setUsers((prev) =>
          prev.map((user) => (user.id === userId ? response.data : user))
        )
      } else {
        setError(response.message || 'Failed to update user')
      }
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteUser = useCallback(async (userId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await userService.deleteUser(userId)
      if (response.success) {
        setUsers((prev) => prev.filter((user) => user.id !== userId))
      } else {
        setError(response.message || 'Failed to delete user')
      }
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    users,
    meta,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
}

// useRoleManagement Hook - Role management operations
export const useRoleManagement = () => {
  const [roles, setRoles] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRoles = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await roleService.getRoles(params)
      if (response.success) {
        setRoles(response.data || [])
        setMeta(response.meta || null)
      } else {
        setError(response.message || 'Failed to fetch roles')
      }
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createRole = useCallback(async (roleData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await roleService.createRole(roleData)
      if (response.success && response.data) {
        setRoles((prev) => [...prev, response.data])
        setMeta((prev) =>
          prev
            ? {
                ...prev,
                total: prev.total + 1,
              }
            : prev,
        )
      } else {
        setError(response.message || 'Failed to create role')
      }
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateRole = useCallback(async (roleId, roleData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await roleService.updateRole(roleId, roleData)
      if (response.success && response.data) {
        setRoles((prev) =>
          prev.map((role) => (role.id === roleId ? response.data : role))
        )
      } else {
        setError(response.message || 'Failed to update role')
      }
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteRole = useCallback(async (roleId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await roleService.deleteRole(roleId)
      if (response.success) {
        setRoles((prev) => prev.filter((role) => role.id !== roleId))
        setMeta((prev) =>
          prev
            ? {
                ...prev,
                total: Math.max(prev.total - 1, 0),
              }
            : prev,
        )
      } else {
        setError(response.message || 'Failed to delete role')
      }
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    roles,
    meta,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  }
}

export default {
  useAuth,
  useApi,
  useLocalStorage,
  useDebounce,
  useToggle,
  usePermissions,
  useUserManagement,
  useRoleManagement,
}
