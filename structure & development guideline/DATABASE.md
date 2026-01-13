# Database Documentation

## Overview
This document provides a comprehensive overview of the Hotel Management App database schema, including all tables, relationships, indexes, and data types.

**Database Engine:** MySQL  
**Character Set:** utf8mb4  
**Collation:** utf8mb4_unicode_ci

---

## Table of Contents
1. [Core Tables](#core-tables)
2. [Authentication & Authorization](#authentication--authorization)
3. [Business Entities](#business-entities)
4. [System Tables](#system-tables)
5. [Relationships](#relationships)
6. [Indexes](#indexes)
7. [Data Integrity](#data-integrity)
8. [Notes & Recommendations](#notes--recommendations)

## ⚠️ Removed Tables

The following tables have been removed as part of the system cleanup:
- `customers` - Customer management (removed)
- `packages` - Package management (removed)
- `package_types` - Package type management (removed)
- `orders` - Order management (removed)
- `order_items` - Order items (removed)
- `payments` - Payment transactions (removed)

---

## Core Tables

### 1. `users`
User accounts for system administrators and staff.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `first_name` | varchar(255) | NOT NULL | User's first name |
| `last_name` | varchar(255) | NOT NULL | User's last name |
| `email` | varchar(255) | UNIQUE, NOT NULL | Email address (login) |
| `email_verified_at` | timestamp | NULLABLE | Email verification timestamp |
| `password` | varchar(255) | NOT NULL | Hashed password |
| `phone` | varchar(255) | NULLABLE | Phone number |
| `status` | varchar(255) | NULLABLE | User status |
| `address` | text | NULLABLE | Full address |
| `city` | varchar(255) | NULLABLE | City |
| `state` | varchar(100) | NULLABLE | State/Province (added via migration) |
| `zip_code` | varchar(20) | NULLABLE | ZIP/Postal code (added via migration) |
| `country` | varchar(255) | NULLABLE | Country |
| `bio` | text | NULLABLE | Biography |
| `avatar` | varchar(255) | NULLABLE | Avatar file path (added via migration) |
| `date_of_birth` | date | NULLABLE | Date of birth (added via migration) |
| `gender` | varchar(20) | NULLABLE | Gender (added via migration) |
| `remember_token` | varchar(100) | NULLABLE | Remember me token |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`email`)

**Notes:**
- No soft deletes implemented
- Status field is a string (consider using enum)
- Avatar stored as file path (should use storage system)

---

### 2. `branches`
Branch/location information for multi-location photo studios.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `branch_code` | varchar(255) | UNIQUE, NOT NULL | Branch code (e.g., BR001) |
| `branch_name` | varchar(255) | NOT NULL | Branch name |
| `email` | varchar(255) | NULLABLE | Branch email |
| `contact_number` | varchar(50) | NULLABLE | Contact phone number |
| `address` | varchar(255) | NOT NULL | Street address |
| `city` | varchar(255) | NULLABLE | City |
| `state` | varchar(255) | NULLABLE | State/Province |
| `country` | varchar(255) | NULLABLE | Country |
| `postal_code` | varchar(20) | NULLABLE | Postal/ZIP code |
| `status` | enum | DEFAULT 'active' | Status: 'active', 'inactive' |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |
| `deleted_at` | timestamp | NULLABLE | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`branch_code`)

**Soft Deletes:** Yes

---

### 3. `financial_categories`
Financial categories for income and expense transactions.
- INDEX (`customer_id`)
- INDEX (`branch_id`)
- INDEX (`payment_date`)
- INDEX (`payment_type`)
- INDEX (`created_at`)

**Soft Deletes:** Yes

**Notes:**
- `payment_type` 'credit' = payment received, 'debit' = refund
- Payment number should be auto-generated
- Order's `paid_amount` should be recalculated when payments are added/updated/deleted

---

### 8. `financial_categories`
Financial categories for income and expense transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `type` | enum | NOT NULL | Category type: 'income', 'expense' |
| `name` | varchar(255) | NOT NULL | Category name |
| `description` | text | NULLABLE | Category description |
| `status` | enum | DEFAULT 'active' | Status: 'active', 'inactive' |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |
| `deleted_at` | timestamp | NULLABLE | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`type`, `name`)
- INDEX (`type`)
- INDEX (`status`)
- INDEX (`created_at`)

**Soft Deletes:** Yes

**Notes:**
- Unique constraint on `(type, name)` ensures no duplicate category names per type
- Categories cannot be deleted if they have associated transactions

---

### 9. `financial_transactions`
Financial transactions for income and expenses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `transaction_number` | varchar(255) | UNIQUE, NOT NULL | Transaction number (e.g., #INC001, #EXP001) |
| `transaction_type` | enum | NOT NULL | Transaction type: 'income', 'expense' |
| `transaction_date` | date | NOT NULL | Transaction date |
| `category_id` | bigint unsigned | FOREIGN KEY, NOT NULL | Category reference |
| `amount` | decimal(12,2) | NOT NULL | Transaction amount |
| `description` | text | NULLABLE | Transaction description/notes |
| `created_by` | bigint unsigned | FOREIGN KEY, NULLABLE | User who created the transaction |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |
| `deleted_at` | timestamp | NULLABLE | Soft delete timestamp |

**Foreign Keys:**
- `category_id` → `financial_categories.id` (ON DELETE RESTRICT)
- `created_by` → `users.id` (ON DELETE SET NULL)

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`transaction_number`)
- INDEX (`transaction_type`)
- INDEX (`transaction_date`)
- INDEX (`category_id`)
- INDEX (`created_by`)
- INDEX (`created_at`)

**Soft Deletes:** Yes

**Notes:**
- Transaction number is auto-generated (e.g., #INC001 for income, #EXP001 for expense)
- Transaction type cannot be changed after creation
- Category must match transaction type (income category for income transaction, expense category for expense transaction)

---

## Authentication & Authorization

### 10. `roles`
User roles for access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `name` | varchar(255) | UNIQUE, NOT NULL | Role name (e.g., 'admin', 'manager') |
| `description` | text | NULLABLE | Role description |
| `is_active` | boolean | DEFAULT true | Active status |
| `is_deleted` | boolean | DEFAULT false | Soft delete flag |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`name`)

**Notes:**
- Uses boolean flags for soft delete instead of `deleted_at` timestamp
- Consider migrating to standard Laravel soft deletes

---

### 11. `permissions`
System permissions for role-based access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `name` | varchar(255) | UNIQUE, NOT NULL | Permission name (e.g., 'view_orders') |
| `description` | text | NULLABLE | Permission description |
| `module` | varchar(255) | NULLABLE | Module name (e.g., 'orders') |
| `submodule` | varchar(255) | NULLABLE | Submodule name |
| `type` | varchar(255) | NULLABLE | Permission type (e.g., 'read', 'write') |
| `is_active` | boolean | DEFAULT true | Active status |
| `is_deleted` | boolean | DEFAULT false | Soft delete flag |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`name`)

**Notes:**
- Uses boolean flags for soft delete instead of `deleted_at` timestamp
- Module/submodule structure allows hierarchical permission organization

**Permission Types:**
- `read` - View/read operations
- `write` - Create/edit operations
- `delete` - Delete operations
- `special` - Special permissions (export, import, bulk operations, etc.)

**Special Permissions:**
All special permissions use the `special_` prefix and are grouped under:
- Module: `special`
- Submodule: `special`
- Type: `special`

Available special permissions:
- `special_export_data` - Export data to Excel/PDF
- `special_import_data` - Import data from Excel/CSV
- `special_bulk_delete` - Bulk delete operations
- `special_bulk_update` - Bulk update operations
- `special_view_audit_logs` - View audit logs and activity history
- `special_manage_backups` - Manage database backups
- `special_system_maintenance` - Access system maintenance mode
- `special_view_all_branches` - View all branches regardless of assignment
- `special_override_restrictions` - Override business rules and restrictions

---

### 12. `user_role`
Pivot table for user-role many-to-many relationship.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `user_id` | bigint unsigned | FOREIGN KEY, NOT NULL | User reference |
| `role_id` | bigint unsigned | FOREIGN KEY, NOT NULL | Role reference |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `role_id` → `roles.id` (ON DELETE CASCADE)

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`user_id`, `role_id`)

---

### 13. `role_permission`
Pivot table for role-permission many-to-many relationship.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `role_id` | bigint unsigned | FOREIGN KEY, NOT NULL | Role reference |
| `permission_id` | bigint unsigned | FOREIGN KEY, NOT NULL | Permission reference |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |

**Foreign Keys:**
- `role_id` → `roles.id` (ON DELETE CASCADE)
- `permission_id` → `permissions.id` (ON DELETE CASCADE)

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`role_id`, `permission_id`)

---

## System Tables

### 14. `settings`
System configuration settings (key-value store).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `key` | varchar(255) | NOT NULL | Setting key |
| `value` | text | NULLABLE | Setting value |
| `group` | varchar(255) | DEFAULT 'general' | Setting group |
| `description` | text | NULLABLE | Setting description |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`key`, `group`)
- INDEX (`group`, `key`)

**Common Settings:**
- Email settings: `smtp_host`, `smtp_port`, `smtp_username`, `smtp_password`, `from_address`, `from_name`
- Business Information: `business_email`, `business_phone`, `business_website`
- App Settings: `web_url`
- **Restaurant Settings** (group: 'GST Settings'): `cgst_percentage`, `sgst_percentage`, `service_tax_percentage`, `round_number_enabled`
- **Restaurant Settings** (group: 'Invoice Settings'): `invoice_prefix`, `invoice_business_name`, `invoice_business_address`, `invoice_contact_phone`, `invoice_contact_email`, `invoice_footer_text`, `invoice_other_text`
- **Restaurant Settings** (group: 'Thermal Printer'): `printer_name`, `printer_ip`, `printer_port`, `paper_width`, `enabled`

---

### 15. `emails`
Email log/audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `to_email` | varchar(255) | NOT NULL | Recipient email |
| `from_email` | varchar(255) | NOT NULL | Sender email |
| `type` | varchar(255) | NOT NULL | Email type |
| `subject` | varchar(255) | NOT NULL | Email subject |
| `body` | longtext | NOT NULL | Email body |
| `send_status` | varchar(255) | NOT NULL | Status: 'success', 'failed' |
| `response_message` | text | NULLABLE | Response/error message |
| `related_id` | bigint unsigned | NULLABLE | Related entity ID |
| `related_type` | varchar(255) | NULLABLE | Related entity type (polymorphic) |
| `sent_at` | timestamp | NULLABLE | Sent timestamp |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)

