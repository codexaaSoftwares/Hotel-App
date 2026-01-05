import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Card, Button, Form, Alert, Badge, FormControl, FormSelect } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faShoppingCart, 
  faBell, 
  faDownload, 
  faSearch, 
  faRefresh,
  faEye,
  faCheck,
  faEdit,
  faPlus,
  faSave,
  faFilter,
  faRupeeSign,
  faCreditCard,
  faFilePdf,
  faTrash
} from '@fortawesome/free-solid-svg-icons'
import orderService from '../../services/orderService'
import paymentService from '../../services/paymentService'
import { Table, FormModal, Modal, useToast } from '../../components'
import OrderForm from '../../components/pages/orders/OrderForm'
import OrderDetailsModal from '../../components/pages/orders/OrderDetailsModal'
import PaymentForm from '../../components/pages/payments/PaymentForm'
import { formatCurrency, formatDate } from '../../utils'
import { usePermissions } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const ORDER_STATUS_OPTIONS = ['pending', 'processing', 'completed', 'cancelled']

const OrdersList = () => {
  const { success, error: showError } = useToast()
  const { hasPermission } = usePermissions()
  
  // Permission checks
  const canCreateOrder = hasPermission
    ? hasPermission(PERMISSIONS.ORDER_WRITE) || hasPermission(PERMISSIONS.ORDER_MANAGE)
    : false
  const canEditOrder = hasPermission
    ? hasPermission(PERMISSIONS.ORDER_WRITE) || hasPermission(PERMISSIONS.ORDER_MANAGE)
    : false
  const canDeleteOrder = hasPermission
    ? hasPermission(PERMISSIONS.ORDER_DELETE) || hasPermission(PERMISSIONS.ORDER_MANAGE)
    : false
  const canCreatePayment = hasPermission
    ? hasPermission(PERMISSIONS.PAYMENT_WRITE) || hasPermission(PERMISSIONS.PAYMENT_MANAGE)
    : false
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  // Add/Edit Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [orderToEdit, setOrderToEdit] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentOrder, setPaymentOrder] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusModalOrder, setStatusModalOrder] = useState(null)
  const [statusModalValue, setStatusModalValue] = useState('pending')
  const [statusModalLoading, setStatusModalLoading] = useState(false)
  
  // Refs for form components
  const addFormRef = useRef()
  const editFormRef = useRef()
  const paymentFormRef = useRef()
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    customer: '',
    status: 'all',
    dateRange: 'all',
    paymentStatus: 'all'
  })

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  })

  useEffect(() => {
    fetchOrders()
  }, [pagination.currentPage, pagination.pageSize, filters])

  useEffect(() => {
    fetchStats()
  }, [filters.dateRange])

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
      }
      
      if (filters.search) params.search = filters.search
      if (filters.status && filters.status !== 'all') params.status = filters.status
      if (filters.paymentStatus && filters.paymentStatus !== 'all') params.paymentStatus = filters.paymentStatus
      if (filters.customer) params.customerId = filters.customer
      const { startDate, endDate } = getDateRangeParams()
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      
      const response = await orderService.getOrders(params)

      const ordersPayload = response?.data?.orders ?? response?.data
      if (!response?.success || !Array.isArray(ordersPayload)) {
        const message = response?.message || 'Failed to load orders'
        setError(message)
        error(message)
        setOrders([])
        setPagination(prev => ({
          ...prev,
          totalItems: 0
        }))
        return
      }

      const ordersData = response.data?.orders || response.data
      setOrders(ordersData)
      setPagination(prev => ({
        ...prev,
        totalItems: response.meta?.total || response.data?.total || ordersData.length
      }))
    } catch (err) {
      console.error('Error fetching orders:', err)
      const message = err?.message || 'Failed to load orders'
      setError(message)
      error(message)
      setOrders([])
      setPagination(prev => ({
        ...prev,
        totalItems: 0
      }))
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { startDate, endDate } = getDateRangeParams()
      const params = {}
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const response = await orderService.getOrderStats(params)
      if (response?.success) {
        setStats(response.data || {})
      }
    } catch (err) {
      console.error('Error fetching order stats:', err)
    }
  }

  const formatDateForQuery = (date) => date.toISOString().split('T')[0]

  const getDateRangeParams = () => {
    const today = new Date()
    let startDate = null
    let endDate = null

    switch (filters.dateRange) {
      case 'today': {
        const formatted = formatDateForQuery(today)
        startDate = formatted
        endDate = formatted
        break
      }
      case 'week': {
        const start = new Date(today)
        start.setDate(start.getDate() - 6)
        startDate = formatDateForQuery(start)
        endDate = formatDateForQuery(today)
        break
      }
      case 'month': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1)
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        startDate = formatDateForQuery(start)
        endDate = formatDateForQuery(end)
        break
      }
      case 'quarter': {
        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3
        const start = new Date(today.getFullYear(), quarterStartMonth, 1)
        const end = new Date(today.getFullYear(), quarterStartMonth + 3, 0)
        startDate = formatDateForQuery(start)
        endDate = formatDateForQuery(end)
        break
      }
      default:
        startDate = null
        endDate = null
    }

    return { startDate, endDate }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }))
  }

  const handleSearch = () => {
    fetchOrders()
  }

  const handleReset = () => {
    setFilters({
      search: '',
      customer: '',
      status: 'all',
      dateRange: 'all',
      paymentStatus: 'all'
    })
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }))
  }

  const handlePageSizeChange = (size) => {
    setPagination(prev => ({
      ...prev,
      pageSize: size,
      currentPage: 1,
    }))
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
  }

  const handleOrderUpdate = () => {
    fetchOrders()
    fetchStats()
  }

  const handleQuickAction = async (orderId, action) => {
    try {
      switch (action) {
        case 'process':
          await orderService.updateOrderStatus(orderId, 'processing')
          success('Order status updated to processing')
          break
        case 'complete':
          await orderService.updateOrderStatus(orderId, 'completed')
          success('Order status updated to completed')
          break
        default:
          break
      }
      handleOrderUpdate()
    } catch (err) {
      console.error('Error performing quick action:', err)
      showError('Failed to update order status')
    }
  }

  const getOrderIdentifier = (order) => {
    if (!order) return null
    const candidates = [
      order.id,
      order.order_id,
      order.orderId,
      order.order_number,
      order.orderNumber,
      order.order_code,
      order.orderCode,
      order.reference,
      order.reference_code,
      order.referenceCode
    ]
    const rawId = candidates.find(Boolean)
    if (!rawId) return null
    return rawId.toString().replace(/^#/, '').trim()
  }

  const getOrderDisplayNumber = (order) => {
    if (!order) return ''
    return (
      order.order_number ||
      order.orderNumber ||
      order.id ||
      getOrderIdentifier(order) ||
      ''
    )
  }

  const getOrderFinancials = (order) => {
    if (!order) {
      return { total: 0, paid: 0, balance: 0 }
    }
    const total = Number(order.totalAmount ?? order.total_amount ?? order.total ?? 0)
    const paid = Number(order.paidAmount ?? order.paid_amount ?? order.paid ?? 0)
    const balanceSource = order.remainingAmount ?? order.remaining_amount ?? order.balance_amount
    const fallbackBalance = Math.max(0, total - paid)
    const balance = Math.max(0, Number(balanceSource ?? fallbackBalance))
    return { total, paid, balance }
  }

  const handleOpenPaymentModal = (order) => {
    setPaymentOrder(order)
    setShowPaymentModal(true)
  }

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false)
    setPaymentOrder(null)
    setPaymentLoading(false)
  }

  const handleDeleteOrder = (order) => {
    setOrderToDelete(order)
    setShowDeleteModal(true)
  }

  const handleOpenStatusModal = (order) => {
    if (!order) return
    setStatusModalOrder(order)
    setStatusModalValue(order.status || 'pending')
    setShowStatusModal(true)
  }

  const handleCloseStatusModal = () => {
    setShowStatusModal(false)
    setStatusModalOrder(null)
    setStatusModalValue('pending')
    setStatusModalLoading(false)
  }

  const handleConfirmStatusChange = async () => {
    if (!statusModalOrder) {
      showError('No order selected')
      return
    }

    const orderId = getOrderIdentifier(statusModalOrder) || statusModalOrder.id
    if (!orderId) {
      showError('Missing order identifier')
      return
    }

    try {
      setStatusModalLoading(true)
      const response = await orderService.updateOrderStatus(orderId, statusModalValue)
      if (response.success) {
        success('Order status updated successfully')
        handleCloseStatusModal()
        fetchOrders()
        fetchStats()
      } else {
        showError(response.message || 'Failed to update order status')
      }
    } catch (err) {
      console.error('Error updating order status:', err)
      showError('An error occurred while updating order status')
    } finally {
      setStatusModalLoading(false)
    }
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setOrderToDelete(null)
  }

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return
    const orderId = getOrderIdentifier(orderToDelete) || orderToDelete?.id
    if (!orderId) {
      showError('Unable to determine order ID for deletion')
      return
    }

    try {
      setDeleteLoading(true)
      const response = await orderService.deleteOrder(orderId)
      if (response.success) {
        success('Order deleted successfully')
        closeDeleteModal()
        fetchOrders()
        fetchStats()
      } else {
        showError(response.message || 'Failed to delete order')
      }
    } catch (err) {
      console.error('Error deleting order:', err)
      const message = err?.response?.data?.message || err?.message || 'An error occurred while deleting order'
      showError(message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handlePaymentSubmit = () => {
    if (paymentFormRef.current) {
      paymentFormRef.current.handleSubmit()
    }
  }

  const handlePaymentFormSubmit = async (formData) => {
    if (!paymentOrder) {
      showError('No order selected for payment')
      return
    }

    try {
      setPaymentLoading(true)
      
      // Get order ID from paymentOrder (preferred) or formData
      const orderId = getOrderIdentifier(paymentOrder) || formData.order_id || paymentOrder?.id
      if (!orderId) {
        showError('Order ID is required')
        return
      }
      
      // Clean order ID (remove # prefix if present)
      const cleanOrderId = orderId.toString().replace(/^#/, '').trim()
      
      const payload = {
        ...formData,
        order_id: cleanOrderId,
        payment_method: formData.payment_method || 'cash'
      }

      console.log('Submitting payment with payload:', payload) // Debug log

      const response = await paymentService.createPayment(payload)
      if (response.success) {
        success('Payment recorded successfully')
        handlePaymentModalClose()
        fetchOrders()
        fetchStats()
      } else {
        showError(response.message || 'Failed to record payment')
      }
    } catch (err) {
      console.error('Error recording payment:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'An error occurred while recording payment'
      showError(errorMessage)
    } finally {
      setPaymentLoading(false)
    }
  }

  // Add Order Handlers
  const handleAddOrder = () => {
    setShowAddModal(true)
  }

  const handleAddOrderSubmit = () => {
    if (addFormRef.current) {
      addFormRef.current.handleSubmit()
    }
  }

  const handleAddOrderFormSubmit = async (formData) => {
    try {
      setAddLoading(true)
      const response = await orderService.createOrder(formData)
      if (response.success) {
        success('Order created successfully')
        setShowAddModal(false)
        fetchOrders()
        fetchStats()
      } else {
        showError(response.message || 'Failed to create order')
      }
    } catch (err) {
      console.error('Error creating order:', err)
      showError('An error occurred while creating order')
    } finally {
      setAddLoading(false)
    }
  }

  // Normalize order data for form
  const normalizeOrderData = (order) => {
    if (!order) return null

    const orderDate = order.order_date || order.orderDate || new Date().toISOString()
    const dueDate = order.due_date || order.dueDate || null
    const flatDiscount = order.flat_discount !== undefined ? order.flat_discount : (order.discount || 0)
    const customerId = order.customer_id || order.customerId || order.customer?.id || ''
    const branchId = order.branch_id || order.branchId || ''

    const normalizedItems = (order.items || []).map((item, index) => {
      const quantity = item.qty || item.quantity || 1
      const price = item.price !== undefined
        ? item.price
        : item.unitPrice !== undefined
          ? item.unitPrice
          : item.amount !== undefined && quantity
            ? item.amount / quantity
            : item.totalPrice !== undefined && quantity
              ? item.totalPrice / quantity
              : 0

      const amount = item.amount !== undefined
        ? item.amount
        : item.totalPrice !== undefined
          ? item.totalPrice
          : price * quantity

      return {
        id: item.id || index + 1,
        package_id: (item.package_id || item.packageId || item.productId || item.id || index + 1).toString(),
        package_name: item.package_name || item.packageName || item.productName || item.title || `Package ${index + 1}`,
        price,
        qty: quantity,
        amount
      }
    })

    return {
      ...order,
      customer_id: customerId,
      branch_id: branchId?.toString() || '',
      order_date: orderDate,
      due_date: dueDate,
      flat_discount: flatDiscount,
      items: normalizedItems
    }
  }

  // Export Order Handlers
  const handleExportOrder = async (order) => {
    try {
      const orderId = order.id || order.orderId || getOrderIdentifier(order)
      const result = await orderService.exportOrderPdf(orderId)
      if (result.success) {
        success('Order PDF exported successfully')
      } else {
        showError(result.message || 'Failed to export PDF')
      }
    } catch (err) {
      console.error('Error exporting order PDF:', err)
      showError('An error occurred while exporting PDF')
    }
  }

  // Edit Order Handlers
  const handleEditOrder = (order) => {
    const normalized = normalizeOrderData(order)
    const identifier = getOrderIdentifier(order)
    setOrderToEdit({
      ...normalized,
      id: identifier,
      originalId: order?.id || order?.order_number || order?.orderNumber || identifier
    })
    setShowEditModal(true)
  }

  const handleEditOrderSubmit = () => {
    if (editFormRef.current) {
      editFormRef.current.handleSubmit()
    }
  }

  const handleEditOrderFormSubmit = async (formData) => {
    try {
      setEditLoading(true)
      const updateId = getOrderIdentifier(orderToEdit) || orderToEdit?.id
      if (!updateId) {
        showError('Missing order identifier')
        return
      }
      const response = await orderService.updateOrder(updateId, formData)
      if (response.success) {
        success('Order updated successfully')
        setShowEditModal(false)
        setOrderToEdit(null)
        fetchOrders()
        fetchStats()
      } else {
        showError(response.message || 'Failed to update order')
      }
    } catch (err) {
      console.error('Error updating order:', err)
      showError('An error occurred while updating order')
    } finally {
      setEditLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const statusMap = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'primary',
      completed: 'success',
      cancelled: 'danger'
    }
    return statusMap[status] || 'secondary'
  }

  const getDerivedPaymentStatus = (order) => {
    if (!order) return 'Pending'
    const { balance } = getOrderFinancials(order)
    return balance <= 0.01 ? 'Completed' : 'Pending'
  }

  const getDerivedPaymentVariant = (order) => {
    return getDerivedPaymentStatus(order) === 'Completed' ? 'success' : 'warning'
  }

  const tableColumns = [
    {
      key: 'orderNumber',
      label: 'Order ID',
      render: (value, order) => {
        if (!order) return <div>No order data</div>
        const orderId = order.orderNumber || order.id || 'N/A'
        return (
          <div>
            <div className="fw-bold">#{orderId}</div>
          </div>
        )
      }
    },
    {
      key: 'orderDate',
      label: 'Order Date (Event Date)',
      render: (value, order) => {
        if (!order) return <div>N/A</div>
        return formatDate(order.orderDate || order.order_date)
      }
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (value, order) => {
        if (!order) return <div>No customer data</div>
        const customerName = order.customer 
          ? (order.customer.name || `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'Unknown')
          : 'Unknown'
        const jobCode = order.customer?.jobCode || order.customer?.job_code || null
        return (
          <div>
            <div className="fw-bold">{customerName}</div>
            {jobCode && (
              <small className="text-primary fw-bold" style={{ fontSize: '11px' }}>Job Code: {jobCode}</small>
            )}
            <small className="text-muted d-block">{order.customer?.mobile || order.customer?.phone || order.customer?.email || 'N/A'}</small>
          </div>
        )
      }
    },
    {
      key: 'packages',
      label: 'Packages',
      render: (value, order) => {
        if (!order) return <div>No items data</div>
        const items = order.items || []
        if (items.length === 0) return <Badge bg="secondary">No items</Badge>
        
        return (
          <div>
            <div className="fw-bold">{items.length} Package{items.length > 1 ? 's' : ''}</div>
            <small className="text-muted">
              {items.slice(0, 2).map(item => item.packageName || item.package_name || 'Package').join(', ')}
              {items.length > 2 && ` +${items.length - 2} more`}
            </small>
          </div>
        )
      }
    },
    {
      key: 'amounts',
      label: 'Amounts',
      render: (value, order) => {
        if (!order) return <div>No amount data</div>
        const totalAmount = order.totalAmount || order.total_amount || order.total || 0
        const paidAmount = order.paidAmount || order.paid_amount || order.paid || 0
        const balanceAmount = order.remainingAmount || order.remaining_amount || order.balance_amount || (totalAmount - paidAmount)
        
        return (
          <div>
            <div className="fw-bold">Total: {formatCurrency(totalAmount)}</div>
            <div className="text-primary small">Paid: {formatCurrency(paidAmount)}</div>
            <div className={`small ${balanceAmount > 0 ? 'text-danger' : 'text-success'}`}>
              Remaining: {formatCurrency(balanceAmount)}
            </div>
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, order) => {
        if (!order) return <div>No status data</div>
        const orderStatus = order.status || 'pending'
        const paymentStatus = getDerivedPaymentStatus(order)
        const paymentVariant = getDerivedPaymentVariant(order)
        return (
          <div>
            <div className="mb-1">
              <small className="text-muted me-1">Order:</small>
              <Badge bg={getStatusColor(orderStatus)}>
                {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
              </Badge>
            </div>
            <div>
              <small className="text-muted me-1">Payment:</small>
              <Badge bg={paymentVariant}>
                {paymentStatus}
              </Badge>
            </div>
          </div>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, order) => {
        if (!order) return <div>No actions available</div>
        
        return (
          <div className="d-flex gap-1">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleViewDetails(order)}
              title="View Details"
            >
              <FontAwesomeIcon icon={faEye} />
            </Button>
            {canCreatePayment && (
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => handleOpenPaymentModal(order)}
                title="Record Payment"
              >
                <FontAwesomeIcon icon={faCreditCard} />
              </Button>
            )}
            {canEditOrder && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleEditOrder(order)}
                title="Edit Order"
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
            )}
            {canEditOrder && (
              <Button
                variant="outline-warning"
                size="sm"
                onClick={() => handleOpenStatusModal(order)}
                title="Update Order Status"
              >
                <FontAwesomeIcon icon={faCheck} />
              </Button>
            )}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => handleExportOrder(order)}
              title="Export Order PDF"
            >
              <FontAwesomeIcon icon={faFilePdf} />
            </Button>
            {canDeleteOrder && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDeleteOrder(order)}
                title="Delete Order"
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
          </div>
        )
      }
    }
  ]

  const sortableColumns = ['orderNumber', 'orderDate', 'total', 'status']

  const paymentFinancials = paymentOrder ? getOrderFinancials(paymentOrder) : null
  const paymentOrderId = paymentOrder ? getOrderIdentifier(paymentOrder) : ''
  const paymentDisplayNumber = paymentOrder ? getOrderDisplayNumber(paymentOrder) : ''
  const paymentDefaultAmount = paymentFinancials && paymentFinancials.balance > 0
    ? paymentFinancials.balance
    : ''

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          {/* Page Header */}
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faShoppingCart} className="me-3 text-primary fs-4" />
            <h2 className="mb-0 text-dark">Order Management</h2>
            </div>
            <div className="ms-auto d-flex align-items-center gap-3">
              {canCreateOrder && (
                <Button variant="primary" onClick={handleAddOrder} className="text-white">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Create Order
                </Button>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="bg-gradient-primary text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{stats.totalOrders || orders.length || 0}</h4>
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
                      <h4 className="mb-0">{stats.pendingOrders || 0}</h4>
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
                      <h4 className="mb-0">{stats.processingOrders || 0}</h4>
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
                        <FontAwesomeIcon icon={faRupeeSign} className="me-1" style={{ fontSize: '0.8em' }} />
                        {stats.totalRevenue ? (stats.totalRevenue / 1000).toFixed(1) + 'K' : '0'}
                      </h4>
                      <p className="mb-0 opacity-75">Total Revenue</p>
                    </div>
                    <FontAwesomeIcon icon={faRupeeSign} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Main Content Container */}
          <div className="bg-white rounded-3 shadow-sm p-4">
            {/* Search and Filter Section */}
            <div className="mb-4">
              <Row className="g-3">
                <Col md={3}>
                  <div className="position-relative">
                    <FontAwesomeIcon 
                      icon={faSearch} 
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                      style={{ zIndex: 10 }}
                    />
                    <FormControl
                      placeholder="Search by Order ID..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="border-2 ps-5"
                    />
                  </div>
                </Col>
                <Col md={2}>
                  <div className="position-relative">
                    <FontAwesomeIcon 
                      icon={faFilter} 
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                      style={{ zIndex: 10 }}
                    />
                    <FormSelect
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="border-2 ps-5"
                    >
                      <option value="all">All Status</option>
                      {orderService.getOrderStatusOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </FormSelect>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="position-relative">
                    <FontAwesomeIcon 
                      icon={faFilter} 
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                      style={{ zIndex: 10 }}
                    />
                    <FormSelect
                      value={filters.paymentStatus}
                      onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                      className="border-2 ps-5"
                    >
                      <option value="all">All Payments</option>
                      {orderService.getPaymentStatusOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </FormSelect>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="position-relative">
                    <FontAwesomeIcon 
                      icon={faFilter} 
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                      style={{ zIndex: 10 }}
                    />
                    <FormSelect
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      className="border-2 ps-5"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">This Quarter</option>
                    </FormSelect>
                  </div>
                </Col>
                <Col md={3}>
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleReset}
                    className="w-100"
                  >
                    <FontAwesomeIcon icon={faRefresh} className="me-2" />
                    Reset
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Orders Table */}
            <div className="mb-4">
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              
            {/* Section Header */}
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-primary border-2">
                <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faShoppingCart} className="me-3 text-primary fs-4" />
                <h4 className="mb-0 text-primary">Orders List</h4>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="text-muted">
                    Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1}-{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems} orders
                  </div>
                </div>
              </div>

              <Table
                columns={tableColumns}
                data={orders || []}
                loading={loading}
                sortableColumns={sortableColumns}
                pagination
                serverSide
                currentPage={pagination.currentPage}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[10, 25, 50, 100]}
                emptyMessage="No orders found"
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* Order Details Modal */}
      <OrderDetailsModal
        show={showDetailsModal}
        onHide={() => {
          setShowDetailsModal(false)
          setSelectedOrder(null)
        }}
        orderId={getOrderIdentifier(selectedOrder)}
        onOrderUpdate={handleOrderUpdate}
        onEdit={handleEditOrder}
        orderSnapshot={selectedOrder}
      />

      {/* Add Order Modal */}
      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Order"
        onSubmit={handleAddOrderSubmit}
        submitText="Create Order"
        submitIcon={faPlus}
        loading={addLoading}
        loadingText="Creating..."
        size="xl"
      >
        <OrderForm
          ref={addFormRef}
          mode="create"
          onSubmit={handleAddOrderFormSubmit}
          onCancel={() => setShowAddModal(false)}
        />
      </FormModal>

      {/* Edit Order Modal */}
      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setOrderToEdit(null)
        }}
        title="Edit Order"
        onSubmit={handleEditOrderSubmit}
        submitText="Update Order"
        submitIcon={faSave}
        loading={editLoading}
        loadingText="Updating..."
        size="xl"
      >
        <OrderForm
          ref={editFormRef}
          mode="edit"
          orderData={orderToEdit}
          onSubmit={handleEditOrderFormSubmit}
          onCancel={() => {
            setShowEditModal(false)
            setOrderToEdit(null)
          }}
        />
      </FormModal>

      <FormModal
        visible={showPaymentModal}
        onClose={handlePaymentModalClose}
        title={`Record Payment${paymentDisplayNumber ? ` - #${paymentDisplayNumber}` : ''}`}
        onSubmit={handlePaymentSubmit}
        submitText="Save Payment"
        submitIcon={faCreditCard}
        loading={paymentLoading}
        loadingText="Saving..."
        size="lg"
      >
        <PaymentForm
          key={`payment-form-${paymentOrderId || 'new'}`}
          ref={paymentFormRef}
          mode="create"
          initialOrderId={paymentOrderId}
          initialAmount={paymentDefaultAmount}
          onSubmit={handlePaymentFormSubmit}
        />
      </FormModal>

      <Modal
        visible={showStatusModal}
        onClose={handleCloseStatusModal}
        title={`Update Order Status${statusModalOrder ? ` - #${getOrderDisplayNumber(statusModalOrder)}` : ''}`}
        onConfirm={handleConfirmStatusChange}
        confirmText="Update Status"
        cancelText="Cancel"
        loading={statusModalLoading}
      >
        <Form.Group className="mb-3" controlId="orderStatusSelect">
          <Form.Label>Select new status</Form.Label>
          <FormSelect
            value={statusModalValue}
            onChange={(event) => setStatusModalValue(event.target.value)}
          >
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </FormSelect>
        </Form.Group>
        <p className="text-muted mb-0">
          Use this action to manually override the order status when needed.
        </p>
      </Modal>

      <Modal
        visible={showDeleteModal}
        onClose={closeDeleteModal}
        title="Delete Order"
        onConfirm={confirmDeleteOrder}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      >
        <p>
          Are you sure you want to delete order{' '}
          <strong>#{orderToDelete ? getOrderDisplayNumber(orderToDelete) : ''}</strong>?
        </p>
        <p className="text-muted mb-0">This action cannot be undone.</p>
      </Modal>
    </Container>
  )
}

export default OrdersList
