import React from 'react'
import { Card as BootstrapCard } from 'react-bootstrap'
import PropTypes from 'prop-types'

const Card = ({ 
  children, 
  title, 
  subtitle,
  text,
  variant = 'default',
  className = '',
  headerActions,
  hoverable = false,
  ...props 
}) => {
  const getVariantClass = () => {
    const variants = {
      default: '',
      primary: 'border-primary',
      success: 'border-success',
      info: 'border-info',
      warning: 'border-warning',
      danger: 'border-danger'
    }
    return variants[variant] || variants.default
  }

  const cardClasses = [
    getVariantClass(),
    hoverable ? 'card-hover' : '',
    className
  ].filter(Boolean).join(' ')

  const renderHeader = () => {
    if (!title && !subtitle && !headerActions) return null

    return (
      <BootstrapCard.Header className="d-flex justify-content-between align-items-center">
        <div>
          {title && <BootstrapCard.Title className="mb-0">{title}</BootstrapCard.Title>}
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        {headerActions && (
          <div className="card-header-actions">
            {headerActions}
          </div>
        )}
      </BootstrapCard.Header>
    )
  }

  const renderBody = () => {
    return (
      <BootstrapCard.Body>
        {text && <BootstrapCard.Text>{text}</BootstrapCard.Text>}
        {children}
      </BootstrapCard.Body>
    )
  }

  return (
    <BootstrapCard className={cardClasses} {...props}>
      {renderHeader()}
      {renderBody()}
    </BootstrapCard>
  )
}

Card.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  text: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'info', 'warning', 'danger']),
  className: PropTypes.string,
  headerActions: PropTypes.node,
  hoverable: PropTypes.bool
}

export default Card