**Notes:**
- Polymorphic relationship support via `related_id` and `related_type`
- Consider adding indexes on `to_email`, `send_status`, `sent_at` for reporting

---

### 16. `password_resets`
Laravel password reset tokens (legacy table).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `email` | varchar(255) | PRIMARY KEY | Email address |
| `token` | varchar(255) | NOT NULL | Reset token |
| `created_at` | timestamp | NULLABLE | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`email`)

**Notes:**
- Legacy Laravel table (may not be used if using Sanctum)

---

### 17. `failed_jobs`
Laravel failed queue jobs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `uuid` | varchar(255) | UNIQUE, NOT NULL | Job UUID |
| `connection` | text | NOT NULL | Queue connection |
| `queue` | text | NOT NULL | Queue name |
| `payload` | longtext | NOT NULL | Job payload |
| `exception` | longtext | NOT NULL | Exception message |
| `failed_at` | timestamp | DEFAULT CURRENT_TIMESTAMP | Failure timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`uuid`)

---

### 19. `food_categories`
Food categories for restaurant menu organization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `name` | varchar(255) | UNIQUE, NOT NULL | Category name |
| `description` | text | NULLABLE | Category description |
| `display_order` | int | DEFAULT 0 | Display order for sorting |
| `status` | enum | DEFAULT 'active' | Status: 'active', 'inactive' |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |
| `deleted_at` | timestamp | NULLABLE | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`name`)
- INDEX (`status`)
- INDEX (`display_order`)
- INDEX (`created_at`)

