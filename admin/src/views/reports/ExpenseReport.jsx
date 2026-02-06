import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBarChart,
  faFilePdf,
  faFileCsv,
  faRupeeSign,
  faMoneyBillWave,
  faCalendarAlt,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons'
import { SelectField, TextField, FormRow } from '../../components/common/FormFields'
import { Table } from '../../components'
import reportService from '../../services/reportService'
import expenseService from '../../services/expenseService'
import { useToast } from '../../components'

const ExpenseReport = () => {
  const { success, error } = useToast()

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState('all')

  // Data
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [summary, setSummary] = useState(null)
  const [expenses, setExpenses] = useState([])

  // Filter dropdowns data
  const [categories, setCategories] = useState([])

  // Set default date range to current month
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await expenseService.getExpenseCategories({ limit: 1000 })
        if (response.success) {
          setCategories(response.data || [])
        }
      } catch (err) {
        console.error('Error loading categories:', err)
      }
    }
    fetchCategories()
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

      if (categoryId && categoryId !== 'all') {
        params.category_id = categoryId
      }

      if (paymentMethod && paymentMethod !== 'all') {
        params.payment_method = paymentMethod
      }

      const response = await reportService.getExpenseReport(params)

      if (response.success && response.data) {
        // response.data already contains { summary: {...}, expenses: [...] }
        const reportData = response.data
        setReportData(reportData)
        setSummary(reportData.summary || null)
        // Filter out any null/undefined expenses and ensure we have an array
        const expensesArray = reportData.expenses || []
        const validExpenses = Array.isArray(expensesArray) 
          ? expensesArray.filter(expense => expense !== null && expense !== undefined)
          : []
        setExpenses(validExpenses)
        success('Expense report generated successfully')
      } else {
        error(response.message || 'Failed to generate report')
        setReportData(null)
        setSummary(null)
        setExpenses([])
      }
    } catch (err) {
      console.error('Error generating report:', err)
      error('Failed to generate report. Please try again.')
      setReportData(null)
      setSummary(null)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
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

      if (categoryId && categoryId !== 'all') {
        params.category_id = categoryId
      }

      if (paymentMethod && paymentMethod !== 'all') {
        params.payment_method = paymentMethod
      }

      const response = await reportService.exportExpenseReportPdf(params)
      if (response.success) {
        success('PDF exported successfully')
      } else {
        error(response.message || 'Failed to export PDF')
      }
    } catch (err) {
      console.error('Error exporting PDF:', err)
      error('Failed to export PDF')
    } finally {
      setLoading(false)
    }
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

  const getPaymentMethodLabel = (method) => {
    if (!method) return '-'
    return method.charAt(0).toUpperCase() + method.slice(1)
  }

  // Table columns
  const columns = [
    {
      key: 'expenseDate',
      label: 'Date',
      render: (value, expense) => {
        if (!expense) return <span className="text-muted">—</span>
        return formatDate(expense.expenseDate)
      },
    },
    {
      key: 'categoryName',
      label: 'Category',
      render: (value, expense) => {
        if (!expense) return <span className="text-muted">—</span>
        return expense.categoryName || '-'
      },
    },
    {
      key: 'description',
      label: 'Description',
      render: (value, expense) => {
        if (!expense) return <span className="text-muted">—</span>
        return expense.description || '-'
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value, expense) => {
        if (!expense) return <span className="text-muted">—</span>
        return <strong className="text-danger">{formatCurrency(expense.amount)}</strong>
      },
      align: 'right',
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (value, expense) => {
        if (!expense) return <span className="text-muted">—</span>
        return getPaymentMethodLabel(expense.paymentMethod)
      },
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (value, expense) => {
        if (!expense) return <span className="text-muted">—</span>
        return expense.createdBy || '-'
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
              <h2 className="mb-0">Expense Report</h2>
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
                  id="category_id"
                  label="Category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Categories' },
                    ...categories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    })),
                  ]}
                  col={3}
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
                    { value: 'bank', label: 'Bank' },
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

          {/* Summary Cards - Row 1 (Compact) */}
          {summary && (
            <Row className="mb-3 g-2">
              <Col xs={6} sm={6} md={3}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2 p-md-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-danger bg-opacity-10 rounded-circle p-2 me-2">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-danger" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Total Expenses</p>
                        <h6 className="mb-0 text-danger fw-bold">{formatCurrency(summary.totalExpenses)}</h6>
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
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-warning" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>This Month</p>
                        <h6 className="mb-0 text-warning fw-bold">{formatCurrency(summary.thisMonthExpenses)}</h6>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} sm={6} md={3}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2 p-md-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-info bg-opacity-10 rounded-circle p-2 me-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-info" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Today</p>
                        <h6 className="mb-0 text-info fw-bold">{formatCurrency(summary.todayExpenses)}</h6>
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
                        <FontAwesomeIcon icon={faChartLine} className="text-success" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Avg Daily</p>
                        <h6 className="mb-0 text-success fw-bold">{formatCurrency(summary.averageDailyExpense)}</h6>
                      </div>
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
                  <h5 className="mb-0">Expense Details</h5>
                  <span className="text-muted small">
                    Showing <strong>{expenses.length}</strong> {expenses.length === 1 ? 'record' : 'records'} 
                    {summary && ` (Total: ${summary.totalExpensesCount})`}
                  </span>
                </div>
                {expenses.length > 0 ? (
                  <Table
                    columns={columns}
                    data={expenses}
                    loading={loading}
                    pagination={false}
                    sortable={true}
                    sortableColumns={['expenseDate', 'amount', 'categoryName']}
                  />
                ) : (
                  <div className="text-center text-muted py-5">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="fs-1 mb-3 opacity-50" />
                    <p>No expenses found for the selected filters</p>
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
                  <p>Select date range and click "Generate Report" to view expense data</p>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default ExpenseReport

