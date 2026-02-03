# Reports Module - Requirements Document

## Overview
This document defines all reports required for the Restaurant Management System (Phase 1).

**Total Reports**: 5  
**Export Formats**: PDF + CSV (both required for all reports)

---

## 📊 Reports List

### 1. **Sales Report** ✅ (Priority: HIGH) - **COMPLETED**
**Purpose**: Track revenue and sales performance

**Filters:**
- Date Range (Start Date, End Date)
- Payment Status (All, Paid, Pending, Partial)
- Payment Method (All, Cash, UPI, Card, Wallet)
- Table (Optional - filter by specific table)
- Customer (Optional - filter by specific customer)

**Data to Display:**
- Summary Cards:
  - Total Sales Amount
  - Total Bills Count
  - Paid Bills Count
  - Pending Bills Count
  - Average Bill Amount
- Detailed Table:
  - Bill Number
  - Bill Date
  - Table Name (if applicable)
  - Customer Name (if applicable)
  - Payment Method
  - Payment Status
  - Subtotal
  - Discount
  - CGST Amount
  - SGST Amount
  - Service Tax Amount
  - Total Amount
- Grouping Options:
  - By Date (Daily breakdown)
  - By Payment Method
  - By Table

**Export Options:**
- PDF Export ⏳ (Button added, API pending)
- CSV Export ⏳ (Button added, API pending)

**Implementation Status:**
- ✅ Backend API endpoint (`/api/reports/sales`)
- ✅ Frontend component (`SalesReport.jsx`)
- ✅ Filters (Date Range, Payment Status, Payment Method, Table, Customer)
- ✅ Summary Cards (Total Bills, Paid Bills, Pending Bills, Total Sales, Total Subtotal, Total Discount, Total CGST, Total SGST, Total Service Tax)
- ✅ Data Table with sorting
- ⏳ PDF Export API
- ⏳ CSV Export API

---

### 2. **Expense Report** ✅ (Priority: HIGH) - **COMPLETED**
**Purpose**: Track business expenses

**Filters:**
- Date Range (Start Date, End Date)
- Expense Category (All, or specific category)
- Payment Method (All, Cash, UPI, Card, Bank)

**Data to Display:**
- Summary Cards:
  - Total Expenses
  - Total Expenses (This Month)
  - Total Expenses (Today)
  - Average Daily Expense
- Detailed Table:
  - Expense Date
  - Category Name
  - Description
  - Amount
  - Payment Method
  - Created By (User name)
- Grouping Options:
  - By Date (Daily breakdown)
  - By Category
  - By Payment Method

**Export Options:**
- PDF Export ⏳ (Button added, API pending)
- CSV Export ⏳ (Button added, API pending)

**Implementation Status:**
- ✅ Backend API endpoint (`/api/reports/expenses`)
- ✅ Frontend component (`ExpenseReport.jsx`)
- ✅ Filters (Date Range, Expense Category, Payment Method)
- ✅ Summary Cards (Total Expenses, This Month, Today, Average Daily Expense)
- ✅ Data Table with sorting
- ⏳ PDF Export API
- ⏳ CSV Export API

---

### 3. **Customer Pending (Udhar) Report** ✅ (Priority: MEDIUM) - **COMPLETED**
**Purpose**: Track customers with pending/credit amounts

**Filters:**
- Date Range (Start Date, End Date) - Optional
- Customer (Optional - filter by specific customer)
- Status (All, Active, Inactive)

**Data to Display:**
- Summary Cards:
  - Total Pending Amount
  - Total Customers with Pending
  - Average Pending per Customer
- Detailed Table:
  - Customer Code
  - Customer Name
  - Mobile Number
  - Total Credit (from wallet transactions)
  - Total Debit (from wallet transactions)
  - Pending Amount (Debit - Credit, shown as positive)
  - Last Transaction Date
  - Customer Status

**Export Options:**
- PDF Export ⏳ (Button added, API pending)
- CSV Export ⏳ (Button added, API pending)

**Implementation Status:**
- ✅ Backend API endpoint (`/api/reports/customer-pending`)
- ✅ Frontend component (`CustomerPendingReport.jsx`)
- ✅ Filters (Date Range, Customer, Status)
- ✅ Summary Cards (Total Pending Amount, Total Customers with Pending, Average Pending per Customer)
- ✅ Data Table with sorting
- ⏳ PDF Export API
- ⏳ CSV Export API

---

### 4. **Staff & Salary Report** ✅ (Priority: MEDIUM) - **COMPLETED**
**Purpose**: Track staff salary payments and payroll

