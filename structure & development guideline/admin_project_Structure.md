# Photo Studio Management - Admin Frontend Project Structure & Development Guidelines

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Complete Project Structure](#complete-project-structure)
3. [Technology Stack](#technology-stack)
4. [Module Overview](#module-overview)
5. [Development Guidelines](#development-guidelines)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Styling & Theming](#styling--theming)
10. [Routing & Navigation](#routing--navigation)
11. [Authentication & Authorization](#authentication--authorization)
12. [Best Practices](#best-practices)

---

## 📱 Project Overview

**Photo Studio Management Admin** is a modern React-based admin dashboard for managing a photo studio business. It provides comprehensive features for managing branches, packages, customers, orders, payments, transactions, reports, users, roles, and system settings.

### Key Features
- 🎨 Modern UI with React Bootstrap and CoreUI
- 🌓 Dark/Light theme support
- 🔐 Role-based access control (RBAC)
- 📊 Dashboard with analytics and charts
- 📄 PDF export functionality
- 🔄 Real-time data updates
- 📱 Responsive design
- 🎯 Permission-based navigation

---

## 📁 Complete Project Structure

```
admin/
├── 📁 backup/                          # Backup files (legacy components)
│   ├── Charts.jsx
│   ├── Colors.jsx
│   ├── Page404.jsx
│   ├── Page500.jsx
│   ├── README.md
│   └── Typography.jsx
│
├── 📁 public/                          # Static assets
│   ├── favicon.ico
│   ├── manifest.json
│   └── vite.svg
│
├── 📁 src/                            # Source code
│   ├── 📁 assets/                     # Static assets
│   │   ├── 📁 brand/                  # Brand assets
│   │   │   ├── logo.jsx               # Logo component
│   │   │   └── sygnet.jsx             # Sygnet component
│   │   ├── 📁 images/                 # Image assets
│   │   │   ├── 📁 avatars/            # User avatars (1-9.jpg)
│   │   │   ├── angular.jpg
│   │   │   ├── components.webp
│   │   │   ├── icons.webp
│   │   │   ├── react.jpg
│   │   │   └── vue.jpg
│   │   ├── 📁 logo/                   # Logo assets
│   │   │   └── logo-transprant.png   # Main logo (transparent)
│   │   ├── login-background.png       # Auth background
│   │   └── react.svg                  # React logo
│   │
│   ├── 📁 components/                 # Reusable components
│   │   ├── 📁 common/                 # Common/shared components
│   │   │   ├── Button.jsx            # Reusable button component
│   │   │   ├── Card.jsx               # Reusable card component
│   │   │   ├── FormFields.jsx         # Form input components
│   │   │   ├── FormModal.jsx          # Modal wrapper for forms
│   │   │   ├── GlobalSpinner.jsx     # Global loading spinner
│   │   │   ├── ImageUpload.jsx        # Image display/preview component
│   │   │   ├── Modal.jsx              # Reusable modal component
│   │   │   ├── ScrollToTop.jsx       # Scroll to top component
│   │   │   ├── StepIndicator.jsx     # Multi-step form progress
│   │   │   ├── Table.jsx              # Advanced data table (sorting/pagination)
│   │   │   ├── ThemeToggle.jsx        # Theme switching (light/dark)
│   │   │   └── ToastProvider.jsx      # Toast notifications
│   │   │
│   │   ├── 📁 docs/                   # Documentation components
│   │   │   ├── DocsComponents.jsx
│   │   │   ├── DocsExample.jsx
│   │   │   ├── DocsIcons.jsx
│   │   │   └── DocsLink.jsx
│   │   │
│   │   ├── 📁 layout/                 # Layout components
│   │   │   ├── AppBreadcrumb.jsx     # Breadcrumb navigation
│   │   │   ├── AppContent.jsx        # Main content wrapper + routes
│   │   │   ├── AppFooter.jsx         # Application footer
│   │   │   ├── AppHeader.jsx         # Application header
│   │   │   ├── AppSidebar.jsx        # Sidebar (CoreUI)
│   │   │   ├── AppSidebarNav.jsx     # Sidebar navigation
│   │   │   ├── PermissionRoute.jsx   # Route permission wrapper
│   │   │   └── 📁 header/            # Header sub-components
│   │   │       ├── AppHeaderDropdown.jsx
│   │   │       └── index.jsx
│   │   │
│   │   ├── 📁 pages/                 # Page-specific components
│   │   │   ├── 📁 branches/          # Branch management
│   │   │   │   └── BranchForm.jsx    # Branch form component
│   │   │   ├── 📁 customers/         # Customer management
│   │   │   │   ├── CustomerDetailsModal.jsx
│   │   │   │   ├── CustomerForm.jsx
│   │   │   │   └── README.md
│   │   │   ├── 📁 orders/            # Order management
│   │   │   │   ├── OrderDetailsModal.jsx
│   │   │   │   ├── OrderForm.jsx
│   │   │   │   └── README.md
│   │   │   ├── 📁 packages/          # Package management
│   │   │   │   └── PackageForm.jsx
│   │   │   ├── 📁 payments/          # Payment management
│   │   │   │   ├── PaymentDetailsModal.jsx
│   │   │   │   └── PaymentForm.jsx
│   │   │   ├── 📁 roles/            # Role management
│   │   │   │   └── RoleForm.jsx
│   │   │   ├── 📁 transactions/      # Transaction management
│   │   │   │   ├── TransactionDetailsModal.jsx
│   │   │   │   └── TransactionForm.jsx
│   │   │   ├── 📁 financial/         # Financial management
│   │   │   │   ├── FinancialTransactionForm.jsx
│   │   │   │   ├── FinancialTransactionDetailsModal.jsx
│   │   │   │   └── FinancialCategoryForm.jsx
│   │   │   └── 📁 users/            # User management
│   │   │       ├── 📁 __tests__/     # User component tests
│   │   │       │   └── ProfileForm.test.js
│   │   │       ├── AddressSection.jsx      # Address information section (with state, zipCode)
│   │   │       ├── PersonalInfoSection.jsx # Personal info section (with dateOfBirth, gender)
│   │   │       ├── ProfileForm.jsx
│   │   │       ├── ProfilePictureSection.jsx # Avatar upload/display section
│   │   │       └── UserForm.jsx
│   │   │
│   │   ├── index.jsx                 # Component exports
│   │   └── README.md                 # Components documentation
│   │
│   ├── 📁 config/                    # Configuration files
│   │   ├── apiClient.js              # Axios API client configuration
│   │   └── config.js                  # App configuration (env vars)
│   │
│   ├── 📁 constants/                 # Application constants
│   │   ├── api.js                    # API endpoint constants
│   │   ├── app.js                    # App-wide static constants (app name, footer, brand info)
│   │   ├── permissions.js            # Permission constants & helpers
│   │   └── README.md
│   │
│   ├── 📁 context/                   # React Context providers
│   │   ├── AuthContext.jsx           # Authentication context
│   │   └── README.md
│   │
│   ├── 📁 hooks/                     # Custom React hooks
│   │   ├── index.jsx                 # Hook exports
│   │   └── README.md
│   │
│   ├── 📁 layout/                     # Layout components
│   │   ├── DefaultLayout.jsx         # Default page layout wrapper
│   │   └── PrivateRoute.jsx         # Protected route wrapper
│   │
│   ├── 📁 mock/                       # Mock data for development
│   │   ├── branches.json
│   │   ├── customers.json
│   │   ├── orders.json
│   │   ├── packages.json
│   │   ├── photographers.json
│   │   ├── profile.json
│   │   ├── roles.json
│   │   ├── settings.json
│   │   ├── transactions.json
│   │   └── users.json
│   │
│   ├── 📁 pages/                     # Page components
│   │   └── 📁 Auth/                  # Authentication pages
│   │       ├── ForgotPassword.jsx    # Forgot password (email-based)
│   │       ├── Login.jsx             # Login page
│   │       └── ResetPassword.jsx     # Reset password (with token)
│   │
│   ├── 📁 scss/                      # SCSS stylesheets
│   │   ├── examples.scss
│   │   ├── style.scss                # Main stylesheet
│   │   └── 📁 vendors/                # Third-party styles
│   │       └── simplebar.scss
│   │
│   ├── 📁 services/                  # API service layer
│   │   ├── authService.js            # Authentication API (login, logout, forgot/reset password)
│   │   ├── branchService.js          # Branch API
│   │   ├── dashboardService.js       # Dashboard analytics (summary, trend, activities)
│   │   ├── customerService.js        # Customer API
│   │   ├── financialService.js      # Financial transactions API
│   │   ├── financialCategoryService.js # Financial categories API
│   │   ├── orderService.js           # Order API
│   │   ├── packageService.js         # Package API
│   │   ├── paymentService.js        # Payment API
│   │   ├── permissionService.js      # Permission API
│   │   ├── profileService.js         # Profile API (get/update profile, change password)
│   │   ├── README.md
│   │   ├── reportService.js          # Report API
│   │   ├── roleService.js            # Role API
│   │   ├── settingsService.js        # Settings API (email settings, test email, business info)
│   │   ├── transactionService.js     # Transaction API
│   │   └── userService.js            # User API
│   │
│   ├── 📁 styles/                    # Additional styles
│   │   └── auth.css                  # Authentication styles
│   │
│   ├── 📁 utils/                      # Utility functions
│   │   ├── errorHandler.js           # Error handling utilities
│   │   ├── pdfExport.js               # PDF export utilities
│   │   └── responseHandler.js        # Response handling utilities
│   │
│   ├── 📁 views/                     # Main view components
│   │   ├── 📁 branches/              # Branch management views
│   │   │   └── BranchesList.jsx
│   │   ├── 📁 customers/             # Customer management views
│   │   │   └── CustomersList.jsx
│   │   ├── 📁 dashboard/             # Dashboard views
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   └── MainChart.jsx         # Dashboard chart component
│   │   ├── 📁 orders/                # Order management views
│   │   │   └── OrdersList.jsx
│   │   ├── 📁 packages/              # Package management views
│   │   │   └── PackagesList.jsx
│   │   ├── 📁 payments/              # Payment management views
│   │   │   ├── PaymentFormView.jsx
│   │   │   └── PaymentsList.jsx
│   │   ├── 📁 reports/               # Report views
│   │   │   └── CompanyHealthReport.jsx
│   │   ├── 📁 roles/                 # Role management views
│   │   │   └── RolesList.jsx
│   │   ├── 📁 settings/              # Settings views
│   │   │   └── Settings.jsx
│   │   ├── 📁 transactions/          # Transaction management views
│   │   │   ├── TransactionFormView.jsx
│   │   │   └── TransactionsList.jsx
│   │   ├── 📁 financial/             # Financial management views
│   │   │   ├── FinancialTransactionsList.jsx
│   │   │   └── FinancialCategoriesList.jsx
│   │   └── 📁 users/                 # User management views
│   │       ├── Profile.jsx
│   │       └── UsersList.jsx
│   │
│   ├── _nav.jsx                      # Navigation configuration
│   ├── api.js                        # Mock API service setup
│   ├── App.css                       # Main app styles
│   ├── App.jsx                       # Main app component
│   ├── config.js                     # App configuration
│   ├── main.jsx                      # App entry point
│   ├── routes.jsx                    # Route definitions (lazy loading)
│   ├── routesConfig.jsx              # Route configuration (breadcrumbs)
│   ├── store.jsx                     # Redux store configuration
│   └── utils.js                      # Utility functions
│
├── 📁 styles/                        # Global styles
│   └── theme.css                     # Theme styles (CoreUI overrides)
│
├── env.example                       # Environment variables example
├── eslint.config.js                  # ESLint configuration
├── index.html                        # HTML template
├── package.json                      # Dependencies and scripts
├── package-lock.json                 # Dependency lock file
├── README.md                         # Project documentation
└── vite.config.js                    # Vite build configuration
```

---

## 🛠️ Technology Stack

### Core Technologies
- **React 19.1.1** - UI library
- **React DOM 19.1.1** - React rendering
- **Vite 7.1.12 (Rolldown)** - Build tool with Rolldown optimization
- **React Router DOM 7.7.1** - Client-side routing

### UI Frameworks
- **React Bootstrap 2.10.10** - Primary UI component library (main content)
- **CoreUI React 5.7.1** - UI library (sidebar and navigation only)
- **Bootstrap 5.3.8** - CSS framework
- **CoreUI Icons React 2.3.0** - Icon library (sidebar only)
- **FontAwesome 7.1.0** - Icon library (main content)

### State Management
- **Redux 5.0.1** - State management
- **React Redux 9.2.0** - React bindings for Redux
- **React Context** - Authentication and theme context

### HTTP & API
- **Axios 1.12.2** - HTTP client

### Charts & Visualization
- **Chart.js 4.5.0** - Chart library
- **@coreui/react-chartjs 3.0.0** - CoreUI Chart.js integration
- **@coreui/chartjs 4.1.0** - CoreUI Chart.js

### Utilities
- **SimpleBar React 3.3.2** - Custom scrollbars
- **Classnames 2.5.1** - Conditional class names
- **Prop Types 15.8.1** - Runtime type checking

### Development Tools
- **ESLint 9.36.0** - Code linting
- **Prettier 3.6.2** - Code formatting
- **Sass 1.90.0** - CSS preprocessor
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixes

---

## 📦 Module Overview

### 1. **Authentication Module**
- **Location**: `src/pages/Auth/`, `src/services/authService.js`
- **Features**:
  - Login with JWT token
  - Forgot password flow (email-based, uses database email settings)
  - Reset password (with token validation)
  - Change password (for authenticated users)
  - Token refresh
  - Logout
  - Clean login UI (demo credentials removed)
  - Footer with brand information and dynamic copyright year
- **Status**: ✅ Fully implemented with API integration

### 2. **Dashboard Module**
- **Location**: `src/views/dashboard/`
- **Features**:
  - **KPI Cards**: Total Orders and Total Customers with period comparison (from `/dashboard/summary`)
  - **Orders Summary Cards**: 4 cards showing Total Orders, Pending, Processing, Completed (from `/dashboard/orders-summary`)
  - **Upcoming Orders Widget**: Shows orders with upcoming event dates (order_date >= today) from `/dashboard/upcoming-orders`
  - **Upcoming Customer Events Widget**: Shows birthdays and anniversaries in next 30 days (from `/dashboard/upcoming-events`)
  - **Last Transactions Widget**: Combined payments and financial transactions (from `/dashboard/last-transactions`)
  - **Company Health Chart**: Multi-line chart showing Orders Revenue, Income, Expenses, and Company Profit over time (from `/dashboard/company-health-chart`)
  - Date-range filtering + manual refresh
- **Status**: ✅ Fully implemented with API integration

### 3. **Branch Management**
- **Location**: `src/views/branches/`, `src/services/branchService.js`
- **Features**:
  - Branch list with statistics (server-side pagination, filtering, searching)
  - Create/Edit branch
  - Delete branch
  - Branch details
- **Status**: ✅ Fully implemented with API integration

### 4. **Package Management**
- **Location**: `src/views/packages/`, `src/services/packageService.js`
- **Features**:
  - Package list (server-side pagination, filtering, searching)
  - Create/Edit package
  - Delete package
  - Package details
- **Status**: ✅ Fully implemented with API integration + Server-side pagination/filtering

### 5. **Customer Management**
- **Location**: `src/views/customers/`, `src/services/customerService.js`
- **Features**:
  - Customer/Photographer list (server-side pagination, filtering, searching)
  - Customer details modal
  - Create/Edit customer
  - PDF export (Customer History Report with complete order and payment history)
  - Customer statistics (auto-calculated from orders)
  - Derived financial summary (total/paid/remaining) with balance-aware status chips
- **Status**: ✅ Fully implemented with API integration + Server-side pagination/filtering + PDF Export

### 6. **Order Management**
- **Location**: `src/views/orders/`, `src/services/orderService.js`
- **Features**:
  - Order list (server-side pagination, filtering, searching)
  - **Order Date (Event Date)** column in listing - shows when the photo shoot/event happens
  - Create/Edit order (multi-package support)
  - **Notes field** - Add/edit notes in order form, displayed in Order Details and PDF export
  - Order form labels: "Order Date (Event Date)" and "Due Date (Final Delivery Date)"
  - Order details modal with integrated payment history (no separate API call needed)
  - **Important Links CRUD** - Add/Edit/Delete links with custom titles and URLs (managed from Order Details page)
  - PDF invoice export (pure black and white design) - includes notes section
  - Order status tracking with manual status update functionality
  - Payment status management (simplified to Pending/Completed)
  - Record payment from order actions
  - Customer stats auto-update on order changes
  - Order list now surfaces API errors (no mock fallback)
  - Payment history displays payment numbers in #PAY003 format
  - Clean API responses with camelCase fields only (no duplicate snake_case fields)
- **Status**: ✅ Fully implemented with API integration + Server-side pagination/filtering + PDF Export + Links CRUD + Notes field

### 7. **Payment Management**
- **Location**: `src/views/payments/`, `src/components/pages/payments/`, `src/services/paymentService.js`
- **Features**:
  - Record payment from orders (Actions → Record Payment)
  - Payment form with order selection (shows customer name with #CUST code)
  - Payment recording with validation
  - Auto-updates order payment status
  - Auto-updates customer stats
  - Credit/Debit flows now receive live order & customer financial snapshots from the API so refunds instantly recalculate totals
  - PDF receipt export (pure black and white design)
- **Status**: ✅ Fully implemented with API integration (real database) + PDF Export

### 8. **Transaction Management**
- **Location**: `src/views/transactions/`, `src/services/transactionService.js`, `src/services/paymentService.js`
- **Features**:
  - Transaction list (shows all payments from orders)
  - Payments from orders automatically appear here
  - Payment numbers displayed in #PAY003 format
  - Create transaction
  - Transaction details modal
  - Edit/Delete transactions
  - Transactions list consumes enriched payment payload (order/customer totals + payment type) so remaining amounts flip immediately after any debit
  - PDF receipt export (pure black and white design)
- **Status**: ✅ Fully implemented - Shows payments from orders module + PDF Export

### 9. **Report Management**
- **Location**: `src/views/reports/`, `src/services/reportService.js`
- **Features**:
  - Company Health Report (overall orders, payments, income, expenses with financial overview)
  - Date range filtering
  - Branch filtering
  - PDF export for Company Health Report
- **Status**: ✅ Fully implemented with API integration + PDF Export

### 10. **User Management**
- **Location**: `src/views/users/`, `src/services/userService.js`, `src/services/profileService.js`
- **Features**:
  - User list
  - Create/Edit user
  - User profile (with personal info, address)
  - Profile picture upload/delete (JPEG, PNG, WebP, max 2MB)
  - Delete user
  - User status management
  - Change password
- **Status**: ✅ Fully implemented with API integration

### 11. **Role & Permission Management**
- **Location**: `src/views/roles/`, `src/services/roleService.js`
- **Features**:
  - Role list
  - Create/Edit role
  - Assign permissions to roles
  - Permission management
- **Status**: ✅ Fully implemented with API integration

### 12. **Financial Management**
- **Location**: `src/views/financial/`, `src/services/financialService.js`, `src/services/financialCategoryService.js`
- **Features**:
  - Financial Transactions list (income & expense)
  - Create/Edit/Delete financial transactions
  - Transaction details modal
  - Financial Categories list (unified for income & expense)
  - Create/Edit/Delete financial categories
  - Statistics cards (Total Income, Total Expenses, Total Records)
  - Server-side pagination, filtering, and searching
  - Date range filtering
  - Transaction type filtering (income/expense)
  - Category filtering
  - Auto-generated transaction numbers (#INC001, #EXP001)
  - Transaction type cannot be changed after creation
- **Status**: ✅ Fully implemented with API integration + Server-side pagination/filtering

### 13. **Settings Management**
- **Location**: `src/views/settings/`, `src/services/settingsService.js`
- **Features**:
  - System settings
  - Business Information settings
  - Invoice Settings
  - Email configuration (SMTP: host, port, user, password, from email/name)
  - Test email functionality
  - App Settings (Web URL)
  - Currency & Regional Settings
  - Business logo upload/delete (JPEG, PNG, WebP, max 2MB)
  - Global settings management
- **Status**: ✅ Fully implemented with API integration

### 14. **App Constants**
- **Location**: `src/constants/app.js`
- **Features**:
  - Centralized static content management
  - Application name, subtitle, tagline
  - Dynamic copyright year range (2024-{currentYear})
  - Footer text with brand information
  - Brand name and URL (Codexaa Software Solution)
  - Logo alt text
- **Usage**: Import constants in components for consistent branding
- **Status**: ✅ Fully implemented

---

## 🎯 Development Guidelines

### Component Organization Rules

#### 1. **Component Location Rules**
- **Common Components**: `src/components/common/`
- **Page-Specific Components**: `src/components/pages/[feature]/`
- **Layout Components**: `src/components/layout/`
- **View Components**: `src/views/[feature]/`
- **Page Components**: `src/pages/[feature]/`

#### 2. **Component Naming Rules**
- Use **PascalCase** for component names
- Use **descriptive names** that indicate purpose
- Use **suffixes** for clarity:
  - `Form.jsx` - Form components
  - `List.jsx` - List/table components
  - `Modal.jsx` - Modal components
  - `Section.jsx` - Section components
  - `Wizard.jsx` - Multi-step form components
  - `Step.jsx` - Individual step components

#### 3. **File Structure Rules**
- **One component per file**
- **Export default** the main component
- **Named exports** for sub-components or utilities
- **Index files** for clean imports

### UI/UX Rules

#### 1. **UI Framework Rules**
- **Primary Framework**: React Bootstrap (for main content)
- **Sidebar Framework**: CoreUI React (for sidebar and navigation only)
- **Icon Library**: FontAwesome (free solid icons) + CoreUI Icons (sidebar only)
- **Styling**: Bootstrap classes + custom CSS + CoreUI overrides
- **Theme**: Custom white sidebar with purple/violet accents (#8b5cf6)
- **Responsive Design**: Mobile-first approach

#### 2. **Component Structure Pattern**
```jsx
// Standard Page Structure with React Bootstrap
<Container fluid>
  <Row>
    <Col xs={12}>
      {/* Page Header */}
      <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
        <h2 className="mb-0 text-dark">Page Title</h2>
        <div className="ms-auto">
          <Button variant="primary" onClick={handleAdd}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-3 shadow-sm p-4">
        {/* Section with Clean Header */}
        <div className="mb-5">
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-primary border-2">
            <FontAwesomeIcon icon={faIcon} className="me-3 text-primary fs-4" />
            <h4 className="mb-0 text-primary">Section Title</h4>
          </div>
          
          {/* Content */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Field Label</Form.Label>
                <Form.Control className="border-2" />
              </Form.Group>
            </Col>
          </Row>
        </div>
      </div>
    </Col>
  </Row>
</Container>
```

#### 3. **Form Structure Pattern**
```jsx
// Standard Form Structure with React Bootstrap
<Form>
  <Row>
    <Col xs={12} md={6}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="field" className="fw-semibold">Field Label</Form.Label>
        <Form.Control
          id="field"
          type="text"
          value={value}
          onChange={handleChange}
          required
          isInvalid={!!errors.field}
          className="border-2"
        />
        <Form.Control.Feedback type="invalid">
          {errors.field}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">Helper text</Form.Text>
      </Form.Group>
    </Col>
  </Row>
</Form>
```

#### 4. **Modal Structure Pattern**
```jsx
// Standard Modal Structure
<Modal show={visible} onHide={onClose} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Modal Title</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* Modal content */}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    <Button variant="primary" onClick={onConfirm}>Confirm</Button>
  </Modal.Footer>
</Modal>
```

#### 5. **Table Component Usage**
```jsx
// Always use the custom Table component
import { Table } from '../components'

<Table
  columns={columns}
  data={data}
  loading={loading}
  sortableColumns={['name', 'email', 'created_at']}
  onSortChange={handleSortChange}
  pagination={{
    currentPage: page,
    pageSize: limit,
    totalItems: total,
    onPageChange: handlePageChange
  }}
  serverSide={true} // For server-side pagination
/>
```

### Theme System

#### 1. **Dark/Light Theme**
- **Theme Toggle**: `ThemeToggle` component
- **State Management**: Redux store with localStorage persistence
- **CoreUI Integration**: Uses `useColorModes` hook
- **CSS Architecture**: Theme-responsive selectors using `html[data-coreui-theme="dark"]`

#### 2. **Theme Color Palette**
```css
/* Light Theme Colors */
--light-bg-primary: #ffffff;
--light-bg-secondary: #f8fafc;
--light-text-primary: #1f2937;
--light-text-secondary: #6b7280;
--light-border: #e5e7eb;
--light-accent: #8b5cf6; /* Purple/Violet */

/* Dark Theme Colors */
--dark-bg-primary: #1f2937;
--dark-bg-secondary: #374151;
--dark-text-primary: #f9fafb;
--dark-text-secondary: #d1d5db;
--dark-border: #4b5563;
--dark-accent: #a78bfa; /* Brighter violet */
```

#### 3. **Theme-Aware CSS Pattern**
```css
/* Light Theme (Default) */
.component {
  background: #ffffff;
  color: #1f2937;
  border: 1px solid #e5e7eb;
}

/* Dark Theme Override */
html[data-coreui-theme="dark"] .component {
  background: #374151 !important;
  color: #f9fafb !important;
  border: 1px solid #4b5563 !important;
}
```

### State Management Rules

#### 1. **State Management Strategy**
- **Local State**: Use `useState` for component-specific state
- **Global State**: Use Redux for application-wide state (sidebar, theme)
- **Context**: Use React Context for auth and theme
- **Server State**: Use custom hooks for API calls

#### 2. **State Naming Rules**
- Use **descriptive names** for state variables
- Use **camelCase** for state variables
- Use **boolean prefixes**: `is`, `has`, `can`, `should`
- Use **array suffixes**: `List`, `Items`, `Data`

#### 3. **State Update Rules**
- **Immutable updates** for objects and arrays
- **Functional updates** for state that depends on previous state
- **Batch updates** when possible

### API Service Rules

#### 1. **Service Organization**
- **One service per feature** (e.g., `userService.js`)
- **Consistent naming** for service methods
- **Error handling** in all service methods
- **Mock fallback** when API fails

#### 2. **Service Method Naming**
```javascript
// Standard Service Method Names
const userService = {
  getUsers: () => {},           // GET /users
  getUserById: (id) => {},      // GET /users/:id
  createUser: (data) => {},     // POST /users
  updateUser: (id, data) => {}, // PUT /users/:id
  deleteUser: (id) => {},       // DELETE /users/:id
}
```

#### 3. **Error Handling Rules**
- **Consistent error format** across all services
- **User-friendly error messages**
- **Logging** for debugging purposes
- **Fallback to mock data** only for modules marked as mock-ready (e.g., legacy branch UI); Orders, Customers, and Payments now fail fast against live APIs

#### 4. **Response Format**
```javascript
// Standard Response Format
{
  success: true,
  data: [...],
  meta: {
    total: 100,
    page: 1,
    limit: 20,
    totalPages: 5,
    hasNext: true,
    hasPrev: false,
    sortBy: 'name',
    sortDirection: 'asc'
  }
}
```

### Routing & Navigation

#### 1. **Route Configuration**
- **Lazy loading** for all routes
- **Protected routes** using `PrivateRoute`
- **Permission-based routes** using `PermissionRoute`
- **Route config** in `routesConfig.jsx` for breadcrumbs

#### 2. **Navigation Structure**
- **Sidebar navigation** in `_nav.jsx`
- **Permission-based visibility** using `PERMISSIONS` constants
- **Breadcrumb navigation** using `AppBreadcrumb`

### Authentication & Authorization

#### 1. **Authentication Flow**
- **JWT tokens** stored in `localStorage`
- **Token refresh** mechanism
- **Protected routes** for sensitive pages
- **Role-based access control**

#### 2. **Permission System**
- **Permission constants** in `constants/permissions.js`
- **App constants** in `constants/app.js` (app name, footer, brand info)
- **Permission checks** in components and routes
- **Backend permission mapping** via `authService`
- **All pages protected** with proper permission checks (Reports, Financial Transactions, Financial Categories)

### Code Quality Rules

#### 1. **Code Style**
- **ESLint configuration** must be followed
- **Prettier formatting** for consistent code style
- **Meaningful variable names**
- **Consistent indentation** (2 spaces)
- **Trailing commas** in objects and arrays

#### 2. **Component Rules**
- **Functional components** only
- **Hooks** for state and lifecycle
- **PropTypes** for prop validation
- **Default props** where appropriate
- **Memoization** for expensive operations

#### 3. **Performance Rules**
- **Lazy loading** for large components
- **Code splitting** for better performance
- **Memoization** for expensive calculations
- **Debouncing** for search inputs
- **Virtualization** for large lists

---

## 🚀 Current Implementation Status

### ✅ Fully Implemented
- Authentication (Login, Forgot Password, Reset Password, Change Password)
- User Management (CRUD operations)
- User Profile (Personal Info, Address, Change Password)
- Role & Permission Management
- Settings Management (Business Info, Invoice, Email Settings with test, App Settings with Web URL, Currency & Regional)
- Dashboard (live KPI cards, revenue trends with backend analytics endpoints)
- Customer Management (with PDF export, auto-calculated stats from orders, server-side pagination/filtering)
- Order Management (multi-package support, customer stats auto-update, server-side pagination/filtering, payment recording, PDF export, **Important Links CRUD**)
- Package Management (server-side pagination/filtering)
- Payment Management (record payments from orders, auto-updates order status and customer stats, PDF export)
- Transaction Management (shows payments from orders, PDF export)
- Report Management (Company Health Report, Customer Payment Status Report with PDF export)
- Theme System (Dark/Light mode)

### 🟡 Partially Implemented (UI Complete, API Pending)
- None (all modules fully implemented)

### 🔴 Needs Implementation
- None (all modules fully implemented)

---

## 📚 Additional Resources

### Key Dependencies
- **React 19** - Latest React version
- **React Bootstrap** - Primary UI component library
- **CoreUI React** - Sidebar and navigation
- **React Router DOM** - Client-side routing
- **Redux** - State management
- **FontAwesome** - Icon library
- **Axios** - HTTP client

### Component Library
- **Table** - Data table with sorting and pagination
- **FormModal** - Modal wrapper for forms
- **ThemeToggle** - Theme switching component
- **ToastProvider** - Global notification system
- **ImageUpload** - Image display/preview component
- **StepIndicator** - Multi-step form progress

### Development Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

**Last Updated**: December 2025
**Version**: 1.2.0

## 🔄 Recent Updates
- ✅ Branch Management fully implemented with API integration (server-side pagination, filtering, searching)
- ✅ Payment Management fully implemented with real database integration
- ✅ Transaction Management shows payments from orders
- ✅ Server-side pagination, filtering, and searching for Packages, Customers, and Orders
- ✅ Payment form shows customer name with #CUST code format
- ✅ Order actions include "Record Payment" functionality
- ✅ Dashboard cards + revenue chart now powered by `/dashboard/*` APIs with themed UI refresh
- ✅ Customer/Order/Transaction PDFs export fully implemented with pure black and white design
- ✅ All PDF exports use consistent design: pure black and white, no background colors, single thin line dividers
- ✅ All PDF exports use consistent footer format: Business Name | Address | Phone | Website | Footer Text
- ✅ Standardized PDF filename format: `Order_{OrderID}_{CustomerName}.pdf`, `Customer_{CustomerID}_{CustomerName}.pdf`, `Payment_{PaymentId}_{CustomerName}.pdf`
- ✅ CORS configuration updated to expose Content-Disposition header for filename extraction
- ✅ Orders & Customers lists now rely solely on live API responses (no mock fallback), deriving status from outstanding balances and displaying payment type badges inside Order Details
- ✅ Order Details API now includes payment history (no separate API call needed)
- ✅ Payment status simplified to Pending/Completed (removed Partial/Refunded from UI)
- ✅ Manual order status update functionality added
- ✅ Payment numbers displayed in #PAY003 format in payment history and transactions
- ✅ API responses cleaned up - removed duplicate fields, using camelCase only
- ✅ **File Upload Service** - Avatar and business logo upload implemented (local storage, no S3)
- ✅ Avatar upload/delete functionality in Profile page
- ✅ Business logo upload/delete functionality in Settings page
- ✅ Custom storage file serving (no symlink required, works on shared hosting)
- ✅ **Important Links CRUD** - Dynamic links management (add/edit/delete) with custom titles and URLs, managed from Order Details page
- ✅ **Report Management Module** - Company Health Report fully implemented with date range filtering, branch filtering, and PDF export
- ✅ **Permissions System** - All pages now have proper permission checks (Reports, Financial Transactions, Financial Categories)
- ✅ **App Constants** - Centralized constants file (`constants/app.js`) for app name, footer text, brand information
- ✅ **Footer Updates** - Dynamic copyright year range (2024-2025), brand link (Codexaa Software Solution), consistent across all pages
- ✅ **Authentication Pages** - Removed demo credentials section, updated with brand footer
