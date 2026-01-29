import React, { useState, useEffect, useMemo } from 'react'
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
} from '@fortawesome/free-solid-svg-icons'
import { Table } from '../../../components'
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
    columnKey: 'paymentDate',
    sortBy: 'payment_date',
    sortDirection: 'desc',
  })
  const [exportLoading, setExportLoading] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 500)

  // Fetch salary payments
  const fetchSalaryPayments = useMemo(
    () => async () => {
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
    },
    [
      show,
      currentPage,
      pageSize,
      debouncedSearch,
      monthFilter,
      yearFilter,
      sortState.sortBy,
      sortState.sortDirection,
      error,
    ]
  )

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
      // TODO: Implement export when backend is ready
      error('Export functionality will be available soon. API is pending.')
    } catch (err) {
      console.error('Error exporting salary report:', err)
      error('Failed to export salary report. Please try again.')
    } finally {
      setExportLoading(false)
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
      sortable: true,
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
      key: 'paymentDate',
      label: 'Payment Date',
      sortable: true,
      render: (value, payment) => {
        if (!payment || !payment.paymentDate) return <span className="text-muted">—</span>
        return new Date(payment.paymentDate).toLocaleDateString('en-IN')
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
          sortableColumns={['paidAmount', 'paymentDate']}
          onSortChange={handleSortChange}
          pagination={{
            currentPage,
            pageSize,
            totalItems: meta?.total || 0,
            onPageChange: handlePageChange,
          }}
          serverSide={true}
          emptyMessage="No salary payments found."
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SalaryReportModal