**Soft Deletes:** Yes

**Notes:**
- Categories can be ordered using `display_order` field
- Status can be 'active' or 'inactive'

---

### 20. `food_items`
Food items/menu items for restaurant.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `food_category_id` | bigint unsigned | FOREIGN KEY, NOT NULL | Category reference |
| `name` | varchar(255) | UNIQUE, NOT NULL | Item name |
| `description` | text | NULLABLE | Item description |
| `price` | decimal(10,2) | NOT NULL | Item price |
| `is_veg` | boolean | DEFAULT true | Vegetarian flag |
| `status` | enum | DEFAULT 'active' | Status: 'active', 'inactive' |
| `image` | varchar(255) | NULLABLE | Image file path (added via migration) |
| `display_order` | int | DEFAULT 0 | Display order for sorting within category (added via migration) |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |
| `deleted_at` | timestamp | NULLABLE | Soft delete timestamp |

**Foreign Keys:**
- `food_category_id` → `food_categories.id` (ON DELETE RESTRICT)

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`name`)
- INDEX (`food_category_id`)
- INDEX (`status`)
- INDEX (`is_veg`)
- INDEX (`created_at`)

**Soft Deletes:** Yes

**Notes:**
- Each item belongs to one category
- Price stored as decimal(10,2) for precision
- **GST percentage removed** - GST/Tax calculation now handled at restaurant level (CGST, SGST, Service Tax)
- `is_veg` boolean flag for vegetarian/non-vegetarian items
- `image` field stores relative path to image file in `storage/app/public/food-items/`
- `display_order` used for custom sorting within category (default: 0)
- Images served via custom handler at `/admin/api/storage/food-items/*` (no symlink required)

---

### 21. `tables`
Restaurant tables for dine-in service management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `table_number` | varchar(50) | UNIQUE, NOT NULL | Table identifier (e.g., "T1", "T2", "Family Table") |
| `table_name` | varchar(255) | NULLABLE | Friendly name (optional, e.g., "Window Table", "VIP Table") |
| `capacity` | int | DEFAULT 4, NOT NULL | Number of seats (1-50) |
| `status` | enum | DEFAULT 'available' | Status: 'available', 'occupied', 'reserved', 'cleaning', 'maintenance' |
| `is_active` | boolean | DEFAULT true | Active/Inactive flag |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |
| `deleted_at` | timestamp | NULLABLE | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`table_number`)
- INDEX (`status`)
- INDEX (`is_active`)
- INDEX (`created_at`)

**Soft Deletes:** Yes

**Notes:**
- `table_number` must be unique (e.g., "T1", "T2", "Family-1")
- `table_name` is optional; if not provided, use `table_number` for display
- `capacity` represents maximum seats (default: 4, range: 1-50)
- `status` tracks real-time table state for POS operations:
  - `available` - Table is free and ready for customers
  - `occupied` - Table has active bill/order
  - `reserved` - Table is reserved for future booking
  - `cleaning` - Table is being cleaned
  - `maintenance` - Table is under maintenance/repair
- `is_active` controls visibility in POS panel (inactive tables are hidden)
- Multiple bills can be associated with one table (handled in bills table later)

---

