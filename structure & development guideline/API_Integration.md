# API Integration Documentation - Hotel Management App

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication APIs](#authentication-apis)
3. [User Management APIs](#user-management-apis)
4. [Role Management APIs](#role-management-apis)
5. [Permission Management APIs](#permission-management-apis)
6. [Branch Management APIs](#branch-management-apis)
7. [Settings Management APIs](#settings-management-apis)
8. [Financial Management APIs](#financial-management-apis)
9. [API Response Format](#api-response-format)
10. [Error Handling](#error-handling)
11. [Frontend Integration Points](#frontend-integration-points)

## ⚠️ Removed API Endpoints

The following API endpoints have been removed as part of the system cleanup:
- **Customer Management APIs** (`/api/customers/*`) - Removed
- **Package Management APIs** (`/api/packages/*`, `/api/package-types/*`) - Removed
- **Order Management APIs** (`/api/orders/*`) - Removed
- **Payment Management APIs** (`/api/payments/*`) - Removed
- **Transaction Management APIs** - Removed
- **Company Health Report APIs** (`/api/reports/company-health/*`) - Removed

---

## 🔍 Overview

यह document Hotel Management App system में सभी API endpoints और उनके frontend integration points को document करता है।

### API Base URL
- **Development**: `http://localhost:8000/api`
- **Production**: Environment variable से configure होता है

### Authentication
- सभी protected routes के लिए `Authorization: Bearer {token}` header required है
- Token `localStorage` में `access_token` key में store होता है

---

## 🔐 Authentication APIs

### 1. **POST /api/auth/login**
**Description**: User login करने के लिए

**Backend Controller**: `AuthController@login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "roles": [...],
    "permissions": [...]
  },
  "permissions": [...],
  "permissionsByModule": {...}
}
```

**Frontend Integration**:
- **Service**: `src/services/authService.js`
- **Method**: `authService.login(credentials)`
- **Used In**:
  - `src/pages/Auth/Login.jsx` - Login page में form submit पर
  - `src/context/AuthContext.jsx` - Authentication context में login function

**Usage Example**:
```javascript
import authService from '../services/authService'

const handleLogin = async (email, password) => {
  const result = await authService.login({ email, password })
  if (result.success) {
    // Token और user localStorage में save हो जाता है
    navigate('/dashboard')
  }
}
```

---

### 2. **POST /api/auth/logout**
**Description**: User logout करने के लिए

**Backend Controller**: `AuthController@logout`

**Request**: No body required (token header से automatically detect होता है)

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

**Frontend Integration**:
- **Service**: `src/services/authService.js`
- **Method**: `authService.logout()`
- **Used In**:
  - `src/context/AuthContext.jsx` - Logout function में
  - `src/components/layout/header/AppHeaderDropdown.jsx` - Header dropdown में logout button

**Usage Example**:
```javascript
import authService from '../services/authService'

const handleLogout = async () => {
  await authService.logout()
  // localStorage clear हो जाता है
  navigate('/login')
}
```

---

### 3. **GET /api/auth/user**
**Description**: Current authenticated user की information fetch करने के लिए

**Backend Controller**: `AuthController@user`

**Response**:
```json
{
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "roles": [...],
    "permissions": [...]
  },
  "permissions": [...],
  "permissionsByModule": {...}
}
```

**Frontend Integration**:
- **Service**: `src/services/authService.js`
- **Method**: `authService.fetchCurrentUser()`
- **Used In**:
  - `src/context/AuthContext.jsx` - App load पर user fetch करने के लिए
  - `src/layout/PrivateRoute.jsx` - Route protection में user verify करने के लिए

**Usage Example**:
```javascript
import authService from '../services/authService'

const fetchUser = async () => {
  const result = await authService.fetchCurrentUser()
  if (result.success) {
    setUser(result.data)
  }
}
```

---

### 4. **POST /api/auth/forgot-password**
**Description**: Password reset email भेजने के लिए (uses database email settings and web_url from App Settings)

**Backend Controller**: `AuthController@forgotPassword`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email address."
}
```

**Backend Implementation**:
- Uses `web_url` from "App Settings" section for reset password link
- Fallback to `config('app.frontend_url')` if setting not found
- Final fallback to `http://localhost:5173` for development
- Reset URL format: `{web_url}/#/reset-password?token={token}&email={email}`

**Frontend Integration**:
- **Service**: `src/services/authService.js`
- **Method**: `authService.forgotPassword(email)`
- **Used In**:
  - `src/pages/Auth/ForgotPassword.jsx` - Forgot password page में

**Usage Example**:
```javascript
import authService from '../services/authService'

const handleForgotPassword = async (email) => {
  const result = await authService.forgotPassword(email)
  if (result.success) {
    toast.success('Password reset email sent')
  }
}
```

---

### 5. **POST /api/auth/reset-password**
**Description**: Password reset करने के लिए (token के साथ)

**Backend Controller**: `AuthController@resetPassword`

**Request Body**:
```json
{
  "token": "reset_token_here",
  "email": "user@example.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password has been reset successfully."
}
```

**Frontend Integration**:
- **Service**: `src/services/authService.js`
- **Method**: `authService.resetPassword(data)`
- **Used In**:
  - `src/pages/Auth/ResetPassword.jsx` - Reset password page में

---

### 6. **PUT /api/auth/change-password**
**Description**: Authenticated user का password change करने के लिए

**Backend Controller**: `AuthController@changePassword`

**Request Body**:
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword123",
  "new_password_confirmation": "newpassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Frontend Integration**:
- **Service**: `src/services/profileService.js`
- **Method**: `profileService.changePassword(passwordData)`
- **Used In**:
  - `src/views/users/Profile.jsx` - Profile page में change password modal

---

## 📊 Dashboard APIs

### 1. **GET /api/dashboard/summary**
**Description**: चुने हुए date range के लिए KPI totals (revenue, orders, customers) + पिछली period comparison और lifetime totals देता है।

**Backend Controller**: `DashboardController@summary`

**Permissions Required**: `view_dashboard`

**Query Parameters**:
- `start_date` - ISO date (optional, default: end_date से 90 दिन पहले)
- `end_date` - ISO date (optional, default: आज)

**Response**:
```json
{
  "success": true,
  "data": {
    "dateRange": { "start": "2025-01-01", "end": "2025-03-31" },
    "totals": { "revenue": 125000, "orders": 215, "customers": 48 },
    "overallTotals": { "revenue": 978500, "orders": 1860, "customers": 642 },
    "changes": {
      "revenue": { "direction": "up", "value": 12.5 },
      "orders": { "direction": "down", "value": 4.1 },
      "customers": { "direction": "up", "value": 6.8 }
    }
  }
}
```

**Frontend Integration**:
- **Service**: `src/services/dashboardService.js`
- **Method**: `dashboardService.getSummary({ startDate, endDate })`
- **Used In**: `src/views/dashboard/Dashboard.jsx` (KPI cards, refresh/date filter)

---

### 2. **GET /api/dashboard/revenue-trend**
**Description**: Payments से net revenue (credit - debit) aggregate करके trend points रिटर्न करता है।

**Backend Controller**: `DashboardController@revenueTrend`

**Permissions Required**: `view_dashboard`

**Query Parameters**:
- `range` - Supported values: 7, 30, 90 (default: 30)
- `end_date` - ISO date (optional, default: आज)

**Response**:
```json
{
  "success": true,
  "data": {
    "range": 30,
    "start": "2025-03-01",
    "end": "2025-03-30",
    "points": [
      { "date": "2025-03-01", "amount": 5400 },
      { "date": "2025-03-02", "amount": 3200 }
    ]
  }
}
```

**Frontend Integration**:
- **Service**: `dashboardService.getRevenueTrend({ range })`
- **Used In**: `Dashboard.jsx` (Revenue Trends chart) + `MainChart.jsx`

---

### 3. **GET /api/dashboard/recent-activities**
**Description**: Latest orders, payments और customers events merge करके activity feed देता है (top 4 entries)।

**Backend Controller**: `DashboardController@recentActivities`

**Permissions Required**: `view_dashboard`

**Response**:
```json
{
  "success": true,
  "data": [
    { "type": "order", "reference": "#ORD1042", "customer_id": 18, "occurred_at": "2025-03-30T10:32:00Z" },
    { "type": "payment", "reference": "#PAY203", "customer_id": 12, "occurred_at": "2025-03-30T09:12:00Z" },
    { "type": "customer", "reference": "#CUST512", "customer_id": 512, "occurred_at": "2025-03-30T08:45:00Z" }
  ]
}
```

**Frontend Integration**:
- **Service**: `dashboardService.getRecentActivities()`
- **Used In**: `Dashboard.jsx` (future live updates panel placeholder)

---

### 4. **GET /api/dashboard/orders-summary**
**Description**: Selected date range के लिए order status counts (total, pending, processing, completed) देता है।

**Backend Controller**: `DashboardController@ordersSummary`

**Permissions Required**: `view_dashboard`

**Query Parameters**:
- `start_date` - ISO date (optional, default: end_date से 90 दिन पहले)
- `end_date` - ISO date (optional, default: आज)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalOrders": 215,
    "pendingOrders": 45,
    "processingOrders": 120,
    "completedOrders": 50
  }
}
```

**Frontend Integration**:
- **Service**: `dashboardService.getOrdersSummary({ startDate, endDate })`
- **Used In**: `Dashboard.jsx` (Orders Summary Cards)

---

### 5. **GET /api/dashboard/upcoming-orders**
**Description**: Upcoming event dates (order_date >= today) वाले orders की list देता है।

**Backend Controller**: `DashboardController@upcomingOrders`

**Permissions Required**: `view_dashboard`

**Query Parameters**:
- `limit` - Number of orders to return (default: 10, max: 50)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "orderNumber": "#ORD001",
      "customerName": "John Doe",
      "customerCode": "#CUST001",
      "orderDate": "2025-02-15",
      "status": "processing",
      "totalAmount": 5000,
      "remainingAmount": 2000
    }
  ]
}
```

**Frontend Integration**:
- **Service**: `dashboardService.getUpcomingOrders({ limit })`
- **Used In**: `Dashboard.jsx` (Upcoming Orders widget)

---

### 6. **GET /api/dashboard/upcoming-events**
**Description**: Next 30 days में आने वाले customer events (birthdays और anniversaries) की list देता है।

**Backend Controller**: `DashboardController@upcomingEvents`

**Permissions Required**: `view_dashboard`

**Query Parameters**:
- `days` - Number of days to look ahead (default: 30, max: 90)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "customerId": 12,
      "customerCode": "#CUST012",
      "customerName": "Jane Smith",
      "eventType": "birthday",
      "eventDate": "2025-02-20",
      "daysUntil": 5
    }
  ]
}
```

**Frontend Integration**:
- **Service**: `dashboardService.getUpcomingEvents({ days })`
- **Used In**: `Dashboard.jsx` (Upcoming Customer Events widget)

---

### 7. **GET /api/dashboard/last-transactions**
**Description**: Last N transactions (payments + financial transactions) combined list देता है।

**Backend Controller**: `DashboardController@lastTransactions`

**Permissions Required**: `view_dashboard`

**Query Parameters**:
- `limit` - Number of transactions to return (default: 10, max: 50)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "payment",
      "reference": "#PAY001",
      "orderNumber": "#ORD001",
      "customerId": 12,
      "customerName": "John Doe",
      "customerCode": "#CUST012",
      "transactionDate": "2025-02-10",
      "amount": 5000,
      "paymentType": "credit",
      "paymentMethod": "cash",
      "description": "Payment for order"
    }
  ]
}
```

**Frontend Integration**:
- **Service**: `dashboardService.getLastTransactions({ limit })`
- **Used In**: `Dashboard.jsx` (Last Transactions widget)

---

### 8. **GET /api/dashboard/company-health-chart**
**Description**: Company health data (orders revenue, income, expenses, profit) monthly aggregation देता है।

**Backend Controller**: `DashboardController@companyHealthChart`

**Permissions Required**: `view_dashboard`

**Query Parameters**:
- `months` - Number of months to include (default: 12, max: 24)

**Response**:
```json
{
  "success": true,
  "data": {
    "months": 12,
    "start": "2024-03-01",
    "end": "2025-02-28",
    "points": [
      {
        "month": "2024-03",
        "monthLabel": "Mar 2024",
        "ordersRevenue": 50000,
        "income": 10000,
        "expenses": 30000,
        "companyProfit": 30000
      }
    ]
  }
}
```

**Frontend Integration**:
- **Service**: `dashboardService.getCompanyHealthChart({ months })`
- **Used In**: `Dashboard.jsx` (Company Health Chart)

---

## 👥 User Management APIs

### 1. **GET /api/users**
**Description**: Users की list fetch करने के लिए (paginated, sortable)

**Backend Controller**: `UserController@index`

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search term (name, email में search)
- `status` - Filter by status (active/inactive)
- `role` - Filter by role
- `sort_by` - Sort column (name, email, created_at)
- `sort_direction` - Sort direction (asc/desc)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "status": "active",
      "roles": [...],
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false,
    "sortBy": "created_at",
    "sortDirection": "desc"
  }
}
```

**Permission Required**: `view_user`

**Frontend Integration**:
- **Service**: `src/services/userService.js`
- **Method**: `userService.getUsers(params)`
- **Used In**:
  - `src/views/users/UsersList.jsx` - Users list page में table data load करने के लिए

**Usage Example**:
```javascript
import userService from '../services/userService'

const loadUsers = async (page, limit, search, sortBy, sortDirection) => {
  const result = await userService.getUsers({
    page,
    limit,
    search,
    sortBy,
    sortDirection
  })
  
  if (result.success) {
    setUsers(result.data)
    setMeta(result.meta)
  }
}
```

---

### 2. **GET /api/users/{user}**
**Description**: Specific user की details fetch करने के लिए

**Backend Controller**: `UserController@show`

**Response**:
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "status": "active",
  "roles": [...],
  "created_at": "2024-01-01T00:00:00.000000Z"
}
```

**Permission Required**: `view_user`

**Frontend Integration**:
- **Service**: `src/services/userService.js` (indirectly through getUsers)
- **Used In**:
  - User details modal में
  - Edit user form में data pre-fill करने के लिए

---

### 3. **POST /api/users**
**Description**: New user create करने के लिए

**Backend Controller**: `UserController@store`

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "status": "active",
  "roles": [1, 2]
}
```

**Response**:
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "status": "active",
  "roles": [...],
  "created_at": "2024-01-01T00:00:00.000000Z"
}
```

**Permission Required**: `create_user`

**Frontend Integration**:
- **Service**: `src/services/userService.js`
- **Method**: `userService.createUser(userData)`
- **Used In**:
  - `src/components/pages/users/UserForm.jsx` - Create user form में
  - `src/views/users/UsersList.jsx` - Add user button click पर

**Usage Example**:
```javascript
import userService from '../services/userService'

const handleCreateUser = async (formData) => {
  const result = await userService.createUser({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    password: formData.password,
    roleId: formData.roleId
  })
  
  if (result.success) {
    toast.success('User created successfully')
    // Refresh users list
  }
}
```

---

### 4. **PUT /api/users/{user}**
**Description**: Existing user update करने के लिए

**Backend Controller**: `UserController@update`

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "status": "active",
  "roles": [1, 2]
}
```

**Response**:
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "status": "active",
  "roles": [...],
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

**Permission Required**: `edit_user`

**Frontend Integration**:
- **Service**: `src/services/userService.js`
- **Method**: `userService.updateUser(userId, userData)`
- **Used In**:
  - `src/components/pages/users/UserForm.jsx` - Edit user form में
  - `src/views/users/UsersList.jsx` - Edit user button click पर

**Usage Example**:
```javascript
import userService from '../services/userService'

