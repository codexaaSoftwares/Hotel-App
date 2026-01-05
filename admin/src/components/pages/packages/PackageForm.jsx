import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { FormRow, TextField, SelectField } from '../../common/FormFields'
import { Form, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'
import packageService from '../../../services/packageService'

const PackageForm = forwardRef(({ 
  mode = 'create', 
  packageData = null, 
  onSubmit, 
  onCancel,
  loading = false 
}, ref) => {
  const [formData, setFormData] = useState({
    package_name: '',
    package_type: '',
    default_price: '',
    description: '',
    status: 'active'
  })
  const [errors, setErrors] = useState({})
  const [packageTypes, setPackageTypes] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(true)

  // Load package types from API
  useEffect(() => {
    const loadPackageTypes = async () => {
      try {
        setLoadingTypes(true)
        const types = await packageService.getPackageTypes()
        setPackageTypes(types)
      } catch (error) {
        console.error('Error loading package types:', error)
        // Fallback to empty array, will use default from service
        setPackageTypes([])
      } finally {
        setLoadingTypes(false)
      }
    }
    loadPackageTypes()
  }, [])

  // Load package data for edit mode
  useEffect(() => {
    if (mode === 'edit' && packageData) {
      setFormData({
        package_name: packageData.package_name || '',
        package_type: packageData.package_type || '',
        default_price: packageData.default_price || '',
        description: packageData.description || '',
        status: packageData.status || 'active'
      })
    }
  }, [mode, packageData])

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

    if (!formData.package_name.trim()) {
      newErrors.package_name = 'Package name is required'
    } else if (formData.package_name.trim().length < 2) {
      newErrors.package_name = 'Package name must be at least 2 characters'
    }

    if (!formData.package_type) {
      newErrors.package_type = 'Package type is required'
    }

    if (!formData.default_price || parseFloat(formData.default_price) < 0) {
      newErrors.default_price = 'Default price is required and must be >= 0'
    } else if (isNaN(parseFloat(formData.default_price))) {
      newErrors.default_price = 'Please enter a valid price'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const submitData = {
      package_name: formData.package_name.trim(),
      package_type: formData.package_type,
      default_price: parseFloat(formData.default_price),
      description: formData.description.trim() || null,
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
          id="package_name"
          label="Package Name"
          value={formData.package_name}
          onChange={(e) => handleChange('package_name', e.target.value)}
          placeholder="Enter package name"
          required
          col={6}
          invalid={!!errors.package_name}
          feedback={errors.package_name}
        />
        <SelectField
          id="package_type"
          label="Package Type"
          value={formData.package_type}
          onChange={(e) => handleChange('package_type', e.target.value)}
          options={[
            { value: '', label: loadingTypes ? 'Loading...' : 'Select Package Type' },
            ...packageTypes
          ]}
          required
          col={6}
          invalid={!!errors.package_type}
          feedback={errors.package_type}
          disabled={loadingTypes}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="default_price"
          label="Default Price"
          type="number"
          min="0"
          step="0.01"
          value={formData.default_price}
          onChange={(e) => handleChange('default_price', e.target.value)}
          placeholder="Enter default price"
          required
          col={6}
          invalid={!!errors.default_price}
          feedback={errors.default_price}
          helpText="Default price for this package (can be edited per order)"
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
        <Col md={12}>
          <Form.Label htmlFor="description" className="fw-semibold">
            Description
          </Form.Label>
          <Form.Control
            as="textarea"
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter package description (optional)"
            className="border-2"
          />
        </Col>
      </FormRow>
    </div>
  )
})

PackageForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  packageData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
}

export default PackageForm

