# Orders Management Module

## Overview
The Orders Management module provides comprehensive functionality for managing customer orders in the Photo Studio Management App. It includes order listing, detailed view, status management, and various order operations.

## Components

### OrderDetailsModal
A comprehensive modal component for viewing and managing individual order details.

**Features:**
- Complete order information display
- Order items with product images and details
- Customer information and shipping address
- Order timeline with status progression
- Order summary with pricing breakdown
- Quick actions for order processing
- Status update functionality
- Notes management

**Props:**
- `show` (boolean): Controls modal visibility
- `onHide` (function): Callback when modal is closed
- `orderId` (string): ID of the order to display
- `onOrderUpdate` (function): Callback when order is updated

**Usage:**
```jsx
<OrderDetailsModal
  show={showModal}
  onHide={() => setShowModal(false)}
  orderId={selectedOrderId}
  onOrderUpdate={handleOrderUpdate}
/>
```

## Services

### orderService
Comprehensive service for order-related API operations.

**Key Methods:**
- `getOrders(params)` - Fetch orders with filtering and pagination
- `getOrderById(orderId)` - Get detailed order information
- `updateOrderStatus(orderId, status, notes)` - Update order status
- `updatePaymentStatus(orderId, paymentStatus)` - Update payment status
- `updateShippingInfo(orderId, shippingData)` - Update shipping information
- `cancelOrder(orderId, reason)` - Cancel an order
- `refundOrder(orderId, amount, reason)` - Process refund
- `getOrderStats()` - Get order statistics
- `exportOrders(format, filters)` - Export orders data

**Status Options:**
- Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded

**Payment Status Options:**
- Pending, Paid, Failed, Refunded, Partial

## Mock Data Structure

### Order Object
```javascript
{
  id: "12345",
  orderNumber: "#12345",
  customerId: 2,
  customer: {
    id: 2,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+64 21 123 4567",
    avatar: "https://..."
  },
  items: [
    {
      id: 1,
      productId: 1,
      productName: "Fresh Organic Apples",
      productImage: "https://...",
      quantity: 2,
      unitPrice: 2.49,
      totalPrice: 4.98,
      description: "1 kg"
    }
  ],
  subtotal: 8.97,
  shipping: 5.99,
  tax: 2.15,
  total: 17.11,
  commission: 1.71,
  commissionRate: 0.10,
  status: "processing",
  paymentStatus: "paid",
  paymentMethod: "credit_card",
  shippingMethod: "express",
  shippingAddress: {
    street: "123 Queen Street",
    city: "Auckland CBD",
    state: "Auckland",
    postalCode: "1010",
    country: "New Zealand"
  },
  orderDate: "2024-01-15T10:30:00Z",
  timeline: [...]
}
```

## Features

### Order Management
- **Order Listing**: Paginated table with filtering and search
- **Order Details**: Comprehensive modal view with all order information
- **Status Management**: Update order status with notes
- **Quick Actions**: Process, ship, and contact customer actions
- **Timeline Tracking**: Visual order progression timeline

### Statistics Dashboard
- **Total Orders**: Count of all orders
- **Pending Orders**: Orders awaiting processing
- **Processing Orders**: Orders currently being prepared
- **Total Revenue**: Sum of all order values

### Filtering & Search
- **Order ID Search**: Find orders by ID
- **Customer Search**: Filter by customer name
- **Status Filter**: Filter by order status
- **Date Range**: Filter by order date
- **Payment Status**: Filter by payment status

### Export Functionality
- **Export Orders**: Download order data in various formats
- **Print Options**: Print invoices and receipts
- **Email Integration**: Send order confirmations and updates

## Integration

### Navigation
The orders module is integrated into the main navigation under "Order Management" section:
- Orders (`/orders`) - Main orders listing page
- Order History (`/order-history`) - Historical order data

### Routes
- `/orders` - OrdersList component
- `/orders/:id` - Order details (handled by modal)

### API Endpoints
All order-related endpoints are defined in `constants/api.js` under the `ORDERS` section:
- `/orders` - List orders
- `/orders/:id` - Get order details
- `/orders/:id/status` - Update order status
- `/orders/stats` - Get order statistics
- And many more...

## Styling

### Theme Integration
- Uses project's green theme (`text-success`, `border-success`)
- Bootstrap components with custom styling
- Gradient cards for statistics
- Consistent spacing and typography

### Responsive Design
- Mobile-first approach
- Responsive table with horizontal scroll
- Adaptive modal sizing
- Touch-friendly interface elements

## Development Guidelines

### Component Structure
- Follows project's component organization rules
- Uses React Bootstrap for UI components
- Implements proper error handling and loading states
- Follows naming conventions and file structure

### State Management
- Local state for component-specific data
- Service layer for API interactions
- Proper error handling and user feedback
- Loading states for better UX

### Code Quality
- ESLint compliance
- Proper prop validation
- Meaningful variable names
- Consistent code formatting
- Comprehensive error handling

## Future Enhancements

### Planned Features
- Bulk order operations
- Advanced filtering options
- Order analytics and reporting
- Customer communication tools
- Inventory integration
- Automated status updates
- Order templates
- Recurring orders support

### Performance Optimizations
- Virtual scrolling for large order lists
- Lazy loading of order details
- Caching strategies
- Optimized API calls
- Bundle size optimization
