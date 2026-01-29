# Hotel Management App - Admin Frontend Project Structure & Development Guidelines

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

**Hotel Management App Admin** is a modern React-based admin dashboard for managing hotel operations. It provides comprehensive features for managing branches, financial transactions, reports, users, roles, and system settings.

**Note**: This is a multi-tenant/reseller application where client-specific content (business name, logo, branding) is dynamically loaded from the database settings. The current implementation supports "Teja Hotel" as a client, but the system is designed to support multiple clients with their own branding.

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
│   │   │   ├── AppHeader.jsx         # Application header (horizontal navigation)
│   │   │   ├── AppHorizontalNav.jsx  # Horizontal navigation menu
│   │   │   ├── AppSidebar.jsx        # Sidebar (CoreUI) - Legacy, not used
│   │   │   ├── AppSidebarNav.jsx     # Sidebar navigation - Legacy, not used
│   │   │   ├── PermissionRoute.jsx   # Route permission wrapper
│   │   │   └── 📁 header/            # Header sub-components
│   │   │       ├── AppHeaderDropdown.jsx
│   │   │       └── index.jsx
│   │   │
│   │   ├── 📁 pages/                 # Page-specific components
│   │   │   ├── 📁 branches/          # Branch management
│   │   │   │   └── BranchForm.jsx    # Branch form component
│   │   │   ├── 📁 payments/          # Payment management
│   │   │   │   ├── PaymentDetailsModal.jsx
│   │   │   │   └── PaymentForm.jsx
│   │   │   ├── 📁 roles/            # Role management
│   │   │   │   └── RoleForm.jsx
│   │   │   ├── 📁 financial/         # Financial management
│   │   │   │   ├── FinancialTransactionForm.jsx
│   │   │   │   ├── FinancialTransactionDetailsModal.jsx
│   │   │   │   └── FinancialCategoryForm.jsx
│   │   │   ├── 📁 restaurant/       # Restaurant management
│   │   │   │   ├── CategoryForm.jsx  # Food category form component
│   │   │   │   ├── ItemForm.jsx      # Food item form component
│   │   │   │   └── TableForm.jsx     # Table form component
│   │   │   ├── 📁 customers/         # Customer management
│   │   │   │   ├── CustomerForm.jsx  # Customer form component
│   │   │   │   ├── CustomerLedgerModal.jsx # Customer ledger modal component
│   │   │   │   └── WalletTransactionForm.jsx # Wallet transaction form component
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
│   │   ├── photographers.json
│   │   ├── profile.json
│   │   ├── roles.json
│   │   ├── settings.json
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
│   │   ├── financialCategoryService.js # Financial categories API
│   │   ├── financialTransactionService.js # Financial transactions API
│   │   ├── paymentService.js        # Payment API
│   │   ├── permissionService.js      # Permission API
│   │   ├── profileService.js         # Profile API (get/update profile, change password)
│   │   ├── README.md
│   │   ├── roleService.js            # Role API
│   │   ├── settingsService.js        # Settings API (email settings, test email, business info)
│   │   ├── tableService.js           # Table Management API
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
│   │   ├── 📁 dashboard/             # Dashboard views
│   │   │   ├── Dashboard.jsx        # Main dashboard (empty placeholder)
│   │   │   └── MainChart.jsx         # Dashboard chart component
│   │   ├── 📁 payments/              # Payment management views
│   │   │   ├── PaymentFormView.jsx
│   │   │   └── PaymentsList.jsx
│   │   ├── 📁 reports/               # Report views
│   │   │   ├── BranchReport.jsx
│   │   │   ├── LedgerReport.jsx
│   │   │   ├── SalesReport.jsx
│   │   │   └── StaffReport.jsx
│   │   ├── 📁 roles/                 # Role management views
│   │   │   └── RolesList.jsx
│   │   ├── 📁 settings/              # Settings views
│   │   │   └── Settings.jsx
│   │   ├── 📁 financial/             # Financial management views
│   │   │   ├── FinancialTransactionsList.jsx
│   │   │   └── FinancialCategoriesList.jsx
│   │   ├── 📁 restaurant/        # Restaurant management views
│   │   │   ├── MenuManagement.jsx # Food categories and items management
│   │   │   ├── TablesList.jsx     # Table management list
│   │   │   └── 📁 settings/        # Restaurant settings
│   │   │       └── RestaurantSettings.jsx
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
  - Dashboard placeholder (ready for future implementation)
  - MainChart component available for future charts
