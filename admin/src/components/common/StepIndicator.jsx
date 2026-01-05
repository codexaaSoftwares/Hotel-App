import React from 'react'
import { Row, Col } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

const StepIndicator = ({ steps, currentStep, onStepClick }) => {
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'active'
    return 'pending'
  }

  const getStepIcon = (stepIndex, status) => {
    if (status === 'completed') {
      return <FontAwesomeIcon icon={faCheck} className="text-white" />
    }
    return <span className="text-white fw-bold">{stepIndex + 1}</span>
  }

  const getStepClass = (status) => {
    const baseClass = 'step-circle d-flex align-items-center justify-content-center'
    switch (status) {
      case 'completed':
        return `${baseClass} bg-success`
      case 'active':
        return `${baseClass} bg-success`
      default:
        return `${baseClass} bg-secondary`
    }
  }

  const getTextClass = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success fw-semibold'
      case 'active':
        return 'text-success fw-semibold'
      default:
        return 'text-muted'
    }
  }

  const getLineClass = (stepIndex) => {
    if (stepIndex < currentStep) {
      return 'step-line bg-success'
    }
    return 'step-line bg-light'
  }

  return (
    <div className="step-indicator mb-4">
      <Row className="align-items-center">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isLast = index === steps.length - 1
          
          return (
            <React.Fragment key={index}>
              <Col xs="auto" className="d-flex flex-column align-items-center">
                <div 
                  className={getStepClass(status)}
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%',
                    cursor: onStepClick ? 'pointer' : 'default'
                  }}
                  onClick={() => onStepClick && onStepClick(index)}
                >
                  {getStepIcon(index, status)}
                </div>
                <div className={`mt-2 text-center ${getTextClass(status)}`}>
                  <div className="fw-bold">{step.number}</div>
                  <div className="small">{step.title}</div>
                </div>
              </Col>
              {!isLast && (
                <Col className="px-0">
                  <div 
                    className={getLineClass(index)}
                    style={{ 
                      height: '2px',
                      marginTop: '-20px'
                    }}
                  />
                </Col>
              )}
            </React.Fragment>
          )
        })}
      </Row>
    </div>
  )
}

export default StepIndicator
