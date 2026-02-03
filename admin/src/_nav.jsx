import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilPeople,
  cilCog,
  cilBuilding,
  cilLockLocked,
  cilUser,
  cilHome,
  cilTags,
  cilBasket,
  cilGrid,
  cilCreditCard,
  cilList,
  cilWallet,
  cilGraph,
  cilMenu,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'
import { PERMISSIONS } from './constants/permissions'

const _nav = [
  {
    component: CNavTitle,
    name: 'Main',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    permission: PERMISSIONS.DASHBOARD_READ,
  },
  {
    component: CNavItem,
    name: 'POS Panel',
    to: '/pos/panel',
    icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
    permission: PERMISSIONS.BILL_CREATE,
  },
  {
    component: CNavItem,
    name: 'Bills',
    to: '/pos/bills',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
    permission: PERMISSIONS.BILL_READ,
  },
  {
    component: CNavItem,
    name: 'Restaurant',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Menu Management',
        to: '/restaurant/menu',
        icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
        permission: PERMISSIONS.FOOD_CATEGORY_READ,
      },
      {
        component: CNavItem,
        name: 'Table Management',
        to: '/restaurant/tables',
        icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
        permission: PERMISSIONS.TABLE_READ,
      },
      {
        component: CNavItem,
        name: 'Restaurant Settings',
        to: '/restaurant/settings',
        icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
        permission: PERMISSIONS.RESTAURANT_SETTINGS_READ,
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Management',
    icon: <CIcon icon={cilMenu} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Customers',
        to: '/customers',
        icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
        permission: PERMISSIONS.CUSTOMER_READ,
      },
      {
        component: CNavItem,
        name: 'Staff & Salary Management',
        to: '/staff',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        permission: PERMISSIONS.STAFF_READ,
      },
      {
        component: CNavItem,
        name: 'Expense Management',
        to: '/expenses',
        icon: <CIcon icon={cilTags} customClassName="nav-icon" />,
        permission: PERMISSIONS.EXPENSE_READ,
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Reports',
    icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Sales Report',
        to: '/reports/sales',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.SALES_REPORT_READ,
      },
      {
        component: CNavItem,
        name: 'Expense Report',
        to: '/reports/expenses',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.EXPENSE_REPORT_READ,
      },
      {
        component: CNavItem,
        name: 'Customer Pending Report',
        to: '/reports/customer-pending',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.CUSTOMER_PENDING_REPORT_READ,
      },
      {
        component: CNavItem,
        name: 'Staff & Salary Report',
        to: '/reports/staff-salary',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.STAFF_SALARY_REPORT_READ,
      },
      {
        component: CNavItem,
        name: 'Category-wise Items',
        to: '/reports/category-wise-items',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.SALES_REPORT_READ,
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Administrator',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'User Management',
        items: [
          {
            component: CNavItem,
            name: 'Users',
            to: '/users',
            icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
            permission: PERMISSIONS.USER_READ,
          },
          {
            component: CNavItem,
            name: 'Role and Permission',
            to: '/roles',
            icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
            permission: PERMISSIONS.ROLE_READ,
          },
        ],
      },
      {
        component: CNavItem,
        name: 'Branch',
        to: '/branches',
        icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
        permission: PERMISSIONS.BRANCH_READ,
      },
      {
        component: CNavItem,
        name: 'Settings',
        to: '/settings',
        icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
        permission: PERMISSIONS.SETTINGS_READ,
      },
    ],
  },
]

export default _nav