### 22. `customers`
Restaurant customers (walk-in and registered).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `customer_code` | varchar(50) | UNIQUE, NULLABLE | Customer code (e.g., #CUST001, auto-generated) |
| `name` | varchar(255) | NOT NULL | Customer name |
| `mobile` | varchar(20) | NULLABLE | Mobile number (unique if provided) |
| `email` | varchar(255) | NULLABLE | Email address |
| `address` | text | NULLABLE | Full address |
| `city` | varchar(100) | NULLABLE | City |
| `state` | varchar(100) | NULLABLE | State/Province |
| `pincode` | varchar(10) | NULLABLE | PIN/ZIP code |
| `customer_type` | enum | DEFAULT 'regular' | Type: 'regular', 'credit' (Udhar) |
| `total_bills` | int | DEFAULT 0 | Total number of bills (calculated) |
| `total_amount` | decimal(12,2) | DEFAULT 0.00 | Total bill amount (calculated) |
| `paid_amount` | decimal(12,2) | DEFAULT 0.00 | Total paid amount (calculated) |
| `remaining_amount` | decimal(12,2) | DEFAULT 0.00 | Remaining balance (calculated) |
| `status` | enum | DEFAULT 'active' | Status: 'active', 'inactive' |
| `notes` | text | NULLABLE | Additional notes |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |
| `deleted_at` | timestamp | NULLABLE | Soft delete timestamp |

**Foreign Keys:** None

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`customer_code`)
- UNIQUE (`mobile`)
- INDEX (`customer_type`)
- INDEX (`status`)
- INDEX (`name`)
- INDEX (`created_at`)

**Soft Deletes:** Yes

---

### 23. `bills`
Restaurant bills/orders (main order header).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `bill_number` | varchar(50) | UNIQUE, NOT NULL | Bill number (e.g., #BILL001, auto-generated) |
| `table_id` | bigint unsigned | FOREIGN KEY, NULLABLE | Table reference (nullable for takeaway) |
| `customer_id` | bigint unsigned | FOREIGN KEY, NULLABLE | Customer reference (nullable for walk-in) |
| `bill_date` | datetime | NOT NULL | Bill date and time |
| `status` | enum | DEFAULT 'draft' | Status: 'draft', 'pending', 'paid', 'cancelled' |
| `payment_status` | enum | DEFAULT 'pending' | Payment status: 'pending', 'partial', 'paid' |
| `subtotal` | decimal(12,2) | DEFAULT 0.00 | Subtotal (sum of all items) |
| `gst_amount` | decimal(12,2) | DEFAULT 0.00 | Total GST amount |
| `discount` | decimal(12,2) | DEFAULT 0.00 | Discount amount |
| `total_amount` | decimal(12,2) | DEFAULT 0.00 | Grand total |
| `paid_amount` | decimal(12,2) | DEFAULT 0.00 | Total paid amount |
| `remaining_amount` | decimal(12,2) | DEFAULT 0.00 | Remaining balance |
| `payment_method` | enum | NULLABLE | Payment method: 'cash', 'upi', 'card', 'split' |
| `gst_calculation_method` | enum | DEFAULT 'item_wise' | GST method: 'item_wise', 'bill_wise' |
| `notes` | text | NULLABLE | Additional notes |
| `created_by` | bigint unsigned | FOREIGN KEY, NULLABLE | User who created the bill |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |
| `deleted_at` | timestamp | NULLABLE | Soft delete timestamp |

**Foreign Keys:**
- `table_id` → `tables.id` (ON DELETE SET NULL)
- `customer_id` → `customers.id` (ON DELETE SET NULL)
- `created_by` → `users.id` (ON DELETE SET NULL)

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`bill_number`)
- INDEX (`table_id`)
- INDEX (`customer_id`)
- INDEX (`status`)
- INDEX (`bill_date`)
- INDEX (`payment_status`)
- INDEX (`created_at`)

**Soft Deletes:** Yes

---

### 24. `bill_items`
Individual items in a bill (order line items).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `bill_id` | bigint unsigned | FOREIGN KEY, NOT NULL | Bill reference |
| `food_item_id` | bigint unsigned | FOREIGN KEY, NOT NULL | Food item reference |
| `item_name` | varchar(255) | NOT NULL | Item name (snapshot) |
| `quantity` | int | NOT NULL | Quantity ordered |
| `unit_price` | decimal(10,2) | NOT NULL | Unit price (snapshot) |
| `gst_amount` | decimal(10,2) | DEFAULT 0.00 | GST amount for this item (calculated from restaurant settings) |
| `total_price` | decimal(12,2) | NOT NULL | Total price (quantity × unit_price) |
| `display_order` | int | DEFAULT 0 | Display order in bill |
| `notes` | varchar(500) | NULLABLE | Item-specific notes |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |
| `deleted_at` | timestamp | NULLABLE | Soft delete timestamp |

**Foreign Keys:**
- `bill_id` → `bills.id` (ON DELETE CASCADE)
- `food_item_id` → `food_items.id` (ON DELETE RESTRICT)

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`bill_id`)
- INDEX (`food_item_id`)
- INDEX (`created_at`)

**Soft Deletes:** Yes

---

### 25. `wallet_transactions`
Customer wallet transactions (credit/debit records for payments and adjustments).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `customer_id` | bigint unsigned | FOREIGN KEY, NOT NULL | Customer reference |
| `bill_id` | bigint unsigned | FOREIGN KEY, NULLABLE | Bill reference (nullable for standalone transactions) |
| `transaction_type` | enum | NOT NULL | Type: 'credit' (payment received), 'debit' (refund/adjustment) |
| `amount` | decimal(12,2) | NOT NULL | Transaction amount |
| `payment_method` | enum | NULLABLE | Payment method: 'cash', 'upi', 'card', 'bank_transfer' |
| `transaction_date` | datetime | NOT NULL | Transaction date and time |
| `description` | text | NULLABLE | Transaction description/notes |
| `reference_number` | varchar(255) | NULLABLE | Transaction reference (receipt number, UPI ref, etc.) |
| `created_by` | bigint unsigned | FOREIGN KEY, NULLABLE | User who created the transaction |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |
| `deleted_at` | timestamp | NULLABLE | Soft delete timestamp |

