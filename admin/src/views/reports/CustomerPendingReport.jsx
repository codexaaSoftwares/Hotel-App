import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBarChart,
  faFilePdf,
  faFileCsv,
  faRupeeSign,
  faUsers,
  faUserClock,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons'
import { SelectField, TextField, FormRow } from '../../components/common/FormFields'
import { Table } from '../../components'
import reportService from '../../services/reportService'
import customerService from '../../services/customerService'
import { useToast } from '../../components'

const CustomerPendingReport = () => {
  const { success, error } = useToast()

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [customerId, setCustomerId] = useState('all')
  const [status, setStatus] = useState('all')

  // Data
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [summary, setSummary] = useState(null)
  const [customers, setCustomers] = useState([])

  // Filter dropdowns data
  const [customersList, setCustomersList] = useState([])

  // Fetch customers for filter
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await customerService.getCustomers({ limit: 1000 })
        if (response.success) {
          setCustomersList(response.data || [])
        }
      } catch (err) {
        console.error('Error loading customers:', err)
      }
    }
    fetchCustomers()
  }, [])

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      const params = {}

      if (startDate) {
        params.start_date = startDate
      }

      if (endDate) {
        params.end_date = endDate
      }

      if (customerId && customerId !== 'all') {
        params.customer_id = customerId
      }

      if (status && status !== 'all') {
        params.status = status
      }

      const response = await reportService.getCustomerPendingReport(params)

      if (response.success && response.data) {
        const reportData = response.data
        setReportData(reportData)
        setSummary(reportData.summary || null)
        // Filter out any null/undefined customers and ensure we have an array
        const customersArray = reportData.customers || []
        const validCustomers = Array.isArray(customersArray)
          ? customersArray.filter(customer => customer !== null && customer !== undefined)
          : []
        // Filter to show only customers with pending (remainingBalance < 0 means they owe money)
        const customersWithPending = validCustomers.filter(customer => customer.remainingBalance < 0)
        setCustomers(customersWithPending)
        success('Customer pending report generated successfully')
      } else {
        error(response.message || 'Failed to generate report')
        setReportData(null)
        setSummary(null)
        setCustomers([])
      }
    } catch (err) {
      console.error('Error generating report:', err)
      error('Failed to generate report. Please try again.')
      setReportData(null)
      setSummary(null)
      setCustomers([])
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

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <Badge bg="success">Active</Badge>
    }
    return <Badge bg="secondary">Inactive</Badge>
  }

  // Table columns
  const columns = [
    {
      key: 'customerCode',
      label: 'Customer Code',
      sortable: true,
      render: (value, row) => {
        return <span className="fw-semibold">{value || '-'}</span>
      },
    },
    {
      key: 'name',
      label: 'Customer Name',
      sortable: true,
      render: (value, row) => {
        return <span>{value || '-'}</span>
      },
    },
    {
      key: 'mobile',
      label: 'Mobile Number',
      sortable: false,
      render: (value, row) => {
        return <span>{value || '-'}</span>
      },
    },
    {
      key: 'totalCredits',
      label: 'Total Credit',
      sortable: true,
      render: (value, row) => {
        return <span className="text-success fw-semibold">{formatCurrency(value)}</span>
      },
    },
    {
      key: 'totalDebits',
      label: 'Total Debit',
      sortable: true,
      render: (value, row) => {
        return <span className="text-danger fw-semibold">{formatCurrency(value)}</span>
      },
    },
    {
      key: 'remainingBalance',
      label: 'Pending Amount',
      sortable: true,
      render: (value, row) => {
        // Display as positive value since it's a debt/pending amount
        const pendingAmount = Math.abs(value || 0)
        return <span className="text-danger fw-bold">{formatCurrency(pendingAmount)}</span>
      },
    },
    {
      key: 'lastTransactionDate',
      label: 'Last Transaction Date',
      sortable: true,
      render: (value, row) => {
        return <span>{formatDate(value)}</span>
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value, row) => {
        return getStatusBadge(value)
      },
    },
  ]

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faBarChart} className="me-3 text-theme fs-4" />
              <h2 className="mb-0">Customer Pending (Udhar) Report</h2>
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
                />
                <TextField
                  id="end_date"
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  col={3}
                />
                <SelectField
                  id="customer"
                  label="Customer"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Customers' },
                    ...customersList.map((customer) => ({
                      value: customer.id,
                      label: `${customer.customerCode} - ${customer.name}`,
                    })),
                  ]}
                  col={3}
                />
                <SelectField
                  id="status"
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                  col={3}
                />
              </FormRow>
              <FormRow className="mt-3">
                <Col md={12} className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    onClick={handleGenerateReport}
                    disabled={loading}
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </Col>
              </FormRow>
            </Card.Body>
          </Card>

          {/* Summary Cards */}
          {summary && (
            <Row className="mb-4">
              <Col xs={6} sm={6} md={4}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2 p-md-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-danger bg-opacity-10 rounded-circle p-2 me-2" style={{ minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faRupeeSign} className="text-danger" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Total Pending Amount</p>
                        <h6 className="mb-0 text-danger fw-bold">{formatCurrency(summary.totalPendingAmount)}</h6>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={6} md={4}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2 p-md-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2" style={{ minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faUsers} className="text-success" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Customers with Pending</p>
                        <h6 className="mb-0 text-success fw-bold">{summary.totalCustomersWithPending}</h6>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={6} md={4}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2 p-md-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-info bg-opacity-10 rounded-circle p-2 me-2" style={{ minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faChartLine} className="text-info" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Average Pending per Customer</p>
                        <h6 className="mb-0 text-info fw-bold">{formatCurrency(summary.averagePendingPerCustomer)}</h6>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Data Table */}
          {reportData && (
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Table
                  columns={columns}
                  data={customers}
                  loading={loading}
                  pagination={false}
                  sortable={true}
                  sortableColumns={['customerCode', 'name', 'totalCredits', 'totalDebits', 'remainingBalance', 'lastTransactionDate', 'status']}
                />
              </Card.Body>
            </Card>
          )}

          {!reportData && !loading && (
            <Card className="shadow-sm border-0">
              <Card.Body className="text-center py-5">
                <FontAwesomeIcon icon={faUserClock} size="3x" className="text-muted mb-3" />
                <p className="text-muted">Generate a report to view customer pending amounts</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default CustomerPendingReport

