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

// Customer Management Components
const CustomersList = React.lazy(() => import('../../views/customers/CustomersList'))

// Staff Management Components
const StaffList = React.lazy(() => import('../../views/staff/StaffList'))

// POS Panel Components
const POSPanel = React.lazy(() => import('../../views/pos/POSPanel'))
const BillsList = React.lazy(() => import('../../views/pos/BillsList'))

// Expense Management Components
const ExpensesList = React.lazy(() => import('../../views/expenses/ExpensesList'))

// Hotel Room Components
const RoomCategoriesList = React.lazy(() => import('../../views/hotel-room/RoomCategoriesList'))

// Report Components
const SalesReport = React.lazy(() => import('../../views/reports/SalesReport'))
const ExpenseReport = React.lazy(() => import('../../views/reports/ExpenseReport'))
const CustomerPendingReport = React.lazy(() => import('../../views/reports/CustomerPendingReport'))
const StaffSalaryReport = React.lazy(() => import('../../views/reports/StaffSalaryReport'))
const CategoryWiseItemReport = React.lazy(() => import('../../views/reports/CategoryWiseItemReport'))


import PermissionRoute from './PermissionRoute'
import { PERMISSIONS } from '../../constants/permissions'

const AppContent = () => {

  return (
    <div className="app-content">
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {/* Restaurant Module Routes */}
          <Route
            path="/restaurant/dashboard"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.DASHBOARD_READ} showAccessDenied>
                <Dashboard />
              </PermissionRoute>
            }
          />
          <Route
            path="/restaurant/pos/panel"
            element={
              <PermissionRoute requiredPermission="create_bill" showAccessDenied>
                <POSPanel />
              </PermissionRoute>
            }
          />
          <Route
            path="/restaurant/pos/bills"
            element={
              <PermissionRoute requiredPermission="view_bill" showAccessDenied>
                <BillsList />
              </PermissionRoute>
            }
          />
          <Route
            path="/restaurant/reports/sales"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.SALES_REPORT_READ} showAccessDenied>
                <SalesReport />
              </PermissionRoute>
            }
          />
          <Route
            path="/restaurant/reports/expenses"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.EXPENSE_REPORT_READ} showAccessDenied>
                <ExpenseReport />
              </PermissionRoute>
            }
          />
          <Route
            path="/restaurant/reports/customer-pending"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.CUSTOMER_PENDING_REPORT_READ} showAccessDenied>
                <CustomerPendingReport />
              </PermissionRoute>
            }
          />
          <Route
            path="/restaurant/reports/staff-salary"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.STAFF_SALARY_REPORT_READ} showAccessDenied>
                <StaffSalaryReport />
              </PermissionRoute>
            }
          />
          <Route
            path="/restaurant/reports/category-wise-items"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.SALES_REPORT_READ} showAccessDenied>
                <CategoryWiseItemReport />
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
          
          {/* Staff Management Routes */}
          <Route
            path="/staff"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.STAFF_READ} showAccessDenied>
                <StaffList />
              </PermissionRoute>
            }
          />
          <Route path="/staff/create" element={<Navigate to="/staff" replace />} />
          <Route path="/staff/edit/:id" element={<Navigate to="/staff" replace />} />
          
          {/* Expense Management Routes */}
          <Route
            path="/expenses"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.EXPENSE_READ} showAccessDenied>
                <ExpensesList />
              </PermissionRoute>
            }
          />
          <Route path="/expenses/create" element={<Navigate to="/expenses" replace />} />
          <Route path="/expenses/edit/:id" element={<Navigate to="/expenses" replace />} />
          
          {/* Hotel Room Module Routes */}
          <Route
            path="/hotel-room/room-types"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.ROOM_TYPE_READ} showAccessDenied>
                <RoomCategoriesList />
              </PermissionRoute>
            }
          />
          
          {/* Default redirect - redirect to restaurant module dashboard */}
          <Route 
            path="/" 
            element={<Navigate to="/restaurant/dashboard" replace />} 
          />
        </Routes>
      </Suspense>
    </div>
  )
}

export default React.memo(AppContent)