**Foreign Keys:**
- `customer_id` → `customers.id` (ON DELETE RESTRICT)
- `bill_id` → `bills.id` (ON DELETE SET NULL)
- `created_by` → `users.id` (ON DELETE SET NULL)

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`customer_id`) - Customer ledger queries
- INDEX (`bill_id`) - Bill payment tracking
- INDEX (`transaction_date`) - Date range queries
- INDEX (`transaction_type`) - Filter credit/debit
- INDEX (`created_at`) - Recent transactions

**Soft Deletes:** Yes

**Notes:**
- `transaction_type`: 
  - `credit` - Payment received from customer (increases customer balance)
  - `debit` - Refund or adjustment given to customer (decreases customer balance)
- `bill_id` is nullable to support standalone wallet transactions (adjustments, manual entries)
- Used to calculate customer balances: `remaining_amount` = SUM(credits) - SUM(debits) from bills
- Complete audit trail of all customer payment transactions
- Supports partial payments (multiple transactions per bill)

---

### 26. `personal_access_tokens`
Laravel Sanctum authentication tokens.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint unsigned | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `tokenable_type` | varchar(255) | NOT NULL | Tokenable model type |
| `tokenable_id` | bigint unsigned | NOT NULL | Tokenable model ID |
| `name` | varchar(255) | NOT NULL | Token name |
| `token` | varchar(64) | UNIQUE, NOT NULL | Hashed token |
| `abilities` | text | NULLABLE | Token abilities |
| `last_used_at` | timestamp | NULLABLE | Last used timestamp |
| `expires_at` | timestamp | NULLABLE | Expiration timestamp |
| `created_at` | timestamp | NULLABLE | Creation timestamp |
| `updated_at` | timestamp | NULLABLE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`token`)
- INDEX (`tokenable_type`, `tokenable_id`)

---

## Relationships

### Entity Relationship Diagram (Text)

```
users
  ├── user_role (many-to-many)
  │     └── roles
  │           └── role_permission (many-to-many)
  │                 └── permissions

branches
  └── (relationships removed - customers, orders, payments tables deleted)

financial_categories
  └── financial_transactions (one-to-many)

users
  └── financial_transactions (one-to-many, created_by)

food_categories
  └── food_items (one-to-many)

tables
  └── bills (one-to-many)

customers
  ├── bills (one-to-many)
  └── wallet_transactions (one-to-many)

bills
  ├── bill_items (one-to-many)
  └── wallet_transactions (one-to-many)

food_items
  └── bill_items (one-to-many)
```

### Detailed Relationships

1. **User ↔ Role** (Many-to-Many)
   - Table: `user_role`
   - A user can have multiple roles
   - A role can be assigned to multiple users

2. **Role ↔ Permission** (Many-to-Many)
   - Table: `role_permission`
   - A role can have multiple permissions
   - A permission can be assigned to multiple roles

3. **FinancialCategory ↔ FinancialTransaction** (One-to-Many)
    - A category can have many transactions
    - A transaction belongs to one category

4. **User ↔ FinancialTransaction** (One-to-Many)
    - A user can create many transactions
    - A transaction is created by one user (nullable)

5. **FoodCategory ↔ FoodItem** (One-to-Many)
    - A category can have many food items
    - A food item belongs to one category

6. **Table ↔ Bill** (One-to-Many)
    - A table can have many bills (multiple bills per table support)
    - A bill belongs to one table (nullable for takeaway orders)

7. **Customer ↔ Bill** (One-to-Many)
    - A customer can have many bills
    - A bill belongs to one customer (nullable for walk-in customers)

8. **Bill ↔ BillItem** (One-to-Many)
    - A bill can have many bill items
    - A bill item belongs to one bill

9. **FoodItem ↔ BillItem** (One-to-Many)
    - A food item can be in many bill items
    - A bill item references one food item

10. **User ↔ Bill** (One-to-Many)
    - A user can create many bills
    - A bill is created by one user (nullable)

11. **Customer ↔ WalletTransaction** (One-to-Many)
    - A customer can have many wallet transactions
    - A wallet transaction belongs to one customer

12. **Bill ↔ WalletTransaction** (One-to-Many)
    - A bill can have many wallet transactions (multiple payments)
    - A wallet transaction can be linked to one bill (nullable for standalone transactions)

13. **User ↔ WalletTransaction** (One-to-Many)
    - A user can create many wallet transactions
    - A wallet transaction is created by one user (nullable)

---

## Indexes

### Performance Indexes

**High-Usage Indexes:**
- `orders.customer_id` - Frequently queried for customer order history
- `orders.status` - Filtered by order status
- `orders.payment_status` - Filtered by payment status
- `payments.order_id` - Used to calculate order payment totals
- `payments.customer_id` - Customer payment history
- `order_items.order_id` - Order item retrieval
- `customers.branch_id` - Branch customer lists
- `tables.status` - Frequently queried in POS panel for available/occupied tables
- `tables.is_active` - Filtered to show only active tables in POS panel

**Missing Indexes (Recommendations):**
- `payments.payment_date` - Already indexed ✓
- `orders.order_date` - Already indexed ✓
- `customers.email` - Already indexed ✓
- `customers.phone` - Already indexed ✓

