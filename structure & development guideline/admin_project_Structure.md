# Hotel Management App - Admin Frontend Project Structure & Development Guidelines

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Complete Project Structure](#complete-project-structure)
3. [Technology Stack](#technology-stack)
4. [Module Overview](#module-overview)
5. [Development Guidelines](#development-guidelines)
6. [Component Rules](#component-rules)
7. [Common Components Usage](#common-components-usage)
8. [Important Notes](#important-notes)

---

## 📱 Project Overview

**Hotel Management App Admin** is a modern React-based admin dashboard for managing hotel operations.

### Key Features
- 🎨 Modern UI with React Bootstrap and CoreUI
- 🌓 Dark/Light theme support
- 🔐 Role-based access control (RBAC)
- 📊 Dashboard with analytics
- 📄 PDF export functionality
- 🔄 Real-time data updates
- 📱 Responsive design
- 🎯 Permission-based navigation
- 🏢 Multi-module architecture (Restaurant, Hotel Room, Banquet Hall, Common)

---

## 📁 Complete Project Structure

```
admin/
├── 📁 public/                          # Static assets
│   ├── favicon.ico
│   ├── manifest.json
│   └── vite.svg
│
├── 📁 src/
│   ├── 📁 assets/                      # Static assets
│   │   ├── 📁 brand/                   # Brand assets
│   │   │   ├── logo.jsx
│   │   │   └── sygnet.jsx
│   │   ├── 📁 images/                   # Image assets
│   │   │   ├── 📁 avatars/
│   │   │   ├── angular.jpg
│   │   │   ├── components.webp
│   │   │   ├── icons.webp
│   │   │   ├── react.jpg
│   │   │   └── vue.jpg
│   │   ├── 📁 logo/
│   │   │   └── logo-transprant.png
│   │   ├── login-background.png
│   │   └── react.svg
│   │
│   ├── 📁 components/                  # Reusable components
│   │   ├── 📁 common/                  # Common/shared components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── FormFields.jsx          # Form input components
│   │   │   ├── FormModal.jsx           # Modal wrapper for forms
│   │   │   ├── GlobalSpinner.jsx
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── Modal.jsx               # Reusable modal component
│   │   │   ├── ScrollToTop.jsx
│   │   │   ├── StepIndicator.jsx
│   │   │   ├── Table.jsx               # Advanced data table
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── ToastProvider.jsx       # Toast notifications
│   │   │
│   │   ├── 📁 layout/                  # Layout components
│   │   │   ├── AppBreadcrumb.jsx
│   │   │   ├── AppContent.jsx
│   │   │   ├── AppFooter.jsx
│   │   │   ├── AppHeader.jsx
│   │   │   ├── AppHorizontalNav.jsx
│   │   │   ├── AppSidebar.jsx
│   │   │   ├── AppSidebarNav.jsx
│   │   │   ├── ModuleSwitcher.jsx      # Module switcher dropdown
│   │   │   ├── PermissionRoute.jsx
│   │   │   └── 📁 header/
│   │   │       ├── AppHeaderDropdown.jsx
│   │   │       └── index.jsx
│   │   │
│   │   └── 📁 pages/                   # Page-specific components
│   │       ├── 📁 branches/
│   │       │   └── BranchForm.jsx
│   │       ├── 📁 customers/
│   │       │   ├── CustomerForm.jsx
│   │       │   ├── CustomerLedgerModal.jsx
│   │       │   └── WalletTransactionForm.jsx
│   │       ├── 📁 payments/
│   │       │   ├── PaymentDetailsModal.jsx
│   │       │   └── PaymentForm.jsx
│   │       ├── 📁 pos/
│   │       │   ├── BillingCartPanel.jsx
│   │       │   ├── BillViewModal.jsx
│   │       │   ├── ProductsPanel.jsx
│   │       │   └── TablesPanel.jsx
│   │       ├── 📁 restaurant/
│   │       │   ├── CategoryForm.jsx
│   │       │   ├── ItemForm.jsx
│   │       │   └── TableForm.jsx
│   │       ├── 📁 roles/
│   │       │   └── RoleForm.jsx
│   │       ├── 📁 staff/
│   │       │   ├── SalaryPaymentModal.jsx
│   │       │   ├── SalaryReportModal.jsx
│   │       │   └── StaffForm.jsx
│   │       ├── 📁 expenses/
│   │       │   ├── ExpenseForm.jsx
│   │       │   └── ExpenseCategoryModal.jsx
│   │       ├── 📁 hotel-room/
│   │       │   ├── RoomCategoryForm.jsx
│   │       │   ├── RoomForm.jsx
│   │       │   └── AddonServiceForm.jsx
│   │       └── 📁 users/
│   │           ├── 📁 __tests__/
│   │           │   └── ProfileForm.test.js
│   │           ├── AddressSection.jsx
│   │           ├── PersonalInfoSection.jsx
│   │           ├── ProfileForm.jsx
│   │           ├── ProfilePictureSection.jsx
│   │           └── UserForm.jsx
│   │
│   ├── 📁 services/                    # API service layer
│   │   ├── authService.js
│   │   ├── billService.js
│   │   ├── branchService.js
│   │   ├── customerService.js
│   │   ├── dashboardService.js
│   │   ├── menuService.js
│   │   ├── paymentService.js
│   │   ├── permissionService.js
│   │   ├── profileService.js
│   │   ├── README.md
│   │   ├── reportService.js
│   │   ├── restaurantSettingsService.js
│   │   ├── roleService.js
│   │   ├── roomService.js
│   │   ├── roomSettingsService.js
│   │   ├── addonService.js
│   │   ├── settingsService.js
│   │   ├── staffService.js
│   │   ├── tableService.js
│   │   ├── userService.js
│   │   ├── walletTransactionService.js
│   │   └── expenseService.js
│   │
│   ├── 📁 views/                       # Main view components
│   │   ├── 📁 branches/
│   │   │   └── BranchesList.jsx
│   │   ├── 📁 customers/
│   │   │   └── CustomersList.jsx
│   │   ├── 📁 dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   └── MainChart.jsx
│   │   ├── 📁 payments/
│   │   │   ├── PaymentFormView.jsx
│   │   │   └── PaymentsList.jsx
│   │   ├── 📁 pos/
│   │   │   ├── BillsList.jsx
│   │   │   └── POSPanel.jsx
│   │   ├── 📁 reports/
│   │   │   ├── BranchReport.jsx
│   │   │   ├── CustomerPendingReport.jsx
│   │   │   ├── ExpenseReport.jsx
│   │   │   ├── LedgerReport.jsx
│   │   │   ├── SalesReport.jsx
│   │   │   └── StaffReport.jsx
│   │   ├── 📁 restaurant/
│   │   │   ├── MenuManagement.jsx
│   │   │   ├── TablesList.jsx
│   │   │   └── 📁 settings/
│   │   │       └── RestaurantSettings.jsx
│   │   ├── 📁 hotel-room/
│   │   │   ├── RoomCategoriesList.jsx
│   │   │   ├── RoomsList.jsx
│   │   │   ├── AddonServicesList.jsx
│   │   │   └── 📁 settings/
│   │   │       └── RoomSettings.jsx
│   │   ├── 📁 roles/
│   │   │   └── RolesList.jsx
│   │   ├── 📁 settings/
│   │   │   └── Settings.jsx
│   │   ├── 📁 staff/
│   │   │   └── StaffList.jsx
│   │   ├── 📁 expenses/
│   │   │   └── ExpensesList.jsx
│   │   └── 📁 users/
│   │       ├── Profile.jsx
│   │       └── UsersList.jsx
│   │
│   ├── 📁 constants/                  # Application constants
│   │   ├── api.js
│   │   ├── app.js
│   │   └── permissions.js
│   │
│   ├── 📁 context/                     # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── ModuleContext.jsx           # Multi-module navigation context
│   │
│   ├── 📁 hooks/                       # Custom React hooks
│   │   ├── index.jsx
│   │   └── README.md
│   │
│   ├── 📁 layout/                      # Layout components
│   │   ├── DefaultLayout.jsx
│   │   └── PrivateRoute.jsx
│   │
│   ├── 📁 pages/                       # Page components
│   │   └── 📁 Auth/
│   │       ├── ForgotPassword.jsx
│   │       ├── Login.jsx
│   │       └── ResetPassword.jsx
│   │
│   ├── 📁 scss/                        # SCSS stylesheets
│   │   ├── examples.scss
│   │   ├── style.scss
│   │   └── 📁 vendors/
│   │       └── simplebar.scss
│   │
│   ├── 📁 styles/                      # Additional styles
│   │   └── auth.css
│   │
│   ├── 📁 utils/                       # Utility functions
│   │   ├── errorHandler.js
│   │   ├── pdfExport.js
│   │   └── responseHandler.js
│   │
│   ├── 📁 config/                      # Configuration files
│   │   ├── apiClient.js
│   │   └── config.js
│   │
│   ├── _nav.jsx                        # Navigation configuration
│   ├── api.js                          # Mock API service setup
│   ├── App.css                         # Main app styles
│   ├── App.jsx                         # Main app component
│   ├── config.js                       # App configuration
│   ├── main.jsx                        # App entry point
│   ├── routes.jsx                      # Route definitions
│   ├── routesConfig.jsx                # Route configuration
│   ├── store.jsx                       # Redux store configuration
│   └── utils.js                        # Utility functions
│
├── 📁 styles/                          # Global styles
│   └── theme.css
│
├── env.example                         # Environment variables example
├── eslint.config.js                    # ESLint configuration
├── index.html                          # HTML template
├── package.json                        # Dependencies and scripts
├── package-lock.json                   # Dependency lock file
├── README.md                           # Project documentation
└── vite.config.js                      # Vite build configuration
```

---

## 🛠️ Technology Stack

### Core Technologies
- **React 19.1.1** - UI library
- **Vite 7.1.12** - Build tool
- **React Router DOM 7.7.1** - Client-side routing

### UI Frameworks
- **React Bootstrap 2.10.10** - Primary UI component library
- **CoreUI React 5.7.1** - Navigation components
- **Bootstrap 5.3.8** - CSS framework
- **FontAwesome 7.1.0** - Icon library

### State Management
- **Redux 5.0.1** - State management
- **React Context** - Authentication and theme context

### HTTP & API
- **Axios 1.12.2** - HTTP client

---

## 📦 Module Overview

### Multi-Module Architecture
The application supports multiple business modules:
- **Restaurant Module**: Restaurant management, POS, bills, menu, tables
- **Hotel Room Module**: Room management, bookings, check-in/check-out (Planned)
- **Banquet Hall Module**: Hall management, bookings (Planned)
- **Common Modules**: Customers, Staff, Expenses, Users, Settings (shared across all modules)

**Module Navigation:**
- Module switching via `ModuleContext` and `ModuleSwitcher` component
- Module-specific navigation menus in `_nav.jsx`
- Module-based routing (e.g., `/restaurant/dashboard`, `/hotel-room/dashboard`)
- Active module persisted in `localStorage`

### 1. **Authentication Module**
- **Location**: `src/pages/Auth/`, `src/services/authService.js`
- **Status**: ✅ Fully implemented

### 2. **Dashboard Module**
- **Location**: `src/views/dashboard/`
- **Status**: ⏳ Empty placeholder (Module-specific dashboards planned)

### 3. **Branch Management**
- **Location**: `src/views/branches/`
- **Status**: ✅ Fully implemented

### 4. **Payment Management**
- **Location**: `src/views/payments/`
- **Status**: ✅ Fully implemented

### 5. **User Management**
- **Location**: `src/views/users/`
- **Status**: ✅ Fully implemented

### 6. **Role & Permission Management**
- **Location**: `src/views/roles/`
- **Status**: ✅ Fully implemented

### 7. **Settings Management**
- **Location**: `src/views/settings/`
- **Status**: ✅ Fully implemented

### 8. **Restaurant Management**
- **Location**: `src/views/restaurant/`
- **Features**: Menu Management (with PDF & Excel export), Table Management (with PDF export), Restaurant Settings
- **Status**: ✅ Fully implemented

### 9. **Customer Management**
- **Location**: `src/views/customers/`
- **Status**: ✅ Fully implemented
- **Note**: Unified customer system - serves all modules (Restaurant, Hotel Room, Banquet Hall)

### 10. **Staff Management**
- **Location**: `src/views/staff/`
- **Status**: ✅ Fully implemented

### 11. **POS Panel**
- **Location**: `src/views/pos/`
- **Status**: ✅ Fully implemented

### 12. **Bills Management**
- **Location**: `src/views/pos/BillsList.jsx`
- **Status**: ✅ Fully implemented

### 13. **Expense Management**
- **Location**: `src/views/expenses/ExpensesList.jsx`
- **Components**: `src/components/pages/expenses/ExpenseForm.jsx`, `src/components/pages/expenses/ExpenseCategoryModal.jsx`
- **Service**: `src/services/expenseService.js`
- **Status**: ✅ Fully implemented

### 14. **Room Category Management**
- **Location**: `src/views/hotel-room/RoomCategoriesList.jsx`
- **Components**: `src/components/pages/hotel-room/RoomCategoryForm.jsx`
- **Service**: `src/services/roomService.js`
- **Status**: ✅ Fully implemented

### 15. **Rooms Management**
- **Location**: `src/views/hotel-room/RoomsList.jsx`
- **Components**: `src/components/pages/hotel-room/RoomForm.jsx`
- **Service**: `src/services/roomService.js`
- **Features**: Room CRUD, PDF export, search, filter (status, category, floor, active)
- **Status**: ✅ Fully implemented

### 16. **Room Addon Services**
- **Location**: `src/views/hotel-room/AddonServicesList.jsx`
- **Components**: `src/components/pages/hotel-room/AddonServiceForm.jsx`
- **Service**: `src/services/addonService.js`
- **Features**: Addon service CRUD (Service Name, Charge, Status), used in room billing (e.g., Extra Bed, Laundry)
- **Status**: ✅ Fully implemented

### 17. **Room Settings**
- **Location**: `src/views/hotel-room/settings/RoomSettings.jsx`
- **Service**: `src/services/roomSettingsService.js`
- **Features**: Check-In/Check-Out times, Room GST, Room Invoice settings
- **Status**: ✅ Fully implemented

### 18. **Reports Module**
- **Location**: `src/views/reports/`
- **Service**: `src/services/reportService.js`
- **Status**: ✅ Fully implemented
  - ✅ Sales Report (`SalesReport.jsx`)
  - ✅ Expense Report (`ExpenseReport.jsx`)
  - ✅ Customer Pending Report (`CustomerPendingReport.jsx`)
  - ✅ Staff & Salary Report (`StaffSalaryReport.jsx`)
  - ✅ Category-wise Item Sales Report (`CategoryWiseItemReport.jsx`)
- **Features**:
  - ✅ Date range filtering
  - ✅ Multiple filter options (payment status, payment method, table, customer, category, status, month, year, staff, department)
  - ✅ Summary cards with key metrics
  - ✅ Detailed data tables with sorting
  - ✅ PDF Export (all reports - compact format with business information)
  - ✅ CSV Export (all reports - UTF-8 encoding with proper formatting)

---

## 🎯 Development Guidelines

### Component Organization Rules

#### 1. **Component Location Rules**
- **Common Components**: `src/components/common/`
- **Page-Specific Components**: `src/components/pages/[feature]/`
- **Layout Components**: `src/components/layout/`
- **View Components**: `src/views/[feature]/`

#### 2. **Component Naming Rules**
- Use **PascalCase** for component names
- Use **suffixes** for clarity:
  - `Form.jsx` - Form components
  - `List.jsx` - List/table components
  - `Modal.jsx` - Modal components

### UI/UX Rules

#### 1. **UI Framework Rules**
- **Primary Framework**: React Bootstrap (for main content)
- **Icon Library**: FontAwesome (free solid icons)
- **Theme**: Elegant Teal color scheme (#0d9488)
- **Navigation**: Horizontal top navigation bar

#### 2. **Style & Theme Guidelines**

**Theme Colors:**
- **Primary Color**: `#0d9488` (Elegant Teal - Teal-600)
- **Success Color**: `#059669` (Emerald-600)
- **Info Color**: `#0284c7` (Sky-600)
- **Warning Color**: `#d97706` (Amber-600)
- **Danger Color**: `#dc2626` (Red-600)

**Light Theme:**
- Background: `#ffffff` (white)
- Secondary Background: `#f0fdfa` (teal-50)
- Text Primary: `#1f2937` (gray-800)
- Text Secondary: `#6b7280` (gray-500)
- Border: `#e5e7eb` (gray-200)

**Dark Theme:**
- Background: `#1f2937` (gray-800)
- Secondary Background: `#374151` (gray-700)
- Text Primary: `#f9fafb` (gray-50)
- Text Secondary: `#d1d5db` (gray-300)
- Border: `#4b5563` (gray-600)

**Theme-Aware CSS Pattern:**
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

**Common CSS Classes:**
- `.text-theme` - Primary theme color text
- `.bg-theme` - Primary theme color background
- `.border-theme` - Primary theme color border
- `.btn-theme` - Theme-colored button

**Spacing Guidelines:**
- Use Bootstrap spacing utilities: `mb-3`, `mt-4`, `p-3`, etc.
- Consistent padding: `p-4` for cards/containers
- Consistent margins: `mb-4` for sections, `mb-3` for form fields

**Typography:**
- Headings: Use Bootstrap heading classes (`h1`, `h2`, `h3`, etc.)
- Body text: Default Bootstrap font size
- Font weight: `fw-semibold` for labels, `fw-bold` for headings

**Component Styling:**
- Cards: `bg-white rounded-3 shadow-sm p-4`
- Buttons: Use Bootstrap variants (`primary`, `success`, `danger`, etc.)
- Borders: `border-2` for form inputs, `border-bottom` for section dividers
- Shadows: `shadow-sm` for cards, no shadow for flat elements

**Theme Toggle:**
- Use `ThemeToggle` component for switching between light/dark themes
- Theme state managed in Redux store with localStorage persistence
- CoreUI integration via `useColorModes` hook

**Using Global Theme Variables:**
Always use CSS variables for theme-aware styling:
```css
/* Use CoreUI variables */
background-color: var(--cui-primary);
color: var(--cui-body-color);
border-color: var(--cui-border-color);

/* Theme-aware backgrounds */
background-color: var(--cui-tertiary-bg);  /* Light: #f0fdfa, Dark: #374151 */
```

**Global CSS Classes:**
Use predefined global classes instead of custom styles:
- `.text-theme` - Primary theme color text (#0d9488)
- `.bg-theme` - Primary theme color background
- `.border-theme` - Primary theme color border
- `.btn-theme` - Theme-colored button
- `.modal-xl-large` - Extra-large modal (95vw width, fullscreen on mobile)
- `.dashboard-page` - Dashboard page container with gradient background

**When to Use Custom Styles:**
- ✅ **Use Custom Styles For:**
  - Component-specific layouts that can't be achieved with Bootstrap
  - Complex animations or transitions
  - Unique design requirements not covered by theme
  - Page-specific styling (e.g., dashboard gradients)

- ❌ **Don't Use Custom Styles For:**
  - Standard spacing (use Bootstrap: `mb-3`, `p-4`, etc.)
  - Standard colors (use theme variables or Bootstrap classes)
  - Standard buttons (use Bootstrap button variants)
  - Standard forms (use FormFields components)
  - Standard modals (use Bootstrap Modal with global classes)

**Custom Style Guidelines:**
```css
/* ✅ Good: Theme-aware custom style */
.custom-component {
  background: var(--cui-body-bg);
  color: var(--cui-body-color);
  border: 1px solid var(--cui-border-color);
}

/* ✅ Good: Using global theme class */
<div className="text-theme">Theme colored text</div>

/* ❌ Bad: Hardcoded colors */
.custom-component {
  background: #ffffff;  /* Not theme-aware */
  color: #000000;
}

/* ✅ Good: Extending global class */
.modal-xl-large .custom-content {
  padding: 2rem;
}
```

**File Organization:**
- **Global Styles**: `src/scss/style.scss` - Theme variables, global classes
- **Component Styles**: Inline styles or component-specific CSS files
- **Page Styles**: Page-specific styles in `style.scss` with page class prefix

#### 3. **Form Structure Pattern**
**Always use FormFields components:**
```jsx
import { TextField, SelectField, TextAreaField, FormRow } from '../../components/common/FormFields'

<FormRow>
  <TextField
    id="field"
    label="Field Label"
    value={value}
    onChange={handleChange}
    required
    invalid={!!errors.field}
    feedback={errors.field}
    col={6}
  />
  <SelectField
    id="status"
    label="Status"
    value={status}
    onChange={handleChange}
    options={[...]}
    col={6}
  />
</FormRow>
```

**Important Rules:**
- ✅ Always use FormFields components (`TextField`, `SelectField`, `TextAreaField`, `FormRow`)
- ❌ Never use direct `Form.Control` or `FormSelect` in forms

#### 4. **Modal Structure Pattern**
```jsx
// Standard Modal
<Modal show={visible} onHide={onClose} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Modal Title</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* Content */}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    <Button variant="primary" onClick={onConfirm}>Confirm</Button>
  </Modal.Footer>
</Modal>

// Large Modal (use react-bootstrap Modal, not custom Modal)
<Modal show={visible} onHide={onClose} size="xl" fullscreen="lg-down">
  {/* Content */}
</Modal>
```

**Important:** Use `react-bootstrap` Modal for all modals, not the custom `Modal.jsx` component.

#### 5. **Table Component Usage**
```jsx
import { Table } from '../components'

<Table
  columns={columns}
  data={data}
  loading={loading}
  pagination={true}
  meta={meta}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  sortable={true}
  sortableColumns={['name', 'email']}
  onSortChange={handleSortChange}
/>
```

### State Management Rules

#### 1. **State Management Strategy**
- **Local State**: Use `useState` for component-specific state
- **Global State**: Use Redux for application-wide state (sidebar, theme)
- **Context**: Use React Context for auth, theme, and active module (`ModuleContext`)
- **Server State**: Use custom hooks for API calls

#### 2. **State Naming Rules**
- Use **camelCase** for state variables
- Use **boolean prefixes**: `is`, `has`, `can`, `should`
- Use **array suffixes**: `List`, `Items`, `Data`

### API Service Rules

#### 1. **Service Organization**
- **One service per feature** (e.g., `userService.js`)
- **Consistent naming** for service methods
- **Error handling** in all service methods

#### 2. **Service Method Naming**
```javascript
const userService = {
  getUsers: () => {},           // GET /users
  getUserById: (id) => {},     // GET /users/:id
  createUser: (data) => {},     // POST /users
  updateUser: (id, data) => {}, // PUT /users/:id
  deleteUser: (id) => {},       // DELETE /users/:id
}
```

#### 3. **Response Format**
```javascript
{
  success: true,
  data: [...],
  meta: {
    total: 100,
    page: 1,
    limit: 20,
    totalPages: 5,
    hasNext: true,
    hasPrev: false
  }
}
```

### Routing & Navigation

#### 1. **Route Configuration**
- **Lazy loading** for all routes
- **Protected routes** using `PrivateRoute`
- **Permission-based routes** using `PermissionRoute`

#### 2. **Navigation Structure**
- **Module-based navigation** in `_nav.jsx` (Restaurant, Hotel Room, Banquet Hall, Common)
- **Dynamic navigation** based on active module from `ModuleContext`
- **Module switcher** in header (`ModuleSwitcher` component)
- **Multi-level dropdowns** support
- **Permission-based visibility** using `PERMISSIONS` constants
- **Module-prefixed routes** (e.g., `/restaurant/dashboard`, `/hotel-room/rooms`)

### Authentication & Authorization

#### 1. **Authentication Flow**
- **JWT tokens** stored in `localStorage`
- **Token refresh** mechanism
- **Protected routes** for sensitive pages

#### 2. **Permission System**
- **Permission constants** in `constants/permissions.js`
- **Module-based permissions** organized by module (Restaurant, Hotel Room, Banquet Hall, Common)
- **Permission checks** in components and routes
- **Standard Permissions**: Pattern `{action}_{resource}` (e.g., `view_user`, `create_branch`)
- **Special Permissions**: Start with `special_` prefix
- **Permission UI**: Grouped by module and submodule in `RoleForm.jsx` with search and bulk selection

---

## 🧩 Component Rules

### Common Components

#### FormFields Components
- **TextField**: Text input with validation feedback
- **SelectField**: Dropdown select with validation
- **TextAreaField**: Multi-line text input
- **FormRow**: Wrapper for form fields with column layout

#### Table Component
- **Server-side pagination**: Use `pagination={true}`, `meta={meta}`
- **Sorting**: Use `sortable={true}`, `sortableColumns={[...]}`
- **Loading state**: Use `loading={loading}`

#### Modal Components
- **Use react-bootstrap Modal**: Import from `react-bootstrap`, not custom Modal
- **Props**: `show`, `onHide`, `size`, `fullscreen`
- **Large modals**: Use `size="xl"` and `fullscreen="lg-down"`

---

## ⚠️ Important Notes

### Form Development
- ✅ Always use `FormFields` components for all form inputs
- ✅ Use `FormRow` for proper column layout
- ❌ Never use direct `Form.Control` or `FormSelect`

### Modal Development
- ✅ Use `react-bootstrap` Modal (import from `react-bootstrap`)
- ✅ Use `show` and `onHide` props
- ❌ Don't use custom `Modal.jsx` component (it has different API)

### Table Development
- ✅ Use `Table` component from `components/common/Table.jsx`
- ✅ Always provide `meta` object for pagination
- ✅ Set `sortable={false}` if sorting not needed

### API Integration
- ✅ All API calls through service layer
- ✅ Handle errors gracefully with user-friendly messages
- ✅ Use loading states for async operations

### State Management
- ✅ Use `useState` for local component state
- ✅ Use Redux for global state (theme, sidebar)
- ✅ Use Context for authentication

### Pagination
- ✅ Default page size: 25 items
- ✅ Server-side pagination for all lists
- ✅ Use `PaginatesResults` trait pattern on backend

### Code Quality
- ✅ Functional components only
- ✅ Use hooks for state and lifecycle
- ✅ Consistent indentation (2 spaces)
- ✅ Meaningful variable names

---

**Last Updated**: February 2025  
**Version**: 3.1.0  
**Multi-Module Support**: ✅ Implemented
