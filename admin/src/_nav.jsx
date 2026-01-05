import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilPeople,
  cilCog,
  cilBuilding,
  cilLockLocked,
  cilUser,
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