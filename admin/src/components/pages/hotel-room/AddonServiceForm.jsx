import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import { FormRow, TextField, SelectField } from '../../common/FormFields'
import PropTypes from 'prop-types'

const AddonServiceForm = forwardRef(({
  mode = 'create',
  serviceData = null,
  onSubmit,
  onCancel,
  loading = false
}, ref) => {
  const [formData, setFormData] = useState({
    name: '',
    charge: 0,
    status: 'active'
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (mode === 'edit' && serviceData) {
      setFormData({
        name: serviceData.name || '',
        charge: serviceData.charge ?? 0,
        status: serviceData.status || 'active'
      })
    }
  }, [mode, serviceData])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required'
    } else if (formData.name.trim().length > 255) {
      newErrors.name = 'Service name must be 255 characters or less'
    }

    if (formData.charge === null || formData.charge === undefined || formData.charge < 0) {
      newErrors.charge = 'Charge must be 0 or greater'
    }

    if (!['active', 'inactive'].includes(formData.status)) {
      newErrors.status = 'Invalid status'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return null

    return {
      name: formData.name.trim(),
      charge: parseFloat(formData.charge) || 0,
      status: formData.status,
    }
  }

  const resetForm = useCallback(() => {
    setFormData({ name: '', charge: 0, status: 'active' })
    setErrors({})
  }, [])

  useEffect(() => {
    if (mode === 'create') resetForm()
  }, [mode, resetForm])

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
          label="Service Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          invalid={!!errors.name}
          feedback={errors.name}
          required
          placeholder="e.g., Extra Bed (pc), Laundry (pc)"
          disabled={loading}
          col={12}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="charge"
          label="Charge (₹)"
          type="number"
          value={formData.charge}
          onChange={(e) => handleChange('charge', parseFloat(e.target.value) || 0)}
          invalid={!!errors.charge}
          feedback={errors.charge}
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
    </div>
  )
})

AddonServiceForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  serviceData: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
}

AddonServiceForm.displayName = 'AddonServiceForm'

export default AddonServiceForm
