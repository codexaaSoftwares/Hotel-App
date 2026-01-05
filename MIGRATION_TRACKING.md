# Hotel Management Migration - Progress Tracking

**Project**: Hotel Management App – Restaurant & Room Management  
**Base Project**: Photo Studio Management  
**Status**: 🟡 Planning Complete

---

## 📊 Overall Progress

- **Planning**: ✅ 100% Complete
- **Cleanup**: ⏳ 0% Complete
- **Database**: ⏳ 0% Complete
- **Core Updates**: ⏳ 0% Complete
- **New Modules**: ⏳ 0% Complete
- **Testing**: ⏳ 0% Complete

---

## ✅ Phase 1: Project Cleanup & Setup

### Frontend Cleanup
- [ ] Remove `src/views/branches/`
- [ ] Remove `src/services/branchService.js`
- [ ] Remove `src/components/pages/branches/`
- [ ] Remove `src/views/packages/`
- [ ] Remove `src/services/packageService.js`
- [ ] Remove `src/components/pages/packages/`
- [ ] Remove `src/views/orders/`
- [ ] Remove `src/services/orderService.js`
- [ ] Remove `src/components/pages/orders/`
- [ ] Remove `src/views/payments/`
- [ ] Remove `src/services/paymentService.js`
- [ ] Remove `src/components/pages/payments/`
- [ ] Remove `src/views/transactions/`
- [ ] Remove `src/services/transactionService.js`
- [ ] Remove `src/components/pages/transactions/`
- [ ] Remove `src/mock/` files
- [ ] Update `_nav.jsx` - remove deleted modules
- [ ] Update `routes.jsx` - remove deleted routes
- [ ] Update `src/constants/permissions.js`

### Backend Cleanup
- [ ] Remove `BranchController.php`
- [ ] Remove `PackageController.php`
- [ ] Remove `OrderController.php`
- [ ] Remove `PaymentController.php`
- [ ] Remove `PackageTypeController.php`
- [ ] Remove `Branch.php` model
- [ ] Remove `Package.php` model
- [ ] Remove `Order.php` model
- [ ] Remove `OrderItem.php` model
- [ ] Remove `Payment.php` model
- [ ] Remove related Request classes
- [ ] Remove related Resource classes
- [ ] Remove related migrations
- [ ] Remove `BranchSeeder.php`
- [ ] Update `routes/api.php`
- [ ] Update permissions seeder

---

## 🗄️ Phase 2: Database Schema

### Modify Existing Tables
- [ ] `customers` - Add `customer_type`, `udhar_balance`
- [ ] `settings` - Add restaurant settings keys
- [ ] `financial_categories` - Ensure expense support
- [ ] `financial_transactions` - Ensure expense support

### Create New Tables
- [ ] `food_categories` table
- [ ] `food_items` table
- [ ] `tables` table
- [ ] `bills` table
- [ ] `bill_items` table
- [ ] `staff` table
- [ ] `salaries` table

---

## ⚙️ Phase 3: Core Module Updates

### Settings Module
- [ ] Add restaurant profile settings
- [ ] Add invoice settings
- [ ] Add GST settings
- [ ] Add thermal printer settings
- [ ] Update `SettingController.php`
- [ ] Update `settingsService.js`
- [ ] Update `Settings.jsx` view

### Customer Module
- [ ] Add customer type (Regular/Credit)
- [ ] Add Udhar balance tracking
- [ ] Update `CustomerController.php`
- [ ] Update `Customer.php` model
- [ ] Update `customerService.js`
- [ ] Update Customer views

### Dashboard Module
- [ ] Update `DashboardController.php`
- [ ] Update `dashboardService.js`
- [ ] Update `Dashboard.jsx` view

### Financial Module (Expenses)
- [ ] Filter to expense type only
- [ ] Rename to Expenses in frontend
- [ ] Update views and services

### Reports Module
- [ ] Add Sales report
- [ ] Add Expenses report
- [ ] Add GST Summary Report
- [ ] Add Customer Pending (Udhar) Report
- [ ] Add Customer Ledger Report
- [ ] Add Staff and salary report
- [ ] Update Business Financial Dashboard
- [ ] Update `ReportController.php`
- [ ] Update `reportService.js`
- [ ] Update Report views

---

## 🆕 Phase 4: New Module Development