const handleUpdateUser = async (userId, formData) => {
  const result = await userService.updateUser(userId, {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    roleId: formData.roleId
  })
  
  if (result.success) {
    toast.success('User updated successfully')
    // Refresh users list
  }
}
```

---

### 5. **DELETE /api/users/{user}**
**Description**: User delete करने के लिए

**Backend Controller**: `UserController@destroy`

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Permission Required**: `delete_user`

**Frontend Integration**:
- **Service**: `src/services/userService.js`
- **Method**: `userService.deleteUser(userId)`
- **Used In**:
  - `src/views/users/UsersList.jsx` - Delete user button click पर

**Usage Example**:
```javascript
import userService from '../services/userService'

const handleDeleteUser = async (userId) => {
  if (window.confirm('Are you sure you want to delete this user?')) {
    const result = await userService.deleteUser(userId)
    if (result.success) {
      toast.success('User deleted successfully')
      // Refresh users list
    }
  }
}
```

---

### 6. **GET /api/users/profile**
**Description**: Current authenticated user की profile fetch करने के लिए

**Backend Controller**: `UserController@profile`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "USA",
    "bio": "User bio",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "avatar": "avatars/avatar_user_1_1234567890_abc123.jpg",
    "avatar_url": "http://localhost:8000/admin/api/storage/avatars/avatar_user_1_1234567890_abc123.jpg"
  }
}
```

**Frontend Integration**:
- **Service**: `src/services/profileService.js`
- **Method**: `profileService.getProfile()`
- **Used In**:
  - `src/views/users/Profile.jsx` - Profile page में data load करने के लिए

---

### 7. **PUT /api/users/profile**
**Description**: Current authenticated user की profile update करने के लिए

**Backend Controller**: `UserController@updateProfile`

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "country": "USA",
  "bio": "User bio",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "avatar": "avatars/avatar_user_1_1234567890_abc123.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "data": {...},
  "message": "Profile updated successfully"
}
```

**Frontend Integration**:
- **Service**: `src/services/profileService.js`
- **Method**: `profileService.updateProfile(profileData)`
- **Used In**:
  - `src/views/users/Profile.jsx` - Profile update करने के लिए
  - `src/components/pages/users/PersonalInfoSection.jsx` - Personal info save
  - `src/components/pages/users/AddressSection.jsx` - Address save
  - `src/components/pages/users/ProfilePictureSection.jsx` - Avatar upload component

**Note**: Avatar file upload via `multipart/form-data`. Backend stores file in `storage/app/public/avatars/` and returns full URL. Files are served via custom handler in `public/index.php` (no symlink required).

---

## 🎭 Role Management APIs

### 1. **GET /api/roles**
**Description**: Roles की list fetch करने के लिए (paginated, sortable)

**Backend Controller**: `RoleController@index`

**Query Parameters**:
- `page` - Page number
- `limit` - Items per page
- `search` - Search term
- `active` - Filter by active status (true/false)
- `sort_by` - Sort column
- `sort_direction` - Sort direction

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "admin",
      "description": "Administrator role",
      "is_active": true,
      "permissions": [...],
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sortBy": "created_at",
    "sortDirection": "desc"
  }
}
```

**Permission Required**: `view_role`

**Frontend Integration**:
- **Service**: `src/services/roleService.js`
- **Method**: `roleService.getRoles(params)`
- **Used In**:
  - `src/views/roles/RolesList.jsx` - Roles list page में

**Usage Example**:
```javascript
import roleService from '../services/roleService'

const loadRoles = async () => {
  const result = await roleService.getRoles({
    page: 1,
    limit: 20
  })
  
  if (result.success) {
    setRoles(result.data)
  }
}
```

---

### 2. **GET /api/roles/{role}**
**Description**: Specific role की details fetch करने के लिए

**Backend Controller**: `RoleController@show`

**Response**:
```json
{
  "id": 1,
  "name": "admin",
  "description": "Administrator role",
  "is_active": true,
  "permissions": [
    {
      "id": 1,
      "name": "view_user",
      "description": "View users",
      "module": "users",
      "submodule": "management"
    }
  ],
  "created_at": "2024-01-01T00:00:00.000000Z"
}
```

**Permission Required**: `view_role`

**Frontend Integration**:
- **Service**: `src/services/roleService.js`
- **Method**: `roleService.getRoleById(id)`
- **Used In**:
  - `src/components/pages/roles/RoleForm.jsx` - Edit role form में data load करने के लिए

---

### 3. **POST /api/roles**
**Description**: New role create करने के लिए

**Backend Controller**: `RoleController@store`

**Request Body**:
```json
{
  "name": "manager",
  "description": "Manager role",
  "is_active": true,
  "permissions": [1, 2, 3]
}
```

**Response**:
```json
{
  "id": 2,
  "name": "manager",
  "description": "Manager role",
  "is_active": true,
  "permissions": [...],
  "created_at": "2024-01-01T00:00:00.000000Z"
}
```

**Permission Required**: `create_role`

**Frontend Integration**:
- **Service**: `src/services/roleService.js`
- **Method**: `roleService.createRole(roleData)`
- **Used In**:
  - `src/components/pages/roles/RoleForm.jsx` - Create role form में

**Usage Example**:
```javascript
import roleService from '../services/roleService'

const handleCreateRole = async (formData) => {
  const result = await roleService.createRole({
    name: formData.name,
    description: formData.description,
    isActive: formData.isActive,
    permissions: formData.permissions // Array of permission IDs
  })
  
  if (result.success) {
    toast.success('Role created successfully')
  }
}
```

---

### 4. **PUT /api/roles/{role}**
**Description**: Existing role update करने के लिए

**Backend Controller**: `RoleController@update`

**Request Body**:
```json
{
  "name": "manager",
  "description": "Updated manager role",
  "is_active": true
}
```

**Response**:
```json
{
  "id": 2,
  "name": "manager",
  "description": "Updated manager role",
  "is_active": true,
  "permissions": [...],
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

**Permission Required**: `edit_role`

**Frontend Integration**:
- **Service**: `src/services/roleService.js`
- **Method**: `roleService.updateRole(roleId, roleData)`
- **Used In**:
  - `src/components/pages/roles/RoleForm.jsx` - Edit role form में

---

### 5. **PUT /api/roles/{role}/permissions**
**Description**: Role के permissions update करने के लिए

**Backend Controller**: `RoleController@updatePermissions`

**Request Body**:
```json
{
  "permissions": [1, 2, 3, 4, 5]
}
```

**Response**:
```json
{
  "id": 2,
  "name": "manager",
  "permissions": [
    {
      "id": 1,
      "name": "view_user",
      "description": "View users"
    }
  ]
}
```

**Permission Required**: `edit_role`

**Frontend Integration**:
- **Service**: `src/services/roleService.js`
- **Method**: `roleService.updateRolePermissions(roleId, permissions)`
- **Used In**:
  - `src/components/pages/roles/RoleForm.jsx` - Role form में permissions assign करने के लिए

**Usage Example**:
```javascript
import roleService from '../services/roleService'

const handleUpdatePermissions = async (roleId, selectedPermissions) => {
  const result = await roleService.updateRolePermissions(
    roleId,
    selectedPermissions // Array of permission IDs
  )
  
  if (result.success) {
    toast.success('Permissions updated successfully')
  }
}
```

---

### 6. **DELETE /api/roles/{role}**
**Description**: Role delete करने के लिए (soft delete)

**Backend Controller**: `RoleController@destroy`

**Response**:
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

**Permission Required**: `delete_role`

**Frontend Integration**:
- **Service**: `src/services/roleService.js`
- **Method**: `roleService.deleteRole(roleId)`
- **Used In**:
  - `src/views/roles/RolesList.jsx` - Delete role button click पर

---

## 🔑 Permission Management APIs

### 1. **GET /api/permissions**
**Description**: Permissions की list fetch करने के लिए

**Backend Controller**: `PermissionController@index`

**Query Parameters**:
- `module` - Filter by module
- `submodule` - Filter by submodule
- `active` - Filter by active status
- `group_by_module` - Group permissions by module (1/0)
- `page` - Page number
- `limit` - Items per page
- `search` - Search term
- `sort_by` - Sort column
- `sort_direction` - Sort direction

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "view_user",
      "description": "View users",
      "module": "users",
      "submodule": "management",
      "type": "read",
      "is_active": true
    }
  ],
  "meta": {...}
}
```

**Permission Required**: `view_permission`

**Frontend Integration**:
- **Service**: `src/services/permissionService.js`
- **Method**: `permissionService.getPermissions(options)`
- **Used In**:
  - `src/components/pages/roles/RoleForm.jsx` - Role form में permissions list load करने के लिए
  - Permission management UI में

**Usage Example**:
```javascript
import permissionService from '../services/permissionService'

const loadPermissions = async () => {
  const result = await permissionService.getPermissions({
    groupByModule: true, // Group by module
    active: true // Only active permissions
  })
  
  if (result.success) {
    setPermissions(result.data)
    setGroupedPermissions(result.grouped)
  }
}
```

---

### 2. **GET /api/permissions/{permission}**
**Description**: Specific permission की details fetch करने के लिए

**Backend Controller**: `PermissionController@show`

**Response**:
```json
{
  "id": 1,
  "name": "view_user",
  "description": "View users",
  "module": "users",
  "submodule": "management",
  "type": "read",
  "is_active": true
}
```

**Permission Required**: `view_permission`

**Frontend Integration**:
- **Service**: `src/services/permissionService.js` (indirectly)
- **Used In**: Permission details view में

---

## 🏢 Branch Management APIs

### 1. **GET /api/branches**
**Description**: Branches की list fetch करने के लिए (paginated, sortable)

**Backend Controller**: `BranchController@index`

**Query Parameters**:
- `page` - Page number
- `limit` - Items per page
- `search` - Search term
- `status` - Filter by status
- `city` - Filter by city
- `sort_by` - Sort column
- `sort_direction` - Sort direction

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "branch_name": "Main Branch",
      "branch_code": "MB001",
      "address": "123 Main St",
      "city": "New York",
      "contact_number": "1234567890",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**Permission Required**: `view_branch`

**Frontend Integration**:
- **Service**: `src/services/branchService.js`
- **Method**: `branchService.getBranches(params)`
- **Used In**:
  - `src/views/branches/BranchesList.jsx` - Branches list page में

**Usage Example**:
```javascript
import branchService from '../services/branchService'

const loadBranches = async () => {
  const result = await branchService.getBranches({
    page: 1,
    limit: 20,
    search: searchTerm
  })
  
  if (result.success) {
    setBranches(result.data)
    setMeta(result.meta)
  }
}
```

---

### 2. **GET /api/branches/{branch}**
**Description**: Specific branch की details fetch करने के लिए

**Backend Controller**: `BranchController@show`

**Response**:
```json
{
  "id": 1,
  "branch_name": "Main Branch",
  "branch_code": "MB001",
  "address": "123 Main St",
  "city": "New York",
  "contact_number": "1234567890",
  "status": "active"
}
```

**Permission Required**: `view_branch`

**Frontend Integration**:
- **Service**: `src/services/branchService.js`
- **Method**: `branchService.getBranchById(id)`
- **Used In**:
  - `src/components/pages/branches/BranchForm.jsx` - Edit branch form में

---

### 3. **POST /api/branches**
**Description**: New branch create करने के लिए

**Backend Controller**: `BranchController@store`

**Request Body**:
```json
{
  "branch_name": "New Branch",
  "branch_code": "NB001",
  "address": "456 New St",
  "city": "Los Angeles",
  "contact_number": "0987654321",
  "status": "active"
}
```

**Response**:
```json
{
  "id": 2,
  "branch_name": "New Branch",
  "branch_code": "NB001",
  "address": "456 New St",
  "city": "Los Angeles",
  "contact_number": "0987654321",
  "status": "active",
  "created_at": "2024-01-01T00:00:00.000000Z"
}
```

**Permission Required**: `create_branch`

**Frontend Integration**:
- **Service**: `src/services/branchService.js`
- **Method**: `branchService.createBranch(branchData)`
- **Used In**:
  - `src/components/pages/branches/BranchForm.jsx` - Create branch form में

---

### 4. **PUT /api/branches/{branch}**
**Description**: Existing branch update करने के लिए

**Backend Controller**: `BranchController@update`

**Request Body**:
```json
{
  "branch_name": "Updated Branch",
  "address": "789 Updated St",
  "status": "active"
}
```

**Response**:
```json
{
  "id": 1,
  "branch_name": "Updated Branch",
  "branch_code": "MB001",
  "address": "789 Updated St",
  "city": "New York",
  "status": "active",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

**Permission Required**: `edit_branch`

**Frontend Integration**:
- **Service**: `src/services/branchService.js`
- **Method**: `branchService.updateBranch(id, branchData)`
- **Used In**:
  - `src/components/pages/branches/BranchForm.jsx` - Edit branch form में

---

### 5. **DELETE /api/branches/{branch}**
**Description**: Branch delete करने के लिए

**Backend Controller**: `BranchController@destroy`

**Response**:
```json
{
  "success": true,
  "message": "Branch deleted successfully"
}
```

**Permission Required**: `delete_branch`

**Frontend Integration**:
- **Service**: `src/services/branchService.js`
- **Method**: `branchService.deleteBranch(id)`
- **Used In**:
  - `src/views/branches/BranchesList.jsx` - Delete branch button click पर

---

## 📦 Package Management APIs

### 1. **GET /api/packages**
**Description**: Packages की list fetch करने के लिए (paginated, sortable)

**Backend Controller**: `PackageController@index`

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search term (package_name, description, package_type में search)
- `package_type` - Filter by package type (Album, PhotoShoot, Editing, Video)
- `status` - Filter by status (active/inactive)
- `sort_by` - Sort column (package_name, package_type, default_price, status, created_at)
- `sort_direction` - Sort direction (asc/desc)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "package_name": "Wedding Photography Basic",
      "package_type": "PhotoShoot",
      "default_price": 25000.00,
      "description": "Basic wedding photography package with 4 hours coverage, 200 edited photos",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sortBy": "created_at",
    "sortDirection": "desc"
  }
}
```

**Permission Required**: `view_package`

**Frontend Integration**:
- **Service**: `src/services/packageService.js`
- **Method**: `packageService.getPackages(params)`
- **Used In**:
  - `src/views/packages/PackagesList.jsx` - Packages list page में

**Usage Example**:
```javascript
import packageService from '../services/packageService'

const loadPackages = async () => {
  const result = await packageService.getPackages({
    page: 1,
    limit: 20,
    search: searchTerm,
    package_type: typeFilter,
    status: statusFilter
  })
  
  if (result.success) {
    setPackages(result.data)
    setMeta(result.meta)
  }
}
```

---

### 2. **GET /api/packages/{package}**
**Description**: Specific package की details fetch करने के लिए

**Backend Controller**: `PackageController@show`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "package_name": "Wedding Photography Basic",
    "package_type": "PhotoShoot",
    "default_price": 25000.00,
    "description": "Basic wedding photography package with 4 hours coverage, 200 edited photos",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  },
  "message": "Package retrieved successfully."
}
```

**Permission Required**: `view_package`

**Frontend Integration**:
- **Service**: `src/services/packageService.js`
- **Method**: `packageService.getPackageById(id)`
- **Used In**:
  - `src/components/pages/packages/PackageForm.jsx` - Edit package form में data load करने के लिए

---

### 3. **POST /api/packages**
**Description**: New package create करने के लिए

**Backend Controller**: `PackageController@store`

**Request Body**:
```json
{
  "package_name": "Wedding Photography Basic",
  "package_type": "PhotoShoot",
  "default_price": 25000,
  "description": "Basic wedding photography package with 4 hours coverage, 200 edited photos",
  "status": "active"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "package_name": "Wedding Photography Basic",
    "package_type": "PhotoShoot",
    "default_price": 25000.00,
    "description": "Basic wedding photography package with 4 hours coverage, 200 edited photos",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  },
  "message": "Package created successfully."
}
```

**Permission Required**: `create_package`

**Frontend Integration**:
- **Service**: `src/services/packageService.js`
- **Method**: `packageService.createPackage(packageData)`
- **Used In**:
  - `src/components/pages/packages/PackageForm.jsx` - Create package form में
  - `src/views/packages/PackagesList.jsx` - Add package button click पर

**Usage Example**:
```javascript
import packageService from '../services/packageService'

