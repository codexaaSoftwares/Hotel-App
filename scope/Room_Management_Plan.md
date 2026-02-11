# Hotel Room Management - Complete Module Planning

## 📋 Overview

This document provides a comprehensive plan for implementing Hotel Room Management module (Phase 2) with all required modules, pages, reports, and integrations.

**Phase**: Phase 2 - Hotel Room Management  
**Status**: Planning Phase  
**Dependencies**: Phase 1 (Restaurant Management) must be complete

---

## 🎯 Module Structure

### Core Modules

1. **Room Categories Management**
2. **Rooms Master Management**
3. **Booking Management**
4. **Check-In/Check-Out Management**
5. **Laundry Service Management**
6. **Room Billing & Invoicing**
7. **Room Settings**
8. **Dashboard**
9. **Reports**

---

## 📦 Module Details

### 1. **Room Categories Management**

#### Features
- ✅ Create/Edit/Delete Room Categories
- ✅ Category Name (Unique)
- ✅ Description
- ✅ Base Price (Per Night)
- ✅ Max Adults (1-10)
- ✅ Max Children (0-10)
- ✅ Status (Active/Inactive)
- ✅ Server-side pagination, sorting, searching
- ✅ Soft delete support

#### Frontend Components
- **View**: `admin/src/views/hotel-room/RoomCategoriesList.jsx`
- **Form Component**: `admin/src/components/pages/hotel-room/RoomCategoryForm.jsx`
- **Service**: `admin/src/services/roomService.js`

#### Backend
- **Controller**: `backend/app/Http/Controllers/API/RoomCategoryController.php`
- **Model**: `backend/app/Models/RoomCategory.php`
- **Request**: `backend/app/Http/Requests/RoomCategoryStoreRequest.php`, `RoomCategoryUpdateRequest.php`
- **Resource**: `backend/app/Http/Resources/RoomCategoryResource.php`

#### Database
- **Table**: `room_categories`
- **Fields**: `id`, `name` (UNIQUE), `description`, `base_price`, `max_adults`, `max_children`, `status`, `created_at`, `updated_at`, `deleted_at`

---

### 2. **Rooms Master Management**

#### Features
- ✅ Create/Edit/Delete Rooms
- ✅ Room Number/Code (Unique, e.g., "101", "201A")
- ✅ Room Category (FK → room_categories)
- ✅ Floor Number
- ✅ Bed Type (Single/Double/King/Queen/Twin)
- ✅ Max Occupancy (1-20)
- ✅ Room Price (nullable, overrides category price)
- ✅ Room Status (Available/Occupied/Cleaning/Maintenance/Reserved)
- ✅ Notes (text)
- ✅ Is Active (boolean)
- ✅ Server-side pagination, sorting, searching, filtering
- ✅ Soft delete support
- ✅ Room status automatic updates based on bookings
- ✅ Rooms PDF export (with business information)

#### Frontend Components
- **View**: `admin/src/views/hotel-room/RoomsList.jsx`
- **Form Component**: `admin/src/components/pages/hotel-room/RoomForm.jsx`
- **Service**: `admin/src/services/roomService.js`

#### Backend
- **Controller**: `backend/app/Http/Controllers/API/RoomController.php`
- **Model**: `backend/app/Models/Room.php`
- **Request**: `backend/app/Http/Requests/RoomStoreRequest.php`, `RoomUpdateRequest.php`
- **Resource**: `backend/app/Http/Resources/RoomResource.php`

#### Database
- **Table**: `rooms`
- **Fields**: `id`, `room_number` (UNIQUE), `room_category_id` (FK), `floor_number`, `bed_type`, `max_occupancy`, `room_price` (nullable), `status`, `notes`, `is_active`, `created_at`, `updated_at`, `deleted_at`

---

### 3. **Booking Management**

