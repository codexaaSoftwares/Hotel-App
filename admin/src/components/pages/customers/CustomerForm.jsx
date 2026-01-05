import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { FormRow, TextField, SelectField } from '../../common/FormFields'
import { Col } from 'react-bootstrap'
import PropTypes from 'prop-types'

const CustomerForm = forwardRef(({ 
  mode = 'create', 
  customerData = null, 
  branches = [],
  onSubmit, 
  onCancel,
  loading = false 
}, ref) => {
  const [formData, setFormData] = useState({
    job_code: '',
    first_name: '',
    last_name: '',
    phone: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    dob: '',
    anniversary_date: '',
    branch_id: '',
    status: 'active',
    notes: ''
  })
  const [errors, setErrors] = useState({})

  // Load customer data for edit mode
  useEffect(() => {
    if (mode === 'edit' && customerData) {
      const addressLine = customerData.address_line 
        ?? (typeof customerData.address === 'string' ? customerData.address : customerData.address?.street)
        ?? ''

      const city = customerData.city ?? customerData.address?.city ?? ''
      const state = customerData.state ?? customerData.address?.state ?? ''
      const postal = customerData.postal_code ?? customerData.postalCode ?? customerData.address?.postalCode ?? ''
      const country = customerData.country ?? customerData.address?.country ?? ''

      setFormData({
        job_code: customerData.job_code || customerData.jobCode || '',
        first_name: customerData.first_name || customerData.firstName || '',
        last_name: customerData.last_name || customerData.lastName || '',
        phone: customerData.phone || '',
        mobile: customerData.mobile || customerData.phone || '',
        email: customerData.email || '',
        address: addressLine,
        city,
        state,
        postal_code: postal,
        country,
        dob: customerData.dob ? customerData.dob.split('T')[0] : '',
        anniversary_date: customerData.anniversary_date ? customerData.anniversary_date.split('T')[0] : '',
        branch_id: customerData.branch_id || '',
        status: customerData.status || 'active',
        notes: customerData.notes || ''
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

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters'
    }

    if (!formData.phone.trim() && !formData.mobile.trim()) {
      newErrors.phone = 'Phone or mobile number is required'
    } else {
      const phoneValue = formData.phone.trim() || formData.mobile.trim()
      if (!/^[\d\s\+\-\(\)]+$/.test(phoneValue)) {
        newErrors.phone = 'Please enter a valid phone number'
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.branch_id) {
      newErrors.branch_id = 'Branch selection is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const submitData = {
      job_code: formData.job_code.trim() || null,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim() || null,
      phone: formData.phone.trim() || formData.mobile.trim(),
      mobile: formData.mobile.trim() || formData.phone.trim(),
      email: formData.email.trim() || null,
      address: formData.address.trim() || null,
      city: formData.city.trim() || null,
      state: formData.state.trim() || null,
      postal_code: formData.postal_code.trim() || null,
      country: formData.country.trim() || null,
      dob: formData.dob || null,
      anniversary_date: formData.anniversary_date || null,
      branch_id: parseInt(formData.branch_id),
      status: formData.status,
      notes: formData.notes.trim() || null,
    }

    onSubmit(submitData)
  }

  // Expose handleSubmit to parent component via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: handleSubmit
  }), [formData])

  const branchOptions = [
    { value: '', label: 'Select Branch' },
    ...branches.map(branch => ({
      value: branch.id.toString(),
      label: `${branch.branch_name} (${branch.branch_code})`
    }))
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  return (
    <div>
      <FormRow>
        <TextField
          id="job_code"
          label="Job Code"
          value={formData.job_code}
          onChange={(e) => handleChange('job_code', e.target.value)}
          placeholder="Enter job code (optional)"
          col={6}
          labelClassName="fw-bold"
        />
        <SelectField
          id="branch_id"
          label="Branch"
          value={formData.branch_id}
          onChange={(e) => handleChange('branch_id', e.target.value)}
          options={branchOptions}
          required
          col={6}
          invalid={!!errors.branch_id}
          feedback={errors.branch_id}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="first_name"
          label="First Name"
          value={formData.first_name}
          onChange={(e) => handleChange('first_name', e.target.value)}
          placeholder="Enter first name"
          required
          col={6}
          invalid={!!errors.first_name}
          feedback={errors.first_name}
        />
        <TextField
          id="last_name"
          label="Last Name"
          value={formData.last_name}
          onChange={(e) => handleChange('last_name', e.target.value)}
          placeholder="Enter last name (optional)"
          col={6}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="phone"
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="Enter phone number"
          required
          col={6}
          invalid={!!errors.phone}
          feedback={errors.phone}
        />
        <TextField
          id="mobile"
          label="Mobile Number"
          value={formData.mobile}
          onChange={(e) => handleChange('mobile', e.target.value)}
          placeholder="Enter alternate mobile (optional)"
          col={6}
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
      </FormRow>

      <FormRow>
        <Col md={12}>
          <TextField
            id="address"
            label="Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter address (optional)"
            col={12}
          />
        </Col>
      </FormRow>

      <FormRow>
        <TextField
          id="city"
          label="City"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="Enter city"
          col={3}
        />
        <TextField
          id="state"
          label="State"
          value={formData.state}
          onChange={(e) => handleChange('state', e.target.value)}
          placeholder="Enter state"
          col={3}
        />
        <TextField
          id="postal_code"
          label="Postal Code"
          value={formData.postal_code}
          onChange={(e) => handleChange('postal_code', e.target.value)}
          placeholder="Enter postal code"
          col={3}
        />
        <TextField
          id="country"
          label="Country"
          value={formData.country}
          onChange={(e) => handleChange('country', e.target.value)}
          placeholder="Enter country"
          col={3}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="dob"
          label="Date of Birth"
          type="date"
          value={formData.dob}
          onChange={(e) => handleChange('dob', e.target.value)}
          col={6}
        />
        <TextField
          id="anniversary_date"
          label="Anniversary Date"
          type="date"
          value={formData.anniversary_date}
          onChange={(e) => handleChange('anniversary_date', e.target.value)}
          col={6}
        />
      </FormRow>

      <FormRow>
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
          id="notes"
          label="Notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Add internal notes"
          col={12}
          as="textarea"
          rows={3}
        />
      </FormRow>
    </div>
  )
})

CustomerForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  customerData: PropTypes.object,
  branches: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
}

export default CustomerForm

