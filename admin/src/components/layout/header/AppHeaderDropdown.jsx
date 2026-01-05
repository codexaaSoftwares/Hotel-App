import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilSettings,
  cilUser,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useToast } from '../../common/ToastProvider'
import { useAuth } from '../../../context/AuthContext'

import avatar8 from '../../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const { success } = useToast()
  const { user, logout } = useAuth()
  const [avatarKey, setAvatarKey] = useState(0)

  // Update avatar key when user avatar changes
  useEffect(() => {
    if (user?.avatar) {
      setAvatarKey(prev => prev + 1)
    } else {
      setAvatarKey(0)
    }
  }, [user?.avatar])

  // Get avatar URL from user, fallback to default
  // Use useMemo to prevent unnecessary recalculations
  const avatarUrl = useMemo(() => {
    // Debug log
    if (import.meta.env.DEV) {
      console.log('[Header] Avatar URL calculation:', {
        userAvatar: user?.avatar,
        avatarKey,
        user: user
      })
    }
    
    // Check if user has avatar
    if (!user?.avatar) {
      return avatar8
    }
    
    // If avatar is a valid URL string
    if (typeof user.avatar === 'string' && user.avatar.trim()) {
      const avatar = user.avatar.trim()
      
      // Check if it's a full URL
      if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
        // Add cache busting for local storage URLs
        if (avatar.includes('/storage/')) {
          const separator = avatar.includes('?') ? '&' : '?'
          const finalUrl = `${avatar}${separator}v=${avatarKey || Date.now()}`
          
          if (import.meta.env.DEV) {
            console.log('[Header] Using avatar URL with cache busting:', finalUrl)
          }
          
          return finalUrl
        }
        
        if (import.meta.env.DEV) {
          console.log('[Header] Using avatar URL:', avatar)
        }
        
        return avatar
      }
      
      // If it starts with /, it's a relative URL
      if (avatar.startsWith('/')) {
        return avatar
      }
    }
    
    // Fallback to default
    if (import.meta.env.DEV) {
      console.log('[Header] Using default avatar')
    }
    
    return avatar8
  }, [user?.avatar, avatarKey])

  const handleLogout = async () => {
    try {
      await logout()
      success('Logged out successfully!')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      success('Logged out successfully!')
      navigate('/login')
    }
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar 
          src={avatarUrl} 
          size="md"
          key={`avatar-${user?.id || 'default'}-${avatarKey}`} // Force re-render when avatar changes
        />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
        </CDropdownHeader>
        
        <CDropdownItem 
          onClick={() => navigate('/profile')} 
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilUser} className="me-2" />
          My Profile
        </CDropdownItem>
        
        <CDropdownItem 
          onClick={() => navigate('/settings')} 
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        
        <CDropdownDivider />
        
        <CDropdownItem onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown

