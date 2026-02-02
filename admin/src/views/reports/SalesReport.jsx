import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBarChart,
  faDownload,
  faFilePdf,
  faFileCsv,
  faRupeeSign,
  faReceipt,
  faCheckCircle,
  faClock,
  faDollarSign,
} from '@fortawesome/free-solid-svg-icons'
import { SelectField, TextField, FormRow } from '../../components/common/FormFields'
import { Table } from '../../components'
import reportService from '../../services/reportService'
import tableService from '../../services/tableService'
import customerService from '../../services/customerService'
import { useToast } from '../../components'

const SalesReport = () => {
  const { success, error } = useToast()

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState('all')
  const [tableId, setTableId] = useState('')
  const [customerId, setCustomerId] = useState('')

  // Data
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [summary, setSummary] = useState(null)
  const [bills, setBills] = useState([])

  // Filter dropdowns data
  const [tables, setTables] = useState([])
  const [customers, setCustomers] = useState([])

  // Set default date range to current month
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])

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

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      error('Please select both start and end dates')
      return
    }

    setLoading(true)
    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
      }

      if (paymentStatus && paymentStatus !== 'all') {
        params.payment_status = paymentStatus
      }

      if (paymentMethod && paymentMethod !== 'all') {
        params.payment_method = paymentMethod
      }

      if (tableId) {
        params.table_id = tableId
      }

      if (customerId) {
        params.customer_id = customerId
      }

      const response = await reportService.getSalesReport(params)

      if (response.success && response.data) {
        // response.data already contains { summary: {...}, bills: [...] }
        const reportData = response.data
        setReportData(reportData)
        setSummary(reportData.summary || null)
        // Filter out any null/undefined bills and ensure we have an array
        const billsArray = reportData.bills || []
        const validBills = Array.isArray(billsArray) 
          ? billsArray.filter(bill => bill !== null && bill !== undefined)
          : []
        setBills(validBills)
        success('Sales report generated successfully')
      } else {
        error(response.message || 'Failed to generate report')
        setReportData(null)
        setSummary(null)
        setBills([])
      }
    } catch (err) {
      console.error('Error generating report:', err)
      error('Failed to generate report. Please try again.')
      setReportData(null)
      setSummary(null)
      setBills([])
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export API
    error('PDF export will be implemented soon')
  }

  const handleExportCSV = () => {
    // TODO: Implement CSV export API
    error('CSV export will be implemented soon')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getPaymentStatusBadge = (status) => {
    const variants = {
      paid: 'success',
      pending: 'warning',
      partial: 'info',
      draft: 'secondary',
    }
    return <Badge bg={variants[status] || 'secondary'}>{status?.toUpperCase() || '-'}</Badge>
  }

  const getPaymentMethodLabel = (method) => {
    if (!method) return 'Wallet'
    return method.charAt(0).toUpperCase() + method.slice(1)
  }

  // Table columns
  const columns = [
    {
      key: 'billNumber',
      label: 'Bill Number',
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return <span className="fw-semibold text-primary">{bill.billNumber || (bill.id ? `#BILL${bill.id}` : '-')}</span>
      },
    },
    {
      key: 'billDate',
      label: 'Date',
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return formatDate(bill.billDate)
      },
    },
    {
      key: 'table',
      label: 'Table',
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return bill.table?.tableName || bill.table?.tableNumber || '-'
      },
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return bill.customer?.name || 'Walk-in'
      },
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return getPaymentMethodLabel(bill.paymentMethod)
      },
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return getPaymentStatusBadge(bill.paymentStatus)
      },
    },
    {
      key: 'subtotal',
      label: 'Subtotal',
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return formatCurrency(bill.subtotal)
      },
      align: 'right',
    },
    {
      key: 'discount',
      label: 'Discount',
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return formatCurrency(bill.discount)
      },
      align: 'right',
    },
    {
      key: 'cgstAmount',
      label: 'CGST',
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return formatCurrency(bill.cgstAmount)
      },
      align: 'right',
    },
    {
      key: 'sgstAmount',
      label: 'SGST',
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return formatCurrency(bill.sgstAmount)
      },
      align: 'right',
    },
    {
      key: 'serviceTaxAmount',
      label: 'Service Tax',
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return formatCurrency(bill.serviceTaxAmount)
      },
      align: 'right',
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      render: (value, bill) => {
        if (!bill) return <span className="text-muted">—</span>
        return <strong className="text-theme">{formatCurrency(bill.totalAmount)}</strong>
      },
      align: 'right',
    },
  ]

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faBarChart} className="me-3 text-theme fs-4" />
              <h2 className="mb-0">Sales Report</h2>
            </div>
            {reportData && (
              <div className="d-flex gap-2">
                <Button variant="outline-danger" onClick={handleExportPDF}>
                  <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                  Export PDF
                </Button>
                <Button variant="outline-success" onClick={handleExportCSV}>
                  <FontAwesomeIcon icon={faFileCsv} className="me-2" />
                  Export CSV
                </Button>
              </div>
            )}
          </div>

          {/* Filters Card */}
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-3">Filters</h5>
              <FormRow>
                <TextField
                  id="start_date"
                  label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  col={3}
                  required
                />
                <TextField
                  id="end_date"
                  label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  col={3}
                  required
                />
                <SelectField
                  id="payment_status"
                  label="Payment Status"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'partial', label: 'Partial' },
                  ]}
                  col={2}
                />
                <SelectField
                  id="payment_method"
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'cash', label: 'Cash' },
                    { value: 'upi', label: 'UPI' },
                    { value: 'card', label: 'Card' },
                    { value: 'wallet', label: 'Wallet' },
                  ]}
                  col={2}
                />
                <Col md={2} className="d-flex align-items-end">
                  <Button 
                    variant="primary" 
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="w-100"
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </Col>
              </FormRow>
              <FormRow className="mt-3">
                <SelectField
                  id="table_id"
                  label="Table (Optional)"
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  options={[
                    { value: '', label: 'All Tables' },
                    ...tables.map((table) => ({
                      value: table.id,
                      label: `${table.table_number} - ${table.table_name || 'No Name'}`,
                    })),
                  ]}
                  col={6}
                />
                <SelectField
                  id="customer_id"
                  label="Customer (Optional)"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  options={[
                    { value: '', label: 'All Customers' },
                    ...customers.map((customer) => ({
                      value: customer.id,
                      label: `${customer.customerCode || ''} - ${customer.name}`,
                    })),
                  ]}
                  col={6}
                />
              </FormRow>
            </Card.Body>
          </Card>

          {/* Summary Cards - Row 1 (Compact) */}
          {summary && (
            <Row className="mb-3 g-2">
              <Col xs={6} sm={6} md={3}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2 p-md-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                        <FontAwesomeIcon icon={faReceipt} className="text-success" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Total Bills</p>
                        <h6 className="mb-0 text-success fw-bold">{summary.totalBillsCount}</h6>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={6} md={3}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2 p-md-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-success" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Paid Bills</p>
                        <h6 className="mb-0 text-success fw-bold">{summary.paidBillsCount}</h6>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={6} md={3}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2 p-md-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-2">
                        <FontAwesomeIcon icon={faClock} className="text-warning" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Pending Bills</p>
                        <h6 className="mb-0 text-warning fw-bold">{summary.pendingBillsCount}</h6>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={6} md={3}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2 p-md-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-theme bg-opacity-10 rounded-circle p-2 me-2">
                        <FontAwesomeIcon icon={faRupeeSign} className="text-theme" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Total Sales</p>
                        <h6 className="mb-0 text-theme fw-bold">{formatCurrency(summary.totalSalesAmount)}</h6>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Summary Cards - Row 2 (Compact) */}
          {summary && (
            <Row className="mb-3 g-2">
              <Col xs={6} sm={4} md={2} lg={2} className="px-1">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2">
                    <div className="d-flex flex-column align-items-center text-center">
                      <div className="bg-success bg-opacity-10 rounded-circle p-2 mb-1" style={{ minWidth: '2rem', minHeight: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faRupeeSign} className="text-success" style={{ fontSize: '1rem' }} />
                      </div>
                      <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Subtotal</p>
                      <h6 className="mb-0 text-success fw-bold" style={{ fontSize: '0.875rem' }}>{formatCurrency(summary.totalSubtotal)}</h6>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={4} md={2} lg={2} className="px-1">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2">
                    <div className="d-flex flex-column align-items-center text-center">
                      <div className="bg-danger bg-opacity-10 rounded-circle p-2 mb-1" style={{ minWidth: '2rem', minHeight: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faRupeeSign} className="text-danger" style={{ fontSize: '1rem' }} />
                      </div>
                      <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Discount</p>
                      <h6 className="mb-0 text-danger fw-bold" style={{ fontSize: '0.875rem' }}>{formatCurrency(summary.totalDiscount)}</h6>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={4} md={2} lg={2} className="px-1">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2">
                    <div className="d-flex flex-column align-items-center text-center">
                      <div className="bg-info bg-opacity-10 rounded-circle p-2 mb-1" style={{ minWidth: '2rem', minHeight: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faRupeeSign} className="text-info" style={{ fontSize: '1rem' }} />
                      </div>
                      <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>CGST</p>
                      <h6 className="mb-0 text-info fw-bold" style={{ fontSize: '0.875rem' }}>{formatCurrency(summary.totalCgstAmount)}</h6>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={4} md={2} lg={2} className="px-1">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2">
                    <div className="d-flex flex-column align-items-center text-center">
                      <div className="bg-info bg-opacity-10 rounded-circle p-2 mb-1" style={{ minWidth: '2rem', minHeight: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faRupeeSign} className="text-info" style={{ fontSize: '1rem' }} />
                      </div>
                      <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>SGST</p>
                      <h6 className="mb-0 text-info fw-bold" style={{ fontSize: '0.875rem' }}>{formatCurrency(summary.totalSgstAmount)}</h6>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={4} md={2} lg={2} className="px-1">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2">
                    <div className="d-flex flex-column align-items-center text-center">
                      <div className="bg-info bg-opacity-10 rounded-circle p-2 mb-1" style={{ minWidth: '2rem', minHeight: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faRupeeSign} className="text-info" style={{ fontSize: '1rem' }} />
                      </div>
                      <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Service Tax</p>
                      <h6 className="mb-0 text-info fw-bold" style={{ fontSize: '0.875rem' }}>{formatCurrency(summary.totalServiceTaxAmount)}</h6>
                    </div>
                  </Card.Body>
                </Card>
                </Col>
              </Row>
          )}

          {/* Report Data Table */}
          {reportData && (
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Bill Details</h5>
                  <span className="text-muted small">
                    Showing <strong>{bills.length}</strong> {bills.length === 1 ? 'record' : 'records'} 
                    {summary && ` (Total: ${summary.totalBillsCount})`}
                  </span>
                </div>
                {bills.length > 0 ? (
                  <Table
                    columns={columns}
                    data={bills}
                    loading={loading}
                    pagination={false}
                    sortable={true}
                    sortableColumns={['billNumber', 'billDate', 'subtotal', 'discount', 'totalAmount']}
                  />
                ) : (
                  <div className="text-center text-muted py-5">
                    <FontAwesomeIcon icon={faReceipt} className="fs-1 mb-3 opacity-50" />
                    <p>No bills found for the selected filters</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Empty State */}
          {!reportData && !loading && (
            <Card className="shadow-sm">
              <Card.Body>
              <div className="text-center text-muted py-5">
                  <FontAwesomeIcon icon={faBarChart} className="fs-1 mb-3 opacity-50" />
                  <p>Select date range and click "Generate Report" to view sales data</p>
              </div>
            </Card.Body>
          </Card>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default SalesReport
