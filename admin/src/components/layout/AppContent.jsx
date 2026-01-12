import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CSpinner } from '@coreui/react'

// Import components
const Dashboard = React.lazy(() => import('../../views/dashboard/Dashboard'))

// User Management Components
const UsersList = React.lazy(() => import('../../views/users/UsersList'))
const Profile = React.lazy(() => import('../../views/users/Profile'))
const RolesList = React.lazy(() => import('../../views/roles/RolesList'))

// Settings Components
const Settings = React.lazy(() => import('../../views/settings/Settings'))

// Restaurant Components
const RestaurantSettings = React.lazy(() => import('../../views/restaurant/settings/RestaurantSettings'))
const MenuManagement = React.lazy(() => import('../../views/restaurant/MenuManagement'))
const TablesList = React.lazy(() => import('../../views/restaurant/TablesList'))

// Branch Management Components
const BranchesList = React.lazy(() => import('../../views/branches/BranchesList'))

// Customer Management Components
const CustomersList = React.lazy(() => import('../../views/customers/CustomersList'))


import PermissionRoute from './PermissionRoute'
import { PERMISSIONS } from '../../constants/permissions'

const AppContent = () => {
  return (
    <div className="app-content">
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.DASHBOARD_READ} showAccessDenied>
                <Dashboard />
              </PermissionRoute>
            }
          />
          
          {/* User Management Routes */}
          <Route
            path="/users"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.USER_READ} showAccessDenied>
                <UsersList />
              </PermissionRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/roles"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.ROLE_READ} showAccessDenied>
                <RolesList />
              </PermissionRoute>
            }
          />
          
          {/* Settings Routes */}
          <Route
            path="/settings"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.SETTINGS_READ} showAccessDenied>
                <Settings />
              </PermissionRoute>
            }
          />
          
          {/* Restaurant Routes */}
          <Route
            path="/restaurant/menu"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.FOOD_CATEGORY_READ} showAccessDenied>
                <MenuManagement />
              </PermissionRoute>
            }
          />
          <Route
            path="/restaurant/tables"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.TABLE_READ} showAccessDenied>
                <TablesList />
              </PermissionRoute>
            }
          />
          <Route
            path="/restaurant/settings"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.RESTAURANT_SETTINGS_READ} showAccessDenied>
                <RestaurantSettings />
              </PermissionRoute>
            }
          />
          
          {/* Branch Management Routes */}
          <Route
            path="/branches"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.BRANCH_READ} showAccessDenied>
                <BranchesList />
              </PermissionRoute>
            }
          />
          <Route path="/branches/create" element={<Navigate to="/branches" replace />} />
          <Route path="/branches/edit/:id" element={<Navigate to="/branches" replace />} />
          
          {/* Customer Management Routes */}
          <Route
            path="/customers"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.CUSTOMER_READ} showAccessDenied>
                <CustomersList />
              </PermissionRoute>
            }
          />
          <Route path="/customers/create" element={<Navigate to="/customers" replace />} />
          <Route path="/customers/edit/:id" element={<Navigate to="/customers" replace />} />
          
          {/* Report Routes */}
          {/* Report routes will be added here as needed */}
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default React.memo(AppContent)