#### Features
- ✅ Create/Edit/Delete Bookings
- ✅ Booking Number (Auto-generated: #BOOK{ID})
- ✅ Customer (FK → customers, nullable for walk-in)
- ✅ Guest Name
- ✅ Mobile Number
- ✅ Address
- ✅ Booking Type (Walk-in/Advance Booking/Online Booking)
- ✅ Check-In Date & Time
- ✅ Expected Check-Out Date & Time
- ✅ Actual Check-In Time (nullable)
- ✅ Actual Check-Out Time (nullable)
- ✅ Total Rooms (calculated from booking_rooms)
- ✅ Booking Status (Booked/Checked-In/Checked-Out/Cancelled)
- ✅ Advance Payment Amount
- ✅ Notes
- ✅ Created By (FK → users)
- ✅ Server-side pagination, sorting, searching, filtering
- ✅ Soft delete support

#### Frontend Components
- **View**: `admin/src/views/hotel-room/BookingsList.jsx`
- **Form Component**: `admin/src/components/pages/hotel-room/BookingForm.jsx`
- **Service**: `admin/src/services/bookingService.js`

#### Backend
- **Controller**: `backend/app/Http/Controllers/API/BookingController.php`
- **Model**: `backend/app/Models/Booking.php`
- **Request**: `backend/app/Http/Requests/BookingStoreRequest.php`, `BookingUpdateRequest.php`
- **Resource**: `backend/app/Http/Resources/BookingResource.php`

#### Database
- **Table**: `bookings`
- **Fields**: `id`, `booking_number` (nullable, auto-generated), `customer_id` (FK, nullable), `guest_name`, `mobile_number`, `address`, `booking_type`, `check_in_date`, `check_in_time`, `expected_check_out_date`, `expected_check_out_time`, `actual_check_in_time` (nullable), `actual_check_out_time` (nullable), `booking_status`, `advance_payment_amount`, `notes`, `created_by` (FK → users), `created_at`, `updated_at`, `deleted_at`

---

### 4. **Booking Rooms (Child Table)**

#### Features
- ✅ Multiple rooms per booking
- ✅ Room (FK → rooms)
- ✅ Adults Count
- ✅ Children Count
- ✅ Price Per Night (from room or category)
- ✅ Room Status (linked to room status)

#### Database
- **Table**: `booking_rooms`
- **Fields**: `id`, `booking_id` (FK → bookings), `room_id` (FK → rooms), `adults_count`, `children_count`, `price_per_night`, `created_at`, `updated_at`
- **Relationships**: 
  - Belongs to `bookings`
  - Belongs to `rooms`

---

### 5. **Check-In Management**

#### Features
- ✅ Check-In Form (from booking)
- ✅ Assign rooms to booking
- ✅ Multiple ID Documents support
- ✅ Document Type (Aadhar/PAN/Passport/Driving License/Other)
- ✅ Document Number
- ✅ Guest Name (for each document)
- ✅ File Upload (Optional)
- ✅ Auto-update room status to "Occupied"
- ✅ Auto-update booking status to "Checked-In"
- ✅ Record actual check-in time

#### Frontend Components
- **View**: `admin/src/views/hotel-room/CheckInForm.jsx`
- **Component**: `admin/src/components/pages/hotel-room/CheckInForm.jsx`
- **Component**: `admin/src/components/pages/hotel-room/IDDocumentForm.jsx`
- **Service**: `admin/src/services/bookingService.js`

#### Backend
- **Controller**: `backend/app/Http/Controllers/API/BookingController.php` (checkIn method)
- **Request**: `backend/app/Http/Requests/CheckInRequest.php`

#### Database
- **Table**: `booking_id_documents`
- **Fields**: `id`, `booking_id` (FK → bookings), `document_type`, `document_number`, `guest_name`, `file_path` (nullable), `created_at`, `updated_at`

---

### 6. **Check-Out Management**

#### Features
- ✅ Check-Out Form
- ✅ Calculate total charges:
  - Room Rent (nights × price per night)
  - Laundry Charges
  - Restaurant Room-Charge Orders
  - Extra Charges
- ✅ Apply Discount
- ✅ Calculate GST (if applicable)
- ✅ Generate Final Invoice
- ✅ Process Payment
- ✅ Auto-update room status to "Cleaning"
- ✅ Auto-update booking status to "Checked-Out"
- ✅ Record actual check-out time

#### Frontend Components
- **View**: `admin/src/views/hotel-room/CheckOutForm.jsx`
- **Component**: `admin/src/components/pages/hotel-room/CheckOutForm.jsx`
- **Component**: `admin/src/components/pages/hotel-room/CheckOutInvoiceModal.jsx`
- **Service**: `admin/src/services/bookingService.js`

#### Backend
- **Controller**: `backend/app/Http/Controllers/API/BookingController.php` (checkOut method)
- **Request**: `backend/app/Http/Requests/CheckOutRequest.php`

---

### 7. **Laundry Service Management**

#### Features
- ✅ Create/Edit/Delete Laundry Entries
- ✅ Link to Booking
- ✅ Item Type (Shirt/Pants/Saree/Blouse/etc.)
- ✅ Quantity
- ✅ Rate (per item)
- ✅ Amount (calculated: quantity × rate)
- ✅ Date
- ✅ Status (Given/Returned)
- ✅ Notes
- ✅ Server-side pagination, sorting, searching, filtering
- ✅ Soft delete support

#### Frontend Components
- **View**: `admin/src/views/hotel-room/LaundryList.jsx` (or integrated in Booking view)
- **Form Component**: `admin/src/components/pages/hotel-room/LaundryForm.jsx`
- **Service**: `admin/src/services/laundryService.js`

#### Backend
- **Controller**: `backend/app/Http/Controllers/API/LaundryController.php`
- **Model**: `backend/app/Models/Laundry.php`
- **Request**: `backend/app/Http/Requests/LaundryStoreRequest.php`, `LaundryUpdateRequest.php`
- **Resource**: `backend/app/Http/Resources/LaundryResource.php`

#### Database
- **Table**: `laundry_services`
- **Fields**: `id`, `booking_id` (FK → bookings), `item_type`, `quantity`, `rate`, `amount`, `date`, `status`, `notes`, `created_at`, `updated_at`, `deleted_at`

---

### 8. **Room Billing & Invoicing**

#### Features
- ✅ Combined Invoice Generation
- ✅ Invoice includes:
  - Room Rent (Multiple Rooms × Nights)
  - Laundry Charges
  - Restaurant Room-Charge Orders (from restaurant bills)
  - Extra Charges
  - Discount
  - GST (CGST, SGST, Service Tax - if applicable)
  - Total Amount
- ✅ Payment Processing
  - Advance Payment
  - Partial Payment
  - Full Payment
  - Payment Methods: Cash, UPI, Card
- ✅ Invoice PDF Export
- ✅ Print Invoice

#### Frontend Components
- **Component**: `admin/src/components/pages/hotel-room/InvoiceModal.jsx`
- **Component**: `admin/src/components/pages/hotel-room/PaymentForm.jsx`
- **Service**: `admin/src/services/bookingService.js`

#### Backend
- **Controller**: `backend/app/Http/Controllers/API/BookingController.php` (generateInvoice, processPayment methods)
- **Service**: `backend/app/Services/InvoiceService.php`

#### Database
- **Table**: `booking_payments`
- **Fields**: `id`, `booking_id` (FK → bookings), `payment_amount`, `payment_date`, `payment_method`, `reference_number` (nullable), `notes` (nullable), `created_by` (FK → users), `created_at`, `updated_at`

---

### 9. **Restaurant → Room Billing Integration**

#### Features
- ✅ Link Restaurant Bills to Room
- ✅ In POS Panel: Option to "Charge to Room"
- ✅ Select Booking and Room Number
- ✅ Bill Status: "Paid" or "Pending (Room Charge)"
- ✅ Pending bills appear in Room Checkout Invoice
- ✅ Auto-update when room payment processed

#### Frontend Changes
- **POS Panel**: Add "Charge to Room" option in payment section
- **Component**: `admin/src/components/pages/pos/RoomChargeModal.jsx`
- **Bills List**: Filter by "Room Charge" status

#### Backend Changes
- **Bills Table**: Add `booking_id` (FK, nullable), `room_number` (nullable)
- **Bill Model**: Relationship to `bookings`
- **Bill Controller**: Update to handle room charge

#### Database
- **Migration**: Add to `bills` table:
  - `booking_id` (FK → bookings, nullable)
  - `room_number` (string, nullable)

---

### 10. **Room Settings Management**

#### Features
- ✅ Hotel Information Settings
- ✅ Room Pricing Settings
- ✅ Check-In/Check-Out Time Settings
- ✅ Laundry Service Settings (Item Types, Rates)
- ✅ Extra Charges Settings
- ✅ GST Settings (if applicable for rooms)
- ✅ Invoice Settings (Prefix, Footer, Terms)

#### Frontend Components
- **View**: `admin/src/views/hotel-room/settings/RoomSettings.jsx`
- **Service**: `admin/src/services/roomSettingsService.js`

#### Backend
- **Controller**: `backend/app/Http/Controllers/API/RoomSettingsController.php`
- **Settings**: Store in `settings` table with group = "Room Settings"

---

### 11. **Dashboard Module**

#### Features
- ✅ Today's Check-Ins Count
- ✅ Today's Check-Outs Count
- ✅ Currently Occupied Rooms
- ✅ Available Rooms
- ✅ Today's Revenue
- ✅ Pending Check-Outs
- ✅ Room Status Overview (Cards/Chart)
- ✅ Quick Actions:
  - New Booking
  - Check-In
  - Check-Out
  - View All Rooms

#### Frontend Components
- **View**: `admin/src/views/hotel-room/dashboard/Dashboard.jsx`
- **Components**: 
  - `admin/src/components/pages/hotel-room/dashboard/StatsCards.jsx`
  - `admin/src/components/pages/hotel-room/dashboard/RoomStatusChart.jsx`
- **Service**: `admin/src/services/dashboardService.js`

#### Backend
- **Controller**: `backend/app/Http/Controllers/API/DashboardController.php` (hotelRoomDashboard method)
- **Endpoints**: `GET /api/dashboard/hotel-room`

---

### 12. **Reports Module**

#### Report Types

##### 12.1 **Occupancy Report**
- **Filters**: Date Range, Room Category, Room, Status
- **Summary Cards**: 
  - Total Rooms
  - Occupied Rooms
  - Available Rooms
  - Occupancy Rate (%)
- **Data Table**: Room Number, Category, Status, Check-In Date, Check-Out Date, Nights, Revenue
- **Exports**: PDF, CSV

##### 12.2 **Revenue Report**
- **Filters**: Date Range, Booking Type, Payment Status
- **Summary Cards**:
  - Total Revenue
  - Room Rent Revenue
  - Laundry Revenue
  - Restaurant Revenue (from room charges)
  - Extra Charges Revenue
- **Data Table**: Booking Number, Guest Name, Check-In, Check-Out, Nights, Room Rent, Laundry, Restaurant, Extra, Discount, GST, Total
- **Exports**: PDF, CSV

##### 12.3 **Booking Report**
- **Filters**: Date Range, Booking Type, Booking Status, Customer
- **Summary Cards**:
  - Total Bookings
  - Checked-In Bookings
  - Checked-Out Bookings
  - Cancelled Bookings
  - Average Nights per Booking
- **Data Table**: Booking Number, Guest Name, Mobile, Booking Type, Check-In, Check-Out, Rooms, Status, Total Amount
- **Exports**: PDF, CSV

##### 12.4 **Today's Check-In/Check-Out Report**
- **Filters**: Date (default: today)
- **Summary Cards**:
  - Today's Check-Ins
  - Today's Check-Outs
  - Expected Check-Outs
- **Data Table**: Booking Number, Guest Name, Mobile, Room(s), Check-In Time, Check-Out Time, Status
- **Exports**: PDF, CSV

##### 12.5 **Room Utilization Report**
- **Filters**: Date Range, Room Category
- **Summary Cards**:
  - Total Room Nights
  - Average Occupancy Rate
  - Most Booked Room
  - Most Booked Category
- **Data Table**: Room Number, Category, Total Nights Booked, Total Revenue, Utilization Rate
- **Exports**: PDF, CSV

#### Frontend Components
- **Views**: 
  - `admin/src/views/hotel-room/reports/OccupancyReport.jsx`
  - `admin/src/views/hotel-room/reports/RevenueReport.jsx`
  - `admin/src/views/hotel-room/reports/BookingReport.jsx`
  - `admin/src/views/hotel-room/reports/TodayCheckInOutReport.jsx`
  - `admin/src/views/hotel-room/reports/RoomUtilizationReport.jsx`
- **Service**: `admin/src/services/reportService.js`

#### Backend
- **Controller**: `backend/app/Http/Controllers/API/ReportController.php`
- **Endpoints**:
  - `GET /api/reports/occupancy`
  - `GET /api/reports/revenue` (room-specific)
  - `GET /api/reports/bookings`
  - `GET /api/reports/today-checkinout`
  - `GET /api/reports/room-utilization`
  - `GET /api/reports/occupancy/export-pdf`
  - `GET /api/reports/revenue/export-pdf`
  - `GET /api/reports/bookings/export-pdf`
  - `GET /api/reports/today-checkinout/export-pdf`
  - `GET /api/reports/room-utilization/export-pdf`
  - `GET /api/reports/occupancy/export-csv`
  - `GET /api/reports/revenue/export-csv`
  - `GET /api/reports/bookings/export-csv`
  - `GET /api/reports/today-checkinout/export-csv`
  - `GET /api/reports/room-utilization/export-csv`

---

## 🗄️ Database Schema

### New Tables

1. **room_categories**
   - `id`, `name` (UNIQUE), `description`, `base_price`, `max_adults`, `max_children`, `status`, `created_at`, `updated_at`, `deleted_at`

2. **rooms**
   - `id`, `room_number` (UNIQUE), `room_category_id` (FK), `floor_number`, `bed_type`, `max_occupancy`, `room_price` (nullable), `status`, `notes`, `is_active`, `created_at`, `updated_at`, `deleted_at`

3. **bookings**
   - `id`, `booking_number` (nullable), `customer_id` (FK, nullable), `guest_name`, `mobile_number`, `address`, `booking_type`, `check_in_date`, `check_in_time`, `expected_check_out_date`, `expected_check_out_time`, `actual_check_in_time` (nullable), `actual_check_out_time` (nullable), `booking_status`, `advance_payment_amount`, `notes`, `created_by` (FK), `created_at`, `updated_at`, `deleted_at`

4. **booking_rooms**
   - `id`, `booking_id` (FK), `room_id` (FK), `adults_count`, `children_count`, `price_per_night`, `created_at`, `updated_at`

5. **booking_id_documents**
   - `id`, `booking_id` (FK), `document_type`, `document_number`, `guest_name`, `file_path` (nullable), `created_at`, `updated_at`

6. **laundry_services**
   - `id`, `booking_id` (FK), `item_type`, `quantity`, `rate`, `amount`, `date`, `status`, `notes`, `created_at`, `updated_at`, `deleted_at`

7. **booking_payments**
   - `id`, `booking_id` (FK), `payment_amount`, `payment_date`, `payment_method`, `reference_number` (nullable), `notes` (nullable), `created_by` (FK), `created_at`, `updated_at`

### Modified Tables

1. **bills** (Restaurant)
   - Add: `booking_id` (FK → bookings, nullable)
   - Add: `room_number` (string, nullable)
   - Add: `is_room_charge` (boolean, default: false)

---

## 🔄 Business Rules

1. **Room Status Automation**:
   - Booking Created → Room Status: "Reserved" (if advance booking) or "Occupied" (if walk-in)
   - Check-In → Room Status: "Occupied"
   - Check-Out → Room Status: "Cleaning"
   - Manual: Staff can change to "Available" or "Maintenance"

2. **Booking Rules**:
   - One booking can have multiple rooms
   - Booking number auto-generated: #BOOK{ID}
   - Walk-in bookings can check-in immediately
   - Advance bookings must have check-in date in future

3. **Payment Rules**:
   - Advance payment allowed at booking time
   - Partial payment allowed at check-out
   - Full payment required for final checkout
   - Restaurant room-charge bills included in final invoice

4. **Room Price**:
   - If room has custom price, use that
   - Otherwise, use category base price
   - Price per night × number of nights

5. **Check-In/Check-Out**:
   - Check-in time recorded automatically
   - Check-out time recorded automatically
   - Nights calculated: (check-out date - check-in date)

---

## 📁 Frontend File Structure

```
admin/src/
├── views/
│   └── hotel-room/
│       ├── dashboard/
│       │   └── Dashboard.jsx
│       ├── RoomCategoriesList.jsx
│       ├── RoomsList.jsx
│       ├── BookingsList.jsx
│       ├── CheckInForm.jsx
│       ├── CheckOutForm.jsx
│       ├── LaundryList.jsx
│       ├── settings/
│       │   └── RoomSettings.jsx
│       └── reports/
│           ├── OccupancyReport.jsx
│           ├── RevenueReport.jsx
│           ├── BookingReport.jsx
│           ├── TodayCheckInOutReport.jsx
│           └── RoomUtilizationReport.jsx
│
├── components/
│   └── pages/
│       └── hotel-room/
│           ├── RoomCategoryForm.jsx
│           ├── RoomForm.jsx
│           ├── BookingForm.jsx
│           ├── CheckInForm.jsx
│           ├── CheckOutForm.jsx
│           ├── CheckOutInvoiceModal.jsx
│           ├── LaundryForm.jsx
│           ├── IDDocumentForm.jsx
│           └── PaymentForm.jsx
│
└── services/
    ├── roomService.js
    ├── bookingService.js
    ├── laundryService.js
    └── roomSettingsService.js
```

---

## 🌐 Backend File Structure

```
backend/app/
├── Http/
│   ├── Controllers/
│   │   └── API/
│   │       ├── RoomCategoryController.php
│   │       ├── RoomController.php
│   │       ├── BookingController.php
│   │       ├── LaundryController.php
│   │       └── RoomSettingsController.php
│   │
│   ├── Requests/
│   │   ├── RoomCategoryStoreRequest.php
│   │   ├── RoomCategoryUpdateRequest.php
│   │   ├── RoomStoreRequest.php
│   │   ├── RoomUpdateRequest.php
│   │   ├── BookingStoreRequest.php
│   │   ├── BookingUpdateRequest.php
│   │   ├── CheckInRequest.php
│   │   ├── CheckOutRequest.php
│   │   ├── LaundryStoreRequest.php
│   │   └── LaundryUpdateRequest.php
│   │
│   └── Resources/
│       ├── RoomCategoryResource.php
│       ├── RoomResource.php
│       ├── BookingResource.php
│       └── LaundryResource.php
│
├── Models/
│   ├── RoomCategory.php
│   ├── Room.php
│   ├── Booking.php
│   ├── BookingRoom.php
│   ├── BookingIdDocument.php
│   ├── Laundry.php
│   └── BookingPayment.php
│
└── Services/
    └── InvoiceService.php (extend for room invoices)

backend/database/
└── migrations/
    ├── 2025_XX_XX_000001_create_room_categories_table.php
    ├── 2025_XX_XX_000002_create_rooms_table.php
    ├── 2025_XX_XX_000003_create_bookings_table.php
    ├── 2025_XX_XX_000004_create_booking_rooms_table.php
    ├── 2025_XX_XX_000005_create_booking_id_documents_table.php
    ├── 2025_XX_XX_000006_create_laundry_services_table.php
    ├── 2025_XX_XX_000007_create_booking_payments_table.php
    └── 2025_XX_XX_000008_add_room_charge_fields_to_bills_table.php
```

---

## 🔗 Integration Points

### Restaurant Module Integration

1. **POS Panel Updates**:
   - Add "Charge to Room" toggle/option
   - When enabled, show Booking selector and Room selector
   - Link bill to booking and room
   - Mark bill as "Pending (Room Charge)"

2. **Bills List Updates**:
   - Add filter: "Room Charge" bills
   - Show booking number and room number in bill list
   - Room charge bills appear in booking checkout

3. **API Updates**:
   - `BillController`: Handle `booking_id` and `room_number`
   - `BookingController`: Get pending restaurant bills for booking

---

## 📊 Implementation Priority

### Phase 2.1: Core Room Management (Week 1-2)
1. Room Categories Management
2. Rooms Master Management
3. Basic Booking Management
4. Room Settings

### Phase 2.2: Check-In/Check-Out (Week 3)
1. Check-In Form with ID Documents
2. Check-Out Form
3. Room Status Automation
4. Basic Invoice Generation

### Phase 2.3: Advanced Features (Week 4)
1. Laundry Service Management
2. Restaurant → Room Billing Integration
3. Payment Processing
4. Invoice PDF Export

### Phase 2.4: Dashboard & Reports (Week 5)
1. Dashboard Implementation
2. All Reports (5 report types)
3. PDF/CSV Exports

---

## 🔐 Permissions Required

Already added in `PermissionsTableSeeder.php`:
- `hotel_room_dashboard:read`
- `room:read`, `room:write`, `room:delete`
- `room_type:read`, `room_type:write`, `room_type:delete` (Room Category Management)
- `booking:read`, `booking:write`, `booking:delete`
- `hotel_settings:read`, `hotel_settings:write`
- `occupancy_report:read`
- `revenue_report:read`
- `booking_report:read`

---

## 📝 Routes Structure

```
/hotel-room/
  ├── dashboard
  ├── room-categories
  ├── rooms
  ├── bookings
  ├── check-in
  ├── check-out
  ├── laundry
  ├── settings
  └── reports/
      ├── occupancy
      ├── revenue
      ├── bookings
      ├── today-checkinout
      └── utilization
```

---

## ✅ Success Criteria

1. ✅ All room management modules functional
2. ✅ Booking and check-in/check-out workflow complete
3. ✅ Restaurant room-charge integration working
4. ✅ All reports with PDF/CSV exports
5. ✅ Dashboard with real-time statistics
6. ✅ Room status automation working
7. ✅ Invoice generation with all charges
8. ✅ Payment processing complete

---

**Created**: January 2025  
**Status**: Planning Complete - Ready for Implementation  
**Next Steps**: Begin Phase 2.1 implementation

