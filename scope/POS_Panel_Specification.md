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

### Phase 1: Core Structure
- [ ] Create POS Panel main component
- [ ] Implement split-screen layout
- [ ] Create Tables Panel component
- [ ] Create Products Panel component
- [ ] Create Billing Cart component

### Phase 2: Table Management
- [ ] Table grid/list display
- [ ] Table status indicators
- [ ] Table selection logic
- [ ] Multiple orders per table support
- [ ] Order switching functionality

### Phase 3: Product Selection
- [ ] Category tabs
- [ ] Product grid with cards
- [ ] Search functionality
- [ ] Add to cart functionality
- [ ] Product filtering

### Phase 4: Order Management
- [ ] Order items list
- [ ] Quantity controls
- [ ] Item removal
- [ ] Real-time calculations
- [ ] Draft order auto-save

### Phase 5: Customer Management
- [ ] Quick add customer form
- [ ] Customer search
- [ ] Customer selection
- [ ] Customer display

### Phase 6: Billing & Payment
- [ ] Order summary
- [ ] GST calculation
- [ ] Payment method selection
- [ ] Print bill functionality
- [ ] Payment processing

### Phase 7: Polish & Optimization
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Error handling
- [ ] Loading states
- [ ] Toast notifications

---

## 📝 Notes

- **Compact Design**: All components should prioritize space efficiency
- **Fast Workflow**: Minimize clicks and navigation
- **Auto-Save**: Prevent data loss with frequent auto-saves
- **Error Handling**: Clear error messages for failed operations
- **Accessibility**: Keyboard navigation support (optional for v1)

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Specification Document

