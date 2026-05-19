import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { FormRow, TextField, SelectField, TextAreaField } from '../../common/FormFields'
import PropTypes from 'prop-types'

const StaffForm = forwardRef(
  ({ mode = 'create', staffData = null, onSubmit, onCancel, loading = false }, ref) => {
    const [formData, setFormData] = useState({
      name: '',
      mobile: '',
      department: '',
      salaryType: 'monthly',
      salaryAmount: '',
      joiningDate: '',
      address: '',
      documentInfo: '',
      status: 'active',
    })
    const [errors, setErrors] = useState({})

    // Load staff data for edit mode
    useEffect(() => {
      if (mode === 'edit' && staffData) {
        setFormData({
          name: staffData.name || '',
          mobile: staffData.mobile || '',
          department: staffData.department || '',
          salaryType: staffData.salaryType || 'monthly',
          salaryAmount: staffData.salaryAmount || '',
          joiningDate: staffData.joiningDate || '',
          address: staffData.address || '',
          documentInfo: staffData.documentInfo || '',
          status: staffData.status || 'active',
        })
      }
    }, [mode, staffData])

    const handleChange = (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }))
      }
    }

    const validateForm = () => {
      const newErrors = {}

      if (!formData.name.trim()) {
        newErrors.name = 'Staff name is required'
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Staff name must be at least 2 characters'
      }

      if (formData.mobile && formData.mobile.trim()) {
        const mobileRegex = /^[0-9]{10}$/
        const cleanedMobile = formData.mobile.replace(/\D/g, '')
        if (!mobileRegex.test(cleanedMobile)) {
          newErrors.mobile = 'Mobile number must be 10 digits'
        }
      }

      if (!formData.department || !formData.department.trim()) {
        newErrors.department = 'Department is required'
      }

      if (!formData.salaryType) {
        newErrors.salaryType = 'Salary type is required'
      }

      if (!formData.salaryAmount || parseFloat(formData.salaryAmount) <= 0) {
        newErrors.salaryAmount = 'Salary amount must be greater than 0'
      }

      if (!formData.joiningDate) {
        newErrors.joiningDate = 'Joining date is required'
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
        department: formData.department.trim(),
        salaryType: formData.salaryType,
        salaryAmount: parseFloat(formData.salaryAmount),
        joiningDate: formData.joiningDate,
        address: formData.address.trim() || null,
        documentInfo: formData.documentInfo.trim() || null,
        status: formData.status,
      }

      return submitData
    }

    // Reset form to initial state
    const resetForm = React.useCallback(() => {
      setFormData({
        name: '',
        mobile: '',
        department: '',
        salaryType: 'monthly',
        salaryAmount: '',
        joiningDate: '',
        address: '',
        documentInfo: '',
        status: 'active',
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

    const salaryTypeOptions = [
      { value: 'monthly', label: 'Monthly' },
      { value: 'other', label: 'Other' },
    ]

    const statusOptions = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ]

    return (
      <div>
        <FormRow>
          <TextField
            id="name"
            label="Staff Name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter staff name"
            required
            invalid={!!errors.name}
            feedback={errors.name}
            col={6}
          />
          <TextField
            id="mobile"
            label="Mobile Number"
            type="text"
            value={formData.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
            placeholder="Enter 10-digit mobile number"
            invalid={!!errors.mobile}
            feedback={errors.mobile}
            col={6}
          />
        </FormRow>

        <FormRow>
          <TextField
            id="department"
            label="Department"
            type="text"
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            placeholder="Enter department (e.g., Cook, Helper, Cleaner, Cashier)"
            required
            invalid={!!errors.department}
            feedback={errors.department}
            col={6}
          />
          <SelectField
            id="salaryType"
            label="Salary Type"
            value={formData.salaryType}
            onChange={(e) => handleChange('salaryType', e.target.value)}
            options={salaryTypeOptions}
            required
            invalid={!!errors.salaryType}
            feedback={errors.salaryType}
            col={6}
          />
        </FormRow>

        <FormRow>
          <TextField
            id="salaryAmount"
            label="Salary Amount"
            type="number"
            value={formData.salaryAmount}
            onChange={(e) => handleChange('salaryAmount', e.target.value)}
            placeholder="Enter salary amount"
            required
            invalid={!!errors.salaryAmount}
            feedback={errors.salaryAmount}
            helpText={formData.salaryType === 'other' ? 'Other salary amount' : 'Monthly salary amount'}
            col={6}
          />
          <TextField
            id="joiningDate"
            label="Joining Date"
            type="date"
            value={formData.joiningDate}
            onChange={(e) => handleChange('joiningDate', e.target.value)}
            required
            invalid={!!errors.joiningDate}
            feedback={errors.joiningDate}
            col={6}
          />
        </FormRow>

        <FormRow>
          <TextAreaField
            id="address"
            label="Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter staff address"
            rows={3}
            col={12}
          />
        </FormRow>

        <FormRow>
          <TextAreaField
            id="documentInfo"
            label="Document Info"
            value={formData.documentInfo}
            onChange={(e) => handleChange('documentInfo', e.target.value)}
            placeholder="Enter document information (Aadhar, PAN, etc.)"
            rows={3}
            col={6}
          />
          <SelectField
            id="status"
            label="Status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={statusOptions}
            col={6}
          />
        </FormRow>
      </div>
    )
  }
)

StaffForm.displayName = 'StaffForm'

StaffForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  staffData: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
}

export default StaffForm

