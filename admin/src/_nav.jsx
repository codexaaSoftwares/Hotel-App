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
  cilBed,
  cilCalendar,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'
import { PERMISSIONS } from './constants/permissions'
import { MODULES } from './context/ModuleContext'

// Common Navigation (accessible from all modules)
const commonNavigation = [
  {
    component: CNavTitle,
    name: 'Common',
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
    name: 'Administrator',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'User Management',
        to: '/users',
        icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
        permission: PERMISSIONS.USER_READ,
      },
      {
        component: CNavItem,
        name: 'Global Settings',
        to: '/settings',
        icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
        permission: PERMISSIONS.SETTINGS_READ,
      },
    ],
  },
]

// Restaurant Module Navigation
const restaurantNavigation = [
  {
    component: CNavTitle,
    name: 'Restaurant',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/restaurant/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    permission: PERMISSIONS.DASHBOARD_READ,
  },
  {
    component: CNavItem,
    name: 'POS Panel',
    to: '/restaurant/pos/panel',
    icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
    permission: PERMISSIONS.BILL_CREATE,
  },
  {
    component: CNavItem,
    name: 'Bills',
    to: '/restaurant/pos/bills',
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
    name: 'Reports',
    icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Sales Report',
        to: '/restaurant/reports/sales',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.SALES_REPORT_READ,
      },
      {
        component: CNavItem,
        name: 'Expense Report',
        to: '/restaurant/reports/expenses',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.EXPENSE_REPORT_READ,
      },
      {
        component: CNavItem,
        name: 'Customer Pending Report',
        to: '/restaurant/reports/customer-pending',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.CUSTOMER_PENDING_REPORT_READ,
      },
      {
        component: CNavItem,
        name: 'Staff & Salary Report',
        to: '/restaurant/reports/staff-salary',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.STAFF_SALARY_REPORT_READ,
      },
      {
        component: CNavItem,
        name: 'Category-wise Items',
        to: '/restaurant/reports/category-wise-items',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.SALES_REPORT_READ,
      },
    ],
  },
]

// Hotel Room Module Navigation (Planned - Placeholder)
const hotelRoomNavigation = [
  {
    component: CNavTitle,
    name: 'Hotel Room',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/hotel-room/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to HOTEL_ROOM_DASHBOARD_READ
  },
  {
    component: CNavItem,
    name: 'Room Management',
    icon: <CIcon icon={cilBed} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Rooms',
        to: '/hotel-room/rooms',
        icon: <CIcon icon={cilBed} customClassName="nav-icon" />,
        permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to ROOM_READ
      },
      {
        component: CNavItem,
        name: 'Room Types',
        to: '/hotel-room/room-types',
        icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
        permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to ROOM_TYPE_READ
      },
      {
        component: CNavItem,
        name: 'Bookings',
        to: '/hotel-room/bookings',
        icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
        permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to BOOKING_READ
      },
      {
        component: CNavItem,
        name: 'Hotel Settings',
        to: '/hotel-room/settings',
        icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
        permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to HOTEL_SETTINGS_READ
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
        name: 'Occupancy Report',
        to: '/hotel-room/reports/occupancy',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to OCCUPANCY_REPORT_READ
      },
      {
        component: CNavItem,
        name: 'Revenue Report',
        to: '/hotel-room/reports/revenue',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to REVENUE_REPORT_READ
      },
      {
        component: CNavItem,
        name: 'Booking Report',
        to: '/hotel-room/reports/bookings',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to BOOKING_REPORT_READ
      },
    ],
  },
]

// Banquet Hall Module Navigation (Planned - Placeholder)
const banquetHallNavigation = [
  {
    component: CNavTitle,
    name: 'Banquet Hall',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/banquet-hall/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to BANQUET_DASHBOARD_READ
  },
  {
    component: CNavItem,
    name: 'Hall Management',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Halls',
        to: '/banquet-hall/halls',
        icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
        permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to HALL_READ
      },
      {
        component: CNavItem,
        name: 'Bookings',
        to: '/banquet-hall/bookings',
        icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
        permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to BANQUET_BOOKING_READ
      },
      {
        component: CNavItem,
        name: 'Banquet Settings',
        to: '/banquet-hall/settings',
        icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
        permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to BANQUET_SETTINGS_READ
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
        name: 'Booking Report',
        to: '/banquet-hall/reports/bookings',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to BANQUET_REPORT_READ
      },
      {
        component: CNavItem,
        name: 'Revenue Report',
        to: '/banquet-hall/reports/revenue',
        icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
        permission: PERMISSIONS.DASHBOARD_READ, // Will be updated to BANQUET_REVENUE_REPORT_READ
      },
    ],
  },
]

// Module-specific navigation maps
const moduleNavigationMap = {
  [MODULES.RESTAURANT]: restaurantNavigation,
  [MODULES.HOTEL_ROOM]: hotelRoomNavigation,
  [MODULES.BANQUET_HALL]: banquetHallNavigation,
}

/**
 * Get navigation items based on active module
 * @param {string} activeModule - Active module (from MODULES constant)
 * @returns {Array} Combined navigation array
 */
export const getNavigation = (activeModule) => {
  const moduleNav = moduleNavigationMap[activeModule] || restaurantNavigation
  return [...moduleNav, ...commonNavigation]
}

// Default export for backward compatibility
const _nav = getNavigation(MODULES.RESTAURANT)

export default _nav
