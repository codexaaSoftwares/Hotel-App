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
  
  // Customer Management Routes
  { path: '/customers', name: 'Customers' },
  { path: '/customers/create', name: 'Create Customer' },
  { path: '/customers/edit/:id', name: 'Edit Customer' },
  { path: '/customers/:id', name: 'Customer Details' },
  
  // Staff & Salary Management Routes
  { path: '/staff', name: 'Staff & Salary Management' },
  { path: '/staff/create', name: 'Create Staff' },
  { path: '/staff/edit/:id', name: 'Edit Staff' },
  { path: '/staff/:id', name: 'Staff Details' },
  
  // Account Routes
  { path: '/profile', name: 'Profile' },
  { path: '/profile/edit', name: 'Edit Profile' },
  { path: '/settings', name: 'Settings' },
  
  // Restaurant Routes
  { path: '/restaurant/menu', name: 'Menu Management' },
  { path: '/restaurant/tables', name: 'Table Management' },
  { path: '/restaurant/settings', name: 'Restaurant Settings' },
  
  // Hotel Room Routes
  { path: '/hotel-room/room-types', name: 'Room Categories' },
  
  // POS Routes
  { path: '/pos/panel', name: 'POS Panel' },
  { path: '/pos/bills', name: 'Bills Management' },
  
  // Expense Management Routes
  { path: '/expenses', name: 'Expense Management' },
  { path: '/expenses/create', name: 'Create Expense' },
  { path: '/expenses/edit/:id', name: 'Edit Expense' },
  
  // Auth Routes
  { path: '/login', name: 'Login' },
  { path: '/forgot-password', name: 'Forgot Password' },
  { path: '/reset-password', name: 'Reset Password' },
]

export default routesConfig
