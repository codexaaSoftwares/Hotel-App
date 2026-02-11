import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// Module Constants
export const MODULES = {
  RESTAURANT: 'restaurant',
  HOTEL_ROOM: 'hotel_room',
  BANQUET_HALL: 'banquet_hall',
}

// Module Configuration
export const MODULE_CONFIG = {
  [MODULES.RESTAURANT]: {
    name: 'Restaurant',
    icon: 'faUtensils',
    color: '#0d9488',
    dashboardPath: '/restaurant/dashboard',
    defaultPath: '/restaurant/pos/panel',
  },
  [MODULES.HOTEL_ROOM]: {
    name: 'Hotel Room',
    icon: 'faHome',
    color: '#0284c7',
    dashboardPath: '/hotel-room/dashboard',
    defaultPath: '/hotel-room/dashboard',
  },
  [MODULES.BANQUET_HALL]: {
    name: 'Banquet Hall',
    icon: 'faBuilding',
    color: '#d97706',
    dashboardPath: '/banquet-hall/dashboard',
    defaultPath: '/banquet-hall/dashboard',
  },
}

const ModuleContext = createContext()

export const ModuleProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get initial module from localStorage or detect from current route
  const getInitialModule = () => {
    // Try to detect from current route
    const path = location.pathname
    if (path.startsWith('/restaurant')) {
      return MODULES.RESTAURANT
    }
    if (path.startsWith('/hotel-room')) {
      return MODULES.HOTEL_ROOM
    }
    if (path.startsWith('/banquet-hall')) {
      return MODULES.BANQUET_HALL
    }
    
    // Fallback to localStorage or default
    return localStorage.getItem('activeModule') || MODULES.RESTAURANT
  }

  const [activeModule, setActiveModule] = useState(getInitialModule)

  // Update module when route changes
  useEffect(() => {
    const path = location.pathname
    if (path.startsWith('/restaurant')) {
      setActiveModule(MODULES.RESTAURANT)
    } else if (path.startsWith('/hotel-room')) {
      setActiveModule(MODULES.HOTEL_ROOM)
    } else if (path.startsWith('/banquet-hall')) {
      setActiveModule(MODULES.BANQUET_HALL)
    }
  }, [location.pathname])

  // Persist module to localStorage
  useEffect(() => {
    localStorage.setItem('activeModule', activeModule)
  }, [activeModule])

  // Switch module and navigate to its dashboard
  const switchModule = (module) => {
    if (!MODULE_CONFIG[module]) {
      console.warn(`Invalid module: ${module}`)
      return
    }
    
    setActiveModule(module)
    const config = MODULE_CONFIG[module]
    navigate(config.dashboardPath)
  }

  // Get current module configuration
  const getModuleConfig = () => {
    return MODULE_CONFIG[activeModule] || MODULE_CONFIG[MODULES.RESTAURANT]
  }

  const value = {
    activeModule,
    switchModule,
    MODULES,
    MODULE_CONFIG,
    getModuleConfig,
  }

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  )
}

export const useModule = () => {
  const context = useContext(ModuleContext)
  if (!context) {
    throw new Error('useModule must be used within a ModuleProvider')
  }
  return context
}

export default ModuleContext

