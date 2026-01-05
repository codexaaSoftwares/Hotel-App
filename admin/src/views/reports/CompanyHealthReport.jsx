import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Card, FormControl, FormSelect, Badge, OverlayTrigger, Tooltip, Table } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartLine,
  faDownload,
  faRefresh,
  faDollarSign,
  faShoppingCart,
  faCreditCard,
  faArrowUp,
  faArrowDown,
  faFileInvoiceDollar,
  faInfoCircle,
  faQuestionCircle,
  faUsers,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons'
import { CChartDoughnut } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import reportService from '../../services/reportService'
import branchService from '../../services/branchService'
import { useToast } from '../../components'

const CompanyHealthReport = () => {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [branchId, setBranchId] = useState('')
  const [branches, setBranches] = useState([])
  const [reportData, setReportData] = useState(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    loadBranches()
    // Set default date range to current year (Jan 1 to Dec 31)
    const today = new Date()
    const currentYear = today.getFullYear()
    // January 1st of current year
    const firstDayOfYear = `${currentYear}-01-01`
    // December 31st of current year
    const lastDayOfYear = `${currentYear}-12-31`
    setStartDate(firstDayOfYear)
    setEndDate(lastDayOfYear)
  }, [])

  const loadBranches = async () => {
    try {
      const response = await branchService.getBranches({ limit: 100 })
      if (response.success) {
        setBranches(response.data || [])
      }
    } catch (err) {
      console.error('Error loading branches:', err)
    }
  }

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
      if (branchId) {
        params.branch_id = branchId
      }

      const response = await reportService.getCompanyHealthReport(params)
      if (response.success) {
        setReportData(response.data)
        success('Report generated successfully')
      } else {
        error(response.message || 'Failed to generate report')
      }
    } catch (err) {
      console.error('Error generating report:', err)
      error('An error occurred while generating the report')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0)
  }

  const handleExportPDF = async () => {
    if (!reportData) {
      error('Please generate the report first')
      return
    }

    setExportingPdf(true)
    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
      }
      if (branchId) {
        params.branch_id = branchId
      }

      const response = await reportService.exportCompanyHealthReportPdf(params)
      if (response.success) {
        success('PDF exported successfully')
      } else {
        error(response.message || 'Failed to export PDF')
      }
    } catch (err) {
      console.error('Error exporting PDF:', err)
      error('An error occurred while exporting PDF')
    } finally {
      setExportingPdf(false)
    }
  }

  // Calculate Financial Overview values
  const getFinancialOverview = () => {
    if (!reportData) return null
    
    const incomingFlow = (reportData.financialSummary?.netPayments || 0) + (reportData.financialSummary?.totalIncome || 0)
    const expenseFlow = reportData.financialSummary?.totalExpenses || 0
    const companyProfit = incomingFlow - expenseFlow
    const outstanding = reportData.financialSummary?.outstandingAmount || 0

    return {
      incomingFlow,
      expenseFlow,
      companyProfit,
      outstanding,
    }
  }

  // Prepare chart data for Income by Category
  const getIncomeChartData = () => {
    if (!reportData?.incomeExpenses?.incomeByCategory || reportData.incomeExpenses.incomeByCategory.length === 0) {
      return { labels: [], data: [], colors: [] }
    }

    const categories = reportData.incomeExpenses.incomeByCategory
    const labels = categories.map(item => item.category)
    const data = categories.map(item => item.amount)
    
    // Generate colors
    const colors = [
      'rgba(40, 167, 69, 0.8)',   // Green
      'rgba(40, 167, 69, 0.6)',
      'rgba(40, 167, 69, 0.4)',
      'rgba(25, 135, 84, 0.8)',
      'rgba(25, 135, 84, 0.6)',
      'rgba(20, 108, 67, 0.8)',
    ]

    return { labels, data, colors }
  }

  // Prepare chart data for Expenses by Category
  const getExpenseChartData = () => {
    if (!reportData?.incomeExpenses?.expensesByCategory || reportData.incomeExpenses.expensesByCategory.length === 0) {
      return { labels: [], data: [], colors: [] }
    }

    const categories = reportData.incomeExpenses.expensesByCategory
    const labels = categories.map(item => item.category)
    const data = categories.map(item => item.amount)
    
    // Generate colors
    const colors = [
      'rgba(220, 53, 69, 0.8)',   // Red
      'rgba(220, 53, 69, 0.6)',
      'rgba(220, 53, 69, 0.4)',
      'rgba(178, 43, 55, 0.8)',
      'rgba(178, 43, 55, 0.6)',
      'rgba(142, 34, 43, 0.8)',
    ]

    return { labels, data, colors }
  }

  const financialOverview = getFinancialOverview()
  const incomeChartData = getIncomeChartData()
  const expenseChartData = getExpenseChartData()

  return (
    <Container fluid className="px-0 px-xl-3">
      <Row className="g-4">
        <Col xs={12}>
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faChartLine} className="me-3 text-primary fs-4" />
              <h2 className="mb-0 text-dark">Company Health Report</h2>
            </div>
          </div>

          {/* About This Report - Moved to Top */}
          <Card className="shadow-sm mb-4">
            <Card.Body className="p-3">
              <div className="d-flex align-items-start">
                <FontAwesomeIcon icon={faInfoCircle} className="text-primary me-3 mt-1" />
                <div className="flex-grow-1">
                  <h6 className="mb-2 text-dark fw-bold">About This Report</h6>
                  <p className="mb-0 text-muted small" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                    The <strong>Company Health Report</strong> provides a comprehensive financial overview combining order transactions and income/expense records. It includes order summaries, customer details, financial transactions, and key performance indicators to help you assess your business's financial health and make informed decisions.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Filters */}
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Row className="g-3 align-items-end">
                <Col md={3}>
                  <label className="form-label fw-semibold">Start Date</label>
                  <FormControl
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-2"
                  />
                </Col>
                <Col md={3}>
                  <label className="form-label fw-semibold">End Date</label>
                  <FormControl
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-2"
                  />
                </Col>
                <Col md={3}>
                  <label className="form-label fw-semibold">Branch</label>
                  <FormSelect
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="border-2"
                  >
                    <option value="">All Branches</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </FormSelect>
                </Col>
                <Col md={3}>
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      onClick={handleGenerateReport}
                      disabled={loading}
                      className="flex-grow-1"
                    >
                      <FontAwesomeIcon icon={faRefresh} className="me-2" />
                      {loading ? 'Generating...' : 'Generate Report'}
                    </Button>
                    {reportData && (
                      <Button
                        variant="danger"
                        onClick={handleExportPDF}
                        disabled={exportingPdf}
                        title="Export Report PDF"
                      >
                        <FontAwesomeIcon icon={faFilePdf} />
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Report Data */}
          {reportData && (
            <>
              {/* Section 1: Order Summary */}
              <div className="mb-5" style={{ backgroundColor: '#e7f1ff', padding: '20px', borderRadius: '8px', border: '1px solid #b3d9ff' }}>
                <Card className="shadow-sm mb-4" style={{ 
                  borderLeft: '4px solid #0d6efd',
                  backgroundColor: '#ffffff'
                }}>
                  <Card.Body className="p-4">
                    <div className="mb-3">
                      <h4 className="text-dark fw-bold mb-2">
                        <FontAwesomeIcon icon={faShoppingCart} className="me-2 text-primary" />
                        Order Summary
                      </h4>
                      <p className="text-muted mb-0">
                        Overview of all orders, payments, and customer transactions within the selected date range.
                      </p>
                    </div>
                  </Card.Body>
                </Card>

                {/* Summary Cards */}
                <Row className="mb-4 g-3">
                  <Col md={3} sm={6}>
                    <Card className="shadow-sm h-100 border-start border-info border-4">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <h4 className="mb-0 text-info me-2">{formatNumber(reportData.financialSummary?.totalOrders)}</h4>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-orders">
                                    <strong>Calculation:</strong> Count of all orders created within the selected date range
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faQuestionCircle} className="text-muted" style={{ fontSize: '12px', cursor: 'help' }} />
                              </OverlayTrigger>
                            </div>
                            <p className="mb-1 text-muted small fw-semibold">Total Orders</p>
                          </div>
                          <FontAwesomeIcon icon={faShoppingCart} className="text-info fs-4" />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3} sm={6}>
                    <Card className="shadow-sm h-100 border-start border-primary border-4">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <h4 className="mb-0 text-primary me-2">{formatCurrency(reportData.financialSummary?.totalRevenue)}</h4>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-revenue">
                                    <strong>Calculation:</strong> Sum of all order total amounts within the selected date range
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faQuestionCircle} className="text-muted" style={{ fontSize: '12px', cursor: 'help' }} />
                              </OverlayTrigger>
                            </div>
                            <p className="mb-1 text-muted small fw-semibold">Order Amount</p>
                          </div>
                          <FontAwesomeIcon icon={faDollarSign} className="text-primary fs-4" />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3} sm={6}>
                    <Card className="shadow-sm h-100 border-start border-success border-4">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <h4 className="mb-0 text-success me-2">{formatCurrency(reportData.financialSummary?.netPayments)}</h4>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-paid">
                                    <strong>Calculation:</strong> Total Payments Received - Total Refunds
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faQuestionCircle} className="text-muted" style={{ fontSize: '12px', cursor: 'help' }} />
                              </OverlayTrigger>
                            </div>
                            <p className="mb-1 text-muted small fw-semibold">Paid Amounts</p>
                          </div>
                          <FontAwesomeIcon icon={faCreditCard} className="text-success fs-4" />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3} sm={6}>
                    <Card className="shadow-sm h-100 border-start border-warning border-4">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <h4 className="mb-0 text-warning me-2">{formatCurrency(reportData.financialSummary?.outstandingAmount)}</h4>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-outstanding">
                                    <strong>Calculation:</strong> Total Revenue - Total Payments Received
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faQuestionCircle} className="text-muted" style={{ fontSize: '12px', cursor: 'help' }} />
                              </OverlayTrigger>
                            </div>
                            <p className="mb-1 text-muted small fw-semibold">Remaining Amounts</p>
                          </div>
                          <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-warning fs-4" />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* All Customers List */}
                {reportData.allCustomers && reportData.allCustomers.length > 0 && (
                  <Card className="shadow-sm">
                    <Card.Body>
                      <h5 className="mb-3">
                        <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
                        All Customers ({reportData.allCustomers.length})
                      </h5>
                      <div className="table-responsive">
                        <Table hover>
                          <thead>
                            <tr>
                              <th>Customer Code</th>
                              <th>Job Code</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Branch</th>
                              <th className="text-end">Total Order Amount</th>
                              <th className="text-end">Paid Amount</th>
                              <th className="text-end">Remaining Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.allCustomers.map((customer) => (
                              <tr key={customer.id}>
                                <td>{customer.customerCode}</td>
                                <td>
                                  {customer.jobCode || customer.job_code ? (
                                    <span className="text-primary fw-bold">{customer.jobCode || customer.job_code}</span>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                                <td>{customer.name}</td>
                                <td>{customer.email || '-'}</td>
                                <td>{customer.phone || '-'}</td>
                                <td>{customer.branchName || '-'}</td>
                                <td className="text-end">{formatCurrency(customer.totalOrderAmount)}</td>
                                <td className="text-end text-success">{formatCurrency(customer.paidAmount)}</td>
                                <td className="text-end">
                                  {customer.remainingAmount > 0 ? (
                                    <span className="text-danger fw-bold">{formatCurrency(customer.remainingAmount)}</span>
                                  ) : (
                                    <span className="text-success">{formatCurrency(customer.remainingAmount)}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </div>

              {/* Section 2: Income & Expense Summary */}
              <div className="mb-5" style={{ backgroundColor: '#d1f2eb', padding: '20px', borderRadius: '8px', border: '1px solid #81e6d9' }}>
                <Card className="shadow-sm mb-4" style={{ 
                  borderLeft: '4px solid #198754',
                  backgroundColor: '#ffffff'
                }}>
                  <Card.Body className="p-4">
                    <div className="mb-3">
                      <h4 className="text-dark fw-bold mb-2">
                        <FontAwesomeIcon icon={faChartLine} className="me-2 text-success" />
                        Income & Expense Summary
                      </h4>
                      <p className="text-muted mb-0">
                        Extra financial income/expense module which is outside of orders, 3rd party transactions.
                      </p>
                    </div>
                  </Card.Body>
                </Card>

                {/* Summary Cards */}
                <Row className="mb-4 g-3">
                  <Col md={3} sm={6}>
                    <Card className="shadow-sm h-100 border-start border-info border-4">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <h5 className="mb-0 text-info me-2">{formatNumber(reportData.incomeExpenses?.totalRecords || 0)}</h5>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-records">
                                    <strong>Calculation:</strong> Total count of income and expense transactions
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faQuestionCircle} className="text-muted" style={{ fontSize: '12px', cursor: 'help' }} />
                              </OverlayTrigger>
                            </div>
                            <p className="mb-1 text-muted small fw-semibold">Total Records</p>
                          </div>
                          <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-info fs-4" />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3} sm={6}>
                    <Card className="shadow-sm h-100 border-start border-success border-4">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <h5 className="mb-0 text-success me-2">{formatCurrency(reportData.financialSummary?.totalIncome)}</h5>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-income">
                                    <strong>Calculation:</strong> Sum of all financial transactions marked as "income" within the date range
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faQuestionCircle} className="text-muted" style={{ fontSize: '12px', cursor: 'help' }} />
                              </OverlayTrigger>
                            </div>
                            <p className="mb-1 text-muted small fw-semibold">Total Income</p>
                          </div>
                          <FontAwesomeIcon icon={faArrowUp} className="text-success fs-4" />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3} sm={6}>
                    <Card className="shadow-sm h-100 border-start border-danger border-4">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <h5 className="mb-0 text-danger me-2">{formatCurrency(reportData.financialSummary?.totalExpenses)}</h5>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-expenses">
                                    <strong>Calculation:</strong> Sum of all financial transactions marked as "expense" within the date range
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faQuestionCircle} className="text-muted" style={{ fontSize: '12px', cursor: 'help' }} />
                              </OverlayTrigger>
                            </div>
                            <p className="mb-1 text-muted small fw-semibold">Total Expenses</p>
                          </div>
                          <FontAwesomeIcon icon={faArrowDown} className="text-danger fs-4" />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3} sm={6}>
                    <Card className="shadow-sm h-100 border-start border-primary border-4">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <h5 className="mb-0 text-primary me-2">{formatCurrency(reportData.financialSummary?.netProfit)}</h5>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-profit">
                                    <strong>Calculation:</strong> Total Income - Total Expenses
                                  </Tooltip>
                                }
                              >
                                <FontAwesomeIcon icon={faQuestionCircle} className="text-muted" style={{ fontSize: '12px', cursor: 'help' }} />
                              </OverlayTrigger>
                            </div>
                            <p className="mb-1 text-muted small fw-semibold">Net Profit</p>
                          </div>
                          <FontAwesomeIcon icon={faChartLine} className="text-primary fs-4" />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Income Records with Chart */}
                <Row className="mb-4 g-3">
                  <Col md={8}>
                    <Card className="shadow-sm h-100">
                      <Card.Body>
                        <h5 className="mb-3 text-success">
                          <FontAwesomeIcon icon={faArrowUp} className="me-2" />
                          Income Records ({reportData.incomeExpenses?.incomeRecords?.length || 0})
                        </h5>
                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          <Table hover size="sm">
                            <thead className="sticky-top bg-white">
                              <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th className="text-end">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.incomeExpenses?.incomeRecords && reportData.incomeExpenses.incomeRecords.length > 0 ? (
                                reportData.incomeExpenses.incomeRecords.map((record) => (
                                  <tr key={record.id}>
                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                    <td>{record.category}</td>
                                    <td>{record.description || '-'}</td>
                                    <td className="text-end fw-semibold text-success">
                                      {formatCurrency(record.amount)}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="text-center text-muted py-4">
                                    No income records found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="shadow-sm h-100">
                      <Card.Body>
                        <h5 className="mb-3 text-success">Income by Category</h5>
                        {incomeChartData.labels.length > 0 ? (
                          <CChartDoughnut
                            data={{
                              labels: incomeChartData.labels,
                              datasets: [
                                {
                                  backgroundColor: incomeChartData.colors,
                                  data: incomeChartData.data,
                                },
                              ],
                            }}
                            options={{
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                },
                              },
                            }}
                            style={{ height: '300px' }}
                          />
                        ) : (
                          <div className="text-center text-muted py-5">
                            No income data available
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Expense Records with Chart */}
                <Row className="mb-4 g-3">
                  <Col md={8}>
                    <Card className="shadow-sm h-100">
                      <Card.Body>
                        <h5 className="mb-3 text-danger">
                          <FontAwesomeIcon icon={faArrowDown} className="me-2" />
                          Expense Records ({reportData.incomeExpenses?.expenseRecords?.length || 0})
                        </h5>
                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          <Table hover size="sm">
                            <thead className="sticky-top bg-white">
                              <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th className="text-end">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.incomeExpenses?.expenseRecords && reportData.incomeExpenses.expenseRecords.length > 0 ? (
                                reportData.incomeExpenses.expenseRecords.map((record) => (
                                  <tr key={record.id}>
                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                    <td>{record.category}</td>
                                    <td>{record.description || '-'}</td>
                                    <td className="text-end fw-semibold text-danger">
                                      {formatCurrency(record.amount)}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="text-center text-muted py-4">
                                    No expense records found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="shadow-sm h-100">
                      <Card.Body>
                        <h5 className="mb-3 text-danger">Expenses by Category</h5>
                        {expenseChartData.labels.length > 0 ? (
                          <CChartDoughnut
                            data={{
                              labels: expenseChartData.labels,
                              datasets: [
                                {
                                  backgroundColor: expenseChartData.colors,
                                  data: expenseChartData.data,
                                },
                              ],
                            }}
                            options={{
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                },
                              },
                            }}
                            style={{ height: '300px' }}
                          />
                        ) : (
                          <div className="text-center text-muted py-5">
                            No expense data available
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>

              {/* Section 3: Financial Overview */}
              {financialOverview && (
                <div className="mb-4" style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', border: '1px solid #ffd700' }}>
                  <Card className="shadow-lg mb-4" style={{ 
                    background: 'linear-gradient(135deg, #fff9e6 0%, #ffffff 100%)',
                    border: '3px solid #ffc107',
                    borderRadius: '12px'
                  }}>
                    <Card.Body className="p-4">
                      <div className="mb-4">
                        <div className="d-flex align-items-center mb-2">
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px'
                          }}>
                            <FontAwesomeIcon icon={faDollarSign} className="text-white fs-5" />
                          </div>
                          <div>
                            <h4 className="text-dark fw-bold mb-1">
                              Financial Overview
                            </h4>
                            <p className="text-muted mb-0 small">
                              Comprehensive financial health indicators combining orders and income/expense transactions.
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

                  <Row className="g-3">
                    <Col md={3} sm={6}>
                      <Card className="bg-gradient-success text-white border-0 shadow-sm h-100">
                        <Card.Body className="p-4">
                          <div className="d-flex align-items-start justify-content-between">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-2">
                                <h4 className="mb-0 me-2">{formatCurrency(financialOverview.incomingFlow)}</h4>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-incoming">
                                      <strong>Calculation:</strong> Orders: Total Paid Amounts + Income & Expense Summary: Total Income
                                    </Tooltip>
                                  }
                                >
                                  <FontAwesomeIcon icon={faQuestionCircle} className="opacity-75" style={{ fontSize: '14px', cursor: 'help' }} />
                                </OverlayTrigger>
                              </div>
                              <p className="mb-1 opacity-75 small fw-semibold">Incoming Flow</p>
                              <p className="mb-0 opacity-60" style={{ fontSize: '11px' }}>
                                Orders Paid + Income
                              </p>
                            </div>
                            <FontAwesomeIcon icon={faArrowUp} className="fs-1 opacity-50" />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3} sm={6}>
                      <Card className="text-white border-0 shadow-sm h-100" style={{ 
                        background: 'linear-gradient(135deg, #dc3545 0%, #bb2d3b 100%)'
                      }}>
                        <Card.Body className="p-4">
                          <div className="d-flex align-items-start justify-content-between">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-2">
                                <h4 className="mb-0 me-2 text-white">{formatCurrency(financialOverview.expenseFlow)}</h4>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-expense-flow">
                                      <strong>Calculation:</strong> Income & Expense Summary: Total Expense
                                    </Tooltip>
                                  }
                                >
                                  <FontAwesomeIcon icon={faQuestionCircle} className="opacity-75 text-white" style={{ fontSize: '14px', cursor: 'help' }} />
                                </OverlayTrigger>
                              </div>
                              <p className="mb-1 opacity-75 small fw-semibold text-white">Expense Flow</p>
                              <p className="mb-0 opacity-60 text-white" style={{ fontSize: '11px' }}>
                                Total Expenses
                              </p>
                            </div>
                            <FontAwesomeIcon icon={faArrowDown} className="fs-1 opacity-50 text-white" />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3} sm={6}>
                      <Card className="bg-gradient-primary text-white border-0 shadow-sm h-100">
                        <Card.Body className="p-4">
                          <div className="d-flex align-items-start justify-content-between">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-2">
                                <h4 className="mb-0 me-2">{formatCurrency(financialOverview.companyProfit)}</h4>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-company-profit">
                                      <strong>Calculation:</strong> Incoming Flow - Expense Flow
                                    </Tooltip>
                                  }
                                >
                                  <FontAwesomeIcon icon={faQuestionCircle} className="opacity-75" style={{ fontSize: '14px', cursor: 'help' }} />
                                </OverlayTrigger>
                              </div>
                              <p className="mb-1 opacity-75 small fw-semibold">Company Profit</p>
                              <p className="mb-0 opacity-60" style={{ fontSize: '11px' }}>
                                Incoming - Expense
                              </p>
                            </div>
                            <FontAwesomeIcon icon={faChartLine} className="fs-1 opacity-50" />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3} sm={6}>
                      <Card className="bg-gradient-warning text-white border-0 shadow-sm h-100">
                        <Card.Body className="p-4">
                          <div className="d-flex align-items-start justify-content-between">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-2">
                                <h4 className="mb-0 me-2">{formatCurrency(financialOverview.outstanding)}</h4>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-outstanding-overview">
                                      <strong>Calculation:</strong> Orders: Remaining Amounts
                                    </Tooltip>
                                  }
                                >
                                  <FontAwesomeIcon icon={faQuestionCircle} className="opacity-75" style={{ fontSize: '14px', cursor: 'help' }} />
                                </OverlayTrigger>
                              </div>
                              <p className="mb-1 opacity-75 small fw-semibold">Outstanding</p>
                              <p className="mb-0 opacity-60" style={{ fontSize: '11px' }}>
                                Orders Remaining
                              </p>
                            </div>
                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="fs-1 opacity-50" />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}
            </>
          )}

          {!reportData && !loading && (
            <Card className="shadow-sm">
              <Card.Body>
                <div className="text-center text-muted py-5">
                  <FontAwesomeIcon icon={faChartLine} className="fs-1 mb-3 opacity-50" />
                  <p>Select date range and click "Generate Report" to view company health data</p>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default CompanyHealthReport
