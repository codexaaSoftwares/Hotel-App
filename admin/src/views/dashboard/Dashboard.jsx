import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, Spinner, Table, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCartShopping, 
  faUsers, 
  faArrowTrendUp, 
  faArrowTrendDown, 
  faRefresh, 
  faCalendarAlt,
  faShoppingCart,
  faBell,
  faCheck,
  faUser,
  faChartLine,
  faGift,
  faClock,
  faFileInvoiceDollar,
  faExternalLinkAlt,
  faCake,
  faHeart
} from '@fortawesome/free-solid-svg-icons'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import dashboardService from '../../services/dashboardService'
import { formatCurrency, formatDate } from '../../utils'
import { useToast } from '../../components'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { error: showError } = useToast()
  const navigate = useNavigate()

  // Existing states
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  // New states for summary cards
  const [ordersSummary, setOrdersSummary] = useState(null)
  const [ordersSummaryLoading, setOrdersSummaryLoading] = useState(true)

  // New states for lists
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [upcomingEventsLoading, setUpcomingEventsLoading] = useState(true)
  const [upcomingOrders, setUpcomingOrders] = useState([])
  const [upcomingOrdersLoading, setUpcomingOrdersLoading] = useState(true)
  const [lastTransactions, setLastTransactions] = useState([])
  const [lastTransactionsLoading, setLastTransactionsLoading] = useState(true)
  const [companyHealthChart, setCompanyHealthChart] = useState(null)
  const [companyHealthChartLoading, setCompanyHealthChartLoading] = useState(true)

  // Set default 3-month range
  useEffect(() => {
    const today = new Date()
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(today.getMonth() - 3)
    
    setDateRange({
      startDate: threeMonthsAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    })
  }, [])

  const fetchSummary = async () => {
    if (!dateRange.startDate || !dateRange.endDate) return
    setSummaryLoading(true)
    try {
      const response = await dashboardService.getSummary({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
      if (response.success) {
        setSummary(response.data)
      } else {
        showError(response.message || 'Failed to load dashboard summary')
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      showError('Failed to load dashboard summary')
    } finally {
      setSummaryLoading(false)
    }
  }


  const fetchOrdersSummary = async () => {
    if (!dateRange.startDate || !dateRange.endDate) return
    setOrdersSummaryLoading(true)
    try {
      const response = await dashboardService.getOrdersSummary({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
      if (response.success) {
        setOrdersSummary(response.data)
      }
    } catch (error) {
      console.error('Error fetching orders summary:', error)
    } finally {
      setOrdersSummaryLoading(false)
    }
  }



  const fetchLastTransactions = async () => {
    setLastTransactionsLoading(true)
    try {
      const response = await dashboardService.getLastTransactions({ limit: 10 })
      if (response.success) {
        setLastTransactions(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching last transactions:', error)
    } finally {
      setLastTransactionsLoading(false)
    }
  }

  const fetchUpcomingEvents = async () => {
    setUpcomingEventsLoading(true)
    try {
      const response = await dashboardService.getUpcomingEvents({ days: 30 })
      if (response.success) {
        setUpcomingEvents(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
    } finally {
      setUpcomingEventsLoading(false)
    }
  }

  const fetchUpcomingOrders = async () => {
    setUpcomingOrdersLoading(true)
    try {
      const response = await dashboardService.getUpcomingOrders({ limit: 10 })
      if (response.success) {
        setUpcomingOrders(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching upcoming orders:', error)
    } finally {
      setUpcomingOrdersLoading(false)
    }
  }

  const fetchCompanyHealthChart = async () => {
    setCompanyHealthChartLoading(true)
    try {
      const response = await dashboardService.getCompanyHealthChart({ months: 12 })
      if (response.success) {
        setCompanyHealthChart(response.data)
      }
    } catch (error) {
      console.error('Error fetching company health chart:', error)
    } finally {
      setCompanyHealthChartLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchSummary()
      fetchOrdersSummary()
    }
    fetchUpcomingEvents()
    fetchUpcomingOrders()
    fetchLastTransactions()
    fetchCompanyHealthChart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true)
    Promise.all([
      fetchSummary(),
      fetchOrdersSummary(),
      fetchUpcomingEvents(),
      fetchUpcomingOrders(),
      fetchLastTransactions(),
      fetchCompanyHealthChart()
    ]).finally(() => setIsRefreshing(false))
  }

  // Handle date range change
  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const totals = summary?.overallTotals || summary?.totals || { revenue: 0, orders: 0, customers: 0 }
  const changes = summary?.changes || {
    revenue: { direction: 'up', value: 0 },
    orders: { direction: 'up', value: 0 },
    customers: { direction: 'up', value: 0 },
  }

  const statsData = [
    {
      title: 'Total Orders',
      value: (totals.orders || 0).toLocaleString(),
      change: `${changes.orders.value}%`,
      changeType: changes.orders.direction === 'up' ? 'positive' : 'negative',
      icon: faCartShopping,
      color: 'info',
      gradient: 'bg-gradient-info'
    },
    {
      title: 'Total Customers',
      value: (totals.customers || 0).toLocaleString(),
      change: `${changes.customers.value}%`,
      changeType: changes.customers.direction === 'up' ? 'positive' : 'negative',
      icon: faUsers,
      color: 'primary',
      gradient: 'bg-gradient-primary'
    }
  ]

  const getEventBadgeColor = (daysUntil) => {
    if (daysUntil < 7) return 'danger'
    if (daysUntil < 14) return 'warning'
    return 'success'
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'Pending' },
      processing: { variant: 'info', label: 'Processing' },
      completed: { variant: 'success', label: 'Completed' },
      cancelled: { variant: 'danger', label: 'Cancelled' }
    }
    const config = statusConfig[status] || { variant: 'secondary', label: status }
    return <Badge bg={config.variant}>{config.label}</Badge>
  }

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 0) return `In ${diffDays} days`
    return `${Math.abs(diffDays)} days ago`
  }

  // Company Health Chart Data
  const chartData = companyHealthChart?.points || []
  const chartLabels = chartData.map(p => p.monthLabel)
  const ordersRevenueData = chartData.map(p => p.ordersRevenue)
  const incomeData = chartData.map(p => p.income)
  const expensesData = chartData.map(p => p.expenses)
  const profitData = chartData.map(p => p.companyProfit)

  return (
    <div className="dashboard-page">
      <Container fluid>
        {/* Page Header */}
        <div className="dashboard-header d-flex align-items-center mb-4 pb-3 border-bottom">
          <div>
            <p className="mb-1 text-muted text-uppercase small fw-semibold">Overview</p>
            <h2 className="mb-0 text-dark fw-bold">Dashboard</h2>
          </div>
          <div className="ms-auto d-flex align-items-center gap-3">
            {/* Date Range Picker */}
            <div className="d-flex align-items-center gap-2 dashboard-date-picker">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-theme" />
              <Form.Control
                type="date"
                size="sm"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="border-success"
                style={{ width: '140px' }}
              />
              <span className="text-muted">to</span>
              <Form.Control
                type="date"
                size="sm"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="border-success"
                style={{ width: '140px' }}
              />
            </div>
            
            {/* Refresh Button */}
            <Button 
              variant="outline-success" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <FontAwesomeIcon 
                icon={faRefresh} 
                className={`me-2 ${isRefreshing ? 'fa-spin' : ''}`} 
              />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Main KPI Stats Cards */}
        <Row className="mb-4 g-4">
          {statsData.map((item, index) => (
            <Col md={6} key={`stat-card-${index}`}>
              <Card className="dashboard-stat-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-muted small fw-semibold text-uppercase tracking-tight">{item.title}</div>
                        <div className="h3 mb-0 fw-bold text-dark">
                          {summaryLoading ? <Spinner animation="border" size="sm" /> : item.value}
                        </div>
                      </div>
                      <div className={`stat-icon ${item.gradient}`}>
                        <FontAwesomeIcon icon={item.icon} size="lg" />
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-muted small">Vs previous period</span>
                      <div className={`change-badge ${item.changeType}`}>
                        <FontAwesomeIcon 
                          icon={item.changeType === 'positive' ? faArrowTrendUp : faArrowTrendDown} 
                          className="me-1" 
                        />
                        {summaryLoading ? '--' : item.change}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Orders Summary Cards */}
        <Row className="mb-4 g-3">
          <Col md={3}>
            <Card className="bg-gradient-primary text-white border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h4 className="mb-0">
                      {ordersSummaryLoading ? <Spinner animation="border" size="sm" variant="light" /> : (ordersSummary?.totalOrders || 0)}
                    </h4>
                    <p className="mb-0 opacity-75">Total Orders</p>
                  </div>
                  <FontAwesomeIcon icon={faShoppingCart} className="fs-1 opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="bg-gradient-warning text-white border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h4 className="mb-0">
                      {ordersSummaryLoading ? <Spinner animation="border" size="sm" variant="light" /> : (ordersSummary?.pendingOrders || 0)}
                    </h4>
                    <p className="mb-0 opacity-75">Pending Orders</p>
                  </div>
                  <FontAwesomeIcon icon={faBell} className="fs-1 opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="bg-gradient-info text-white border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h4 className="mb-0">
                      {ordersSummaryLoading ? <Spinner animation="border" size="sm" variant="light" /> : (ordersSummary?.processingOrders || 0)}
                    </h4>
                    <p className="mb-0 opacity-75">Processing</p>
                  </div>
                  <FontAwesomeIcon icon={faCheck} className="fs-1 opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="bg-gradient-success text-white border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h4 className="mb-0">
                      {ordersSummaryLoading ? <Spinner animation="border" size="sm" variant="light" /> : (ordersSummary?.completedOrders || 0)}
                    </h4>
                    <p className="mb-0 opacity-75">Completed</p>
                  </div>
                  <FontAwesomeIcon icon={faCheck} className="fs-1 opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Upcoming Orders & Upcoming Events */}
        <Row className="mb-4 g-4">
          <Col md={6}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faClock} className="me-2 text-info" />
                    <h5 className="mb-0">Upcoming Orders</h5>
                  </div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 text-info text-decoration-none"
                    onClick={() => navigate('/orders')}
                  >
                    View More <FontAwesomeIcon icon={faExternalLinkAlt} className="ms-1" size="xs" />
                  </Button>
                </div>
                {upcomingOrdersLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="info" />
                  </div>
                ) : upcomingOrders.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover size="sm">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Customer</th>
                          <th>Event Date</th>
                          <th>Status</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingOrders.map((order) => (
                          <tr 
                            key={order.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/orders?orderId=${order.id}`)}
                          >
                            <td>
                              <div className="fw-semibold">{order.orderNumber}</div>
                            </td>
                            <td>
                              <div>
                                <div>{order.customerName || 'N/A'}</div>
                                <small className="text-muted">{order.customerCode || ''}</small>
                              </div>
                            </td>
                            <td>{formatDate(order.orderDate)}</td>
                            <td>{getStatusBadge(order.status)}</td>
                            <td className="text-end fw-semibold">
                              {formatCurrency(order.totalAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">No upcoming orders</div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm h-100 border-warning">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                      <FontAwesomeIcon icon={faGift} className="text-warning" size="lg" />
                    </div>
                    <div>
                      <h5 className="mb-0 text-dark">Upcoming Customer Events</h5>
                      <small className="text-muted">Gift preparation reminders</small>
                    </div>
                  </div>
                </div>
                {upcomingEventsLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="warning" />
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {upcomingEvents.slice(0, 5).map((event, idx) => (
                      <div
                        key={idx}
                        className="d-flex align-items-center p-3 rounded border border-warning border-opacity-20"
                      >
                        <div className="me-3">
                          {event.eventType === 'birthday' ? (
                            <div className="bg-info bg-opacity-10 rounded-circle p-2">
                              <FontAwesomeIcon icon={faCake} className="text-info" />
                            </div>
                          ) : (
                            <div className="bg-danger bg-opacity-10 rounded-circle p-2">
                              <FontAwesomeIcon icon={faHeart} className="text-danger" size="lg" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold text-dark mb-1">{event.customerName || 'N/A'}</div>
                          <div className="d-flex align-items-center gap-2">
                            <Badge bg={event.eventType === 'birthday' ? 'info' : 'danger'} className="me-2">
                              {event.eventType === 'birthday' ? 'Birthday' : 'Anniversary'}
                            </Badge>
                            <small className="text-muted">{formatDate(event.eventDate)}</small>
                          </div>
                        </div>
                        <div className="text-end">
                          <Badge bg={getEventBadgeColor(event.daysUntil)} className="fs-6 px-3 py-2">
                            {formatRelativeDate(event.eventDate)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">
                    <FontAwesomeIcon icon={faGift} className="text-muted mb-2" size="2x" />
                    <div>No upcoming events</div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Last Transactions & Company Health Chart */}
        <Row className="mb-4 g-4">
          <Col md={6}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2 text-primary" />
                    <h5 className="mb-0">Last Transactions</h5>
                  </div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 text-primary text-decoration-none"
                    onClick={() => navigate('/transactions')}
                  >
                    View More <FontAwesomeIcon icon={faExternalLinkAlt} className="ms-1" size="xs" />
                  </Button>
                </div>
                {lastTransactionsLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : lastTransactions.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover size="sm">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Reference</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lastTransactions.map((transaction, idx) => (
                          <tr 
                            key={`${transaction.type}-${transaction.id || idx}`}
                            style={{ cursor: transaction.type === 'payment' && transaction.customerId ? 'pointer' : 'default' }}
                            onClick={() => {
                              if (transaction.type === 'payment' && transaction.customerId) {
                                navigate(`/customers?customerId=${transaction.customerId}`)
                              }
                            }}
                          >
                            <td>
                              <Badge bg={transaction.type === 'payment' ? 'primary' : 'info'}>
                                {transaction.type === 'payment' ? 'Payment' : 'Financial'}
                              </Badge>
                            </td>
                            <td>
                              <div className="fw-semibold">{transaction.reference}</div>
                              {transaction.orderNumber && (
                                <small className="text-muted">Order: {transaction.orderNumber}</small>
                              )}
                              {transaction.category && (
                                <small className="text-muted d-block">{transaction.category}</small>
                              )}
                            </td>
                            <td>
                              {transaction.customerName ? (
                                <div>
                                  <div>{transaction.customerName}</div>
                                  {transaction.customerCode && (
                                    <small className="text-muted">{transaction.customerCode}</small>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>{formatDate(transaction.transactionDate)}</td>
                            <td className="text-end">
                              <span className={`fw-semibold ${
                                transaction.paymentType === 'credit' || transaction.paymentType === 'income' 
                                  ? 'text-success' 
                                  : 'text-danger'
                              }`}>
                                {transaction.paymentType === 'credit' || transaction.paymentType === 'income' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">No transactions found</div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                  <FontAwesomeIcon icon={faChartLine} className="me-2 text-success" />
                  <h5 className="mb-0">Company Health Chart</h5>
                </div>
                {companyHealthChartLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="success" />
                  </div>
                ) : chartData.length > 0 ? (
                  <CChartLine
                    style={{ height: '300px', marginTop: '20px' }}
                    data={{
                      labels: chartLabels,
                      datasets: [
                        {
                          label: 'Orders Revenue',
                          backgroundColor: `rgba(${getStyle('--cui-primary-rgb')}, .1)`,
                          borderColor: getStyle('--cui-primary'),
                          pointHoverBackgroundColor: getStyle('--cui-primary'),
                          borderWidth: 2,
                          data: ordersRevenueData,
                          fill: false,
                          tension: 0.4,
                        },
                        {
                          label: 'Income',
                          backgroundColor: `rgba(${getStyle('--cui-success-rgb')}, .1)`,
                          borderColor: getStyle('--cui-success'),
                          pointHoverBackgroundColor: getStyle('--cui-success'),
                          borderWidth: 2,
                          data: incomeData,
                          fill: false,
                          tension: 0.4,
                        },
                        {
                          label: 'Expenses',
                          backgroundColor: `rgba(${getStyle('--cui-danger-rgb')}, .1)`,
                          borderColor: getStyle('--cui-danger'),
                          pointHoverBackgroundColor: getStyle('--cui-danger'),
                          borderWidth: 2,
                          data: expensesData,
                          fill: false,
                          tension: 0.4,
                        },
                        {
                          label: 'Company Profit',
                          backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
                          borderColor: getStyle('--cui-info'),
                          pointHoverBackgroundColor: getStyle('--cui-info'),
                          borderWidth: 2,
                          data: profitData,
                          fill: false,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 15,
                            color: getStyle('--cui-body-color'),
                          },
                        },
                        tooltip: {
                          mode: 'index',
                          intersect: false,
                          backgroundColor: getStyle('--cui-body-bg'),
                          titleColor: getStyle('--cui-body-color'),
                          bodyColor: getStyle('--cui-body-color'),
                          borderColor: getStyle('--cui-border-color'),
                          borderWidth: 1,
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            color: getStyle('--cui-border-color-translucent'),
                            drawOnChartArea: false,
                          },
                          ticks: {
                            color: getStyle('--cui-body-color'),
                            maxTicksLimit: 8,
                          },
                        },
                        y: {
                          beginAtZero: true,
                          border: {
                            color: getStyle('--cui-border-color-translucent'),
                          },
                          grid: {
                            color: getStyle('--cui-border-color-translucent'),
                          },
                          ticks: {
                            color: getStyle('--cui-body-color'),
                            maxTicksLimit: 6,
                            callback(value) {
                              return formatCurrency(value)
                            },
                          },
                        },
                      },
                      elements: {
                        line: {
                          tension: 0.4,
                        },
                        point: {
                          radius: 3,
                          hitRadius: 10,
                          hoverRadius: 6,
                          hoverBorderWidth: 2,
                        },
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index',
                      },
                    }}
                  />
                ) : (
                  <div className="text-center text-muted py-4">No chart data available</div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Dashboard
