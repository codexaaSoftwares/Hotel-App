import React, { useMemo, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav.jsx'

// Replace CoreUI SVG logo with custom image logo
import logoImg from 'src/assets/logo/logo-transprant.png'
import { settingsService } from '../../services/settingsService'

// sidebar nav config
import navigation from '../../_nav.jsx'
import { usePermissions } from '../../hooks'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { hasPermission } = usePermissions()
  const [businessLogo, setBusinessLogo] = useState(null)

  useEffect(() => {
    // Get settings from localStorage (set by auth service)
    const getBusinessLogo = () => {
      try {
        const settingsStr = localStorage.getItem('app_settings')
        if (settingsStr) {
          const settings = JSON.parse(settingsStr)
          if (settings.business_logo) {
            setBusinessLogo(settings.business_logo)
            return
          }
        }
      } catch (error) {
        console.warn('Failed to parse app settings:', error)
      }
      
      // If no settings in localStorage, try to fetch from API (fallback)
      const fetchBusinessLogo = async () => {
        try {
          const response = await settingsService.getSettingByKey('business_logo', 'Business Information', true)
          if (response.success && response.data && response.data.value) {
            const logoPath = response.data.value
            // Convert storage path to URL
            let logoUrl
            if (logoPath.startsWith('http')) {
              // Already a full URL, use it as is
              logoUrl = logoPath
            } else {
              // Construct URL from API base URL
              let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
              // Remove trailing slash if present
              baseUrl = baseUrl.replace(/\/+$/, '')
              // For subdirectory installations (/admin/api), storage is at /admin/api/storage/
              // If baseUrl includes /admin/api, use it as is
              if (baseUrl.includes('/admin/api')) {
                logoUrl = `${baseUrl}/storage/${logoPath}`
              } else if (baseUrl.includes('/admin')) {
                // If baseUrl is /admin, add /api/storage
                logoUrl = `${baseUrl}/api/storage/${logoPath}`
              } else {
                // For root installations, remove /api if present and add /storage
                baseUrl = baseUrl.replace(/\/api\/?$/, '')
                logoUrl = `${baseUrl}/storage/${logoPath}`
              }
            }
            setBusinessLogo(logoUrl)
          }
        } catch (error) {
          // Silently fail - use default logo
          console.warn('Failed to fetch business logo:', error)
        }
      }
      fetchBusinessLogo()
    }
    
    getBusinessLogo()
    
    // Listen for storage changes (cross-tab) and custom events (same-tab)
    const handleSettingsUpdate = (e) => {
      try {
        let settings = null
        if (e.type === 'storage' && e.key === 'app_settings') {
          settings = e.newValue ? JSON.parse(e.newValue) : null
        } else if (e.type === 'settingsUpdated') {
          // Custom event from Settings page
          settings = e.detail || null
        }
        
        if (settings && settings.business_logo) {
          setBusinessLogo(settings.business_logo)
        } else if (settings && !settings.business_logo) {
          setBusinessLogo(null)
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

  const filterNavItems = (items = []) => {
    return items
      .map((item) => {
        if (item.items) {
          const filteredChildren = filterNavItems(item.items)
          if (filteredChildren.length === 0) {
            return null
          }
          return { ...item, items: filteredChildren }
        }

        // Hide items if user doesn't have permission
        if (item.permission && hasPermission && !hasPermission(item.permission)) {
          return null
        }

        return item
      })
      .filter(Boolean)
  }

  const filteredNavigation = useMemo(() => filterNavItems(navigation), [navigation, hasPermission])

  return (
    <CSidebar
      className="sidebar-custom"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/" className="sidebar-brand-custom">
          <img
            src={businessLogo || logoImg}
            alt="Codexaa Base Project"
            className="sidebar-brand-logo-full"
            onError={(e) => {
              // Fallback to default logo if business logo fails to load
              if (e.target.src !== logoImg) {
                e.target.src = logoImg
              }
            }}
          />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      
      {/* Navigation */}
      <AppSidebarNav items={filteredNavigation} />
      
    </CSidebar>
  )
}

export default React.memo(AppSidebar)

