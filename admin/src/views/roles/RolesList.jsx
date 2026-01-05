import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Container, Row, Col, Button, Form, FormControl, FormSelect, InputGroup, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPencil, faTrash, faInfo, faMagnifyingGlass, faLock } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../components'
import { Table, Modal, FormModal } from '../../components'
import RoleForm from '../../components/pages/roles/RoleForm'
import { usePermissions, useRoleManagement, useDebounce } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const RolesList = () => {
  const {
    roles,
    meta,
    loading: rolesLoading,
    error: rolesError,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  } = useRoleManagement()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortState, setSortState] = useState({
    columnKey: 'createdAt',
    sortBy: 'created_at',
    sortDirection: 'desc',
  })
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roleToEdit, setRoleToEdit] = useState(null)
  const [roleToView, setRoleToView] = useState(null)
  const [roleToDelete, setRoleToDelete] = useState(null)

  const [createRoleLoading, setCreateRoleLoading] = useState(false)
  const [editRoleLoading, setEditRoleLoading] = useState(false)
  const [deleteRoleLoading, setDeleteRoleLoading] = useState(false)
  
  // Form refs
  const addRoleFormRef = useRef()
  const editRoleFormRef = useRef()
  
  const { hasPermission } = usePermissions()
  const { success: showSuccess, error: showError, warning: showWarning } = useToast()
  const debouncedSearch = useDebounce(searchTerm, 400)

  // Check canonical permissions first (more specific), then fall back to aliases
  const canCreateRole = hasPermission('create_role')
  const canUpdateRole = hasPermission('edit_role')
  const canDeleteRole = hasPermission('delete_role')
  const canViewRole = hasPermission('view_role') || hasPermission(PERMISSIONS.ROLE_READ)

  const fetchRolesWithParams = useCallback(async () => {
    const searchValue = (debouncedSearch || '').trim()

    await fetchRoles({
      page: currentPage,
      limit: pageSize,
      search: searchValue || undefined,
      active: statusFilter === '' ? undefined : statusFilter === 'active',
      sortBy: sortState.sortBy,
      sortDirection: sortState.sortDirection,
    })
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    statusFilter,
    sortState.sortBy,
    sortState.sortDirection,
    fetchRoles,
  ])

  useEffect(() => {
    if (!canViewRole) {
      showWarning && showWarning('You do not have permission to view roles.', { title: 'Access restricted' })
      return
    }
    fetchRolesWithParams()
  }, [canViewRole, fetchRolesWithParams, showWarning])

  if (!canViewRole) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FontAwesomeIcon icon={faLock} className="text-muted mb-3" size="3x" />
            <h4 className="text-muted">Access Restricted</h4>
            <p className="text-muted">
              You do not have permission to view role information. Please contact your administrator if you need additional access.
            </p>
          </Col>
        </Row>
      </Container>
    )
  }

  useEffect(() => {
    if (rolesError) {
      showError(rolesError)
    }
  }, [rolesError, showError])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleAddRole = () => {
    if (!canCreateRole) {
      showError('You do not have permission to create roles')
      return
    }
    setShowAddModal(true)
  }

  const handleOpenEditModal = (role) => {
    if (!canUpdateRole) {
      showError('You do not have permission to update roles')
      return
    }
    setRoleToEdit(role)
    setShowEditModal(true)
  }

  const handleViewRole = (role) => {
    setRoleToView(role)
    setShowViewModal(true)
  }

  const handleDeleteRole = (role) => {
    if (!canDeleteRole) {
      showError('You do not have permission to delete roles')
      return
    }
    setRoleToDelete(role)
    setShowDeleteModal(true)
  }

  const handleAddRoleSubmit = async (formData) => {
    if (!canCreateRole) {
      showError('You do not have permission to create roles')
      return
    }

    setCreateRoleLoading(true)
    try {
      const response = await createRole(formData)
      if (response.success) {
        showSuccess('Role created successfully!')
        setShowAddModal(false)
        await fetchRolesWithParams()
      } else {
        showError(response.message || 'Failed to create role')
      }
    } catch (err) {
      showError(err.message || 'Failed to create role')
    } finally {
      setCreateRoleLoading(false)
    }
  }

  const handleEditRoleSubmit = async (formData) => {
    if (!roleToEdit) return

    if (!canUpdateRole) {
      showError('You do not have permission to update roles')
      return
    }

    setEditRoleLoading(true)
    try {
      const response = await updateRole(roleToEdit.id, formData)
      if (response.success) {
        showSuccess('Role updated successfully!')
        setShowEditModal(false)
        setRoleToEdit(null)
        await fetchRolesWithParams()
      } else {
        showError(response.message || 'Failed to update role')
      }
    } catch (err) {
      showError(err.message || 'Failed to update role')
    } finally {
      setEditRoleLoading(false)
    }
  }

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return

    if (!canDeleteRole) {
      showError('You do not have permission to delete roles')
      return
    }

    setDeleteRoleLoading(true)
    try {
      const response = await deleteRole(roleToDelete.id)
      if (response.success) {
        showSuccess('Role deleted successfully!')
        setShowDeleteModal(false)
        setRoleToDelete(null)
        await fetchRolesWithParams()
      } else {
        showError(response.message || 'Failed to delete role')
      }
    } catch (err) {
      showError(err.message || 'Failed to delete role')
    } finally {
      setDeleteRoleLoading(false)
    }
  }

  const roleStats = useMemo(() => {
    const visibleRoles = roles || []
    const active = visibleRoles.filter((role) => role.isActive).length
    const inactive = visibleRoles.length - active
    const totalPermissions = visibleRoles.reduce(
      (sum, role) => sum + (role.permissions?.length || 0),
      0
    )

    return {
      total: meta?.total ?? visibleRoles.length,
      active,
      inactive,
      totalPermissions,
    }
  }, [roles, meta])

  const sortKeyMap = {
    name: 'name',
    status: 'is_active',
    createdAt: 'created_at',
  }

  const handleSortChange = (columnKey, direction) => {
    const sortBy = sortKeyMap[columnKey]
    if (!sortBy) {
      return
    }
    setSortState({
      columnKey,
      sortBy,
      sortDirection: direction,
    })
    setCurrentPage(1)
  }

  const columns = [
    {
      key: 'name',
      label: 'Role Name',
      render: (value, role, index) => (
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faLock} className="me-2 text-primary" />
          <div>
            <div className="fw-semibold">{role.name}</div>
            <small className="text-muted">{role.description}</small>
          </div>
        </div>
      )
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (value, role, index) => (
        <div>
          <span className="fw-semibold text-info">
            {role.permissions?.length || 0} permissions
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, role, index) => (
        <span
          className={`fw-semibold ${
            role.isActive ? 'text-success' : 'text-secondary'
          }`}
        >
          {role.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value, role, index) => new Date(role.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, role, index) => (
        <div className="d-flex gap-2">
          {canViewRole && (
            <Button
              variant="info"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleViewRole(role)
              }}
              title="View Role"
            >
              <FontAwesomeIcon icon={faInfo} />
            </Button>
          )}
          {canUpdateRole && (
            <Button
              variant="warning"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenEditModal(role)
              }}
              title="Edit Role"
            >
              <FontAwesomeIcon icon={faPencil} />
            </Button>
          )}
          {canDeleteRole && (
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteRole(role)
              }}
              title="Delete Role"
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <Container fluid className="px-0 px-xl-3">
      <Row className="g-4">
        <Col xs={12}>
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div>
              <h2 className="mb-1 text-dark">Roles &amp; Permissions</h2>
              <p className="text-muted mb-0">
                Configure access policies, assign capabilities, and maintain a secure workspace.
              </p>
            </div>
            {canCreateRole && (
              <div className="ms-auto">
                <Button
                  variant="primary"
                  className="shadow-sm text-white"
                  onClick={handleAddRole}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Create Role
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3 shadow-sm p-4">
            <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-primary border-2">
              <FontAwesomeIcon icon={faLock} className="me-3 text-primary fs-4" />
              <div>
                <h4 className="mb-1 text-primary">Access Control Center</h4>
                <span className="text-muted">Total of {roleStats.total} roles in view</span>
              </div>
              <Badge bg="light" text="primary" className="ms-auto border border-primary fw-semibold">
                {roleStats.totalPermissions} Permission assignments
              </Badge>
            </div>

            <Row className="g-3 mb-4">
              <Col md={4} sm={6}>
                <div className="rounded-3 border border-light-subtle p-3 bg-gradient-primary-subtle h-100">
                  <p className="text-uppercase text-muted mb-1 small">Active Roles</p>
                  <div className="d-flex align-items-end">
                    <h3 className="mb-0 text-primary fw-semibold">{roleStats.active}</h3>
                    <span className="ms-2 text-muted">assigned</span>
                  </div>
                </div>
              </Col>
              <Col md={4} sm={6}>
                <div className="rounded-3 border border-light-subtle p-3 bg-gradient-info h-100 text-white">
                  <p className="text-uppercase mb-1 small opacity-75">Total Roles</p>
                  <div className="d-flex align-items-end">
                    <h3 className="mb-0 fw-semibold">{roleStats.total}</h3>
                    <span className="ms-2 opacity-75">configurations</span>
                  </div>
                </div>
              </Col>
              <Col md={4} sm={12}>
                <div className="rounded-3 border border-light-subtle p-3 bg-gradient-warning h-100">
                  <p className="text-uppercase text-muted mb-1 small">Inactive Roles</p>
                  <div className="d-flex align-items-end">
                    <h3 className="mb-0 text-warning fw-semibold">{roleStats.inactive}</h3>
                    <span className="ms-2 text-muted">disabled</span>
                  </div>
                </div>
              </Col>
            </Row>

            <Form className="mb-4">
              <Row className="g-3 align-items-end">
                <Col md={6} sm={12}>
                  <Form.Label className="fw-semibold text-muted">Search</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-2 text-muted">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </InputGroup.Text>
                    <FormControl
                      placeholder="Search by name or description"
                      value={searchTerm}
                      onChange={handleSearch}
                      className="border-2"
                    />
                  </InputGroup>
                </Col>
                <Col md={3} sm={6}>
                  <Form.Label className="fw-semibold text-muted">Status</Form.Label>
                  <FormSelect
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="border-2"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </FormSelect>
                </Col>
                <Col md={3} sm={6}>
                  <Form.Label className="fw-semibold text-muted">Quick Insights</Form.Label>
                  <div className="d-flex gap-2">
                    <Badge bg="secondary" className="bg-gradient-primary text-white">
                      {roleStats.totalPermissions} Permissions
                    </Badge>
                    <Badge bg="secondary" className="bg-gradient-success text-white">
                      {roleStats.active} Active
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Form>
            
            <Table
              data={roles}
              columns={columns}
              loading={rolesLoading}
              hover
              pagination={true}
              sortable={true}
              sortableColumns={Object.keys(sortKeyMap)}
              serverSide={true}
              meta={meta}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setCurrentPage(1)
              }}
              sortBy={sortState.columnKey}
              sortDirection={sortState.sortDirection}
              onSortChange={handleSortChange}
            />
          </div>
        </Col>
      </Row>

      {/* Add Role Modal */}
      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Role"
        size="xl"
        onSubmit={() => addRoleFormRef.current?.handleSubmit()}
        confirmText="Create Role"
        cancelText="Cancel"
        loading={createRoleLoading}
      >
        <RoleForm
          ref={addRoleFormRef}
          mode="create"
          onSubmit={handleAddRoleSubmit}
          onCancel={() => setShowAddModal(false)}
          loading={createRoleLoading}
        />
      </FormModal>

      {/* Edit Role Modal */}
      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setRoleToEdit(null)
        }}
        title="Edit Role"
        size="xl"
        onSubmit={() => editRoleFormRef.current?.handleSubmit()}
        confirmText="Update Role"
        cancelText="Cancel"
        loading={editRoleLoading}
      >
        <RoleForm
          ref={editRoleFormRef}
          mode="edit"
          roleData={roleToEdit}
          onSubmit={handleEditRoleSubmit}
          onCancel={() => {
            setShowEditModal(false)
            setRoleToEdit(null)
          }}
          loading={editRoleLoading}
        />
      </FormModal>

      {/* View Role Modal */}
      <Modal
        visible={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setRoleToView(null)
        }}
        title="Role Details"
        size="xl"
        showFooter={false}
        type="info"
      >
        {roleToView && (
          <div className="row">
            <div className="col-md-4 text-center mb-3">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold"
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#6c757d'
                }}
              >
                <FontAwesomeIcon icon={faLock} size="2xl" />
              </div>
              <h5 className="mt-2 mb-0">{roleToView.name}</h5>
              <p className="text-muted mb-0">{roleToView.description}</p>
            </div>
            <div className="col-md-8">
              <div className="row mb-3">
                <div className="col-sm-4"><strong>Role Name:</strong></div>
                <div className="col-sm-8">{roleToView.name}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4"><strong>Description:</strong></div>
                <div className="col-sm-8">{roleToView.description}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4"><strong>Status:</strong></div>
                <div className="col-sm-8">
                  <span
                    className={`fw-semibold ${
                      roleToView.isActive ? 'text-success' : 'text-secondary'
                    }`}
                  >
                    {roleToView.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4"><strong>Permissions:</strong></div>
                <div className="col-sm-8">
                  <span className="fw-semibold text-info">
                    {roleToView.permissions?.length || 0} permissions
                  </span>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4"><strong>Created:</strong></div>
                <div className="col-sm-8">{new Date(roleToView.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4"><strong>Last Updated:</strong></div>
                <div className="col-sm-8">{new Date(roleToView.updatedAt || roleToView.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Role"
        onConfirm={confirmDeleteRole}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteRoleLoading}
      >
        <p>Are you sure you want to delete role <strong>{roleToDelete?.name}</strong>?</p>
        <p className="text-muted">This action cannot be undone and may affect users assigned to this role.</p>
      </Modal>
    </Container>
  )
}

export default RolesList