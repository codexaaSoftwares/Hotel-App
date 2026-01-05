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

## 👥 Customer Management APIs

### 1. **GET /api/customers**
**Description**: Customers की list fetch करने के लिए (paginated, sortable)

**Backend Controller**: `CustomerController@index`

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search term (first_name, last_name, email, phone में search)
- `status` - Filter by status (active, inactive, pending)
- `branch_id` - Filter by branch
- `city` - Filter by city
- `sort_by` - Sort column (first_name, email, city, status, created_at)
- `sort_direction` - Sort direction (asc/desc)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customerId": "#CUST001",
      "customer_code": "#CUST001",
      "name": "Rajesh Patel",
      "firstName": "Rajesh",
      "lastName": "Patel",
      "email": "rajesh.patel@email.com",
      "mobile": "+91 98765 43210",
      "phone": "+91 98765 43210",
      "address": {
        "street": "123 MG Road",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "postalCode": "380001",
        "country": "India"
      },
      "status": "active",
      "branch_id": 1,
      "branch_name": "Lunawada Main",
      "branch_code": "MB001",
      "totalOrders": 5,
      "total_orders": 5,
      "totalSpent": 125000,
      "total_amount": 125000,
      "paid_amount": 100000,
      "remaining_amount": 25000,
      "wallet_balance": 5000,
      "dob": "1990-05-15",
      "anniversary_date": "2018-06-20",
      "created_at": "2024-01-15T10:30:00.000000Z"
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

**Permission Required**: `view_customer`

**Frontend Integration**:
- **Service**: `src/services/customerService.js`
- **Method**: `customerService.getCustomers(params)`
- **Used In**:
  - `src/views/customers/CustomersList.jsx` - Customers list page में

**Latest UI Behavior (Nov 2025)**:
- Customers list अब API payload से total/paid/remaining values normalize करता है ताकि partial responses में भी सही financial summary दिखे
- Orders module की तरह यह स्क्रीन अब mock fallback पर निर्भर नहीं करती; किसी भी API failure पर toast error दिखता है और तालिका सुरक्षित empty state में reset होती है

**Note**: Customer stats (totalOrders, total_amount, paid_amount, etc.) automatically calculate होते हैं orders से

---

### 2. **GET /api/customers/{customer}**
**Description**: Specific customer की details fetch करने के लिए

