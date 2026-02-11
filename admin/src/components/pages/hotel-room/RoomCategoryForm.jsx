import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import { FormRow, TextField, SelectField, TextAreaField } from '../../common/FormFields'
import PropTypes from 'prop-types'

const RoomCategoryForm = forwardRef(({ 
  mode = 'create', 
  categoryData = null, 
  onSubmit, 
  onCancel,
  loading = false 
}, ref) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: 0,
    max_adults: 2,
    max_children: 0,
    status: 'active'
  })
  const [errors, setErrors] = useState({})

  // Load category data for edit mode
  useEffect(() => {
    if (mode === 'edit' && categoryData) {
      setFormData({
        name: categoryData.name || '',
        description: categoryData.description || '',
        base_price: categoryData.base_price || 0,
        max_adults: categoryData.max_adults || 2,
        max_children: categoryData.max_children || 0,
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

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    } else if (formData.name.trim().length > 255) {
      newErrors.name = 'Category name must be 255 characters or less'
    }

    if (formData.base_price === null || formData.base_price === undefined || formData.base_price < 0) {
      newErrors.base_price = 'Base price must be 0 or greater'
    }

    if (!formData.max_adults || formData.max_adults < 1) {
      newErrors.max_adults = 'Max adults must be at least 1'
    } else if (formData.max_adults > 10) {
      newErrors.max_adults = 'Max adults cannot exceed 10'
    }

    if (formData.max_children === null || formData.max_children === undefined || formData.max_children < 0) {
      newErrors.max_children = 'Max children must be 0 or greater'
    } else if (formData.max_children > 10) {
      newErrors.max_children = 'Max children cannot exceed 10'
    }

    if (!['active', 'inactive'].includes(formData.status)) {
      newErrors.status = 'Invalid status'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return null
    }

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      base_price: parseFloat(formData.base_price) || 0,
      max_adults: parseInt(formData.max_adults) || 2,
      max_children: parseInt(formData.max_children) || 0,
      status: formData.status,
    }

    return submitData
  }

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      base_price: 0,
      max_adults: 2,
      max_children: 0,
      status: 'active'
    })
    setErrors({})
  }, [])

  // Reset form when mode changes to create
  useEffect(() => {
    if (mode === 'create') {
      resetForm()
    }
  }, [mode, resetForm])

  // Expose submit method to parent via ref
  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    setErrors: (newErrors) => setErrors(newErrors),
    reset: resetForm,
  }))

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  return (
    <div>
      <FormRow>
        <TextField
          id="name"
          label="Category Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          invalid={!!errors.name}
          feedback={errors.name}
          required
          placeholder="e.g., Deluxe, Standard, Suite"
          disabled={loading}
          col={12}
        />
      </FormRow>

      <FormRow>
        <TextAreaField
          id="description"
          label="Description (Optional)"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          invalid={!!errors.description}
          feedback={errors.description}
          placeholder="Enter category description"
          disabled={loading}
          rows={3}
          col={12}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="base_price"
          label="Base Price (Per Night)"
          type="number"
          value={formData.base_price}
          onChange={(e) => handleChange('base_price', parseFloat(e.target.value) || 0)}
          invalid={!!errors.base_price}
          feedback={errors.base_price}
          required
          min={0}
          step="0.01"
          disabled={loading}
          col={6}
        />
        <SelectField
          id="status"
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          invalid={!!errors.status}
          feedback={errors.status}
          options={statusOptions}
          disabled={loading}
          col={6}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="max_adults"
          label="Max Adults"
          type="number"
          value={formData.max_adults}
          onChange={(e) => handleChange('max_adults', parseInt(e.target.value) || 1)}
          invalid={!!errors.max_adults}
          feedback={errors.max_adults}
          required
          min={1}
          max={10}
          disabled={loading}
          col={6}
        />
        <TextField
          id="max_children"
          label="Max Children"
          type="number"
          value={formData.max_children}
          onChange={(e) => handleChange('max_children', parseInt(e.target.value) || 0)}
          invalid={!!errors.max_children}
          feedback={errors.max_children}
          required
          min={0}
          max={10}
          disabled={loading}
          col={6}
        />
      </FormRow>
    </div>
  )
})

RoomCategoryForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  categoryData: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
}

RoomCategoryForm.displayName = 'RoomCategoryForm'

export default RoomCategoryForm

