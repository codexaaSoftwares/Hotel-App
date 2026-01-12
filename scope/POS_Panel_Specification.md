# POS Panel Specification - Restaurant Management

## 📋 Overview

The POS (Point of Sale) Panel is the core billing interface for restaurant operations. It provides a streamlined, efficient workflow for taking orders, managing tables, adding customers, and processing payments.

**Purpose**: Fast, intuitive order management and billing system for restaurant staff.

---

## 🎯 Key Features

### 1. **Table Management**
- Display all restaurant tables in a grid/list view
- Real-time table status indicators
- Support multiple orders per table
- Draft order saving
- Quick table selection and switching

### 2. **Product Selection**
- Products organized by categories
- Quick add to cart functionality
- Compact product display for large menus
- Search and filter capabilities

### 3. **Order Management**
- Multiple orders per table support
- Draft order auto-save
- Order switching and merging capabilities
- Real-time order calculations

### 4. **Customer Management**
- Quick customer add (name + mobile)
- Search existing customers (by name or mobile)
- Customer selection for orders
- Walk-in customer (default)

### 5. **Billing & Payment**
- Real-time bill calculation
- GST breakdown display
- Print bill before payment
- Multiple payment methods
- Split payment support
- Partial payment (for credit customers)

---

## 🖥️ UI Layout - Split Screen Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    POS Panel Header                              │
│  [Current Table: T1] [Order #: ORD001] [Time: 10:30 AM]         │
└─────────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────┬──────────────────────┐
│              │                          │                      │
│   TABLES     │      PRODUCTS             │    BILLING CART      │
│   PANEL      │      PANEL                │    PANEL             │
│   (Left)     │      (Center)             │    (Right)           │
│              │                          │                      │
│  [Table Grid]│  [Category Tabs]         │  [Order Items]       │
│              │  [Product Grid]           │  [Customer Section]  │
│              │                          │  [Order Summary]     │
│              │                          │  [Payment Section]   │
│              │                          │                      │
│  30% width   │      40% width           │    30% width         │
└──────────────┴──────────────────────────┴──────────────────────┘
```

### Responsive Breakpoints

- **Desktop (> 1200px)**: Full split-screen layout
- **Tablet (768px - 1200px)**: Adjustable panels, stack on small screens
- **Mobile (< 768px)**: Stacked layout with tabs/accordion

---

## 📦 Component Structure

### 1. **Tables Panel (Left - 30% width)**

#### Component: `TablesPanel`
- **Purpose**: Display all restaurant tables with status
- **Layout**: Compact grid/list view
- **Features**:
  - Table cards showing:
    - Table number/name
    - Table capacity
    - Current status (Available/Occupied/Cleaning)
    - Active order count (if multiple orders)
    - Total amount (if orders exist)
  - Color-coded status indicators
  - Click to select table and load orders

#### Table Card States:
- **Available** (Green): No active orders, click to create new
- **Occupied** (Orange): Has active order(s), click to view/edit
- **Cleaning** (Gray): Table being cleaned, disabled

#### Table Card Actions:
- Click table → Load existing orders or show "Create New Order" button
- Right-click → Quick actions menu (if needed)

---

### 2. **Products Panel (Center - 40% width)**

#### Component: `ProductsPanel`
- **Purpose**: Display products by categories for quick selection
- **Layout**: Category tabs + Product grid

#### Sub-components:

##### A. CategoryTabs
- Horizontal scrollable tabs at top
- Active category highlighted
- Show product count per category
- Compact design

##### B. ProductGrid
- Grid layout (3-4 columns on desktop, 2 on tablet)
- Compact product cards
- Infinite scroll or pagination for large menus

##### C. ProductCard
- **Display**:
  - Product image (thumbnail, optional)
  - Product name (truncated if long)
  - Price (prominent)
  - Veg/Non-Veg indicator (icon)
  - Quick "Add" button
- **Actions**:
  - Click card → Add to current order
  - Hover → Show full details tooltip

##### D. SearchBar
- Quick search at top of products panel
- Filter by product name
- Clear search button

---

### 3. **Billing Cart Panel (Right - 30% width)**

#### Component: `BillingCart`
- **Purpose**: Manage current order, customer, and payment
- **Layout**: Vertical scrollable sections

#### Sub-components:

##### A. OrderItemsList
- **Display**: List of items in current order
- **Item Row**:
  - Product name
  - Quantity controls (+ / - / input)
  - Unit price
  - Total price
  - Remove button (X)
- **Features**:
  - Compact row height
  - Quick quantity adjustment
  - Auto-calculate totals
  - Scrollable if many items

##### B. CustomerSection
- **Quick Add Customer**:
  - Name input
  - Mobile input
  - "Add Customer" button
- **Search Existing Customer**:
  - Search input (name or mobile)
  - Dropdown results
  - Select customer
  - "Walk-in" button (default)
- **Selected Customer Display**:
  - Customer name
  - Mobile number
  - Customer type (Regular/Credit)
  - Change customer button

##### C. OrderSummary
- **Display**:
  - Subtotal
  - GST breakdown (CGST/SGST or IGST)
  - Discount (if any)
  - **Grand Total** (prominent)
- **Compact design** with clear hierarchy

##### D. PaymentSection
- **Payment Methods**:
  - Cash (default)
  - UPI
  - Card
  - Split Payment (checkbox)
- **Payment Amount**:
  - Full amount (auto-filled)
  - Partial amount input (for credit customers)
- **Action Buttons**:
  - **Print Bill** (before payment)
  - **Save Draft** (save order without payment)
  - **Process Payment** (final payment)

---

## 🔄 Workflow & User Flows

### Flow 1: New Order (Empty Table)

1. **Select Table** (from Tables Panel)
   - Click on "Available" table
   - System shows "Create New Order" button
   - Click button → New order created

2. **Add Products** (from Products Panel)
   - Select category tab
   - Click product card → Item added to cart
   - Or search and add

3. **Manage Order** (in Billing Cart)
   - Adjust quantities
   - Remove items if needed
   - Order auto-saves as draft

4. **Add Customer** (optional)
   - Quick add: Enter name + mobile → Add
   - Or search existing customer → Select
   - Or leave as "Walk-in"

5. **Process Order**
   - **Option A**: Print Bill → Customer reviews → Process Payment
   - **Option B**: Save Draft → Continue later
   - **Option C**: Process Payment directly

### Flow 2: Existing Order (Occupied Table)

1. **Select Table** (from Tables Panel)
   - Click on "Occupied" table
   - System loads existing order(s)

2. **View Multiple Orders** (if table has multiple orders)
   - Order selector dropdown
   - Switch between orders
   - Or create new order for same table

3. **Edit Order**
   - Add more items
   - Modify quantities
   - Remove items
   - Changes auto-save

4. **Process Payment**
   - Same as Flow 1, Step 5

### Flow 3: Multiple Orders on Single Table

1. **Table has Order #1 active**
2. **Create Order #2**:
   - Click "New Order" button (while Order #1 is active)
   - New order created, Order #1 saved as draft
   - Switch between orders via dropdown
3. **Manage Both Orders**:
   - Switch orders to add items
   - Each order independent
   - Can process payment for any order separately

---

## 💾 Data Structure

### Order Object
```javascript
{
  id: "ORD001",
  tableId: 1,
  tableName: "T1",
  customerId: null, // or customer ID
  customerName: "Walk-in", // or customer name
  customerMobile: null,
  items: [
    {
      productId: 1,
      productName: "Pizza Margherita",
      quantity: 2,
      unitPrice: 250,
      totalPrice: 500,
      gst: 18,
      gstAmount: 90
    }
  ],
  subtotal: 500,
  gstAmount: 90,
  discount: 0,
  total: 590,
  status: "draft", // draft, pending, paid, cancelled
  createdAt: "2025-01-15T10:30:00Z",
  updatedAt: "2025-01-15T10:35:00Z"
}
```

### Table Object
```javascript
{
  id: 1,
  name: "T1",
  capacity: 4,
  status: "occupied", // available, occupied, cleaning
  activeOrders: [1, 2], // Order IDs
  currentOrderId: 1 // Currently selected order
}
```

---

## 🎨 UI/UX Guidelines

### Design Principles

1. **Compact & Efficient**
   - Minimal padding/margins
   - Small font sizes where appropriate
   - Dense information display
   - Maximum items visible without scrolling

2. **Fast & Intuitive**
   - Large clickable areas
   - Clear visual hierarchy
   - Color-coded status indicators
   - Keyboard shortcuts (optional)

3. **Responsive**
   - Tablet-friendly touch targets
   - Adjustable panel widths
   - Stack on mobile devices

### Color Scheme

- **Available Table**: Green (#10b981)
- **Occupied Table**: Orange (#f59e0b)
- **Cleaning Table**: Gray (#6b7280)
- **Selected Table**: Teal (#0d9488)
- **Veg Indicator**: Green
- **Non-Veg Indicator**: Red
- **Active Category**: Teal background
- **Order Total**: Bold, large font

### Typography

- **Table Names**: 14px, bold
- **Product Names**: 13px, regular
- **Prices**: 14px, bold
- **Order Total**: 18px, extra bold
- **Labels**: 12px, medium

---

## 🔧 Technical Requirements

### State Management

- **Current Table**: Selected table ID
- **Current Order**: Active order object
- **Order List**: All orders for current table
- **Cart Items**: Items in current order
- **Selected Customer**: Customer object
- **Payment Method**: Selected payment type

### Auto-Save Functionality

- **Draft Orders**: Auto-save every 30 seconds
- **Manual Save**: "Save Draft" button
- **On Table Switch**: Auto-save current order
- **On Order Switch**: Auto-save previous order

### Calculations

- **Real-time Updates**: Recalculate on every change
- **GST Calculation**: Item-wise or bill-wise (configurable)
- **Discount Application**: Before or after GST (configurable)

### Print Functionality

- **Print Bill**: Generate printable invoice
- **Format**: Thermal printer compatible (80mm)
- **Content**: Order details, items, totals, GST breakdown
- **No Payment Info**: Print before payment processing

---

## 📱 Responsive Design

### Desktop (> 1200px)
- Full split-screen: 30% | 40% | 30%
- All panels visible
- Hover effects enabled

### Tablet (768px - 1200px)
- Adjustable panel widths
- Touch-friendly buttons
- Collapsible panels option
- 2-column product grid

### Mobile (< 768px)
- Stacked layout
- Tab navigation between panels
- Full-width sections
- Bottom sheet for cart
- 1-column product grid

---

## 🚀 Performance Considerations

1. **Lazy Loading**: Load products by category on demand
2. **Virtual Scrolling**: For large product lists
3. **Debounced Search**: Search input debouncing
4. **Optimistic Updates**: Immediate UI updates, sync in background
5. **Caching**: Cache product data and table status

---

## 🔐 Business Rules

1. **Multiple Orders per Table**: ✅ Allowed
2. **Draft Orders**: Auto-save, can be resumed later
3. **Order Editing**: Allowed until payment processed
4. **Payment**: Full payment mandatory for walk-in customers
5. **Partial Payment**: Only for registered credit customers
6. **Print Bill**: Available before payment
7. **Order Status**: draft → pending → paid

---

## 📋 Implementation Checklist

### Phase 1: Core Structure ✅ COMPLETE
- [x] Create POS Panel main component
- [x] Implement split-screen layout (responsive: md/lg/xl breakpoints)
- [x] Create Tables Panel component (compact list view)
- [x] Create Products Panel component (category tabs + product grid)
- [x] Create Billing Cart component (order items + customer + payment)

### Phase 2: Table Management 🟡 PARTIAL
- [x] Table list display (compact row-based layout)
- [x] Table status indicators (colored dots)
- [x] Table selection logic
- [x] Visual enhancements (borders, shadows, hover effects)
- [x] Active orders count display
- [x] Total amount display for active bills
- [x] API integration with bill information
- [ ] Multiple orders per table support (UI ready, backend pending)
- [ ] Order switching functionality (pending)

### Phase 3: Product Selection ✅ COMPLETE
- [x] Expandable category sections (accordion style)
- [x] All categories expanded by default
- [x] Popular items section (with star icon)
- [x] Horizontal product card layout (Image | Name/Price | Button)
- [x] Fixed-width cards (31% - 3 columns per row)
- [x] Wrapping grid layout
- [x] Search functionality (debounced, frontend-only)
- [x] Search results grouped by category
- [x] Add to cart functionality
- [x] Product filtering by category
- [x] Veg/Non-Veg indicators (V/NV badges)
- [x] Product images support (50x50px square)
- [x] Combined POS Menu API integration

### Phase 4: Order Management 🟡 PARTIAL
- [x] Order items list (in cart)
- [x] Quantity controls (+ / - / input)
- [x] Item removal
- [x] Real-time calculations (subtotal, total - GST pending)
- [ ] Draft order auto-save (pending)
- [ ] Load existing orders (pending)

### Phase 5: Customer Management ✅ COMPLETE
- [x] Quick add customer form (name + mobile)
- [x] Customer search (debounced, dropdown results)
- [x] Customer selection
- [x] Customer display (with type badge)
- [x] Walk-in customer option
- [x] API integration

### Phase 6: Billing & Payment 🟡 PARTIAL
- [x] Order summary (subtotal, total - GST calculation pending)
- [ ] GST calculation (item-wise/bill-wise - pending)
- [x] Payment method selection (UI complete)
- [x] Split payment toggle (UI complete)
- [ ] Print bill functionality (pending)
- [ ] Payment processing (pending - backend API needed)

### Phase 7: Polish & Optimization ✅ COMPLETE
- [x] Responsive design (md/lg/xl breakpoints)
- [x] Error handling (toast notifications)
- [x] Loading states (spinners)
- [x] Toast notifications
- [x] Dark mode support (CSS)
- [ ] Performance optimization (lazy loading, caching - pending)

---

## 📝 Notes

- **Compact Design**: All components should prioritize space efficiency
- **Fast Workflow**: Minimize clicks and navigation
- **Auto-Save**: Prevent data loss with frequent auto-saves
- **Error Handling**: Clear error messages for failed operations
- **Accessibility**: Keyboard navigation support (optional for v1)

---

---

## 📊 Implementation Status

### ✅ Completed (Frontend - Phase 1)

#### 1. **Main POS Panel Structure**
- ✅ Main POS Panel component (`POSPanel.jsx`) created
- ✅ Split-screen layout implemented (Tables | Products | Billing Cart)
- ✅ Responsive breakpoints configured:
  - Tables Panel: `md={3} lg={2} xl={2}` (compact, ~15-20% width)
  - Products Panel: `md={5} lg={6} xl={6}` (flexible, ~40-50% width)
  - Billing Cart: `md={4} lg={4} xl={4}` (balanced, ~30-40% width)
- ✅ Header with table info, order number, and live clock
- ✅ State management for table, order, cart, customer, payment
- ✅ Route configured at `/pos/panel`
- ✅ Permission-based access control (`create_bill` permission)

#### 2. **Tables Panel Component**
- ✅ Compact list view (not card grid)
- ✅ Simple row-based layout with minimal spacing
- ✅ Status indicators (colored dots: green=available, orange=occupied, etc.)
- ✅ Visual enhancements:
  - Left border (3px teal) for selected table
  - Bottom border (1px gray) for row separation
  - Box shadow on selected/hover states
  - Hover effects with background color change
- ✅ Displays active orders count badge
- ✅ Displays total amount for active bills
- ✅ Disabled state for cleaning/maintenance tables
- ✅ API integration with `include_bills` parameter
- ✅ Auto-refresh on component mount

#### 3. **Products Panel Component**
- ✅ Expandable category sections (accordion style)
- ✅ All categories expanded by default
- ✅ Popular items section at the top (with star icon)
- ✅ Horizontal product card layout:
  - Image (50x50px square) on left
  - Name and price in middle section
  - Add button on right
- ✅ Fixed-width cards: `calc(31.00% - 4px)` (3 columns per row)
- ✅ Wrapping grid layout (flex-wrap)
- ✅ Search functionality (debounced, frontend-only)
- ✅ Search results grouped by category
- ✅ Veg/Non-Veg indicators (V/NV badges)
- ✅ Add to cart functionality
- ✅ Compact design (~60px card height)
- ✅ Hover effects and visual feedback

#### 4. **Billing Cart Panel Component**
- ✅ Order items list with quantity controls
- ✅ Customer section:
  - Quick add customer (name + mobile)
  - Search existing customers
  - Walk-in customer option
- ✅ Order summary with totals
- ✅ Payment method selection
- ✅ Split payment toggle
- ✅ Action buttons (Print, Save Draft, Process Payment)

#### 5. **Backend API Enhancements**
- ✅ Table listing API enhanced (`GET /api/tables`)
  - Added `include_bills` query parameter
  - Returns `active_orders_count`, `total_orders_count`, `active_bills_total`
  - Returns `active_bills` array with bill details
- ✅ Table model relationships added:
  - `bills()` - All bills for table
  - `activeBills()` - Draft/pending bills only
- ✅ Bill model relationship added:
  - `table()` - Belongs to Table
- ✅ POS Menu API created (`GET /api/pos-menu`)
  - Combined endpoint for POS Panel
  - Returns both categories hierarchy and popular items in single response
  - Optional `popular_limit` parameter (default: 20)
  - Reduces API calls from 2 to 1 (better performance)

#### 6. **Permissions & Access Control**
- ✅ Bill permissions added to seeders:
  - `view_bill`, `create_bill`, `edit_bill`, `delete_bill`
  - `bill_payment`, `view_pending_bill`, `create_pending_bill`
- ✅ Permissions assigned to roles:
  - Manager: Full bill permissions
  - Staff: Limited bill permissions (view, create, edit, payment)
- ✅ Permission alias mappings added to `authService.js`

### 🟡 In Progress / Pending

#### 1. **State Management & Order Handling**
- ⏳ Load existing orders when table is selected
- ⏳ Multiple orders per table support
- ⏳ Order switching functionality
- ⏳ Draft order auto-save (every 30 seconds)
- ⏳ Manual save draft functionality

#### 2. **GST Calculation**
- ⏳ Item-wise GST calculation
- ⏳ Bill-wise GST calculation
- ⏳ Integration with restaurant settings (GST percentage, calculation method)
- ⏳ Real-time GST updates in order summary

#### 3. **Bill/Order Management**
- ⏳ Create bill API integration
- ⏳ Update bill API integration
- ⏳ Bill number auto-generation
- ⏳ Bill status management (draft → pending → paid)
- ⏳ Payment status calculation

#### 4. **Payment Processing**
- ⏳ Process payment API integration
- ⏳ Payment method handling (cash, UPI, card, split)
- ⏳ Partial payment support (for credit customers)
- ⏳ Payment validation
- ⏳ Update customer stats after payment

#### 5. **Print Functionality**
- ⏳ Print bill feature
- ⏳ Thermal printer integration
- ⏳ Bill template design
- ⏳ Print before payment option

#### 6. **Backend APIs (To Be Created)**
- ⏳ `POST /api/bills` - Create new bill
- ⏳ `GET /api/bills` - List bills (with filters)
- ⏳ `GET /api/bills/{bill}` - Get bill details
- ⏳ `PUT /api/bills/{bill}` - Update bill
- ⏳ `DELETE /api/bills/{bill}` - Delete bill
- ⏳ `GET /api/bills/table/{tableId}` - Get bills for table
- ⏳ `POST /api/bills/{bill}/process-payment` - Process payment

### 📝 Technical Notes

#### Current Implementation Details
- **Frontend Framework**: React 19 with React Bootstrap
- **State Management**: React useState hooks (local state)
- **API Client**: Axios with custom apiClient configuration
- **Styling**: Bootstrap + Custom SCSS with dark mode support
- **Icons**: FontAwesome (free solid icons)
- **Responsive Design**: Bootstrap breakpoints (md, lg, xl)

#### UI Design Decisions
- **Compact Layout**: Prioritized space efficiency for POS workflow
- **List View**: Simple row-based table list (not cards) for better density
- **Visual Feedback**: Left border + shadow for selected state
- **Status Indicators**: Colored dots for quick status recognition
- **Minimal Padding**: Reduced spacing throughout for maximum content visibility
- **Product Cards**: Horizontal layout (Image | Name/Price | Button) for space efficiency
- **Fixed Width Cards**: 31% width (3 columns) for uniform appearance
- **Expandable Sections**: All categories expanded by default for quick access
- **Popular Items**: Dedicated section at top with star icon indicator

#### API Integration Status
- ✅ Tables API: Fully integrated with bill information
- ✅ POS Menu API: Fully integrated (combined categories + popular items)
  - Single endpoint: `GET /api/pos-menu`
  - Returns: `{ categories: [...], popular_items: [...] }`
  - Frontend service: `getPOSMenu()` function
- ✅ Customer API: Fully integrated (search + quick add)
- ⏳ Bills API: Pending (needs backend implementation)
- ⏳ Payment API: Pending (needs backend implementation)

---

**Last Updated**: January 2025  
**Version**: 1.2.0 (Products Panel Enhanced - Horizontal Cards & Combined API)  
**Status**: In Development - Frontend UI Complete, Backend APIs Pending

### Recent Updates (v1.2.0)
- ✅ Enhanced Products Panel with expandable categories
- ✅ Added Popular items section at top
- ✅ Implemented horizontal product card layout (Image | Name/Price | Button)
- ✅ Fixed-width cards (31% - 3 columns) for uniform appearance
- ✅ Created combined `/pos-menu` API endpoint (categories + popular items)
- ✅ Optimized API calls (reduced from 2 to 1 request)
- ✅ Improved space efficiency with compact horizontal card design

