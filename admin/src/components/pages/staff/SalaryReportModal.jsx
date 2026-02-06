import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Modal, Row, Col, Button, Badge, Card, Form, InputGroup, Alert } from 'react-bootstrap'
import { SelectField } from '../../../components/common/FormFields'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faWallet,
  faSearch,
  faDownload,
  faTimesCircle,
  faCheckCircle,
  faExclamationCircle,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { Table, FormModal } from '../../../components'
import SalaryPaymentModal from './SalaryPaymentModal'
import staffService from '../../../services/staffService'
import { useToast } from '../../../components'
import { useDebounce } from '../../../hooks'

const SalaryReportModal = ({ show, onHide }) => {
  const { success, error } = useToast()

  const [salaryPayments, setSalaryPayments] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortState, setSortState] = useState({
    columnKey: 'createdAt',
    sortBy: 'created_at',
    sortDirection: 'desc',
  })
  const [exportLoading, setExportLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [salaryToEdit, setSalaryToEdit] = useState(null)
  const [salaryToDelete, setSalaryToDelete] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 500)

  // Fetch salary payments
  const fetchSalaryPayments = useCallback(async () => {
    if (!show) return

    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch || undefined,
        month: monthFilter || undefined,
        year: yearFilter || undefined,
        sortBy: sortState.sortBy,
        sortDirection: sortState.sortDirection,
      }

      const response = await staffService.getSalaryPayments(params)
      if (response.success) {
        setSalaryPayments(response.data || [])
        setMeta(response.meta)
      } else {
        error(response.message || 'Failed to load salary payments.')
        setSalaryPayments([])
      }
    } catch (err) {
      console.error('Error fetching salary payments:', err)
      error('Failed to load salary payments. Please try again.')
      setSalaryPayments([])
    } finally {
      setLoading(false)
    }
  }, [
    show,
    currentPage,
    pageSize,
    debouncedSearch,
    monthFilter,
    yearFilter,
    sortState.sortBy,
    sortState.sortDirection,
    error,
  ])

  useEffect(() => {
    if (show) {
      fetchSalaryPayments()
    }
  }, [show, fetchSalaryPayments])

  // Reset state when modal closes
  useEffect(() => {
    if (!show) {
      setSearchTerm('')
      setMonthFilter('')
      setYearFilter('')
      setCurrentPage(1)
      setSalaryPayments([])
      setMeta(null)
    }
  }, [show])

  const handleClearFilters = () => {
    setSearchTerm('')
    setMonthFilter('')
    setYearFilter('')
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSortChange = (columnKey, sortBy, sortDirection) => {
    setSortState({ columnKey, sortBy, sortDirection })
    setCurrentPage(1)
  }

  const getPaymentMethodBadge = (method) => {
    const colors = {
      cash: 'primary',
      upi: 'info',
      bank: 'success',
    }
    return <Badge bg={colors[method] || 'secondary'}>{method?.toUpperCase() || 'N/A'}</Badge>
  }

  const getMonthName = (month) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return months[month - 1] || ''
  }

  // Calculate summary
  const summary = useMemo(() => {
    const total = meta?.total ?? salaryPayments.length
    const totalPaid = salaryPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0)

    return {
      total,
      totalPaid,
    }
  }, [salaryPayments, meta])

  const handleExport = async () => {
    try {
      setExportLoading(true)
      
      // Prepare export parameters (same as current filters)
      const params = {
        search: debouncedSearch || undefined,
        month: monthFilter || undefined,
        year: yearFilter || undefined,
        sort_by: sortState.sortBy,
        sort_direction: sortState.sortDirection,
      }

      const response = await staffService.exportSalaryPaymentsReport(params)
      if (response.success) {
        success('Salary payments report exported successfully.')
      } else {
        error(response.message || 'Failed to export salary payments report.')
      }
    } catch (err) {
      console.error('Error exporting salary report:', err)
      error('Failed to export salary report. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }

  const handleEdit = (payment) => {
    if (!payment || !payment.id) {
      error('Invalid salary payment selected.')
      return
    }
    setSalaryToEdit(payment)
    setShowEditModal(true)
  }

  const handleEditSubmit = async (formData) => {
    if (!salaryToEdit || !salaryToEdit.id) return

    setEditLoading(true)
    try {
      const response = await staffService.updateSalaryPayment(salaryToEdit.id, formData)
      if (response.success) {
        success('Salary payment updated successfully')
        setShowEditModal(false)
        setSalaryToEdit(null)
        fetchSalaryPayments()
      } else {
        error(response.message || 'Failed to update salary payment')
      }
    } catch (err) {
      console.error('Error updating salary payment:', err)
      error('An error occurred while updating salary payment')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = (payment) => {
    if (!payment || !payment.id) {
      error('Invalid salary payment selected.')
      return
    }
    setSalaryToDelete(payment)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!salaryToDelete || !salaryToDelete.id) return

    setDeleteLoading(true)
    try {
      const response = await staffService.deleteSalaryPayment(salaryToDelete.id)
      if (response.success) {
        success('Salary payment deleted successfully')
        setShowDeleteModal(false)
        setSalaryToDelete(null)
        fetchSalaryPayments()
      } else {
        error(response.message || 'Failed to delete salary payment')
      }
    } catch (err) {
      console.error('Error deleting salary payment:', err)
      error('An error occurred while deleting salary payment')
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    {
      key: 'staffInfo',
      label: 'Staff',
      render: (value, payment) => {
        if (!payment) return <span className="text-muted">—</span>
        const staff = payment.staff || {}
        return (
          <div>
            <div className="fw-semibold">{staff.name || '—'}</div>
            <small className="text-muted">{staff.staffCode || '—'}</small>
          </div>
        )
      },
    },
    {
      key: 'period',
      label: 'Month & Year',
      render: (value, payment) => {
        if (!payment) return <span className="text-muted">—</span>
        const month = payment.month
        const year = payment.year
        if (!month || !year) return <span className="text-muted">—</span>
        return (
          <div>
            <div className="fw-semibold">{getMonthName(month)}</div>
            <small className="text-muted">{year}</small>
          </div>
        )
      },
    },
    {
      key: 'paidAmount',
      label: 'Paid',
      render: (value, payment) => {
        if (!payment) return <span className="text-muted">—</span>
        return (
          <span className="fw-semibold text-success">
            ₹{payment.paidAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </span>
        )
      },
    },
    {
      key: 'createdModified',
      label: 'Created / Modified',
      render: (value, payment) => {
        if (!payment) return <span className="text-muted">—</span>
        
        // Handle createdBy - check creator relationship first (from API), then createdBy object
        const getCreatedByName = () => {
          // First check if creator relationship is loaded (from API)
          if (payment.creator && typeof payment.creator === 'object') {
            return payment.creator.name || payment.creator.email || null
          }
          
          // If createdBy is an object (with name/email) - fallback
          if (payment.createdBy && typeof payment.createdBy === 'object' && payment.createdBy !== null) {
            return payment.createdBy.name || payment.createdBy.email || null
          }
          
          // If it's just an ID, we can't show the name
          return null
        }
        
        const createdByName = getCreatedByName()
        const createdDate = payment.createdAt
          ? new Date(payment.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : null
        const modifiedDate = payment.updatedAt && payment.updatedAt !== payment.createdAt
          ? new Date(payment.updatedAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : null
        
        return (
          <div>
            {createdByName && (
              <div className="small">
                <span className="text-muted">By: </span>
                <span className="fw-semibold">{createdByName}</span>
              </div>
            )}
            {createdDate && (
              <div className="small text-muted">
                {createdDate}
              </div>
            )}
            {modifiedDate && (
              <div className="small text-muted mt-1">
                <span className="text-muted">Modified: </span>
                {modifiedDate}
              </div>
            )}
            {!createdByName && !createdDate && (
              <span className="text-muted small">—</span>
            )}
          </div>
        )
      },
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (value, payment) => {
        if (!payment) return <span className="text-muted">—</span>
        return getPaymentMethodBadge(payment.paymentMethod)
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, payment) => {
        if (!payment) return <span className="text-muted">—</span>
        return (
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(payment)
              }}
              title="Edit salary payment"
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(payment)
              }}
              title="Delete salary payment"
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>
        )
      },
    },
  ]

  const monthOptions = [
    { value: '', label: 'All Months' },
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]


  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      fullscreen="lg-down"
      backdrop="static"
      keyboard={false}
      className="modal-xl-large"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faWallet} className="me-2" />
          Salary Payments Report
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={6} sm={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="text-muted small mb-1">Total Records</div>
                <div className="h4 mb-0 fw-bold">{summary.total}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} sm={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="text-muted small mb-1">Total Paid</div>
                <div className="h4 mb-0 fw-bold text-success">
                  ₹{summary.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <Row className="g-2 align-items-end">
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by staff name or code..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </InputGroup>
              </Col>
              <Col md={2}>
                <SelectField
                  id="monthFilter"
                  label=""
                  value={monthFilter}
                  onChange={(e) => {
                    setMonthFilter(e.target.value ? parseInt(e.target.value) : '')
                    setCurrentPage(1)
                  }}
                  options={monthOptions}
                  showLabel={false}
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  type="number"
                  placeholder="Year (e.g., 2025)"
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </Col>
              <Col md={2}>
                <Button variant="outline-secondary" onClick={handleClearFilters} className="w-100">
                  Clear
                </Button>
              </Col>
              <Col md={2} className="d-flex justify-content-end">
                <Button variant="outline-primary" onClick={handleExport} disabled={exportLoading}>
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                  {exportLoading ? 'Exporting...' : 'Export Report'}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Salary Payments Table */}
        <Table
          columns={columns}
          data={salaryPayments}
          loading={loading}
          sortable={false}
          sortableColumns={[]}
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
          emptyMessage="No salary payments found."
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>

      {/* Edit Salary Payment Modal */}
      {salaryToEdit && (
        <SalaryPaymentModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false)
            setSalaryToEdit(null)
          }}
          staff={salaryToEdit.staff}
          salaryPayment={salaryToEdit}
          mode="edit"
          onSubmit={handleEditSubmit}
          loading={editLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => !deleteLoading && setShowDeleteModal(false)}
        backdrop={deleteLoading ? 'static' : true}
        keyboard={!deleteLoading}
      >
        <Modal.Header closeButton={!deleteLoading}>
          <Modal.Title>Delete Salary Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {salaryToDelete ? (
            <div>
              <p>
                Are you sure you want to delete the salary payment for{' '}
                <strong>{salaryToDelete.staff?.name || 'this staff'}</strong>?
              </p>
              <p className="text-muted mb-0">
                <small>
                  Month: {getMonthName(salaryToDelete.month)} {salaryToDelete.year} | Amount:{' '}
                  ₹{salaryToDelete.paidAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </small>
              </p>
              <p className="text-danger mt-2 mb-0">
                <small>This action cannot be undone.</small>
              </p>
            </div>
          ) : (
            'Loading...'
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleteLoading || !salaryToDelete}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  )
}

export default SalaryReportModal

