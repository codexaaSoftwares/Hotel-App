import React from 'react'
import { CSpinner } from '@coreui/react'
import PropTypes from 'prop-types'

const GlobalSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  variant = 'border',
  text = 'Loading...',
  showText = true,
  className = '',
  fullScreen = false,
  enhanced = false
}) => {
  const getSizeClass = () => {
    const sizes = {
      sm: 'global-spinner-sm',
      md: 'global-spinner',
      lg: 'global-spinner-lg',
      full: 'global-spinner-full'
    }
    return sizes[size] || sizes.md
  }

  const getSpinnerClass = () => {
    const classes = [
      getSizeClass(),
      enhanced ? 'spinner-enhanced' : '',
      className
    ].filter(Boolean).join(' ')
    
    return classes
  }

  const getColorClass = () => {
    const colors = {
      primary: 'spinner-primary',
      success: 'spinner-success',
      info: 'spinner-info',
      warning: 'spinner-warning',
      danger: 'spinner-danger'
    }
    return colors[color] || colors.primary
  }

  const renderSpinner = () => {
    if (fullScreen) {
      return (
        <div className="global-spinner-full">
          <div className="text-center">
            <CSpinner 
              color={color} 
              variant={variant}
              className={`${getColorClass()} ${enhanced ? 'spinner-enhanced' : ''}`}
            />
            {showText && (
              <div className="mt-3 text-muted">
                {text}
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className={getSpinnerClass()}>
        <div className="text-center">
          <CSpinner 
            color={color} 
            variant={variant}
            className={`${getColorClass()} ${enhanced ? 'spinner-enhanced' : ''}`}
          />
          {showText && (
            <div className="mt-3 text-muted">
              {text}
            </div>
          )}
        </div>
      </div>
    )
  }

  return renderSpinner()
}

GlobalSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'full']),
  color: PropTypes.oneOf(['primary', 'success', 'info', 'warning', 'danger']),
  variant: PropTypes.oneOf(['border', 'grow']),
  text: PropTypes.string,
  showText: PropTypes.bool,
  className: PropTypes.string,
  fullScreen: PropTypes.bool,
  enhanced: PropTypes.bool
}

export default GlobalSpinner
