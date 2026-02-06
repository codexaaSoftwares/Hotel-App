import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Card } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBarChart,
  faFilePdf,
  faFileCsv,
  faRupeeSign,
  faUsers,
  faMoneyBillWave,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons'
import { SelectField, FormRow } from '../../components/common/FormFields'
import { Table } from '../../components'
import reportService from '../../services/reportService'
import staffService from '../../services/staffService'
import { useToast } from '../../components'

const StaffSalaryReport = () => {
  const { success, error } = useToast()

  // Filters
  const [staffId, setStaffId] = useState('')
  const [department, setDepartment] = useState('all')
  const [month, setMonth] = useState('all')
  const [year, setYear] = useState('all')

  // Data
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [summary, setSummary] = useState(null)
  const [salaryPayments, setSalaryPayments] = useState([])

  // Filter dropdowns data
  const [staff, setStaff] = useState([])
  const [departments, setDepartments] = useState([])

  // Set default year to current year
  useEffect(() => {
    const now = new Date()
    setYear(now.getFullYear().toString())
    setMonth((now.getMonth() + 1).toString())
  }, [])

  // Fetch staff for filter
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await staffService.getStaff({ limit: 1000 })
        if (response.success) {
          const staffList = response.data || []
          setStaff(staffList)
          
          // Extract unique departments
          const uniqueDepartments = [...new Set(staffList.map(s => s.department).filter(Boolean))]
          setDepartments(uniqueDepartments)
        }
      } catch (err) {
        console.error('Error loading staff:', err)
      }
    }
    fetchStaff()
  }, [])

  // Generate month options (1-12)
  const monthOptions = [
    { value: 'all', label: 'All Months' },
    ...Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1
      const date = new Date(2000, monthNum - 1, 1)
      return {
        value: monthNum.toString(),
        label: date.toLocaleString('en-US', { month: 'long' }),
      }
    }),
  ]

  // Generate year options (current year and 5 years back)
  const currentYear = new Date().getFullYear()
  const yearOptions = [
    { value: 'all', label: 'All Years' },
    ...Array.from({ length: 6 }, (_, i) => {
      const yearValue = currentYear - i
      return {
        value: yearValue.toString(),
        label: yearValue.toString(),
      }
    }),
  ]

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      const params = {}

      if (staffId && staffId !== 'all' && staffId !== '') {
        params.staff_id = staffId
      }

      if (department && department !== 'all' && department !== '') {
        params.department = department
      }

      if (month && month !== 'all' && month !== '') {
        params.month = month
      }

      if (year && year !== 'all' && year !== '') {
        params.year = year
      }

      const response = await reportService.getStaffSalaryReport(params)

      if (response.success && response.data) {
        const reportData = response.data
        setReportData(reportData)
        setSummary(reportData.summary || null)
        const paymentsArray = reportData.salaryPayments || []
        const validPayments = Array.isArray(paymentsArray) 
          ? paymentsArray.filter(payment => payment !== null && payment !== undefined)
          : []
        setSalaryPayments(validPayments)
        success('Staff & Salary report generated successfully')
      } else {
        error(response.message || 'Failed to generate report')
        setReportData(null)
        setSummary(null)
        setSalaryPayments([])
      }
    } catch (err) {
      console.error('Error generating report:', err)
      error('Failed to generate report. Please try again.')
      setReportData(null)
      setSummary(null)
      setSalaryPayments([])
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    setLoading(true)
    try {
      const params = {}

      if (staffId && staffId !== 'all' && staffId !== '') {
        params.staff_id = staffId
      }

      if (department && department !== 'all' && department !== '') {
        params.department = department
      }

      if (month && month !== 'all' && month !== '') {
        params.month = month
      }

      if (year && year !== 'all' && year !== '') {
        params.year = year
      }

      const response = await reportService.exportStaffSalaryReportPdf(params)
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

  const getMonthName = (monthNum) => {
    if (!monthNum) return '-'
    const date = new Date(2000, parseInt(monthNum) - 1, 1)
    return date.toLocaleString('en-US', { month: 'long' })
  }

  // Table columns
  const columns = [
    {
      key: 'paymentDate',
      label: 'Payment Date',
      render: (value, payment) => {
        if (!payment) return <span className="text-muted">—</span>
        return formatDate(payment.paymentDate)
      },
    },
    {
      key: 'staffCode',
      label: 'Staff Code',
      render: (value, payment) => {
        if (!payment || !payment.staff) return <span className="text-muted">—</span>
        return <span className="fw-semibold text-primary">{payment.staff.staffCode || `STF${payment.staffId}`}</span>
      },
    },
    {
      key: 'staffName',
      label: 'Staff Name',
      render: (value, payment) => {
        if (!payment || !payment.staff) return <span className="text-muted">—</span>
        return payment.staff.name || '-'
      },
    },
    {
      key: 'department',
      label: 'Department',
      render: (value, payment) => {
        if (!payment || !payment.staff) return <span className="text-muted">—</span>
        return payment.staff.department || '-'
      },
    },
    {
      key: 'monthYear',
      label: 'Month & Year',
      render: (value, payment) => {
        if (!payment) return <span className="text-muted">—</span>
        const monthName = getMonthName(payment.month)
        return `${monthName} ${payment.year || '-'}`
      },
    },
    {
      key: 'paidAmount',
      label: 'Paid Amount',
      render: (value, payment) => {
        if (!payment) return <span className="text-muted">—</span>
        return <strong className="text-theme">{formatCurrency(payment.paidAmount)}</strong>
      },
      align: 'right',
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (value, payment) => {
        if (!payment) return <span className="text-muted">—</span>
        return getPaymentMethodLabel(payment.paymentMethod)
      },
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (value, payment) => {
        if (!payment) return <span className="text-muted">—</span>
        return payment.notes || '-'
      },
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (value, payment) => {
        if (!payment) return <span className="text-muted">—</span>
        return payment.createdBy || '-'
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
              <h2 className="mb-0">Staff & Salary Report</h2>
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
                <SelectField
                  id="month"
                  label="Month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  options={monthOptions}
                  col={3}
                />
                <SelectField
                  id="year"
                  label="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  options={yearOptions}
                  col={3}
                />
                <SelectField
                  id="staff_id"
                  label="Staff (Optional)"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  options={[
                    { value: '', label: 'All Staff' },
                    ...staff.map((s) => ({
                      value: s.id,
                      label: `${s.staffCode || `STF${s.id}`} - ${s.name}`,
                    })),
                  ]}
                  col={3}
                />
                <SelectField
                  id="department"
                  label="Department (Optional)"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Departments' },
                    ...departments.map((dept) => ({
                      value: dept,
                      label: dept,
                    })),
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
            <Row className="mb-3 g-2">
              <Col xs={6} sm={6} md={3}>
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body className="p-2 p-md-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-theme bg-opacity-10 rounded-circle p-2 me-2">
                        <FontAwesomeIcon icon={faRupeeSign} className="text-theme" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Total Salary Paid</p>
                        <h6 className="mb-0 text-theme fw-bold">{formatCurrency(summary.totalSalaryPaid)}</h6>
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
                        <FontAwesomeIcon icon={faUsers} className="text-success" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Total Staff</p>
                        <h6 className="mb-0 text-success fw-bold">{summary.totalStaffCount}</h6>
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
                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-info" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Total Payments</p>
                        <h6 className="mb-0 text-info fw-bold">{summary.totalPaymentsCount}</h6>
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
                        <FontAwesomeIcon icon={faChartLine} className="text-warning" style={{ fontSize: '1rem' }} />
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Avg per Staff</p>
                        <h6 className="mb-0 text-warning fw-bold">{formatCurrency(summary.averageSalaryPerStaff)}</h6>
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
                  <h5 className="mb-0">Salary Payment Details</h5>
                  <span className="text-muted small">
                    Showing <strong>{salaryPayments.length}</strong> {salaryPayments.length === 1 ? 'record' : 'records'} 
                    {summary && ` (Total: ${summary.totalPaymentsCount})`}
                  </span>
                </div>
                {salaryPayments.length > 0 ? (
                  <Table
                    columns={columns}
                    data={salaryPayments}
                    loading={loading}
                    pagination={false}
                    sortable={true}
                    sortableColumns={['paymentDate', 'paidAmount', 'month', 'year']}
                  />
                ) : (
                  <div className="text-center text-muted py-5">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="fs-1 mb-3 opacity-50" />
                    <p>No salary payments found for the selected filters</p>
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
                  <p>Select date range and click "Generate Report" to view staff salary data</p>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default StaffSalaryReport

