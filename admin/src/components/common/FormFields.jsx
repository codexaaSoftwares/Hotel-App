import React from 'react'
import { FormLabel, FormControl, FormSelect, FormText, Row, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'

// Text Input Field
export const TextField = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  helpText, 
  col = 6,
  invalid = false,
  feedback,
  labelClassName = '',
  ...props 
}) => (
  <Col md={col}>
    <FormLabel htmlFor={props.id} className={labelClassName}>
      {label} {required && <span className="text-danger">*</span>}
    </FormLabel>
    <FormControl
      {...props}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      isInvalid={invalid}
    />
    {feedback && <div className="invalid-feedback d-block">{feedback}</div>}
    {helpText && <FormText>{helpText}</FormText>}
  </Col>
)

// Select Field
export const SelectField = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  required = false, 
  helpText, 
  col = 6,
  invalid = false,
  feedback,
  ...props 
}) => (
  <Col md={col}>
    <FormLabel htmlFor={props.id}>
      {label} {required && <span className="text-danger">*</span>}
    </FormLabel>
    <FormSelect
      {...props}
      value={value}
      onChange={onChange}
      required={required}
      isInvalid={invalid}
    >
      {options.map((option, index) => (
        <option key={`option-${option.value}-${index}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </FormSelect>
    {feedback && <div className="invalid-feedback d-block">{feedback}</div>}
    {helpText && <FormText>{helpText}</FormText>}
  </Col>
)

// Row Wrapper
export const FormRow = ({ children, className = "mt-3" }) => (
  <Row className={className}>
    {children}
  </Row>
)

TextField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  helpText: PropTypes.string,
  col: PropTypes.number,
  invalid: PropTypes.bool,
  feedback: PropTypes.string
}

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  required: PropTypes.bool,
  helpText: PropTypes.string,
  col: PropTypes.number,
  invalid: PropTypes.bool,
  feedback: PropTypes.string
}

FormRow.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}
