import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Container, Row, Col, Button, Badge, Card, Form, FormControl, FormSelect, InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrash,
  faEdit,
  faPlus,
  faBuilding,
  faUsers,
  faSearch,
  faFilter,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons'
import { Table, Modal, FormModal } from '../../components'
import BranchForm from '../../components/pages/branches/BranchForm'
import branchService from '../../services/branchService'
import { useToast } from '../../components'
import { usePermissions, useDebounce } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const BranchesList = () => {
  const { success, error, warning } = useToast()
  const { hasPermission } = usePermissions()

  const [branches, setBranches] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortState, setSortState] = useState({
    columnKey: 'created_at',
    sortBy: 'created_at',
    sortDirection: 'desc',
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [branchToDelete, setBranchToDelete] = useState(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [branchToEdit, setBranchToEdit] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const addFormRef = useRef()
  const editFormRef = useRef()

  const debouncedSearch = useDebounce(searchTerm, 400)

  // Check canonical permissions first (more specific), then fall back to aliases
  const canCreateBranch = hasPermission('create_branch')
  const canUpdateBranch = hasPermission('edit_branch')
  const canDeleteBranch = hasPermission('delete_branch')
  const canViewBranch = hasPermission('view_branch') || hasPermission(PERMISSIONS.BRANCH_READ)

  const fetchBranchesWithParams = useCallback(async () => {
    setLoading(true)
    const searchValue = (debouncedSearch || '').trim()
    try {
      const response = await branchService.getBranches({
        page: currentPage,
        limit: pageSize,
        search: searchValue || undefined,
        status: statusFilter || undefined,
        sortBy: sortState.sortBy,
        sortDirection: sortState.sortDirection,
      })

      if (response && response.success) {
        setBranches(response.data || [])
        setMeta(response.meta || null)
      } else {
        console.warn('Failed to load branches from API, using mock data')
        const fallback = branchService.getMockBranches({
          page: currentPage,
          limit: pageSize,
          search: searchValue || undefined,
          status: statusFilter || undefined,
        })
        setBranches(fallback.data || [])
        setMeta(fallback.meta || null)
      }
    } catch (err) {
      console.error('Error loading branches:', err)
      const fallback = branchService.getMockBranches({
        page: currentPage,
        limit: pageSize,
        search: searchValue || undefined,
        status: statusFilter || undefined,
      })
      setBranches(fallback.data || [])
      setMeta(fallback.meta || null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, sortState.sortBy, sortState.sortDirection])

  useEffect(() => {
    if (!canViewBranch) {
      warning && warning('You do not have permission to view branches.', { title: 'Access limited' })
    }
  }, [canViewBranch, warning])

  useEffect(() => {
    if (!canViewBranch) {
      return
    }
    fetchBranchesWithParams()
  }, [canViewBranch, fetchBranchesWithParams])

  if (!canViewBranch) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FontAwesomeIcon icon={faBuilding} className="text-muted mb-3" size="3x" />
            <h4 className="text-muted">Access Restricted</h4>
            <p className="text-muted">
              You do not have permission to view branch information. Please contact your administrator if you need additional access.
            </p>
          </Col>
        </Row>
      </Container>
    )
  }

  const branchSummary = useMemo(() => {
    const visibleBranches = branches || []
    const active = visibleBranches.filter((branch) => branch.status === 'active').length
    const inactive = visibleBranches.filter((branch) => branch.status === 'inactive').length

    return {
      total: meta?.total ?? visibleBranches.length,
      active,
      inactive,
    }
  }, [branches, meta])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const handleDeleteBranch = (branch) => {
    if (!canDeleteBranch) {
      error('You do not have permission to delete branches')
      return
    }
    setBranchToDelete(branch)
    setShowDeleteModal(true)
  }

  const confirmDeleteBranch = async () => {
    try {
      const response = await branchService.deleteBranch(branchToDelete.id)
      if (response.success) {
        success('Branch deleted successfully')
        setShowDeleteModal(false)
        setBranchToDelete(null)
        await fetchBranchesWithParams()
      } else {
        error(response.message || 'Failed to delete branch')
      }
    } catch (err) {
      console.error('Error deleting branch:', err)
      error('An error occurred while deleting branch')
    }
  }

  const handleAddBranch = () => {
    if (!canCreateBranch) {
      error('You do not have permission to create branches')
      return
    }
    setShowAddModal(true)
  }

  const handleAddBranchSubmit = () => {
    if (addFormRef.current) {
      addFormRef.current.handleSubmit()
    }
  }

  const handleAddBranchFormSubmit = async (formData) => {
    try {
      setAddLoading(true)
      const response = await branchService.createBranch(formData)
      if (response.success) {
        success('Branch created successfully')
        setShowAddModal(false)
        await fetchBranchesWithParams()
      } else {
        error(response.message || 'Failed to create branch')
      }
    } catch (err) {
      console.error('Error creating branch:', err)
      error('An error occurred while creating branch')
    } finally {
      setAddLoading(false)
    }
  }

  const handleEditBranch = (branch) => {
    if (!canUpdateBranch) {
      error('You do not have permission to edit branches')
      return
    }
    setBranchToEdit(branch)
    setShowEditModal(true)
  }

  const handleEditBranchSubmit = () => {
    if (editFormRef.current) {
      editFormRef.current.handleSubmit()
    }
  }

  const handleEditBranchFormSubmit = async (formData) => {
    try {
      setEditLoading(true)
      const response = await branchService.updateBranch(branchToEdit.id, formData)
      if (response.success) {
        success('Branch updated successfully')
        setShowEditModal(false)
        setBranchToEdit(null)
        await fetchBranchesWithParams()
      } else {
        error(response.message || 'Failed to update branch')
      }
    } catch (err) {
      console.error('Error updating branch:', err)
      error('An error occurred while updating branch')
    } finally {
      setEditLoading(false)
    }
  }

  const sortKeyMap = {
    branch_name: 'branch_name',
    city: 'city',
    status: 'status',
    created_at: 'created_at',
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
      key: 'branch_name',
      label: 'Branch',
      render: (value, branch) => (
        <div>
          <div className="fw-semibold text-dark" style={{ fontSize: '14px' }}>{branch.branch_name}</div>
          <small className="text-muted" style={{ fontSize: '12px' }}>Code: {branch.branch_code}</small>
        </div>
      ),
    },
    {
      key: 'city',
      label: 'City',
      render: (value, branch) => <span className="text-muted">{branch.city || 'N/A'}</span>,
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (value, branch) => (
        <div>
          <div style={{ fontSize: '13px' }}>{branch.contact_number || 'N/A'}</div>
          {branch.email && <small className="text-muted" style={{ fontSize: '11px' }}>{branch.email}</small>}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, branch) => (
        <Badge bg={getStatusColor(branch.status)} className="px-2 py-1" style={{ fontSize: '12px' }}>
          {branch.status || 'inactive'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value, branch) => (
        <span className="text-muted">{branch.created_at ? new Date(branch.created_at).toLocaleDateString() : '—'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, branch) => (
        <div className="d-flex gap-1 align-items-center" style={{ flexWrap: 'nowrap' }}>
          {canUpdateBranch && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleEditBranch(branch)}
              title="Edit Branch"
              style={{ minWidth: '32px', padding: '4px 8px' }}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          )}
          {canDeleteBranch && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleDeleteBranch(branch)}
              title="Delete Branch"
              style={{ minWidth: '32px', padding: '4px 8px' }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <Container fluid className="px-0 px-xl-3">
      <Row className="g-4">
        <Col xs={12}>
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faBuilding} className="me-3 text-primary fs-4" />
              <h2 className="mb-0 text-dark">Branch Management</h2>
            </div>
            {canCreateBranch && (
              <div className="ms-auto">
                <Button variant="primary" onClick={handleAddBranch} className="text-white">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Branch
                </Button>
              </div>
            )}
          </div>

          <Row className="mb-4 g-3">
            <Col md={4} sm={12}>
              <Card className="bg-gradient-primary text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{branchSummary.total}</h4>
                      <p className="mb-0 opacity-75">Total Branches</p>
                    </div>
                    <FontAwesomeIcon icon={faBuilding} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} sm={6}>
              <Card className="bg-gradient-success text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{branchSummary.active}</h4>
                      <p className="mb-0 opacity-75">Active Branches</p>
                    </div>
                    <FontAwesomeIcon icon={faUsers} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} sm={6}>
              <Card className="bg-gradient-info text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{branchSummary.inactive}</h4>
                      <p className="mb-0 opacity-75">Inactive Branches</p>
                    </div>
                    <FontAwesomeIcon icon={faFilter} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="shadow-sm">
            <Card.Body>
              <Form className="mb-4">
                <Row className="g-3 align-items-end">
                  <Col md={4} sm={12}>
                    <Form.Label className="fw-semibold text-muted">Search</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white border-2 text-muted">
                        <FontAwesomeIcon icon={faSearch} />
                      </InputGroup.Text>
                      <FormControl
                        placeholder="Search by name, code, or city"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setCurrentPage(1)
                        }}
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
                    <Form.Label className="fw-semibold text-muted">Actions</Form.Label>
                    <div className="d-flex gap-2">
                      <Button
                        type="button"
                        variant="outline-secondary"
                        className="border-2"
                        onClick={() => {
                          setSearchTerm('')
                          setStatusFilter('')
                          setCurrentPage(1)
                        }}
                      >
                        Clear
                      </Button>
                      <Button
                        type="button"
                        variant="outline-primary"
                        className="border-2"
                        disabled={loading}
                        onClick={fetchBranchesWithParams}
                      >
                        <FontAwesomeIcon icon={faRefresh} className="me-1" /> Refresh
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>

              <Table
                data={branches}
                columns={columns}
                loading={loading}
                hover
                pagination={true}
                sortable={true}
                sortableColumns={['branch_name', 'city', 'status', 'created_at']}
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Branch"
        onConfirm={confirmDeleteBranch}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      >
        <p>Are you sure you want to delete branch <strong>{branchToDelete?.branch_name}</strong>?</p>
        <p className="text-muted">This action cannot be undone.</p>
      </Modal>

      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Branch"
        onSubmit={handleAddBranchSubmit}
        submitText="Create Branch"
        submitIcon={faPlus}
        loading={addLoading}
        loadingText="Creating..."
      >
        <BranchForm
          ref={addFormRef}
          mode="create"
          onSubmit={handleAddBranchFormSubmit}
          onCancel={() => setShowAddModal(false)}
          loading={addLoading}
        />
      </FormModal>

      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setBranchToEdit(null)
        }}
        title="Edit Branch"
        onSubmit={handleEditBranchSubmit}
        submitText="Update Branch"
        submitIcon={faEdit}
        loading={editLoading}
        loadingText="Updating..."
      >
        <BranchForm
          ref={editFormRef}
          mode="edit"
          branchData={branchToEdit}
          onSubmit={handleEditBranchFormSubmit}
          onCancel={() => {
            setShowEditModal(false)
            setBranchToEdit(null)
          }}
          loading={editLoading}
        />
      </FormModal>
    </Container>
  )
}

export default BranchesList