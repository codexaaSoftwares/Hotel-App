import React, { useState, useEffect } from 'react'
import { Modal, Row, Col, Badge, Button, Tab, Tabs, Spinner } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faShoppingCart, 
  faWallet,
  faCalendarAlt,
  faBuilding,
  faGift,
  faCamera,
  faStar,
  faBriefcase,
  faFileInvoiceDollar,
  faCreditCard,
  faInfoCircle,
  faList,
  faHistory
} from '@fortawesome/free-solid-svg-icons'
import orderService from '../../../services/orderService'
import paymentService from '../../../services/paymentService'
import Table from '../../common/Table'

const CustomerDetailsModal = ({ 
  visible, 
  onClose, 
  customer
}) => {
  const [activeTab, setActiveTab] = useState('info')
  const [orders, setOrders] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  
  // Load orders and transactions when modal opens
  useEffect(() => {
    if (visible && customer?.id) {
      loadOrders()
      loadTransactions()
    }
  }, [visible, customer?.id])

  const loadOrders = async () => {
    if (!customer?.id) return
    try {
      setLoadingOrders(true)
      const response = await orderService.getOrders({
        customerId: customer.id,
        limit: 50,
        sortBy: 'order_date',
        sortDirection: 'desc'
      })
      if (response.success) {
        setOrders(response.data?.orders || response.data || [])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const loadTransactions = async () => {
    if (!customer?.id) return
    try {
      setLoadingTransactions(true)
      const response = await paymentService.getPayments({
        customerId: customer.id,
        limit: 50,
        sortDirection: 'desc'
      })
      if (response.success) {
        setTransactions(response.data || [])
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoadingTransactions(false)
    }
  }
  
  // Get customer name
  const customerName = customer?.name || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'N/A'

  // Generate initials for avatar
  const getInitials = (customer) => {
    if (!customer) return 'NA'
    if (customer.name) {
      const names = customer.name.split(' ')
      if (names.length >= 2) {
        return `${names[0]?.charAt(0) || ''}${names[names.length - 1]?.charAt(0) || ''}`.toUpperCase()
      }
      return customer.name.substring(0, 2).toUpperCase()
    }
    return `${customer.firstName?.charAt(0) || ''}${customer.lastName?.charAt(0) || ''}`.toUpperCase() || 'NA'
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format date time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  // Format address (handles both string and object)
  const formatAddress = (address) => {
    if (!address) return 'N/A'
    if (typeof address === 'string') return address
    if (typeof address === 'object') {
      const parts = []
      if (address.street) parts.push(address.street)
      if (address.city) parts.push(address.city)
      if (address.state) parts.push(address.state)
      if (address.postalCode) parts.push(address.postalCode)
      if (address.country) parts.push(address.country)
      return parts.length > 0 ? parts.join(', ') : 'N/A'
    }
    return 'N/A'
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'paid':
      case 'credit': return 'success'
      case 'inactive':
      case 'cancelled':
      case 'debit': return 'danger'
      case 'suspended':
      case 'pending':
      case 'processing': return 'warning'
      default: return 'secondary'
    }
  }

  // Get status text
  const getStatusText = (status) => {
    if (!status) return 'N/A'
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
  }

  // Order columns
  const orderColumns = [
    {
      key: 'order_number',
      label: 'Order #',
      render: (value, order) => (
        <div className="fw-semibold text-primary">
          {order.order_number || order.orderNumber || `#${order.id}`}
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (value, order) => formatDate(order.order_date || order.orderDate || order.created_at)
    },
    {
      key: 'package',
      label: 'Package',
      render: (value, order) => {
        const primaryItem = order.items?.[0]
        const packageName = primaryItem?.package_name || primaryItem?.packageName
        const packageType = primaryItem?.package_type || primaryItem?.package?.package_type || primaryItem?.packageType
        return (
          <div>
            <div className="fw-semibold">{packageName || 'Multiple Packages'}</div>
            {packageType && (
              <small className="text-muted">{packageType}</small>
            )}
            {order.items?.length > 1 && (
              <small className="text-muted d-block">
                +{order.items.length - 1} more
              </small>
            )}
          </div>
        )
      }
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value, order) => (
        <div className="fw-semibold text-primary">
          {formatCurrency(order.total_amount || order.totalAmount || order.amount || 0)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, order) => (
        <Badge bg={getStatusColor(order.status)}>
          {getStatusText(order.status)}
        </Badge>
      )
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (value, order) => (
        <Badge bg={getStatusColor(order.payment_status || order.paymentStatus)}>
          {getStatusText(order.payment_status || order.paymentStatus || 'pending')}
        </Badge>
      )
    }
  ]

  const resolveTransactionType = (transaction) =>
    transaction?.paymentType ||
    transaction?.payment_type ||
    transaction?.type ||
    transaction?.transaction_type ||
    ''

  const resolveTransactionOrderNumber = (transaction) =>
    transaction?.order?.orderNumber ||
    transaction?.order?.order_number ||
    transaction?.orderNumber ||
    transaction?.order_number ||
    `#${transaction?.order_id || transaction?.orderId || '-'}`.trim()

  // Transaction columns
  const transactionColumns = [
    {
      key: 'date',
      label: 'Date',
      render: (value, transaction) =>
        formatDateTime(
          transaction.payment_date ||
          transaction.paymentDate ||
          transaction.transaction_date ||
          transaction.created_at
        )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value, transaction) => (
        <Badge bg={getStatusColor(resolveTransactionType(transaction))}>
          {getStatusText(resolveTransactionType(transaction) || 'N/A')}
        </Badge>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value, transaction) => (
        <div>
          <div className="fw-semibold">
            {resolveTransactionOrderNumber(transaction)}
          </div>
          <small className="text-muted">
            Method: {transaction.paymentMethod || transaction.payment_method || 'N/A'}
          </small>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value, transaction) => {
        const type = resolveTransactionType(transaction)?.toLowerCase()
        const isCredit = type === 'credit'
        return (
          <div className={`fw-semibold ${isCredit ? 'text-success' : 'text-danger'}`}>
            {isCredit ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount || 0))}
          </div>
        )
      }
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (value, transaction) => (
        <div className="fw-semibold text-primary">
          {formatCurrency(
            transaction.order?.remaining_amount ||
            transaction.order?.remainingAmount ||
            transaction.remaining_amount ||
            transaction.balance_after ||
            transaction.balance ||
            0
          )}
        </div>
      )
    }
  ]

  if (!customer) {
    return (
      <Modal show={visible} onHide={onClose} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Customer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center py-4">
            <p className="text-muted">No customer data available</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  const totalOrders = customer.total_orders || customer.totalOrders || orders.length
  const totalAmount = customer.total_earnings || customer.total_amount || 0
  const paidAmount = customer.paid_amount || customer.wallet_balance || 0
  const remainingAmount = customer.remaining_amount || (totalAmount - paidAmount)

  return (
    <Modal show={visible} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton className="border-bottom border-primary border-2">
        <Modal.Title className="text-primary">
          <FontAwesomeIcon icon={faUser} className="me-2" />
          Customer Details
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-0">
        {/* Customer Profile Header */}
        <div className="bg-gradient-primary-subtle p-4 border-bottom">
          <div className="d-flex align-items-center">
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle me-4"
            style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#8b5cf6',
              color: 'white',
              fontSize: '24px',
                fontWeight: 'bold',
                flexShrink: 0
            }}
          >
            {getInitials(customer)}
          </div>
            <div className="flex-grow-1">
          <h4 className="mb-1">{customerName}</h4>
              {customer.job_code || customer.jobCode ? (
                <p className="mb-1">
                  <span className="fw-bold text-primary">Job Code: </span>
                  <span className="fw-semibold">{customer.job_code || customer.jobCode}</span>
                </p>
              ) : null}
              <p className="text-muted mb-2">Customer ID: {customer.photographerId || customer.customerId || customer.id || 'N/A'}</p>
              <Badge bg={getStatusColor(customer.status)} className="px-3 py-2">
                {getStatusText(customer.status)}
              </Badge>
            </div>
            <div className="text-end">
              <div className="text-muted small mb-1">Total Amount</div>
              <div className="h4 mb-0 fw-bold text-primary">{formatCurrency(totalAmount)}</div>
              <div className="text-muted small mt-1">
                <span className="text-success">Paid: {formatCurrency(paidAmount >= 0 ? paidAmount : 0)}</span>
                {' | '}
                <span className={remainingAmount > 0 ? 'text-danger' : 'text-success'}>
                  Remaining: {formatCurrency(remainingAmount >= 0 ? remainingAmount : 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="px-4 pt-3 border-bottom"
        >
          <Tab eventKey="info" title={
            <>
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              Information
            </>
          }>
            <div className="p-4">
        {/* Amount Cards */}
        <Row className="mb-4">
          <Col md={4}>
            <div className="p-3 bg-light rounded border border-primary border-2">
              <div className="text-muted small mb-1">Total Amount</div>
              <div className="h4 mb-0 fw-bold text-primary">
                {formatCurrency(totalAmount)}
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 bg-light rounded border border-success border-2">
              <div className="text-muted small mb-1">Paid Amount</div>
              <div className="h4 mb-0 fw-bold text-success">
                {formatCurrency(paidAmount >= 0 ? paidAmount : 0)}
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 bg-light rounded border border-danger border-2">
              <div className="text-muted small mb-1">Remaining Amount</div>
              <div className={`h4 mb-0 fw-bold ${remainingAmount > 0 ? 'text-danger' : 'text-success'}`}>
                {formatCurrency(remainingAmount >= 0 ? remainingAmount : 0)}
              </div>
            </div>
          </Col>
        </Row>

        {/* Customer Information */}
              <div className="mb-4">
                <h5 className="mb-3 pb-2 border-bottom border-primary border-2">
                  <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                  Personal Information
                </h5>
                <Row className="g-3">
                  {(customer.job_code || customer.jobCode) && (
                    <Col md={6}>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faBriefcase} className="me-3 text-primary" />
                        <div>
                          <div className="fw-semibold text-muted small">Job Code</div>
                          <div className="fw-bold text-primary">{customer.job_code || customer.jobCode}</div>
                        </div>
                      </div>
                    </Col>
                  )}
          <Col md={6}>
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faPhone} className="me-3 text-primary" />
              <div>
                        <div className="fw-semibold text-muted small">Mobile</div>
                        <div className="fw-semibold">{customer.mobile || customer.phone || 'N/A'}</div>
              </div>
            </div>
          </Col>
          
          <Col md={6}>
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faEnvelope} className="me-3 text-primary" />
              <div>
                        <div className="fw-semibold text-muted small">Email</div>
                        <div className="fw-semibold">{customer.email || 'N/A'}</div>
              </div>
            </div>
          </Col>

                  {customer.address && (
                    <Col md={12}>
                      <div className="d-flex align-items-start">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-3 text-primary mt-1" />
                        <div>
                          <div className="fw-semibold text-muted small">Address</div>
                          <div className="fw-semibold">{formatAddress(customer.address)}</div>
                        </div>
                      </div>
                    </Col>
                  )}

          {customer.branch_name && (
            <Col md={6}>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faBuilding} className="me-3 text-primary" />
                <div>
                          <div className="fw-semibold text-muted small">Branch</div>
                          <div className="fw-semibold">{customer.branch_name} {customer.branch_code && `(${customer.branch_code})`}</div>
                </div>
              </div>
            </Col>
          )}

          {customer.dob && (
            <Col md={6}>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-3 text-primary" />
                <div>
                          <div className="fw-semibold text-muted small">Date of Birth</div>
                          <div className="fw-semibold">{formatDate(customer.dob)}</div>
                </div>
              </div>
            </Col>
          )}

          {customer.anniversary_date && (
            <Col md={6}>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faGift} className="me-3 text-primary" />
                <div>
                          <div className="fw-semibold text-muted small">Anniversary Date</div>
                          <div className="fw-semibold">{formatDate(customer.anniversary_date)}</div>
                </div>
              </div>
            </Col>
          )}
          
          <Col md={6}>
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faShoppingCart} className="me-3 text-primary" />
              <div>
                        <div className="fw-semibold text-muted small">Total Orders</div>
                        <div className="fw-semibold">{totalOrders}</div>
              </div>
            </div>
          </Col>

          {customer.created_at && (
            <Col md={6}>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-3 text-primary" />
                <div>
                          <div className="fw-semibold text-muted small">Registered</div>
                          <div className="fw-semibold">{formatDate(customer.created_at || customer.joinedDate)}</div>
                </div>
              </div>
            </Col>
          )}
        </Row>
              </div>
            </div>
          </Tab>

          <Tab eventKey="orders" title={
            <>
              <FontAwesomeIcon icon={faList} className="me-2" />
              Orders ({orders.length})
            </>
          }>
            <div className="p-4">
              {loadingOrders ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-muted mt-3">Loading orders...</p>
                </div>
              ) : orders.length > 0 ? (
                <Table
                  data={orders}
                  columns={orderColumns}
                  loading={false}
                  hover
                  pagination={false}
                  sortable={false}
                  emptyMessage="No orders found"
                />
              ) : (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-muted mb-3" size="3x" />
                  <p className="text-muted">No orders found for this customer</p>
                </div>
              )}
            </div>
          </Tab>

          <Tab eventKey="transactions" title={
            <>
              <FontAwesomeIcon icon={faHistory} className="me-2" />
              Transactions ({transactions.length})
            </>
          }>
            <div className="p-4">
              {loadingTransactions ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-muted mt-3">Loading transactions...</p>
                </div>
              ) : transactions.length > 0 ? (
                <Table
                  data={transactions}
                  columns={transactionColumns}
                  loading={false}
                  hover
                  pagination={false}
                  sortable={false}
                  emptyMessage="No transactions found"
                />
              ) : (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faCreditCard} className="text-muted mb-3" size="3x" />
                  <p className="text-muted">No transactions found for this customer</p>
                </div>
              )}
        </div>
          </Tab>
        </Tabs>
      </Modal.Body>
      
      <Modal.Footer className="border-top">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CustomerDetailsModal
