# Hotel Management Web App - Project Planning & Migration Guide

**Project**: Hotel Management App – Restaurant & Room Management (Web-App)  
**Base Project**: Photo Studio Management  
**Created**: January 2025  
**Status**: Planning Phase

---

## 📋 Table of Contents

1. [Scope Review](#scope-review)
2. [Project Cleanup Plan](#project-cleanup-plan)
3. [Migration Tracking](#migration-tracking)
4. [Database Schema Changes](#database-schema-changes)
5. [Module Mapping](#module-mapping)
6. [Development Phases](#development-phases)

---

## 🎯 Scope Review

### Phase 1: Restaurant Management (MVP)

#### ✅ Core Modules Required

1. **User & Access Management** ✅ (Keep from base)
   - Login / Logout
   - Role-based access: Admin, Manager, Cashier
   - **Status**: Reuse existing auth system

2. **Restaurant & Settings** ✅ (Modify from base)
   - Restaurant profile Settings
   - Invoice Settings
   - Default GST settings
   - Thermal printer settings (80mm)
   - **Status**: Modify existing Settings module

3. **Food & Menu Management** ❌ (New)
   - Food Categories (Create/Edit/Disable, Display order)
   - Food Items (Name, Category, Price, GST %, Veg/Non-Veg, Active/Inactive)
   - **Status**: New module - similar to Packages but different structure

4. **Table Management (Dine-In)** ❌ (New)
   - Create tables (T1, T2, Family Table, etc.)
   - Table capacity
   - Active/Inactive
   - Table status: Available/Occupied
   - Multiple bills allowed per table
   - **Status**: Completely new module

5. **Customer Management** ✅ (Modify from base)
   - Walk-in customers (default, no record)
   - Registered customers
   - Customer types: Regular, Credit (Udhar)
   - Customer profile: Name, Mobile, Address
   - **Status**: Modify existing Customer module

6. **Billing / POS Module** ⚠️ (Major Modification)
   - Create bill with or without table
   - Add multiple items
   - Quantity support
   - Automatic calculation
   - Payment Handling: Cash, UPI, Card, Split payment, Partial payment
   - Udhar / Pending Bills (Customer ledger)
   - GST-compliant invoice (CGST/SGST breakup)
   - Thermal printer output
   - **Status**: Major modification of Orders/Payments modules

7. **Staff & Salary Management** ❌ (New)
   - Staff Master (Staff ID, Name, Mobile, Department, Salary Type, Salary Amount, Joining Date, Status)
   - Salary Records (Salary ID, Staff ID, Month & Year, Payable Amount, Paid Amount, Payment Date, Payment Mode, Notes)
   - **Status**: New module

8. **Expense Management Module** ✅ (Keep from base)
   - Expense Category Management
   - Expense Records
   - **Status**: Reuse Financial Categories & Transactions (expense type only)

9. **Reports** ✅ (Modify from base)
   - Sales report (Daily, Monthly, Year)
   - Expenses report (Daily, Monthly, Year)
   - GST Summary Report
   - Customer Pending (Udhar) Report
   - Customer Details - Ledger Report
   - Staff and salary report
   - Business Financial Dashboard
   - **Status**: Modify existing Reports module

### Phase 2: Room Management (Future)

**Note**: Phase 2 will be implemented after Phase 1 completion. Planning document will be created separately.

---

## 🧹 Project Cleanup Plan

### ✅ KEEP (Reusable Components)

#### Frontend (`admin/`)

**Core Infrastructure:**
- ✅ `src/components/common/` - All common components (Button, Card, FormFields, FormModal, Table, Modal, etc.)
- ✅ `src/components/layout/` - Layout components (AppHeader, AppSidebar, AppFooter, etc.)
- ✅ `src/pages/Auth/` - Authentication pages (Login, ForgotPassword, ResetPassword)
- ✅ `src/context/AuthContext.jsx` - Authentication context
- ✅ `src/config/` - Configuration files (apiClient, config)
- ✅ `src/utils/` - Utility functions (errorHandler, responseHandler, pdfExport)
- ✅ `src/hooks/` - Custom React hooks
- ✅ `src/layout/` - Layout wrappers (DefaultLayout, PrivateRoute)
- ✅ `src/constants/` - Constants (api, app, permissions)
- ✅ `src/services/authService.js` - Authentication service
- ✅ `src/services/userService.js` - User management service
- ✅ `src/services/roleService.js` - Role management service
- ✅ `src/services/permissionService.js` - Permission service
- ✅ `src/services/settingsService.js` - Settings service (modify for restaurant settings)
- ✅ `src/services/profileService.js` - Profile service
- ✅ `src/views/users/` - User management views
- ✅ `src/views/roles/` - Role management views
- ✅ `src/views/settings/` - Settings views (modify for restaurant)
- ✅ `src/views/dashboard/` - Dashboard (modify for restaurant metrics)
- ✅ `src/views/reports/` - Reports (modify for restaurant reports)
- ✅ `src/views/financial/` - Financial management (reuse for expenses)
- ✅ `src/services/financialService.js` - Financial service (reuse for expenses)
- ✅ `src/services/financialCategoryService.js` - Financial category service (reuse for expense categories)
- ✅ `src/services/reportService.js` - Report service (modify)
- ✅ `src/services/dashboardService.js` - Dashboard service (modify)

**Styling & Assets:**
- ✅ `src/scss/` - SCSS stylesheets
- ✅ `src/styles/` - Additional styles
- ✅ `src/assets/` - Assets (logos, images) - update logos
- ✅ `styles/theme.css` - Theme styles

**Configuration:**
- ✅ `package.json` - Dependencies (keep all)
- ✅ `vite.config.js` - Vite configuration
- ✅ `eslint.config.js` - ESLint configuration
- ✅ `.env.example` - Environment template

#### Backend (`backend/`)

**Core Infrastructure:**
- ✅ `app/Http/Controllers/AuthController.php` - Authentication
- ✅ `app/Http/Controllers/API/UserController.php` - User management
- ✅ `app/Http/Controllers/API/RoleController.php` - Role management
- ✅ `app/Http/Controllers/API/PermissionController.php` - Permission management
- ✅ `app/Http/Controllers/API/SettingController.php` - Settings (modify for restaurant)
- ✅ `app/Http/Controllers/API/DashboardController.php` - Dashboard (modify)
- ✅ `app/Http/Controllers/API/ReportController.php` - Reports (modify)
- ✅ `app/Http/Controllers/API/FinancialTransactionController.php` - Financial transactions (reuse for expenses)
- ✅ `app/Http/Controllers/API/FinancialCategoryController.php` - Financial categories (reuse for expense categories)
- ✅ `app/Http/Middleware/` - All middleware (Authenticate, CheckPermission, CheckRole, etc.)
- ✅ `app/Http/Requests/` - Request validation classes (reuse pattern)
- ✅ `app/Models/User.php` - User model
- ✅ `app/Models/Role.php` - Role model
- ✅ `app/Models/Permission.php` - Permission model
- ✅ `app/Models/Setting.php` - Setting model
- ✅ `app/Models/FinancialCategory.php` - Financial category model (reuse for expense categories)
- ✅ `app/Models/FinancialTransaction.php` - Financial transaction model (reuse for expenses)
- ✅ `app/Services/EmailService.php` - Email service
- ✅ `app/Services/PdfExportService.php` - PDF export service
- ✅ `app/Http/Controllers/Concerns/PaginatesResults.php` - Pagination trait
- ✅ `config/` - Configuration files
- ✅ `routes/api.php` - API routes (modify)
- ✅ `database/migrations/` - Core migrations (users, roles, permissions, settings, financial_*)
- ✅ `database/seeders/` - Core seeders (Roles, Permissions, Users)

### ⚠️ MODIFY (Adapt for Hotel Management)

#### Frontend

**Settings Module:**
- ⚠️ `src/services/settingsService.js` - Add restaurant-specific settings (GST, thermal printer)
- ⚠️ `src/views/settings/Settings.jsx` - Add restaurant settings sections

**Customer Module:**
- ⚠️ `src/services/customerService.js` - Add customer type (Regular/Credit), Udhar management
- ⚠️ `src/views/customers/CustomersList.jsx` - Add customer type filter, Udhar status
- ⚠️ `src/components/pages/customers/CustomerForm.jsx` - Add customer type field

**Dashboard:**
- ⚠️ `src/services/dashboardService.js` - Modify for restaurant metrics (sales, expenses, GST)
- ⚠️ `src/views/dashboard/Dashboard.jsx` - Restaurant-specific KPIs and charts

**Reports:**
- ⚠️ `src/services/reportService.js` - Add restaurant reports (Sales, GST Summary, Customer Ledger, Staff Salary)
- ⚠️ `src/views/reports/` - Modify existing reports, add new restaurant reports

**Financial (Expenses):**
- ⚠️ `src/services/financialService.js` - Keep only expense-related functionality
- ⚠️ `src/services/financialCategoryService.js` - Keep only expense categories
- ⚠️ `src/views/financial/` - Rename/refactor for expense management

#### Backend

**Settings:**
- ⚠️ `app/Http/Controllers/API/SettingController.php` - Add restaurant settings (GST, thermal printer)
- ⚠️ `database/migrations/` - Add restaurant settings keys

**Customer:**
- ⚠️ `app/Http/Controllers/API/CustomerController.php` - Add customer type, Udhar management
- ⚠️ `app/Models/Customer.php` - Add customer type, Udhar balance fields
- ⚠️ `database/migrations/` - Modify customers table (add customer_type, udhar_balance)

**Dashboard:**
- ⚠️ `app/Http/Controllers/API/DashboardController.php` - Restaurant-specific metrics
- ⚠️ Modify dashboard endpoints for restaurant KPIs

**Reports:**
- ⚠️ `app/Http/Controllers/API/ReportController.php` - Add restaurant reports
- ⚠️ `resources/views/pdfs/` - Add restaurant report templates

**Financial (Expenses):**
- ⚠️ `app/Http/Controllers/API/FinancialTransactionController.php` - Filter to expense type only
- ⚠️ `app/Http/Controllers/API/FinancialCategoryController.php` - Filter to expense categories only
- ⚠️ `app/Models/FinancialCategory.php` - Add scope for expense type
- ⚠️ `app/Models/FinancialTransaction.php` - Add scope for expense type

### ❌ REMOVE (Not Needed for Hotel Management)

#### Frontend

**Photo Studio Specific:**
- ❌ `src/views/branches/` - Remove (restaurant doesn't need branches)
- ❌ `src/services/branchService.js` - Remove
- ❌ `src/components/pages/branches/BranchForm.jsx` - Remove
- ❌ `src/views/packages/` - Remove (replaced by Food Items)
- ❌ `src/services/packageService.js` - Remove
- ❌ `src/components/pages/packages/PackageForm.jsx` - Remove
- ❌ `src/views/orders/` - Remove (replaced by Billing/POS)
- ❌ `src/services/orderService.js` - Remove
- ❌ `src/components/pages/orders/OrderForm.jsx` - Remove
- ❌ `src/views/payments/` - Remove (replaced by Billing/POS payment handling)
- ❌ `src/services/paymentService.js` - Remove (integrate into Billing)
- ❌ `src/components/pages/payments/PaymentForm.jsx` - Remove
- ❌ `src/views/transactions/` - Remove (replaced by Billing transactions)
- ❌ `src/services/transactionService.js` - Remove
- ❌ `src/components/pages/transactions/TransactionForm.jsx` - Remove
- ❌ `src/mock/` - Remove all mock data files (branches, packages, orders, payments, transactions)
- ❌ `src/constants/permissions.js` - Remove photo studio specific permissions (keep core)

#### Backend

**Photo Studio Specific:**
- ❌ `app/Http/Controllers/API/BranchController.php` - Remove
- ❌ `app/Http/Controllers/API/PackageController.php` - Remove
- ❌ `app/Http/Controllers/API/OrderController.php` - Remove (replaced by BillingController)
- ❌ `app/Http/Controllers/API/PaymentController.php` - Remove (integrate into BillingController)
- ❌ `app/Http/Controllers/API/PackageTypeController.php` - Remove
- ❌ `app/Models/Branch.php` - Remove
- ❌ `app/Models/Package.php` - Remove
- ❌ `app/Models/Order.php` - Remove (replaced by Bill model)
- ❌ `app/Models/OrderItem.php` - Remove (replaced by BillItem model)
- ❌ `app/Models/Payment.php` - Remove (integrate into Bill model)
- ❌ `app/Http/Requests/BranchStoreRequest.php` - Remove
- ❌ `app/Http/Requests/BranchUpdateRequest.php` - Remove
- ❌ `app/Http/Requests/PackageStoreRequest.php` - Remove
- ❌ `app/Http/Requests/PackageUpdateRequest.php` - Remove
- ❌ `app/Http/Requests/OrderStoreRequest.php` - Remove
- ❌ `app/Http/Requests/OrderUpdateRequest.php` - Remove
- ❌ `app/Http/Resources/BranchResource.php` - Remove
- ❌ `app/Http/Resources/PackageResource.php` - Remove
- ❌ `app/Http/Resources/OrderResource.php` - Remove
- ❌ `app/Http/Resources/OrderItemResource.php` - Remove
- ❌ `app/Http/Resources/PaymentResource.php` - Remove
- ❌ `database/migrations/` - Remove branches, packages, orders, order_items, payments migrations
- ❌ `database/seeders/BranchSeeder.php` - Remove
- ❌ `routes/api.php` - Remove branch, package, order, payment routes

### 🆕 CREATE (New Modules for Hotel Management)

#### Frontend

**Food & Menu Management:**
- 🆕 `src/services/foodCategoryService.js` - Food category API service
- 🆕 `src/services/foodItemService.js` - Food item API service
- 🆕 `src/views/food-categories/FoodCategoriesList.jsx` - Food categories list view
- 🆕 `src/components/pages/food-categories/FoodCategoryForm.jsx` - Food category form
- 🆕 `src/views/food-items/FoodItemsList.jsx` - Food items list view
- 🆕 `src/components/pages/food-items/FoodItemForm.jsx` - Food item form

**Table Management:**
- 🆕 `src/services/tableService.js` - Table API service
- 🆕 `src/views/tables/TablesList.jsx` - Tables list view
- 🆕 `src/components/pages/tables/TableForm.jsx` - Table form

**Billing / POS:**
- 🆕 `src/services/billingService.js` - Billing/POS API service
- 🆕 `src/views/billing/BillingPOS.jsx` - Main POS interface
- 🆕 `src/components/pages/billing/BillForm.jsx` - Bill creation form
- 🆕 `src/components/pages/billing/PaymentModal.jsx` - Payment handling modal
- 🆕 `src/components/pages/billing/BillDetailsModal.jsx` - Bill details modal

**Staff & Salary:**
- 🆕 `src/services/staffService.js` - Staff API service
- 🆕 `src/services/salaryService.js` - Salary API service
- 🆕 `src/views/staff/StaffList.jsx` - Staff list view
- 🆕 `src/components/pages/staff/StaffForm.jsx` - Staff form
- 🆕 `src/views/salary/SalaryList.jsx` - Salary records list view
- 🆕 `src/components/pages/salary/SalaryForm.jsx` - Salary payment form

#### Backend

**Food & Menu Management:**
- 🆕 `app/Http/Controllers/API/FoodCategoryController.php` - Food category controller
- 🆕 `app/Http/Controllers/API/FoodItemController.php` - Food item controller
- 🆕 `app/Models/FoodCategory.php` - Food category model
- 🆕 `app/Models/FoodItem.php` - Food item model
- 🆕 `app/Http/Requests/FoodCategoryStoreRequest.php` - Food category validation
- 🆕 `app/Http/Requests/FoodCategoryUpdateRequest.php` - Food category validation
- 🆕 `app/Http/Requests/FoodItemStoreRequest.php` - Food item validation
- 🆕 `app/Http/Requests/FoodItemUpdateRequest.php` - Food item validation
- 🆕 `app/Http/Resources/FoodCategoryResource.php` - Food category resource
- 🆕 `app/Http/Resources/FoodItemResource.php` - Food item resource
- 🆕 `database/migrations/create_food_categories_table.php` - Food categories migration
- 🆕 `database/migrations/create_food_items_table.php` - Food items migration
- 🆕 `database/seeders/FoodCategorySeeder.php` - Food category seeder

**Table Management:**
- 🆕 `app/Http/Controllers/API/TableController.php` - Table controller
- 🆕 `app/Models/Table.php` - Table model
- 🆕 `app/Http/Requests/TableStoreRequest.php` - Table validation
- 🆕 `app/Http/Requests/TableUpdateRequest.php` - Table validation
- 🆕 `app/Http/Resources/TableResource.php` - Table resource
- 🆕 `database/migrations/create_tables_table.php` - Tables migration
- 🆕 `database/seeders/TableSeeder.php` - Table seeder

**Billing / POS:**
- 🆕 `app/Http/Controllers/API/BillingController.php` - Billing/POS controller
- 🆕 `app/Models/Bill.php` - Bill model (replaces Order)
- 🆕 `app/Models/BillItem.php` - Bill item model (replaces OrderItem)
- 🆕 `app/Http/Requests/BillStoreRequest.php` - Bill validation
- 🆕 `app/Http/Requests/BillUpdateRequest.php` - Bill validation
- 🆕 `app/Http/Resources/BillResource.php` - Bill resource
- 🆕 `app/Http/Resources/BillItemResource.php` - Bill item resource
- 🆕 `database/migrations/create_bills_table.php` - Bills migration
- 🆕 `database/migrations/create_bill_items_table.php` - Bill items migration
- 🆕 `resources/views/pdfs/bill_invoice.blade.php` - Bill invoice PDF template

**Staff & Salary:**
- 🆕 `app/Http/Controllers/API/StaffController.php` - Staff controller
- 🆕 `app/Http/Controllers/API/SalaryController.php` - Salary controller
- 🆕 `app/Models/Staff.php` - Staff model
- 🆕 `app/Models/Salary.php` - Salary model
- 🆕 `app/Http/Requests/StaffStoreRequest.php` - Staff validation
- 🆕 `app/Http/Requests/StaffUpdateRequest.php` - Staff validation
- 🆕 `app/Http/Requests/SalaryStoreRequest.php` - Salary validation
- 🆕 `app/Http/Requests/SalaryUpdateRequest.php` - Salary validation
- 🆕 `app/Http/Resources/StaffResource.php` - Staff resource
- 🆕 `app/Http/Resources/SalaryResource.php` - Salary resource
- 🆕 `database/migrations/create_staff_table.php` - Staff migration
- 🆕 `database/migrations/create_salaries_table.php` - Salaries migration
- 🆕 `database/seeders/StaffSeeder.php` - Staff seeder

**Permissions:**
- 🆕 Update `database/seeders/PermissionsTableSeeder.php` - Add hotel management permissions
- 🆕 Update `src/constants/permissions.js` - Add hotel management permissions

---

## 📊 Migration Tracking

### Phase 1: Project Cleanup & Setup

#### Step 1: Project Cleanup
- [ ] **Frontend Cleanup**
  - [ ] Remove branches module (views, services, components)
  - [ ] Remove packages module (views, services, components)
  - [ ] Remove orders module (views, services, components)
  - [ ] Remove payments module (views, services, components)
  - [ ] Remove transactions module (views, services, components)
  - [ ] Remove mock data files
  - [ ] Update navigation (`_nav.jsx`) - remove deleted modules
  - [ ] Update routes (`routes.jsx`) - remove deleted routes
  - [ ] Update permissions constants - remove photo studio permissions

- [ ] **Backend Cleanup**
  - [ ] Remove BranchController, PackageController, OrderController, PaymentController
  - [ ] Remove Branch, Package, Order, OrderItem, Payment models
  - [ ] Remove related Request classes
  - [ ] Remove related Resource classes
  - [ ] Remove related migrations (branches, packages, orders, order_items, payments)
  - [ ] Remove BranchSeeder
  - [ ] Update API routes - remove deleted endpoints
  - [ ] Update permissions seeder - remove photo studio permissions

#### Step 2: Database Schema Updates
- [ ] **Modify Existing Tables**
  - [ ] Update `customers` table (add `customer_type`, `udhar_balance`)
  - [ ] Update `settings` table (add restaurant settings keys)
  - [ ] Update `financial_categories` (ensure expense type support)
  - [ ] Update `financial_transactions` (ensure expense type support)

- [ ] **Create New Tables**
  - [ ] Create `food_categories` table
  - [ ] Create `food_items` table
  - [ ] Create `tables` table
  - [ ] Create `bills` table
  - [ ] Create `bill_items` table
  - [ ] Create `staff` table
  - [ ] Create `salaries` table

#### Step 3: Core Module Updates
- [ ] **Settings Module**
  - [ ] Add restaurant profile settings
  - [ ] Add invoice settings
  - [ ] Add GST settings
  - [ ] Add thermal printer settings
  - [ ] Update SettingsController
  - [ ] Update Settings service (frontend)
  - [ ] Update Settings view (frontend)

- [ ] **Customer Module**
  - [ ] Add customer type (Regular/Credit)
  - [ ] Add Udhar balance tracking
  - [ ] Update CustomerController
  - [ ] Update Customer model
  - [ ] Update Customer service (frontend)
  - [ ] Update Customer views (frontend)

- [ ] **Dashboard Module**
  - [ ] Update DashboardController for restaurant metrics
  - [ ] Update Dashboard service (frontend)
  - [ ] Update Dashboard view (frontend)

- [ ] **Financial Module (Expenses)**
  - [ ] Filter FinancialCategoryController to expense type only
  - [ ] Filter FinancialTransactionController to expense type only
  - [ ] Update Financial views (frontend) - rename to Expenses
  - [ ] Update Financial services (frontend) - rename to Expenses

- [ ] **Reports Module**
  - [ ] Add Sales report (Daily, Monthly, Year)
  - [ ] Add Expenses report (Daily, Monthly, Year)
  - [ ] Add GST Summary Report
  - [ ] Add Customer Pending (Udhar) Report
  - [ ] Add Customer Details - Ledger Report
  - [ ] Add Staff and salary report
  - [ ] Update Business Financial Dashboard
  - [ ] Update ReportController
  - [ ] Update Report service (frontend)
  - [ ] Update Report views (frontend)

### Phase 2: New Module Development

#### Step 4: Food & Menu Management
- [ ] **Backend**
  - [ ] Create FoodCategoryController
  - [ ] Create FoodItemController
  - [ ] Create FoodCategory model
  - [ ] Create FoodItem model
  - [ ] Create Request validation classes
  - [ ] Create Resource classes
  - [ ] Create migrations
  - [ ] Create seeders
  - [ ] Add API routes
  - [ ] Add permissions

- [ ] **Frontend**
  - [ ] Create FoodCategoryService
  - [ ] Create FoodItemService
  - [ ] Create FoodCategoriesList view
  - [ ] Create FoodItemsList view
  - [ ] Create FoodCategoryForm component
  - [ ] Create FoodItemForm component
  - [ ] Add navigation items
  - [ ] Add routes
  - [ ] Add permissions

#### Step 5: Table Management
- [ ] **Backend**
  - [ ] Create TableController
  - [ ] Create Table model
  - [ ] Create Request validation classes
  - [ ] Create Resource class
  - [ ] Create migration
  - [ ] Create seeder
  - [ ] Add API routes
  - [ ] Add permissions

- [ ] **Frontend**
  - [ ] Create TableService
  - [ ] Create TablesList view
  - [ ] Create TableForm component
  - [ ] Add navigation items
  - [ ] Add routes
  - [ ] Add permissions

#### Step 6: Billing / POS Module
- [ ] **Backend**
  - [ ] Create BillingController
  - [ ] Create Bill model
  - [ ] Create BillItem model
  - [ ] Create Request validation classes
  - [ ] Create Resource classes
  - [ ] Create migrations
  - [ ] Add API routes
  - [ ] Add permissions
  - [ ] Implement GST calculation (CGST/SGST)
  - [ ] Implement thermal printer support
  - [ ] Create bill invoice PDF template

- [ ] **Frontend**
  - [ ] Create BillingService
  - [ ] Create BillingPOS view (main POS interface)
  - [ ] Create BillForm component
  - [ ] Create PaymentModal component
  - [ ] Create BillDetailsModal component
  - [ ] Implement POS UI (table selection, item selection, quantity, calculation)
  - [ ] Implement payment handling (Cash, UPI, Card, Split, Partial)
  - [ ] Implement Udhar/Pending bill handling
  - [ ] Add navigation items
  - [ ] Add routes
  - [ ] Add permissions

#### Step 7: Staff & Salary Management
- [ ] **Backend**
  - [ ] Create StaffController
  - [ ] Create SalaryController
  - [ ] Create Staff model
  - [ ] Create Salary model
  - [ ] Create Request validation classes
  - [ ] Create Resource classes
  - [ ] Create migrations
  - [ ] Create seeders
  - [ ] Add API routes
  - [ ] Add permissions
  - [ ] Link salary expenses to financial transactions

- [ ] **Frontend**
  - [ ] Create StaffService
  - [ ] Create SalaryService
  - [ ] Create StaffList view
  - [ ] Create SalaryList view
  - [ ] Create StaffForm component
  - [ ] Create SalaryForm component
  - [ ] Add navigation items
  - [ ] Add routes
  - [ ] Add permissions

### Phase 3: Testing & Refinement

#### Step 8: Testing
- [ ] **Unit Testing**
  - [ ] Test all new models
  - [ ] Test all new controllers
  - [ ] Test all new services

- [ ] **Integration Testing**
  - [ ] Test API endpoints
  - [ ] Test frontend-backend integration
  - [ ] Test payment flows
  - [ ] Test GST calculations
  - [ ] Test Udhar/Pending bill handling

- [ ] **User Acceptance Testing**
  - [ ] Test complete billing flow
  - [ ] Test table management
  - [ ] Test food menu management
  - [ ] Test staff & salary management
  - [ ] Test all reports

#### Step 9: Documentation
- [ ] Update README.md
- [ ] Update API documentation
- [ ] Update database documentation
- [ ] Create user guide
- [ ] Create deployment guide

---

## 🗄️ Database Schema Changes

### New Tables

#### `food_categories`
```sql
- id (bigint, primary key)
- name (varchar(255), not null)
- display_order (integer, default 0)
- status (enum: 'active', 'inactive', default 'active')
- restaurant_id (bigint, foreign key to restaurants - if multi-restaurant)
- created_at, updated_at, deleted_at
```

#### `food_items`
```sql
- id (bigint, primary key)
- name (varchar(255), not null)
- category_id (bigint, foreign key to food_categories)
- price (decimal(10,2), not null)
- gst_percentage (decimal(5,2), default 0)
- food_type (enum: 'veg', 'non_veg', default 'veg')
- status (enum: 'active', 'inactive', default 'active')
- restaurant_id (bigint, foreign key to restaurants - if multi-restaurant)
- created_at, updated_at, deleted_at
```

#### `tables`
```sql
- id (bigint, primary key)
- table_number (varchar(50), unique, not null)
- table_name (varchar(255), nullable)
- capacity (integer, default 4)
- status (enum: 'available', 'occupied', 'cleaning', 'maintenance', default 'available')
- is_active (boolean, default true)
- restaurant_id (bigint, foreign key to restaurants - if multi-restaurant)
- created_at, updated_at, deleted_at
```

#### `bills`
```sql
- id (bigint, primary key)
- bill_number (varchar(255), unique, not null)
- customer_id (bigint, foreign key to customers, nullable - for walk-in)
- table_id (bigint, foreign key to tables, nullable)
- bill_date (datetime, not null)
- subtotal (decimal(12,2), default 0)
- discount (decimal(12,2), default 0)
- gst_amount (decimal(12,2), default 0)
- cgst_amount (decimal(12,2), default 0)
- sgst_amount (decimal(12,2), default 0)
- total_amount (decimal(12,2), not null)
- paid_amount (decimal(12,2), default 0)
- remaining_amount (decimal(12,2), default 0)
- payment_status (enum: 'pending', 'paid', 'partial', default 'pending')
- payment_method (enum: 'cash', 'upi', 'card', 'split', nullable)
- is_udhar (boolean, default false)
- status (enum: 'open', 'closed', 'cancelled', default 'open')
- created_by (bigint, foreign key to users)
- created_at, updated_at, deleted_at
```

#### `bill_items`
```sql
- id (bigint, primary key)
- bill_id (bigint, foreign key to bills)
- food_item_id (bigint, foreign key to food_items)
- quantity (integer, default 1)
- unit_price (decimal(10,2), not null)
- gst_percentage (decimal(5,2), default 0)
- gst_amount (decimal(10,2), default 0)
- total_price (decimal(12,2), not null)
- created_at, updated_at
```

#### `staff`
```sql
- id (bigint, primary key)
- staff_id (varchar(50), unique, not null)
- name (varchar(255), not null)
- mobile (varchar(50), nullable)
- department (enum: 'cook', 'helper', 'cleaner', 'cashier', 'manager', nullable)
- salary_type (enum: 'monthly', 'daily', default 'monthly')
- salary_amount (decimal(10,2), not null)
- joining_date (date, nullable)
- document_info (text, nullable)
- status (enum: 'active', 'inactive', default 'active')
- restaurant_id (bigint, foreign key to restaurants - if multi-restaurant)
- created_at, updated_at, deleted_at
```

#### `salaries`
```sql
- id (bigint, primary key)
- salary_id (varchar(50), unique, not null)
- staff_id (bigint, foreign key to staff)
- month (integer, 1-12, not null)
- year (integer, not null)
- payable_amount (decimal(10,2), not null)
- paid_amount (decimal(10,2), default 0, editable)
- payment_date (date, nullable)
- payment_mode (enum: 'cash', 'upi', 'bank', nullable)
- notes (text, nullable)
- restaurant_id (bigint, foreign key to restaurants - if multi-restaurant)
- created_at, updated_at, deleted_at
```

### Modified Tables

#### `customers`
```sql
-- Add columns:
- customer_type (enum: 'regular', 'credit', default 'regular')
- udhar_balance (decimal(12,2), default 0)
```

#### `settings`
```sql
-- Add restaurant settings keys:
- restaurant_name
- restaurant_address
- restaurant_phone
- restaurant_email
- gst_number
- default_gst_percentage
- thermal_printer_enabled
- thermal_printer_ip
- thermal_printer_port
```

---

## 🔄 Module Mapping

### Base Project → Hotel Management

| Base Module | Hotel Module | Action |
|------------|--------------|--------|
| Authentication | Authentication | ✅ Keep |
| Users | Users | ✅ Keep |
| Roles | Roles | ✅ Keep |
| Permissions | Permissions | ✅ Keep |
| Settings | Restaurant Settings | ⚠️ Modify |
| Branches | - | ❌ Remove |
| Packages | Food Items | 🆕 Create New |
| Orders | Bills | 🆕 Create New |
| Order Items | Bill Items | 🆕 Create New |
| Payments | Billing Payment | 🆕 Integrate into Bills |
| Transactions | - | ❌ Remove |
| Customers | Customers | ⚠️ Modify (add Udhar) |
| Financial Categories | Expense Categories | ⚠️ Modify (expense only) |
| Financial Transactions | Expenses | ⚠️ Modify (expense only) |
| Dashboard | Dashboard | ⚠️ Modify (restaurant metrics) |
| Reports | Reports | ⚠️ Modify (restaurant reports) |
| - | Food Categories | 🆕 Create New |
| - | Tables | 🆕 Create New |
| - | Staff | 🆕 Create New |
| - | Salaries | 🆕 Create New |

---

## 📅 Development Phases

### Phase 1: Foundation (Week 1-2)
1. Project cleanup (remove photo studio modules)
2. Database schema updates (modify existing, create new tables)
3. Core module updates (Settings, Customer, Dashboard, Financial, Reports)

### Phase 2: Core Features (Week 3-5)
1. Food & Menu Management
2. Table Management
3. Billing / POS Module (basic)

### Phase 3: Advanced Features (Week 6-7)
1. Billing / POS Module (complete with GST, thermal printer)
2. Staff & Salary Management
3. Reports (all restaurant reports)

### Phase 4: Testing & Refinement (Week 8)
1. Unit testing
2. Integration testing
3. User acceptance testing
4. Bug fixes
5. Documentation

---

## 📝 Notes

### Important Business Rules

1. **Walk-in customers** → Full payment mandatory
2. **Udhar** → Only registered customers
3. **Table can have multiple bills** → One table can have multiple open bills
4. **GST calculation**:
   - On total bill (default)
   - Item-wise supported
5. **Invoice cannot be edited after closing** → Once bill is closed, it's final

### Technical Considerations

1. **Thermal Printer**: 80mm thermal printer support for bill printing
2. **GST Compliance**: CGST/SGST breakup required in invoices
3. **Multi-bill per table**: Table can have multiple open bills simultaneously
4. **Udhar Management**: Customer ledger maintained for credit customers
5. **Salary Expenses**: Auto-link salary payments to expense reports

---

**Last Updated**: January 2025  
**Status**: Planning Complete - Ready for Development