**Filters:**
- Month (All, or specific month)
- Year (All, or specific year)
- Staff (Optional - filter by specific staff)
- Department (Optional - filter by department)

**Data to Display:**
- Summary Cards:
  - Total Salary Paid
  - Total Staff Count
  - Total Payments Count
  - Average Salary per Staff
- Detailed Table:
  - Payment Date
  - Staff Code (STF{ID})
  - Staff Name
  - Department
  - Month & Year
  - Paid Amount
  - Payment Method
  - Notes
  - Created By (User name)
- Grouping Options:
  - By Date (Daily breakdown)
  - By Staff
  - By Department
  - By Month/Year

**Export Options:**
- PDF Export ⏳ (Button added, API pending)
- CSV Export ⏳ (Button added, API pending)

**Implementation Status:**
- ✅ Backend API endpoint (`/api/reports/staff-salary`)
- ✅ Frontend component (`StaffSalaryReport.jsx`)
- ✅ Filters (Month, Year, Staff, Department)
- ✅ Summary Cards (Total Salary Paid, Total Staff Count, Total Payments Count, Average Salary per Staff)
- ✅ Data Table with sorting
- ⏳ PDF Export API
- ⏳ CSV Export API

---

### 5. **Category-wise Item Sales Report** ✅ (Priority: MEDIUM) - **COMPLETED**
**Purpose**: Identify top-selling items by category to understand sales performance

**Filters:**
- Date Range (Start Date, End Date)
- Category (All, or specific category)
- Item Status (All, Active, Inactive)

**Data to Display:**
- Summary Cards:
  - Total Items Sold
  - Total Revenue
  - Total Bills Count
  - Average Items per Bill
  - Top Category (Category with highest revenue)
  - Top Item (Item with highest revenue)
- Detailed Table:
  - Category (with color-coded badges)
  - Item Name
  - Price
  - Quantity Sold
  - Revenue
  - Bills Count
  - Avg Price
- Sorting: By Quantity Sold (descending) by default

**Export Options:**
- PDF Export ⏳ (Button added, API pending)
- CSV Export ⏳ (Button added, API pending)

**Implementation Status:**
- ✅ Backend API endpoint (`/api/reports/category-wise-items`)
- ✅ Frontend component (`CategoryWiseItemReport.jsx`)
- ✅ Filters (Date Range, Category, Item Status)
- ✅ Summary Cards (Total Items Sold, Total Revenue, Total Bills, Average Items per Bill, Top Category, Top Item)
- ✅ Data Table with sorting (simple flat table with category badges)
- ⏳ PDF Export API
- ⏳ CSV Export API

---

## 🎯 Implementation Priority

### All Reports (Complete List)
1. ✅ **Sales Report** - Essential for revenue tracking - **COMPLETED**
2. ✅ **Expense Report** - Essential for expense tracking - **COMPLETED**
3. ✅ **Customer Pending (Udhar) Report** - Important for credit management - **COMPLETED**
4. ✅ **Staff & Salary Report** - Important for payroll tracking - **COMPLETED**
5. ✅ **Category-wise Item Sales Report** - Important for sales analysis - **COMPLETED**

**Note:** GST Summary information is already available in the Sales Report, so a separate GST Summary Report is not needed.

---

## 📋 Common Features for All Reports

### UI Components
- Date Range Picker (Start Date, End Date)
- Filter Dropdowns (as per report requirements)
- Summary Cards (Key metrics)
- Data Table (Detailed list)
- Export Buttons (PDF, CSV)
- Loading States
- Empty States

### Backend Requirements
- Date range filtering
- Server-side data aggregation
- Summary calculations
- Export functionality (PDF generation)
- Proper indexing for performance

### Data Sources
- **Sales Report**: `bills` table (with `bill_items` for details)
- **Expense Report**: `expenses` table (with `expense_categories`)
- **Customer Pending Report**: `customers` + `wallet_transactions` tables
- **Staff & Salary Report**: `staff` + `salary_payments` tables
- **Category-wise Item Sales Report**: `bill_items` + `food_items` + `food_categories` tables

---

---

## 📝 Notes

1. **Date Range**: All reports should support date range filtering (Start Date, End Date)
2. **Default Date Range**: 
   - If not specified, show current month data
   - Or show last 30 days
3. **Export Format**: Both PDF and CSV are required for all reports
4. **Performance**: Use database aggregation for summary calculations
5. **Permissions**: All reports require `view_report` or specific permissions
6. **PDF Design**: Use existing PDF template (black and white design from PdfExportService)
7. **CSV Format**: Standard CSV with headers, comma-separated values

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Requirements Defined

