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

// Branch Management Components
const BranchesList = React.lazy(() => import('../../views/branches/BranchesList'))

// Package Management Components
const PackagesList = React.lazy(() => import('../../views/packages/PackagesList'))

// Order Management Components
const OrdersList = React.lazy(() => import('../../views/orders/OrdersList'))

// Customer Management Components
const CustomersList = React.lazy(() => import('../../views/customers/CustomersList'))

// Transaction Components
const TransactionsList = React.lazy(() => import('../../views/transactions/TransactionsList'))
const TransactionFormView = React.lazy(() => import('../../views/transactions/TransactionFormView'))

// Payment Components
const PaymentsList = React.lazy(() => import('../../views/payments/PaymentsList'))
const PaymentFormView = React.lazy(() => import('../../views/payments/PaymentFormView'))

// Financial Management Components
const FinancialTransactionsList = React.lazy(() => import('../../views/financial/FinancialTransactionsList'))
const FinancialCategoriesList = React.lazy(() => import('../../views/financial/FinancialCategoriesList'))

// Report Components
const CompanyHealthReport = React.lazy(() => import('../../views/reports/CompanyHealthReport'))

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
          
          {/* Package Management Routes */}
          <Route
            path="/packages"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.PACKAGE_READ} showAccessDenied>
                <PackagesList />
              </PermissionRoute>
            }
          />
          <Route path="/packages/create" element={<Navigate to="/packages" replace />} />
          <Route path="/packages/edit/:id" element={<Navigate to="/packages" replace />} />
          
          {/* Order Management Routes */}
          <Route
            path="/orders"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.ORDER_READ} showAccessDenied>
                <OrdersList />
              </PermissionRoute>
            }
          />
          <Route path="/orders/create" element={<Navigate to="/orders" replace />} />
          <Route path="/orders/edit/:id" element={<Navigate to="/orders" replace />} />
          
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
          <Route path="/customers/:id/wallet" element={<Navigate to="/customers" replace />} />
          <Route path="/customers/:id/ledger" element={<Navigate to="/customers" replace />} />
          
          {/* Transaction Routes */}
          <Route
            path="/transactions"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.PAYMENT_READ} showAccessDenied>
                <TransactionsList />
              </PermissionRoute>
            }
          />
          <Route
            path="/transactions/create"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.PAYMENT_WRITE} showAccessDenied>
                <TransactionFormView />
              </PermissionRoute>
            }
          />
          <Route
            path="/transactions/edit/:id"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.PAYMENT_WRITE} showAccessDenied>
                <TransactionFormView />
              </PermissionRoute>
            }
          />
          
          {/* Payment Routes */}
          <Route
            path="/payments"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.PAYMENT_READ} showAccessDenied>
                <PaymentsList />
              </PermissionRoute>
            }
          />
          <Route
            path="/payments/create"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.PAYMENT_WRITE} showAccessDenied>
                <PaymentFormView />
              </PermissionRoute>
            }
          />
          
          {/* Financial Management Routes */}
          <Route
            path="/financial/transactions"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.FINANCIAL_TRANSACTION_READ} showAccessDenied>
                <FinancialTransactionsList />
              </PermissionRoute>
            }
          />
          <Route
            path="/financial/categories"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.FINANCIAL_CATEGORY_READ} showAccessDenied>
                <FinancialCategoriesList />
              </PermissionRoute>
            }
          />
          
          {/* Report Routes */}
          <Route
            path="/reports/company-health"
            element={
              <PermissionRoute requiredPermission={PERMISSIONS.REPORT_READ} showAccessDenied>
                <CompanyHealthReport />
              </PermissionRoute>
            }
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default React.memo(AppContent)

