import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Container, Row, Col, Button, Badge, Card, Form, InputGroup, Modal } from 'react-bootstrap'
import { SelectField } from '../../components/common/FormFields'
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
  faWallet,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons'
import { Table, FormModal } from '../../components'
import StaffForm from '../../components/pages/staff/StaffForm'
import SalaryPaymentModal from '../../components/pages/staff/SalaryPaymentModal'
import SalaryReportModal from '../../components/pages/staff/SalaryReportModal'
import staffService from '../../services/staffService'
import { useToast } from '../../components'
import { usePermissions, useDebounce } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const StaffList = () => {
  const { success, error, warning } = useToast()
  const { hasPermission } = usePermissions()

  const [staff, setStaff] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortState, setSortState] = useState({
    columnKey: 'name',
    sortBy: 'name',
    sortDirection: 'asc',
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSalaryModal, setShowSalaryModal] = useState(false)
  const [showSalaryReportModal, setShowSalaryReportModal] = useState(false)
  const [staffForSalary, setStaffForSalary] = useState(null)
  const [staffToEdit, setStaffToEdit] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [salaryLoading, setSalaryLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const addFormRef = useRef()
  const editFormRef = useRef()

  const debouncedSearch = useDebounce(searchTerm, 400)

  // Calculate staff summary statistics
  const staffSummary = useMemo(() => {
    const visibleStaff = staff || []
    const active = visibleStaff.filter((s) => s.status === 'active').length
    const inactive = visibleStaff.filter((s) => s.status === 'inactive').length
    const monthly = visibleStaff.filter((s) => s.salaryType === 'monthly').length
    const other = visibleStaff.filter((s) => s.salaryType === 'other').length

    return {
      total: meta?.total ?? visibleStaff.length,
      active,
      inactive,
      monthly,
      other,
    }
  }, [staff, meta])

  // TEMPORARY: Development bypass - Remove this when backend is ready
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
  
  // Check permissions
  const canCreateStaff = isDevelopment || hasPermission('create_staff') || hasPermission(PERMISSIONS.STAFF_WRITE)
  const canUpdateStaff = isDevelopment || hasPermission('edit_staff') || hasPermission(PERMISSIONS.STAFF_WRITE)
  const canDeleteStaff = isDevelopment || hasPermission('delete_staff') || hasPermission(PERMISSIONS.STAFF_DELETE)
  const canViewStaff = isDevelopment || hasPermission('view_staff') || hasPermission(PERMISSIONS.STAFF_READ)
  const canPaySalary = isDevelopment || hasPermission('create_salary_payment') || hasPermission(PERMISSIONS.STAFF_WRITE)
  const canViewSalaryReport = isDevelopment || hasPermission('staff_salary_report') || hasPermission(PERMISSIONS.STAFF_SALARY_REPORT_READ)

  const fetchStaffWithParams = useCallback(async () => {
    setLoading(true)
    const searchValue = (debouncedSearch || '').trim()
    try {
      const response = await staffService.getStaff({
        page: currentPage,
        limit: pageSize,
        search: searchValue || undefined,
        sortBy: sortState.sortBy,
        sortDirection: sortState.sortDirection,
      })

      if (response && response.success) {
        setStaff(response.data || [])
        setMeta(response.meta || null)
      } else {
        error && error(response.message || 'Failed to load staff.')
        setStaff([])
        setMeta(null)
      }
    } catch (err) {
      console.error('Error loading staff:', err)
      error && error('Failed to load staff. Please try again.')
      setStaff([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, sortState.sortBy, sortState.sortDirection, error])

  useEffect(() => {
    if (!canViewStaff) {
      warning && warning('You do not have permission to view staff.', { title: 'Access limited' })
    }
  }, [canViewStaff, warning])

  useEffect(() => {
    if (!canViewStaff) {
      return
    }
    fetchStaffWithParams()
  }, [canViewStaff, fetchStaffWithParams])

  if (!canViewStaff) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FontAwesomeIcon icon={faUsers} className="text-muted mb-3" size="3x" />
            <h4 className="text-muted">Access Restricted</h4>
            <p className="text-muted">
              You do not have permission to view staff information. Please contact your administrator if you need additional access.
            </p>
          </Col>
        </Row>
      </Container>
    )
  }


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

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'Cook':
        return 'primary'
      case 'Helper':
        return 'info'
      case 'Cleaner':
        return 'warning'
      case 'Cashier':
        return 'success'
      default:
        return 'secondary'
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const sortKeyMap = {
    staffCode: 'staff_code',
    name: 'name',
    department: 'department',
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
    fetchStaffWithParams()
  }

  const handleAdd = () => {
    if (addFormRef.current) {
      addFormRef.current.reset?.()
    }
    setShowAddModal(true)
  }

  const handleEdit = (staffMember) => {
    setStaffToEdit(staffMember)
    setShowEditModal(true)
  }

  const handlePaySalary = (staffMember) => {
    setStaffForSalary(staffMember)
    setShowSalaryModal(true)
  }

  const handleViewSalaryReport = () => {
    setShowSalaryReportModal(true)
  }

  const handleDelete = (staffMember) => {
    if (!staffMember || !staffMember.id) {
      error && error('Invalid staff member selected.')
      return
    }
    setStaffToDelete(staffMember)
    setShowDeleteModal(true)
  }

  const transformErrors = (laravelErrors) => {
    if (!laravelErrors || typeof laravelErrors !== 'object') {
      return {}
    }

    const transformed = {}
    Object.keys(laravelErrors).forEach((key) => {
      const errorValue = laravelErrors[key]
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
      const response = await staffService.createStaff(formData)
      if (response.success) {
        success && success('Staff created successfully.')
        setShowAddModal(false)
        if (addFormRef.current) {
          addFormRef.current.reset?.()
        }
        fetchStaffWithParams()
      } else {
        error && error(response.message || 'Failed to create staff.')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          addFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error creating staff:', err)
      error && error('Failed to create staff. Please try again.')
    } finally {
      setAddLoading(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!editFormRef.current || !staffToEdit) return

    const formData = editFormRef.current.submit()
    if (!formData) return

    setEditLoading(true)
    try {
      const response = await staffService.updateStaff(staffToEdit.id, formData)
      if (response.success) {
        success && success('Staff updated successfully.')
        setShowEditModal(false)
        setStaffToEdit(null)
        if (editFormRef.current) {
          editFormRef.current.reset?.()
        }
        fetchStaffWithParams()
      } else {
        error && error(response.message || 'Failed to update staff.')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          editFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error updating staff:', err)
      error && error('Failed to update staff. Please try again.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleSalarySubmit = async (paymentData) => {
    setSalaryLoading(true)
    try {
      const response = await staffService.createSalaryPayment(paymentData)
      if (response.success) {
        success && success('Salary payment recorded successfully.')
        setShowSalaryModal(false)
        setStaffForSalary(null)
        fetchStaffWithParams()
      } else {
        error && error(response.message || 'Failed to record salary payment.')
      }
    } catch (err) {
      console.error('Error recording salary payment:', err)
      error && error('Failed to record salary payment. Please try again.')
    } finally {
      setSalaryLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return

    setDeleteLoading(true)
    try {
      const response = await staffService.deleteStaff(staffToDelete.id)
      if (response.success) {
        success && success('Staff deleted successfully.')
        setShowDeleteModal(false)
        setStaffToDelete(null)
        fetchStaffWithParams()
      } else {
        error && error(response.message || 'Failed to delete staff.')
      }
    } catch (err) {
      console.error('Error deleting staff:', err)
      error && error('Failed to delete staff. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    {
      key: 'staffCode',
      label: 'Staff Code',
      sortable: true,
      render: (value, staffMember) => {
        if (!staffMember) return <span className="text-muted">—</span>
        return <span className="fw-semibold text-primary">{staffMember.staffCode || 'N/A'}</span>
      },
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, staffMember) => {
        if (!staffMember) return <span className="text-muted">—</span>
        return (
          <div>
            <div className="fw-semibold">{staffMember.name || 'N/A'}</div>
            {staffMember.mobile && <small className="text-muted">{staffMember.mobile}</small>}
          </div>
        )
      },
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (value, staffMember) => {
        if (!staffMember) return <span className="text-muted">—</span>
        return (
          <Badge bg={getDepartmentColor(staffMember.department)}>{staffMember.department || 'N/A'}</Badge>
        )
      },
    },
    {
      key: 'salaryInfo',
      label: 'Salary',
      render: (value, staffMember) => {
        if (!staffMember) return <span className="text-muted">—</span>
        return (
          <div>
            <div className="fw-semibold">
              ₹{staffMember.salaryAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <small className="text-muted">
              {staffMember.salaryType === 'monthly' ? 'Monthly' : 'Daily'}
            </small>
          </div>
        )
      },
    },
    {
      key: 'joiningDate',
      label: 'Joining Date',
      render: (value, staffMember) => {
        if (!staffMember || !staffMember.joiningDate) return <span className="text-muted">—</span>
        return new Date(staffMember.joiningDate).toLocaleDateString('en-IN')
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value, staffMember) => {
        if (!staffMember) return <span className="text-muted">—</span>
        return <Badge bg={getStatusColor(staffMember.status)}>{staffMember.status || 'N/A'}</Badge>
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, staffMember) => {
        if (!staffMember) return null
        return (
          <div className="d-flex gap-2">
            {canPaySalary && (
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => handlePaySalary(staffMember)}
                title="Pay Salary"
              >
                <FontAwesomeIcon icon={faWallet} className="me-1" />
                Pay Salary
              </Button>
            )}
            {canUpdateStaff && (
              <Button variant="primary" size="sm" onClick={() => handleEdit(staffMember)} title="Edit">
                <FontAwesomeIcon icon={faEdit} />
              </Button>
            )}
            {canDeleteStaff && (
              <Button 
                variant="danger" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(staffMember)
                }} 
                title="Delete"
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
                Staff & Salary Management
              </h2>
              <p className="text-muted mb-0 mt-1">Manage restaurant staff and salary payments</p>
            </div>
            <div className="ms-auto d-flex gap-2">
              {canViewSalaryReport && (
                <Button variant="outline-primary" onClick={handleViewSalaryReport}>
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  View Salary Report
                </Button>
              )}
              {canCreateStaff && (
                <Button variant="primary" onClick={handleAdd}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Staff
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
                      <p className="text-muted mb-1 small">Total Staff</p>
                      <h3 className="mb-0">{staffSummary.total}</h3>
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
                      <h3 className="mb-0 text-success">{staffSummary.active}</h3>
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
                      <p className="text-muted mb-1 small">Inactive</p>
                      <h3 className="mb-0 text-secondary">{staffSummary.inactive}</h3>
                    </div>
                    <FontAwesomeIcon icon={faUser} className="text-secondary fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Monthly Salary</p>
                      <h3 className="mb-0 text-info">{staffSummary.monthly}</h3>
                    </div>
                    <FontAwesomeIcon icon={faWallet} className="text-info fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filters and Search */}
          <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={10}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, code, or mobile..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={handleRefresh} className="w-100">
                <FontAwesomeIcon icon={faRefresh} className="me-2" />
                Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Staff Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Table
            columns={columns}
            data={staff}
            loading={loading}
            sortableColumns={['staffCode', 'name', 'department', 'status']}
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
            emptyMessage="No staff found. Click 'Add Staff' to create a new staff member."
          />
        </Card.Body>
      </Card>

      {/* Add Staff Modal */}
      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Staff"
        onSubmit={handleAddSubmit}
        loading={addLoading}
        size="lg"
      >
        <StaffForm ref={addFormRef} mode="create" />
      </FormModal>

      {/* Edit Staff Modal */}
      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setStaffToEdit(null)
        }}
        title="Edit Staff"
        onSubmit={handleEditSubmit}
        loading={editLoading}
        size="lg"
      >
        <StaffForm ref={editFormRef} mode="edit" staffData={staffToEdit} />
      </FormModal>

      {/* Pay Salary Modal */}
      <SalaryPaymentModal
        show={showSalaryModal}
        onHide={() => {
          setShowSalaryModal(false)
          setStaffForSalary(null)
        }}
        staff={staffForSalary}
        onSubmit={handleSalarySubmit}
        loading={salaryLoading}
      />

      {/* Salary Report Modal */}
      <SalaryReportModal show={showSalaryReportModal} onHide={() => setShowSalaryReportModal(false)} />

      {/* Delete Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => {
          if (!deleteLoading) {
            setShowDeleteModal(false)
            setStaffToDelete(null)
          }
        }}
        backdrop={deleteLoading ? 'static' : true}
        keyboard={!deleteLoading}
      >
        <Modal.Header closeButton={!deleteLoading}>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {staffToDelete ? (
            <>
              Are you sure you want to delete staff member <strong>{staffToDelete.name}</strong> ({staffToDelete.staffCode})? This action cannot be undone.
            </>
          ) : (
            'Loading...'
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowDeleteModal(false)
              setStaffToDelete(null)
            }}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={deleteLoading || !staffToDelete}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
        </Col>
      </Row>
    </Container>
  )
}

export default StaffList

