# Customer Management Components

This directory contains the customer management components for the Photo Studio Management App.

## Components

### CustomerDetailsModal.jsx
A comprehensive modal component that displays detailed information about a customer with tabbed interface.

**Features:**
- **Information Tab:**
  - Customer profile with avatar (initials)
  - Financial summary (Total, Paid, Remaining amounts)
  - Contact information (mobile, email, address)
  - Branch information
  - Personal details (DOB, Anniversary)
  - Registration date and total orders
  - Account status with color-coded badges

- **Orders Tab:**
  - Complete list of customer orders
  - Order details: Order number, date, package, amount, status, payment status
  - Loading states and empty states

- **Transactions Tab:**
  - Complete transaction history
  - Transaction details: Date, type (credit/debit), description, amount, balance
  - Color-coded transaction types
  - Order references where applicable

- **Props:**
  - `visible` (boolean): Controls modal visibility
  - `onClose` (function): Callback when modal is closed
  - `customer` (object): Customer data to display

**Data Loading:**
- Automatically loads orders when modal opens
- Automatically loads transactions when modal opens
- Uses `orderService.getOrdersByCustomer()`
- Uses `transactionService.getTransactionsByCustomer()`

### CustomerForm.jsx
Form component for creating and editing customers.

**Features:**
- Customer name and mobile (required)
- Email (optional)
- Address (optional)
- Date of Birth and Anniversary Date
- Branch selection (required)
- Status selection
- Form validation
- Supports both create and edit modes

**Props:**
- `mode` ('create' | 'edit'): Form mode
- `customerData` (object): Customer data for edit mode
- `branches` (array): List of branches for dropdown
- `onSubmit` (function): Callback when form is submitted
- `onCancel` (function): Callback when form is cancelled
- `loading` (boolean): Loading state

## Usage

### CustomerDetailsModal
```jsx
import CustomerDetailsModal from './components/pages/customers/CustomerDetailsModal'

<CustomerDetailsModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  customer={selectedCustomer}
/>
```

### CustomerForm
```jsx
import CustomerForm from './components/pages/customers/CustomerForm'

<CustomerForm
  ref={formRef}
  mode="create"
  branches={branches}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

## Styling

The components follow the project's design guidelines:
- Purple/Violet theme colors (`text-primary`, `border-primary`)
- Bootstrap classes with custom enhancements
- Consistent spacing and typography
- Responsive design
- Clean layout without nested cards
- Tabbed interface for better organization

## Dependencies

- React Bootstrap for UI components
- FontAwesome for icons
- React hooks for state management
- Form validation and error handling
- Custom Table component for data display
- Order and Transaction services for data fetching

## Data Structure

### Customer Object
```javascript
{
  id: number,
  customerId: string, // e.g., "#CUST001"
  name: string,
  firstName: string,
  lastName: string,
  email: string,
  mobile: string,
  phone: string,
  address: {
    street: string,
    city: string,
    state: string,
    postalCode: string,
    country: string
  },
  branch_id: number,
  branch_name: string,
  branch_code: string,
  status: 'active' | 'suspended' | 'pending' | 'inactive',
  totalOrders: number,
  total_orders: number,
  totalSpent: number,
  total_amount: number,
  total_earnings: number,
  paid_amount: number,
  remaining_amount: number,
  wallet_balance: number,
  dob: string, // ISO date string
  anniversary_date: string, // ISO date string
  joinedDate: string, // ISO date string
  created_at: string // ISO date string
}
```

## Integration

These components are integrated with:
- Customer service API layer
- Order service for fetching customer orders
- Transaction service for fetching customer transactions
- Mock data for development
- Main customer list view (CustomersList.jsx)
- FormModal component for modal-based add/edit
- Navigation system
- Routing configuration
