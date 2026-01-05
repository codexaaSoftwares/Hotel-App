import React, { useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { useColorModes } from '@coreui/react'
import './scss/style.scss'
import '../styles/theme.css'

// Import Providers
import { ToastProvider, ScrollToTop } from './components'
import { AuthProvider } from './context/AuthContext'

// Import Routes
import AppRoutes from './routes'

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    // Check for theme in URL parameters first
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    
    if (theme) {
      setColorMode(theme)
      return
    }

    // If no URL theme, check if CoreUI has already set a theme
    if (isColorModeSet()) {
      return
    }

    // Set theme from Redux store (which includes localStorage persistence)
    setColorMode(storedTheme)
  }, [storedTheme, setColorMode, isColorModeSet]) // Added dependencies

  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
