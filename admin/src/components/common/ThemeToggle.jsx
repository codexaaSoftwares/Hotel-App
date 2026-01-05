import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useColorModes } from '@coreui/react'
import { Dropdown } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'

const ThemeToggle = () => {
  const dispatch = useDispatch()
  const { setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const currentTheme = useSelector((state) => state.theme)

  const themes = [
    { key: 'light', label: 'Light', icon: faSun },
    { key: 'dark', label: 'Dark', icon: faMoon }
  ]

  const handleThemeChange = (themeKey) => {
    // Only allow 'light' or 'dark' themes
    if (themeKey !== 'light' && themeKey !== 'dark') {
      console.warn(`Invalid theme: ${themeKey}. Defaulting to 'light'.`)
      themeKey = 'light'
    }
    
    // Update Redux store
    dispatch({ type: 'set', theme: themeKey })
    
    // Update CoreUI theme
    setColorMode(themeKey)
    
    // Store in localStorage for persistence
    localStorage.setItem('theme', themeKey)
  }

  const getCurrentThemeIcon = () => {
    // Ensure theme is valid, fallback to light if invalid
    const validTheme = currentTheme === 'light' || currentTheme === 'dark' ? currentTheme : 'light'
    const theme = themes.find(t => t.key === validTheme)
    return theme ? theme.icon : faSun
  }

  const getCurrentThemeLabel = () => {
    // Ensure theme is valid, fallback to light if invalid
    const validTheme = currentTheme === 'light' || currentTheme === 'dark' ? currentTheme : 'light'
    const theme = themes.find(t => t.key === validTheme)
    return theme ? theme.label : 'Light'
  }

  return (
    <div className="theme-toggle-container d-flex align-items-center">
      {/* Theme Options Dropdown */}
      <Dropdown>
        <Dropdown.Toggle
          variant="outline-secondary"
          size="sm"
          className="d-flex align-items-center"
          title="Theme Options"
          style={{ minWidth: '80px' }}
        >
          <FontAwesomeIcon 
            icon={getCurrentThemeIcon()} 
            style={{ fontSize: '0.875rem' }}
          />
          <span className="d-none d-md-inline ms-2" style={{ fontSize: '0.875rem' }}>
            {getCurrentThemeLabel()}
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu className="dropdown-menu-end">
          {themes.map((theme) => (
            <Dropdown.Item
              key={theme.key}
              onClick={() => handleThemeChange(theme.key)}
              className={`d-flex align-items-center ${
                currentTheme === theme.key ? 'active' : ''
              }`}
              style={{ fontSize: '0.875rem' }}
            >
              <FontAwesomeIcon 
                icon={theme.icon} 
                className="me-2" 
                style={{ fontSize: '0.8rem' }}
              />
              {theme.label}
              {currentTheme === theme.key && (
                <FontAwesomeIcon 
                  icon={faSun} 
                  className="ms-auto text-success" 
                  style={{ fontSize: '0.7rem' }}
                />
              )}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )
}

export default ThemeToggle
