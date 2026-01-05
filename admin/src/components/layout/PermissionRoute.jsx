import React from 'react'
import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../../context/AuthContext'
import { PERMISSIONS, ROLES } from '../../constants/permissions'

const PermissionRoute = ({ 
  children, 
  requiredPermission, 
  requiredRole, 
  requiredRoles, 
  fallback = '/dashboard',
  showAccessDenied = false 
}) => {
  const { user, isAuthenticated } = useAuth()

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

  // Check permission-based access
  if (requiredPermission) {
    const hasPermission = user?.permissions?.includes(requiredPermission) || false
    if (!hasPermission) {
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
  requiredRole: PropTypes.string,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  fallback: PropTypes.string,
  showAccessDenied: PropTypes.bool,
}

export default PermissionRoute