### Bills & Bill Items Indexes (Critical for Performance)

**For `bills` table:**
- `INDEX idx_table_id (table_id)` - **CRITICAL**: Most queries filter by table
- `INDEX idx_customer_id (customer_id)` - Customer bill history
- `INDEX idx_status (status)` - Filter active/pending/paid bills
- `INDEX idx_bill_date (bill_date)` - Date range queries, reports
- `INDEX idx_payment_status (payment_status)` - Payment filtering
- `INDEX idx_created_at (created_at)` - Recent bills, sorting

**For `bill_items` table:**
- `INDEX idx_bill_id (bill_id)` - **CRITICAL**: Fetching items for a bill (most important!)
- `INDEX idx_food_item_id (food_item_id)` - Popular items reports, item history
- `INDEX idx_created_at (created_at)` - Date range queries, reports

**Why These Indexes Matter:**
- Without `idx_bill_id` on `bill_items`, fetching items for a bill becomes slow as data grows
- Without `idx_table_id` on `bills`, POS panel table queries become slow
- These indexes ensure sub-10ms queries even with millions of records

---

## Data Integrity

### Foreign Key Constraints

| Table | Column | References | On Delete | Notes |
|-------|--------|------------|-----------|-------|
| `customers` | `branch_id` | `branches.id` | SET NULL | Branch deletion doesn't delete customers |
| `orders` | `customer_id` | `customers.id` | RESTRICT | Cannot delete customer with orders |
| `orders` | `branch_id` | `branches.id` | SET NULL | Branch deletion doesn't delete orders |
| `order_items` | `order_id` | `orders.id` | CASCADE | Order deletion removes items |
| `order_items` | `package_id` | `packages.id` | RESTRICT | Cannot delete package in use |
| `payments` | `order_id` | `orders.id` | RESTRICT | Cannot delete order with payments |
| `payments` | `customer_id` | `customers.id` | RESTRICT | Cannot delete customer with payments |
| `payments` | `branch_id` | `branches.id` | SET NULL | Branch deletion doesn't delete payments |
| `financial_transactions` | `category_id` | `financial_categories.id` | RESTRICT | Cannot delete category with transactions |
| `financial_transactions` | `created_by` | `users.id` | SET NULL | User deletion doesn't delete transactions |
| `food_items` | `food_category_id` | `food_categories.id` | RESTRICT | Cannot delete category with items |
| `bills` | `table_id` | `tables.id` | SET NULL | Table deletion doesn't delete bills |
| `bills` | `customer_id` | `customers.id` | SET NULL | Customer deletion doesn't delete bills |
| `bills` | `created_by` | `users.id` | SET NULL | User deletion doesn't delete bills |
| `bill_items` | `bill_id` | `bills.id` | CASCADE | Bill deletion removes items |
| `bill_items` | `food_item_id` | `food_items.id` | RESTRICT | Cannot delete food item if used in bills |
| `wallet_transactions` | `customer_id` | `customers.id` | RESTRICT | Cannot delete customer with transactions |
| `wallet_transactions` | `bill_id` | `bills.id` | SET NULL | Bill deletion doesn't delete transactions |
| `wallet_transactions` | `created_by` | `users.id` | SET NULL | User deletion doesn't delete transactions |
| `user_role` | `user_id` | `users.id` | CASCADE | User deletion removes role assignments |
| `user_role` | `role_id` | `roles.id` | CASCADE | Role deletion removes user assignments |
| `role_permission` | `role_id` | `roles.id` | CASCADE | Role deletion removes permissions |
| `role_permission` | `permission_id` | `permissions.id` | CASCADE | Permission deletion removes role assignments |

### Calculated Fields

**Fields that should be auto-calculated:**

1. **`orders.remaining_amount`**
   - Formula: `total_amount - paid_amount`
   - Should be updated when `paid_amount` changes

2. **`orders.subtotal`**
   - Formula: `SUM(order_items.total_price)`
   - Should be updated when order items change

3. **`orders.total_amount`**
   - Formula: `subtotal - discount`
   - Should be updated when `subtotal` or `discount` changes

4. **`orders.payment_status`**
   - Logic:
     - `paid` if `remaining_amount <= 0`
     - `partial` if `paid_amount > 0` and `remaining_amount > 0`
     - `pending` if `paid_amount = 0`

5. **`order_items.total_price`**
   - Formula: `quantity × unit_price`
   - Should be auto-calculated on save

6. **`customers.total_orders`**
   - Formula: `COUNT(orders WHERE customer_id = customer.id)`
   - Should be recalculated when orders are created/deleted

7. **`customers.total_amount`**
   - Formula: `SUM(orders.total_amount WHERE customer_id = customer.id)`
   - Should be recalculated when orders change

8. **`customers.paid_amount`**
   - Formula: `SUM(payments.amount WHERE customer_id = customer.id AND payment_type = 'credit') - SUM(payments.amount WHERE customer_id = customer.id AND payment_type = 'debit')`
   - Should be recalculated when payments change

9. **`customers.remaining_amount`**
   - Formula: `total_amount - paid_amount`
   - Should be recalculated when `total_amount` or `paid_amount` changes

---

## Notes & Recommendations

### Issues Identified

1. **Inconsistent Soft Delete Implementation**
   - `roles` and `permissions` use boolean flags (`is_deleted`) instead of `deleted_at` timestamp
   - **Recommendation:** Migrate to standard Laravel soft deletes for consistency