- **Status**: ⏳ Empty placeholder, ready for implementation

### 3. **Branch Management**
- **Location**: `src/views/branches/`, `src/services/branchService.js`
- **Features**:
  - Branch list with statistics (server-side pagination, filtering, searching)
  - Create/Edit branch
  - Delete branch
  - Branch details
- **Status**: ✅ Fully implemented with API integration

### 4. **Payment Management**
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

### 5. **Report Management**
- **Location**: `src/views/reports/`
- **Features**:
  - Branch Report
  - Ledger Report
  - Sales Report
  - Staff Report
- **Status**: ✅ Available (ready for implementation)

### 6. **User Management**
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

### 7. **Role & Permission Management**
- **Location**: `src/views/roles/`, `src/services/roleService.js`
- **Features**:
  - Role list
  - Create/Edit role
  - Assign permissions to roles
  - Permission management
- **Status**: ✅ Fully implemented with API integration

### 8. **Financial Management**
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

### 9. **Settings Management**
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

### 10. **App Constants**
- **Location**: `src/constants/app.js`
- **Features**:
  - Centralized static content management
  - Application name: "Hotel Management App" (default, can be overridden by client settings)
  - Subtitle: "Hotel Management System"
  - Tagline: "Your Perfect Stay, Our Commitment"
  - Dynamic copyright year range (2024-{currentYear})
  - Footer text with brand information
  - Brand name and URL (Codexaa Software Solution)
  - Logo alt text: Dynamic from client settings
- **Usage**: Import constants in components for consistent branding
- **Note**: Client-specific branding (business name, logo) is loaded dynamically from database settings
- **Status**: ✅ Fully implemented

### 11. **Restaurant Management Modules** (Phase 1 - In Development)
- **Location**: `src/views/restaurant/`, `src/views/pos/`, `src/views/customers/`, `src/views/staff/`, `src/views/expenses/`
- **Modules**:
  - **POS Panel**: Main POS interface with split-screen layout (Tables | Products | Billing Cart)
  - **Bills Management**: Unified bills page with filters (Pending, Today, Paid, etc.)
  - **Restaurant Setup**:
    - ✅ **Restaurant Settings** - GST Settings, Invoice Settings, Thermal Printer Settings (fully implemented)
    - ✅ **Menu Management** - Unified page for Food Categories and Food Items with hierarchical display, CRUD operations, image upload, and item reordering (fully implemented)
    - ✅ **Table Management** - Table list with statistics, CRUD operations, status management, server-side pagination, filtering, and searching (fully implemented)
  - **Customer Management**: Customers list, Customer Ledger (Modal view with quick access from customer list)
  - **Staff Management**: Staff list, Salary Payments
  - **Expense Management**: Expense Categories, Expense Records
- **Status**: 
  - ✅ Restaurant Settings (Frontend + Backend fully implemented)
  - ✅ Menu Management (Food Categories & Food Items - Frontend + Backend fully implemented)
  - ✅ Table Management (Frontend + Backend fully implemented)
  - ✅ Customer Management (Frontend + Backend fully implemented)
  - ⏳ Other modules pending
