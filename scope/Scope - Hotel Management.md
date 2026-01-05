# ![][image1]

# [www.codexaatech.com](http://www.codexaatech.com) | \+91 79841 80649

# **PROJECT SCOPE – PHASE 1 (MVP)**

**TEJA HOTEL – RESTAURANT MANAGEMENT (WEB-APP)**

Below is a clean, professional SCOPE document (Phase-1 / MVP) for Teja Hotel – Restaurant Management Web Application.

# **SCOPE FEATURES (WHAT WE WILL BUILD)**

---

## **1\. User & Access Management**

* Login / Logout  
* Role-based access:  
  * Admin  
  * Manager  
  * Cashier

## **2\. Restaurant & Settings**

* Restaurant profile Settings  
* Invoice Settings  
* Default GST settings  
* Thermal printer settings (80mm)

## **3\. Food & Menu Management**

### **3.1 Food Categories**

* Create / Edit / Disable categories  
* Display order  
* Category-wise reports

  ### **3.2 Food Items**

* Item name  
* Category  
* Price  
* GST %  
* Veg / Non-Veg  
* Active / Inactive  
* Item-wise GST support

## **4\. Table Management (Dine-In)**

* Create tables (T1, T2, Family Table, etc.)  
* Table capacity  
* Active / Inactive  
* Table status:  
  * Available  
  * Occupied  
* **Multiple bills allowed per table**

## **5\. Customer Management (Optional Use)**

* Walk-in customers (default, no record)  
* Registered customers  
* Customer types:  
  * Regular  
  * Credit (Udhar)  
* Customer profile:  
  * Name  
  * Mobile  
  * Address (optional)

## **6\. Billing / POS Module (Core)**

### **6.1 Bill Creation**

* Create bill with or without table  
* Add multiple items  
* Quantity support  
* Automatic calculation

  ### **6.2 Payment Handling**

* Cash  
* UPI  
* Card  
* Split payment  
* Partial payment (only for registered customers)

  ### **6.3 Udhar / Pending Bills**

* Pending amount stored against customer  
* Customer ledger maintained  
* End-time or year-end settlement supported

  ### **6.4 Invoice**

* GST-compliant invoice  
* CGST / SGST breakup  
* Thermal printer output  
* English language only

# **7\. Staff & Salary Management (Minimal Version)**

### **🎯 Purpose**

* Track restaurant staff  
* Record monthly salary payments  
* Simple reporting (no HR complexity)

  ## **7.1 Staff Management**

  ### **Staff Master**

  **Fields**  
* Staff ID  
* Name  
* Mobile Number  
* Department (Cook, Helper, Cleaner, Cashier)  
* Salary Type:  
  * Monthly  
  * Daily  
* Salary Amount  
* Joining Date  
* Document Info (Optional \- Multiline)  
* Status (Active / Inactive)  
* Restaurant ID

  ## **7.2 Salary Payment Management**

  ### **Salary Records**

  **Fields**  
* Salary ID  
* Staff ID  
* Month & Year  
* Payable Amount  
* Paid Amount (Editable)  
* Payment Date  
* Payment Mode (Cash / UPI / Bank)  
* Notes (optional \- Multiline)  
* Restaurant ID

  ### **Rules**

* Partial payment allowed  
* Salary expense auto-linked to expenses report

# **8\. Expense Management Module**

### **🎯 Purpose**

Track **non-food, non-salary** daily expenses  
(example: Electricity, Cleaning, etc)

## **8.1 Expense Category Management**

**Fields**

* Category ID  
* Category Name (Electricity, Cleaning, etc)  
* Status (Active / Inactive)  
* Restaurant ID  
  **8.2 Expense Records**  
  **Fields**  
* Expense ID  
* Expense Category ID  
* Amount  
* Expense Date  
* Payment Mode (Cash / UPI / Bank)  
* Description / Notes  
* Restaurant ID

## **9\. Minimal Reports List (Phase-1)**

* Sales report (Daily, Monthly, Year)  
  * Expenses report(Daily, Monthly, Year)  
  * GST Summary Report  
  * Customer Pending (Udhar) Report  
  * Customer Details \- Ledger Report  
  * Staff and salary report  
  * Business Financial Dashboard

---

# **🏁 PHASE-1 MODULE LIST**

* Login  
* User & Role Management  
* Restaurant Settings  
* Food Categories & Items  
* Table Management  
* Customer & Udhar Management  
* POS Billing & GST  
* **Staff & Salary Management** ✅  
* **Expense Management** ✅  
* Reports  
  * Sales report (Daily, Monthly, Year)  
  * Expenses report(Daily, Monthly, Year)  
  * GST Summary Report  
  * Customer Pending (Udhar) Report  
  * Customer Details \- Ledger Report  
  * Staff and salary report  
  * Business Financial Dashboard

