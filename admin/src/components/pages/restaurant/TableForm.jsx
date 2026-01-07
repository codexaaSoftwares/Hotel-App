import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
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
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  // Expose handleSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    handleSubmit
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
          label="Table Number"
          name="table_number"
          value={formData.table_number}
          onChange={(e) => handleChange('table_number', e.target.value)}
          error={errors.table_number}
          required
          placeholder="e.g., T1, T2, Family-1"
          disabled={loading}
        />
      </FormRow>

      <FormRow>
        <TextField
          label="Table Name (Optional)"
          name="table_name"
          value={formData.table_name}
          onChange={(e) => handleChange('table_name', e.target.value)}
          error={errors.table_name}
          placeholder="e.g., Window Table, VIP Table"
          disabled={loading}
        />
      </FormRow>

      <FormRow>
        <TextField
          label="Capacity"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 1)}
          error={errors.capacity}
          required
          min={1}
          max={50}
          disabled={loading}
        />
      </FormRow>

      <FormRow>
        <SelectField
          label="Status"
          name="status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          error={errors.status}
          options={statusOptions}
          disabled={loading}
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