**Backend Controller**: `CustomerController@show`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerId": "#CUST001",
    "name": "Rajesh Patel",
    "firstName": "Rajesh",
    "lastName": "Patel",
    "email": "rajesh.patel@email.com",
    "phone": "+91 98765 43210",
    "address": {...},
    "status": "active",
    "totalOrders": 5,
    "total_amount": 125000,
    "paid_amount": 100000,
    "remaining_amount": 25000
  },
  "message": "Customer retrieved successfully."
}
```

**Permission Required**: `view_customer`

**Frontend Integration**:
- **Service**: `src/services/customerService.js`
- **Method**: `customerService.getCustomerById(id)`
- **Used In**:
  - `src/components/pages/customers/CustomerForm.jsx` - Edit customer form में
  - `src/components/pages/customers/CustomerDetailsModal.jsx` - Customer details modal में

---

### 3. **POST /api/customers**
**Description**: New customer create करने के लिए

**Backend Controller**: `CustomerController@store`

**Request Body**:
```json
{
  "first_name": "Rajesh",
  "last_name": "Patel",
  "email": "rajesh.patel@email.com",
  "phone": "+91 98765 43210",
  "mobile": "+91 98765 43210",
  "address": "123 MG Road",
  "city": "Ahmedabad",
  "state": "Gujarat",
  "postal_code": "380001",
  "country": "India",
  "branch_id": 1,
  "status": "active",
  "dob": "1990-05-15",
  "anniversary_date": "2018-06-20"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_code": "#CUST001",
    "first_name": "Rajesh",
    "last_name": "Patel",
    "email": "rajesh.patel@email.com",
    "status": "active",
    "total_orders": 0,
    "total_amount": 0,
    "created_at": "2024-01-15T10:30:00.000000Z"
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

---

### 4. **PUT /api/customers/{customer}**
**Description**: Existing customer update करने के लिए

**Backend Controller**: `CustomerController@update`

**Request Body**:
```json
{
  "first_name": "Rajesh",
  "last_name": "Patel",
  "email": "rajesh.patel@email.com",
  "phone": "+91 98765 43210",
  "status": "active"
}
```

**Response**:
```json
{
  "success": true,
  "data": {...},
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

### 5. **DELETE /api/customers/{customer}**
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

### 6. **PUT /api/customers/{customer}/status**
**Description**: Customer status update करने के लिए

**Backend Controller**: `CustomerController@updateStatus`

**Request Body**:
```json
{
      "status": "inactive"
}
```

**Response**:
```json
{
  "success": true,
  "data": {...},
  "message": "Customer status updated successfully."
}
```

**Permission Required**: `edit_customer`

**Frontend Integration**:
- **Service**: `src/services/customerService.js`
- **Method**: `customerService.updateCustomerStatus(id, status)`
- **Used In**:

---

### 7. **POST /api/customers/{customer}/recalculate-stats**
**Description**: Customer statistics manually recalculate करने के लिए (orders से)

**Backend Controller**: `CustomerController@recalculateStats`

**Response**:
```json
{
  "success": true,
  "data": {...},
  "message": "Customer statistics recalculated successfully."
}
```

**Permission Required**: `edit_customer`

**Note**: Customer stats automatically update होते हैं जब orders create/update/delete होते हैं

---

### 8. **GET /api/customers/{customer}/export-pdf**
**Description**: Customer history report PDF export करने के लिए

**Backend Controller**: `CustomerController@exportPdf`

**Response**: PDF file download
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="Customer_{CustomerID}_{CustomerName}.pdf"`

**Permission Required**: `view_customer`

**Frontend Integration**:
- **Service**: `src/services/customerService.js`
- **Method**: `customerService.exportCustomerPdf(customerId)`
- **Used In**:
  - `src/views/customers/CustomersList.jsx` - Export button in table actions

**PDF Includes**:
- Customer basic information (name, contact, address, DOB, anniversary, status)
- Statistics summary (total orders, total amount, paid amount, remaining, wallet balance)
- Complete order history table
- Complete payment/transaction history table
- Branch information
- Business information from invoice settings

**Filename Format**: `Customer_{CustomerID}_{CustomerName}.pdf`

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
- ✅ **OrderService** - Fully integrated in OrdersList, OrderForm, OrderDetailsModal (server-side pagination/filtering, payment type badges, no mock fallback, PDF Export, **Links CRUD**)
- ✅ **PaymentService** - Fully integrated in PaymentForm, TransactionsList (real database integration, PDF Export)
- ✅ **ReportService** - Fully integrated in CompanyHealthReport (with PDF export)
- ✅ **SettingsService** - Fully integrated in Settings page (Business Info, Invoice, Email Settings with test, App Settings with Web URL, Currency & Regional, S3 Settings)

### Server-Side Features
- **Package Management**: Server-side pagination, filtering (type, status, price range), searching (name, description, type)
- **Customer Management**: Server-side pagination, filtering (status, branch, city, state, country, date ranges, amount ranges), searching (name, email, phone, customer_code)
- **Order Management**: Server-side pagination, filtering (status, payment_status, customer, branch, date ranges, payment_method, amount ranges), searching (order_number, customer name/email)
- **Payment Management**: Real database integration, auto-updates order payment status and customer stats

### Customer Stats Auto-Update
- Customer statistics (totalOrders, total_amount, paid_amount, remaining_amount, etc.) automatically calculate होते हैं orders से
- जब order create/update/delete होता है, customer stats automatically update होते हैं (via model events)
- Manual recalculation के लिए `/api/customers/{customer}/recalculate-stats` endpoint available है
- Frontend status chips अब outstanding balances से derive होते हैं ताकि pending/completed indicator हमेशा सुसंगत रहे

---

**Last Updated**: December 2025

## 🔄 Recent Updates
- ✅ **Permissions System** - Added `view_report` permission for reports module, all pages now have proper permission protection
- ✅ **Report API Permissions** - Updated report endpoints to use `view_report` permission instead of `view_dashboard`
- ✅ **Financial Permissions** - All financial transaction and category endpoints have proper permission checks
**Version**: 1.2.0

## 🔄 Recent Updates
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