### Food & Menu Management
- [ ] Backend: `FoodCategoryController.php`
- [ ] Backend: `FoodItemController.php`
- [ ] Backend: Models, Requests, Resources
- [ ] Backend: Migrations, Seeders
- [ ] Backend: API routes, Permissions
- [ ] Frontend: Services
- [ ] Frontend: Views
- [ ] Frontend: Forms
- [ ] Frontend: Navigation, Routes, Permissions

### Table Management
- [ ] Backend: `TableController.php`
- [ ] Backend: Model, Requests, Resources
- [ ] Backend: Migration, Seeder
- [ ] Backend: API routes, Permissions
- [ ] Frontend: Service
- [ ] Frontend: View, Form
- [ ] Frontend: Navigation, Routes, Permissions

### Billing / POS Module
- [ ] Backend: `BillingController.php`
- [ ] Backend: `Bill.php`, `BillItem.php` models
- [ ] Backend: Requests, Resources
- [ ] Backend: Migrations
- [ ] Backend: API routes, Permissions
- [ ] Backend: GST calculation (CGST/SGST)
- [ ] Backend: Thermal printer support
- [ ] Backend: PDF template
- [ ] Frontend: `BillingService.js`
- [ ] Frontend: `BillingPOS.jsx` view
- [ ] Frontend: BillForm, PaymentModal, BillDetailsModal
- [ ] Frontend: POS UI implementation
- [ ] Frontend: Payment handling
- [ ] Frontend: Udhar/Pending bill handling
- [ ] Frontend: Navigation, Routes, Permissions

### Staff & Salary Management
- [ ] Backend: `StaffController.php`
- [ ] Backend: `SalaryController.php`
- [ ] Backend: Models, Requests, Resources
- [ ] Backend: Migrations, Seeders
- [ ] Backend: API routes, Permissions
- [ ] Backend: Link salary to expenses
- [ ] Frontend: Services
- [ ] Frontend: Views, Forms
- [ ] Frontend: Navigation, Routes, Permissions

---

## 🧪 Phase 5: Testing & Refinement

### Unit Testing
- [ ] Test all new models
- [ ] Test all new controllers
- [ ] Test all new services

### Integration Testing
- [ ] Test API endpoints
- [ ] Test frontend-backend integration
- [ ] Test payment flows
- [ ] Test GST calculations
- [ ] Test Udhar/Pending bill handling

### User Acceptance Testing
- [ ] Test complete billing flow
- [ ] Test table management
- [ ] Test food menu management
- [ ] Test staff & salary management
- [ ] Test all reports

### Documentation
- [ ] Update README.md
- [ ] Update API documentation
- [ ] Update database documentation
- [ ] Create user guide
- [ ] Create deployment guide

---

## 📝 Quick Reference

### Files to Remove
- `admin/src/views/branches/`
- `admin/src/services/branchService.js`
- `admin/src/views/packages/`
- `admin/src/services/packageService.js`
- `admin/src/views/orders/`
- `admin/src/services/orderService.js`
- `admin/src/views/payments/`
- `admin/src/services/paymentService.js`
- `admin/src/views/transactions/`
- `admin/src/services/transactionService.js`
- `backend/app/Http/Controllers/API/BranchController.php`
- `backend/app/Http/Controllers/API/PackageController.php`
- `backend/app/Http/Controllers/API/OrderController.php`
- `backend/app/Http/Controllers/API/PaymentController.php`

### Files to Create
- `admin/src/services/foodCategoryService.js`
- `admin/src/services/foodItemService.js`
- `admin/src/services/tableService.js`
- `admin/src/services/billingService.js`
- `admin/src/services/staffService.js`
- `admin/src/services/salaryService.js`
- `backend/app/Http/Controllers/API/FoodCategoryController.php`
- `backend/app/Http/Controllers/API/FoodItemController.php`
- `backend/app/Http/Controllers/API/TableController.php`
- `backend/app/Http/Controllers/API/BillingController.php`
- `backend/app/Http/Controllers/API/StaffController.php`
- `backend/app/Http/Controllers/API/SalaryController.php`

### Files to Modify
- `admin/src/services/settingsService.js`
- `admin/src/services/customerService.js`
- `admin/src/services/dashboardService.js`
- `admin/src/services/reportService.js`
- `backend/app/Http/Controllers/API/SettingController.php`
- `backend/app/Http/Controllers/API/CustomerController.php`
- `backend/app/Http/Controllers/API/DashboardController.php`
- `backend/app/Http/Controllers/API/ReportController.php`

---

**Last Updated**: January 2025  
**Next Review**: After Phase 1 completion

