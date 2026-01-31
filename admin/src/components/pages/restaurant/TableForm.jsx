import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import { FormRow, TextField, SelectField } from '../../common/FormFields'
import PropTypes from 'prop-types'

const TableForm = forwardRef(({ 
  mode = 'create', 
  tableData = null, 
  onSubmit, 
  onCancel,
  loading = false 
}, ref) => {
  const [formData, setFormData] = useState({
    table_number: '',
    table_name: '',
    capacity: 4,
    status: 'available',
    is_active: true
  })
  const [errors, setErrors] = useState({})

  // Load table data for edit mode
  useEffect(() => {
    if (mode === 'edit' && tableData) {
      setFormData({
        table_number: tableData.table_number || '',
        table_name: tableData.table_name || '',
        capacity: tableData.capacity || 4,
        status: tableData.status || 'available',
        is_active: tableData.is_active !== undefined ? tableData.is_active : true
      })
    }
  }, [mode, tableData])

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

    if (!formData.table_number.trim()) {
      newErrors.table_number = 'Table number is required'
    } else if (formData.table_number.trim().length > 50) {
      newErrors.table_number = 'Table number must be 50 characters or less'
    }

    if (formData.table_name && formData.table_name.trim().length > 255) {
      newErrors.table_name = 'Table name must be 255 characters or less'
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1'
    } else if (formData.capacity > 50) {
      newErrors.capacity = 'Capacity cannot exceed 50'
    }

    if (!['available', 'occupied', 'reserved', 'cleaning', 'maintenance'].includes(formData.status)) {
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
      table_number: formData.table_number.trim(),
      table_name: formData.table_name.trim() || null,
      capacity: parseInt(formData.capacity),
      status: formData.status,
      is_active: formData.is_active,
    }

    return submitData
  }

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({
      table_number: '',
      table_name: '',
      capacity: 4,
      status: 'available',
      is_active: true
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
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'maintenance', label: 'Maintenance' }
  ]

  return (
    <div>
      <FormRow>
        <TextField
          id="table_number"
          label="Table Number"
          value={formData.table_number}
          onChange={(e) => handleChange('table_number', e.target.value)}
          invalid={!!errors.table_number}
          feedback={errors.table_number}
          required
          placeholder="e.g., T1, T2, Family-1"
          disabled={loading}
          col={12}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="table_name"
          label="Table Name (Optional)"
          value={formData.table_name}
          onChange={(e) => handleChange('table_name', e.target.value)}
          invalid={!!errors.table_name}
          feedback={errors.table_name}
          placeholder="e.g., Window Table, VIP Table"
          disabled={loading}
          col={12}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="capacity"
          label="Capacity"
          type="number"
          value={formData.capacity}
          onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 1)}
          invalid={!!errors.capacity}
          feedback={errors.capacity}
          required
          min={1}
          max={50}
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
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
            disabled={loading}
          />
          <label className="form-check-label" htmlFor="is_active">
            Active
          </label>
          <small className="form-text text-muted d-block">
            Inactive tables will be hidden from POS panel
          </small>
        </div>
      </FormRow>
    </div>
  )
})

TableForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  tableData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
}

TableForm.displayName = 'TableForm'

export default TableForm