- **Specification**: See `scope/POS_Panel_Specification.md` and `module details/ProjectModules.md`

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
- **Navigation Framework**: React Bootstrap Navbar (horizontal navigation)
- **Icon Library**: FontAwesome (free solid icons) for all UI elements
- **Styling**: Bootstrap classes + custom CSS + CoreUI overrides
- **Theme**: Elegant Teal color scheme (#0d9488) - Professional hospitality theme
- **Navigation**: Horizontal top navigation bar (compact design, supports multi-level dropdowns)
- **Responsive Design**: Mobile-first approach with hamburger menu for mobile devices

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
// Standard Form Structure - Always use FormFields components
import { TextField, SelectField, TextAreaField, FormRow } from '../../components/common/FormFields'

<Form>
  <FormRow>
    <TextField
      id="field"
      label="Field Label"
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="Enter value"
      required
      invalid={!!errors.field}
      feedback={errors.field}
      helpText="Helper text"
      col={6}
    />
    <SelectField
      id="status"
      label="Status"
      value={status}
      onChange={handleChange}
      options={[
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]}
      col={6}
    />
  </FormRow>
  <FormRow>
    <TextAreaField
      id="description"
      label="Description"
      value={description}
      onChange={handleChange}
      placeholder="Enter description"
      rows={3}
      col={12}
    />
  </FormRow>
</Form>
```

**Important Rules:**
- **Always use FormFields components** (`TextField`, `SelectField`, `TextAreaField`, `FormRow`) for all form inputs
- **Never use direct** `Form.Control` or `FormSelect` in forms
- Use `showLabel={false}` for filter dropdowns in listing pages if labels are not needed
- FormFields automatically handle consistent styling, validation feedback, and layout

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

// Large Modal Structure (Full-width/XL size)
<Modal 
  show={visible} 
  onHide={onClose} 
  size="xl"
  fullscreen="lg-down"
  backdrop="static"
  keyboard={false}
  className="modal-xl-large"
>
  {/* Modal content - Uses global .modal-xl-large class for 95vw width */}
</Modal>
```

**Global Modal Classes:**
- `.modal-xl-large` - Reusable class for extra-large modals (95vw width on desktop, 90vw on larger screens, fullscreen on mobile/tablet)
  - Located in `src/scss/style.scss`
  - Can be applied to any modal that needs larger size
  - Includes proper height management and flex layout

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

#### 2. **Theme Color Palette - Hotel Industry Theme**
```css
/* Light Theme Colors - Elegant Teal */
--light-bg-primary: #ffffff;
--light-bg-secondary: #f0fdfa;
--light-text-primary: #1f2937;
--light-text-secondary: #6b7280;
--light-border: #e5e7eb;
--light-accent: #0d9488; /* Elegant Teal - Professional hospitality */

/* Primary Color Variables */
--cui-primary: #0d9488; /* Teal-600 */
--cui-primary-rgb: 13, 148, 136;
--cui-success: #059669; /* Emerald-600 */
--cui-info: #0284c7; /* Sky-600 */
--cui-warning: #d97706; /* Amber-600 */
--cui-danger: #dc2626; /* Red-600 */

/* Dark Theme Colors */
--dark-bg-primary: #1f2937;
--dark-bg-secondary: #374151;
--dark-text-primary: #f9fafb;
--dark-text-secondary: #d1d5db;
--dark-border: #4b5563;
--dark-accent: #14b8a6; /* Brighter teal for dark mode */
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
- **Horizontal navigation** in `_nav.jsx` (hierarchical menu structure)
- **Multi-level dropdowns** support (parent-child relationships)
- **Permission-based visibility** using `PERMISSIONS` constants
- **Breadcrumb navigation** using `AppBreadcrumb`
- **Compact design** with reduced padding and font sizes
- **Active state highlighting** with teal background for current route
- **Navigation Structure Example**:
  ```
  1. Dashboard
  2. POS Panel
  3. Bills
  4. Restaurant
     -- 4.1 Food Categories
     -- 4.2 Food Items
     -- 4.3 Table Management
     -- 4.4 Restaurant Settings
  5. Management
     -- 5.1 Customers
     -- 5.2 Customer Ledger
     -- 5.3 Staff
     -- 5.4 Salary Payments
     -- 5.5 Expense Categories
     -- 5.6 Expenses
  6. Reports
     -- 6.1 Sales Report
     -- 6.2 Expense Report
     -- 6.3 GST Summary
     -- 6.4 Customer Pending Report
     -- 6.5 Customer Ledger Report
     -- 6.6 Staff & Salary Report
     -- 6.7 Business Dashboard
  7. Administrator
     -- 7.1 User Management
        ---- 7.1.1 Users
        ---- 7.1.2 Role and Permission
     -- 7.2 Branch
     -- 7.3 Settings
  ```

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

**Permission Types:**
- **Standard Permissions**: Follow pattern `{action}_{resource}` (e.g., `view_user`, `create_branch`, `edit_role`)
  - Checked using canonical permission names directly (e.g., `hasPermission('create_branch')`)
  - No alias fallback for create/edit/delete to ensure granular control
- **Special Permissions**: All start with `special_` prefix
  - Module: `special`, Submodule: `special`, Type: `special`
  - Examples: `special_export_data`, `special_bulk_delete`, `special_view_audit_logs`
  - Available special permissions:
    1. `special_export_data` - Export data to Excel/PDF
    2. `special_import_data` - Import data from Excel/CSV
    3. `special_bulk_delete` - Bulk delete operations
    4. `special_bulk_update` - Bulk update operations
    5. `special_view_audit_logs` - View audit logs and activity history
    6. `special_manage_backups` - Manage database backups
    7. `special_system_maintenance` - Access system maintenance mode
    8. `special_view_all_branches` - View all branches regardless of assignment
    9. `special_override_restrictions` - Override business rules and restrictions

**Permission Checking:**
```javascript
import { usePermissions } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const MyComponent = () => {
  const { hasPermission } = usePermissions()
  
  // Check standard permission (canonical name)
  const canCreate = hasPermission('create_branch')
  
  // Check special permission
  const canExport = hasPermission(PERMISSIONS.EXPORT_DATA) // or 'special_export_data'
}
```

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
- Branch Management (CRUD operations)
- Financial Management (Income & Expense transactions, Categories)
- Payment Management
- Report Management (Branch, Ledger, Sales, Staff reports)
- Theme System (Dark/Light mode)
- Navigation Menu Structure (Restaurant Management modules - navigation configured)
- Restaurant Settings (GST Settings, Invoice Settings, Thermal Printer Settings - Frontend + Backend)
- Table Management (Table list with statistics, CRUD operations, status management - Frontend + Backend)

### 🟡 Partially Implemented (UI Complete, API Pending)
- None (all existing modules fully implemented)

### ✅ Fully Implemented
- Menu Management (Unified Food Categories & Food Items management page with hierarchical display, image upload, and item reordering)
- Table Management (Table list with statistics cards, CRUD operations, status management, server-side pagination, filtering, and searching)

### ✅ Fully Implemented
- Customer Management (Customers list with CRUD operations, server-side pagination, filtering, searching, sorting)

### ✅ Fully Implemented (Phase 1 - Restaurant Management)
- **POS Panel** (Main POS interface with split-screen layout)
  - ✅ Frontend UI complete (Tables Panel, Products Panel, Billing Cart Panel)
  - ✅ Product selection with animated hover effects
  - ✅ Customer management (walk-in default, quick add modal, search)
  - ✅ GST/Tax calculation (CGST, SGST, Service Tax) - bill-wise on subtotal after discount
  - ✅ Discount field (percentage/amount toggle)
  - ✅ Rounding feature with display (configurable via restaurant settings)
  - ✅ Payment method selection (Cash, UPI, Card, Wallet)
  - ✅ Wallet payment option (only for selected customers, auto-generates payment notes)
  - ✅ Save Draft functionality (manual + event-based auto-save on cart changes)
  - ✅ Print Bill functionality (print-friendly HTML template)
  - ✅ Payment processing with backend API integration
  - ✅ Payment processing logic:
    - Cash/UPI/Card: Updates bill status to 'paid' (no wallet transaction)
    - Wallet: Creates wallet transaction (debit) and marks bill as 'paid'
  - ✅ Sound notifications: Success sound for payment success, error sound for failures
  - ✅ Payment confirmation and success dialogs
  - ✅ Bill number auto-generation: `#BILL{ID}` format
  - ✅ POS header displays bill_number, total, and customer info dynamically
  - ✅ Table status automatic updates (occupied/available based on active bills)

### ✅ Bills Management (Fully Implemented)
- ✅ Bills Listing page (`BillsList.jsx`) with server-side pagination, filtering, and searching
- ✅ Statistics cards (Total Bills, Pending, Paid, Today Revenue)
- ✅ Filters: Payment Status, Payment Method, Table, Customer, Date Range
- ✅ Search by Bill Number, Customer Name, Table Name
- ✅ Bill View Modal component (`BillViewModal.jsx`) - Separate reusable component
  - Large modal view (xl size, fullscreen on mobile) matching CustomerLedgerModal pattern
  - Improved UI: Items table on left, Bill Summary on right side
  - Removed GST column from items table (GST shown in summary only)
  - Bill summary displays: Subtotal, CGST, SGST, Service Tax, Discount, Total
  - Payment information: Payment Status and Payment Method badges
  - Handles null payment_method (displays "Wallet" for wallet transactions)
- ✅ Action buttons: View Details, Print Bill, Delete (for draft/pending bills)
- ✅ Print bill functionality (print-friendly HTML template)
- ✅ Separate GST fields: CGST, SGST, Service Tax stored individually in database
- ✅ Payment Method filter and display in Payment column

### 🔴 Needs Implementation (Phase 1 - Restaurant Management)
- Staff Management (Staff, Salary Payments)
- Expense Management (Expense Categories, Expense Records)
- Restaurant Reports (Sales, Expense, GST, Customer, Staff reports)

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

**Last Updated**: January 2025
**Version**: 2.6.0 (POS Panel Payment Processing Implementation)

## 🔄 Recent Updates

### Version 2.0.0 - Hotel Management Theme & Navigation Redesign
- ✅ **Multi-Tenant Architecture**: System redesigned as reseller/multi-tenant application
- ✅ **Dynamic Branding**: Client-specific content (business name, logo) loaded dynamically from database settings
- ✅ **Theme Redesign**: Updated color palette from Purple/Violet to Elegant Teal (#0d9488) - Professional hospitality theme
- ✅ **Navigation Redesign**: Replaced sidebar navigation with horizontal top navigation bar
- ✅ **Compact Navigation**: Reduced navbar height (44px), padding, and font sizes for better space efficiency
- ✅ **Hierarchical Menu**: Implemented multi-level dropdown support (parent-child relationships)
- ✅ **Header Enhancement**: New header design with:
  - Logo + Business Name (left) - Dynamic from settings
  - Welcome Message (center)
  - Watch/Time Display (right)
  - Fullscreen button
  - User avatar dropdown
- ✅ **Navigation Structure**: Updated to hierarchical menu:
  - Dashboard (Level 1)
  - Administrator (Level 1 - Parent)
    - User Management (Level 2 - Parent)
      - Users (Level 3)
      - Role and Permission (Level 3)
    - Branch (Level 2)
    - Settings (Level 2)
- ✅ **Full-width Layout**: Top header bar and navigation container now span 100% width
- ✅ **Settings Integration**: Business name and logo dynamically loaded from settings (supports multiple clients)

### Version 2.1.0 - Restaurant Management Navigation Update
- ✅ **Navigation Menu Reorganization**: Restructured navigation for restaurant workflow
- ✅ **New Menu Items Added**:
  - POS Panel (standalone top-level item)
  - Bills (standalone top-level item with unified filters)
  - Restaurant (grouped: Food Categories, Food Items, Tables, Settings)
  - Management (grouped: Customers, Staff, Expenses)
- ✅ **Minimal Navigation Design**: Consolidated multiple menu items into logical groups
- ✅ **New Permissions Added**: Restaurant, POS, Customer, Staff, Expense, and Report permissions
- ✅ **Compact Navigation Styling**: Enhanced dropdown item hover and active states
- ✅ **POS Panel Specification**: Created detailed specification document for POS Panel implementation

### Version 2.2.0 - Restaurant Settings Implementation
- ✅ **Restaurant Settings Module**: Fully implemented frontend and backend
  - GST Settings (default GST percentage, calculation method)
  - Invoice Settings (prefix, business name, address, contact info, footer text, other text)
  - Thermal Printer Settings (printer name, IP, port, paper width, enabled status)
- ✅ **Backend APIs**: RestaurantSettingsController with full CRUD operations
- ✅ **Data Storage**: Uses `settings` table with groups: 'GST Settings', 'Invoice Settings', 'Thermal Printer'
- ✅ **Permissions**: `view_restaurant_settings`, `edit_restaurant_settings` added and seeded
- ✅ **Food Categories Backend**: Full CRUD APIs implemented (migration, model, controller, requests, resources)
- ✅ **Food Items Backend**: Full CRUD APIs implemented (migration, model, controller, requests, resources)
- ✅ **Menu Management Frontend**: Unified page for managing categories and items with hierarchical display, compact table layout, search/filter, image upload, and item reordering
- ✅ **Image Upload**: Food items support optional image upload with default placeholder, images preserved when updating other fields
- ✅ **Item Reordering**: Up/down buttons to reorder items within categories using display_order
- ✅ **Section-Specific Validation**: Form validation only validates the section being saved
- ✅ **Data Population**: Fixed API response transformation to correctly populate form fields

### Version 2.3.0 - Table Management Implementation
- ✅ **Table Management Module**: Fully implemented frontend and backend
  - Table list with statistics cards (Total, Available, Occupied, Active)
  - CRUD operations (Create, Read, Update, Delete)
  - Status management (Available, Occupied, Reserved, Cleaning, Maintenance)
  - Active/Inactive toggle
  - Capacity management (1-50 seats)
  - Server-side pagination, filtering, and searching
  - Default page size: 25
- ✅ **Backend APIs**: TableController with full CRUD operations
- ✅ **Database**: `tables` table with table_number, table_name, capacity, status, is_active fields
- ✅ **Permissions**: `view_table`, `create_table`, `edit_table`, `delete_table` added and seeded
- ✅ **Table Seeder**: Created TableSeeder with 15 sample table records
- ✅ **Frontend Components**: TablesList.jsx and TableForm.jsx fully implemented
- ✅ **API Response**: Returns all records in data field with pagination metadata in meta
- ✅ **Permission Mapping**: Added table permission aliases to authService.js

### Version 2.4.0 - Customer Management Implementation
- ✅ **Customer Management Module**: Fully implemented frontend and backend
  - Customer list with server-side pagination, filtering, searching, and sorting
  - Default sort: Name (ascending)
  - Default page size: 25 items
  - CRUD operations (Create, Read, Update, Delete)
  - Customer type management (Regular, Credit/Udhar)
  - Status management (Active, Inactive)
  - Address column combining Address + City
  - Customer code auto-generation (#CUST001 format)
  - Search by name, customer code, mobile, email
  - Filter by customer type and status
- ✅ **Backend APIs**: CustomerController with full CRUD operations
- ✅ **Database**: `customers` table with customer_code, name, mobile, email, address, city, state, pincode, customer_type, status, notes fields
- ✅ **Permissions**: `view_customer`, `create_customer`, `edit_customer`, `delete_customer` added and seeded
- ✅ **Customer Seeder**: Created CustomerSeeder with 10 sample customer records
- ✅ **Frontend Components**: CustomersList.jsx and CustomerForm.jsx fully implemented
- ✅ **Form Layout**: Customer Type field moved to first position, proper column sizing for address fields
- ✅ **API Response**: Standardized `{ success, data, meta }` format with camelCase transformation

### Version 2.6.0 - POS Panel Payment Processing Implementation
- ✅ **POS Panel Payment Processing**: Fully implemented with backend API integration
  - Bill creation/update APIs integrated (POST/PUT `/api/bills`)
  - Payment processing API integrated (POST `/api/bills/{id}/process-payment`)
  - Bill number auto-generation: `#BILL{ID}` format
  - Event-based auto-save: Saves draft when cart changes (1-second debounce)
  - Manual save draft functionality
  - Print bill functionality (print-friendly HTML template)
  - Payment confirmation dialog before processing
  - Payment success dialog with bill details
  - Sound notifications: Success sound for successful payment, error sound for failures
- ✅ **Payment Processing Logic**:
  - Cash/UPI/Card: Updates bill status to 'paid', no wallet transaction
  - Wallet: Creates wallet transaction (debit) and marks bill as 'paid'
  - Bill status and payment_status both set to 'paid' for wallet payments
- ✅ **Table Status Management**: Automatic table status updates
  - Table set to 'occupied' when bill created (draft/pending)
  - Table set to 'available' when payment processed (if no other active bills)
  - Table status updates on bill update/delete
- ✅ **Customer Financial Data Refactoring**:
  - Removed calculated fields from customers table (`total_bills`, `total_amount`, `paid_amount`, `remaining_amount`)
  - Added accessors: `totalCredits`, `totalDebits`, `remaining` (calculated from wallet transactions)
  - Customer list updated: Shows Credits/Debits and Remaining Amount from wallet transactions
  - Customer type displayed as badge with customer name
- ✅ **Customer Ledger Modal Enhancements**:
  - Fixed summary card heights (equal height using flexbox)
  - Added Export Ledger button (API pending)
  - Fixed transaction type visibility when payment_method is null
- ✅ **Bill Number Generation**: Changed to `#BILL{ID}` format (e.g., #BILL10)
- ✅ **POS Header Enhancement**: Displays bill_number, total amount, and selected customer info dynamically

### Version 2.5.0 - Customer Ledger Modal Implementation
- ✅ **Customer Ledger Modal**: Quick view modal for customer transaction history (replaces full page view)
  - Accessible via "View Ledger" button in customer list actions
  - Large modal view (95vw width) using global `.modal-xl-large` class
  - Simplified filters: Search and Transaction Type (Credit/Debit) only
  - Summary cards: Total Debit, Total Credit, Remaining Amount (calculated from backend)
  - Color-coded transaction amounts: Green for Credit, Red for Debit
  - Restricted outside clicks: Modal can only be closed via close button (`backdrop="static"`, `keyboard={false}`)
  - Full CRUD operations for wallet transactions within modal
  - Backend calculates totals from all transactions (not just paginated ones)
  - **Removed**: Full page Customer Ledger view (`CustomerLedger.jsx`) - consolidated into modal for better UX
- ✅ **Global Modal Class**: Created reusable `.modal-xl-large` class in `src/scss/style.scss`
  - 95vw width on desktop, 90vw on larger screens
  - Fullscreen on mobile/tablet (`fullscreen="lg-down"`)
  - Proper height management and flex layout
  - Can be reused across the application for any large modal needs
- ✅ **Backend Enhancement**: WalletTransactionController@getByCustomer now includes totals calculation
  - `totalDebit`: Sum of all debit transactions for customer
  - `totalCredit`: Sum of all credit transactions for customer
  - `remainingAmount`: Debit - Credit (amount customer owes)
  - Totals calculated from all transactions regardless of filters/pagination
- ✅ **Frontend Components**: CustomerLedgerModal.jsx and WalletTransactionForm.jsx fully implemented
- ✅ **Transaction Type Definitions**: 
  - Credit = Customer pays money OR Hotel refunds
  - Debit = Customer owes money (bills/usage)

### Previous Updates
- ✅ System cleanup: Removed Order Management, Customer Management, Package Management, Transaction Management, and Company Health Report modules
- ✅ Dashboard simplified to empty placeholder (ready for future implementation)
- ✅ Financial Management module retained (Income & Expense transactions)
- ✅ Payment Management module retained
- ✅ Report Management structure retained (Branch, Ledger, Sales, Staff reports)
- ✅ All core infrastructure preserved (Auth, Users, Roles, Permissions, Settings, Financial)
- ✅ Special Permissions system added with 9 special permissions (export, import, bulk operations, audit logs, backups, maintenance, etc.)
- ✅ Permission system updated: Create/Edit/Delete permissions now checked independently (no shared alias fallback)