2. **Missing Auto-Generation**
   - `customer_code`, `order_number`, `payment_number` should be auto-generated
   - **Recommendation:** Implement model observers or mutators

3. **Status Field Types**
   - `users.status` is a string instead of enum
   - **Recommendation:** Convert to enum for data integrity

4. **Missing Indexes**
   - `emails` table lacks indexes on frequently queried fields
   - **Recommendation:** Add indexes on `to_email`, `send_status`, `sent_at`

5. **Avatar Storage**
   - Avatar fields store file paths as strings
   - **Recommendation:** Use Laravel Storage facade and store relative paths

6. **Calculated Fields**
   - Some calculated fields may become out of sync
   - **Recommendation:** Use model events/observers to maintain consistency

7. **Payment Calculation**
   - `orders.paid_amount` should be calculated from `payments` table
   - **Recommendation:** Remove `paid_amount` from orders or ensure it's always synced

8. **Missing Relationships**
   - No direct relationship between `users` and `branches`
   - **Recommendation:** Add `branch_id` to `users` table if users are branch-specific

9. **Email Table**
   - `emails.related_type` and `related_id` suggest polymorphic relationship but not fully implemented
   - **Recommendation:** Use Laravel's morphTo/morphMany relationships

10. **Package Type Enum**
    - Limited to 4 types: 'Album', 'PhotoShoot', 'Editing', 'Video'
    - **Recommendation:** Consider making this more flexible or add a `package_categories` table

### Best Practices Recommendations

1. **Add Timestamps to All Tables**
   - All tables have `created_at` and `updated_at` ✓

2. **Use Soft Deletes Consistently**
   - Most tables use soft deletes ✓
   - Fix `roles` and `permissions` to use standard soft deletes

3. **Add Database Constraints**
   - Foreign keys are properly defined ✓
   - Consider adding CHECK constraints for enum-like validations

4. **Normalization**
   - Database is well-normalized ✓
   - Consider extracting payment methods to a separate table if they grow

5. **Audit Trail**
   - Consider adding `created_by` and `updated_by` fields to track user changes

6. **Data Validation**
   - Add database-level validation for critical fields
   - Use CHECK constraints for amount validations (e.g., `amount >= 0`)

---

## 📊 Database Scalability & Performance Optimization

### Growth Projections

**Restaurant Bills & Items Growth:**
- **Daily**: 50 orders × 10 items = 500 `bill_items` records
- **Monthly**: 15,000 `bill_items` records
- **Yearly**: 180,000 `bill_items` records
- **5 Years**: ~900,000 `bill_items` records + ~90,000 `bills` records

**Storage Estimate:**
- `bill_items`: ~150-200 bytes per row → 900K rows = ~135-180 MB
- `bills`: ~300-400 bytes per row → 90K rows = ~27-36 MB
- **Total**: ~200-250 MB (very manageable for MySQL)

### Performance Optimization Strategies

#### 1. **Proper Indexing (CRITICAL)**
Always create indexes on foreign keys and frequently queried columns:

```sql
-- bills table indexes (MUST HAVE)
CREATE INDEX idx_table_id ON bills(table_id);
CREATE INDEX idx_customer_id ON bills(customer_id);
CREATE INDEX idx_status ON bills(status);
CREATE INDEX idx_bill_date ON bills(bill_date);
CREATE INDEX idx_payment_status ON bills(payment_status);

-- bill_items table indexes (MUST HAVE)
CREATE INDEX idx_bill_id ON bill_items(bill_id);  -- Most critical!
CREATE INDEX idx_food_item_id ON bill_items(food_item_id);
CREATE INDEX idx_created_at ON bill_items(created_at);
```

**Impact:** Queries remain fast (< 10ms) even with millions of records.

#### 2. **Table Partitioning (Future Optimization)**
For high-growth scenarios (200+ orders/day), consider partitioning by year:

```sql
-- Partition bills by year (if needed after 2-3 years)
ALTER TABLE bills PARTITION BY RANGE (YEAR(bill_date)) (
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p2027 VALUES LESS THAN (2028)
);
```

**Benefits:**
- Faster queries (only relevant partitions scanned)
- Easier archiving of old data
- Better maintenance and backup strategies

#### 3. **Data Archiving Strategy**
After 2-3 years, archive old bills to separate tables:

**Phase 1 (0-2 years):** Keep all data in main tables
**Phase 2 (2-3 years):** Monitor growth, plan archiving
**Phase 3 (3+ years):** Move old data (>2 years) to archive tables:
- `bills_archive` - Archived bills
- `bill_items_archive` - Archived bill items
- Keep only recent data in main tables for performance

#### 4. **Soft Deletes Consideration**
- **Draft Bills**: Hard delete cancelled drafts immediately (no need to keep)
- **Paid Bills**: Soft delete for audit trail (can archive later)
- **Alternative**: Separate `deleted_bills` table for audit without affecting main queries

### Query Performance Expectations

With proper indexes, expect these query times:

| Query Type | Expected Time | Notes |
|------------|---------------|-------|
| Get bill with items | < 1ms | With `idx_bill_id` on `bill_items` |
| Today's bills | < 10ms | With `idx_bill_date` |
| Customer's all bills | < 50ms | With `idx_customer_id` |
| Sales report (30 days) | < 100ms | With `idx_bill_date` |
| Popular items report | < 200ms | With `idx_food_item_id` and `idx_created_at` |