const handleCreatePackage = async (formData) => {
  const result = await packageService.createPackage({
    package_name: formData.package_name,
    package_type: formData.package_type,
    default_price: formData.default_price,
    description: formData.description,
    status: formData.status
  })
  
  if (result.success) {
    toast.success('Package created successfully')
    // Refresh packages list
  }
}
```

---

### 4. **PUT /api/packages/{package}**
**Description**: Existing package update करने के लिए

**Backend Controller**: `PackageController@update`

**Request Body**:
```json
{
  "package_name": "Wedding Photography Premium",
  "package_type": "PhotoShoot",
  "default_price": 50000,
  "description": "Premium wedding photography package with full day coverage",
  "status": "active"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "package_name": "Wedding Photography Premium",
    "package_type": "PhotoShoot",
    "default_price": 50000.00,
    "description": "Premium wedding photography package with full day coverage",
    "status": "active",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  },
  "message": "Package updated successfully."
}
```

**Permission Required**: `edit_package`

**Frontend Integration**:
- **Service**: `src/services/packageService.js`
- **Method**: `packageService.updatePackage(packageId, packageData)`
- **Used In**:
  - `src/components/pages/packages/PackageForm.jsx` - Edit package form में
  - `src/views/packages/PackagesList.jsx` - Edit package button click पर

**Usage Example**:
```javascript
import packageService from '../services/packageService'

const handleUpdatePackage = async (packageId, formData) => {
  const result = await packageService.updatePackage(packageId, {
    package_name: formData.package_name,
    package_type: formData.package_type,
    default_price: formData.default_price,
    description: formData.description,
    status: formData.status
  })
  
  if (result.success) {
    toast.success('Package updated successfully')
    // Refresh packages list
  }
}
```

---

### 5. **DELETE /api/packages/{package}**
**Description**: Package delete करने के लिए (soft delete)

**Backend Controller**: `PackageController@destroy`

**Response**:
```json
{
  "success": true,
  "message": "Package deleted successfully."
}
```

**Permission Required**: `delete_package`

**Frontend Integration**:
- **Service**: `src/services/packageService.js`
- **Method**: `packageService.deletePackage(packageId)`
- **Used In**:
  - `src/views/packages/PackagesList.jsx` - Delete package button click पर

**Usage Example**:
```javascript
import packageService from '../services/packageService'

const handleDeletePackage = async (packageId) => {
  if (window.confirm('Are you sure you want to delete this package?')) {
    const result = await packageService.deletePackage(packageId)
    if (result.success) {
      toast.success('Package deleted successfully')
      // Refresh packages list
    }
  }
}
```

---

## 👥 Customer Management APIs (Restaurant System)

### 1. **GET /api/customers**
**Description**: Customers की list fetch करने के लिए (paginated, sortable, searchable, filterable)

**Backend Controller**: `CustomerController@index`

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 25, max: 100)
- `search` - Search term (name, customer_code, mobile, email में search)
- `status` - Filter by status (active, inactive)
- `customer_type` - Filter by customer type (regular, credit)
- `city` - Filter by city
- `sort_by` - Sort column (name, customer_code, status, created_at)
- `sort_direction` - Sort direction (asc/desc, default: name asc)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customerCode": "#CUST001",
      "name": "Rajesh Patel",
      "mobile": "9876543210",
      "email": "rajesh.patel@email.com",
      "address": "123 MG Road",
      "city": "Ahmedabad",
      "state": "Gujarat",
      "pincode": "380001",
      "customerType": "regular",
      "status": "active",
      "totalBills": 5,
      "totalAmount": 125000.00,
      "paidAmount": 100000.00,
      "remainingAmount": 25000.00,
      "notes": "Regular customer",
      "createdAt": "2025-01-15T10:30:00.000000Z",
      "updatedAt": "2025-01-15T10:30:00.000000Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 25,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sortBy": "name",
    "sortDirection": "asc"
  }
}
```

**Permission Required**: `view_customer`

**Frontend Integration**:
- **Service**: `src/services/customerService.js`
- **Method**: `customerService.getCustomers(params)`
- **Used In**:
  - `src/views/customers/CustomersList.jsx` - Customers list page में

**Features**:
- Default sort: Name (ascending)
- Default page size: 25 items
- Server-side pagination, filtering, and searching
- Address column combines Address + City in list view

---

### 2. **GET /api/customers/{id}**
**Description**: Specific customer की details fetch करने के लिए

**Backend Controller**: `CustomerController@show`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerCode": "#CUST001",
    "name": "Rajesh Patel",
    "mobile": "9876543210",
    "email": "rajesh.patel@email.com",
    "address": "123 MG Road",
    "city": "Ahmedabad",
    "state": "Gujarat",
    "pincode": "380001",
    "customerType": "regular",
    "status": "active",
    "totalBills": 5,
    "totalAmount": 125000.00,
    "paidAmount": 100000.00,
    "remainingAmount": 25000.00,
    "notes": "Regular customer",
    "createdAt": "2025-01-15T10:30:00.000000Z",
    "updatedAt": "2025-01-15T10:30:00.000000Z"
  }
}
```

**Permission Required**: `view_customer`

**Frontend Integration**:
- **Service**: `src/services/customerService.js`
- **Method**: `customerService.getCustomerById(id)`
- **Used In**:
  - `src/components/pages/customers/CustomerForm.jsx` - Edit customer form में

---

### 3. **POST /api/customers**
**Description**: New customer create करने के लिए

**Backend Controller**: `CustomerController@store`

**Request Body**:
```json
{
  "name": "Rajesh Patel",
  "mobile": "9876543210",
  "email": "rajesh.patel@email.com",
  "address": "123 MG Road",
  "city": "Ahmedabad",
  "state": "Gujarat",
  "pincode": "380001",
  "customer_type": "regular",
  "status": "active",
  "notes": "Regular customer"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerCode": "#CUST001",
    "name": "Rajesh Patel",
    "mobile": "9876543210",
    "email": "rajesh.patel@email.com",
    "customerType": "regular",
    "status": "active",
    "totalBills": 0,
    "totalAmount": 0.00,
    "paidAmount": 0.00,
    "remainingAmount": 0.00,
    "createdAt": "2025-01-15T10:30:00.000000Z"
  },
  "message": "Customer created successfully."
}
```

**Permission Required**: `create_customer`

**Frontend Integration**:
- **Service**: `src/services/customerService.js`
- **Method**: `customerService.createCustomer(customerData)`
- **Used In**:
  - `src/components/pages/customers/CustomerForm.jsx` - Create customer form में

**Note**: Customer code (#CUST001) automatically generated via model observer

---

### 4. **PUT /api/customers/{id}**
**Description**: Existing customer update करने के लिए

**Backend Controller**: `CustomerController@update`

**Request Body**:
```json
{
  "name": "Rajesh Patel",
  "mobile": "9876543210",
  "email": "rajesh.patel@email.com",
  "address": "123 MG Road",
  "city": "Ahmedabad",
  "state": "Gujarat",
  "pincode": "380001",
  "customer_type": "credit",
  "status": "active",
  "notes": "Updated notes"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerCode": "#CUST001",
    "name": "Rajesh Patel",
    "customerType": "credit",
    "status": "active"
  },
  "message": "Customer updated successfully."
}
```

**Permission Required**: `edit_customer`

**Frontend Integration**:
- **Service**: `src/services/customerService.js`
- **Method**: `customerService.updateCustomer(id, customerData)`
- **Used In**:
  - `src/components/pages/customers/CustomerForm.jsx` - Edit customer form में

---

### 5. **DELETE /api/customers/{id}**
**Description**: Customer delete करने के लिए (soft delete)

**Backend Controller**: `CustomerController@destroy`

**Response**:
```json
{
  "success": true,
  "message": "Customer deleted successfully."
}
```

**Permission Required**: `delete_customer`

**Frontend Integration**:
- **Service**: `src/services/customerService.js`
- **Method**: `customerService.deleteCustomer(id)`
- **Used In**:
  - `src/views/customers/CustomersList.jsx` - Delete customer button click पर

---

## 💰 Wallet Transaction Management APIs (Customer Ledger)

### 1. **GET /api/customers/{customer}/wallet-transactions**
**Description**: Specific customer के wallet transactions (Customer Ledger) fetch करने के लिए (paginated, sortable, filterable)

**Backend Controller**: `WalletTransactionController@getByCustomer`

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search term (reference_number, description में search)
- `transaction_type` - Filter by transaction type (credit/debit)
- `sort_by` - Sort column (transaction_date, amount, transaction_type, created_at)
- `sort_direction` - Sort direction (asc/desc, default: transaction_date desc)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customerId": 1,
      "transactionDate": "2025-01-20",
      "transactionType": "credit",
      "amount": 5000.00,
      "paymentMethod": "cash",
      "referenceNumber": "REF001",
      "description": "Payment received",
      "runningBalance": 5000.00,
      "createdAt": "2025-01-20T10:30:00.000000Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sortBy": "transaction_date",
    "sortDirection": "desc"
  },
  "totals": {
    "totalDebit": 3000.00,
    "totalCredit": 2000.00,
    "remainingAmount": 1000.00
  },
  "customer": {
    "id": 1,
    "customerCode": "#CUST001",
    "name": "Rajesh Patel"
  }
}
```

**Permission Required**: `view_customer_ledger`

**Frontend Integration**:
- **Service**: `src/services/walletTransactionService.js`
- **Method**: `walletTransactionService.getCustomerLedger(customerId, params)`
- **Used In**:
  - `src/components/pages/customers/CustomerLedgerModal.jsx` - Customer ledger modal में (accessible from customer list)

**Features**:
- **Totals Calculation**: Backend calculates totals from ALL transactions for the customer (not just paginated ones)
  - `totalDebit`: Sum of all debit transactions
  - `totalCredit`: Sum of all credit transactions
  - `remainingAmount`: Debit - Credit (amount customer owes)
- **Running Balance**: Each transaction includes running balance calculated from oldest to newest
- **Transaction Types**:
  - **Credit**: Customer pays money OR Hotel refunds
  - **Debit**: Customer owes money (bills/usage)
- Default sort: Transaction Date (descending)
- Server-side pagination, filtering, and searching

---

### 2. **GET /api/wallet-transactions**
**Description**: All wallet transactions की list fetch करने के लिए (paginated, sortable, filterable)

**Backend Controller**: `WalletTransactionController@index`

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `customer_id` - Filter by customer
- `transaction_type` - Filter by transaction type (credit/debit)
- `payment_method` - Filter by payment method (cash/upi/card/bank_transfer)
- `start_date` - Filter by start date (YYYY-MM-DD)
- `end_date` - Filter by end date (YYYY-MM-DD)
- `search` - Search term (reference_number, description)
- `sort_by` - Sort column
- `sort_direction` - Sort direction

**Permission Required**: `view_wallet_transaction`

---

### 3. **POST /api/wallet-transactions**
**Description**: New wallet transaction create करने के लिए

**Backend Controller**: `WalletTransactionController@store`

**Request Body**:
```json
{
  "customer_id": 1,
  "transaction_date": "2025-01-20",
  "transaction_type": "credit",
  "amount": 5000.00,
  "payment_method": "cash",
  "reference_number": "REF001",
  "description": "Payment received"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerId": 1,
    "transactionDate": "2025-01-20",
    "transactionType": "credit",
    "amount": 5000.00,
    "paymentMethod": "cash",
    "referenceNumber": "REF001",
    "description": "Payment received"
  },
  "message": "Wallet transaction created successfully."
}
```

**Permission Required**: `create_wallet_transaction`

**Note**: 
- Transaction create होने पर customer stats automatically update होते हैं (paid_amount, remaining_amount)
- Credit transaction increases customer paid_amount
- Debit transaction decreases customer paid_amount

**Frontend Integration**:
- **Service**: `src/services/walletTransactionService.js`
- **Method**: `walletTransactionService.createWalletTransaction(transactionData)`
- **Used In**:
  - `src/components/pages/customers/CustomerLedgerModal.jsx` - Add transaction form में
  - `src/components/pages/customers/WalletTransactionForm.jsx` - Transaction form component

---

### 4. **PUT /api/wallet-transactions/{walletTransaction}**
**Description**: Existing wallet transaction update करने के लिए

**Backend Controller**: `WalletTransactionController@update`

**Permission Required**: `edit_wallet_transaction`

**Note**: Transaction update होने पर customer stats automatically recalculate होते हैं

---

### 5. **DELETE /api/wallet-transactions/{walletTransaction}**
**Description**: Wallet transaction delete करने के लिए

**Backend Controller**: `WalletTransactionController@destroy`

**Permission Required**: `delete_wallet_transaction`

**Note**: Transaction delete होने पर customer stats automatically recalculate होते हैं

---

## 📦 Order Management APIs

### 1. **GET /api/orders**
**Description**: Orders की list fetch करने के लिए (paginated, sortable)

**Backend Controller**: `OrderController@index`

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search term (order_number, customer name/email में search)
- `status` - Filter by status (pending, processing, completed, cancelled)
- `payment_status` - Filter by payment status (pending, completed)
- `customer_id` - Filter by customer
- `branch_id` - Filter by branch
- `start_date` - Filter orders from date
- `end_date` - Filter orders to date
- `sort_by` - Sort column (order_number, order_date, total_amount, status, payment_status, created_at)
- `sort_direction` - Sort direction (asc/desc)

**Note**: Payment status simplified to `pending` or `completed` (calculated from remaining amount)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderNumber": "#ORD001",
      "customerId": 1,
      "customer": {
        "id": 1,
        "firstName": "Rajesh",
        "lastName": "Patel",
        "name": "Rajesh Patel",
        "email": "rajesh.patel@email.com",
        "phone": "+91 98765 43210",
        "mobile": "+91 98765 43210",
        "customerCode": "#CUST001"
      },
      "branchId": 1,
      "branch": {
        "id": 1,
        "branchName": "Main Branch",
        "branchCode": "MB001"
      },
      "orderDate": "2024-01-20",
      "dueDate": "2024-02-20",
      "subtotal": 50000,
      "discount": 0,
      "totalAmount": 50000,
      "paidAmount": 30000,
      "remainingAmount": 20000,
      "status": "processing",
      "paymentStatus": "pending",
      "paymentMethod": "upi",
      "items": [
        {
          "id": 1,
          "orderId": 1,
          "packageId": 2,
          "packageName": "Wedding Photography Premium",
          "quantity": 1,
          "unitPrice": 50000,
          "totalPrice": 50000
        }
      ],
      "links": [
        {
          "id": 1234567890,
          "title": "Photo Share Link",
          "url": "https://example.com/photos"
        },
        {
          "id": 1234567891,
          "title": "Video Link",
          "url": "https://example.com/video"
        }
      ],
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sortBy": "created_at",
    "sortDirection": "desc"
  }
}
```

**Permission Required**: `view_order`

**Frontend Integration**:
- **Service**: `src/services/orderService.js`
- **Method**: `orderService.getOrders(params)`
- **Used In**:
  - `src/views/orders/OrdersList.jsx` - Orders list page में

**Latest UI Behavior (Dec 2025)**:
- Orders list अब backend response पर पूरी तरह निर्भर करता है; किसी भी API failure पर toast error और खाली state दिखाई जाती है (no mock fallback)
- Links can be managed from Order Details page (not from Add/Edit form)

**Note**: Order create/update/delete होने पर customer stats automatically update होते हैं

---

### 2. **GET /api/orders/{order}**
**Description**: Specific order की details fetch करने के लिए (includes payment history)

**Backend Controller**: `OrderController@show`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "#ORD001",
    "customerId": 1,
    "customer": {
      "id": 1,
      "firstName": "Rajesh",
      "lastName": "Patel",
      "name": "Rajesh Patel",
      "email": "rajesh.patel@email.com",
      "phone": "+91 98765 43210",
      "mobile": "+91 98765 43210",
      "customerCode": "#CUST001"
    },
    "branchId": 1,
    "branch": {
      "id": 1,
      "branchName": "Main Branch",
      "branchCode": "MB001"
    },
    "orderDate": "2024-01-20",
    "dueDate": "2024-02-20",
    "subtotal": 50000,
    "discount": 0,
    "totalAmount": 50000,
    "paidAmount": 30000,
    "remainingAmount": 20000,
    "status": "processing",
    "paymentStatus": "pending",
    "paymentMethod": "upi",
    "items": [
      {
        "id": 1,
        "orderId": 1,
        "packageId": 2,
        "packageName": "Wedding Photography Premium",
        "quantity": 1,
        "unitPrice": 50000,
        "totalPrice": 50000
      }
    ],
    "payments": [
      {
        "id": 1,
        "paymentNumber": "#PAY001",
        "orderId": 1,
        "customerId": 1,
        "paymentDate": "2024-01-20",
        "paymentType": "credit",
        "amount": 30000,
        "paymentMethod": "upi",
        "remarks": "Partial payment received"
      }
    ],
    "links": [
      {
        "id": 1234567890,
        "title": "Photo Share Link",
        "url": "https://example.com/photos"
      },
      {
        "id": 1234567891,
        "title": "Video Link",
        "url": "https://example.com/video"
      }
    ],
    "notes": "Order notes",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  },
  "message": "Order retrieved successfully."
}
```

