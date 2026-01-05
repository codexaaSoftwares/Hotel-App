import React, { createContext, useContext, useState, useCallback } from 'react'
import { CToast, CToastBody, CToastClose, CToaster } from '@coreui/react'
import PropTypes from 'prop-types'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      title: toast.title || '',
      message: toast.message || '',
      type: toast.type || 'info',
      duration: toast.duration || 5000,
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message, options = {}) => {
    return addToast({
      message,
      type: 'success',
      title: options.title || 'Success',
      ...options
    })
  }, [addToast])

  const error = useCallback((message, options = {}) => {
    return addToast({
      message,
      type: 'danger',
      title: options.title || 'Error',
      ...options
    })
  }, [addToast])

  const warning = useCallback((message, options = {}) => {
    return addToast({
      message,
      type: 'warning',
      title: options.title || 'Warning',
      ...options
    })
  }, [addToast])

  const info = useCallback((message, options = {}) => {
    return addToast({
      message,
      type: 'info',
      title: options.title || 'Info',
      ...options
    })
  }, [addToast])

  const getToastIcon = (type) => {
    const icons = {
      success: 'cil-check-circle',
      danger: 'cil-x-circle',
      warning: 'cil-warning',
      info: 'cil-info'
    }
    return icons[type] || icons.info
  }

  const getToastBgClass = (type) => {
    const classes = {
      success: 'toast-bg-success',
      danger: 'toast-bg-danger',
      warning: 'toast-bg-warning',
      info: 'toast-bg-info'
    }
    return classes[type] || classes.info
  }

  const getToastStyle = (type) => {
    const styles = {
      success: { 
        background: 'rgba(40, 167, 69, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        boxShadow: '0 8px 32px rgba(40, 167, 69, 0.3)'
      },
      danger: { 
        background: 'rgba(220, 53, 69, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        boxShadow: '0 8px 32px rgba(220, 53, 69, 0.3)'
      },
      warning: { 
        background: 'rgba(253, 126, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        boxShadow: '0 8px 32px rgba(253, 126, 20, 0.3)'
      },
      info: { 
        background: 'rgba(23, 162, 184, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        boxShadow: '0 8px 32px rgba(23, 162, 184, 0.3)'
      }
    }
    return styles[type] || styles.info
  }


  const value = {
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <CToaster placement="top-end">
        {toasts.map((toast) => (
          <CToast
            key={toast.id}
            visible={true}
            autohide={toast.duration}
            className={getToastBgClass(toast.type)}
            style={getToastStyle(toast.type)}
          >
            <div className="d-flex">
              <CToastBody>
                <div className="d-flex align-items-center">
                  <i className={`${getToastIcon(toast.type)} me-2`} />
                  <div>
                    {toast.title && <strong>{toast.title}</strong>}
                    {toast.title && toast.message && <br />}
                    {toast.message}
                  </div>
                </div>
              </CToastBody>
              <CToastClose className="me-2 m-auto" />
            </div>
          </CToast>
        ))}
      </CToaster>
    </ToastContext.Provider>
  )
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export default ToastProvider
