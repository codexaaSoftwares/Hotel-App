import React, { useState, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import { CNavTitle } from '@coreui/react'
import { usePermissions } from '../../hooks'
import navigation from '../../_nav.jsx'

const AppHorizontalNav = () => {
  const location = useLocation()
  const { hasPermission } = usePermissions()
  const [expanded, setExpanded] = useState(false)

  // Filter navigation items based on permissions
  const filterNavItems = (items = []) => {
    return items
      .map((item) => {
        // Skip CNavTitle items for horizontal nav
        if (item.component === CNavTitle) {
          return null
        }

        if (item.items) {
          const filteredChildren = filterNavItems(item.items)
          // Show parent items even if all children are filtered (for development)
          // In production, you can change this to: if (filteredChildren.length === 0) return null
          // For now, show parent with filtered children (empty array if all filtered)
          return { ...item, items: filteredChildren }
        }

        // Hide items if user doesn't have permission
        // For development: Show items even if permission check fails (comment out for production)
        if (item.permission) {
          // Temporarily disabled for development - uncomment for production
          // if (hasPermission && !hasPermission(item.permission)) {
          //   return null
          // }
        }

        return item
      })
      .filter(Boolean)
    }

  const filteredNavigation = useMemo(() => filterNavItems(navigation), [navigation, hasPermission])

  // Flatten navigation for simple horizontal display (remove titles)
  const flatNavItems = useMemo(() => {
    return filteredNavigation.filter((item) => item.component !== CNavTitle)
  }, [filteredNavigation])

  const isActive = (path) => {
    if (!path) return false
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const handleNavClick = () => {
    // Close mobile menu when item is clicked
    if (window.innerWidth < 992) {
      setExpanded(false)
    }
  }

  return (
    <Navbar
      expand="lg"
      className="horizontal-navbar"
      bg="white"
      variant="light"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container fluid className="px-2">
        <Navbar.Toggle
          aria-controls="horizontal-navbar-nav"
          className="border-0 compact-toggle"
        >
          <FontAwesomeIcon icon={expanded ? faTimes : faBars} className="text-primary" />
        </Navbar.Toggle>

        <Navbar.Collapse id="horizontal-navbar-nav">
          <Nav className="me-auto horizontal-nav-items">
            {flatNavItems.map((item, index) => {
              const { name, to, icon, items: subItems, permission } = item

              // Skip if no permission (temporarily disabled for development)
              // Uncomment for production:
              // if (permission && !to && hasPermission && !hasPermission(permission)) {
              //   return null
              // }

              // If item has sub-items, create dropdown (even if empty for development)
              if (subItems && Array.isArray(subItems)) {
                // Check if any child or nested child is active
                const hasActiveChild = (items) => {
                  return items.some((item) => {
                    if (item.to && isActive(item.to)) return true
                    if (item.items) return hasActiveChild(item.items)
                    return false
                  })
                }

                return (
                  <NavDropdown
                    key={`nav-item-${index}-${name}`}
                    title={
                      <span className="d-flex align-items-center nav-item-content">
                        {icon && <span className="nav-icon-wrapper">{icon}</span>}
                        <span className="nav-item-text">{name}</span>
                      </span>
                    }
                    id={`nav-dropdown-${index}`}
                    className={`horizontal-nav-dropdown ${hasActiveChild(subItems) ? 'active' : ''}`}
                  >
                    {subItems.length > 0 ? subItems.map((subItem, subIndex) => {
                      // Temporarily disabled for development - uncomment for production
                      // if (subItem.permission && hasPermission && !hasPermission(subItem.permission)) {
                      //   return null
                      // }

                      // If sub-item has nested items (level 3), create nested dropdown
                      if (subItem.items && subItem.items.length > 0) {
                        const nestedActive = hasActiveChild(subItem.items)
                        return (
                          <NavDropdown
                            key={`nav-subitem-${subIndex}-${subItem.name}`}
                            title={
                              <span className="d-flex align-items-center nav-item-content">
                                {subItem.icon && <span className="nav-icon-wrapper">{subItem.icon}</span>}
                                <span className="nav-item-text">{subItem.name}</span>
                              </span>
                            }
                            id={`nav-dropdown-${index}-${subIndex}`}
                            className={`horizontal-nav-dropdown-nested ${nestedActive ? 'active' : ''}`}
                            drop="end"
                          >
                            {subItem.items.map((nestedItem, nestedIndex) => {
                              // Temporarily disabled for development - uncomment for production
                              // if (nestedItem.permission && hasPermission && !hasPermission(nestedItem.permission)) {
                              //   return null
                              // }
                              const nestedItemActive = isActive(nestedItem.to)
                              return (
                                <NavDropdown.Item
                                  key={`nav-nesteditem-${nestedIndex}-${nestedItem.name}`}
                                  as={NavLink}
                                  to={nestedItem.to}
                                  onClick={handleNavClick}
                                  className={nestedItemActive ? 'active' : ''}
                                >
                                  <span className="d-flex align-items-center nav-item-content">
                                    {nestedItem.icon && <span className="nav-icon-wrapper">{nestedItem.icon}</span>}
                                    <span className="nav-item-text">{nestedItem.name}</span>
                                  </span>
                                </NavDropdown.Item>
                              )
                            })}
                          </NavDropdown>
                        )
                      }

                      // Regular sub-item (level 2)
                      const subActive = isActive(subItem.to)
                      return (
                        <NavDropdown.Item
                          key={`nav-subitem-${subIndex}-${subItem.name}`}
                          as={NavLink}
                          to={subItem.to}
                          onClick={handleNavClick}
                          className={subActive ? 'active' : ''}
                        >
                          <span className="d-flex align-items-center nav-item-content">
                            {subItem.icon && <span className="nav-icon-wrapper">{subItem.icon}</span>}
                            <span className="nav-item-text">{subItem.name}</span>
                          </span>
                        </NavDropdown.Item>
                      )
                    }) : (
                      <NavDropdown.Item disabled>
                        <span className="text-muted">No items available</span>
                      </NavDropdown.Item>
                    )}
                  </NavDropdown>
                )
              }

              // Regular nav item
              const active = isActive(to)
              return (
                <Nav.Link
                  key={`nav-item-${index}-${name}`}
                  as={NavLink}
                  to={to}
                  onClick={handleNavClick}
                  className={`horizontal-nav-link ${active ? 'active' : ''}`}
                >
                  <span className="d-flex align-items-center nav-item-content">
                    {icon && <span className="nav-icon-wrapper">{icon}</span>}
                    <span className="nav-item-text">{name}</span>
                  </span>
                </Nav.Link>
              )
            })}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default AppHorizontalNav