**Permission Required**: `view_order`

**Frontend Integration**:
- **Service**: `src/services/orderService.js`
- **Method**: `orderService.getOrderById(id)`
- **Used In**:
  - `src/components/pages/orders/OrderForm.jsx` - Edit order form में
  - `src/components/pages/orders/OrderDetailsModal.jsx` - Order details modal में

**Latest UI Behavior (Dec 2025)**:
- Order Details modal payments तालिका अब backend से आने वाले `payment_type` (credit/debit) को badges और color-coded amounts के साथ दिखाती है
- Payment history included in order response (no separate API call needed)
- Payment numbers displayed in #PAY003 format
- API response uses camelCase only (no duplicate snake_case fields)
- Payment status simplified to `pending` or `completed`
- **Important Links CRUD** - Links section moved to left column for better visibility, full CRUD operations (add/edit/delete) with custom titles and URLs

---

### 3. **POST /api/orders**
**Description**: New order create करने के लिए (multiple packages support)

**Backend Controller**: `OrderController@store`

**Request Body**:
```json
{
  "customer_id": 1,
  "branch_id": 1,
  "order_date": "2024-01-20",
  "due_date": "2024-02-20",
  "discount": 0,
  "paid_amount": 0,
  "status": "pending",
  "payment_status": "pending",
  "payment_method": "cash",
  "notes": "Order notes",
  "items": [
    {
      "package_id": 2,
      "quantity": 1,
      "unit_price": 50000
    },
    {
      "package_id": 3,
      "quantity": 2,
      "unit_price": 8000
    }
  ],
  "links": [
    {
      "title": "Photo Share Link",
      "url": "https://example.com/photos"
    }
  ]
}
```

**Note**: `links` field is optional. Links can be managed from Order Details page after order creation.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "#ORD001",
    "customer_id": 1,
    "total_amount": 66000,
    "items": [...],
    "created_at": "2024-01-20T10:30:00.000000Z"
  },
  "message": "Order created successfully."
}
```

**Permission Required**: `create_order`

**Frontend Integration**:
- **Service**: `src/services/orderService.js`
- **Method**: `orderService.createOrder(orderData)`
- **Used In**:
  - `src/components/pages/orders/OrderForm.jsx` - Create order form में

**Note**: Order create होने पर customer stats automatically update होते हैं

---

### 4. **PUT /api/orders/{order}**
**Description**: Existing order update करने के लिए

**Backend Controller**: `OrderController@update`

**Request Body**:
```json
{
  "customer_id": 1,
  "order_date": "2024-01-20",
  "status": "processing",
  "payment_status": "partial",
  "paid_amount": 30000,
  "items": [
    {
      "package_id": 2,
      "quantity": 1,
      "unit_price": 50000
    }
  ],
  "links": [
    {
      "title": "Photo Share Link",
      "url": "https://example.com/photos"
    },
    {
      "title": "Video Link",
      "url": "https://example.com/video"
    }
  ]
}
```

**Note**: `links` field is optional. Can be updated independently from Order Details page. Each link should have `title` (string, max 255) and `url` (valid URL, max 500).

**Response**:
```json
{
  "success": true,
  "data": {...},
  "message": "Order updated successfully."
}
```

**Permission Required**: `edit_order`

**Frontend Integration**:
- **Service**: `src/services/orderService.js`
- **Method**: `orderService.updateOrder(orderId, orderData)`
- **Used In**:
  - `src/components/pages/orders/OrderForm.jsx` - Edit order form में

**Note**: Order update होने पर customer stats automatically update होते हैं

---

### 5. **DELETE /api/orders/{order}**
**Description**: Order delete करने के लिए (soft delete)

**Backend Controller**: `OrderController@destroy`

**Response**:
```json
{
  "success": true,
  "message": "Order deleted successfully."
}
```

**Permission Required**: `delete_order`

**Frontend Integration**:
- **Service**: `src/services/orderService.js`
- **Method**: `orderService.deleteOrder(orderId)`
- **Used In**:
  - `src/views/orders/OrdersList.jsx` - Delete order button click पर

**Note**: Order delete होने पर customer stats automatically update होते हैं

---

### 6. **PUT /api/orders/{order}/status**
**Description**: Order status manually update करने के लिए

**Backend Controller**: `OrderController@updateStatus`

**Request Body**:
```json
{
  "status": "completed"
}
```

**Response**:
```json
{
  "success": true,
  "data": {...},
  "message": "Order status updated successfully."
}
```

**Permission Required**: `edit_order`

**Frontend Integration**:
- **Service**: `src/services/orderService.js`
- **Method**: `orderService.updateOrderStatus(orderId, status)`
- **Used In**:
  - `src/views/orders/OrdersList.jsx` - Manual order status update modal में
  - Order status change करने के लिए

**Note**: This endpoint allows manual override of order status when needed

---

### 7. **PUT /api/orders/{order}/payment-status**
**Description**: Record a payment or refund for an order (legacy endpoint for compatibility)

**Backend Controller**: `OrderController@updatePaymentStatus`

**Request Body**:
```json
{
  "payment_type": "credit",
  "amount": 50000,
  "payment_method": "upi",
  "payment_date": "2024-01-20",
  "remarks": "Payment received"
}
```

**Response**:
```json
{
  "success": true,
  "data": {...},
  "message": "Payment recorded successfully.",
  "payment": {
    "id": 1,
    "paymentNumber": "#PAY001",
    "orderId": 1,
    "paymentType": "credit",
    "amount": 50000,
    "paymentMethod": "upi"
  }
}
```

**Permission Required**: `edit_order`

**Frontend Integration**:
- **Service**: `src/services/orderService.js`
- **Method**: `orderService.updatePaymentStatus(orderId, paymentData)`
- **Used In**:
  - Payment recording from order actions

**Note**: 
- This endpoint creates a payment record and automatically updates order payment status
- Payment status is calculated as `pending` if remaining amount > 0, otherwise `completed`
- Customer stats automatically update होते हैं

---

### 8. **GET /api/orders/stats**
**Description**: Order statistics fetch करने के लिए (with date range filtering)

**Backend Controller**: `OrderController@stats`

**Query Parameters**:
- `start_date` - Start date for filtering (ISO date format)
- `end_date` - End date for filtering (ISO date format)
- `status` - Filter by order status (optional)
- `payment_status` - Filter by payment status (optional)
- `customer_id` - Filter by customer (optional)
- `branch_id` - Filter by branch (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "pendingOrders": 25,
    "processingOrders": 40,
    "completedOrders": 80,
    "cancelledOrders": 5,
    "totalRevenue": 1250000.00,
    "averageOrderValue": 8333.33
  }
}
```

**Permission Required**: `view_order`

**Frontend Integration**:
- **Service**: `src/services/orderService.js`
- **Method**: `orderService.getOrderStats(params)`
- **Used In**:
  - `src/views/orders/OrdersList.jsx` - Order statistics summary cards में

**Note**: This is a separate endpoint from the orders list to avoid duplicate API calls

---

### 9. **GET /api/orders/customer/{customerId}**
**Description**: Specific customer के orders fetch करने के लिए

**Backend Controller**: `OrderController@getByCustomer`

**Query Parameters**:
- `page` - Page number
- `limit` - Items per page
- `status` - Filter by status

**Response**:
```json
{
  "success": true,
  "data": [...],
  "meta": {...}
}
```

**Permission Required**: `view_order`

**Frontend Integration**:
- **Service**: `src/services/orderService.js`
- **Method**: `orderService.getOrdersByCustomer(customerId, params)`
- **Used In**:
  - Customer details में orders list show करने के लिए

---

### 10. **GET /api/orders/{order}/export-pdf**
**Description**: Order invoice PDF export करने के लिए

**Backend Controller**: `OrderController@exportPdf`

**Response**: PDF file download
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="Order_{OrderID}_{CustomerName}.pdf"`

**Permission Required**: `view_order`

**Frontend Integration**:
- **Service**: `src/services/orderService.js`
- **Method**: `orderService.exportOrderPdf(orderId)`
- **Used In**:
  - `src/views/orders/OrdersList.jsx` - Export button in table actions

**PDF Includes**:
- Order details (order number, date, status)
- Customer information
- Order items (packages, quantities, prices)
- Order summary (subtotal, discount, total, paid, due)
- Payment transactions (all payments for this order)
- Business information from invoice settings

**Filename Format**: `Order_{OrderID}_{CustomerName}.pdf`

---

## 💳 Payment Management APIs

### 1. **GET /api/payments**
**Description**: Payments की list fetch करने के लिए (paginated, sortable)

**Backend Controller**: `PaymentController@index`

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `order_id` - Filter by order
- `customer_id` - Filter by customer
- `branch_id` - Filter by branch
- `payment_type` - Filter by type (credit/debit)
- `payment_method` - Filter by method (cash/upi/card/bank_transfer)
- `start_date` - Filter from date
- `end_date` - Filter to date
- `search` - Search term (payment_number, order_number, customer name/email)
- `sort_by` - Sort column
- `sort_direction` - Sort direction

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paymentNumber": "#PAY001",
      "orderId": 1,
      "customerId": 1,
      "paymentDate": "2024-01-20",
      "paymentType": "credit",
      "amount": 50000,
      "paymentMethod": "upi",
      "remarks": "Payment received",
      "order": {
        "id": 1,
        "orderNumber": "#ORD001",
        "totalAmount": 50000,
        "paidAmount": 30000,
        "remainingAmount": 20000,
        "paymentStatus": "pending"
      },
      "customer": {
        "id": 1,
        "firstName": "Rajesh",
        "lastName": "Patel",
        "name": "Rajesh Patel",
        "email": "rajesh.patel@email.com",
        "customerCode": "#CUST001"
      },
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Permission Required**: `view_payment`

**Frontend Integration**:
- **Service**: `src/services/paymentService.js`
- **Method**: `paymentService.getPayments(params)`
- **Used In**:
  - `src/views/transactions/TransactionsList.jsx` - Transactions list में payments show करने के लिए

**Latest Behavior (Nov 2025)**:
- Response objects अब `order` और `customer` के nested स्नैपशॉट के साथ आते हैं (total_amount, paid_amount, balance_amount, paymentStatus, customer totals)
- Transactions UI इन्हीं snapshots को render करता है, इसलिए किसी भी credit/debit के बाद remaining/paid figures तुरंत sync हो जाते हैं
- Payment numbers displayed in #PAY003 format
- API response uses camelCase only (no duplicate snake_case fields)

---

### 2. **POST /api/payments**
**Description**: New payment record करने के लिए

**Backend Controller**: `PaymentController@store`

**Request Body**:
```json
{
  "order_id": 1,
  "payment_date": "2024-01-20",
  "payment_type": "credit",
  "amount": 50000,
  "payment_method": "upi",
  "remarks": "Payment received"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "paymentNumber": "#PAY001",
    "orderId": 1,
    "customerId": 1,
    "paymentDate": "2024-01-20",
    "paymentType": "credit",
    "amount": 50000,
    "paymentMethod": "upi",
    "remarks": "Payment received"
  },
  "message": "Payment recorded successfully."
}
```

**Permission Required**: `create_payment`

**Frontend Integration**:
- **Service**: `src/services/paymentService.js`
- **Method**: `paymentService.createPayment(paymentData)`
- **Used In**:
  - `src/components/pages/payments/PaymentForm.jsx` - Payment form में
  - `src/views/orders/OrdersList.jsx` - Order actions से payment record करने के लिए

**Note**: 
- Payment record होने पर order payment status automatically update होता है
- Customer stats automatically update होते हैं
- Payment number (#PAY001) automatically generate होता है
- Backend हर credit/debit के बाद order & customer totals को re-sync करके updated snapshot response में लौटाता है, जिससे frontend को दोबारा fetch करने की ज़रूरत नहीं होती

---

### 3. **GET /api/payments/{payment}**
**Description**: Specific payment की details fetch करने के लिए

**Backend Controller**: `PaymentController@show`

**Permission Required**: `view_payment`

---

### 4. **PUT /api/payments/{payment}**
**Description**: Payment update करने के लिए

**Backend Controller**: `PaymentController@update`

**Permission Required**: `edit_payment`

**Note**: Payment update होने पर order payment status automatically recalculate होता है और नई response body में fresh order/customer financials शामिल रहते हैं

---

### 5. **DELETE /api/payments/{payment}**
**Description**: Payment delete करने के लिए

**Backend Controller**: `PaymentController@destroy`

**Permission Required**: `delete_payment`

**Note**: Payment delete होने पर order payment status automatically recalculate होता है

---

### 6. **GET /api/payments/order/{orderId}**
**Description**: Specific order के payments fetch करने के लिए

**Backend Controller**: `PaymentController@getByOrder`

**Permission Required**: `view_payment`

---

### 7. **GET /api/payments/{payment}/export-pdf**
**Description**: Payment receipt PDF export करने के लिए

**Backend Controller**: `PaymentController@exportPdf`

**Response**: PDF file download
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="Payment_{PaymentId}_{CustomerName}.pdf"`

**Permission Required**: `view_payment`

**Frontend Integration**:
- **Service**: `src/services/paymentService.js`
- **Method**: `paymentService.exportTransactionPdf(paymentId)`
- **Used In**:
  - `src/views/transactions/TransactionsList.jsx` - Export button in table actions

**PDF Includes**:
- Payment details (payment number, date, amount, type, method, remarks)
- Customer information
- Order reference with financial summary
- Order items table (if available)
- Payment summary
- Branch information
- Business information from invoice settings

**Filename Format**: `Payment_{PaymentId}_{CustomerName}.pdf`

---

## 💰 Financial Management APIs

### Financial Transactions APIs

### 1. **GET /api/financial-transactions**
**Description**: Financial transactions की list fetch करने के लिए (paginated, filterable, searchable)

**Backend Controller**: `FinancialTransactionController@index`

**Query Parameters**:
- `page` - Page number
- `limit` - Items per page
- `search` - Search term (transaction number, description)
- `transaction_type` - Filter by type: 'income', 'expense'
- `category_id` - Filter by category ID
- `start_date` - Filter by start date (YYYY-MM-DD)
- `end_date` - Filter by end date (YYYY-MM-DD)
- `sort_by` - Sort column
- `sort_direction` - Sort direction

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "transactionNumber": "#INC001",
      "transactionType": "income",
      "transactionDate": "2025-12-18",
      "categoryId": 1,
      "category": {
        "id": 1,
        "name": "Photography Services",
        "type": "income"
      },
      "amount": 5000.00,
      "description": "Wedding photography",
      "createdById": 1,
      "createdBy": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2025-12-18T07:38:53.000000Z",
      "updatedAt": "2025-12-18T07:38:53.000000Z"
    }
  ],
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

