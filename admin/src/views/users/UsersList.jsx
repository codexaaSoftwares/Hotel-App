import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Container, Row, Col, Button, Form, FormControl, FormSelect, InputGroup, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPencil, faTrash, faInfo, faMagnifyingGlass, faUsers } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../components'
import { useUserManagement, usePermissions, useRoleManagement, useDebounce } from '../../hooks'
import { capitalize } from '../../utils'
import { Table, Modal, FormModal, UserForm } from '../../components'
import { PERMISSIONS } from '../../constants/permissions'

const UsersList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortState, setSortState] = useState({
    columnKey: 'createdAt',
    sortBy: 'created_at',
    sortDirection: 'desc',
  })
  
  // Add User Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [addUserLoading, setAddUserLoading] = useState(false)
  
  // Edit User Modal States
  const [showEditModal, setShowEditModal] = useState(false)
  const [userToEdit, setUserToEdit] = useState(null)
  const [editUserLoading, setEditUserLoading] = useState(false)
  
  // View User Modal States
  const [showViewModal, setShowViewModal] = useState(false)
  const [userToView, setUserToView] = useState(null)
  
  // Refs for form components
  const addUserFormRef = useRef()
  const editUserFormRef = useRef()

  const { success, error, warning } = useToast()
  const { users, meta, loading, fetchUsers, createUser, updateUser, deleteUser } = useUserManagement()
  const { roles, fetchRoles, loading: rolesLoading } = useRoleManagement()
  const { hasPermission, user: currentUser } = usePermissions()
  const debouncedSearch = useDebounce(searchTerm, 400)

  const fetchUsersWithParams = useCallback(() => {
    const searchValue = (debouncedSearch || '').trim()
    return fetchUsers({
      page: currentPage,
      limit: pageSize,
      search: searchValue || undefined,
      status: statusFilter || undefined,
      role: roleFilter || undefined,
      sortBy: sortState.sortBy,
      sortDirection: sortState.sortDirection,
    })
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    statusFilter,
    roleFilter,
    sortState.sortBy,
    sortState.sortDirection,
    fetchUsers,
  ])

  // Check canonical permissions first (more specific), then fall back to aliases
  const canCreateUser = hasPermission('create_user')
  const canUpdateUser = hasPermission('edit_user')
  const canDeleteUser = hasPermission('delete_user')
  const canViewUser = hasPermission('view_user') || hasPermission(PERMISSIONS.USER_READ)

  useEffect(() => {
    if (!canViewUser) {
      warning && warning('You do not have permission to view users.', { title: 'Access restricted' })
      return
    }
    fetchRoles({ limit: 100, active: true })
  }, [canViewUser, fetchRoles, warning])

  useEffect(() => {
    if (!canViewUser) {
      return
    }

    fetchUsersWithParams()
  }, [canViewUser, fetchUsersWithParams])

  if (!canViewUser) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FontAwesomeIcon icon={faUsers} className="text-muted mb-3" size="3x" />
            <h4 className="text-muted">Access Restricted</h4>
            <p className="text-muted">
              You do not have permission to view user information. Please contact your administrator if you need additional access.
            </p>
          </Col>
        </Row>
      </Container>
    )
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleCreateUser = () => {
    if (!canCreateUser) {
      error('You do not have permission to create users')
      return
    }
    setShowAddModal(true)
  }

  const handleAddUser = async () => {
    if (!canCreateUser) {
      error('You do not have permission to create users')
      return
    }
    if (addUserFormRef.current) {
      addUserFormRef.current.handleSubmit()
    }
  }

  const handleAddUserSubmit = async (userData) => {
    if (!canCreateUser) {
      error('You do not have permission to create users')
      return
    }
    setAddUserLoading(true)
    try {
      const response = await createUser(userData)
      if (response.success) {
        success('User created successfully!')
        setShowAddModal(false)
        await fetchUsersWithParams()
      } else {
        error(response.message || 'Failed to create user')
      }
    } catch (err) {
      error(err.message || 'Failed to create user')
    } finally {
      setAddUserLoading(false)
    }
  }

  const handleEditUser = async () => {
    if (!canUpdateUser) {
      error('You do not have permission to update users')
      return
    }
    if (editUserFormRef.current) {
      editUserFormRef.current.handleSubmit()
    }
  }

  const handleEditUserSubmit = async (userData) => {
    if (!userToEdit) {
      return
    }

    if (!canUpdateUser) {
      error('You do not have permission to update users')
      return
    }

    setEditUserLoading(true)
    try {
      const response = await updateUser(userToEdit.id, userData)
      if (response.success) {
        success('User updated successfully!')
        setShowEditModal(false)
        setUserToEdit(null)
        await fetchUsersWithParams()
      } else {
        error(response.message || 'Failed to update user')
      }
    } catch (err) {
      error(err.message || 'Failed to update user')
    } finally {
      setEditUserLoading(false)
    }
  }

  const handleOpenEditModal = (user) => {
    if (!canUpdateUser) {
      error('You do not have permission to update users')
      return
    }
    setUserToEdit(user)
    setShowEditModal(true)
  }

  const handleViewUser = (user) => {
    setUserToView(user)
    setShowViewModal(true)
  }

  const handleDeleteUser = (user) => {
    if (!canDeleteUser) {
      error('You do not have permission to delete users')
      return
    }
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmDeleteUser = async () => {
    if (!canDeleteUser) {
      error('You do not have permission to delete users')
      return
    }
    try {
      const response = await deleteUser(userToDelete.id)
      if (response.success) {
        success('User deleted successfully!')
        setShowDeleteModal(false)
        setUserToDelete(null)
        await fetchUsersWithParams()
      } else {
        error(response.message || 'Failed to delete user')
      }
    } catch (err) {
      error(err.message || 'Failed to delete user')
    }
  }

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      error('Please select users to delete')
      return
    }
    if (!canDeleteUser) {
      error('You do not have permission to delete users')
      return
    }
    // Implement bulk delete functionality when API is ready
  }

  const roleOptions = useMemo(() => {
    const activeRoles = roles.filter((role) => !role.isDeleted && role.isActive !== false)

    if (!hasPermission) {
      return activeRoles.map((role) => ({
        value: role.id,
        label: capitalize(role.name),
        name: role.name,
      }))
    }

    if (hasPermission(PERMISSIONS.ROLE_WRITE)) {
      return activeRoles
        .filter((role) => role.name !== 'admin')
        .map((role) => ({
          value: role.id,
          label: capitalize(role.name),
          name: role.name,
        }))
    }

    const currentRoleNames = currentUser?.roleNames?.length
      ? currentUser.roleNames
      : currentUser?.role
        ? [currentUser.role]
        : []

    const filteredRoles = currentRoleNames.length > 0
      ? activeRoles.filter((role) => currentRoleNames.includes(role.name))
      : activeRoles

    return filteredRoles.map((role) => ({
      value: role.id,
      label: capitalize(role.name),
      name: role.name,
    }))
  }, [roles, hasPermission, currentUser])

  const roleOptionsForFilter = useMemo(() => {
    return [
      { value: '', label: 'All Roles' },
      ...roleOptions.map((option) => ({
        value: option.name,
        label: option.label,
      })),
    ]
  }, [roleOptions])

  const userStats = useMemo(() => {
    const visibleUsers = users || []
    const active = visibleUsers.filter((user) => user.isActive).length
    const inactive = visibleUsers.length - active

    return {
      total: meta?.total ?? visibleUsers.length,
      active,
      inactive,
    }
  }, [users, meta])

  const sortKeyMap = useMemo(() => ({
    name: 'first_name',
    email: 'email',
    status: 'status',
    createdAt: 'created_at',
  }), [])

  const handleSortChange = useCallback((columnKey, direction) => {
    if (!columnKey) {
      return
    }

    const apiSortKey = sortKeyMap[columnKey] || columnKey

    setSortState({
      columnKey,
      sortBy: apiSortKey,
      sortDirection: direction || 'asc',
    })

    setCurrentPage(1)
  }, [sortKeyMap])

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value, user, index) => (
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle me-2 d-flex align-items-center justify-content-center text-white fw-bold"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: user.avatar ? 'transparent' : '#6c757d',
              backgroundImage: user.avatar ? `url(${user.avatar})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!user.avatar && (user.firstName?.charAt(0) || 'U')}
          </div>
          <div>
            <div className="fw-semibold">{user.firstName} {user.lastName}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (value, user, index) => (
        <span className="text-muted">{user.email}</span>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value, user, index) => (
        <span className="fw-semibold">{user.role}</span>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value, user, index) => (
        <span className="text-muted">{user.phone || 'N/A'}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, user, index) => (
        <span 
          className={`fw-semibold ${
            user.isActive ? 'text-success' : 'text-secondary'
          }`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value, user, index) => new Date(user.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, user, index) => (
        <div className="d-flex gap-2">
          {canViewUser && (
            <Button
              variant="info"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleViewUser(user)
              }}
              title="View User"
            >
              <FontAwesomeIcon icon={faInfo} />
            </Button>
          )}
          {canUpdateUser && (
            <Button
              variant="warning"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenEditModal(user)
              }}
              title="Edit User"
            >
              <FontAwesomeIcon icon={faPencil} />
            </Button>
          )}
          {canDeleteUser && (
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteUser(user)
              }}
              title="Delete User"
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
              <h2 className="mb-1 text-dark">Users Management</h2>
              <p className="text-muted mb-0">
                Monitor team members, manage access levels, and keep account details up to date.
              </p>
            </div>
            {canCreateUser && (
              <div className="ms-auto">
                <Button
                  variant="primary"
                  className="shadow-sm text-white"
                  onClick={handleCreateUser}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add User
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3 shadow-sm p-4">
            <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-primary border-2">
              <FontAwesomeIcon icon={faUsers} className="me-3 text-primary fs-4" />
              <div>
                <h4 className="mb-1 text-primary">User Directory</h4>
                <span className="text-muted">Total of {userStats.total} users in view</span>
              </div>
              <Badge bg="light" text="primary" className="ms-auto border border-primary fw-semibold">
                {userStats.active} Active · {userStats.inactive} Inactive
              </Badge>
            </div>

            <Row className="g-3 mb-4">
              <Col md={4} sm={6}>
                <div className="rounded-3 border border-light-subtle p-3 bg-gradient-primary-subtle h-100">
                  <p className="text-uppercase text-muted mb-1 small">Active Users</p>
                  <div className="d-flex align-items-end">
                    <h3 className="mb-0 text-primary fw-semibold">{userStats.active}</h3>
                    <span className="ms-2 text-muted">onboarded</span>
                  </div>
                </div>
              </Col>
              <Col md={4} sm={6}>
                <div className="rounded-3 border border-light-subtle p-3 bg-gradient-info h-100 text-white">
                  <p className="text-uppercase mb-1 small opacity-75">Total Users</p>
                  <div className="d-flex align-items-end">
                    <h3 className="mb-0 fw-semibold">{userStats.total}</h3>
                    <span className="ms-2 opacity-75">records</span>
                  </div>
                </div>
              </Col>
              <Col md={4} sm={12}>
                <div className="rounded-3 border border-light-subtle p-3 bg-gradient-warning h-100">
                  <p className="text-uppercase text-muted mb-1 small">Inactive Users</p>
                  <div className="d-flex align-items-end">
                    <h3 className="mb-0 text-warning fw-semibold">{userStats.inactive}</h3>
                    <span className="ms-2 text-muted">flagged</span>
                  </div>
                </div>
              </Col>
            </Row>

            <Form className="mb-4">
              <Row className="g-3 align-items-end">
                <Col md={4} sm={12}>
                  <Form.Label className="fw-semibold text-muted">Search</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-2 text-muted">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </InputGroup.Text>
                    <FormControl
                      placeholder="Search by name, email, or phone"
                      value={searchTerm}
                      onChange={handleSearch}
                      className="border-2"
                    />
                  </InputGroup>
                </Col>
                <Col md={3} sm={6}>
                  <Form.Label className="fw-semibold text-muted">Role</Form.Label>
                  <FormSelect
                    value={roleFilter}
                      onChange={(e) => {
                      setRoleFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="border-2"
                  >
                    {roleOptionsForFilter.map((option) => (
                      <option key={option.value || 'all-roles'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </FormSelect>
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
                <Col md={2} sm={12}>
                  {selectedUsers.length > 0 && canDeleteUser && (
                    <div className="d-grid">
                      <Button
                        variant="danger"
                        className="text-white fw-semibold"
                        onClick={handleBulkDelete}
                      >
                        Delete ({selectedUsers.length})
                      </Button>
                    </div>
                  )}
                </Col>
              </Row>
            </Form>

            <Table
              data={users}
              columns={columns}
              loading={loading}
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        onConfirm={confirmDeleteUser}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      >
        <p>Are you sure you want to delete user <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?</p>
        <p className="text-muted">This action cannot be undone.</p>
      </Modal>

      {/* Add User Modal */}
      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        onSubmit={handleAddUser}
        submitText="Create User"
        submitIcon={faPlus}
        loading={addUserLoading}
        loadingText="Creating..."
      >
        <UserForm
          ref={addUserFormRef}
          mode="create"
          onSubmit={handleAddUserSubmit}
          loading={addUserLoading}
          roleOptions={roleOptions}
          rolesLoading={rolesLoading}
        />
      </FormModal>

      {/* Edit User Modal */}
      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setUserToEdit(null)
        }}
        title="Edit User"
        onSubmit={handleEditUser}
        submitText="Update User"
        submitIcon={faPencil}
        loading={editUserLoading}
        loadingText="Updating..."
      >
        <UserForm 
          ref={editUserFormRef}
          mode="edit" 
          userData={userToEdit} 
          onSubmit={handleEditUserSubmit} 
          loading={editUserLoading}
          roleOptions={roleOptions}
          rolesLoading={rolesLoading}
        />
      </FormModal>

      {/* View User Modal */}
      <Modal
        visible={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setUserToView(null)
        }}
        title="User Details"
        size="lg"
        showFooter={false}
        type="info"
      >
        {userToView && (
          <div className="row">
            <div className="col-md-4 text-center mb-3">
              <div 
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold"
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: userToView.avatar ? 'transparent' : '#6c757d',
                  backgroundImage: userToView.avatar ? `url(${userToView.avatar})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!userToView.avatar && (userToView.firstName?.charAt(0) || 'U')}
              </div>
              <h5 className="mt-2 mb-0">{userToView.firstName} {userToView.lastName}</h5>
              <p className="text-muted mb-0">{userToView.email}</p>
            </div>
            <div className="col-md-8">
              <div className="row mb-3">
                <div className="col-sm-4"><strong>First Name:</strong></div>
                <div className="col-sm-8">{userToView.firstName}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4"><strong>Last Name:</strong></div>
                <div className="col-sm-8">{userToView.lastName}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4"><strong>Email:</strong></div>
                <div className="col-sm-8">{userToView.email}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4"><strong>Phone:</strong></div>
                <div className="col-sm-8">{userToView.phone || 'N/A'}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4"><strong>Role:</strong></div>
                <div className="col-sm-8">
                  <span className="fw-semibold">{userToView.role}</span>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4"><strong>Status:</strong></div>
                <div className="col-sm-8">
                  <span 
                    className={`fw-semibold ${
                      userToView.isActive ? 'text-success' : 'text-secondary'
                    }`}
                  >
                    {userToView.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4"><strong>Created:</strong></div>
                <div className="col-sm-8">{new Date(userToView.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="row mb-3">
                <div className="col-sm-4"><strong>Last Updated:</strong></div>
                <div className="col-sm-8">{new Date(userToView.updatedAt || userToView.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Container>
  )
}

export default UsersList
