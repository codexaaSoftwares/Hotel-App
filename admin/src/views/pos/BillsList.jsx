import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Button, Badge, Card, Form, InputGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { SelectField, TextField } from '../../components/common/FormFields'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrash,
  faPrint,
  faEye,
  faReceipt,
  faSearch,
  faRefresh,
  faCalendarAlt,
  faTable,
  faUser,
  faRupeeSign,
} from '@fortawesome/free-solid-svg-icons'
import { Table } from '../../components'
import billService from '../../services/billService'
import tableService from '../../services/tableService'
import customerService from '../../services/customerService'
import { useToast } from '../../components'
import { usePermissions, useDebounce } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const BillsList = () => {
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { hasPermission } = usePermissions()

  const [bills, setBills] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [tableFilter, setTableFilter] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortState, setSortState] = useState({
    columnKey: 'bill_date',
    sortBy: 'bill_date',
    sortDirection: 'desc',
  })
  
  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [billToDelete, setBillToDelete] = useState(null)
  const [billDetails, setBillDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Filter dropdowns data
  const [tables, setTables] = useState([])
  const [customers, setCustomers] = useState([])

  const debouncedSearch = useDebounce(searchTerm, 400)

  // Check permissions
  const canViewBill = hasPermission('view_bill')
  const canDeleteBill = hasPermission('delete_bill')

  // Fetch tables for filter
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await tableService.getTables({ limit: 1000 })
        if (response.success) {
          setTables(response.data || [])
        }
      } catch (err) {
        console.error('Error loading tables:', err)
      }
    }
    fetchTables()
  }, [])

  // Fetch customers for filter
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await customerService.getCustomers({ limit: 1000 })
        if (response.success) {
          setCustomers(response.data || [])
        }
      } catch (err) {
        console.error('Error loading customers:', err)
      }
    }
    fetchCustomers()
  }, [])

  const fetchBillsWithParams = useCallback(async () => {
    setLoading(true)
    const searchValue = (debouncedSearch || '').trim()
    try {
      const response = await billService.getBills({
        page: currentPage,
        limit: pageSize,
        search: searchValue || undefined,
        status: statusFilter || undefined,
        payment_status: paymentStatusFilter || undefined,
        table_id: tableFilter || undefined,
        customer_id: customerFilter || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        sortBy: sortState.sortBy,
        sortDirection: sortState.sortDirection,
      })

      if (response && response.success) {
        setBills(response.data || [])
        setMeta(response.meta || null)
      } else {
        error && error(response.message || 'Failed to load bills.')
        setBills([])
        setMeta(null)
      }
    } catch (err) {
      console.error('Error loading bills:', err)
      error && error('Failed to load bills. Please try again.')
      setBills([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    statusFilter,
    paymentStatusFilter,
    tableFilter,
    customerFilter,
    startDate,
    endDate,
    sortState.sortBy,
    sortState.sortDirection,
    error,
  ])

  useEffect(() => {
    if (!canViewBill) {
      error('You do not have permission to view bills.')
      navigate('/dashboard')
      return
    }
    fetchBillsWithParams()
  }, [canViewBill, navigate, fetchBillsWithParams, error])

  const handleSortChange = (columnKey, sortDirection) => {
    setSortState({
      columnKey,
      sortBy: columnKey,
      sortDirection,
    })
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    fetchBillsWithParams()
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setPaymentStatusFilter('')
    setTableFilter('')
    setCustomerFilter('')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  const handleViewDetails = async (bill) => {
    setBillDetails(null)
    setShowDetailsModal(true)
    setDetailsLoading(true)

    try {
      const response = await billService.getBillById(bill.id)
      if (response.success) {
        setBillDetails(response.data)
      } else {
        error(response.message || 'Failed to load bill details.')
      }
    } catch (err) {
      console.error('Error loading bill details:', err)
      error('Failed to load bill details. Please try again.')
    } finally {
      setDetailsLoading(false)
    }
  }

  const handlePrintBill = (bill) => {
    // Navigate to POS Panel with bill ID or open print window
    // For now, we'll use the same print logic from POS Panel
    if (!bill) return

    // Create print window
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      error('Please allow popups to print the bill')
      return
    }

    // Generate HTML for bill (simplified version - will be enhanced with full bill data)
    const billHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${bill.billNumber || bill.bill_number || 'N/A'}</title>
          <style>
            @media print {
              @page { margin: 10mm; size: A4; }
              body { margin: 0; padding: 0; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .bill-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Bill Receipt</h2>
            <p>Bill No: ${bill.billNumber || bill.bill_number || 'N/A'}</p>
            <p>Date: ${bill.billDate || bill.bill_date || 'N/A'}</p>
          </div>
          <div class="bill-info">
            <div>
              <strong>Table:</strong> ${bill.table?.tableName || bill.table?.table_name || bill.table?.table_number || 'N/A'}<br>
              <strong>Customer:</strong> ${bill.customer?.name || 'Walk-in'}<br>
              <strong>Status:</strong> ${bill.status || 'N/A'}<br>
              <strong>Payment Status:</strong> ${bill.paymentStatus || bill.payment_status || 'N/A'}<br>
            </div>
          </div>
          <div class="footer">
            <p>Total Amount: ₹${parseFloat(bill.totalAmount || bill.total_amount || 0).toFixed(2)}</p>
            <p>Thank you for your visit!</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(billHTML)
    printWindow.document.close()

    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleDelete = (bill) => {
    // Only allow deleting draft bills
    if (bill.status === 'paid') {
      error('Cannot delete paid bills.')
      return
    }
    setBillToDelete(bill)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!billToDelete) return

    try {
      const response = await billService.deleteBill(billToDelete.id)
      if (response.success) {
        success('Bill deleted successfully.')
        setShowDeleteModal(false)
        setBillToDelete(null)
        fetchBillsWithParams()
      } else {
        error(response.message || 'Failed to delete bill.')
      }
    } catch (err) {
      console.error('Error deleting bill:', err)
      error('Failed to delete bill. Please try again.')
    }
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success'
      case 'pending':
        return 'warning'
      case 'draft':
        return 'secondary'
      case 'cancelled':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  // Get payment status badge color
  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
        return 'success'
      case 'partial':
        return 'info'
      case 'pending':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  // Calculate statistics
  const statistics = {
    total: bills.length,
    pending: bills.filter((b) => b.status === 'pending' || b.paymentStatus === 'pending' || b.payment_status === 'pending').length,
    paid: bills.filter((b) => b.status === 'paid' || b.paymentStatus === 'paid' || b.payment_status === 'paid').length,
    todayRevenue: bills
      .filter((b) => {
        const billDate = new Date(b.billDate || b.bill_date)
        const today = new Date()
        return (
          billDate.toDateString() === today.toDateString() &&
          (b.status === 'paid' || b.paymentStatus === 'paid' || b.payment_status === 'paid')
        )
      })
      .reduce((sum, b) => sum + parseFloat(b.totalAmount || b.total_amount || 0), 0),
  }

  const columns = [
    {
      key: 'billNumber',
      label: 'Bill Number',
      sortable: true,
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return (
          <span className="fw-semibold text-primary">
            {bill.billNumber || bill.bill_number || `#BILL${bill.id}`}
          </span>
        )
      },
    },
    {
      key: 'billDate',
      label: 'Date',
      sortable: true,
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        const date = bill.billDate || bill.bill_date
        if (!date) return <span className="text-muted">—</span>
        return new Date(date).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      },
    },
    {
      key: 'table',
      label: 'Table',
      sortable: false,
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        const table = bill.table
        if (!table) return <span className="text-muted">Takeaway</span>
        
        const tableNumber = table.tableNumber || table.table_number || 'N/A'
        const tableName = table.tableName || table.table_name || ''
        const tooltipText = tableName ? `${tableNumber} - ${tableName}` : tableNumber
        
        return (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`table-tooltip-${bill.id}`}>{tooltipText}</Tooltip>}
          >
            <div>
              <FontAwesomeIcon icon={faTable} className="me-1 text-muted" />
              {tableNumber}
            </div>
          </OverlayTrigger>
        )
      },
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: false,
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        const customer = bill.customer
        if (!customer) return <Badge bg="secondary">Walk-in</Badge>
        return (
          <div>
            <FontAwesomeIcon icon={faUser} className="me-1 text-muted" />
            {customer.name || 'N/A'}
            {customer.customerCode && (
              <small className="text-muted ms-1">({customer.customerCode})</small>
            )}
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return <Badge bg={getStatusColor(bill.status)}>{bill.status || 'N/A'}</Badge>
      },
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      sortable: true,
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        const paymentStatus = bill.paymentStatus || bill.payment_status
        return <Badge bg={getPaymentStatusColor(paymentStatus)}>{paymentStatus || 'N/A'}</Badge>
      },
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      sortable: true,
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        const amount = parseFloat(bill.totalAmount || bill.total_amount || 0)
        return (
          <span className="fw-semibold">
            <FontAwesomeIcon icon={faRupeeSign} className="me-1" />
            {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return (
          <div className="d-flex gap-2">
            <Button variant="outline-info" size="sm" onClick={() => handleViewDetails(bill)} title="View details">
              <FontAwesomeIcon icon={faEye} />
            </Button>
            <Button variant="outline-primary" size="sm" onClick={() => handlePrintBill(bill)} title="Print bill">
              <FontAwesomeIcon icon={faPrint} />
            </Button>
            {canDeleteBill && bill.status !== 'paid' && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDelete(bill)}
                title="Delete bill"
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
                <FontAwesomeIcon icon={faReceipt} className="me-2 text-primary" />
                Bills Management
              </h2>
              <p className="text-muted mb-0 mt-1">View and manage all restaurant bills</p>
            </div>
            <div className="ms-auto">
              <Button variant="primary" onClick={() => navigate('/pos/panel')}>
                <FontAwesomeIcon icon={faReceipt} className="me-2" />
                New Bill
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col xs={12} sm={6} md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Total Bills</p>
                      <h3 className="mb-0">{meta?.total || statistics.total}</h3>
                    </div>
                    <FontAwesomeIcon icon={faReceipt} className="text-primary fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Pending</p>
                      <h3 className="mb-0 text-warning">{statistics.pending}</h3>
                    </div>
                    <FontAwesomeIcon icon={faReceipt} className="text-warning fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Paid</p>
                      <h3 className="mb-0 text-success">{statistics.paid}</h3>
                    </div>
                    <FontAwesomeIcon icon={faReceipt} className="text-success fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Today's Revenue</p>
                      <h3 className="mb-0 text-info">
                        <FontAwesomeIcon icon={faRupeeSign} className="me-1" />
                        {statistics.todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <FontAwesomeIcon icon={faRupeeSign} className="text-info fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filters and Search */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col xs={12} md={3}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by bill number, customer, table..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col xs={12} md={2}>
                  <SelectField
                    id="statusFilter"
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    options={[
                      { value: '', label: 'All Status' },
                      { value: 'draft', label: 'Draft' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'paid', label: 'Paid' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ]}
                    col={12}
                    showLabel={false}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <SelectField
                    id="paymentStatusFilter"
                    label="Payment Status"
                    value={paymentStatusFilter}
                    onChange={(e) => {
                      setPaymentStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    options={[
                      { value: '', label: 'All Payment' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'partial', label: 'Partial' },
                      { value: 'paid', label: 'Paid' },
                    ]}
                    col={12}
                    showLabel={false}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <SelectField
                    id="tableFilter"
                    label="Table"
                    value={tableFilter}
                    onChange={(e) => {
                      setTableFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    options={[
                      { value: '', label: 'All Tables' },
                      ...tables.map((table) => ({
                        value: table.id.toString(),
                        label: table.tableName || table.table_name || table.table_number || `Table ${table.id}`,
                      })),
                    ]}
                    col={12}
                    showLabel={false}
                  />
                </Col>
                <Col xs={12} md={3}>
                  <div className="d-flex gap-2">
                    <Button variant="outline-secondary" onClick={handleClearFilters} className="flex-grow-1">
                      Clear
                    </Button>
                    <Button
                      variant="outline-primary"
                      disabled={loading}
                      onClick={handleRefresh}
                      className="flex-grow-1"
                    >
                      <FontAwesomeIcon icon={faRefresh} className="me-1" />
                      Refresh
                    </Button>
                  </div>
                </Col>
              </Row>

              {/* Date Range Filter */}
              <Row className="g-3 mt-2">
                <Col xs={12} md={3}>
                  <TextField
                    id="startDate"
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setCurrentPage(1)
                    }}
                    col={12}
                    showLabel={false}
                  />
                </Col>
                <Col xs={12} md={3}>
                  <TextField
                    id="endDate"
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setCurrentPage(1)
                    }}
                    col={12}
                    showLabel={false}
                  />
                </Col>
                <Col xs={12} md={3}>
                  <SelectField
                    id="customerFilter"
                    label="Customer"
                    value={customerFilter}
                    onChange={(e) => {
                      setCustomerFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    options={[
                      { value: '', label: 'All Customers' },
                      ...customers.map((customer) => ({
                        value: customer.id.toString(),
                        label: `${customer.name}${customer.customerCode ? ` (${customer.customerCode})` : ''}`,
                      })),
                    ]}
                    col={12}
                    showLabel={false}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Bills Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Table
                data={bills}
                columns={columns}
                loading={loading}
                hover
                pagination={true}
                sortable={true}
                sortableColumns={['billNumber', 'billDate', 'status', 'paymentStatus', 'totalAmount']}
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this bill?</p>
          {billToDelete && (
            <div>
              <strong>Bill Number:</strong> {billToDelete.billNumber || billToDelete.bill_number || `#BILL${billToDelete.id}`}
              <br />
              <strong>Total Amount:</strong> ₹{parseFloat(billToDelete.totalAmount || billToDelete.total_amount || 0).toFixed(2)}
            </div>
          )}
          <p className="text-danger mt-2">
            <small>This action cannot be undone.</small>
          </p>
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

      {/* Bill Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faReceipt} className="me-2" />
            Bill Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {detailsLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : billDetails ? (
            <div>
              {/* Bill Information */}
              <div className="mb-4 pb-3 border-bottom">
                <h5 className="mb-3">Bill Information</h5>
                <Row className="mb-2">
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Bill Number:</strong>
                      <div className="text-primary fw-semibold">
                        {billDetails.billNumber || billDetails.bill_number || `#BILL${billDetails.id}`}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Date & Time:</strong>
                      <div>
                        {new Date(billDetails.billDate || billDetails.bill_date).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Status:</strong>
                      <div>
                        <Badge bg={getStatusColor(billDetails.status)} className="fs-6">
                          {billDetails.status?.toUpperCase() || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Payment Status:</strong>
                      <div>
                        <Badge bg={getPaymentStatusColor(billDetails.paymentStatus || billDetails.payment_status)} className="fs-6">
                          {(billDetails.paymentStatus || billDetails.payment_status)?.toUpperCase() || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Table & Customer Information */}
              <div className="mb-4 pb-3 border-bottom">
                <h5 className="mb-3">Table & Customer</h5>
                <Row className="mb-2">
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Table:</strong>
                      <div>
                        {billDetails.table ? (
                          <>
                            <FontAwesomeIcon icon={faTable} className="me-1 text-muted" />
                            {billDetails.table.tableNumber || billDetails.table.table_number || 'N/A'}
                            {billDetails.table.tableName && (
                              <span className="text-muted ms-1">({billDetails.table.tableName})</span>
                            )}
                            {billDetails.table.capacity && (
                              <small className="text-muted ms-1">- {billDetails.table.capacity} seats</small>
                            )}
                          </>
                        ) : (
                          <Badge bg="secondary">Takeaway</Badge>
                        )}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Customer:</strong>
                      <div>
                        {billDetails.customer ? (
                          <>
                            <FontAwesomeIcon icon={faUser} className="me-1 text-muted" />
                            {billDetails.customer.name || 'N/A'}
                            {billDetails.customer.customerCode && (
                              <Badge bg="info" className="ms-2">{billDetails.customer.customerCode}</Badge>
                            )}
                            {billDetails.customer.customerType && (
                              <Badge bg={billDetails.customer.customerType === 'credit' ? 'warning' : 'success'} className="ms-1">
                                {billDetails.customer.customerType === 'credit' ? 'Credit' : 'Regular'}
                              </Badge>
                            )}
                            {billDetails.customer.mobile && (
                              <div className="text-muted small mt-1">
                                <FontAwesomeIcon icon={faUser} className="me-1" />
                                {billDetails.customer.mobile}
                              </div>
                            )}
                            {billDetails.customer.email && (
                              <div className="text-muted small">
                                {billDetails.customer.email}
                              </div>
                            )}
                          </>
                        ) : (
                          <Badge bg="secondary">Walk-in Customer</Badge>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Bill Items */}
              {(billDetails.items || billDetails.billItems) && (billDetails.items || billDetails.billItems).length > 0 && (
                <div className="mb-4 pb-3 border-bottom">
                  <h5 className="mb-3">Items ({(billDetails.items || billDetails.billItems).length})</h5>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '5%' }}>#</th>
                          <th>Item Name</th>
                          <th className="text-end" style={{ width: '10%' }}>Qty</th>
                          <th className="text-end" style={{ width: '15%' }}>Unit Price</th>
                          <th className="text-end" style={{ width: '15%' }}>GST</th>
                          <th className="text-end" style={{ width: '15%' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(billDetails.items || billDetails.billItems || []).map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td>{idx + 1}</td>
                            <td>
                              {item.itemName || item.item_name}
                              {item.notes && (
                                <div className="text-muted small mt-1">
                                  <em>Note: {item.notes}</em>
                                </div>
                              )}
                            </td>
                            <td className="text-end">{item.quantity}</td>
                            <td className="text-end">
                              ₹{parseFloat(item.unitPrice || item.unit_price || 0).toFixed(2)}
                            </td>
                            <td className="text-end">
                              {item.gstAmount > 0 ? (
                                <>
                                  ₹{parseFloat(item.gstAmount || item.gst_amount || 0).toFixed(2)}
                                  {item.gstPercentage && (
                                    <small className="text-muted d-block">({item.gstPercentage}%)</small>
                                  )}
                                </>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td className="text-end fw-semibold">
                              ₹{parseFloat(item.totalPrice || item.total_price || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bill Summary */}
              <div className="mb-4 pb-3 border-bottom">
                <h5 className="mb-3">Bill Summary</h5>
              <Row className="mb-2">
                <Col md={6}>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <strong>₹{parseFloat(billDetails.subtotal || 0).toFixed(2)}</strong>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total GST:</span>
                    <strong>₹{parseFloat(billDetails.gstAmount || billDetails.gst_amount || 0).toFixed(2)}</strong>
                  </div>
                </Col>
              </Row>
              {(parseFloat(billDetails.cgstAmount || billDetails.cgst_amount || 0) > 0 ||
                parseFloat(billDetails.sgstAmount || billDetails.sgst_amount || 0) > 0 ||
                parseFloat(billDetails.serviceTaxAmount || billDetails.service_tax_amount || 0) > 0) && (
                <Row className="mb-2">
                  <Col md={4}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">CGST:</span>
                      <span className="small">₹{parseFloat(billDetails.cgstAmount || billDetails.cgst_amount || 0).toFixed(2)}</span>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">SGST:</span>
                      <span className="small">₹{parseFloat(billDetails.sgstAmount || billDetails.sgst_amount || 0).toFixed(2)}</span>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Service Tax:</span>
                      <span className="small">₹{parseFloat(billDetails.serviceTaxAmount || billDetails.service_tax_amount || 0).toFixed(2)}</span>
                    </div>
                  </Col>
                </Row>
              )}
                {parseFloat(billDetails.discount || 0) > 0 && (
                  <Row className="mb-2">
                    <Col md={6}>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-danger">Discount:</span>
                        <strong className="text-danger">- ₹{parseFloat(billDetails.discount || 0).toFixed(2)}</strong>
                      </div>
                    </Col>
                  </Row>
                )}
                <Row className="mb-2">
                  <Col md={12}>
                    <div className="d-flex justify-content-between p-2 bg-light rounded">
                      <span className="fs-5 fw-bold">Total Amount:</span>
                      <span className="fs-5 fw-bold text-primary">
                        ₹{parseFloat(billDetails.totalAmount || billDetails.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </Col>
                </Row>
                {(parseFloat(billDetails.paidAmount || billDetails.paid_amount || 0) > 0 ||
                  parseFloat(billDetails.remainingAmount || billDetails.remaining_amount || 0) > 0) && (
                  <Row className="mt-3">
                    <Col md={6}>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Paid Amount:</span>
                        <strong className="text-success">
                          ₹{parseFloat(billDetails.paidAmount || billDetails.paid_amount || 0).toFixed(2)}
                        </strong>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Remaining Amount:</span>
                        <strong className={parseFloat(billDetails.remainingAmount || billDetails.remaining_amount || 0) > 0 ? 'text-danger' : 'text-success'}>
                          ₹{parseFloat(billDetails.remainingAmount || billDetails.remaining_amount || 0).toFixed(2)}
                        </strong>
                      </div>
                    </Col>
                  </Row>
                )}
              </div>

              {/* Payment Information */}
              {(billDetails.paymentMethod || billDetails.notes || billDetails.creator) && (
                <div className="mb-3">
                  <h5 className="mb-3">Additional Information</h5>
                  {billDetails.paymentMethod && (
                    <div className="mb-2">
                      <strong>Payment Method:</strong>
                      <Badge bg="info" className="ms-2">
                        {billDetails.paymentMethod.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                  {billDetails.notes && (
                    <div className="mb-2">
                      <strong>Notes:</strong>
                      <div className="text-muted mt-1">{billDetails.notes}</div>
                    </div>
                  )}
                  {billDetails.creator && (
                    <div className="mb-2">
                      <strong>Created By:</strong>
                      <div className="text-muted mt-1">
                        {billDetails.creator.name || billDetails.creator.email || 'N/A'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted">No details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {billDetails && (
            <Button variant="primary" onClick={() => handlePrintBill(billDetails)}>
              <FontAwesomeIcon icon={faPrint} className="me-2" />
              Print Bill
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default BillsList