**Permission Required**: `view_financial_transaction`

**Frontend Integration**:
- **Service**: `src/services/financialService.js`
- **Method**: `financialService.getTransactions(params)`
- **Used In**:
  - `src/views/financial/FinancialTransactionsList.jsx` - Transactions list page में

---

### 2. **GET /api/financial-transactions/{transaction}**
**Description**: Specific transaction की details fetch करने के लिए

**Backend Controller**: `FinancialTransactionController@show`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "transactionNumber": "#INC001",
    "transactionType": "income",
    "transactionDate": "2025-12-18",
    "categoryId": 1,
    "category": {...},
    "amount": 5000.00,
    "description": "Wedding photography",
    "createdBy": {...},
    "createdAt": "2025-12-18T07:38:53.000000Z"
  }
}
```

**Permission Required**: `view_financial_transaction`

**Frontend Integration**:
- **Service**: `src/services/financialService.js`
- **Method**: `financialService.getTransactionById(id)`
- **Used In**:
  - `src/views/financial/FinancialTransactionsList.jsx` - Transaction details modal में

---

### 3. **POST /api/financial-transactions**
**Description**: New financial transaction create करने के लिए

**Backend Controller**: `FinancialTransactionController@store`

**Request Body**:
```json
{
  "transaction_type": "income",
  "transaction_date": "2025-12-18",
  "category_id": 1,
  "amount": 5000.00,
  "description": "Wedding photography"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "transactionNumber": "#INC001",
    "transactionType": "income",
    "transactionDate": "2025-12-18",
    "categoryId": 1,
    "amount": 5000.00,
    "description": "Wedding photography",
    "createdById": 1,
    "createdAt": "2025-12-18T07:38:53.000000Z"
  },
  "message": "Financial transaction created successfully."
}
```

**Permission Required**: `create_financial_transaction`

**Frontend Integration**:
- **Service**: `src/services/financialService.js`
- **Method**: `financialService.createTransaction(transactionData)`
- **Used In**:
  - `src/components/pages/financial/FinancialTransactionForm.jsx` - Create transaction form में

**Notes**:
- Transaction number automatically generate होता है (#INC001, #EXP001 format में)
- `created_by` automatically current user से set होता है

---

### 4. **PUT /api/financial-transactions/{transaction}**
**Description**: Existing transaction update करने के लिए

**Backend Controller**: `FinancialTransactionController@update`

**Request Body**:
```json
{
  "transaction_date": "2025-12-19",
  "category_id": 2,
  "amount": 6000.00,
  "description": "Updated description"
}
```

**Note**: `transaction_type` cannot be changed after creation

**Permission Required**: `edit_financial_transaction`

**Frontend Integration**:
- **Service**: `src/services/financialService.js`
- **Method**: `financialService.updateTransaction(id, transactionData)`
- **Used In**:
  - `src/components/pages/financial/FinancialTransactionForm.jsx` - Edit transaction form में

---

### 5. **DELETE /api/financial-transactions/{transaction}**
**Description**: Transaction delete करने के लिए

**Backend Controller**: `FinancialTransactionController@destroy`

**Response**:
```json
{
  "success": true,
  "message": "Financial transaction deleted successfully."
}
```

**Permission Required**: `delete_financial_transaction`

**Frontend Integration**:
- **Service**: `src/services/financialService.js`
- **Method**: `financialService.deleteTransaction(id)`
- **Used In**:
  - `src/views/financial/FinancialTransactionsList.jsx` - Delete transaction button पर

---

### 6. **GET /api/financial-transactions/stats**
**Description**: Financial statistics fetch करने के लिए

**Backend Controller**: `FinancialTransactionController@stats`

**Query Parameters**:
- `start_date` - Start date for statistics (optional)
- `end_date` - End date for statistics (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalIncome": 50000.00,
    "totalExpenses": 20000.00,
    "netProfit": 30000.00,
    "incomeByCategory": [
      {
        "categoryId": 1,
        "categoryName": "Photography Services",
        "total": 30000.00
      }
    ],
    "expensesByCategory": [
      {
        "categoryId": 5,
        "categoryName": "Equipment",
        "total": 15000.00
      }
    ],
    "monthlyTrends": [
      {
        "month": "2025-12",
        "income": 50000.00,
        "expenses": 20000.00
      }
    ]
  }
}
```

**Permission Required**: `view_financial_transaction`

**Frontend Integration**:
- **Service**: `src/services/financialService.js`
- **Method**: `financialService.getStats(params)`
- **Used In**:
  - `src/views/financial/FinancialTransactionsList.jsx` - Statistics cards में

---

### Financial Categories APIs

### 7. **GET /api/financial-categories**
**Description**: Financial categories की list fetch करने के लिए (paginated, filterable, searchable)

**Backend Controller**: `FinancialCategoryController@index`

**Query Parameters**:
- `page` - Page number
- `limit` - Items per page
- `search` - Search term (category name, description)
- `type` - Filter by type: 'income', 'expense'
- `status` - Filter by status: 'active', 'inactive'
- `sort_by` - Sort column
- `sort_direction` - Sort direction

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "income",
      "name": "Photography Services",
      "description": "Income from photography services",
      "status": "active",
      "createdAt": "2025-12-18T07:38:53.000000Z",
      "updatedAt": "2025-12-18T07:38:53.000000Z"
    }
  ],
  "meta": {
    "total": 20,
    "page": 1,
    "limit": 25,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**Permission Required**: `view_financial_category`

**Frontend Integration**:
- **Service**: `src/services/financialCategoryService.js`
- **Method**: `financialCategoryService.getCategories(params)`
- **Used In**:
  - `src/views/financial/FinancialCategoriesList.jsx` - Categories list page में
  - `src/components/pages/financial/FinancialTransactionForm.jsx` - Category dropdown में

---

### 8. **GET /api/financial-categories/{category}**
**Description**: Specific category की details fetch करने के लिए

**Backend Controller**: `FinancialCategoryController@show`

**Permission Required**: `view_financial_category`

**Frontend Integration**:
- **Service**: `src/services/financialCategoryService.js`
- **Method**: `financialCategoryService.getCategoryById(id)`

---

### 9. **POST /api/financial-categories**
**Description**: New financial category create करने के लिए

**Backend Controller**: `FinancialCategoryController@store`

**Request Body**:
```json
{
  "type": "income",
  "name": "Photography Services",
  "description": "Income from photography services",
  "status": "active"
}
```

**Validation Rules**:
- `type` - Required, enum: 'income', 'expense'
- `name` - Required, unique per type
- `description` - Optional
- `status` - Required, enum: 'active', 'inactive'

**Permission Required**: `create_financial_category`

**Frontend Integration**:
- **Service**: `src/services/financialCategoryService.js`
- **Method**: `financialCategoryService.createCategory(categoryData)`
- **Used In**:
  - `src/components/pages/financial/FinancialCategoryForm.jsx` - Create category form में

---

### 10. **PUT /api/financial-categories/{category}**
**Description**: Existing category update करने के लिए

**Backend Controller**: `FinancialCategoryController@update`

**Request Body**:
```json
{
  "name": "Updated Category Name",
  "description": "Updated description",
  "status": "active"
}
```

**Note**: `type` cannot be changed after creation

**Permission Required**: `edit_financial_category`

**Frontend Integration**:
- **Service**: `src/services/financialCategoryService.js`
- **Method**: `financialCategoryService.updateCategory(id, categoryData)`
- **Used In**:
  - `src/components/pages/financial/FinancialCategoryForm.jsx` - Edit category form में

---

### 11. **DELETE /api/financial-categories/{category}**
**Description**: Category delete करने के लिए

**Backend Controller**: `FinancialCategoryController@destroy`

**Response**:
```json
{
  "success": true,
  "message": "Financial category deleted successfully."
}
```

**Note**: Category cannot be deleted if it has associated transactions

**Permission Required**: `delete_financial_category`

**Frontend Integration**:
- **Service**: `src/services/financialCategoryService.js`
- **Method**: `financialCategoryService.deleteCategory(id)`
- **Used In**:
  - `src/views/financial/FinancialCategoriesList.jsx` - Delete category button पर

---

### 12. **GET /api/financial-categories/by-type/{type}**
**Description**: Categories को type के basis पर fetch करने के लिए

**Backend Controller**: `FinancialCategoryController@getByType`

**Path Parameter**:
- `type` - 'income' or 'expense'

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "income",
      "name": "Photography Services",
      "status": "active"
    }
  ]
}
```

**Permission Required**: `view_financial_category`

**Frontend Integration**:
- **Service**: `src/services/financialCategoryService.js`
- **Method**: `financialCategoryService.getCategoriesByType(type)`
- **Used In**:
  - `src/components/pages/financial/FinancialTransactionForm.jsx` - Category dropdown में type change पर

---

## 📊 Report Management APIs

### 1. **GET /api/reports/company-health**
**Description**: Company health report data fetch करने के लिए (orders, payments, income, expenses summary)

**Backend Controller**: `ReportController@companyHealth`

**Permissions Required**: `view_report`

**Query Parameters**:
- `start_date` - Start date (ISO date format, optional, default: current year Jan 1st)
- `end_date` - End date (ISO date format, optional, default: current year Dec 31st)
- `branch_id` - Filter by branch (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "dateRange": {
      "start": "2025-01-01",
      "end": "2025-12-31"
    },
    "branchName": "Main Branch",
    "financialSummary": {
      "totalOrders": 150,
      "totalRevenue": 1250000.00,
      "netPayments": 1000000.00,
      "outstandingAmount": 250000.00
    },
    "allCustomers": [
      {
        "customerId": 1,
        "customerCode": "#CUST001",
        "name": "Rajesh Patel",
        "email": "rajesh@example.com",
        "phone": "+91 98765 43210",
        "branchName": "Main Branch",
        "totalOrderAmount": 50000.00,
        "paidAmount": 30000.00,
        "remainingAmount": 20000.00
      }
    ],
    "incomeExpenses": {
      "totalRecords": 50,
      "totalIncome": 200000.00,
      "totalExpenses": 75000.00,
      "netProfit": 125000.00,
      "incomeByCategory": [
        {
          "category": "Photography Services",
          "amount": 150000.00
        }
      ],
      "expensesByCategory": [
        {
          "category": "Equipment",
          "amount": 50000.00
        }
      ]
    },
    "incomeRecords": [
      {
        "id": 1,
        "date": "2025-12-18",
        "category": "Photography Services",
        "description": "Wedding photography",
        "amount": 5000.00
      }
    ],
    "expenseRecords": [
      {
        "id": 1,
        "date": "2025-12-18",
        "category": "Equipment",
        "description": "Camera purchase",
        "amount": 25000.00
      }
    ],
    "financialOverview": {
      "incomingFlow": 1200000.00,
      "expenseFlow": 75000.00,
      "companyProfit": 1125000.00,
      "outstanding": 250000.00
    }
  }
}
```

**Frontend Integration**:
- **Service**: `src/services/reportService.js`
- **Method**: `reportService.getCompanyHealthReport(params)`
- **Used In**:
  - `src/views/reports/CompanyHealthReport.jsx` - Company Health Report page

**Calculation Details**:
- **Total Revenue**: Sum of all order `total_amount` within date range
- **Net Payments**: Sum of all payment `amount` where `payment_type = 'credit'` minus sum where `payment_type = 'debit'` for orders within date range
- **Outstanding Amount**: `totalRevenue - netPayments`
- **Incoming Flow**: `netPayments + totalIncome` (from financial transactions)
- **Expense Flow**: `totalExpenses` (from financial transactions)
- **Company Profit**: `incomingFlow - expenseFlow`
- **Outstanding**: `outstandingAmount` (from orders)

---

### 2. **GET /api/reports/company-health/export-pdf**
**Description**: Company Health Report PDF export करने के लिए

**Backend Controller**: `ReportController@exportPdf`

**Permissions Required**: `view_report`

**Query Parameters**:
- `start_date` - Start date (ISO date format, optional)
- `end_date` - End date (ISO date format, optional)
- `branch_id` - Filter by branch (optional)

**Response**: PDF file download
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="Company_Health_Report_{DateRange}.pdf"`

**Frontend Integration**:
- **Service**: `src/services/reportService.js`
- **Method**: `reportService.exportCompanyHealthReportPdf(params)`
- **Used In**:
  - `src/views/reports/CompanyHealthReport.jsx` - Export PDF button

**PDF Includes**:
- Company information (logo, business name, address, contact)
- Report info (date range, generated date, branch)
- Order Summary section (summary cards, all customers table)
- Income & Expense Summary section (summary cards, category breakdowns, income/expense records)
- Financial Overview section (incoming flow, expense flow, company profit, outstanding)
- Colorful design with light backgrounds and colored borders

---

## ⚙️ Settings Management APIs

### 1. **GET /api/global-settings/**
**Description**: सभी settings fetch करने के लिए

**Backend Controller**: `SettingController@listAll`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "key": "app_name",
      "value": "Photo Studio",
      "section": "general",
      "type": "string",
      "description": "Application name"
    }
  ]
}
```

**Permission Required**: `view_setting`

**Frontend Integration**:
- **Service**: `src/services/settingsService.js`
- **Method**: `settingsService.getSettings()`
- **Used In**:
  - `src/views/settings/Settings.jsx` - Settings page में सभी settings load करने के लिए

---

### 2. **GET /api/global-settings/by-section**
**Description**: सभी sections और उनकी settings fetch करने के लिए

**Backend Controller**: `SettingController@listBySection`

**Response**:
```json
{
  "success": true,
  "data": {
    "general": {
      "app_name": {
        "id": 1,
        "key": "app_name",
        "value": "Photo Studio",
        "section": "general"
      }
    },
    "email": {
      "smtp_host": {
        "id": 2,
        "key": "smtp_host",
        "value": "smtp.example.com",
        "section": "email"
      }
    }
  }
}
```

**Permission Required**: `view_setting`

**Frontend Integration**:
- **Service**: `src/services/settingsService.js`
- **Method**: `settingsService.getAllSections()`
- **Used In**:
  - `src/views/settings/Settings.jsx` - Settings page में sections load करने के लिए

---

### 3. **GET /api/global-settings/by-section/{section}**
**Description**: Specific section की settings fetch करने के लिए

**Backend Controller**: `SettingController@getSection`

**Response**:
```json
{
  "success": true,
  "data": {
    "app_name": {
      "id": 1,
      "key": "app_name",
      "value": "Photo Studio",
      "section": "general"
    }
  }
}
```

**Permission Required**: `view_setting`

**Frontend Integration**:
- **Service**: `src/services/settingsService.js`
- **Method**: `settingsService.getSettingsBySection(section)`
- **Used In**:
  - `src/views/settings/Settings.jsx` - Specific section की settings load करने के लिए

---

### 4. **GET /api/global-settings/key/{key}**
**Description**: Specific setting key से value fetch करने के लिए

**Backend Controller**: `SettingController@showByKey`

