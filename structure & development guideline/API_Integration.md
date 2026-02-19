# API Integration Documentation

## Overview
This document maps frontend modules to their corresponding backend API endpoints.

**API Base URL:**
- Development: `http://localhost:8000/api`
- Production: Configured via environment variables

**Authentication:**
- All protected routes require `Authorization: Bearer {token}` header
- Token stored in `localStorage` as `access_token`

**Multi-Module Architecture:**
- The application supports multiple business modules: Restaurant, Hotel Room, Banquet Hall
- Common modules (Customers, Staff, Expenses, Users, Settings) are shared across all modules
- Module-specific APIs are organized by module (e.g., restaurant endpoints, room endpoints)

---

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Role & Permission APIs](#role--permission-apis)
4. [Branch Management APIs](#branch-management-apis)
5. [Settings APIs](#settings-apis)
6. [Restaurant Management APIs](#restaurant-management-apis)
7. [Customer Management APIs](#customer-management-apis)
8. [Staff Management APIs](#staff-management-apis)
9. [Bill Management APIs](#bill-management-apis)
10. [Expense Management APIs](#expense-management-apis)
11. [Room Management APIs](#room-management-apis)
12. [Room Addon Services APIs](#room-addon-services-apis)
13. [Room Settings APIs](#room-settings-apis)
14. [Reports APIs](#reports-apis)
15. [Important Notes](#important-notes)

---

## Authentication APIs

### Frontend Integration
- **Service**: `src/services/authService.js`
- **Components**: `src/pages/Auth/Login.jsx`, `src/context/AuthContext.jsx`

### Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get authenticated user
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `PUT /api/auth/change-password` - Change password

---

## User Management APIs

### Frontend Integration
- **Service**: `src/services/userService.js`, `src/services/profileService.js`
- **Views**: `src/views/users/UsersList.jsx`, `src/views/users/Profile.jsx`

### Endpoints
- `GET /api/users` - List users (paginated, sortable)
- `GET /api/users/{user}` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/{user}` - Update user
- `DELETE /api/users/{user}` - Delete user
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile
- `POST /api/users/profile/avatar` - Upload avatar
- `DELETE /api/users/profile/avatar` - Delete avatar

---

## Role & Permission APIs

### Frontend Integration
- **Service**: `src/services/roleService.js`, `src/services/permissionService.js`
- **Views**: `src/views/roles/RolesList.jsx`

### Endpoints
- `GET /api/roles` - List roles (paginated, sortable)
- `GET /api/roles/{role}` - Get role by ID
- `POST /api/roles` - Create role
- `PUT /api/roles/{role}` - Update role
- `PUT /api/roles/{role}/permissions` - Update role permissions
- `DELETE /api/roles/{role}` - Delete role (soft delete)
- `GET /api/permissions` - List permissions
- `GET /api/permissions/{permission}` - Get permission by ID

---

## Branch Management APIs

### Frontend Integration
- **Service**: `src/services/branchService.js`
- **Views**: `src/views/branches/BranchesList.jsx`

### Endpoints
- `GET /api/branches` - List branches (paginated, sortable)
- `GET /api/branches/{branch}` - Get branch by ID
- `POST /api/branches` - Create branch
- `PUT /api/branches/{branch}` - Update branch
- `DELETE /api/branches/{branch}` - Delete branch

---

## Settings APIs

### Frontend Integration
- **Service**: `src/services/settingsService.js`
- **Views**: `src/views/settings/Settings.jsx`

### Endpoints
- `GET /api/settings` - List all settings
- `GET /api/settings/{key}` - Get setting by key
- `POST /api/settings` - Create setting
- `PUT /api/settings/{key}` - Update setting
- `DELETE /api/settings/{key}` - Delete setting
- `POST /api/settings/test-email` - Test email configuration
- `POST /api/settings/upload-logo` - Upload business logo
- `DELETE /api/settings/delete-logo` - Delete business logo

---

## Restaurant Management APIs

### Frontend Integration
- **Service**: `src/services/menuService.js`, `src/services/tableService.js`, `src/services/restaurantSettingsService.js`
- **Views**: `src/views/restaurant/MenuManagement.jsx`, `src/views/restaurant/TablesList.jsx`, `src/views/restaurant/settings/RestaurantSettings.jsx`

### Food Categories Endpoints
- `GET /api/food-categories` - List categories (paginated, sortable, searchable)
- `GET /api/food-categories/{category}` - Get category by ID
- `POST /api/food-categories` - Create category
- `PUT /api/food-categories/{category}` - Update category
- `DELETE /api/food-categories/{category}` - Delete category (soft delete)
- `GET /api/food-categories/export-menu` - Export menu as PDF (with business information)
- `GET /api/food-categories/export-menu-csv` - Export menu as CSV/Excel (UTF-8 encoding)

### Food Items Endpoints
- `GET /api/food-items` - List items (paginated, sortable, searchable)
- `GET /api/food-items/{item}` - Get item by ID
- `POST /api/food-items` - Create item
- `PUT /api/food-items/{item}` - Update item
- `DELETE /api/food-items/{item}` - Delete item (soft delete)
- `POST /api/food-items/{item}/upload-image` - Upload item image
- `DELETE /api/food-items/{item}/image` - Delete item image
- `POST /api/food-items/{item}/move-up` - Move item up
- `POST /api/food-items/{item}/move-down` - Move item down

### Table Management Endpoints
- `GET /api/tables` - List tables (paginated, sortable, searchable)
- `GET /api/tables/{table}` - Get table by ID
- `POST /api/tables` - Create table
- `PUT /api/tables/{table}` - Update table
- `DELETE /api/tables/{table}` - Delete table (soft delete)
- `GET /api/tables/export-tables` - Export tables as PDF (with business information)

### Restaurant Settings Endpoints
- `GET /api/restaurant-settings` - List all restaurant settings
- `GET /api/restaurant-settings/{section}` - Get settings by section
- `POST /api/restaurant-settings` - Create/Update setting
- `DELETE /api/restaurant-settings/{key}` - Delete setting

---

## Customer Management APIs

### Frontend Integration
- **Service**: `src/services/customerService.js`, `src/services/walletTransactionService.js`
- **Views**: `src/views/customers/CustomersList.jsx`
- **Components**: `src/components/pages/customers/CustomerLedgerModal.jsx`
- **Note**: Unified customer system - serves all modules (Restaurant, Hotel Room, Banquet Hall)

### Customer Endpoints
- `GET /api/customers` - List customers (paginated, sortable, searchable, filterable)
- `GET /api/customers/{customer}` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/{customer}` - Update customer
- `DELETE /api/customers/{customer}` - Delete customer (soft delete)

### Wallet Transaction Endpoints
- `GET /api/wallet-transactions` - List transactions (paginated, sortable, searchable)
- `GET /api/wallet-transactions/customer/{customer}` - Get transactions by customer
- `POST /api/wallet-transactions` - Create transaction
- `PUT /api/wallet-transactions/{transaction}` - Update transaction
- `DELETE /api/wallet-transactions/{transaction}` - Delete transaction (soft delete)

---

## Staff Management APIs

### Frontend Integration
- **Service**: `src/services/staffService.js`
- **Views**: `src/views/staff/StaffList.jsx`
- **Components**: `src/components/pages/staff/SalaryPaymentModal.jsx`, `src/components/pages/staff/SalaryReportModal.jsx`

### Staff Endpoints
- `GET /api/staff` - List staff (paginated, sortable, searchable, filterable)
- `GET /api/staff/{staff}` - Get staff by ID
- `POST /api/staff` - Create staff
- `PUT /api/staff/{staff}` - Update staff
- `DELETE /api/staff/{staff}` - Delete staff (soft delete)

### Salary Payment Endpoints
- `GET /api/salary-payments` - List salary payments (paginated, sortable, searchable, filterable)
- `GET /api/salary-payments/{payment}` - Get salary payment by ID
- `GET /api/staff/{staff}/salary-payments` - Get salary payments by staff
- `POST /api/salary-payments` - Create salary payment
- `PUT /api/salary-payments/{payment}` - Update salary payment
- `DELETE /api/salary-payments/{payment}` - Delete salary payment (soft delete)

---

## Bill Management APIs

### Frontend Integration
- **Service**: `src/services/billService.js`
- **Views**: `src/views/pos/POSPanel.jsx`, `src/views/pos/BillsList.jsx`
- **Components**: `src/components/pages/pos/BillViewModal.jsx`

### Bill Endpoints
- `GET /api/bills` - List bills (paginated, sortable, searchable, filterable)
- `GET /api/bills/{bill}` - Get bill by ID
- `POST /api/bills` - Create bill
- `PUT /api/bills/{bill}` - Update bill
- `DELETE /api/bills/{bill}` - Delete bill (hard delete for non-paid bills)
- `GET /api/bills/table/{tableId}` - Get bills by table
- `POST /api/bills/{bill}/process-payment` - Process payment

---

## Expense Management APIs

### Frontend Integration
- **Service**: `src/services/expenseService.js`
- **Views**: `src/views/expenses/ExpensesList.jsx`
- **Components**: `src/components/pages/expenses/ExpenseForm.jsx`, `src/components/pages/expenses/ExpenseCategoryModal.jsx`

### Expense Category Endpoints
- `GET /api/expense-categories` - List categories (paginated, sortable, searchable)
- `GET /api/expense-categories/{expenseCategory}` - Get category by ID
- `POST /api/expense-categories` - Create category
- `PUT /api/expense-categories/{expenseCategory}` - Update category
- `DELETE /api/expense-categories/{expenseCategory}` - Delete category (soft delete)

### Expense Endpoints
- `GET /api/expenses` - List expenses (paginated, sortable, searchable, filterable)
- `GET /api/expenses/{expense}` - Get expense by ID
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/{expense}` - Update expense
- `DELETE /api/expenses/{expense}` - Delete expense (soft delete)

---

## Room Management APIs

### Frontend Integration
- **Service**: `src/services/roomService.js`
- **Views**: `src/views/hotel-room/RoomCategoriesList.jsx`, `src/views/hotel-room/RoomsList.jsx`
- **Components**: `src/components/pages/hotel-room/RoomCategoryForm.jsx`, `src/components/pages/hotel-room/RoomForm.jsx`

### Room Category Endpoints
- `GET /api/room-categories` - List categories (paginated, sortable, searchable)
- `GET /api/room-categories/{roomCategory}` - Get category by ID
- `POST /api/room-categories` - Create category
- `PUT /api/room-categories/{roomCategory}` - Update category
- `DELETE /api/room-categories/{roomCategory}` - Delete category (soft delete)

### Room Endpoints
- `GET /api/rooms` - List rooms (paginated, sortable, searchable, filterable)
- `GET /api/rooms/{room}` - Get room by ID
- `POST /api/rooms` - Create room
- `PUT /api/rooms/{room}` - Update room
- `DELETE /api/rooms/{room}` - Delete room (soft delete)
- `GET /api/rooms/export-rooms` - Export rooms as PDF (with business information)

**Permissions:**
- `room_type:read`, `room_type:write`, `room_type:delete` - Room Category Management
- `room:read`, `room:write`, `room:delete` - Room Management

---

## Room Addon Services APIs

### Frontend Integration
- **Service**: `src/services/addonService.js`
- **Views**: `src/views/hotel-room/AddonServicesList.jsx`
- **Components**: `src/components/pages/hotel-room/AddonServiceForm.jsx`

### Addon Service Endpoints
- `GET /api/addon-services` - List addon services (paginated, sortable, searchable, filterable by status)
- `GET /api/addon-services/active` - List active addon services (for dropdown/selection)
- `GET /api/addon-services/{addonService}` - Get addon service by ID
- `POST /api/addon-services` - Create addon service
- `PUT /api/addon-services/{addonService}` - Update addon service
- `DELETE /api/addon-services/{addonService}` - Delete addon service (soft delete)

**Request Body (Store/Update):**
- `name` - Service name (e.g., "Extra Bed (pc)", "Laundry (pc)")
- `charge` - Charge amount (decimal, e.g., 500, 50)
- `status` - active | inactive

**Permissions:**
- `view_addon_service`, `create_addon_service`, `edit_addon_service`, `delete_addon_service`

---

## Room Settings APIs

### Frontend Integration
- **Service**: `src/services/roomSettingsService.js`
- **Views**: `src/views/hotel-room/settings/RoomSettings.jsx`

### Room Settings Endpoints
- `GET /api/room-settings` - Get all room settings (grouped by section)
- `GET /api/room-settings/{section}` - Get settings by section (check_in_check_out, room_gst, room_invoice)
- `POST /api/room-settings` - Create/Update setting
- `DELETE /api/room-settings/{key}` - Delete setting

**Sections:**
- `check_in_check_out` - Check-in time, Check-out time
- `room_gst` - GST applicable, CGST %, SGST %, Service Tax %
- `room_invoice` - Invoice prefix, Footer, Terms

**Permissions:**
- `hotel_settings:read`, `hotel_settings:write`

---

## Reports APIs

### Frontend Integration
- **Service**: `src/services/reportService.js`
- **Views**: `src/views/reports/SalesReport.jsx`, `src/views/reports/ExpenseReport.jsx`, `src/views/reports/CustomerPendingReport.jsx`, `src/views/reports/StaffSalaryReport.jsx`, `src/views/reports/CategoryWiseItemReport.jsx`

### Report Endpoints
- `GET /api/reports/sales` - Sales Report (with filters: date range, payment status, payment method, table, customer)
- `GET /api/reports/expenses` - Expense Report (with filters: date range, category, payment method)
- `GET /api/reports/customer-pending` - Customer Pending (Udhar) Report (with filters: date range, customer, status)
- `GET /api/reports/staff-salary` - Staff & Salary Report (with filters: month, year, staff, department)
- `GET /api/reports/category-wise-items` - Category-wise Item Sales Report (with filters: date range, category, item status)

### Report PDF Export Endpoints
- `GET /api/reports/sales/export-pdf` - Export Sales Report as PDF (with same filters as report endpoint)
- `GET /api/reports/expenses/export-pdf` - Export Expense Report as PDF (with same filters as report endpoint)
- `GET /api/reports/customer-pending/export-pdf` - Export Customer Pending Report as PDF (with same filters as report endpoint)
- `GET /api/reports/staff-salary/export-pdf` - Export Staff & Salary Report as PDF (with same filters as report endpoint)
- `GET /api/reports/category-wise-items/export-pdf` - Export Category-wise Item Sales Report as PDF (with same filters as report endpoint)

**PDF Export Features:**
- Compact format with narrow spacing (7px table font, 3px cell padding)
- Business information header (Company Name, Address, Phone, Email, GST Number)
- "(Restaurant)" subtitle for Sales, Category-wise Item Sales, and Customer Pending reports
- Summary section with table-based layout
- Right-aligned amount columns
- Truncated long text for better fit

### Report CSV Export Endpoints
- `GET /api/reports/sales/export-csv` - Export Sales Report as CSV (with same filters as report endpoint)
- `GET /api/reports/expenses/export-csv` - Export Expense Report as CSV (with same filters as report endpoint)
- `GET /api/reports/customer-pending/export-csv` - Export Customer Pending Report as CSV (with same filters as report endpoint)
- `GET /api/reports/staff-salary/export-csv` - Export Staff & Salary Report as CSV (with same filters as report endpoint)
- `GET /api/reports/category-wise-items/export-csv` - Export Category-wise Item Sales Report as CSV (with same filters as report endpoint)

**CSV Export Features:**
- UTF-8 encoding with BOM for proper Excel/Google Sheets display
- Proper CSV headers for each report
- Formatted numbers (2 decimal places)
- Date format: `d/m/Y`
- All filters applied (same as PDF exports)
- Automatic filename with date range

**Permissions:**
- `sales_report:read` - Access to Sales Report and Category-wise Item Sales Report
- `expense_report:read` - Access to Expense Report
- `customer_pending_report:read` - Access to Customer Pending Report
- `staff_salary_report:read` - Access to Staff & Salary Report

**Response Format:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSalesAmount": 50000,
      "totalBillsCount": 100,
      "paidBillsCount": 80,
      "pendingBillsCount": 20
    },
    "bills": [...]
  }
}
```

---

## Important Notes

### API Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 25,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Handling
- **422** - Validation errors (check `errors` object)
- **404** - Resource not found
- **403** - Forbidden (permission denied)
- **401** - Unauthorized (token expired/invalid)

### Pagination
- Default page size: **25 items**
- All list endpoints support server-side pagination
- Use `meta` object for pagination controls

### Authentication
- Token stored in `localStorage` as `access_token`
- Token automatically included in all API requests via Axios interceptor
- Token refresh handled automatically

### File Uploads
- Image uploads: `multipart/form-data`
- Supported formats: JPEG, PNG, WebP
- Max size: 2MB
- Storage path: `/admin/api/storage/{path}`

### Soft Deletes
The following resources support soft deletes:
- Branches, Roles, Food Categories, Food Items, Tables
- Customers, Staff, Salary Payments, Bills, Wallet Transactions
- Expense Categories, Expenses
- Room Categories, Rooms, Addon Services

### Auto-Generated Codes
- **Customer Code**: `#CUST001` format
- **Bill Number**: `#BILL{ID}` format
- **Staff Code**: `STF{ID}` format (accessor, not stored)

### Payment Processing
- **Cash/UPI/Card**: Updates bill status only
- **Wallet**: Updates bill status + creates wallet transaction (debit)

---

**Last Updated**: February 2025  
**Version**: 2.1.0  
**Multi-Module Support**: ✅ Implemented
