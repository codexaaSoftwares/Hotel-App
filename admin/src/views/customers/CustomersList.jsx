import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Button, Badge, Card, Form, FormSelect, InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrash,
  faEdit,
  faPlus,
  faUsers,
  faSearch,
  faFilter,
  faRefresh,
  faUser,
  faCreditCard,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { Table, Modal, FormModal } from '../../components'
import CustomerForm from '../../components/pages/customers/CustomerForm'
import customerService from '../../services/customerService'
import { useToast } from '../../components'
import { usePermissions, useDebounce } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const CustomersList = () => {
  const navigate = useNavigate()
  const { success, error, warning } = useToast()
  const { hasPermission } = usePermissions()

  const [customers, setCustomers] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [customerTypeFilter, setCustomerTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortState, setSortState] = useState({
    columnKey: 'name',
    sortBy: 'name',
    sortDirection: 'asc',
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [customerToEdit, setCustomerToEdit] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const addFormRef = useRef()
  const editFormRef = useRef()

  const debouncedSearch = useDebounce(searchTerm, 400)

  // Check permissions
  const canCreateCustomer = hasPermission('create_customer')
  const canUpdateCustomer = hasPermission('edit_customer')
  const canDeleteCustomer = hasPermission('delete_customer')
  const canViewLedger = hasPermission(PERMISSIONS.CUSTOMER_LEDGER_READ)
  const canViewCustomer = hasPermission('view_customer')

  const fetchCustomersWithParams = useCallback(async () => {
    setLoading(true)
    const searchValue = (debouncedSearch || '').trim()
    try {
      const response = await customerService.getCustomers({
        page: currentPage,
        limit: pageSize,
        search: searchValue || undefined,
        status: statusFilter || undefined,
        customer_type: customerTypeFilter || undefined,
        sortBy: sortState.sortBy,
        sortDirection: sortState.sortDirection,
      })

      if (response && response.success) {
        setCustomers(response.data || [])
        setMeta(response.meta || null)
      } else {
        error && error(response.message || 'Failed to load customers.')
        setCustomers([])
        setMeta(null)
      }
    } catch (err) {
      console.error('Error loading customers:', err)
      error && error('Failed to load customers. Please try again.')
      setCustomers([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, customerTypeFilter, sortState.sortBy, sortState.sortDirection, error])

  useEffect(() => {
    if (!canViewCustomer) {
      warning && warning('You do not have permission to view customers.', { title: 'Access limited' })
    }
  }, [canViewCustomer, warning])

  useEffect(() => {
    if (!canViewCustomer) {
      return
    }
    fetchCustomersWithParams()
  }, [canViewCustomer, fetchCustomersWithParams])

  if (!canViewCustomer) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FontAwesomeIcon icon={faUsers} className="text-muted mb-3" size="3x" />
            <h4 className="text-muted">Access Restricted</h4>
            <p className="text-muted">
              You do not have permission to view customer information. Please contact your administrator if you need additional access.
            </p>
          </Col>
        </Row>
      </Container>
    )
  }

  const customerSummary = useMemo(() => {
    const visibleCustomers = customers || []
    const active = visibleCustomers.filter((customer) => customer.status === 'active').length
    const inactive = visibleCustomers.filter((customer) => customer.status === 'inactive').length
    const regular = visibleCustomers.filter((customer) => customer.customerType === 'regular').length
    const credit = visibleCustomers.filter((customer) => customer.customerType === 'credit').length

    return {
      total: meta?.total ?? visibleCustomers.length,
      active,
      inactive,
      regular,
      credit,
    }
  }, [customers, meta])

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

  const getCustomerTypeColor = (type) => {
    switch (type) {
      case 'credit':
        return 'warning'
      case 'regular':
        return 'info'
      default:
        return 'secondary'
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const sortKeyMap = {
    customerCode: 'customer_code',
    name: 'name',
    status: 'status',
  }

  const handleSortChange = (columnKey, direction) => {
    const sortBy = sortKeyMap[columnKey] || columnKey
    setSortState({
      columnKey,
      sortBy,
      sortDirection: direction,
    })
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    fetchCustomersWithParams()
  }

  const handleAdd = () => {
    // Reset form when opening add modal
    if (addFormRef.current) {
      addFormRef.current.reset?.()
    }
    setShowAddModal(true)
  }

  const handleEdit = (customer) => {
    setCustomerToEdit(customer)
    setShowEditModal(true)
  }

  const handleDelete = (customer) => {
    setCustomerToDelete(customer)
    setShowDeleteModal(true)
  }

  // Transform Laravel validation errors from array format to flat format
  const transformErrors = (laravelErrors) => {
    if (!laravelErrors || typeof laravelErrors !== 'object') {
      return {}
    }

    const transformed = {}
    Object.keys(laravelErrors).forEach((key) => {
      const errorValue = laravelErrors[key]
      // Laravel returns errors as arrays: { "name": ["The name field is required."] }
      // Transform to flat format: { "name": "The name field is required." }
      if (Array.isArray(errorValue)) {
        transformed[key] = errorValue[0] || ''
      } else if (typeof errorValue === 'string') {
        transformed[key] = errorValue
      }
    })
    return transformed
  }

  const handleAddSubmit = async () => {
    if (!addFormRef.current) return

    const formData = addFormRef.current.submit()
    if (!formData) return

    setAddLoading(true)
    try {
      const response = await customerService.createCustomer(formData)
      if (response.success) {
        success && success('Customer created successfully.')
        setShowAddModal(false)
        if (addFormRef.current) {
          addFormRef.current.reset?.()
        }
        fetchCustomersWithParams()
      } else {
        error && error(response.message || 'Failed to create customer.')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          addFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error creating customer:', err)
      error && error('Failed to create customer. Please try again.')
    } finally {
      setAddLoading(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!editFormRef.current || !customerToEdit) return

    const formData = editFormRef.current.submit()
    if (!formData) return

    setEditLoading(true)
    try {
      const response = await customerService.updateCustomer(customerToEdit.id, formData)
      if (response.success) {
        success && success('Customer updated successfully.')
        setShowEditModal(false)
        setCustomerToEdit(null)
        if (editFormRef.current) {
          editFormRef.current.reset?.()
        }
        fetchCustomersWithParams()
      } else {
        error && error(response.message || 'Failed to update customer.')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          editFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error updating customer:', err)
      error && error('Failed to update customer. Please try again.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return

    try {
      const response = await customerService.deleteCustomer(customerToDelete.id)
      if (response.success) {
        success && success('Customer deleted successfully.')
        setShowDeleteModal(false)
        setCustomerToDelete(null)
        fetchCustomersWithParams()
      } else {
        error && error(response.message || 'Failed to delete customer.')
      }
    } catch (err) {
      console.error('Error deleting customer:', err)
      error && error('Failed to delete customer. Please try again.')
    }
  }

  const columns = [
    {
      key: 'customerCode',
      label: 'Code',
      sortable: true,
      render: (value, customer) => {
        if (!customer) return <span className="text-muted">—</span>
        return (
          <span className="fw-semibold text-primary">{customer.customerCode || 'N/A'}</span>
        )
      },
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, customer) => {
        if (!customer) return <span className="text-muted">—</span>
        return (
          <div>
            <div className="fw-semibold">{customer.name || 'N/A'}</div>
            {customer.mobile && (
              <small className="text-muted">
                <FontAwesomeIcon icon={faUser} className="me-1" />
                {customer.mobile}
              </small>
            )}
          </div>
        )
      },
    },
    {
      key: 'address',
      label: 'Address',
      render: (value, customer) => {
        if (!customer) return <span className="text-muted">—</span>
        const addressParts = []
        if (customer.address) addressParts.push(customer.address)
        if (customer.city) addressParts.push(customer.city)
        return addressParts.length > 0 ? (
          <div>
            <div className="text-dark">{customer.address || '—'}</div>
            {customer.city && (
              <small className="text-muted">{customer.city}</small>
            )}
          </div>
        ) : (
          <span className="text-muted">—</span>
        )
      },
    },
    {
      key: 'customerType',
      label: 'Type',
      render: (value, customer) => {
        if (!customer) return <span className="text-muted">—</span>
        return (
          <Badge bg={getCustomerTypeColor(customer.customerType)}>
            {customer.customerType === 'credit' ? (
              <>
                <FontAwesomeIcon icon={faCreditCard} className="me-1" />
                Credit
              </>
            ) : (
              'Regular'
            )}
          </Badge>
        )
      },
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      render: (value, customer) => {
        if (!customer) return <span className="text-muted">—</span>
        return (
          <span className="fw-semibold">₹{parseFloat(customer.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        )
      },
    },
    {
      key: 'remainingAmount',
      label: 'Balance',
      render: (value, customer) => {
        if (!customer) return <span className="text-muted">—</span>
        const amount = parseFloat(customer.remainingAmount || 0)
        return (
          <span className={amount > 0 ? 'text-danger fw-semibold' : 'text-success'}>
            ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value, customer) => {
        if (!customer) return <span className="text-muted">—</span>
        return (
          <Badge bg={getStatusColor(customer.status)}>{customer.status || 'N/A'}</Badge>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, customer) => {
        if (!customer) return <span className="text-muted">—</span>
        return (
          <div className="d-flex gap-2">
            {canViewLedger && (
              <Button
                variant="outline-info"
                size="sm"
                onClick={() => navigate(`/customers/ledger/${customer.id}`)}
                title="View ledger"
              >
                <FontAwesomeIcon icon={faWallet} />
              </Button>
            )}
            {canUpdateCustomer && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleEdit(customer)}
                title="Edit customer"
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
            )}
            {canDeleteCustomer && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDelete(customer)}
                title="Delete customer"
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          {/* Page Header */}
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div>
              <h2 className="mb-0 text-dark">
                <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
                Customers
              </h2>
              <p className="text-muted mb-0 mt-1">Manage restaurant customers</p>
            </div>
            <div className="ms-auto">
              {canCreateCustomer && (
                <Button variant="primary" onClick={handleAdd}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Customer
                </Button>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col xs={12} sm={6} md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Total Customers</p>
                      <h3 className="mb-0">{customerSummary.total}</h3>
                    </div>
                    <FontAwesomeIcon icon={faUsers} className="text-primary fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Active</p>
                      <h3 className="mb-0 text-success">{customerSummary.active}</h3>
                    </div>
                    <FontAwesomeIcon icon={faUsers} className="text-success fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Regular</p>
                      <h3 className="mb-0 text-info">{customerSummary.regular}</h3>
                    </div>
                    <FontAwesomeIcon icon={faUser} className="text-info fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Credit</p>
                      <h3 className="mb-0 text-warning">{customerSummary.credit}</h3>
                    </div>
                    <FontAwesomeIcon icon={faCreditCard} className="text-warning fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filters and Search */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col xs={12} md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by name, code, mobile, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col xs={12} md={3}>
                  <FormSelect
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </FormSelect>
                </Col>
                <Col xs={12} md={3}>
                  <FormSelect
                    value={customerTypeFilter}
                    onChange={(e) => {
                      setCustomerTypeFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="regular">Regular</option>
                    <option value="credit">Credit</option>
                  </FormSelect>
                </Col>
                <Col xs={12} md={2}>
                  <Button variant="outline-secondary" onClick={handleRefresh} className="w-100">
                    <FontAwesomeIcon icon={faRefresh} className="me-2" />
                    Refresh
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Customers Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Table
                columns={columns}
                data={customers}
                loading={loading}
                sortable={true}
                sortableColumns={['name', 'customerCode', 'status']}
                onSortChange={handleSortChange}
                pagination={true}
                serverSide={true}
                meta={meta}
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={meta?.total || 0}
                onPageChange={handlePageChange}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Customer Modal */}
      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Customer"
        onSubmit={handleAddSubmit}
        submitText="Create Customer"
        loading={addLoading}
        loadingText="Creating..."
      >
        <CustomerForm ref={addFormRef} mode="create" />
      </FormModal>

      {/* Edit Customer Modal */}
      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setCustomerToEdit(null)
        }}
        title="Edit Customer"
        onSubmit={handleEditSubmit}
        submitText="Update Customer"
        loading={editLoading}
        loadingText="Updating..."
      >
        <CustomerForm ref={editFormRef} mode="edit" customerData={customerToEdit} />
      </FormModal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete customer <strong>{customerToDelete?.name}</strong>?
          </p>
          <p className="text-danger small mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default CustomersList

