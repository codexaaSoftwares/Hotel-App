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

### 18. `personal_access_tokens`
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

**Missing Indexes (Recommendations):**
- `payments.payment_date` - Already indexed ✓
- `orders.order_date` - Already indexed ✓
- `customers.email` - Already indexed ✓
- `customers.phone` - Already indexed ✓

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

---

## Summary Statistics

- **Total Tables:** 18
- **Core Business Tables:** 9 (users, branches, customers, packages, orders, order_items, payments, financial_categories, financial_transactions)
- **Auth/Authorization Tables:** 4 (roles, permissions, user_role, role_permission)
- **System Tables:** 5 (settings, emails, password_resets, failed_jobs, personal_access_tokens)
- **Tables with Soft Deletes:** 7 (branches, customers, packages, orders, payments, financial_categories, financial_transactions)
- **Tables with Foreign Keys:** 12
- **Pivot Tables:** 2 (user_role, role_permission)

---

*Last Updated: December 2025*  
*Database Version: 1.1*

