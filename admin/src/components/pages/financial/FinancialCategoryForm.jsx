import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { FormRow, TextField, SelectField } from '../../common/FormFields'
import { Form, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'

const FinancialCategoryForm = forwardRef(({ 
  mode = 'create', 
  categoryData = null, 
  onSubmit, 
  onCancel,
  loading = false 
}, ref) => {
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    description: '',
    status: 'active'
  })
  const [errors, setErrors] = useState({})

  // Load category data for edit mode
  useEffect(() => {
    if (mode === 'edit' && categoryData) {
      setFormData({
        type: categoryData.type || '',
        name: categoryData.name || '',
        description: categoryData.description || '',
        status: categoryData.status || 'active'
      })
    }
  }, [mode, categoryData])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.type) {
      newErrors.type = 'Type is required'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const submitData = {
      type: formData.type,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      status: formData.status
    }

    onSubmit(submitData)
  }

  // Expose handleSubmit to parent component via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: handleSubmit
  }), [formData])

  const typeOptions = [
    { value: '', label: 'Select Type' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  return (
    <div>
      <FormRow>
        <SelectField
          id="type"
          label="Type"
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          options={typeOptions}
          required
          disabled={mode === 'edit'} // Type cannot be changed in edit mode
          col={6}
          invalid={!!errors.type}
          feedback={errors.type}
          helpText={mode === 'edit' ? 'Type cannot be changed' : 'Select whether this is an income or expense category'}
        />
        <SelectField
          id="status"
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={statusOptions}
          col={6}
          invalid={!!errors.status}
          feedback={errors.status}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="name"
          label="Category Title/Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter category name"
          required
          col={12}
          invalid={!!errors.name}
          feedback={errors.name}
          helpText="Enter a unique name for this category"
        />
      </FormRow>

      <FormRow>
        <Col md={12}>
          <Form.Label htmlFor="description" className="fw-semibold">
            Description <span className="text-muted">(Optional)</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter category description (optional)"
            className="border-2"
          />
          {errors.description && (
            <div className="invalid-feedback d-block">{errors.description}</div>
          )}
        </Col>
      </FormRow>
    </div>
  )
})

FinancialCategoryForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  categoryData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
}

export default FinancialCategoryForm
