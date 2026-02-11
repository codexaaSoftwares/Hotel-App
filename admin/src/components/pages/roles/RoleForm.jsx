import React, { useState, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react'
import { FormRow, TextField, SelectField } from '../../common/FormFields'
import PropTypes from 'prop-types'
import { FormCheck, Col, Spinner, Alert, Card, Badge, Row, InputGroup, Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUtensils, faHome, faBuilding, faCog, faMagnifyingGlass, faCheckDouble, faXmark } from '@fortawesome/free-solid-svg-icons'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')

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

  // Select all permissions in a submodule
  const handleSelectAllSubmodule = (permissions) => {
    const permissionIds = permissions.map(p => p.id)
    const allSelected = permissionIds.every(id => formData.permissions.includes(id))
    
    if (allSelected) {
      // Deselect all
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => !permissionIds.includes(id))
      }))
    } else {
      // Select all
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...permissionIds])]
      }))
    }
  }

  // Select all permissions in a module
  const handleSelectAllModule = (moduleKey) => {
    const moduleConfig = permissionGroups[moduleKey]
    if (!moduleConfig) return

    const allPermissionIds = []
    Object.values(moduleConfig.submodules || {}).forEach(permissions => {
      permissions.forEach(p => allPermissionIds.push(p.id))
    })

    const allSelected = allPermissionIds.length > 0 && 
      allPermissionIds.every(id => formData.permissions.includes(id))

    if (allSelected) {
      // Deselect all
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => !allPermissionIds.includes(id))
      }))
    } else {
      // Select all
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...allPermissionIds])]
      }))
    }
  }

  // Select all permissions globally
  const handleSelectAllGlobal = () => {
    const allPermissionIds = availablePermissions.map(p => p.id)
    const allSelected = allPermissionIds.length > 0 && 
      allPermissionIds.every(id => formData.permissions.includes(id))

    if (allSelected) {
      // Deselect all
      setFormData(prev => ({
        ...prev,
        permissions: []
      }))
    } else {
      // Select all
      setFormData(prev => ({
        ...prev,
        permissions: allPermissionIds
      }))
    }
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

  // Filter permissions based on search term
  const filteredPermissions = useMemo(() => {
    if (!searchTerm.trim()) {
      return availablePermissions
    }

    const search = searchTerm.toLowerCase().trim()
    return availablePermissions.filter(permission => {
      const nameMatch = permission.name?.toLowerCase().includes(search)
      const labelMatch = permission.label?.toLowerCase().includes(search)
      const descriptionMatch = permission.description?.toLowerCase().includes(search)
      const moduleMatch = permission.module?.toLowerCase().includes(search)
      const submoduleMatch = permission.submodule?.toLowerCase().includes(search)
      
      return nameMatch || labelMatch || descriptionMatch || moduleMatch || submoduleMatch
    })
  }, [availablePermissions, searchTerm])

  // Organize permissions by module groups with submodules
  const organizePermissionsByModule = useMemo(() => {
    const groups = {
      restaurant: { icon: faUtensils, color: '#0d9488', label: 'Restaurant Permissions' },
      hotel_room: { icon: faHome, color: '#0284c7', label: 'Hotel Room Permissions' },
      banquet_hall: { icon: faBuilding, color: '#d97706', label: 'Banquet Hall Permissions' },
      common: { icon: faCog, color: '#6c757d', label: 'Common Permissions' },
    }

    // Initialize submodules for each module
    Object.keys(groups).forEach((moduleKey) => {
      groups[moduleKey].submodules = {}
    })

    filteredPermissions.forEach((permission) => {
      const module = permission.module || 'common'
      const submodule = permission.submodule || 'general'
      
      if (groups[module]) {
        if (!groups[module].submodules[submodule]) {
          groups[module].submodules[submodule] = []
        }
        groups[module].submodules[submodule].push(permission)
      } else {
        if (!groups.common.submodules[submodule]) {
          groups.common.submodules[submodule] = []
        }
        groups.common.submodules[submodule].push(permission)
      }
    })

    return groups
  }, [filteredPermissions])

  const permissionGroups = organizePermissionsByModule

  // Render submodule cards for a module
  const renderSubmoduleCards = (moduleKey, moduleConfig) => {
    const submodules = moduleConfig.submodules || {}
    const submoduleEntries = Object.entries(submodules).filter(([_, permissions]) => permissions.length > 0)

    if (submoduleEntries.length === 0) {
      return null
    }

    // Check if all permissions in module are selected
    const allModulePermissionIds = []
    submoduleEntries.forEach(([_, permissions]) => {
      permissions.forEach(p => allModulePermissionIds.push(p.id))
    })
    const allModuleSelected = allModulePermissionIds.length > 0 && 
      allModulePermissionIds.every(id => formData.permissions.includes(id))

    return (
      <div className="mb-4">
        {/* Module Section Header */}
        <div 
          className="d-flex align-items-center gap-2 mb-3 p-2 rounded"
          style={{ 
            backgroundColor: `${moduleConfig.color}15`,
            borderLeft: `4px solid ${moduleConfig.color}`
          }}
        >
          <FontAwesomeIcon icon={moduleConfig.icon} style={{ color: moduleConfig.color }} />
          <h5 className="mb-0 fw-semibold" style={{ color: moduleConfig.color }}>
            {moduleConfig.label}
          </h5>
          <Badge bg="light" text="dark" className="ms-auto" style={{ borderColor: moduleConfig.color }}>
            {submoduleEntries.reduce((sum, [_, perms]) => sum + perms.length, 0)} permissions
          </Badge>
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => handleSelectAllModule(moduleKey)}
            disabled={controlsDisabled}
            style={{ 
              borderColor: moduleConfig.color,
              color: moduleConfig.color
            }}
            title={allModuleSelected ? 'Deselect All' : 'Select All'}
          >
            <FontAwesomeIcon icon={allModuleSelected ? faXmark : faCheckDouble} className="me-1" />
            {allModuleSelected ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        {/* Submodule Cards */}
        <Row className="g-3">
          {submoduleEntries.map(([submodule, permissions]) => (
            <Col key={submodule} md={6} lg={4}>
              <Card 
                className="h-100 border-2 shadow-sm" 
                style={{ 
                  borderColor: `${moduleConfig.color}40`,
                  borderTop: `3px solid ${moduleConfig.color}`
                }}
              >
                <Card.Header 
                  className="fw-semibold d-flex align-items-center justify-content-between"
                  style={{ 
                    backgroundColor: `${moduleConfig.color}10`,
                    color: moduleConfig.color
                  }}
                >
                  <span>{startCase(submodule)}</span>
                  <div className="d-flex align-items-center gap-2">
                    <Badge 
                      bg="light" 
                      text="dark" 
                      style={{ 
                        backgroundColor: `${moduleConfig.color}20`,
                        borderColor: moduleConfig.color
                      }}
                    >
                      {permissions.length}
                    </Badge>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSelectAllSubmodule(permissions)}
                      disabled={controlsDisabled}
                      className="p-0"
                      style={{ 
                        color: moduleConfig.color,
                        textDecoration: 'none',
                        minWidth: 'auto'
                      }}
                      title={permissions.every(p => formData.permissions.includes(p.id)) ? 'Deselect All' : 'Select All'}
                    >
                      <FontAwesomeIcon 
                        icon={permissions.every(p => formData.permissions.includes(p.id)) ? faXmark : faCheckDouble} 
                        size="sm"
                      />
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body className="p-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {permissions.map((permission) => (
                    <div key={permission.id} className="form-check mb-2">
                      <FormCheck
                        id={`permission-${permission.id}`}
                        label={permission.label}
                        checked={formData.permissions.includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        disabled={controlsDisabled}
                      />
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    )
  }

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
          <div className="d-flex align-items-center justify-content-between mb-3">
            <label className="form-label mb-0">
              Permissions <span className="text-danger">*</span>
              <Badge bg="info" className="ms-2">
                {formData.permissions.length} selected
              </Badge>
            </label>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleSelectAllGlobal}
              disabled={controlsDisabled}
            >
              <FontAwesomeIcon 
                icon={availablePermissions.length > 0 && availablePermissions.every(p => formData.permissions.includes(p.id)) ? faXmark : faCheckDouble} 
                className="me-1"
              />
              {availablePermissions.length > 0 && availablePermissions.every(p => formData.permissions.includes(p.id)) 
                ? 'Deselect All' 
                : 'Select All'}
            </Button>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-3">
            <Row className="g-2">
              <Col md={8}>
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </InputGroup.Text>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search permissions by name, description, module..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={controlsDisabled}
                  />
                  {searchTerm && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setSearchTerm('')}
                      disabled={controlsDisabled}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </Button>
                  )}
                </InputGroup>
              </Col>
              <Col md={4}>
                <SelectField
                  id="moduleFilter"
                  label=""
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Modules' },
                    { value: 'restaurant', label: 'Restaurant' },
                    { value: 'hotel_room', label: 'Hotel Room' },
                    { value: 'banquet_hall', label: 'Banquet Hall' },
                    { value: 'common', label: 'Common' },
                  ]}
                  col={12}
                  showLabel={false}
                  disabled={controlsDisabled}
                />
              </Col>
            </Row>
            {searchTerm && (
              <div className="mt-2">
                <small className="text-muted">
                  Found {filteredPermissions.length} permission(s) matching "{searchTerm}"
                </small>
              </div>
            )}
          </div>

          <div className="border rounded p-4">
            {permissionsLoading ? (
              <div className="d-flex align-items-center justify-content-center py-5">
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
              <div>
                {/* Restaurant Permissions */}
                {(moduleFilter === 'all' || moduleFilter === 'restaurant') && 
                  renderSubmoduleCards('restaurant', permissionGroups.restaurant)}

                {/* Hotel Room Permissions */}
                {(moduleFilter === 'all' || moduleFilter === 'hotel_room') && 
                  renderSubmoduleCards('hotel_room', permissionGroups.hotel_room)}

                {/* Banquet Hall Permissions */}
                {(moduleFilter === 'all' || moduleFilter === 'banquet_hall') && 
                  renderSubmoduleCards('banquet_hall', permissionGroups.banquet_hall)}

                {/* Common Permissions */}
                {(moduleFilter === 'all' || moduleFilter === 'common') && 
                  renderSubmoduleCards('common', permissionGroups.common)}

                {/* No results message */}
                {filteredPermissions.length === 0 && searchTerm && (
                  <Alert variant="info" className="text-center">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" />
                    No permissions found matching "{searchTerm}"
                  </Alert>
                )}
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
