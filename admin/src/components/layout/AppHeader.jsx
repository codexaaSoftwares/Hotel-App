import React, { useEffect, useRef, useState } from 'react'
import {
  CHeader,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faExpand,
  faClock,
} from '@fortawesome/free-solid-svg-icons'

import { AppHorizontalNav } from '../index'
import { AppHeaderDropdown } from './header/index.jsx'
import ModuleSwitcher from './ModuleSwitcher'
import { useAuth } from '../../context/AuthContext'
import { settingsService } from '../../services/settingsService'
import logoImg from 'src/assets/logo/logo-transprant.png'

const AppHeader = () => {
  const headerRef = useRef()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [businessName, setBusinessName] = useState('Teja Hotel')
  const [businessLogo, setBusinessLogo] = useState(null)

  const { user } = useAuth()

  // Fetch business name and logo from settings
  useEffect(() => {
    const getBusinessInfo = () => {
      try {
        const settingsStr = localStorage.getItem('app_settings')
        if (settingsStr) {
          const settings = JSON.parse(settingsStr)
          if (settings.company_name) {
            setBusinessName(settings.company_name)
          }
          if (settings.business_logo) {
            setBusinessLogo(settings.business_logo)
          }
          return
        }
      } catch (error) {
        console.warn('Failed to parse app settings:', error)
      }
      
      // Fallback: fetch from API
      const fetchBusinessInfo = async () => {
        try {
          const [nameResponse, logoResponse] = await Promise.all([
            settingsService.getSettingByKey('company_name', 'Business Information', true),
            settingsService.getSettingByKey('business_logo', 'Business Information', true)
          ])
          
          if (nameResponse.success && nameResponse.data && nameResponse.data.value) {
            setBusinessName(nameResponse.data.value)
          }
          
          if (logoResponse.success && logoResponse.data && logoResponse.data.value) {
            const logoPath = logoResponse.data.value
            let logoUrl
            if (logoPath.startsWith('http')) {
              logoUrl = logoPath
            } else {
              let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
              baseUrl = baseUrl.replace(/\/+$/, '')
              if (baseUrl.includes('/admin/api')) {
                logoUrl = `${baseUrl}/storage/${logoPath}`
              } else if (baseUrl.includes('/admin')) {
                logoUrl = `${baseUrl}/api/storage/${logoPath}`
              } else {
                baseUrl = baseUrl.replace(/\/api\/?$/, '')
                logoUrl = `${baseUrl}/storage/${logoPath}`
              }
            }
            setBusinessLogo(logoUrl)
          }
        } catch (error) {
          console.warn('Failed to fetch business info:', error)
        }
      }
      fetchBusinessInfo()
    }
    
    getBusinessInfo()
    
    // Listen for settings updates
    const handleSettingsUpdate = (e) => {
      try {
        let settings = null
        if (e.type === 'storage' && e.key === 'app_settings') {
          settings = e.newValue ? JSON.parse(e.newValue) : null
        } else if (e.type === 'settingsUpdated') {
          settings = e.detail || null
        }
        
        if (settings) {
          if (settings.company_name) {
            setBusinessName(settings.company_name)
          }
          if (settings.business_logo) {
            setBusinessLogo(settings.business_logo)
          } else if (settings.business_logo === null) {
            setBusinessLogo(null)
          }
        }
      } catch (error) {
        console.warn('Failed to parse updated app settings:', error)
      }
    }
    
    window.addEventListener('storage', handleSettingsUpdate)
    window.addEventListener('settingsUpdated', handleSettingsUpdate)
    
    return () => {
      window.removeEventListener('storage', handleSettingsUpdate)
      window.removeEventListener('settingsUpdated', handleSettingsUpdate)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <CHeader position="sticky" className="mb-0 p-0 horizontal-header" ref={headerRef}>
      {/* First Row - Logo, Hotel Name, Welcome, Watch, Fullscreen, User */}
      <div className="top-header-bar">
        <div className="top-header-container">
          <div className="top-header-content">
            {/* Left: Logo + Hotel Name */}
            <div className="header-left-section">
              <img
                src={businessLogo || logoImg}
                alt={businessName}
                className="header-logo"
                onError={(e) => {
                  if (e.target.src !== logoImg) {
                    e.target.src = logoImg
                  }
                }}
              />
              <h5 className="mb-0 text-white fw-bold brand-name">
                {businessName}
              </h5>
            </div>

            {/* Middle: Welcome Message */}
            <div className="header-center-section">
              {user && (
                <div className="text-white welcome-message">
                  Welcome, <span className="fw-semibold">{user.firstName} {user.lastName}</span>
                </div>
              )}
            </div>

            {/* Right: Module Switcher + Watch + Fullscreen + User */}
            <div className="header-right-section">
              {/* Module Switcher */}
              <ModuleSwitcher />

              {/* Watch/Time */}
              <div className="watch-container">
                <FontAwesomeIcon icon={faClock} className="text-white watch-icon" />
                <div className="text-white watch-time">
                  <div className="fw-bold watch-time-display">
                    {formatTime(currentTime)}
                  </div>
                  <div className="watch-date-display">
                    {formatDate(currentTime)}
                  </div>
                </div>
              </div>

              {/* Fullscreen Button */}
              <button 
                className="header-action-btn" 
                title="Fullscreen"
                onClick={toggleFullscreen}
              >
                <FontAwesomeIcon icon={faExpand} />
              </button>

              {/* User Button */}
              <div className="header-user-section">
                <AppHeaderDropdown />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Horizontal Navigation Menu */}
      <div className="horizontal-nav-container">
        <AppHorizontalNav />
      </div>
    </CHeader>
  )
}

export default AppHeader

