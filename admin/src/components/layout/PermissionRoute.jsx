import React from 'react'
import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../hooks'
import { PERMISSIONS, ROLES } from '../../constants/permissions'

const PermissionRoute = ({ 
  children, 
  requiredPermission, 
  requiredPermissions, 
  requiredRole, 
  requiredRoles, 
  fallback = '/dashboard',
  showAccessDenied = false 
}) => {
  const { user, isAuthenticated } = useAuth()
  const { hasPermission } = usePermissions()

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    if (showAccessDenied) {
      return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="text-center">
            <h1 className="display-1 text-danger">403</h1>
            <h4>Access Denied</h4>
            <p className="text-muted">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }
    return <Navigate to={fallback} replace />
  }

  // Check multiple roles access
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    if (showAccessDenied) {
      return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="text-center">
            <h1 className="display-1 text-danger">403</h1>
            <h4>Access Denied</h4>
            <p className="text-muted">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }
    return <Navigate to={fallback} replace />
  }

  // Check permission-based access (use hasPermission hook which checks both aliases and canonical names)
  const permissionsToCheck = requiredPermissions && requiredPermissions.length
    ? requiredPermissions
    : requiredPermission
      ? [requiredPermission]
      : []
  if (permissionsToCheck.length) {
    const hasAnyPermission = permissionsToCheck.some((p) => hasPermission(p))
    // TEMPORARY: Development bypass - Remove this when backend is ready
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
    const isStaffRoute = permissionsToCheck.some(
      (p) => p === PERMISSIONS.STAFF_READ || p === 'staff:read' || p === 'view_staff'
    )
    const isExpenseRoute = permissionsToCheck.some(
      (p) => p === PERMISSIONS.EXPENSE_READ || p === 'expense:read' || p === 'view_expense' ||
             p === PERMISSIONS.EXPENSE_CATEGORY_READ || p === 'expense_category:read'
    )
    // Allow access in development for staff and expense routes (temporary)
    if (isDevelopment && (isStaffRoute || isExpenseRoute)) {
      // Bypass permission check for development
    } else if (!hasAnyPermission) {
      if (showAccessDenied) {
        return (
          <div className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="text-center">
              <h1 className="display-1 text-danger">403</h1>
              <h4>Access Denied</h4>
              <p className="text-muted">You don't have permission to access this page.</p>
            </div>
          </div>
        )
      }
      return <Navigate to={fallback} replace />
    }
  }

  return children
}

PermissionRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredPermission: PropTypes.string,
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  requiredRole: PropTypes.string,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  fallback: PropTypes.string,
  showAccessDenied: PropTypes.bool,
}

export default PermissionRoute
