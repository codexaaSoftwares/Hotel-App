import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { FormRow, TextField, SelectField } from '../../common/FormFields'
import PropTypes from 'prop-types'

const BranchForm = forwardRef(({ 
  mode = 'create', 
  branchData = null, 
  onSubmit, 
  onCancel,
  loading = false 
}, ref) => {
  const [formData, setFormData] = useState({
    branch_name: '',
    branch_code: '',
    address: '',
    city: '',
    contact_number: '',
    email: '',
    status: 'active'
  })
  const [errors, setErrors] = useState({})

  // Load branch data for edit mode
  useEffect(() => {
    if (mode === 'edit' && branchData) {
      setFormData({
        branch_name: branchData.branch_name || '',
        branch_code: branchData.branch_code || '',
        address: branchData.address || '',
        city: branchData.city || '',
        contact_number: branchData.contact_number || '',
        email: branchData.email || '',
        status: branchData.status || 'active'
      })
    }
  }, [mode, branchData])

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

    if (!formData.branch_name.trim()) {
      newErrors.branch_name = 'Branch name is required'
    } else if (formData.branch_name.trim().length < 2) {
      newErrors.branch_name = 'Branch name must be at least 2 characters'
    }

    if (!formData.branch_code.trim()) {
      newErrors.branch_code = 'Branch code is required'
    } else if (formData.branch_code.trim().length < 2) {
      newErrors.branch_code = 'Branch code must be at least 2 characters'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = 'Contact number is required'
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.contact_number.trim())) {
      newErrors.contact_number = 'Please enter a valid contact number'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const submitData = {
      branch_name: formData.branch_name.trim(),
      branch_code: formData.branch_code.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      contact_number: formData.contact_number.trim(),
      email: formData.email.trim() || null,
      status: formData.status
    }

    onSubmit(submitData)
  }

  // Expose handleSubmit to parent component via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: handleSubmit
  }), [formData])

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  return (
    <div>
      <FormRow>
        <TextField
          id="branch_name"
          label="Branch Name"
          value={formData.branch_name}
          onChange={(e) => handleChange('branch_name', e.target.value)}
          placeholder="Enter branch name"
          required
          col={6}
          invalid={!!errors.branch_name}
          feedback={errors.branch_name}
        />
        <TextField
          id="branch_code"
          label="Branch Code"
          value={formData.branch_code}
          onChange={(e) => handleChange('branch_code', e.target.value)}
          placeholder="Enter branch code (e.g., BR001)"
          required
          col={6}
          invalid={!!errors.branch_code}
          feedback={errors.branch_code}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="address"
          label="Address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Enter complete address"
          required
          col={12}
          invalid={!!errors.address}
          feedback={errors.address}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="city"
          label="City"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="Enter city"
          required
          col={6}
          invalid={!!errors.city}
          feedback={errors.city}
        />
        <TextField
          id="contact_number"
          label="Contact Number"
          value={formData.contact_number}
          onChange={(e) => handleChange('contact_number', e.target.value)}
          placeholder="Enter contact number"
          required
          col={6}
          invalid={!!errors.contact_number}
          feedback={errors.contact_number}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Enter email (optional)"
          col={6}
          invalid={!!errors.email}
          feedback={errors.email}
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
    </div>
  )
})

BranchForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  branchData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
}

export default BranchForm

