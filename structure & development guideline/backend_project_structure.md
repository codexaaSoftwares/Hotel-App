# Hotel Management App - Backend API Project Structure & Development Guidelines

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Complete Project Structure](#complete-project-structure)
3. [Technology Stack](#technology-stack)
4. [Module Overview](#module-overview)
5. [Development Guidelines](#development-guidelines)
6. [API Development Rules](#api-development-rules)
7. [Services](#services)
8. [Important Notes](#important-notes)

---

## 🚀 Project Overview

**Hotel Management App Backend** is a Laravel 9 RESTful API that powers the Hotel Management App admin dashboard.

### Key Features
- 🔐 JWT Authentication with Laravel Sanctum
- 👥 Role-Based Access Control (RBAC)
- 📊 RESTful API endpoints
- 🗄️ MySQL database with migrations
- 📧 Email service integration
- 📄 PDF export service
- 📤 File upload service (avatars, business logos)
- 🔒 Permission-based route protection
- 📦 Standardized pagination and sorting

---

## 📁 Complete Project Structure

```
backend/
├── 📁 app/
│   ├── 📁 Console/
│   │   └── Kernel.php
│   │
│   ├── 📁 Exceptions/
│   │   └── Handler.php
│   │
│   ├── 📁 Http/
│   │   ├── 📁 Controllers/
│   │   │   ├── 📁 API/                  # API controllers
│   │   │   │   ├── BillController.php
│   │   │   │   ├── BranchController.php
│   │   │   │   ├── CustomerController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── FoodCategoryController.php
│   │   │   │   ├── FoodItemController.php
│   │   │   │   ├── PermissionController.php
│   │   │   │   ├── RestaurantSettingsController.php
│   │   │   │   ├── RoleController.php
│   │   │   │   ├── ExpenseCategoryController.php
│   │   │   │   ├── ExpenseController.php
│   │   │   │   ├── ReportController.php
│   │   │   │   ├── SalaryPaymentController.php
│   │   │   │   ├── SettingController.php
│   │   │   │   ├── StaffController.php
│   │   │   │   ├── TableController.php
│   │   │   │   ├── UserController.php
│   │   │   │   └── WalletTransactionController.php
│   │   │   ├── 📁 Concerns/
│   │   │   │   └── PaginatesResults.php  # Pagination trait
│   │   │   ├── AuthController.php
│   │   │   └── Controller.php            # Base controller
│   │   │
│   │   ├── 📁 Middleware/
│   │   │   ├── Authenticate.php
│   │   │   ├── CheckPermission.php      # Permission check
│   │   │   ├── CheckRole.php            # Role check
│   │   │   ├── EncryptCookies.php
│   │   │   ├── PreventRequestsDuringMaintenance.php
│   │   │   ├── RedirectIfAuthenticated.php
│   │   │   ├── TrimStrings.php
│   │   │   ├── TrustProxies.php
│   │   │   ├── ValidateSignature.php
│   │   │   └── VerifyCsrfToken.php
│   │   │
│   │   ├── 📁 Requests/                  # Form request validation
│   │   │   ├── BillStoreRequest.php
│   │   │   ├── BillUpdateRequest.php
│   │   │   ├── BranchStoreRequest.php
│   │   │   ├── BranchUpdateRequest.php
│   │   │   ├── CustomerStoreRequest.php
│   │   │   ├── CustomerUpdateRequest.php
│   │   │   ├── ExpenseCategoryStoreRequest.php
│   │   │   ├── ExpenseCategoryUpdateRequest.php
│   │   │   ├── ExpenseStoreRequest.php
│   │   │   ├── ExpenseUpdateRequest.php
│   │   │   ├── FoodCategoryStoreRequest.php
│   │   │   ├── FoodCategoryUpdateRequest.php
│   │   │   ├── FoodItemStoreRequest.php
│   │   │   ├── FoodItemUpdateRequest.php
│   │   │   ├── ProcessPaymentRequest.php
│   │   │   ├── SalaryPaymentStoreRequest.php
│   │   │   ├── SalaryPaymentUpdateRequest.php
│   │   │   ├── StaffStoreRequest.php
│   │   │   ├── StaffUpdateRequest.php
│   │   │   ├── TableStoreRequest.php
│   │   │   ├── TableUpdateRequest.php
│   │   │   ├── WalletTransactionStoreRequest.php
│   │   │   └── WalletTransactionUpdateRequest.php
│   │   │
│   │   └── 📁 Resources/                  # API resources
│   │       ├── BillItemResource.php
│   │       ├── BillResource.php
│   │       ├── BranchResource.php
│   │       ├── CustomerResource.php
│   │       ├── ExpenseCategoryResource.php
│   │       ├── ExpenseResource.php
│   │       ├── FoodCategoryResource.php
│   │       ├── FoodItemResource.php
│   │       ├── SalaryPaymentResource.php
│   │       ├── StaffResource.php
│   │       ├── TableResource.php
│   │       └── WalletTransactionResource.php
│   │
│   ├── 📁 Mail/                          # Email classes
│   │   └── GenericEmail.php
│   │
│   ├── 📁 Models/                        # Eloquent models
│   │   ├── Bill.php
│   │   ├── BillItem.php
│   │   ├── Branch.php
│   │   ├── Customer.php
│   │   ├── Expense.php
│   │   ├── ExpenseCategory.php
│   │   ├── FoodCategory.php
│   │   ├── FoodItem.php
│   │   ├── Permission.php
│   │   ├── Role.php
│   │   ├── SalaryPayment.php
│   │   ├── Setting.php
│   │   ├── Staff.php
│   │   ├── Table.php
│   │   ├── User.php
│   │   └── WalletTransaction.php
│   │
│   ├── 📁 Providers/
│   │   ├── AppServiceProvider.php
│   │   ├── AuthServiceProvider.php
│   │   ├── EventServiceProvider.php
│   │   └── RouteServiceProvider.php
│   │
│   └── 📁 Services/                      # Business logic services
│       ├── EmailService.php
│       └── PdfExportService.php
│
├── 📁 bootstrap/
│   ├── app.php
│   └── 📁 cache/
│       ├── packages.php
│       └── services.php
│
├── 📁 config/                            # Configuration files
│   ├── app.php
│   ├── auth.php
│   ├── cache.php
│   ├── cors.php
│   ├── database.php
│   ├── filesystems.php
│   ├── logging.php
│   ├── mail.php
│   ├── queue.php
│   ├── sanctum.php
│   ├── session.php
│   └── view.php
│
├── 📁 database/
│   ├── 📁 migrations/                   # Database migrations
│   │   ├── 2025_11_17_083104_create_users_table.php
│   │   ├── 2025_11_17_083129_create_roles_and_permissions_tables.php
│   │   ├── 2025_11_17_083142_create_branches_table.php
│   │   ├── 2025_11_17_083320_create_settings_table.php
│   │   ├── 2025_11_17_083332_create_emails_table.php
│   │   ├── 2025_11_17_083347_create_password_reset_tokens_table.php
│   │   ├── 2025_11_17_083400_create_failed_jobs_table.php
│   │   ├── 2025_01_20_000001_create_food_categories_table.php
│   │   ├── 2025_01_20_000002_create_food_items_table.php
│   │   ├── 2025_01_21_000001_create_tables_table.php
│   │   ├── 2025_01_22_000001_create_customers_table.php
│   │   ├── 2025_01_22_000002_create_bills_table.php
│   │   ├── 2025_01_22_000003_create_bill_items_table.php
│   │   ├── 2025_01_22_000004_create_wallet_transactions_table.php
│   │   ├── 2026_01_06_130603_add_image_and_display_order_to_food_items_table.php
│   │   ├── 2026_01_08_134747_make_gst_percentage_nullable_in_food_items_table.php
│   │   ├── 2026_01_08_135310_add_is_popular_to_food_items_table.php
│   │   ├── 2026_01_15_000001_update_gst_settings_to_cgst_sgst_service_tax.php
│   │   ├── 2026_01_15_000002_remove_gst_percentage_from_food_items_table.php
│   │   ├── 2026_01_19_000001_remove_calculated_fields_from_customers_table.php
│   │   ├── 2026_01_19_125803_make_bill_number_nullable_in_bills_table.php
│   │   ├── 2026_01_29_084535_add_separate_gst_fields_to_bills_table.php
│   │   ├── 2026_01_29_121459_create_staff_table.php
│   │   ├── 2026_01_29_121509_create_salary_payments_table.php
│   │   ├── 2026_01_29_134428_add_month_year_to_salary_payments_table.php
│   │   ├── 2026_01_29_135523_remove_payable_amount_from_salary_payments_table.php
│   │   ├── 2026_01_30_000001_create_expense_categories_table.php
│   │   └── 2026_01_30_000002_create_expenses_table.php
│   │
│   └── 📁 seeders/                       # Database seeders
│       ├── BranchSeeder.php
│       ├── CustomerSeeder.php
│       ├── DatabaseSeeder.php
│       ├── FoodCategorySeeder.php
│       ├── FoodItemSeeder.php
│       ├── PermissionsTableSeeder.php
│       ├── RolePermissionSeeder.php
│       ├── RolesTableSeeder.php
│       ├── TableSeeder.php
│       └── UserSeeder.php
│
├── 📁 public/
│   ├── index.php                         # Application entry point
│   └── .htaccess
│
├── 📁 resources/
│   └── 📁 views/
│       ├── 📁 emails/                    # Email templates
│       │   ├── generic.blade.php
│       │   ├── password_reset.blade.php
│       │   ├── test.blade.php
│       │   └── welcome.blade.php
│       └── 📁 pdfs/                       # PDF export templates
│           ├── invoice.blade.php
│           └── report.blade.php
│
├── 📁 routes/
│   ├── api.php                           # API routes
│   ├── console.php
│   └── web.php
│
├── 📁 storage/
│   ├── 📁 app/
│   │   └── 📁 public/                    # Public storage
│   │       ├── 📁 avatars/
│   │       ├── 📁 logos/
│   │       └── 📁 food-items/
│   ├── 📁 framework/
│   │   ├── 📁 cache/
│   │   ├── 📁 sessions/
│   │   └── 📁 views/
│   └── 📁 logs/
│       └── laravel.log
│
├── 📁 tests/
│   ├── CreatesApplication.php
│   └── TestCase.php
│
├── .env                                  # Environment variables
├── .env.example                          # Environment template
├── artisan                               # Artisan CLI tool
├── composer.json                         # Composer dependencies
├── composer.lock                         # Composer lock file
├── phpunit.xml                           # PHPUnit config
├── README.md                             # Project documentation
└── SETUP.md                              # Setup instructions
```

---

## 🛠️ Technology Stack

### Core Framework
- **Laravel 9.x** - PHP framework
- **PHP 8.0.2+** - PHP version requirement
- **MySQL** - Database

### Authentication & Security
- **Laravel Sanctum 3.0** - API token authentication
- **JWT Tokens** - Token-based authentication

### Third-Party Packages
- **barryvdh/laravel-dompdf 3.1** - PDF generation
- **guzzlehttp/guzzle 7.2** - HTTP client

---

## 📦 Module Overview

### 1. **Authentication Module**
- **Location**: `app/Http/Controllers/AuthController.php`
- **Routes**: `/api/auth/*`
- **Status**: ✅ Fully implemented

### 2. **User Management Module**
- **Location**: `app/Http/Controllers/API/UserController.php`
- **Routes**: `/api/users/*`
- **Permissions**: `view_user`, `create_user`, `edit_user`, `delete_user`
- **Status**: ✅ Fully implemented

### 3. **Role & Permission Management**
- **Location**: `app/Http/Controllers/API/RoleController.php`, `PermissionController.php`
- **Routes**: `/api/roles/*`, `/api/permissions/*`
- **Status**: ✅ Fully implemented

### 4. **Branch Management Module**
- **Location**: `app/Http/Controllers/API/BranchController.php`
- **Routes**: `/api/branches/*`
- **Status**: ✅ Fully implemented

### 5. **Settings Management Module**
- **Location**: `app/Http/Controllers/API/SettingController.php`
- **Routes**: `/api/settings/*`
- **Status**: ✅ Fully implemented

### 6. **Restaurant Settings Module**
- **Location**: `app/Http/Controllers/API/RestaurantSettingsController.php`
- **Routes**: `/api/restaurant-settings/*`
- **Status**: ✅ Fully implemented

### 7. **Food Categories & Items Module**
- **Location**: `app/Http/Controllers/API/FoodCategoryController.php`, `FoodItemController.php`
- **Routes**: `/api/food-categories/*`, `/api/food-items/*`
- **Features**: Menu PDF export, Menu CSV/Excel export
- **Status**: ✅ Fully implemented

### 8. **Table Management Module**
- **Location**: `app/Http/Controllers/API/TableController.php`
- **Routes**: `/api/tables/*`
- **Status**: ✅ Fully implemented

### 9. **Bill Management Module**
- **Location**: `app/Http/Controllers/API/BillController.php`
- **Routes**: `/api/bills/*`
- **Status**: ✅ Fully implemented

### 10. **Customer Management Module**
- **Location**: `app/Http/Controllers/API/CustomerController.php`
- **Routes**: `/api/customers/*`
- **Status**: ✅ Fully implemented

### 11. **Staff Management Module**
- **Location**: `app/Http/Controllers/API/StaffController.php`
- **Routes**: `/api/staff/*`
- **Status**: ✅ Fully implemented

### 12. **Salary Payment Management Module**
- **Location**: `app/Http/Controllers/API/SalaryPaymentController.php`
- **Routes**: `/api/salary-payments/*`
- **Status**: ✅ Fully implemented

### 13. **Expense Management Module**
- **Location**: `app/Http/Controllers/API/ExpenseCategoryController.php`, `ExpenseController.php`
- **Routes**: `/api/expense-categories/*`, `/api/expenses/*`
- **Permissions**: `view_expense_category`, `create_expense_category`, `edit_expense_category`, `delete_expense_category`, `view_expense`, `create_expense`, `edit_expense`, `delete_expense`
- **Status**: ✅ Fully implemented

### 14. **Reports Module**
- **Location**: `app/Http/Controllers/API/ReportController.php`
- **Routes**: `/api/reports/*`
- **Permissions**: `sales_report:read`, `expense_report:read`, `customer_pending_report:read`, `staff_salary_report:read`
- **Status**: ✅ Fully implemented
  - ✅ Sales Report
  - ✅ Expense Report
  - ✅ Customer Pending Report
  - ✅ Staff & Salary Report
  - ✅ Category-wise Item Sales Report
  - ✅ PDF Export for all reports (compact format with business information)
  - ✅ CSV Export for all reports (UTF-8 encoding with proper formatting)

---

## 📋 Development Guidelines

### Code Organization

#### Controllers
- Keep controllers thin (max 100-150 lines)
- Delegate business logic to services
- Use dependency injection
- Reuse `PaginatesResults` trait for consistent pagination

#### Models
- Define relationships
- Use scopes for reusable queries
- Add accessors/mutators when needed

#### Services
- Single responsibility principle
- Load settings from database
- Handle external API calls
- Return simple values or throw exceptions

### Naming Conventions

#### Files & Classes
- **Controllers**: `UserController`, `RoleController`
- **Models**: `User`, `Role`, `Permission` (singular, PascalCase)
- **Services**: `EmailService`, `PdfExportService` (PascalCase + Service)
- **Migrations**: `create_users_table` (snake_case)

#### Methods
- **Controllers**: `index`, `store`, `show`, `update`, `destroy` (RESTful)
- **Variables**: `camelCase` in code, `snake_case` in database

### Database Guidelines

#### Migrations
1. Always create migrations for schema changes
2. Never modify existing migrations - create new ones
3. Use foreign keys for relationships
4. **Add indexes** for frequently queried columns (critical for performance)
5. Use timestamps on all tables

#### Critical Indexes for High-Volume Tables
For tables with high record counts (e.g., `bills`, `bill_items`), always add indexes:
- Foreign keys: `table_id`, `customer_id`, `bill_id`
- Status fields: `status`, `payment_status`
- Date fields: `created_at`, `bill_date`

---

## 🌐 API Development Rules

### Request Validation
Always validate inputs using Form Request classes:
```php
$validated = $request->validate([...]);
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
- **422** - Validation error
- **404** - Not found
- **403** - Forbidden
- **401** - Unauthorized

### Pagination Format
Use `PaginatesResults` trait for standardized pagination:
```php
use App\Http\Controllers\Concerns\PaginatesResults;

[$paginator, $sortBy, $sortDirection] = $this->buildPaginator(
    $request,
    $query,
    $sortableColumns,
    $defaultSort
);
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

---

## 🔧 Services

### Email Service
- **Location**: `app/Services/EmailService.php`
- **Features**: Send emails with database-driven SMTP configuration
- **Templates**: Blade templates in `resources/views/emails/`

### PDF Export Service
- **Location**: `app/Services/PdfExportService.php`
- **Features**: Generate PDF documents
- **Templates**: Blade templates in `resources/views/pdfs/`
- **Design**: Pure black and white design

### File Storage Service
- **Location**: Custom handler in `public/index.php`
- **Features**: Serve files directly without symlink (works on shared hosting)
- **Storage Paths**: 
  - Avatars: `storage/app/public/avatars/`
  - Logos: `storage/app/public/logos/`
  - Food Items: `storage/app/public/food-items/`
- **URL**: `/admin/api/storage/{path}`

---

## ⚠️ Important Notes

### Permission System
- **Standard Permissions**: Pattern `{action}_{resource}` (e.g., `view_user`, `create_branch`)
- **Special Permissions**: Start with `special_` prefix (e.g., `special_export_data`)
- Admin role has all permissions automatically

### Database Best Practices
- ✅ Always eager load relationships to avoid N+1 queries
- ✅ Add indexes on foreign keys and frequently queried columns
- ✅ Use database transactions for multi-step operations
- ✅ Convert empty strings to null for nullable fields
- ❌ Don't create N+1 queries
- ❌ Don't skip indexes on foreign keys
- ❌ Don't calculate totals in application - use database calculations

### API Response Format
- All responses use camelCase
- Pagination metadata in `meta` object
- Error messages should be user-friendly

### File Uploads
- Validation: JPEG, PNG, WebP, max 2MB
- Automatic old file cleanup on upload
- Custom storage handler serves files directly

---

**Last Updated**: January 2025  
**Version**: 1.9.0
