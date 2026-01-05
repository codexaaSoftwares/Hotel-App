import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { FormRow, TextField, SelectField } from '../../common/FormFields'
import PropTypes from 'prop-types'
import { FormCheck, Col, Spinner, Alert } from 'react-bootstrap'
import permissionService from '../../../services/permissionService'

const startCase = (value = '') =>
  value
    .toString()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const RoleForm = forwardRef(({ 
  mode = 'create', 
  roleData = null, 
  onSubmit, 
  onCancel,
  loading = false 
}, ref) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    isActive: true
  })
  const [errors, setErrors] = useState({})
  const [availablePermissions, setAvailablePermissions] = useState([])
  const [permissionsLoading, setPermissionsLoading] = useState(false)
  const [permissionsError, setPermissionsError] = useState(null)

  useEffect(() => {
    const loadPermissions = async () => {
      setPermissionsLoading(true)
      setPermissionsError(null)

      const response = await permissionService.getPermissions({ groupByModule: true })
      if (response.success) {
        setAvailablePermissions(response.data || [])
      } else {
        setPermissionsError(response.message || 'Unable to load permissions.')
      }

      setPermissionsLoading(false)
    }

    loadPermissions()
  }, [])

  // Load role data for edit mode
  useEffect(() => {
    if (mode === 'edit' && roleData) {
      setFormData({
        name: roleData.name || '',
        description: roleData.description || '',
        permissions: Array.isArray(roleData.permissions)
          ? roleData.permissions
              .map((permission) => (typeof permission === 'object' ? permission.id : permission))
              .filter((permissionId) => permissionId !== undefined && permissionId !== null)
          : [],
        isActive: roleData.isActive !== undefined ? roleData.isActive : true
      })
    }
  }, [mode, roleData])

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

  const handlePermissionChange = (permissionId, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }))
  }

  const controlsDisabled = loading || permissionsLoading

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Role name must be at least 2 characters'
    }

    if (!formData.description.trim()) {
      // Description is optional, so no error for empty description
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters if provided'
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Please select at least one permission'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      permissions: formData.permissions,
      isActive: formData.isActive
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

  // Group permissions by category
  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    const moduleLabel = permission.module ? startCase(permission.module) : 'General'
    const submoduleLabel =
      permission.submodule && permission.submodule !== 'general'
        ? startCase(permission.submodule)
        : null

    const category = submoduleLabel ? `${moduleLabel} • ${submoduleLabel}` : moduleLabel

    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(permission)
    return acc
  }, {})

  return (
    <div>
      <FormRow>
        <TextField
          id="name"
          label="Role Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter role name"
          required
          col={6}
          invalid={!!errors.name}
          feedback={errors.name}
          disabled={controlsDisabled}
        />
        <SelectField
          id="status"
          label="Status"
          value={formData.isActive ? 'active' : 'inactive'}
          onChange={(e) => handleChange('isActive', e.target.value === 'active')}
          options={statusOptions}
          col={6}
          invalid={!!errors.status}
          feedback={errors.status}
          disabled={controlsDisabled}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="description"
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter role description (optional)"
          helpText="Brief description of what this role can do. (Optional)"
          col={12}
          invalid={!!errors.description}
          feedback={errors.description}
          disabled={controlsDisabled}
        />
      </FormRow>

      <FormRow>
        <Col md={12}>
          <label className="form-label">
            Permissions <span className="text-danger">*</span>
          </label>
          <div className="border rounded p-3">
            {permissionsLoading ? (
              <div className="d-flex align-items-center justify-content-center py-3">
                <Spinner animation="border" role="status" size="sm" className="me-2">
                  <span className="visually-hidden">Loading permissions...</span>
                </Spinner>
                <span>Loading permissions...</span>
              </div>
            ) : permissionsError ? (
              <Alert variant="danger" className="mb-0">
                {permissionsError}
              </Alert>
            ) : (
              <div className="row">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="col-md-6 mb-3">
                    <h6 className="text-primary">{category}</h6>
                    {permissions.map((permission) => (
                      <div key={permission.id} className="form-check">
                        <FormCheck
                          id={`permission-${permission.id}`}
                          label={permission.label}
                          checked={formData.permissions.includes(permission.id)}
                          onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                          disabled={controlsDisabled}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {errors.permissions && (
              <div className="invalid-feedback d-block text-danger mt-2">
                {errors.permissions}
              </div>
            )}
          </div>
        </Col>
      </FormRow>
    </div>
  )
})

RoleForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  roleData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
}

export default RoleForm
