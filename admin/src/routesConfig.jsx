// Routes configuration for breadcrumbs and navigation
const routesConfig = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard' },
  
  // User Management Routes
  { path: '/users', name: 'Users' },
  { path: '/users/create', name: 'Create User' },
  { path: '/users/edit/:id', name: 'Edit User' },
  { path: '/users/:id', name: 'User Details' },
  
  // Role Management Routes
  { path: '/roles', name: 'Roles' },
  { path: '/roles/create', name: 'Create Role' },
  { path: '/roles/edit/:id', name: 'Edit Role' },
  { path: '/roles/:id', name: 'Role Details' },
  
  // Branch Management Routes
  { path: '/branches', name: 'Branches' },
  { path: '/branches/:id', name: 'Branch Details' },
  
  // Package Management Routes
  { path: '/packages', name: 'Packages' },
  { path: '/packages/:id', name: 'Package Details' },
  
  // Order Management Routes
  { path: '/orders', name: 'Orders' },
  { path: '/orders/:id', name: 'Order Details' },
  
  // Customer Management Routes
  { path: '/customers', name: 'Customers' },
  { path: '/customers/:id', name: 'Customer Details' },
  
  // Transaction Routes
  { path: '/transactions', name: 'Transactions' },
  { path: '/transactions/create', name: 'Create Transaction' },
  { path: '/transactions/:id', name: 'Transaction Details' },
  
  // Payment Routes
  { path: '/payments', name: 'Payments' },
  { path: '/payments/create', name: 'Create Payment' },
  { path: '/payments/:id', name: 'Payment Details' },
  
  // Report Routes
  { path: '/reports/company-health', name: 'Company Health Report' },
  
  // Account Routes
  { path: '/profile', name: 'Profile' },
  { path: '/profile/edit', name: 'Edit Profile' },
  { path: '/settings', name: 'Settings' },
  
  // Auth Routes
  { path: '/login', name: 'Login' },
  { path: '/forgot-password', name: 'Forgot Password' },
  { path: '/reset-password', name: 'Reset Password' },
]

export default routesConfig
