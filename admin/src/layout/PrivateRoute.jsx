import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'

const PrivateRoute = ({ children, requiredRole = null }) => {
  const location = useLocation()
  
  // Check if user is authenticated
  const token = localStorage.getItem('access_token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!token || !user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check token expiration (JWT)
  if (token.includes('.')) {
    try {
      // JWT format: header.payload.signature (base64url)
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format')
      }
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      // exp is in seconds since epoch
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token expired, clear storage and redirect
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        return <Navigate to="/login" state={{ from: location }} replace />
      }
    } catch (error) {
      // Invalid JWT, clear storage and redirect
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      return <Navigate to="/login" state={{ from: location }} replace />
    }
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    // User doesn't have required role
    return <Navigate to="/unauthorized" replace />
  }

  // User is authenticated and authorized
  return children
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string
}

export default PrivateRoute
