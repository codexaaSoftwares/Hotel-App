import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBarChart,
  faFilePdf,
  faFileCsv,
  faRupeeSign,
  faShoppingCart,
  faReceipt,
  faChartLine,
  faTrophy,
  faTag,
} from '@fortawesome/free-solid-svg-icons'
import { SelectField, TextField, FormRow } from '../../components/common/FormFields'
import { Table } from '../../components'
import reportService from '../../services/reportService'
import menuService from '../../services/menuService'
import { useToast } from '../../components'

const CategoryWiseItemReport = () => {
  const { success, error } = useToast()

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [itemStatus, setItemStatus] = useState('all')

  // Data
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [summary, setSummary] = useState(null)
  const [items, setItems] = useState([])

  // Filter dropdowns data
  const [foodCategories, setFoodCategories] = useState([])

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
        const response = await menuService.getCategories()
        if (response.success) {
          setFoodCategories(response.data || [])
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

      if (categoryId && categoryId !== 'all' && categoryId !== '') {
        params.category_id = categoryId
      }

      if (itemStatus && itemStatus !== 'all' && itemStatus !== '') {
        params.item_status = itemStatus
      }

      const response = await reportService.getCategoryWiseItemReport(params)

      if (response.success && response.data) {
        const reportData = response.data
        setReportData(reportData)
        setSummary(reportData.summary || null)
        const itemsArray = reportData.items || []
        const validItems = Array.isArray(itemsArray) 
          ? itemsArray.filter(item => item !== null && item !== undefined)
          : []
        setItems(validItems)
        success('Category-wise item report generated successfully')
      } else {
        error(response.message || 'Failed to generate report')
        setReportData(null)
        setSummary(null)
        setItems([])
      }
    } catch (err) {
      console.error('Error generating report:', err)
      error('Failed to generate report. Please try again.')
      setReportData(null)
      setSummary(null)
      setItems([])
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

      if (categoryId && categoryId !== 'all' && categoryId !== '') {
        params.category_id = categoryId
      }

      if (itemStatus && itemStatus !== 'all' && itemStatus !== '') {
        params.item_status = itemStatus
      }

      const response = await reportService.exportCategoryWiseItemReportPdf(params)
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

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0)
  }

  // Generate consistent color for category badge
  const getCategoryBadgeColor = (categoryName) => {
    const colors = [
      'primary', 'success', 'info', 'warning', 'danger',
      'secondary', 'dark', 'light'
    ]
    // Use category name to generate consistent color
    const hash = categoryName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  // Table columns
  const columns = [
    {
      key: 'categoryName',
      label: 'Category',
      render: (value, item) => {
        if (!item) return <span className="text-muted">—</span>
        return (
          <Badge bg={getCategoryBadgeColor(item.categoryName)}>
            {item.categoryName}
          </Badge>
        )
      },
    },
    {
      key: 'itemName',
      label: 'Item Name',
      render: (value, item) => {
        if (!item) return <span className="text-muted">—</span>
        return <span className="fw-semibold">{item.itemName}</span>
      },
    },
    {
      key: 'itemPrice',
      label: 'Price',
      render: (value, item) => {
        if (!item) return <span className="text-muted">—</span>
        return formatCurrency(item.itemPrice)
      },
      align: 'right',
    },
    {
      key: 'quantitySold',
      label: 'Quantity Sold',
      render: (value, item) => {
        if (!item) return <span className="text-muted">—</span>
        return <Badge bg="success">{formatNumber(item.quantitySold)}</Badge>
      },
      align: 'right',
    },
    {
      key: 'revenue',
      label: 'Revenue',
      render: (value, item) => {
        if (!item) return <span className="text-muted">—</span>
        return <strong className="text-theme">{formatCurrency(item.revenue)}</strong>
      },
      align: 'right',
    },
    {
      key: 'billsCount',
      label: 'Bills Count',
      render: (value, item) => {
        if (!item) return <span className="text-muted">—</span>
        return formatNumber(item.billsCount)
      },
      align: 'right',
    },
    {
      key: 'avgPrice',
      label: 'Avg Price',
      render: (value, item) => {
        if (!item) return <span className="text-muted">—</span>
        return formatCurrency(item.avgPrice)
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
              <h2 className="mb-0">Category-wise Item Sales Report</h2>
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
                    ...foodCategories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    })),
                  ]}
                  col={3}
                />
                <SelectField
                  id="item_status"
                  label="Item Status"
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value)}
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
            <>
              <Row className="mb-3 g-2">
                <Col xs={6} sm={6} md={3}>
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Body className="p-2 p-md-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                          <FontAwesomeIcon icon={faShoppingCart} className="text-success" style={{ fontSize: '1rem' }} />
                        </div>
                        <div className="flex-grow-1">
                          <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Total Items Sold</p>
                          <h6 className="mb-0 text-success fw-bold">{formatNumber(summary.totalItemsSold)}</h6>
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
                          <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Total Revenue</p>
                          <h6 className="mb-0 text-theme fw-bold">{formatCurrency(summary.totalRevenue)}</h6>
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
                          <FontAwesomeIcon icon={faReceipt} className="text-info" style={{ fontSize: '1rem' }} />
                        </div>
                        <div className="flex-grow-1">
                          <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Total Bills</p>
                          <h6 className="mb-0 text-info fw-bold">{formatNumber(summary.totalBillsCount)}</h6>
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
                          <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Avg Items/Bill</p>
                          <h6 className="mb-0 text-warning fw-bold">{formatNumber(summary.averageItemsPerBill?.toFixed(2))}</h6>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Top Category and Top Item Cards */}
              {(summary.topCategory || summary.topItem) && (
                <Row className="mb-3 g-2">
                  {summary.topCategory && (
                    <Col xs={12} sm={6} md={6}>
                      <Card className="shadow-sm border-0">
                        <Card.Body className="p-2 p-md-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                              <FontAwesomeIcon icon={faTrophy} className="text-success" style={{ fontSize: '1rem' }} />
                            </div>
                            <div className="flex-grow-1">
                              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Top Category</p>
                              <h6 className="mb-0 text-success fw-bold">{summary.topCategory.categoryName}</h6>
                              <small className="text-muted">
                                {formatCurrency(summary.topCategory.revenue)} • {formatNumber(summary.topCategory.itemsSold)} items
                              </small>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}
                  {summary.topItem && (
                    <Col xs={12} sm={6} md={6}>
                      <Card className="shadow-sm border-0">
                        <Card.Body className="p-2 p-md-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                              <FontAwesomeIcon icon={faTag} className="text-success" style={{ fontSize: '1rem' }} />
                            </div>
                            <div className="flex-grow-1">
                              <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Top Item</p>
                              <h6 className="mb-0 text-success fw-bold">{summary.topItem.itemName}</h6>
                              <small className="text-muted">
                                {formatCurrency(summary.topItem.revenue)} • {formatNumber(summary.topItem.quantitySold)} sold
                              </small>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}
                </Row>
              )}
            </>
          )}

          {/* Report Data Table */}
          {reportData && (
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Item Sales Details</h5>
                  <span className="text-muted small">
                    Showing <strong>{items.length}</strong> {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                {items.length > 0 ? (
                  <Table
                    columns={columns}
                    data={items}
                    loading={loading}
                    pagination={false}
                    sortable={true}
                    sortableColumns={['categoryName', 'itemName', 'itemPrice', 'quantitySold', 'revenue', 'billsCount', 'avgPrice']}
                  />
                ) : (
                  <div className="text-center text-muted py-5">
                    <FontAwesomeIcon icon={faShoppingCart} className="fs-1 mb-3 opacity-50" />
                    <p>No items sold for the selected filters</p>
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
                  <p>Select date range and click "Generate Report" to view category-wise item sales data</p>
                </div>
              </Card.Body>
            </Card>
          )}

        </Col>
      </Row>
    </Container>
  )
}

export default CategoryWiseItemReport