**Query Parameters**:
- `section` - Optional section filter

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "key": "app_name",
    "value": "Photo Studio",
    "section": "general",
    "type": "string"
  }
}
```

**Permission Required**: `view_setting`

**Frontend Integration**:
- **Service**: `src/services/settingsService.js`
- **Method**: `settingsService.getSettingByKey(key, section)`
- **Used In**:
  - Specific setting value fetch करने के लिए

---

### 5. **POST /api/global-settings/**
**Description**: New setting create करने के लिए

**Backend Controller**: `SettingController@store`

**Request Body**:
```json
{
  "key": "new_setting",
  "value": "setting value",
  "section": "general",
  "type": "string",
  "description": "Setting description"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "key": "new_setting",
    "value": "setting value",
    "section": "general",
    "type": "string"
  }
}
```

**Permission Required**: `edit_setting`

**Frontend Integration**:
- **Service**: `src/services/settingsService.js`
- **Method**: `settingsService.createSetting(settingData)`
- **Used In**:
  - `src/views/settings/Settings.jsx` - New setting add करने के लिए

---

### 6. **PUT /api/global-settings/{setting}**
**Description**: Existing setting update करने के लिए

**Backend Controller**: `SettingController@update`

**Request Body**:
```json
{
  "value": "updated value",
  "type": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "key": "app_name",
    "value": "updated value",
    "section": "general"
  }
}
```

**Permission Required**: `edit_setting`

**Frontend Integration**:
- **Service**: `src/services/settingsService.js`
- **Method**: `settingsService.updateSetting(id, settingData)`
- **Used In**:
  - `src/views/settings/Settings.jsx` - Setting update करने के लिए

---

### 7. **PUT /api/global-settings/key/{key}**
**Description**: Setting key से directly update करने के लिए

**Backend Controller**: `SettingController@updateByKey`

**Request Body**:
```json
{
  "value": "updated value"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "key": "app_name",
    "value": "updated value"
  }
}
```

**Permission Required**: `edit_setting`

**Frontend Integration**:
- **Service**: `src/services/settingsService.js`
- **Method**: `settingsService.updateSettingByKey(key, value, section)`
- **Used In**:
  - `src/views/settings/Settings.jsx` - Quick setting update करने के लिए

---

### 8. **POST /api/settings/{group}**
**Description**: Settings group (section) को bulk update करने के लिए

**Backend Controller**: `SettingController@updateGroup`

**Request Body**:
```json
{
  "app_name": "Photo Studio",
  "app_version": "1.0.0",
  "timezone": "UTC"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "app_name": {...},
    "app_version": {...},
    "timezone": {...}
  }
}
```

**Permission Required**: `edit_setting`

**Frontend Integration**:
- **Service**: `src/services/settingsService.js`
- **Method**: `settingsService.updateSettingsGroup(section, settings)`
- **Used In**:
  - `src/views/settings/Settings.jsx` - Settings section save करने के लिए

**Usage Example**:
```javascript
import settingsService from '../services/settingsService'

