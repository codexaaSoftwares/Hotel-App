# Database Documentation

## Overview
This document provides an overview of the Hotel Management App database schema, including tables, relationships, and important notes.

**Database Engine:** MySQL  
**Character Set:** utf8mb4  
**Collation:** utf8mb4_unicode_ci

**Multi-Module Architecture:**
- Database supports multiple business modules: Restaurant, Hotel Room, Banquet Hall
- Common tables (customers, staff, expenses, users, settings) are shared across all modules
- Module-specific tables are organized by module (e.g., `food_categories`, `rooms`, `bookings`)

---

## Table of Contents
1. [Core Tables](#core-tables)
2. [Restaurant Management Tables](#restaurant-management-tables)
3. [Relationships](#relationships)
4. [Important Notes](#important-notes)

---

## Core Tables

### `users`
User accounts for system administrators and staff.

**Key Columns:**
- `id`, `first_name`, `last_name`, `email` (UNIQUE), `password`
- `phone`, `status`, `address`, `city`, `state`, `zip_code`
- `avatar`, `date_of_birth`, `gender`
- `created_at`, `updated_at`

**Indexes:** PRIMARY KEY (`id`), UNIQUE (`email`)

---

### `roles`
User roles for access control.

**Key Columns:**
- `id`, `name` (UNIQUE), `description`, `is_active`
- `created_at`, `updated_at`, `deleted_at`

**Soft Deletes:** Yes

---

### `permissions`
System permissions organized by module and submodule.

**Key Columns:**
- `id`, `name` (UNIQUE), `description`
- `module` (Restaurant, Hotel Room, Banquet Hall, Common)
- `submodule` (e.g., Dashboard, Bills, Rooms, Bookings)
- `type` (standard, special)
- `created_at`, `updated_at`

---

### `user_role`
Pivot table for user-role relationships.

**Key Columns:**
- `user_id` (FK → users.id)
- `role_id` (FK → roles.id)

---

### `role_permission`
Pivot table for role-permission relationships.

**Key Columns:**
- `role_id` (FK → roles.id)
- `permission_id` (FK → permissions.id)

---

### `branches`
Branch/location information.

**Key Columns:**
- `id`, `branch_code` (UNIQUE), `branch_name`
- `email`, `contact_number`, `address`, `city`, `state`, `country`, `postal_code`
- `status` (enum: 'active', 'inactive')
- `created_at`, `updated_at`, `deleted_at`

**Soft Deletes:** Yes

---

### `settings`
System settings (email, business info, app settings, restaurant settings).

**Key Columns:**
- `id`, `key` (UNIQUE), `value`, `group`, `type`
- `created_at`, `updated_at`

**Groups:**
- `'Email Settings'` - SMTP configuration
- `'App Settings'` - Web URL, currency, regional
- `'Business Information'` - Business name, logo, address
- `'Invoice Settings'` - Invoice configuration
- `'GST Settings'` - GST configuration
- `'Thermal Printer'` - Printer settings

---

### `customers`
Customer accounts (unified system for all modules).

**Key Columns:**
- `id`, `customer_code` (UNIQUE, auto-generated: #CUST001)
- `name`, `mobile`, `email`, `address`, `city`, `state`, `pincode`
- `customer_type` (enum: 'regular', 'credit')
- `status` (enum: 'active', 'inactive'), `notes`
- `created_at`, `updated_at`, `deleted_at`

**Soft Deletes:** Yes

**Note:** Unified customer system - serves Restaurant, Hotel Room, and Banquet Hall modules.

**Relationships:**
- Has many `bills` (restaurant bills)
- Has many `wallet_transactions`
- Will have many `bookings` (hotel room and banquet hall bookings)

---

### `staff`
Staff members.

**Key Columns:**
- `id`, `name`, `mobile`, `department` (text)
- `salary_type` (enum: 'monthly', 'other'), `salary_amount`
- `joining_date`, `address` (text), `document_info` (text)
- `status` (enum: 'active', 'inactive')
- `created_at`, `updated_at`, `deleted_at`

**Soft Deletes:** Yes

**Relationships:**
- Has many `salary_payments`

---

### `salary_payments`
Salary payment records.

**Key Columns:**
- `id`, `staff_id` (FK → staff.id)
- `paid_amount`, `payment_date`, `payment_method`
- `reference_number`, `notes` (text)
- `month`, `year`, `created_by` (FK → users.id)
- `created_at`, `updated_at`, `deleted_at`

**Soft Deletes:** Yes

---

### `bills`
Bill records (restaurant orders).

**Key Columns:**
- `id`, `bill_number` (nullable, auto-generated: #BILL{ID})
- `table_id` (FK → tables.id, nullable)
- `customer_id` (FK → customers.id, nullable)
- `bill_date`, `status` (enum: 'draft', 'pending', 'paid')
- `payment_status` (enum: 'pending', 'partial', 'paid')
- `payment_method` (enum: 'cash', 'upi', 'card', 'wallet', nullable)
- `subtotal`, `discount`, `cgst_amount`, `sgst_amount`, `service_tax_amount`
- `rounding`, `total_amount`
- `created_by` (FK → users.id, nullable)
- `created_at`, `updated_at`, `deleted_at`

**Soft Deletes:** Yes

**Relationships:**
- Belongs to `tables`
- Belongs to `customers`
- Has many `bill_items`
- Has one `wallet_transactions` (for wallet payments)

**Critical Indexes:**
- `table_id`, `customer_id`, `status`, `bill_date`, `payment_status`, `created_at`

---

### `bill_items`
Bill items (food items in a bill).

**Key Columns:**
- `id`, `bill_id` (FK → bills.id)
- `food_item_id` (FK → food_items.id)
- `quantity`, `unit_price`, `total_price`
- `created_at`, `updated_at`

**Relationships:**
- Belongs to `bills`
- Belongs to `food_items`

**Critical Indexes:**
- `bill_id` (MOST IMPORTANT), `food_item_id`, `created_at`

---

### `wallet_transactions`
Customer wallet transactions (credits/debits).

**Key Columns:**
- `id`, `customer_id` (FK → customers.id)
- `bill_id` (FK → bills.id, nullable)
- `transaction_type` (enum: 'credit', 'debit')
- `amount`, `payment_method` (nullable), `reference_number` (nullable)
- `notes` (text), `created_by` (FK → users.id, nullable)
- `created_at`, `updated_at`, `deleted_at`

**Soft Deletes:** Yes

**Relationships:**
- Belongs to `customers`
- Belongs to `bills` (nullable)

**Indexes:**
- `customer_id`, `bill_id`, `transaction_type`, `created_at`

---

## Module-Specific Tables

### Restaurant Management Tables

### `food_categories`
Food categories (Restaurant module).

**Key Columns:**
- `id`, `name` (UNIQUE), `description` (text)
- `status` (enum: 'active', 'inactive')
- `created_at`, `updated_at`, `deleted_at`

**Soft Deletes:** Yes

**Relationships:**
- Has many `food_items`

---

### `food_items`
Food items.

**Key Columns:**
- `id`, `category_id` (FK → food_categories.id)
- `name`, `description` (text), `price`
- `is_veg` (boolean), `status` (enum: 'active', 'inactive')
- `image` (nullable), `display_order` (default: 0)
- `created_at`, `updated_at`, `deleted_at`

**Soft Deletes:** Yes

**Relationships:**
- Belongs to `food_categories`
- Has many `bill_items`

---

### `tables`
Restaurant tables (Restaurant module).

**Key Columns:**
- `id`, `table_number` (UNIQUE), `table_name`
- `capacity` (1-50), `status` (enum: 'available', 'occupied', 'reserved', 'cleaning', 'maintenance')
- `is_active` (boolean, default: true)
- `created_at`, `updated_at`, `deleted_at`

**Soft Deletes:** Yes

**Relationships:**
- Has many `bills`

---

## Relationships

### User & Authorization
- **User** ↔ **Role** (many-to-many via `user_role`)
- **Role** ↔ **Permission** (many-to-many via `role_permission`)

### Restaurant System
- **FoodCategory** → **FoodItem** (one-to-many)
- **Table** → **Bill** (one-to-many)
- **Customer** → **Bill** (one-to-many)
- **Bill** → **BillItem** (one-to-many)
- **BillItem** → **FoodItem** (many-to-one)
- **Customer** → **WalletTransaction** (one-to-many)
- **Bill** → **WalletTransaction** (one-to-one, nullable)

### Staff Management
- **Staff** → **SalaryPayment** (one-to-many)
- **User** → **SalaryPayment** (one-to-many, as creator)

### Expense Management
- **ExpenseCategory** → **Expense** (one-to-many)
- **User** → **Expense** (one-to-many, as creator)

### Expense Management
- **ExpenseCategory** → **Expense** (one-to-many)
- **User** → **Expense** (one-to-many, as creator)

---

## Important Notes

### Soft Deletes
Tables with soft deletes: `branches`, `roles`, `food_categories`, `food_items`, `tables`, `customers`, `staff`, `salary_payments`, `bills`, `wallet_transactions`, `expense_categories`, `expenses`

### Auto-Generated Codes
- **Customer Code**: `#CUST001` format (generated before creation)
- **Bill Number**: `#BILL{ID}` format (generated after creation)
- **Staff Code**: `STF{ID}` format (accessor, not stored)

### Critical Indexes
For high-volume tables (`bills`, `bill_items`), indexes are critical for performance:
- **bills**: `table_id`, `customer_id`, `status`, `bill_date`, `payment_status`, `created_at`
- **bill_items**: `bill_id` (MOST IMPORTANT), `food_item_id`, `created_at`

### Foreign Key Constraints
- Most foreign keys use `ON DELETE SET NULL` or `ON DELETE RESTRICT`
- `bill_items.bill_id` uses `ON DELETE CASCADE`

### Calculated Fields
- Customer financial data (`totalCredits`, `totalDebits`, `remaining`) calculated from `wallet_transactions` (not stored)
- Bill totals calculated and stored in `bills` table

### Payment Logic
- **Cash/UPI/Card**: Updates bill status, no wallet transaction
- **Wallet**: Updates bill status + creates wallet transaction (debit)

### Table Status Management
- Table status automatically updated based on active bills
- `occupied` when bill created (draft/pending)
- `available` when payment processed (if no other active bills)

### Image Storage
- Food items: `storage/app/public/food-items/`
- User avatars: `storage/app/public/avatars/`
- Business logos: `storage/app/public/logos/`
- Served via custom handler at `/admin/api/storage/{path}`

---

**Last Updated**: January 2025  
**Multi-Module Support**: ✅ Implemented

### Planned Tables (Hotel Room Module)
- `room_categories` - Room category master
- `rooms` - Room master
- `bookings` - Room bookings
- `booking_rooms` - Booking-room pivot
- `booking_id_documents` - ID documents for check-in
- `laundry_services` - Laundry service entries
- `booking_payments` - Room booking payments

### Planned Tables (Banquet Hall Module)
- `halls` - Banquet hall master
- `hall_bookings` - Banquet hall bookings