---

# **🔒 FIXED BUSINESS RULES (IMPORTANT)**

* Walk-in customers → **Full payment mandatory**  
* Udhar → **Only registered customers**  
* Table can have **multiple bills**  
* GST calculated:  
  * On total bill (default)  
  * Item-wise supported  
* Invoice cannot be edited after closing

# 

# 

# 

# 

# 

# **PROJECT SCOPE – PHASE 2 (MVP)**

**TEJA HOTEL – ROOM MANAGEMENT (WEB-APP)**

Below is a clean, professional SCOPE document (Phase-2 / MVP) for Teja Hotel – Room Management Web Application.

# **SCOPE FEATURES (WHAT WE WILL BUILD)**

---

1. ## **HOTEL ROOMS MANAGEMENT**

   ### **1.1 Room Categories**

* Create / Edit / Delete Room Categories  
* Category details:  
  * Category Name  
  * Description  
  * Base Price (Per Night)  
  * Max Adults & Children  
  * Status (Active / Inactive)

  ### **1.2 Rooms Master**

* Manage individual hotel rooms  
* Fields:  
  * Room Number / Code  
  * Room Category  
  * Floor No  
  * Bed Type (example: Single / Double / King)  
  * Max Occupancy  
  * Room Price (Category price override)  
  * Room Status (Available / Occupied / Cleaning / Maintenance)  
  * Notes  
    

2. ## **HOTEL BOOKING & CHECK-IN**

   ### **2.1 Booking Management**

* One guest can book **multiple rooms** under **one booking**  
* Booking Types:  
  * Walk-in  
  * Advance Booking, Online Booking  
    **Booking (Parent)**  
* Guest Name  
* Mobile Number  
* Address  
* Booking Type  
* Check-In Date & Time  
* Expected Check-Out Date & Time  
* Total Rooms  
* Booking Status (Booked / Checked-In / Checked-Out / Cancelled)

  **Booking Rooms (Child)**

* Room Number  
* Adults / Children  
* Price Per Night  
* Room Status

  ### **2.2 Check-In Form**

* Assign multiple rooms in one booking  
* Add **multiple ID documents**  
  * Document Type (Aadhar, PAN, Passport, Driving License)  
  * Document Number  
  * Guest Name  
  * File Upload (Optional)  
* Auto room status update to **Occupied**


3. ## **Laundry Service ADD-ON**

* Laundry service linked with booking  
* Multiple laundry entries allowed per booking  
* Fields:  
  * Item Type  
  * Quantity  
  * Rate  
  * Amount  
  * Date  
  * Status (Given / Returned)  
* Laundry charges added to final invoice

4. ## **RESTAURANT MANAGEMENT**

### **Restaurant → Room Billing Integration**

* Restaurant orders can be charged to room  
* Order linked with:  
  * Booking ID  
  * Room Number  
* Payment Status:  
  * Paid  
  * Pending (Added to Room Bill)

## 

5. ## **BILLING & INVOICING**

   ### **5.1 Combined Billing**

   At checkout, system generates **ONE FINAL INVOICE** including:  
* Room Rent (Multiple Rooms)  
* Food Add-Ons  
* Laundry Charges  
* Restaurant Room-Charge Orders  
* Extra Charges  
* Discount  
* GST (Optional)

  ### **5.2 Payments**

* Advance Payment  
* Partial Payment  
* Full Payment  
* Payment Modes: (Manual Entry)  
  * Cash  
  * UPI  
  * Card  
    

6. ## **ROOM STATUS AUTOMATION BY SYSTEM**

* Check-In → Occupied  
* Check-Out → Cleaning  
* Cleaning Completed → Available  
* Manual override allowed by Staff Admin


7. ## **REPORTS (MINIMAL & USEFUL)**

* Today Check-In and Today Check-Out Report  
* Room Occupancy Report / Available Rooms Report  
* Booking & Invoice Report (Monthly/Yearly)  
* Other reports


8. ## **USER & ROLE MANAGEMENT**

* Role-based permissions for pages (Utilize from phase-1)

9. ## **SYSTEM FEATURES**

* Single Invoice per Booking  
* Multi-Room Booking  
* Multi-ID Document Support  
* Restaurant \+ Room Combined Billing  
* Clean, hotel-friendly workflow

---

# **🏁 PHASE-2 MODULE LIST**

* Room Categories  
* Rooms Master  
* Booking & Check-In  
* Laundry Management  
* Restaurant POS Update  
* Restaurant → Room Billing   
* Invoicing  
* Reports  
* Settings Update  
* User & Roles Update

[image1]: <data:image/png;base64,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>