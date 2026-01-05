import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMenu,
} from '@coreui/icons'

import { AppBreadcrumb } from '../index'
import { AppHeaderDropdown, ThemeToggle } from './header/index.jsx'
import { useAuth } from '../../context/AuthContext'

const AppHeader = () => {
  const headerRef = useRef()
  const [currentTime, setCurrentTime] = useState(new Date())

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { user } = useAuth()

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

  return (
    <CHeader position="sticky" className="mb-0 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderNav className="d-none d-md-flex">
          {user && (
            <div className="text-center">
              <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                Welcome {user.firstName} {user.lastName}
              </div>
            </div>
          )}
        </CHeaderNav>
        <CHeaderNav className="ms-auto">
          <div className="d-flex align-items-center px-3 me-3">
            <div className="text-center">
              <div className="fw-bold text-primary" style={{ fontSize: '1rem', fontFamily: 'monospace' }}>
                {formatTime(currentTime)}
              </div>
              <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
          <ThemeToggle />
        </CHeaderNav>
        <CHeaderNav>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader

