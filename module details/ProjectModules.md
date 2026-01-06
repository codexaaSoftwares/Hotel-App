# Hotel Management App - Project Modules Documentation

## 📋 Overview

This document provides comprehensive details about all modules in the Hotel Management App (Phase 1 - Restaurant Management). Each module will have detailed documentation covering frontend, backend, and database implementation.

**Project Type**: Multi-tenant Hotel Management System  
**Phase**: Phase 1 - Restaurant Management (MVP)  
**Technology Stack**: 
- Frontend: React 19, React Bootstrap, CoreUI
- Backend: Laravel (PHP)
- Database: MySQL/PostgreSQL

---

## 🎯 Project Scope Summary

### Phase 1: Restaurant Management (MVP)

The first phase focuses on restaurant operations including:
- User & Access Management
- Restaurant Settings & Configuration
- Food & Menu Management
- Table Management (Dine-In)
- Customer Management
- POS/Billing System with GST
- Staff & Salary Management
- Expense Management
- Reports & Analytics

---

## 📱 Navigation Menu Structure

Based on the project scope, the navigation menu is organized as follows:

### Main Navigation Items

```
1. Dashboard
   - Overview & Analytics

2. POS Panel
   - Main POS interface for taking orders and billing

3. Bills
   - All bills with filters (Pending, Today, Paid, etc.)

4. Restaurant
   ├── Food Categories
   ├── Food Items
   ├── Table Management
   └── Restaurant Settings

5. Management
   ├── Customers
   ├── Customer Ledger
   ├── Staff
   ├── Salary Payments
   ├── Expense Categories
   └── Expenses

6. Reports
   ├── Sales Report
   ├── Expense Report
   ├── GST Summary
   ├── Customer Pending Report
   ├── Customer Ledger Report
   ├── Staff & Salary Report
   └── Business Dashboard

7. Administrator
   ├── User Management
   │   ├── Users
   │   └── Roles & Permissions
   ├── Branch
   └── Settings
```

---

## 📦 Module List

### 1. **Dashboard Module**
- **Status**: ⏳ To be implemented
- **Purpose**: Overview of restaurant operations, key metrics, and quick actions
- **Features**:
  - Today's sales summary
  - Active tables status
  - Pending bills count
  - Quick access to common actions
  - Revenue charts (Daily/Monthly)

### 2. **User & Access Management**
- **Status**: ✅ Partially implemented (from existing admin panel)
- **Sub-modules**:
  - **Users**: User CRUD operations
  - **Roles & Permissions**: Role-based access control
- **Features**:
  - Login/Logout
  - Role-based access (Admin, Manager, Cashier)
  - User profile management
  - Permission assignment

### 3. **Restaurant & Settings**
- **Status**: ⏳ To be implemented
- **Purpose**: Restaurant configuration and settings
- **Features**:
  - Restaurant profile settings
  - Invoice settings
  - Default GST settings
  - Thermal printer settings (80mm)
  - Business information

### 4. **Food & Menu Management**
- **Status**: ⏳ To be implemented
- **Sub-modules**:
  - **Food Categories**: Category management with display order
  - **Food Items**: Item management with pricing and GST
- **Features**:
  - Create/Edit/Disable categories
  - Category display order
  - Item name, category, price
  - Item-wise GST support
  - Veg/Non-Veg classification
  - Active/Inactive status

### 5. **Table Management (Dine-In)**
- **Status**: ⏳ To be implemented
- **Purpose**: Manage restaurant tables for dine-in service
- **Features**:
  - Create tables (T1, T2, Family Table, etc.)
  - Table capacity management
  - Table status (Available/Occupied)
  - Multiple bills per table support
  - Active/Inactive tables

### 6. **Customer Management**
- **Status**: ⏳ To be implemented
- **Purpose**: Manage restaurant customers and credit accounts
- **Features**:
  - Walk-in customers (default, no record)
  - Registered customers
  - Customer types (Regular, Credit/Udhar)
  - Customer profile (Name, Mobile, Address)
  - Customer ledger

### 7. **POS/Billing Module (Core)**
- **Status**: ⏳ To be implemented
- **Purpose**: Point of Sale and billing system
- **Sub-modules**:
  - **POS Panel**: Main POS interface with split-screen layout
    - Tables Panel (left): All tables with status
    - Products Panel (center): Products by categories
    - Billing Cart (right): Order items, customer, payment
  - **Bills**: Unified bills page with filters
    - All bills view
    - Pending bills (Udhar)
    - Today's bills
    - Paid bills
    - Search and filter capabilities
  - **Payment Handling**: Multiple payment modes
  - **Invoice Generation**: GST-compliant invoices
- **Features**:
  - Split-screen POS interface for fast order taking
  - Multiple orders per table support
  - Draft order auto-save
  - Create bill with or without table
  - Add multiple items with quantity
  - Automatic calculation
  - Payment modes: Cash, UPI, Card
  - Split payment support
  - Partial payment (registered customers only)
  - Print bill before payment
  - GST-compliant invoice (CGST/SGST breakup)
  - Thermal printer output (80mm)
  - Invoice cannot be edited after closing
- **Detailed Specification**: See `scope/POS_Panel_Specification.md`

### 8. **Staff & Salary Management**
- **Status**: ⏳ To be implemented
- **Purpose**: Track staff and manage salary payments
- **Sub-modules**:
  - **Staff Management**: Staff master data
  - **Salary Payment**: Salary records and payments
- **Features**:
  - Staff ID, Name, Mobile
  - Department (Cook, Helper, Cleaner, Cashier)
  - Salary Type (Monthly/Daily)
  - Salary Amount, Joining Date
  - Document Info (optional)
  - Status (Active/Inactive)
  - Salary payment records
  - Partial payment allowed
  - Auto-linked to expense reports

### 9. **Expense Management**
- **Status**: ⏳ To be implemented
- **Purpose**: Track non-food, non-salary daily expenses
- **Sub-modules**:
  - **Expense Categories**: Category management
  - **Expense Records**: Daily expense tracking
- **Features**:
  - Expense categories (Electricity, Cleaning, etc.)
  - Expense records with amount, date
  - Payment mode (Cash/UPI/Bank)
  - Description/Notes
  - Status (Active/Inactive)

### 10. **Reports Module**
- **Status**: ⏳ To be implemented
- **Purpose**: Generate various business reports
- **Report Types**:
  - Sales Report (Daily, Monthly, Yearly)
  - Expense Report (Daily, Monthly, Yearly)
  - GST Summary Report
  - Customer Pending (Udhar) Report
  - Customer Details - Ledger Report
  - Staff and Salary Report
  - Business Financial Dashboard

---

## 🔒 Fixed Business Rules

These business rules are fixed and must be implemented as specified:

1. **Walk-in Customers**: Full payment mandatory (no credit allowed)
2. **Udhar (Credit)**: Only registered customers can have credit accounts
3. **Multiple Bills per Table**: A table can have multiple bills simultaneously
4. **GST Calculation**:
   - Default: Calculated on total bill
   - Supported: Item-wise GST calculation
5. **Invoice Editing**: Invoice cannot be edited after closing/payment
6. **Salary Expenses**: Salary payments are automatically linked to expense reports

---

## 📁 Module Documentation Structure

Each module will have a separate documentation file following this structure:

```
module details/
├── ProjectModules.md (This file - Main overview)
├── 01-Dashboard.md
├── 02-UserAccessManagement.md
├── 03-RestaurantSettings.md
├── 04-FoodMenuManagement.md
├── 05-TableManagement.md
├── 06-CustomerManagement.md
├── 07-POSBilling.md
├── 08-StaffSalaryManagement.md
├── 09-ExpenseManagement.md
└── 10-Reports.md
```

Each module file will contain:
- **Module Overview**: Purpose and scope
- **Frontend Details**: 
  - Component structure
  - Routes and navigation
  - UI/UX specifications
  - Form validations
- **Backend Details**:
  - API endpoints
  - Controllers and services
  - Business logic
  - Validation rules
- **Database Details**:
  - Table structure
  - Relationships
  - Indexes
  - Constraints

---

## 🚀 Implementation Priority

### Phase 1 - Core Modules (MVP)
1. ✅ User & Access Management (Partially done)
2. ⏳ Restaurant & Settings
3. ⏳ Food & Menu Management
4. ⏳ Table Management
5. ⏳ POS Panel (Main POS interface)
6. ⏳ Bills Management (Unified bills page)
7. ⏳ Customer Management
8. ⏳ Reports (Basic)

### Phase 1 - Extended Modules
9. ⏳ Staff & Salary Management
10. ⏳ Expense Management
11. ⏳ Advanced Reports

---

## 📝 Notes

- All modules follow the existing project structure and development guidelines
- Permission-based access control is implemented for all modules
- Multi-tenant support: All modules support restaurant/branch-specific data
- Theme: Elegant Teal (#0d9488) - Professional hospitality theme
- Navigation: Horizontal top navigation bar with hierarchical dropdowns

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Phase**: Phase 1 - Restaurant Management (MVP)