const handleSaveSettings = async (section, settingsData) => {
  const result = await settingsService.updateSettingsGroup(section, settingsData)
  
  if (result.success) {
    toast.success('Settings saved successfully')
  }
}
```

---

### 9. **POST /api/settings/test-s3**
**Description**: S3 connection test करने के लिए

**Backend Controller**: `SettingController@testS3`

**Request Body**:
```json
{
  "aws_access_key_id": "AKIA...",
  "aws_secret_access_key": "secret...",
  "aws_default_region": "us-east-1",
  "aws_bucket": "bucket-name"
}
```

**Response**:
```json
{
  "success": true,
  "message": "S3 connection successful"
}
```

**Permission Required**: `edit_setting`

**Frontend Integration**:
- **Service**: `src/services/settingsService.js`
- **Method**: `settingsService.testS3Connection(s3Config)`
- **Used In**:
  - `src/views/settings/Settings.jsx` - S3 settings में test connection button

---

### 10. **POST /api/settings/test-email**
**Description**: Email configuration test करने के लिए (uses database email settings)

**Backend Controller**: `SettingController@testEmail`

**Request Body**:
```json
{
  "email": "test@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Test email sent successfully to test@example.com"
}
```

**Permission Required**: `edit_setting`

**Frontend Integration**:
- **Service**: `src/services/settingsService.js`
- **Method**: `settingsService.sendTestEmail(email)`
- **Used In**:
  - `src/views/settings/Settings.jsx` - Email settings में test email button

**Note**: Email settings database से load होती हैं, test email भेजने से पहले settings configure करें

---

### 11. **POST /api/settings/upload-logo**
**Description**: Business logo upload करने के लिए

**Backend Controller**: `SettingController@uploadLogo`

**Request**: `multipart/form-data`
- `logo` - Image file (required, JPEG/PNG/WebP, max 2MB)

**Response**:
```json
{
  "success": true,
  "message": "Logo uploaded successfully",
  "data": {
    "path": "logos/business_logo_1234567890_abc123.jpg",
    "url": "https://lvclicks.in/admin/api/storage/logos/business_logo_1234567890_abc123.jpg"
  }
}
```

**Permission Required**: `edit_setting`

**Frontend Integration**:
- **Service**: `src/services/settingsService.js`
- **Method**: `settingsService.uploadLogo(file)`
- **Used In**:
  - `src/views/settings/Settings.jsx` - Business Information section में logo upload

**Note**: 
- Old logo automatically deleted before uploading new one
- Logo stored in `storage/app/public/logos/`
- Files served via custom handler at `/admin/api/storage/logos/*` (no symlink required)
- Logo URL stored in settings table (key: `business_logo`)

---

### 12. **DELETE /api/settings/delete-logo**
**Description**: Business logo delete करने के लिए

**Backend Controller**: `SettingController@deleteLogo`

**Response**:
```json
{
  "success": true,
  "message": "Logo deleted successfully"
}
```

**Permission Required**: `edit_setting`

**Frontend Integration**:
- **Service**: `src/services/settingsService.js`
- **Method**: `settingsService.deleteLogo()`
- **Used In**:
  - `src/views/settings/Settings.jsx` - Business Information section में logo delete

---

### 13. **POST /api/users/profile/avatar**
**Description**: User profile avatar upload करने के लिए

**Backend Controller**: `UserController@uploadAvatar`

**Request**: `multipart/form-data`
- `avatar` - Image file (required, JPEG/PNG/WebP, max 2MB)

**Response**:
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "avatars/avatar_user_1_1234567890_abc123.jpg",
    "avatar_url": "https://lvclicks.in/admin/api/storage/avatars/avatar_user_1_1234567890_abc123.jpg"
  }
}
```

**Permission Required**: Authenticated user (own profile only)

**Frontend Integration**:
- **Service**: `src/services/profileService.js`
- **Method**: `profileService.uploadAvatar(file)`
- **Used In**:
  - `src/components/pages/users/ProfilePictureSection.jsx` - Profile picture upload

**Note**: 
- Old avatar automatically deleted before uploading new one
- Avatar stored in `storage/app/public/avatars/`
- Files served via custom handler at `/admin/api/storage/avatars/*` (no symlink required)
- Filename format: `avatar_user_{userId}_{timestamp}_{uniqid}.{ext}`

---

### 14. **DELETE /api/users/profile/avatar**
**Description**: User profile avatar delete करने के लिए

**Backend Controller**: `UserController@deleteAvatar`

**Response**:
```json
{
  "success": true,
  "message": "Avatar deleted successfully",
  "data": {
    "id": 1,
    "avatar": null,
    "avatar_url": null
  }
}
```

**Permission Required**: Authenticated user (own profile only)

**Frontend Integration**:
- **Service**: `src/services/profileService.js`
- **Method**: `profileService.deleteAvatar()`
- **Used In**:
  - `src/components/pages/users/ProfilePictureSection.jsx` - Profile picture delete

---

## 🍽️ Restaurant Management APIs

### Restaurant Settings APIs

### 1. **GET /api/restaurant-settings/**
**Description**: सभी restaurant settings fetch करने के लिए (grouped by section)

**Backend Controller**: `RestaurantSettingsController@index`

**Query Parameters**:
- `section` - Optional section filter ('GST Settings', 'Invoice Settings', 'Thermal Printer')

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "key": "cgst_percentage",
      "value": "2.5",
      "section": "GST Settings",
      "description": null,
      "created_at": "2025-01-20T00:00:00.000000Z",
      "updated_at": "2025-01-20T00:00:00.000000Z"
    }
  ]
}
```

**Permission Required**: `view_restaurant_settings`

**Frontend Integration**:
- **Service**: `src/services/restaurantSettingsService.js`
- **Method**: `restaurantSettingsService.getRestaurantSettings()`
- **Used In**: `src/views/restaurant/settings/RestaurantSettings.jsx`

---

### 2. **GET /api/restaurant-settings/by-section**
**Description**: सभी sections और उनकी settings fetch करने के लिए (grouped format)

**Backend Controller**: `RestaurantSettingsController@listBySection`

**Response**:
```json
{
  "success": true,
  "data": {
    "GST Settings": {
      "cgst_percentage": "2.5",
      "sgst_percentage": "2.5",
      "service_tax_percentage": "0",
      "round_number_enabled": "false"
    },
    "Invoice Settings": {
      "invoice_prefix": "BILL",
      "invoice_business_name": "Teja Hotel",
      "invoice_business_address": "123 Main St",
      "invoice_contact_phone": "+91 98765 43210",
      "invoice_contact_email": "info@tejahotel.com",
      "invoice_footer_text": "Thank you for visiting!",
      "invoice_other_text": ""
    },
    "Thermal Printer": {
      "printer_name": "Kitchen Printer",
      "printer_ip": "192.168.1.100",
      "printer_port": "9100",
      "paper_width": "80",
      "enabled": "true"
    }
  }
}
```

**Permission Required**: `view_restaurant_settings`

**Frontend Integration**:
- **Service**: `src/services/restaurantSettingsService.js`
- **Method**: `restaurantSettingsService.getAllSections()`
- **Used In**: `src/views/restaurant/settings/RestaurantSettings.jsx` - Initial data load

---

### 3. **GET /api/restaurant-settings/by-section/{section}**
**Description**: Specific section की settings fetch करने के लिए

**Backend Controller**: `RestaurantSettingsController@getSection`

**Path Parameter**:
- `section` - Section name ('GST Settings', 'Invoice Settings', 'Thermal Printer')

**Response**:
```json
{
  "success": true,
  "data": {
    "default_gst_percentage": "5",
    "gst_calculation_method": "bill_total"
  }
}
```

**Permission Required**: `view_restaurant_settings`

**Frontend Integration**:
- **Service**: `src/services/restaurantSettingsService.js`
- **Method**: `restaurantSettingsService.getSettingsBySection(section)`

---

### 4. **GET /api/restaurant-settings/key/{key}**
**Description**: Specific setting key से value fetch करने के लिए

**Backend Controller**: `RestaurantSettingsController@showByKey`

**Query Parameters**:
- `section` - Optional section filter

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "key": "default_gst_percentage",
    "value": "5",
    "section": "GST Settings"
  }
}
```

**Permission Required**: `view_restaurant_settings`

---

### 5. **POST /api/restaurant-settings/**
**Description**: New restaurant setting create करने के लिए (or update if exists)

**Backend Controller**: `RestaurantSettingsController@store`

**Request Body**:
```json
{
  "key": "cgst_percentage",
  "value": "2.5",
  "section": "GST Settings",
  "type": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "key": "default_gst_percentage",
    "value": "5",
    "section": "GST Settings"
  },
  "message": "Setting saved successfully"
}
```

**Permission Required**: `edit_restaurant_settings`

**Frontend Integration**:
- **Service**: `src/services/restaurantSettingsService.js`
- **Method**: `restaurantSettingsService.updateSetting(key, value, section, type)`
- **Used In**: `src/views/restaurant/settings/RestaurantSettings.jsx` - Single field save

---

### 6. **POST /api/restaurant-settings/bulk**
**Description**: Multiple settings को bulk update करने के लिए

**Backend Controller**: `RestaurantSettingsController@bulkUpdate`

**Request Body**:
```json
{
  "settings": [
    {
      "key": "default_gst_percentage",
      "value": "5",
      "section": "GST Settings",
      "type": "string"
    },
    {
      "key": "invoice_prefix",
      "value": "BILL",
      "section": "Invoice Settings",
      "type": "string"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

**Permission Required**: `edit_restaurant_settings`

**Frontend Integration**:
- **Service**: `src/services/restaurantSettingsService.js`
- **Method**: `restaurantSettingsService.updateAllSettings(settingsData)`
- **Used In**: `src/views/restaurant/settings/RestaurantSettings.jsx` - Section-wide save

**Note**: Supports both array format (from frontend) and object format (alternative)

---

### Food Categories APIs

### 7. **GET /api/food-categories**
**Description**: Food categories की list fetch करने के लिए (paginated, sortable, searchable)

**Backend Controller**: `FoodCategoryController@index`

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search term (name, description में search)
- `status` - Filter by status (active/inactive)
- `sort_by` - Sort column (name, display_order, status, created_at)
- `sort_direction` - Sort direction (asc/desc)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Course",
      "description": "Main course dishes",
      "display_order": 1,
      "status": "active",
      "created_at": "2025-01-20T00:00:00.000000Z",
      "updated_at": "2025-01-20T00:00:00.000000Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**Permission Required**: `view_food_category`

**Frontend Integration**:
- **Service**: `src/services/menuService.js`
- **Method**: `menuService.getCategories()`
- **Used In**: `src/views/restaurant/MenuManagement.jsx` - Menu management page

---

### 8. **GET /api/food-categories/{category}**
**Description**: Specific food category की details fetch करने के लिए

**Backend Controller**: `FoodCategoryController@show`

**Permission Required**: `view_food_category`

---

### 9. **POST /api/food-categories**
**Description**: New food category create करने के लिए

**Backend Controller**: `FoodCategoryController@store`

**Request Body**:
```json
{
  "name": "Main Course",
  "description": "Main course dishes",
  "display_order": 1,
  "status": "active"
}
```

**Permission Required**: `create_food_category`

---

### 10. **PUT /api/food-categories/{category}**
**Description**: Existing food category update करने के लिए

**Backend Controller**: `FoodCategoryController@update`

**Permission Required**: `edit_food_category`

---

### 11. **DELETE /api/food-categories/{category}**
**Description**: Food category delete करने के लिए (soft delete)

**Backend Controller**: `FoodCategoryController@destroy`

**Permission Required**: `delete_food_category`

---

### Food Items APIs

### 12. **GET /api/food-items**
**Description**: Food items की list fetch करने के लिए (paginated, sortable, searchable)

**Backend Controller**: `FoodItemController@index`

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search term (name, description में search)
- `category_id` - Filter by food category
- `status` - Filter by status (active/inactive)
- `is_veg` - Filter by veg/non-veg (true/false)
- `sort_by` - Sort column (name, price, category, status, created_at)
- `sort_direction` - Sort direction (asc/desc)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "food_category_id": 1,
      "category_name": "Main Course",
      "name": "Butter Chicken",
      "description": "Creamy butter chicken",
      "price": "250.00",
      "is_veg": false,
      "status": "active",
      "created_at": "2025-01-20T00:00:00.000000Z",
      "updated_at": "2025-01-20T00:00:00.000000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Permission Required**: `view_food_item`

**Frontend Integration**:
- **Service**: To be created (`src/services/foodItemService.js`)
- **Used In**: Food Items list page (to be implemented)

---

### 13. **GET /api/food-items/{item}**
**Description**: Specific food item की details fetch करने के लिए

**Backend Controller**: `FoodItemController@show`

**Permission Required**: `view_food_item`

---

### 14. **POST /api/food-items**
**Description**: New food item create करने के लिए

**Backend Controller**: `FoodItemController@store`

**Request Body**:
```json
{
  "food_category_id": 1,
  "name": "Butter Chicken",
  "description": "Creamy butter chicken",
  "price": 250.00,
  "is_veg": false,
  "status": "active"
}
```

**Permission Required**: `create_food_item`

---

### 15. **PUT /api/food-items/{item}**
**Description**: Existing food item update करने के लिए

**Backend Controller**: `FoodItemController@update`

**Request Body**:
```json
{
  "name": "Butter Chicken",
  "description": "Creamy butter chicken",
  "price": 250.00,
  "is_veg": false,
  "status": "active",
  "display_order": 1
}
```

**Note**: 
- `image` field should NOT be included in update payload if no new image is being uploaded (existing image will be preserved)
- If `image` field is omitted, the existing image in database remains unchanged
- Image upload should be done separately via `POST /api/food-items/{item}/upload-image` endpoint

**Permission Required**: `edit_food_item`

---

### 16. **DELETE /api/food-items/{item}**
**Description**: Food item delete करने के लिए (soft delete)

**Backend Controller**: `FoodItemController@destroy`

**Permission Required**: `delete_food_item`

---

### 17. **POST /api/food-items/{item}/upload-image**
**Description**: Food item की image upload करने के लिए

**Backend Controller**: `FoodItemController@uploadImage`

**Request**: `multipart/form-data`
- `image` - Image file (required, JPEG/PNG/WebP, max 2MB)

**Response**:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "path": "food-items/food_item_1_1234567890_abc123.jpg",
    "url": "http://localhost:8000/admin/api/storage/food-items/food_item_1_1234567890_abc123.jpg"
  }
}
```

**Permission Required**: `edit_food_item`

**Frontend Integration**:
- **Service**: `src/services/menuService.js`
- **Method**: `menuService.uploadItemImage(itemId, file)`
- **Used In**: `src/views/restaurant/MenuManagement.jsx` - Item form में image upload

**Note**: 
- Old image automatically deleted before uploading new one
- Image stored in `storage/app/public/food-items/`
- Files served via custom handler at `/admin/api/storage/food-items/*` (no symlink required)
- Filename format: `food_item_{itemId}_{timestamp}_{uniqid}.{ext}`

---

### 18. **DELETE /api/food-items/{item}/image**
**Description**: Food item की image delete करने के लिए

**Backend Controller**: `FoodItemController@deleteImage`

**Response**:
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Permission Required**: `edit_food_item`

**Frontend Integration**:
- **Service**: `src/services/menuService.js`
- **Method**: `menuService.deleteItemImage(itemId)`
- **Used In**: `src/views/restaurant/MenuManagement.jsx` - Item form में image remove

---

### 19. **POST /api/food-items/{item}/move-up**
**Description**: Food item को category में up (पहले) move करने के लिए

**Backend Controller**: `FoodItemController@moveUp`

**Response**:
```json
{
  "success": true,
  "message": "Item moved up successfully"
}
```

**Permission Required**: `edit_food_item`

**Note**: Swaps `display_order` with the item above it in the same category

---

### 20. **POST /api/food-items/{item}/move-down**
**Description**: Food item को category में down (बाद में) move करने के लिए

**Backend Controller**: `FoodItemController@moveDown`

**Response**:
```json
{
  "success": true,
  "message": "Item moved down successfully"
}
```

**Permission Required**: `edit_food_item`

**Note**: Swaps `display_order` with the item below it in the same category

---

### 21. **GET /api/food-categories/hierarchy**
**Description**: Food categories और उनके items को hierarchical format में fetch करने के लिए

**Backend Controller**: `FoodCategoryController@hierarchy`

**Query Parameters**:
- `status` - Filter by category status (active/inactive, optional)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Course",
      "description": "Main course dishes",
      "display_order": 1,
      "status": "active",
      "items": [
        {
          "id": 1,
      "name": "Butter Chicken",
      "description": "Creamy butter chicken",
      "price": "250.00",
      "is_veg": false,
      "status": "active",
          "image": "http://localhost:8000/admin/api/storage/food-items/food_item_1_1234567890_abc123.jpg",
          "display_order": 1,
          "category_name": "Main Course"
        }
      ]
    }
  ]
}
```

**Permission Required**: `view_food_category`

**Frontend Integration**:
- **Service**: `src/services/menuService.js`
- **Method**: `menuService.getMenuHierarchy()`
- **Used In**: `src/views/restaurant/MenuManagement.jsx` - Main menu display

**Note**: 
- Items are automatically sorted by `display_order` (asc) then `name` (asc)
- Only active items are included in the response
- Image URLs are fully qualified with `/admin/api/storage/` prefix

---

### Table Management APIs

### 22. **GET /api/tables**
**Description**: Tables की list fetch करने के लिए (paginated, sortable, searchable, filterable)

**Backend Controller**: `TableController@index`

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 25, max: 100)
- `search` - Search term (table_number, table_name में search)
- `status` - Filter by status (available, occupied, reserved, cleaning, maintenance)
- `is_active` - Filter by active status (true/false)
- `sort_by` - Sort column (table_number, table_name, capacity, status, is_active, created_at)
- `sort_direction` - Sort direction (asc/desc)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tableNumber": "T1",
      "table_number": "T1",
      "tableName": null,
      "table_name": null,
      "capacity": 4,
      "status": "available",
      "isActive": true,
      "is_active": true,
      "createdAt": "2025-01-21T00:00:00.000000Z",
      "created_at": "2025-01-21T00:00:00.000000Z",
      "updatedAt": "2025-01-21T00:00:00.000000Z",
      "updated_at": "2025-01-21T00:00:00.000000Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 25,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false,
    "sortBy": "table_number",
    "sortDirection": "asc"
  }
}
```

**Note**: Response includes all records in `data` field (not paginated), while `meta` contains pagination information.

**Permission Required**: `view_table`

**Frontend Integration**:
- **Service**: `src/services/tableService.js`
- **Method**: `tableService.getTables(params)`
- **Used In**: `src/views/restaurant/TablesList.jsx` - Tables list page

---

### 23. **GET /api/tables/{table}**
**Description**: Specific table की details fetch करने के लिए

**Backend Controller**: `TableController@show`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tableNumber": "T1",
    "table_number": "T1",
    "tableName": null,
    "table_name": null,
    "capacity": 4,
    "status": "available",
    "isActive": true,
    "is_active": true,
    "createdAt": "2025-01-21T00:00:00.000000Z",
    "updatedAt": "2025-01-21T00:00:00.000000Z"
  },
  "message": "Table retrieved successfully."
}
```

**Permission Required**: `view_table`

**Frontend Integration**:
- **Service**: `src/services/tableService.js`
- **Method**: `tableService.getTableById(id)`

---

### 24. **POST /api/tables**
**Description**: New table create करने के लिए

**Backend Controller**: `TableController@store`

**Request Body**:
```json
{
  "table_number": "T1",
  "table_name": "Window Table",
  "capacity": 4,
  "status": "available",
  "is_active": true
}
```

**Validation Rules**:
- `table_number` - Required, string, max 50 characters, unique
- `table_name` - Optional, string, max 255 characters
- `capacity` - Required, integer, min 1, max 50
- `status` - Required, enum: 'available', 'occupied', 'reserved', 'cleaning', 'maintenance'
- `is_active` - Optional, boolean, default: true

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tableNumber": "T1",
    "table_number": "T1",
    "tableName": "Window Table",
    "table_name": "Window Table",
    "capacity": 4,
    "status": "available",
    "isActive": true,
    "is_active": true,
    "createdAt": "2025-01-21T00:00:00.000000Z",
    "updatedAt": "2025-01-21T00:00:00.000000Z"
  },
  "message": "Table created successfully."
}
```

**Permission Required**: `create_table`

**Frontend Integration**:
- **Service**: `src/services/tableService.js`
- **Method**: `tableService.createTable(tableData)`
- **Used In**: `src/components/pages/restaurant/TableForm.jsx` - Create table form

---

### 25. **PUT /api/tables/{table}**
**Description**: Existing table update करने के लिए

**Backend Controller**: `TableController@update`

**Request Body**:
```json
{
  "table_number": "T1",
  "table_name": "VIP Window Table",
  "capacity": 6,
  "status": "occupied",
  "is_active": true
}
```

**Validation Rules**:
- `table_number` - Optional, string, max 50 characters, unique (ignoring current table)
- `table_name` - Optional, string, max 255 characters
- `capacity` - Optional, integer, min 1, max 50
- `status` - Optional, enum: 'available', 'occupied', 'reserved', 'cleaning', 'maintenance'
- `is_active` - Optional, boolean

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tableNumber": "T1",
    "table_number": "T1",
    "tableName": "VIP Window Table",
    "table_name": "VIP Window Table",
    "capacity": 6,
    "status": "occupied",
    "isActive": true,
    "is_active": true,
    "updatedAt": "2025-01-21T00:00:00.000000Z"
  },
  "message": "Table updated successfully."
}
```

**Permission Required**: `edit_table`

**Frontend Integration**:
- **Service**: `src/services/tableService.js`
- **Method**: `tableService.updateTable(id, tableData)`
- **Used In**: `src/components/pages/restaurant/TableForm.jsx` - Edit table form

---

### 26. **DELETE /api/tables/{table}**
**Description**: Table delete करने के लिए (soft delete)

**Backend Controller**: `TableController@destroy`

**Response**:
```json
{
  "success": true,
  "message": "Table deleted successfully."
}
```

**Permission Required**: `delete_table`

**Frontend Integration**:
- **Service**: `src/services/tableService.js`
- **Method**: `tableService.deleteTable(id)`
- **Used In**: `src/views/restaurant/TablesList.jsx` - Delete table button

---

## 💰 Bill Management APIs (Restaurant System)

### 1. **POST /api/bills**
**Description**: New bill create करने के लिए (draft or paid)

**Backend Controller**: `BillController@store`

**Request Body**:
```json
{
  "table_id": 1,
  "customer_id": 1,
  "bill_date": "2025-01-22T10:30:00.000Z",
  "status": "draft",
  "payment_status": "pending",
  "subtotal": 500.00,
  "gst_amount": 50.00,
  "discount": 0.00,
  "total_amount": 550.00,
  "paid_amount": 0.00,
  "remaining_amount": 550.00,
  "payment_method": null,
  "gst_calculation_method": "bill_wise",
  "notes": "Bill notes",
  "items": [
    {
      "food_item_id": 1,
      "item_name": "Butter Chicken",
      "quantity": 2,
      "unit_price": 250.00,
      "total_price": 500.00,
      "display_order": 0
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "billNumber": "#BILL001",
    "tableId": 1,
    "customerId": 1,
    "billDate": "2025-01-22T10:30:00.000Z",
    "status": "draft",
    "paymentStatus": "pending",
    "subtotal": 500.00,
    "gstAmount": 50.00,
    "discount": 0.00,
    "totalAmount": 550.00,
    "paidAmount": 0.00,
    "remainingAmount": 550.00,
    "paymentMethod": null,
    "createdAt": "2025-01-22T10:30:00.000Z"
  },
  "message": "Bill created successfully."
}
```

**Permission Required**: `create_bill`

**Frontend Integration**:
- **Service**: `src/services/billService.js` (To be created)
- **Method**: `billService.createBill(billData)`
- **Used In**: 
  - `src/views/pos/POSPanel.jsx` - Save Draft and Process Payment

**Note**: 
- Bill number (#BILL001) automatically generated
- Status can be 'draft', 'pending', 'paid', 'cancelled'
- Payment status can be 'pending', 'partial', 'paid'

---

### 2. **GET /api/bills**
**Description**: Bills की list fetch करने के लिए (paginated, sortable, filterable)

**Backend Controller**: `BillController@index`

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search term (bill_number, customer name, table name)
- `status` - Filter by status (draft, pending, paid, cancelled)
- `payment_status` - Filter by payment status (pending, partial, paid)
- `table_id` - Filter by table
- `customer_id` - Filter by customer
- `start_date` - Filter from date
- `end_date` - Filter to date
- `sort_by` - Sort column
- `sort_direction` - Sort direction

**Permission Required**: `view_bill`

**Frontend Integration**:
- **Service**: `src/services/billService.js` (To be created)
- **Method**: `billService.getBills(params)`

---

### 3. **GET /api/bills/{bill}**
**Description**: Specific bill की details fetch करने के लिए

**Backend Controller**: `BillController@show`

**Permission Required**: `view_bill`

**Frontend Integration**:
- **Service**: `src/services/billService.js` (To be created)
- **Method**: `billService.getBillById(id)`

---

### 4. **PUT /api/bills/{bill}**
**Description**: Existing bill update करने के लिए

**Backend Controller**: `BillController@update`

**Permission Required**: `edit_bill`

**Frontend Integration**:
- **Service**: `src/services/billService.js` (To be created)
- **Method**: `billService.updateBill(id, billData)`
- **Used In**: 
  - `src/views/pos/POSPanel.jsx` - Auto-save draft updates

---

### 5. **DELETE /api/bills/{bill}**
**Description**: Bill delete करने के लिए (hard delete for non-paid bills)

**Backend Controller**: `BillController@destroy`

**Details**:
- Paid bills (`status = 'paid'`) cannot be deleted (422 error).
- Deletes the bill record and all related `bill_items` (via `ON DELETE CASCADE`).
- Any related `wallet_transactions` remain for audit, but their `bill_id` is set to `null`.

**Permission Required**: `delete_bill`

**Frontend Integration**:
- **Service**: `src/services/billService.js` (To be created)
- **Method**: `billService.deleteBill(id)`

---

### 6. **GET /api/bills/table/{tableId}**
**Description**: Specific table के bills fetch करने के लिए (for loading existing orders)

**Backend Controller**: `BillController@getByTable`

**Query Parameters**:
- `status` - Filter by status (optional, default: all)
- `include_draft` - Include draft bills (default: true)

**Permission Required**: `view_bill`

**Frontend Integration**:
- **Service**: `src/services/billService.js` (To be created)
- **Method**: `billService.getBillsByTable(tableId, params)`
- **Used In**: 
  - `src/views/pos/POSPanel.jsx` - Load existing orders when table is selected

---

### 7. **POST /api/bills/{bill}/process-payment**
**Description**: Bill payment process करने के लिए

**Backend Controller**: `BillController@processPayment`

**Request Body**:
```json
{
  "payment_type": "credit",
  "amount": 550.00,
  "payment_method": "cash",
  "transaction_date": "2025-01-22T10:30:00.000Z",
  "description": "Full payment for bill",
  "customer_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "billNumber": "#BILL001",
    "status": "paid",
    "paymentStatus": "paid",
    "paidAmount": 550.00,
    "remainingAmount": 0.00
  },
  "message": "Payment processed successfully."
}
```

**Permission Required**: `bill_payment`

**Frontend Integration**:
- **Service**: `src/services/billService.js` (To be created)
- **Method**: `billService.processPayment(billId, paymentData)`
- **Used In**: 
  - `src/views/pos/POSPanel.jsx` - Process Payment button

**Payment Logic**:
- **Cash/UPI/Card**: Updates bill status to 'paid', payment_status to 'paid'
- **Wallet**: Updates bill status to 'pending', payment_status to 'pending', and creates wallet transaction (debit)

**Note**: 
- For wallet payments, creates debit wallet transaction linked to bill
- For regular payments, only updates bill (no wallet transaction)
- Customer stats automatically update after payment

---

## 📱 App Settings

### App Settings Section
**Description**: Application-level settings (Web URL for reset password links)

**Settings Available**:
- **web_url** - Web URL for the application (used in reset password email links)

**Frontend Integration**:
- **Service**: `src/services/settingsService.js`
- **Component**: `src/views/settings/Settings.jsx`
- **Section**: App Settings (with cog icon)
- **Auto-save**: Enabled on blur

**Backend Usage**:
- `AuthController@forgotPassword` uses `web_url` from "App Settings" section
- Fallback chain: Database setting → Config file → Default value
- Used to generate reset password email links

**Usage Example**:
```javascript
// Frontend - Settings page automatically handles this
// Backend - Automatically used in forgot password flow
$webUrl = Setting::get('web_url', 'App Settings');
```

---

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false,
    "sortBy": "name",
    "sortDirection": "asc"
  }
}
```

### Error Response
```json
{
  "message": "Error message",
  "errors": {
    "field_name": ["Error message for field"]
  }
}
```

### HTTP Status Codes
- `200` - Success (GET, PUT, PATCH)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## ⚠️ Error Handling

### Frontend Error Handling Pattern

सभी services में consistent error handling pattern use होता है:

```javascript
import { handleApiError } from '../utils/errorHandler'

try {
  const response = await apiClient.get('/endpoint')
  return {
    success: true,
    data: response.data
  }
} catch (error) {
  return handleApiError(error)
}
```

### Error Handler Utility

`src/utils/errorHandler.js` में `handleApiError` function:

```javascript
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response
    return {
      success: false,
      message: data?.message || 'An error occurred',
      errors: data?.errors || {},
      status
    }
  } else if (error.request) {
    // Request made but no response
    return {
      success: false,
      message: 'Network error. Please check your connection.'
    }
  } else {
    // Something else happened
    return {
      success: false,
      message: error.message || 'An unexpected error occurred'
    }
  }
}
```

---

## 🔗 Frontend Integration Points

### Service Layer Structure

सभी API calls service layer के through होते हैं:

```
Component → Service → API Client → Backend API
```

### Service Files Location
- `src/services/authService.js` - Authentication APIs
- `src/services/userService.js` - User Management APIs
- `src/services/roleService.js` - Role Management APIs
- `src/services/permissionService.js` - Permission Management APIs
- `src/services/branchService.js` - Branch Management APIs
- `src/services/settingsService.js` - Settings Management APIs
- `src/services/tableService.js` - Table Management APIs
- `src/services/customerService.js` - Customer Management APIs
- `src/services/walletTransactionService.js` - Wallet Transaction Management APIs (Customer Ledger)

### API Client Configuration

`src/config/apiClient.js` में Axios client configured है:

```javascript
import axios from 'axios'
import config from '../config'

const apiClient = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor - Token add करता है
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - Error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - Clear session
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### Component Integration Examples

#### 1. UsersList Component
```javascript
// src/views/users/UsersList.jsx
import { useEffect, useState } from 'react'
import userService from '../../services/userService'

const UsersList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [meta, setMeta] = useState({})

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async (page = 1, limit = 20) => {
    setLoading(true)
    const result = await userService.getUsers({ page, limit })
    if (result.success) {
      setUsers(result.data)
      setMeta(result.meta)
    }
    setLoading(false)
  }

  return (
    // Component JSX
  )
}
```

#### 2. RoleForm Component
```javascript
// src/components/pages/roles/RoleForm.jsx
import roleService from '../../../services/roleService'
import permissionService from '../../../services/permissionService'

const RoleForm = ({ roleId, onSave }) => {
  const [role, setRole] = useState({})
  const [permissions, setPermissions] = useState([])

  useEffect(() => {
    if (roleId) {
      loadRole()
    }
    loadPermissions()
  }, [roleId])

  const loadRole = async () => {
    const result = await roleService.getRoleById(roleId)
    if (result.success) {
      setRole(result.data)
    }
  }

  const loadPermissions = async () => {
    const result = await permissionService.getPermissions({
      groupByModule: true
    })
    if (result.success) {
      setPermissions(result.data)
    }
  }

  const handleSubmit = async (formData) => {
    if (roleId) {
      await roleService.updateRole(roleId, formData)
    } else {
      await roleService.createRole(formData)
    }
    onSave()
  }
}
```

#### 3. Settings Component
```javascript
// src/views/settings/Settings.jsx
import settingsService from '../../services/settingsService'

const Settings = () => {
  const [sections, setSections] = useState({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const result = await settingsService.getAllSections()
    if (result.success) {
      setSections(result.data)
    }
  }

  const handleSaveSection = async (section, settings) => {
    const result = await settingsService.updateSettingsGroup(section, settings)
    if (result.success) {
      toast.success('Settings saved successfully')
    }
  }

  const handleTestS3 = async (s3Config) => {
    const result = await settingsService.testS3Connection(s3Config)
    if (result.success) {
      toast.success('S3 connection successful')
    }
  }

  const handleTestEmail = async (emailConfig) => {
    const result = await settingsService.testEmailConfiguration(emailConfig)
    if (result.success) {
      toast.success('Test email sent successfully')
    }
  }
}
```

---

## 📝 Summary

### Implemented APIs
✅ Authentication (Login, Logout, Get User, Forgot Password, Reset Password, Change Password)
✅ User Management (CRUD operations)
✅ User Profile (Get/Update Profile, Avatar Upload, Change Password)
✅ Role Management (CRUD + Permissions)
✅ Permission Management (List, Get)
✅ Branch Management (CRUD operations + Server-side pagination/filtering/searching)
✅ Package Management (CRUD operations + Server-side pagination/filtering/searching)
✅ Customer Management (CRUD operations + Status Update + Stats Recalculation + Server-side pagination/filtering/searching + PDF Export)
✅ Order Management (CRUD operations + Multi-package support + Status/Payment Update + Server-side pagination/filtering/searching + PDF Export + **Important Links CRUD**)
✅ Payment Management (CRUD operations + Auto order status update + Customer stats update + PDF Export)
✅ Financial Management (Transactions CRUD + Categories CRUD + Statistics + Server-side pagination/filtering/searching)
✅ Report Management (Company Health Report + PDF Export)
✅ Settings Management (Full CRUD + Email Test + Logo Upload/Delete + App Settings with Web URL)
✅ Restaurant Settings (Full CRUD + Section-based grouping + Bulk update)
✅ Food Categories (Full CRUD + Server-side pagination/filtering/searching - Backend ready)
✅ Food Items (Full CRUD + Image Upload + Item Reordering + Server-side pagination/filtering/searching - Fully implemented)
✅ Table Management (Full CRUD + Server-side pagination/filtering/searching + Status management - Fully implemented)

### Frontend Integration Status
- ✅ **AuthService** - Fully integrated in Login, AuthContext, PrivateRoute, ForgotPassword, ResetPassword
- ✅ **UserService** - Fully integrated in UsersList, UserForm
- ✅ **ProfileService** - Fully integrated in Profile page (PersonalInfo, Address, Avatar Upload/Delete, Change Password)
- ✅ **SettingsService** - Business logo upload/delete functionality integrated
- ✅ **RoleService** - Fully integrated in RolesList, RoleForm
- ✅ **FinancialService** - Fully integrated in FinancialTransactionsList, FinancialTransactionForm
- ✅ **FinancialCategoryService** - Fully integrated in FinancialCategoriesList, FinancialCategoryForm
- ✅ **PermissionService** - Fully integrated in RoleForm
- ✅ **BranchService** - Fully integrated in BranchesList (server-side pagination/filtering/searching)
- ✅ **PackageService** - Fully integrated in PackagesList, PackageForm (with server-side pagination/filtering)
- ✅ **CustomerService** - Fully integrated in CustomersList, CustomerForm, CustomerDetailsModal (server-side pagination/filtering, normalized totals, no mock fallback, PDF Export)
- ✅ **WalletTransactionService** - Fully integrated in CustomerLedgerModal (customer ledger modal with totals, CRUD operations, server-side pagination/filtering)
- ✅ **OrderService** - Fully integrated in OrdersList, OrderForm, OrderDetailsModal (server-side pagination/filtering, payment type badges, no mock fallback, PDF Export, **Links CRUD**)
- ✅ **PaymentService** - Fully integrated in PaymentForm, TransactionsList (real database integration, PDF Export)
- ✅ **ReportService** - Fully integrated in CompanyHealthReport (with PDF export)
- ✅ **SettingsService** - Fully integrated in Settings page (Business Info, Invoice, Email Settings with test, App Settings with Web URL, Currency & Regional, S3 Settings)
- ✅ **RestaurantSettingsService** - Fully integrated in RestaurantSettings page (CGST/SGST/Service Tax Settings, Invoice Settings, Thermal Printer Settings, Round Number enable)
- ✅ **POS Panel** - Fully implemented (Tables Panel, Products Panel, Billing Cart Panel with GST/Tax calculation, discount, rounding, payment section, Save Draft, Print Bill, Process Payment)
- ✅ **BillService** - Fully integrated in POSPanel.jsx (create, update, process payment, get by table)
- ⏳ **FoodCategoryService** - Backend ready, frontend service to be created
- ✅ **MenuService** - Fully integrated in MenuManagement.jsx (hierarchy, CRUD, image upload, item reordering)
- ✅ **TableService** - Fully integrated in TablesList.jsx (CRUD, server-side pagination, filtering, searching)

### Server-Side Features
- **Package Management**: Server-side pagination, filtering (type, status, price range), searching (name, description, type)
- **Customer Management**: Server-side pagination, filtering (status, branch, city, state, country, date ranges, amount ranges), searching (name, email, phone, customer_code)
- **Order Management**: Server-side pagination, filtering (status, payment_status, customer, branch, date ranges, payment_method, amount ranges), searching (order_number, customer name/email)
- **Payment Management**: Real database integration, auto-updates order payment status and customer stats
- **Table Management**: Server-side pagination, filtering (status, is_active), searching (table_number, table_name), returns all records in data field with pagination metadata

### Customer Stats Auto-Update
- Customer statistics (totalOrders, total_amount, paid_amount, remaining_amount, etc.) automatically calculate होते हैं orders से
- जब order create/update/delete होता है, customer stats automatically update होते हैं (via model events)
- Manual recalculation के लिए `/api/customers/{customer}/recalculate-stats` endpoint available है
- Frontend status chips अब outstanding balances से derive होते हैं ताकि pending/completed indicator हमेशा सुसंगत रहे

---

**Last Updated**: January 2025

## 🔄 Recent Updates
- ✅ **Bill Management APIs** - Fully implemented (Frontend + Backend)
  - ✅ `POST /api/bills` - Create bill (with auto-generated bill number `#BILL{ID}`)
  - ✅ `GET /api/bills` - List bills (with pagination, filtering, searching)
  - ✅ `GET /api/bills/{bill}` - Get bill details
  - ✅ `PUT /api/bills/{bill}` - Update bill (prevents duplicate items, handles soft-deleted items)
  - ✅ `DELETE /api/bills/{bill}` - Delete bill (soft delete, prevents deleting paid bills)
  - ✅ `GET /api/bills/table/{tableId}` - Get bills for table
  - ✅ `POST /api/bills/{bill}/process-payment` - Process payment
    - Cash/UPI/Card: Updates bill status to 'paid' (no wallet transaction)
    - Wallet: Creates wallet transaction (debit) and marks bill as 'paid'
  - ✅ Payment confirmation and success dialogs
  - ✅ Sound notifications (success/error sounds)
  - ✅ Table status automatic updates (occupied/available based on active bills)
  - ✅ Event-based auto-save (saves draft when cart changes, 1-second debounce)
  - ✅ Manual save draft functionality
  - ✅ Print bill functionality (print-friendly HTML template)
- ✅ **Wallet Transaction Management APIs** - Fully implemented with Customer Ledger endpoint
  - `GET /api/customers/{customer}/wallet-transactions` - Customer ledger with totals calculation
  - Backend calculates totals from all transactions (totalDebit, totalCredit, remainingAmount)
  - Running balance calculation for each transaction
  - Full CRUD operations for wallet transactions
  - Auto-updates customer stats (paid_amount, remaining_amount) on transaction create/update/delete
- ✅ **Customer Ledger Modal** - Quick view modal accessible from customer list
  - Large modal view using global `.modal-xl-large` class (95vw width)
  - Simplified filters (search and transaction type only)
  - Summary cards with backend-calculated totals
  - Color-coded amounts (green for credit, red for debit)
  - Restricted outside clicks (close button only)
- ✅ **Global Modal Class** - Created reusable `.modal-xl-large` class in `src/scss/style.scss`
  - Can be used across the application for any large modal needs
  - Responsive design with fullscreen on mobile/tablet

## 🔄 Previous Recent Updates
- ✅ **Restaurant Settings Module** - Fully implemented frontend and backend with GST Settings, Invoice Settings, and Thermal Printer Settings
- ✅ **Restaurant Settings APIs** - Full CRUD operations with section-based grouping and bulk update support
- ✅ **Food Categories APIs** - Backend fully implemented with CRUD operations, server-side pagination, filtering, and searching
- ✅ **Food Items APIs** - Fully implemented with CRUD operations, image upload/delete, item reordering (move up/down), server-side pagination, filtering, and searching
- ✅ **Menu Hierarchy API** - `GET /api/food-categories/hierarchy` returns categories with nested items, sorted by display_order
- ✅ **Image Upload Endpoints** - `POST /api/food-items/{item}/upload-image` and `DELETE /api/food-items/{item}/image` for managing item images
- ✅ **Item Reordering Endpoints** - `POST /api/food-items/{item}/move-up` and `POST /api/food-items/{item}/move-down` for changing item order within categories
- ✅ **Restaurant Permissions** - Added `view_restaurant_settings`, `edit_restaurant_settings`, and all Food Category/Item permissions
- ✅ **Data Storage** - Restaurant settings stored in `settings` table with groups: 'GST Settings' (CGST, SGST, Service Tax, Round Number), 'Invoice Settings', 'Thermal Printer'
- ✅ **GST/Tax Migration** - Migrated from single `default_gst_percentage` to separate `cgst_percentage`, `sgst_percentage`, `service_tax_percentage`, and added `round_number_enabled` setting
- ✅ **Food Items GST Removal** - Removed `gst_percentage` column from `food_items` table (GST now calculated at restaurant level)
✅ **Table Management APIs** - Fully implemented with CRUD operations, server-side pagination, filtering (status, is_active), searching (table_number, table_name), returns all records in data field with pagination metadata
✅ **Table Permissions** - Added `view_table`, `create_table`, `edit_table`, `delete_table` permissions
✅ **Table Seeder** - Created TableSeeder with 15 sample table records
**Version**: 1.4.0

## 🔄 Recent Updates
- ✅ **Customer Management APIs** - Fully implemented for Restaurant System (CRUD operations, server-side pagination, filtering, searching, sorting)
- ✅ **Customer API Endpoints** - GET/POST/PUT/DELETE `/api/customers` with full validation and permission checks
- ✅ **Customer Code Auto-Generation** - Customer code (#CUST001) auto-generated via model observer
- ✅ **Customer Service** - Frontend service (`customerService.js`) fully integrated in CustomersList and CustomerForm
- ✅ Payment Management APIs fully implemented
- ✅ Server-side pagination, filtering, and searching for Packages, Customers, and Orders
- ✅ Payment recording from Orders module (Actions → Record Payment)
- ✅ Transactions module shows payments from orders
- ✅ Customer code (#CUST format) display in payment forms
- ✅ Real database integration for payments (no mock fallback)
- ✅ Orders & Customers screens now rely solely on live API responses with derived financial summaries, toast-based error handling, and credit/debit payment type indicators
- ✅ Order Details API (`/api/orders/{id}`) now includes payment history in response (no separate API call needed)
- ✅ Payment status simplified to `pending` or `completed` (removed partial/refunded from UI)
- ✅ Order statistics endpoint (`/api/orders/stats`) added with date range filtering
- ✅ Manual order status update functionality added
- ✅ Payment numbers displayed in #PAY003 format in payment history and transactions
- ✅ API responses cleaned up - removed duplicate fields, using camelCase only
- ✅ PDF Export functionality fully implemented for Orders, Customers, and Payments
- ✅ All PDF exports use pure black and white design with single thin line dividers
- ✅ Consistent footer format across all PDFs (Business Name | Address | Phone | Website | Footer Text)
- ✅ Standardized filename format: `Order_{OrderID}_{CustomerName}.pdf`, `Customer_{CustomerID}_{CustomerName}.pdf`, `Payment_{PaymentId}_{CustomerName}.pdf`
- ✅ CORS configuration updated to expose Content-Disposition header for filename extraction
- ✅ **Important Links CRUD** - Dynamic links management (add/edit/delete) with custom titles and URLs, managed from Order Details page, stored as JSON array in orders table
- ✅ Branch Management fully implemented with API integration (server-side pagination, filtering, searching)
- ✅ **Report Management Module** - Company Health Report fully implemented with date range filtering, branch filtering, and PDF export
- ✅ **Permissions System** - Added `view_report` permission for reports module, updated report endpoints to use `view_report` instead of `view_dashboard`
- ✅ **Financial Permissions** - All financial transaction and category endpoints have proper permission checks (`view_financial_transaction`, `create_financial_transaction`, `edit_financial_transaction`, `delete_financial_transaction`, `view_financial_category`, etc.)

