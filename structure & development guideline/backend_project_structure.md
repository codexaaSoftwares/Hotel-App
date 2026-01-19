# Hotel Management App - Backend API Project Structure & Development Guidelines

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Complete Project Structure](#complete-project-structure)
3. [Technology Stack](#technology-stack)
4. [Module Overview](#module-overview)
5. [Architecture Patterns](#architecture-patterns)
6. [Development Guidelines](#development-guidelines)
7. [API Development](#api-development)
8. [Database Guidelines](#database-guidelines)
9. [Security Guidelines](#security-guidelines)
10. [Testing Guidelines](#testing-guidelines)
11. [Best Practices](#best-practices)

---

## 🚀 Project Overview

**Hotel Management App Backend** is a Laravel 9 RESTful API that powers the Hotel Management App admin dashboard. It provides comprehensive backend services for managing users, roles, permissions, branches, financial transactions, settings, and more.

### Key Features
- 🔐 JWT Authentication with Laravel Sanctum
- 👥 Role-Based Access Control (RBAC)
- 📊 RESTful API endpoints
- 🗄️ MySQL database with migrations
- 📧 Email service integration
- 📄 PDF export service
- 📤 File upload service (avatars, business logos) with custom storage handler
- 🔒 Permission-based route protection
- 📦 Standardized pagination and sorting

---

## 📁 Complete Project Structure

```
backend/
├── 📁 app/                          # Application core code
│   ├── 📁 Console/                  # Artisan commands
│   │   └── Kernel.php              # Console kernel (scheduled tasks)
│   │
│   ├── 📁 Exceptions/              # Exception handling
│   │   └── Handler.php              # Global exception handler
│   │
│   ├── 📁 Http/                     # HTTP layer
│   │   ├── 📁 Controllers/         # Request handlers
│   │   │   ├── 📁 API/             # API controllers
│   │   │   │   ├── BranchController.php
│   │   │   │   ├── CustomerController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── FinancialCategoryController.php
│   │   │   │   ├── FinancialTransactionController.php
│   │   │   │   ├── FoodCategoryController.php
│   │   │   │   ├── FoodItemController.php
│   │   │   │   ├── PermissionController.php
│   │   │   │   ├── RestaurantSettingsController.php
│   │   │   │   ├── RoleController.php
│   │   │   │   ├── SettingController.php
│   │   │   │   ├── TableController.php
│   │   │   │   └── UserController.php
│   │   │   ├── 📁 Concerns/        # Shared controller traits
│   │   │   │   └── PaginatesResults.php
│   │   │   ├── AuthController.php
│   │   │   └── Controller.php      # Base controller
│   │   ├── 📁 Kernel.php           # HTTP kernel (middleware)
│   │   ├── 📁 Middleware/          # Request middleware
│   │   │   ├── Authenticate.php
│   │   │   ├── CheckPermission.php # Custom: Permission check
│   │   │   ├── CheckRole.php       # Custom: Role check
│   │   │   ├── EncryptCookies.php
│   │   │   ├── PreventRequestsDuringMaintenance.php
│   │   │   ├── RedirectIfAuthenticated.php
│   │   │   ├── TrimStrings.php
│   │   │   ├── TrustProxies.php
│   │   │   ├── ValidateSignature.php
│   │   │   └── VerifyCsrfToken.php
│   │   ├── 📁 Requests/            # Form request validation
│   │   │   ├── BranchStoreRequest.php
│   │   │   ├── BranchUpdateRequest.php
│   │   │   ├── FinancialCategoryStoreRequest.php
│   │   │   ├── FinancialCategoryUpdateRequest.php
│   │   │   ├── FinancialTransactionStoreRequest.php
│   │   │   ├── FinancialTransactionUpdateRequest.php
│   │   │   ├── FoodCategoryStoreRequest.php
│   │   │   ├── FoodCategoryUpdateRequest.php
│   │   │   ├── FoodItemStoreRequest.php
│   │   │   ├── FoodItemUpdateRequest.php
│   │   │   ├── TableStoreRequest.php
│   │   │   └── TableUpdateRequest.php
│   │   └── 📁 Resources/            # API resources
│   │       ├── BranchResource.php
│   │       ├── CustomerResource.php
│   │       ├── FinancialCategoryResource.php
│   │       ├── FinancialTransactionResource.php
│   │       ├── FoodCategoryResource.php
│   │       ├── FoodItemResource.php
│   │       └── TableResource.php
│   │
│   ├── 📁 Mail/                     # Email classes
│   │   └── GenericEmail.php        # Generic mailable class
│   │
│   ├── 📁 Models/                   # Eloquent models
│   │   ├── Branch.php               # Branch model
│   │   ├── Customer.php             # Customer model
│   │   ├── FinancialCategory.php    # Financial category model
│   │   ├── FinancialTransaction.php # Financial transaction model
│   │   ├── FoodCategory.php         # Food category model
│   │   ├── FoodItem.php             # Food item model
│   │   ├── Permission.php           # Permission model
│   │   ├── Role.php                  # Role model (with soft delete)
│   │   ├── Setting.php               # Setting model
│   │   ├── Table.php                 # Table model
│   │   └── User.php                  # User model (with roles/permissions)
│   │
│   ├── 📁 Providers/                # Service providers
│   │   ├── AppServiceProvider.php
│   │   ├── AuthServiceProvider.php
│   │   ├── EventServiceProvider.php
│   │   └── RouteServiceProvider.php
│   │
│   └── 📁 Services/                 # Business logic services
│       ├── EmailService.php         # Email sending service
│       └── PdfExportService.php     # PDF generation service
│
├── 📁 bootstrap/                    # Bootstrap files
│   ├── app.php                      # Application bootstrap
│   └── 📁 cache/                    # Bootstrap cache
│       ├── packages.php
│       └── services.php
│
├── 📁 config/                       # Configuration files
│   ├── app.php                      # Application config
│   ├── auth.php                     # Authentication config
│   ├── cache.php                    # Cache config
│   ├── cors.php                     # CORS config
│   ├── database.php                 # Database config (MySQL only)
│   ├── filesystems.php              # File storage config
│   ├── logging.php                  # Logging config
│   ├── mail.php                     # Mail config
│   ├── queue.php                    # Queue config
│   ├── sanctum.php                  # Sanctum config
│   ├── session.php                  # Session config
│   └── view.php                     # View config
│
├── 📁 database/                     # Database files
│   ├── 📁 factories/                # Model factories
│   │   ├── BranchFactory.php
│   │   └── CustomerFactory.php
│   ├── 📁 migrations/               # Database migrations
│   │   ├── 2025_11_17_083104_create_users_table.php
│   │   ├── 2025_11_17_083129_create_roles_and_permissions_tables.php
│   │   ├── 2025_11_17_083142_create_branches_table.php
│   │   ├── 2025_11_17_083203_create_customers_table.php
│   │   ├── 2025_11_17_083220_create_packages_table.php
│   │   ├── 2025_11_17_083234_create_orders_table.php
│   │   ├── 2025_11_17_083253_create_order_items_table.php
│   │   ├── 2025_11_17_083306_create_payments_table.php
│   │   ├── 2025_11_17_083320_create_settings_table.php
│   │   ├── 2025_11_17_083332_create_emails_table.php
│   │   ├── 2025_11_17_083347_create_password_reset_tokens_table.php
│   │   ├── 2025_11_17_083400_create_failed_jobs_table.php
│   │   ├── 2025_12_18_073853_create_financial_categories_table.php
│   │   ├── 2025_12_18_073853_create_financial_transactions_table.php
│   │   ├── 2025_01_20_000001_create_food_categories_table.php
│   │   ├── 2025_01_20_000002_create_food_items_table.php
│   │   ├── 2026_01_06_130603_add_image_and_display_order_to_food_items_table.php
│   │   └── 2025_01_21_000001_create_tables_table.php
│   └── 📁 seeders/                  # Database seeders
│       ├── BranchSeeder.php
│       ├── CustomerSeeder.php
│       ├── DatabaseSeeder.php
│       ├── FinancialCategorySeeder.php
│       ├── PermissionsTableSeeder.php
│       ├── RolePermissionSeeder.php
│       ├── RolesTableSeeder.php
│       ├── TableSeeder.php
│       └── UserSeeder.php
│
├── 📁 public/                       # Public web root
│   ├── index.php                    # Application entry point (includes custom storage file handler)
│   └── .htaccess                    # Apache rewrite rules
│
├── 📁 resources/                    # Views, assets, lang files
│   └── 📁 views/                    # Blade templates
│       ├── 📁 emails/               # Email templates
│       │   ├── generic.blade.php
│       │   ├── password_reset.blade.php
│       │   ├── test.blade.php        # Test email template
│       │   └── welcome.blade.php
│       └── 📁 pdfs/                 # PDF export templates
│           ├── invoice.blade.php         # Sample invoice template
│           └── report.blade.php          # Sample report template
│
├── 📁 routes/                       # Route definitions
│   ├── api.php                      # API routes
│   ├── console.php                  # Console routes
│   └── web.php                      # Web routes
│
├── 📁 storage/                      # Storage directory
│   ├── 📁 app/                      # Application storage
│   │   └── 📁 cache/                # Application cache
│   ├── 📁 framework/                # Framework files
│   │   ├── 📁 cache/                # Framework cache
│   │   ├── 📁 sessions/             # Session files
│   │   └── 📁 views/                # Compiled views
│   └── 📁 logs/                     # Log files
│       └── laravel.log
│
├── 📁 tests/                        # Test files
│   ├── CreatesApplication.php       # Test trait
│   └── TestCase.php                 # Base test case
│
├── 📁 vendor/                       # Composer dependencies (auto-generated)
│
├── .env                             # Environment variables (not in git)
├── .env.development                 # Development environment
├── .env.production                  # Production environment
├── .env.example                     # Environment template
├── .env.development.example         # Development env template
├── .env.production.example          # Production env template
├── artisan                          # Artisan CLI tool
├── composer.json                    # Composer dependencies
├── composer.lock                    # Composer lock file
├── package.json                     # NPM dependencies
├── phpunit.xml                      # PHPUnit config
├── vite.config.js                   # Vite config
├── API-Info.md                      # API documentation
├── README.md                        # Project documentation
└── SETUP.md                         # Setup instructions
```

---

## 🛠️ Technology Stack

### Core Framework
- **Laravel 9.x** - PHP framework
- **PHP 8.0.2+** - PHP version requirement
- **MySQL** - Database (ext-pdo_mysql required)

### Authentication & Security
- **Laravel Sanctum 3.0** - API token authentication
- **JWT Tokens** - Token-based authentication

### Third-Party Packages
- **barryvdh/laravel-dompdf 3.1** - PDF generation
- **guzzlehttp/guzzle 7.2** - HTTP client

### Development Tools
- **Laravel Pint 1.0** - Code formatter
- **Laravel Sail 1.0.1** - Docker development environment
- **PHPUnit 9.5.10** - Testing framework
- **Mockery 1.4.4** - Mocking library
- **FakerPHP 1.9.1** - Fake data generation

---

## 📦 Module Overview

### 1. **Authentication Module**
- **Location**: `app/Http/Controllers/AuthController.php`
- **Routes**: `/api/auth/*`
- **Features**:
  - User login with JWT token
  - User logout
  - Get authenticated user
  - Forgot password (with email service integration, uses web_url from App Settings)
  - Reset password (with token validation)
  - Change password (for authenticated users)
- **Status**: ✅ Fully implemented

### 2. **User Management Module**
- **Location**: `app/Http/Controllers/API/UserController.php`
- **Routes**: `/api/users/*`, `/api/users/profile`
- **Features**:
  - List users (paginated, sortable)
  - Get user by ID
  - Create user
  - Update user
  - Delete user
  - Get current user profile
  - Update current user profile (with address, personal info)
- **Permissions**: `view_user`, `create_user`, `edit_user`, `delete_user`
- **Status**: ✅ Fully implemented

### 3. **Role Management Module**
- **Location**: `app/Http/Controllers/API/RoleController.php`
- **Routes**: `/api/roles/*`
- **Features**:
  - List roles (paginated, sortable)
  - Get role by ID
  - Create role
  - Update role
  - Delete role (soft delete)
  - Update role permissions
- **Permissions**: `view_role`, `create_role`, `edit_role`, `delete_role`
- **Status**: ✅ Fully implemented

### 4. **Permission Management Module**
- **Location**: `app/Http/Controllers/API/PermissionController.php`
- **Routes**: `/api/permissions/*`
- **Features**:
  - List permissions
  - Get permission by ID
- **Permissions**: `view_permission`
- **Status**: ✅ Fully implemented

**Permission Structure:**
- **Standard Permissions**: Follow pattern `{action}_{resource}` (e.g., `view_user`, `create_branch`, `edit_role`)
  - `read` type: View operations
  - `write` type: Create/edit operations
  - `delete` type: Delete operations
- **Special Permissions**: All start with `special_` prefix
  - Module: `special`
  - Submodule: `special`
  - Type: `special`
  - Examples: `special_export_data`, `special_bulk_delete`, `special_view_audit_logs`

**Available Special Permissions:**
1. `special_export_data` - Export data to Excel/PDF
2. `special_import_data` - Import data from Excel/CSV
3. `special_bulk_delete` - Bulk delete operations
4. `special_bulk_update` - Bulk update operations
5. `special_view_audit_logs` - View audit logs and activity history
6. `special_manage_backups` - Manage database backups
7. `special_system_maintenance` - Access system maintenance mode
8. `special_view_all_branches` - View all branches regardless of assignment
9. `special_override_restrictions` - Override business rules and restrictions

### 5. **Branch Management Module**
- **Location**: `app/Http/Controllers/API/BranchController.php`
- **Routes**: `/api/branches/*`
- **Features**:
  - List branches (paginated, sortable)
  - Get branch by ID
  - Create branch
  - Update branch
  - Delete branch
- **Permissions**: `view_branch`, `create_branch`, `edit_branch`, `delete_branch`
- **Status**: ✅ Fully implemented

### 6. **Financial Management Module**
- **Location**: 
  - `app/Http/Controllers/API/FinancialTransactionController.php`
  - `app/Http/Controllers/API/FinancialCategoryController.php`
- **Routes**: 
  - `/api/financial-transactions/*`, `/api/financial-transactions/stats`
  - `/api/financial-categories/*`, `/api/financial-categories/by-type/{type}`
- **Features**:
  - **Financial Transactions**:
    - List transactions (paginated, sortable, searchable with server-side filtering)
    - Get transaction by ID
    - Create transaction (auto-generates transaction_number: #INC001, #EXP001)
    - Update transaction (transaction_type cannot be changed)
    - Delete transaction (soft delete)
    - Statistics endpoint with income/expenses totals, net profit, category breakdown, monthly trends
  - **Financial Categories**:
    - List categories (paginated, sortable, searchable with server-side filtering)
    - Get category by ID
    - Create category (unique name per type)
    - Update category (type cannot be changed)
    - Delete category (cannot delete if has transactions)
    - Get categories by type (income/expense)
- **Models**:
  - `FinancialTransaction` - With relationships to `FinancialCategory` and `User` (createdBy)
  - `FinancialCategory` - With relationship to `FinancialTransaction`
- **Request Validation**:
  - `FinancialTransactionStoreRequest` - Validates transaction creation (type, date, category match, amount)
  - `FinancialTransactionUpdateRequest` - Validates transaction update (type cannot change)
  - `FinancialCategoryStoreRequest` - Validates category creation (unique name per type)
  - `FinancialCategoryUpdateRequest` - Validates category update (type cannot change)
- **API Resources**:
  - `FinancialTransactionResource` - camelCase response with category and createdBy relationships
  - `FinancialCategoryResource` - camelCase response
- **Permissions**: 
  - `view_financial_transaction`, `create_financial_transaction`, `edit_financial_transaction`, `delete_financial_transaction`
  - `view_financial_category`, `create_financial_category`, `edit_financial_category`, `delete_financial_category`
- **Status**: ✅ Fully implemented
- **Note**: 
  - Transaction type is immutable after creation
  - Category must match transaction type (validated in requests)
  - Transaction number auto-generated based on type
  - Statistics endpoint supports date range filtering

### 7. **Dashboard & Analytics Module**
- **Location**: `app/Http/Controllers/API/DashboardController.php`
- **Routes**: 
  - `/api/dashboard/summary` - Dashboard summary (placeholder)
  - `/api/dashboard/financial-summary` - Financial summary (placeholder)
- **Features**:
  - Dashboard placeholder endpoints (ready for future implementation)
- **Permissions**: `view_dashboard`
- **Status**: ⏳ Empty placeholder, ready for implementation

### 8. **Settings Management Module**
- **Location**: `app/Http/Controllers/API/SettingController.php`
- **Routes**: `/api/settings/*`, `/api/global-settings/*`
- **Features**:
  - List all settings
  - Get settings by section
  - Get setting by key
  - Create setting
  - Update setting
  - Delete setting
  - Update settings group
  - Test email configuration (uses database email settings)
  - App Settings section (Web URL for reset password links)
- **Permissions**: `view_setting`, `edit_setting`
- **Status**: ✅ Fully implemented

### 9. **Email Service**
- **Location**: `app/Services/EmailService.php`
- **Features**:
  - Send generic emails
  - Send welcome emails
  - Send password reset emails
  - Send test emails
  - Database-driven email configuration (with fallback to .env)
  - Dynamic SMTP configuration (host, port, username, password, encryption, from address/name)
  - Email template rendering (Blade templates)
- **Status**: ✅ Fully implemented

### 10. **PDF Export Service**
- **Location**: `app/Services/PdfExportService.php`
- **Features**:
  - Generate PDF documents
  - Export reports to PDF
  - Download, stream, and raw PDF output methods
- **Status**: ✅ Fully implemented
- **PDF Templates**:
  - `resources/views/pdfs/invoice.blade.php` - Sample invoice template
  - `resources/views/pdfs/report.blade.php` - Sample report template
- **Design Standards**: 
  - Pure black and white design
  - Consistent footer format
  - Ready for custom templates

### 11. **File Storage & Upload Service**
- **Location**: 
  - `app/Http/Controllers/API/UserController.php` - Avatar upload/delete
  - `app/Http/Controllers/API/SettingController.php` - Business logo upload/delete
  - `public/index.php` - Custom storage file handler (serves files directly without symlink)
- **Features**:
  - User avatar upload (Profile page)
  - Business logo upload (Settings page)
  - File validation (JPEG, PNG, WebP, max 2MB)
  - Automatic old file cleanup on upload
  - Custom storage serving via `public/index.php` (no symlink required)
  - Direct file serving from `storage/app/public/` directory
- **Storage Paths**:
  - Avatars: `storage/app/public/avatars/avatar_user_{userId}_{timestamp}_{uniqid}.{ext}`
  - Logos: `storage/app/public/logos/business_logo_{timestamp}_{uniqid}.{ext}`
- **URL Generation**:
  - Files accessible at: `/admin/api/storage/{path}`
  - Custom handler in `public/index.php` intercepts requests and serves files directly
  - Works on shared hosting where symlinks might be restricted
- **Status**: ✅ Fully implemented
- **Note**: Storage files are served via custom handler in `public/index.php` that bypasses Laravel routing for better performance and compatibility with shared hosting

### 12. **Restaurant Settings Module**
- **Location**: `app/Http/Controllers/API/RestaurantSettingsController.php`
- **Routes**: `/api/restaurant-settings/*`
- **Features**:
  - List all restaurant settings (grouped by section)
  - Get settings by section (GST Settings, Invoice Settings, Thermal Printer)
  - Get setting by key
  - Create/Update setting (single or bulk)
  - Delete setting
  - Section-based grouping and filtering
- **Data Storage**: Uses `settings` table with `group` field:
  - `'GST Settings'` - Default GST percentage, calculation method
  - `'Invoice Settings'` - Invoice prefix, business name, address, contact info, footer text, other text
  - `'Thermal Printer'` - Printer name, IP, port, paper width, enabled status
- **Permissions**: `view_restaurant_settings`, `edit_restaurant_settings`
- **Status**: ✅ Fully implemented

### 13. **Food Categories Module**
- **Location**: `app/Http/Controllers/API/FoodCategoryController.php`
- **Routes**: `/api/food-categories/*`
- **Features**:
  - List food categories (paginated, sortable, searchable)
  - Get category by ID
  - Create category
  - Update category
  - Delete category (soft delete)
  - Server-side pagination, filtering, and searching
- **Model**: `FoodCategory` (with soft deletes)
- **Request Validation**: `FoodCategoryStoreRequest`, `FoodCategoryUpdateRequest`
- **API Resource**: `FoodCategoryResource`
- **Permissions**: `view_food_category`, `create_food_category`, `edit_food_category`, `delete_food_category`
- **Status**: ✅ Backend fully implemented (frontend pending)

### 14. **Food Items Module**
- **Location**: `app/Http/Controllers/API/FoodItemController.php`
- **Routes**: `/api/food-items/*`, `/api/food-items/{item}/upload-image`, `/api/food-items/{item}/image`, `/api/food-items/{item}/move-up`, `/api/food-items/{item}/move-down`
- **Features**:
  - List food items (paginated, sortable, searchable)
  - Get item by ID
  - Create item
  - Update item (image field excluded if not provided - preserves existing image)
  - Delete item (soft delete)
  - Upload item image (multipart/form-data, JPEG/PNG/WebP, max 2MB)
  - Delete item image
  - Move item up/down within category (reordering via display_order)
  - Filter by category, status, veg/non-veg
  - Server-side pagination, filtering, and searching
- **Model**: `FoodItem` (with soft deletes, relationship to FoodCategory, `image` and `display_order` fields)
- **Request Validation**: `FoodItemStoreRequest`, `FoodItemUpdateRequest`
- **API Resource**: `FoodItemResource` (includes category relationship, image URL with `/admin/api/storage/` prefix)
- **Image Storage**: Files stored in `storage/app/public/food-items/`, served via custom handler at `/admin/api/storage/food-items/*`
- **Image Preservation**: When updating item without new image, `image` field is excluded from payload to preserve existing image
- **Permissions**: `view_food_item`, `create_food_item`, `edit_food_item`, `delete_food_item`
- **Status**: ✅ Fully implemented (Frontend + Backend)

### 15. **Table Management Module**
- **Location**: `app/Http/Controllers/API/TableController.php`
- **Routes**: `/api/tables/*`
- **Features**:
  - List tables (returns all records in data field, pagination metadata in meta)
  - Get table by ID
  - Create table
  - Update table
  - Delete table (soft delete)
  - Filter by status (available, occupied, reserved, cleaning, maintenance)
  - Filter by active/inactive status
  - Search by table_number or table_name
  - Server-side pagination, filtering, and searching
- **Model**: `Table` (with soft deletes, scopes: active, ordered)
- **Request Validation**: `TableStoreRequest`, `TableUpdateRequest`
- **API Resource**: `TableResource` (camelCase format)
- **Permissions**: `view_table`, `create_table`, `edit_table`, `delete_table`
- **Status**: ✅ Fully implemented (Frontend + Backend)
- **Seeder**: `TableSeeder` - Creates 15 sample table records

### 16. **Bill Management Module** (Restaurant System)
- **Location**: `app/Http/Controllers/API/BillController.php` (To be created)
- **Routes**: `/api/bills/*`, `/api/bills/{bill}/process-payment`, `/api/bills/table/{tableId}`
- **Features**:
  - List bills (paginated, sortable, searchable, filterable)
  - Get bill by ID
  - Create bill (draft or paid)
  - Update bill
  - Delete bill (soft delete)
  - Get bills by table (for loading existing orders)
  - Process payment (cash/upi/card/wallet)
  - Bill number auto-generation (#BILL001 format)
  - Bill status management (draft → pending → paid)
  - Payment status calculation (pending/partial/paid)
- **Model**: `Bill` (with soft deletes, relationships to Table, Customer, WalletTransaction)
- **Related Model**: `BillItem` (bill items with food_item relationship)
- **Request Validation**: `BillStoreRequest`, `BillUpdateRequest` (To be created)
- **API Resource**: `BillResource`, `BillItemResource` (To be created)
- **Payment Logic**:
  - **Cash/UPI/Card**: Updates bill status to 'paid', payment_status to 'paid' (no wallet transaction)
  - **Wallet**: Updates bill status to 'pending', payment_status to 'pending', creates wallet transaction (debit)
- **Permissions**: `view_bill`, `create_bill`, `edit_bill`, `delete_bill`, `bill_payment`
- **Status**: ⏳ Backend APIs pending (Frontend logic ready)
- **Database**: 
  - `bills` table (migration exists)
  - `bill_items` table (migration exists)
  - `wallet_transactions` table (for wallet payments)

### 17. **Customer Management Module**
- **Location**: `app/Http/Controllers/API/CustomerController.php`
- **Routes**: `/api/customers/*`
- **Features**:
  - List customers (paginated, sortable, searchable, filterable)
  - Get customer by ID
  - Create customer (auto-generates customer_code: #CUST001)
  - Update customer
  - Delete customer (soft delete)
  - Search by name, customer_code, mobile, email
  - Filter by customer_type (regular, credit) and status (active, inactive)
  - Filter by city
  - Server-side pagination, filtering, and searching
  - Default sort: name (ascending)
  - Default page size: 25
- **Model**: `Customer` (with soft deletes, relationships: bills, walletTransactions, scopes: active, credit, regular)
- **Request Validation**: `CustomerStoreRequest`, `CustomerUpdateRequest`
- **API Resource**: `CustomerResource` (camelCase format)
- **Permissions**: `view_customer`, `create_customer`, `edit_customer`, `delete_customer`
- **Status**: ✅ Fully implemented (Frontend + Backend)
- **Seeder**: `CustomerSeeder` - Creates 10 sample customer records
- **Note**: Customer code auto-generated via model observer before creation

---

## 🏗️ Architecture Patterns

### 1. **Service Layer Pattern**
Business logic is separated into service classes:
```
Controller → Service → Model → Database
```

**Example:**
```php
// Controller
public function __construct(EmailService $emailService)
{
    $this->emailService = $emailService;
}

// Service handles business logic
$this->emailService->sendEmailImmediately(...);
```

### 2. **Repository Pattern (Implicit)**
Eloquent models act as repositories:
```php
User::where('email', $email)->first();
Role::with('permissions')->get();
```

### 3. **Middleware Pattern**
Authentication and authorization via middleware:
```php
Route::middleware(['auth:sanctum', 'permission:view_user'])
```

### 4. **Dependency Injection**
Services injected via constructor:
```php
public function __construct(EmailService $emailService, S3Service $s3Service)
{
    $this->emailService = $emailService;
    $this->s3Service = $s3Service;
}
```

### 5. **Controller Traits**
- **PaginatesResults Trait**: Standardizes pagination, sorting, and meta responses
- **Usage**: Compose in controllers and call `buildPaginator()` method
- **Returns**: Standardized `{ success, data, meta }` response format

---

## 📋 Development Guidelines

### Code Organization

#### 1. **Controllers**
- Keep controllers thin (max 100-150 lines)
- Delegate business logic to services
- Handle HTTP concerns only (request/response)
- Use dependency injection
- Reuse `PaginatesResults` trait for consistent pagination

**Good:**
```php
public function store(Request $request, EmailService $emailService)
{
    $validated = $request->validate([...]);
    $user = User::create($validated);
    $emailService->sendWelcomeEmail($user);
    return response()->json($user, 201);
}
```

**Bad:**
```php
public function store(Request $request)
{
    // Too much business logic in controller
    $user = User::create($request->all());
    Mail::to($user->email)->send(new WelcomeMail($user));
    // ... more logic
}
```

#### 2. **Models**
- Define relationships
- Use scopes for reusable queries
- Add accessors/mutators when needed
- Keep business logic minimal (use services)

**Example:**
```php
// Model
public function scopeActive($query)
{
    return $query->where('is_active', true);
}

// Usage
User::active()->get();
```

#### 3. **Services**
- Single responsibility principle
- Load settings from database
- Handle external API calls
- Return simple values or throw exceptions

**Example:**
```php
class EmailService
{
    public function sendEmailImmediately($to, $type, $data)
    {
        $settings = $this->getEmailSettings();
        $this->configureMailSettings($settings);
        // ... send email
    }
}
```

#### 4. **Middleware**
- Keep middleware focused
- Return early on failure
- Use for cross-cutting concerns

**Example:**
```php
public function handle(Request $request, Closure $next, $permission)
{
    if (!$request->user()->hasPermission($permission)) {
        return response()->json(['message' => 'Forbidden'], 403);
    }
    return $next($request);
}
```

### Naming Conventions

#### Files & Classes
- **Controllers**: `UserController`, `RoleController`
- **Models**: `User`, `Role`, `Permission` (singular, PascalCase)
- **Services**: `EmailService`, `PdfExportService` (PascalCase + Service)
- **Middleware**: `CheckRole`, `CheckPermission` (PascalCase)
- **Migrations**: `create_users_table`, `add_status_to_users_table` (snake_case)

#### Methods
- **Controllers**: `index`, `store`, `show`, `update`, `destroy` (RESTful)
- **Models**: `hasRole()`, `hasPermission()`, `getAllPermissions()`
- **Services**: `sendEmailImmediately()`, `uploadFile()`

#### Variables
- **camelCase**: `$userName`, `$emailService`
- **Database**: `snake_case` (Laravel convention)

### Database Guidelines

#### Migrations
1. **Always create migrations** for schema changes
2. **Never modify existing migrations** - create new ones
3. **Use foreign keys** for relationships
4. **Add indexes** for frequently queried columns
5. **Use timestamps** on all tables

**Example:**
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('email')->unique();
    $table->timestamps();
    $table->index('email');
});
```

**Critical: Indexes for High-Volume Tables**

For tables that will have high record counts (e.g., `bills`, `bill_items`), **always add indexes** in the migration:

```php
// bills table - Add indexes for performance
Schema::create('bills', function (Blueprint $table) {
    // ... columns ...
    
    // Foreign keys
    $table->foreign('table_id')->references('id')->on('tables')->onDelete('set null');
    $table->foreign('customer_id')->references('id')->on('customers')->onDelete('set null');
    $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
    
    // CRITICAL INDEXES - Must add for performance
    $table->index('table_id');           // Most queries filter by table
    $table->index('customer_id');        // Customer bill history
    $table->index('status');              // Filter active/pending/paid
    $table->index('bill_date');           // Date range queries, reports
    $table->index('payment_status');      // Payment filtering
    $table->index('created_at');          // Recent bills, sorting
});

// bill_items table - Add indexes for performance
Schema::create('bill_items', function (Blueprint $table) {
    // ... columns ...
    
    // Foreign keys
    $table->foreign('bill_id')->references('id')->on('bills')->onDelete('cascade');
    $table->foreign('food_item_id')->references('id')->on('food_items')->onDelete('restrict');
    
    // CRITICAL INDEXES - Must add for performance
    $table->index('bill_id');            // MOST IMPORTANT - Fetching items for a bill
    $table->index('food_item_id');        // Popular items reports
    $table->index('created_at');          // Date range queries
});
```

**Why Indexes Matter:**
- Without `idx_bill_id` on `bill_items`, fetching items becomes slow as data grows (full table scan)
- Without `idx_table_id` on `bills`, POS panel queries become slow
- These indexes ensure sub-10ms queries even with 900K+ records over 5 years

#### Seeders
1. **Idempotent** - Can run multiple times safely
2. **Use factories** for test data
3. **Call from DatabaseSeeder**

**Available Seeders:**
- **RolesTableSeeder** - Creates 4 roles: `admin`, `branch-manager`, `manager`, `staff`
- **PermissionsTableSeeder** - Creates all system permissions (users, roles, branches, packages, customers, orders, payments, dashboard, reports, financial)
- **RolePermissionSeeder** - Assigns permissions to roles (branch-manager, manager, staff)
- **UserSeeder** - Creates 2 default users:
  - `admin@example.com` / `password` (admin role)
  - `manager@example.com` / `password` (manager role)
- **BranchSeeder** - Creates sample branches (Lunawada, Vadodara)
- **FinancialCategorySeeder** - Creates 5 income and 5 expense categories
- **TableSeeder** - Creates 15 sample table records (T1-T11, Family-1, Family-2, VIP-1, Window-1) with various statuses and capacities

---

## 🌐 API Development

### Request Validation
Always validate inputs:
```php
$validated = $request->validate([
    'email' => 'required|email|unique:users',
    'password' => 'required|min:8',
]);
```

### Response Format

#### Success Response
```php
// Single item
return response()->json([
    'success' => true,
    'data' => $user
], 200);

// List with pagination
return response()->json([
    'success' => true,
    'data' => $users,
    'meta' => $this->paginationMeta($paginator, $sortBy, $sortDirection)
], 200);
```

#### Error Response
```php
// Validation error (422)
return response()->json([
    'message' => 'The given data was invalid.',
    'errors' => $validator->errors()
], 422);

// Not found (404)
return response()->json([
    'message' => 'Resource not found'
], 404);

// Forbidden (403)
return response()->json([
    'message' => 'Forbidden'
], 403);
```

### Pagination Format
List endpoints return standardized format:
```json
{
  "success": true,
  "data": [...],
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

### Critical Frontend Dependencies (Nov 2025)
- Orders और Customers modules अब frontend पर mock fallback के बिना सीधे इन APIs पर निर्भर हैं
- किसी भी downtime से admin UI तुरंत प्रभावित होगा, इसलिए इन endpoints के लिए monitoring/alerting enforce करें
- Error payloads हमेशा user-friendly `message` के साथ भेजें ताकि toast notifications अर्थपूर्ण रहें

### Using PaginatesResults Trait

```php
use App\Http\Controllers\Concerns\PaginatesResults;

class UserController extends Controller
{
    use PaginatesResults;

    public function index(Request $request)
    {
        $query = User::query();
        $sortableColumns = ['name', 'email', 'created_at'];
        $defaultSort = ['column' => 'created_at', 'direction' => 'desc'];

        [$paginator, $sortBy, $sortDirection] = $this->buildPaginator(
            $request,
            $query,
            $sortableColumns,
            $defaultSort
        );

        return response()->json([
            'success' => true,
            'data' => $paginator->items(),
            'meta' => $this->paginationMeta($paginator, $sortBy, $sortDirection)
        ]);
    }
}
```

---

## 🔒 Security Guidelines

### 1. **Authentication**
- Use Laravel Sanctum for API tokens
- Tokens stored in `personal_access_tokens` table
- Include token in `Authorization: Bearer {token}` header

### 2. **Authorization**
- Check permissions in middleware
- Admin role has all permissions (checked in User model)
- Use `hasPermission()` method for checks

### 3. **Input Validation**
- Always validate user input
- Use Laravel's validation rules
- Sanitize data before storing

### 4. **Password Security**
- Always hash passwords: `Hash::make($password)`
- Never store plain text passwords
- Use `Hash::check()` for verification

### 5. **SQL Injection**
- Use Eloquent ORM (prevents SQL injection)
- Use parameter binding for raw queries
- Never concatenate user input into queries

### 6. **CORS**
- Configured in `config/cors.php`
- Only allow trusted origins
- Support credentials for authenticated requests
- Includes dev origins: `http://localhost:5173`, `http://localhost:5174`

---

## 🧪 Testing Guidelines

### Test Structure
```
tests/
├── Feature/        # Integration tests
│   └── UserTest.php
└── Unit/           # Unit tests
    └── UserModelTest.php
```

### Writing Tests
```php
public function test_user_can_login()
{
    $user = User::factory()->create();
    
    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    
    $response->assertStatus(200)
             ->assertJsonStructure(['token', 'user']);
}
```

---

## 🔧 Common Tasks

### Adding a New API Endpoint

1. **Create Migration** (if needed)
   ```bash
   php artisan make:migration create_products_table
   ```

2. **Create Model**
   ```bash
   php artisan make:model Product
   ```

3. **Create Controller**
   ```bash
   php artisan make:controller API/ProductController
   ```

4. **Add Routes** (`routes/api.php`)
   ```php
   Route::get('/products', [ProductController::class, 'index'])
        ->middleware(['auth:sanctum', 'permission:view_product']);
   ```

5. **Implement Methods** in controller

6. **Test** the endpoint

### Adding a New Service

1. **Create Service File**
   ```
   app/Services/NewService.php
   ```

2. **Implement Service Class**
   ```php
   class NewService
   {
       public function doSomething()
       {
           // Implementation
       }
   }
   ```

3. **Inject in Controller**
   ```php
   public function __construct(NewService $newService)
   {
       $this->newService = $newService;
   }
   ```

### Adding a New Middleware

1. **Create Middleware**
   ```bash
   php artisan make:middleware CheckFeature
   ```

2. **Register in Kernel** (`app/Http/Kernel.php`)
   ```php
   'feature' => \App\Http\Middleware\CheckFeature::class,
   ```

3. **Use in Routes**
   ```php
   Route::middleware(['auth:sanctum', 'feature'])->group(...);
   ```

### Adding a New Permission

1. **Add to PermissionsTableSeeder**
   ```php
   Permission::create([
       'name' => 'view_product',
       'description' => 'View products',
       'module' => 'products',
       'submodule' => 'management',
       'type' => 'read',
   ]);
   ```

2. **Assign to Roles** via API or seeder

---

## 📊 Database Schema

### Core Tables
- **users** - User accounts (with avatar, date_of_birth, gender, state, zip_code fields)
- **roles** - User roles (with soft delete)
- **permissions** - System permissions
- **user_role** - User-role pivot table
- **role_permission** - Role-permission pivot table
- **branches** - Branch locations
- **packages** - Package definitions (package_name, package_type, default_price, description, status)
- **customers** - Customer accounts (with stats: total_orders, total_amount, paid_amount, remaining_amount, customer_code)
- **orders** - Order records (with customer_id, branch_id, status, payment_status, amounts, **links** JSON column for important links)
- **order_items** - Order items (many packages per order: order_id, package_id, quantity, unit_price, total_price)
- **payments** - Payment records (payment_number, order_id, customer_id, payment_type, amount, payment_method)
- **settings** - System settings (including email settings: host, port, username, password, from_address, from_name; App Settings: web_url)
- **emails** - Email logs
- **personal_access_tokens** - Sanctum tokens
- **password_resets** - Password reset tokens
- **failed_jobs** - Failed queue jobs

### Relationships
- **User** has many **Roles** (many-to-many)
- **Role** has many **Permissions** (many-to-many)
- **User** has many **Permissions** (through roles)
- **Branch** belongs to many **Users** (future)
- **Customer** belongs to **Branch**
- **Customer** has many **Orders**
- **Customer** has many **Payments**
- **Order** belongs to **Customer**
- **Order** belongs to **Branch**
- **Order** has many **OrderItems**
- **Order** has many **Payments**
- **OrderItem** belongs to **Order**
- **OrderItem** belongs to **Package**
- **Payment** belongs to **Order**
- **Payment** belongs to **Customer**
- **Payment** belongs to **Branch**

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
composer install
```

### 2. Setup Environment
```bash
cp .env.example .env
php artisan key:generate
```

### 3. Configure Database
Edit `.env` with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=photo_studio
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Run Migrations
```bash
php artisan migrate
```

### 5. Seed Database
```bash
php artisan db:seed
```

### 6. Start Server
```bash
php artisan serve
```

---

## 📚 Best Practices Summary

### ✅ Do's
- ✅ Keep controllers thin
- ✅ Use services for business logic
- ✅ Validate all inputs
- ✅ Use Eloquent relationships
- ✅ **Eager load relationships** to avoid N+1 queries (e.g., `Bill::with('items')->get()`)
- ✅ Use migrations for schema changes
- ✅ **Add indexes in migrations** for foreign keys and frequently queried columns
- ✅ Write descriptive commit messages
- ✅ Follow PSR-12 coding standards
- ✅ Use dependency injection
- ✅ Handle errors gracefully
- ✅ Log important events
- ✅ Write tests for critical features
- ✅ Use PaginatesResults trait for list endpoints
- ✅ Convert empty strings to null for nullable fields
- ✅ Use database settings with fallback to .env
- ✅ Provide user-friendly error messages
- ✅ File uploads implemented for avatars and business logos (local storage, no S3)
- ✅ Custom storage file handler in `public/index.php` (no symlink required)
- ✅ **Use database transactions** for multi-step operations (e.g., creating bill with items)
- ✅ **Recalculate totals in database** when possible (use DB::raw() for calculations)
- ✅ **Monitor query performance** - Check slow query log regularly

### ❌ Don'ts
- ❌ Don't put business logic in controllers
- ❌ Don't modify existing migrations
- ❌ Don't commit `.env` files
- ❌ Don't use raw SQL (use Eloquent)
- ❌ Don't ignore validation errors
- ❌ Don't hardcode configuration
- ❌ Don't skip error handling
- ❌ **Don't create N+1 queries** - Always eager load relationships
- ❌ Don't store sensitive data in logs
- ❌ Don't bypass authentication/authorization
- ❌ **Don't skip indexes** on foreign keys and frequently queried columns
- ❌ **Don't calculate totals in application** - Use database calculations when possible
- ❌ **Don't fetch all records** - Always use pagination for list endpoints
- ❌ **Don't forget database transactions** - Use transactions for multi-step operations

---

## 🔄 Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   composer update
   ```

2. **Clear Cache**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   ```

3. **Optimize for Production**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

4. **Check Logs**
   ```bash
   tail -f storage/logs/laravel.log
   ```

---

## 📖 Additional Resources

- **Laravel Documentation**: https://laravel.com/docs/9.x
- **Laravel Sanctum**: https://laravel.com/docs/9.x/sanctum
- **Laravel Migrations**: https://laravel.com/docs/9.x/migrations

---

**Last Updated**: January 2025
**Version**: 1.6.0 (Bill Management Module - Frontend Ready, Backend Pending)

## 🔄 Recent Updates
- ⏳ **Bill Management Module** - Frontend implementation complete, backend APIs pending
  - Frontend POS Panel payment processing logic ready
  - Payment methods: Cash, UPI, Card, Wallet
  - Save Draft functionality (manual + auto-save on cart changes)
  - Print Bill functionality (print-friendly HTML template)
  - Payment processing logic:
    - Cash/UPI/Card: Creates bill only (no wallet transaction)
    - Wallet: Creates bill + wallet transaction (debit)
  - Backend APIs to be created:
    - `POST /api/bills` - Create bill
    - `GET /api/bills` - List bills
    - `GET /api/bills/{bill}` - Get bill details
    - `PUT /api/bills/{bill}` - Update bill
    - `DELETE /api/bills/{bill}` - Delete bill
    - `GET /api/bills/table/{tableId}` - Get bills for table
    - `POST /api/bills/{bill}/process-payment` - Process payment
- ✅ Financial Management module fully implemented
- ✅ Financial categories and transactions tables migrations created
- ✅ Financial permissions added and seeded
- ✅ FinancialTransactionController and FinancialCategoryController with full CRUD operations
- ✅ Financial statistics endpoint with income/expenses breakdown
- ✅ Server-side pagination, filtering, and searching for Financial Transactions and Categories
- ✅ Transaction type immutability after creation
- ✅ Category validation (must match transaction type)
- ✅ Payment Management module fully implemented
- ✅ Payments table migration created and run
- ✅ Payment permissions added and seeded
- ✅ Server-side pagination, filtering, and searching for Packages, Customers, and Orders
- ✅ Payment model with auto order status update
- ✅ PaymentController with full CRUD operations
- ✅ PDF Export functionality fully implemented for Orders, Customers, and Payments
- ✅ All PDF exports use pure black and white design with single thin line dividers
- ✅ Consistent footer format across all PDFs: Business Name | Address | Phone | Website | Footer Text
- ✅ Standardized PDF filename format: `Order_{OrderID}_{CustomerName}.pdf`, `Customer_{CustomerID}_{CustomerName}.pdf`, `Payment_{PaymentId}_{CustomerName}.pdf`
- ✅ CORS configuration updated to expose Content-Disposition header
- ✅ Orders & Customers endpoints now treated as critical because frontend removed mock fallbacks—ensure uptime, monitoring, and meaningful error payloads
- ✅ Order details endpoint (`/api/orders/{id}`) now includes payment history in response
- ✅ Payment status simplified to `pending` or `completed` (calculated from remaining amount)
- ✅ Order statistics endpoint (`/api/orders/stats`) added with date range filtering
- ✅ API resources cleaned up - removed duplicate fields, using camelCase only
- ✅ Payment numbers auto-generated in #PAY001 format
- ✅ **File Upload Service** - Avatar and business logo upload implemented with local storage (no S3)
- ✅ **Custom Storage Handler** - `public/index.php` serves storage files directly without symlink (works on shared hosting)
- ✅ Avatar upload endpoints: `POST /api/users/profile/avatar`, `DELETE /api/users/profile/avatar`
- ✅ Logo upload endpoints: `POST /api/settings/upload-logo`, `DELETE /api/settings/delete-logo`
- ✅ **Important Links Management** - Added `links` JSON column to orders table, Order model updated with fillable and casts, OrderResource includes links array, validation added to OrderStoreRequest and OrderUpdateRequest
- ✅ **Report Management Module** - Company Health Report fully implemented with date range filtering, branch filtering, comprehensive financial calculations, and PDF export with colorful design
- ✅ **Permissions System** - Added `view_report` permission for reports module, all pages now have proper permission protection
- ✅ **Database Seeders** - Updated roles (admin, branch-manager, manager, staff), added default users (admin@example.com, manager@example.com), reduced financial categories to 5 income + 5 expense
- ✅ **Restaurant Settings Module** - Fully implemented with RestaurantSettingsController, uses settings table with section grouping
- ✅ **Food Categories Module** - Fully implemented (migration, model with foodItems relationship, controller with hierarchy endpoint, requests, resources, routes, permissions)
- ✅ **Food Items Module** - Fully implemented (migration with image and display_order fields, model, controller with image upload/delete and reordering endpoints, requests, resources, routes, permissions)
- ✅ **Table Management Module** - Fully implemented (migration, model with scopes, controller with CRUD operations, requests, resources, routes, permissions, seeder)
- ✅ **Menu Hierarchy API** - `GET /api/food-categories/hierarchy` endpoint returns categories with nested items, sorted by display_order
- ✅ **Image Upload Endpoints** - `POST /api/food-items/{item}/upload-image` and `DELETE /api/food-items/{item}/image` for managing item images
- ✅ **Item Reordering Endpoints** - `POST /api/food-items/{item}/move-up` and `POST /api/food-items/{item}/move-down` for changing item order within categories
- ✅ **Image Preservation** - When updating items without new image, image field is excluded from payload to preserve existing image in database
- ✅ **Restaurant Permissions** - Added and seeded: `view_restaurant_settings`, `edit_restaurant_settings`, and all Food Category/Item permissions
- ✅ **Table Management Module** - Fully implemented (migration, model with scopes, controller with CRUD operations, requests, resources, routes, permissions, seeder)
- ✅ **Table Permissions** - Added and seeded: `view_table`, `create_table`, `edit_table`, `delete_table` permissions
- ✅ **Table Seeder** - Created TableSeeder with 15 sample table records
- ✅ **Database Migrations** - Created `food_categories` and `food_items` tables with proper relationships and indexes
- ✅ **Database Scalability Guidelines** - Added comprehensive documentation on database performance optimization, indexing strategies, and scalability considerations for high-volume tables (bills, bill_items)
- ✅ **Performance Best Practices** - Added guidelines for proper indexing, query optimization, eager loading, and transaction management
- ✅ **Database Scalability Guidelines** - Added comprehensive documentation on database performance optimization, indexing strategies, and scalability considerations for high-volume tables (bills, bill_items)
- ✅ **Performance Best Practices** - Added guidelines for proper indexing, query optimization, eager loading, and transaction management