### Implementation Checklist

**During Migration Creation:**
- ✅ Add all required indexes in migration file
- ✅ Use proper data types (decimal for amounts, not float)
- ✅ Add foreign key constraints with proper ON DELETE actions
- ✅ Consider composite indexes for common query patterns

**During Backend Implementation:**
- ✅ Always eager load relationships (`with('items')`) to avoid N+1 queries
- ✅ Use database transactions for bill creation/updates
- ✅ Recalculate totals in database (not in application) when possible
- ✅ Use database-level calculations for reports (SUM, COUNT, GROUP BY)

**Monitoring:**
- ✅ Monitor query performance monthly
- ✅ Check slow query log for unoptimized queries
- ✅ Review index usage statistics
- ✅ Plan partitioning/archiving when approaching 1M+ records

### Real-World Scalability

**MySQL Capabilities:**
- ✅ Can easily handle 900K records in a single table
- ✅ With proper indexes, queries remain fast
- ✅ Partitioning available for 10M+ records
- ✅ Archiving strategy extends capacity indefinitely

**Comparison:**
- 1 Photo (JPEG): 2-5 MB = 10,000+ bill_items records
- 5 Years of bill_items: ~200 MB = **Tiny!**

**Conclusion:** The projected growth (900K records in 5 years) is **very manageable** for MySQL with proper indexing. Focus on:
1. ✅ Creating proper indexes from the start
2. ✅ Monitoring growth monthly
3. ✅ Planning archiving strategy after 2 years
4. ✅ Considering partitioning if growth exceeds 200 orders/day

---

## Migration History

### Core Tables (2024-01-01)
- `users` (2014_10_12_000000)
- `roles` (2024_01_01_000001)
- `permissions` (2024_01_01_000002)
- `user_role` (2024_01_01_000003)
- `role_permission` (2024_01_01_000004)
- `settings` (2024_01_01_000005)
- `emails` (2024_01_01_000006)

### Business Tables (2025-11-11 to 2025-11-15)
- `branches` (2025_11_11_000000)
- `packages` (2025_11_13_063625)
- `customers` (2025_11_13_071304)
- `orders` (2025_11_13_071741)
- `order_items` (2025_11_13_071758)
- `payments` (2025_11_13_090017)

### User Enhancements (2025-11-12)
- `add_avatar_to_users_table` (2025_11_12_063109)
- `add_date_of_birth_and_gender_to_users_table` (2025_11_12_072235)
- `add_state_and_zip_code_to_users_table` (2025_11_12_073318)

### Order Enhancements (2025-11-15)
- `add_remaining_amount_to_orders_table` (2025_11_15_090237)
- `remove_balance_amount_from_orders_table` (2025_11_15_090423)

### Order Links Feature (2025-12-17)
- `add_links_to_orders_table` (2025_12_17_144453) - Adds JSON `links` column for storing important links array

### Settings Enhancements (2025-11-15)
- `add_business_contact_to_settings` (2025_11_15_094629)
- `add_business_website_to_settings` (2025_11_15_095341)

### Financial Management (2025-12-18)
- `create_financial_categories_table` (2025_12_18_073853) - Creates financial categories table for income/expense categories
- `create_financial_transactions_table` (2025_12_18_073853) - Creates financial transactions table for income/expense tracking

### Restaurant Management (2025-01-20)
- `create_food_categories_table` (2025_01_20_000001) - Creates food categories table for restaurant menu organization
- `create_food_items_table` (2025_01_20_000002) - Creates food items table for restaurant menu items
- `add_image_and_display_order_to_food_items_table` (2026_01_06_130603) - Adds `image` (varchar, nullable) and `display_order` (int, default 0) columns to food_items table
- `create_tables_table` (2025_01_21_000001) - Creates tables table for restaurant table management (table_number, table_name, capacity, status, is_active)

### Bills & Customers Management (2025-01-22)
- `create_customers_table` (2025_01_22_000001) - Creates customers table for restaurant customer management (walk-in and registered customers, credit support with balance tracking)
- `create_bills_table` (2025_01_22_000002) - Creates bills table for restaurant orders/bills (with table_id, customer_id, payment tracking - payments stored directly in bills table)
- `create_bill_items_table` (2025_01_22_000003) - Creates bill_items table for individual items in bills (with snapshot pricing for historical accuracy)
- `create_wallet_transactions_table` (2025_01_22_000004) - Creates wallet_transactions table for customer wallet transactions (credit/debit records for payments, refunds, and adjustments)

---

## Summary Statistics

- **Total Tables:** 26
- **Core Business Tables:** 16 (users, branches, customers, bills, bill_items, wallet_transactions, financial_categories, financial_transactions, food_categories, food_items, tables)
- **Auth/Authorization Tables:** 4 (roles, permissions, user_role, role_permission)
- **System Tables:** 6 (settings, emails, password_resets, failed_jobs, personal_access_tokens)
- **Tables with Soft Deletes:** 13 (branches, customers, bills, bill_items, wallet_transactions, financial_categories, financial_transactions, food_categories, food_items, tables)
- **Tables with Foreign Keys:** 19
- **Pivot Tables:** 2 (user_role, role_permission)

---

*Last Updated: January 2025*  
*Database Version: 1.5* (Bills & Customers Tables Added)

