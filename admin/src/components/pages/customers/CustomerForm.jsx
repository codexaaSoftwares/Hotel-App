import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { FormRow, TextField, SelectField, TextAreaField } from '../../common/FormFields'
import PropTypes from 'prop-types'

const CustomerForm = forwardRef(({ 
  mode = 'create', 
  customerData = null, 
  onSubmit, 
  onCancel,
  loading = false 
}, ref) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    customer_type: 'regular',
    status: 'active',
    notes: '',
  })
  const [errors, setErrors] = useState({})

  // Load customer data for edit mode
  useEffect(() => {
    if (mode === 'edit' && customerData) {
      setFormData({
        name: customerData.name || '',
        mobile: customerData.mobile || '',
        email: customerData.email || '',
        address: customerData.address || '',
        city: customerData.city || '',
        state: customerData.state || '',
        pincode: customerData.pincode || '',
        customer_type: customerData.customerType || 'regular',
        status: customerData.status || 'active',
        notes: customerData.notes || '',
      })
    }
  }, [mode, customerData])

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
      newErrors.name = 'Customer name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Customer name must be at least 2 characters'
    }

    if (formData.mobile && formData.mobile.trim()) {
      const mobileRegex = /^[0-9]{10}$/
      const cleanedMobile = formData.mobile.replace(/\D/g, '')
      if (!mobileRegex.test(cleanedMobile)) {
        newErrors.mobile = 'Mobile number must be 10 digits'
      }
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
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
      mobile: formData.mobile.trim() || null,
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
      city: formData.city.trim() || null,
      state: formData.state.trim() || null,
      pincode: formData.pincode.trim() || null,
      customer_type: formData.customer_type,
      status: formData.status,
      notes: formData.notes.trim() || null,
    }

    return submitData
  }

  // Reset form to initial state
  const resetForm = React.useCallback(() => {
    setFormData({
      name: '',
      mobile: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      customer_type: 'regular',
      status: 'active',
      notes: '',
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

  return (
    <div>
      <FormRow>
        <SelectField
          id="customer_type"
          label="Customer Type"
          value={formData.customer_type}
          onChange={(e) => handleChange('customer_type', e.target.value)}
          invalid={!!errors.customer_type}
          feedback={errors.customer_type}
          col={6}
          options={[
            { value: 'regular', label: 'Regular' },
            { value: 'credit', label: 'Credit (Udhar)' },
          ]}
        />
        <SelectField
          id="status"
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          invalid={!!errors.status}
          feedback={errors.status}
          col={6}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="name"
          label="Customer Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          invalid={!!errors.name}
          feedback={errors.name}
          required
          placeholder="Enter customer name"
          col={12}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="mobile"
          label="Mobile Number"
          value={formData.mobile}
          onChange={(e) => handleChange('mobile', e.target.value)}
          invalid={!!errors.mobile}
          feedback={errors.mobile}
          placeholder="Enter 10-digit mobile number"
          maxLength={10}
          col={6}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          invalid={!!errors.email}
          feedback={errors.email}
          placeholder="Enter email address"
          col={6}
        />
      </FormRow>

      <FormRow>
        <TextAreaField
          id="address"
          label="Address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          invalid={!!errors.address}
          feedback={errors.address}
          placeholder="Enter full address"
          rows={3}
          col={12}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="city"
          label="City"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
          invalid={!!errors.city}
          feedback={errors.city}
          placeholder="Enter city"
          col={4}
        />
        <TextField
          id="state"
          label="State"
          value={formData.state}
          onChange={(e) => handleChange('state', e.target.value)}
          invalid={!!errors.state}
          feedback={errors.state}
          placeholder="Enter state"
          col={4}
        />
        <TextField
          id="pincode"
          label="PIN Code"
          value={formData.pincode}
          onChange={(e) => handleChange('pincode', e.target.value)}
          invalid={!!errors.pincode}
          feedback={errors.pincode}
          placeholder="Enter PIN code"
          maxLength={10}
          col={4}
        />
      </FormRow>

      <FormRow>
        <TextAreaField
          id="notes"
          label="Notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          invalid={!!errors.notes}
          feedback={errors.notes}
          placeholder="Additional notes about the customer"
          rows={3}
          col={12}
        />
      </FormRow>
    </div>
  )
})

CustomerForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  customerData: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
}

CustomerForm.displayName = 'CustomerForm'

export default CustomerForm

