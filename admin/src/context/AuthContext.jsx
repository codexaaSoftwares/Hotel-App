import React, { createContext, useContext, useReducer, useEffect } from 'react'
import PropTypes from 'prop-types'
import authService from '../services/authService'

// Auth Actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
}

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      }
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      }
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }
    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      }
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { 
          ...state.user, 
          ...action.payload,
          // Ensure avatar is properly updated
          avatar: action.payload.avatar !== undefined ? action.payload.avatar : state.user?.avatar
        },
      }
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }
    default:
      return state
  }
}

// Initial State
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

// Default context value (used when context is accessed outside provider)
const defaultContextValue = {
  ...initialState,
  login: async () => {
    throw new Error('login function called outside AuthProvider')
  },
  logout: async () => {
    throw new Error('logout function called outside AuthProvider')
  },
  updateUser: () => {
    throw new Error('updateUser function called outside AuthProvider')
  },
  hasPermission: () => false,
  hasRole: () => false,
  hasAnyRole: () => false,
  hasAllPermissions: () => false,
}

// Auth Context with default value
const AuthContext = createContext(defaultContextValue)

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken()
      const storedUser = authService.getStoredUser()

      // Load stored user immediately for faster initial render
      if (token && storedUser) {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER,
          payload: { user: storedUser, token },
        })
      }

      if (!token) {
        return
      }

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })

      try {
        // Always fetch fresh user data from API to ensure avatar is up to date
        const response = await authService.fetchCurrentUser()
        if (response.success && response.data) {
          // Debug log
          if (import.meta.env.DEV) {
            console.log('[AuthContext] Fresh user data loaded:', {
              user: response.data,
              avatar: response.data.avatar
            })
          }
          
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: { user: response.data, token: authService.getToken() },
          })
        } else if (response.status === 401) {
          dispatch({ type: AUTH_ACTIONS.LOGOUT })
        }
      } catch (error) {
        console.error('[AuthContext] Error fetching user:', error)
        // Don't logout on error, keep using stored user
      } finally {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    
    try {
      const response = await authService.login(credentials)

      if (response.success && response.data) {
        const { user, token } = response.data

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        })

        return { success: true, user }
      }

      throw new Error(response.message || 'Login failed')
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      })
      throw new Error(errorMessage)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.warn('Logout API call failed:', error)
      // Even if logout fails, clear local storage and dispatch logout
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // Update user function
  const updateUser = (userData) => {
    const updatedUser = { 
      ...state.user, 
      ...userData,
      // Explicitly set avatar if provided
      avatar: userData.avatar !== undefined ? userData.avatar : (state.user?.avatar || null)
    }
    
    // Debug log
    if (import.meta.env.DEV) {
      console.log('[AuthContext] updateUser called:', {
        userData,
        currentUser: state.user,
        updatedUser,
        avatar: updatedUser.avatar
      })
    }
    
    localStorage.setItem('user', JSON.stringify(updatedUser))
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    })
  }

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!state.user || !state.user.permissions) return false
    return state.user.permissions.includes(permission)
  }

  // Check if user has role
  const hasRole = (role) => {
    if (!state.user) return false
    return state.user.role === role
  }

  // Check if user has any of the roles
  const hasAnyRole = (roles) => {
    if (!state.user) return false
    return roles.includes(state.user.role)
  }

  // Check if user has all permissions
  const hasAllPermissions = (permissions) => {
    if (!state.user || !state.user.permissions) return false
    return permissions.every((permission) => state.user.permissions.includes(permission))
  }

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllPermissions,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  // With default value provided to createContext, context should never be null/undefined
  // If context is somehow null/undefined, that indicates a serious issue
  if (!context) {
    console.error('[useAuth] Context is null/undefined. This should not happen with default value.')
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

export default AuthContext
