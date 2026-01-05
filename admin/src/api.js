// Mock API Service Setup
import config from './config'
import usersData from './mock/users.json'
import ordersData from './mock/orders.json'

class ApiService {
  constructor() {
    this.baseURL = config.api.baseURL
    this.timeout = config.api.timeout
    this.mockData = {
      users: usersData.users,
      roles: usersData.roles,
      orders: ordersData.orders,
      stats: ordersData.stats,
      statusOptions: ordersData.statusOptions,
      paymentStatusOptions: ordersData.paymentStatusOptions,
      paymentMethodOptions: ordersData.paymentMethodOptions,
      shippingMethodOptions: ordersData.shippingMethodOptions,
      paymentsByOrder: {
        ORD001: [
          {
            id: 'PAY-1001',
            order_id: 'ORD001',
            amount: 30000,
            status: 'paid',
            payment_method: 'upi',
            payment_date: '2024-01-20T12:00:00.000Z',
            payment_type: 'credit'
          },
          {
            id: 'PAY-1002',
            order_id: 'ORD001',
            amount: 20000,
            status: 'paid',
            payment_method: 'card',
            payment_date: '2024-01-21T09:30:00.000Z',
            payment_type: 'credit'
          }
        ],
        ORD002: [
          {
            id: 'PAY-2001',
            order_id: 'ORD002',
            amount: 8000,
            status: 'paid',
            payment_method: 'card',
            payment_date: '2024-02-15T15:00:00.000Z',
            payment_type: 'credit'
          }
        ],
        ORD003: [
          {
            id: 'PAY-3001',
            order_id: 'ORD003',
            amount: 12000,
            status: 'partial',
            payment_method: 'cash',
            payment_date: '2024-03-10T10:15:00.000Z',
            payment_type: 'credit'
          }
        ],
        ORD005: [
          {
            id: 'PAY-5001',
            order_id: 'ORD005',
            amount: 15000,
            status: 'partial',
            payment_method: 'upi',
            payment_date: '2024-04-05T17:00:00.000Z',
            payment_type: 'credit'
          }
        ]
      }
    }

    const allPayments = Object.entries(this.mockData.paymentsByOrder || {}).flatMap(([orderId, payments]) => {
      return (payments || []).map(payment => ({
        ...payment,
        order_id: payment.order_id || orderId
      }))
    })

    this.mockData.payments = allPayments

    const paymentIdNumbers = allPayments
      .map(payment => {
        const match = payment.id?.toString().match(/\d+/g)
        return match ? parseInt(match.join(''), 10) : null
      })
      .filter(value => typeof value === 'number' && !Number.isNaN(value))

    this.paymentCounter = paymentIdNumbers.length > 0 ? Math.max(...paymentIdNumbers) : 1000
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem(config.auth.storageKey)
  }

  // Get user data from localStorage
  getUser() {
    const user = localStorage.getItem(config.auth.userStorageKey)
    return user ? JSON.parse(user) : null
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAuthToken()
    const user = this.getUser()
    return !!(token && user)
  }

  // Simulate API delay
  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Mock API request
  async request(endpoint, options = {}) {
    // Simulate network delay
    await this.delay(300)

    const method = options.method || 'GET'
    
    // Parse query parameters from endpoint
    const [baseEndpoint, queryString] = endpoint.split('?')
    const params = {}
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=')
        if (key && value) {
          params[key] = decodeURIComponent(value)
        }
      })
    }
    
    // Mock responses based on endpoint
    switch (baseEndpoint) {
      case '/users':
        if (method === 'GET') {
          return {
            success: true,
            data: this.mockData.users,
            total: this.mockData.users.length
          }
        }
        break
        
      case '/roles':
        if (method === 'GET') {
          return {
            success: true,
            data: this.mockData.roles,
            total: this.mockData.roles.length
          }
        }
        break
        
      case '/orders':
        if (method === 'GET') {
          // Handle query parameters for filtering
          let filteredOrders = [...(this.mockData.orders || [])]
          
          // Apply filters based on query parameters
          if (params) {
            const { status, paymentStatus, search, customer } = params
            
            if (status && status !== 'all') {
              filteredOrders = filteredOrders.filter(order => order.status === status)
            }
            
            if (paymentStatus && paymentStatus !== 'all') {
              filteredOrders = filteredOrders.filter(order => order.paymentStatus === paymentStatus)
            }
            
            if (search) {
              filteredOrders = filteredOrders.filter(order => 
                order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                order.customer.firstName.toLowerCase().includes(search.toLowerCase()) ||
                order.customer.lastName.toLowerCase().includes(search.toLowerCase())
              )
            }
            
            if (customer) {
              filteredOrders = filteredOrders.filter(order => 
                order.customer.firstName.toLowerCase().includes(customer.toLowerCase()) ||
                order.customer.lastName.toLowerCase().includes(customer.toLowerCase())
              )
            }
          }
          
          return {
            success: true,
            data: {
              orders: filteredOrders,
              total: filteredOrders.length
            }
          }
        }
        break
        
      case '/orders/stats':
        if (method === 'GET') {
          return {
            success: true,
            data: this.mockData.stats
          }
        }
        break
        
      case '/auth/login':
        if (method === 'POST') {
          const { email, password } = options.body ? JSON.parse(options.body) : {}
          const user = this.mockData.users.find(u => u.email === email && u.password === password)
          
          if (user) {
            const token = btoa(JSON.stringify({ 
              userId: user.id, 
              exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            }))
            
            return {
              success: true,
              user: { ...user, password: undefined }, // Remove password from response
              token
            }
          } else {
            throw new Error('Invalid credentials')
          }
        }
        break
        
      default:
        if (baseEndpoint === '/payments') {
          if (method === 'GET') {
            return {
              success: true,
              data: this.mockData.payments || []
            }
          }

          if (method === 'POST') {
            const body = options.body ? JSON.parse(options.body) : {}
            const rawOrderId = body.order_id || body.orderId
            const amountValue = Number(body.amount || 0)
            if (!rawOrderId) {
              throw new Error('Order ID is required')
            }
            if (!amountValue || Number.isNaN(amountValue) || amountValue <= 0) {
              throw new Error('Amount must be greater than zero')
            }

            const sanitizedOrderId = rawOrderId.toString().replace(/^#/, '').trim()
            // Try to find order by various ID formats (string, number, with/without #)
            const orderIndex = this.mockData.orders.findIndex(
              (o) => {
                const orderId = o.id?.toString() || ''
                const orderNumber = o.orderNumber?.toString() || o.order_number?.toString() || ''
                const numericId = parseInt(sanitizedOrderId, 10)
                const stringId = sanitizedOrderId
                
                return (
                  orderId === stringId ||
                  orderId === numericId.toString() ||
                  orderId === `#${stringId}` ||
                  orderId === `#${numericId}` ||
                  orderNumber === stringId ||
                  orderNumber === `#${stringId}` ||
                  orderNumber === `#${numericId}` ||
                  (numericId && parseInt(orderId, 10) === numericId)
                )
              }
            )

            if (orderIndex === -1) {
              console.error('Order not found in mock data. Looking for:', sanitizedOrderId, 'Available orders:', this.mockData.orders.map(o => ({ id: o.id, orderNumber: o.orderNumber || o.order_number })))
              throw new Error(`Order not found: ${sanitizedOrderId}`)
            }

            const currentOrder = this.mockData.orders[orderIndex]
            const nowIso = new Date().toISOString()

            const paymentType = body.payment_type || body.paymentType || 'credit'
            const delta = paymentType === 'debit' ? -amountValue : amountValue

            const totalAmount = Number(currentOrder.total_amount ?? currentOrder.total ?? 0)
            const existingPaid = Number(currentOrder.paid_amount ?? currentOrder.paid ?? 0)
            const updatedPaid = Math.max(0, existingPaid + delta)
            const balance = Math.max(0, totalAmount - updatedPaid)
            const orderPaymentStatus = balance === 0 ? 'paid' : (updatedPaid === 0 ? 'pending' : 'partial')

            const paymentDateInput = body.payment_date || body.paymentDate || nowIso
            const paymentDate = new Date(paymentDateInput).toISOString()
            const paymentMethod = body.payment_method || body.paymentMethod || 'cash'

            this.paymentCounter += 1
            const newPaymentId = `PAY-${this.paymentCounter}`

            const paymentRecord = {
              id: newPaymentId,
              order_id: sanitizedOrderId,
              amount: amountValue,
              status: paymentType === 'debit' ? 'refunded' : orderPaymentStatus,
              payment_method: paymentMethod,
              payment_date: paymentDate,
              remarks: body.remarks || null,
              created_at: nowIso,
              updated_at: nowIso,
              payment_type: paymentType,
              paymentType
            }

            if (!this.mockData.paymentsByOrder[sanitizedOrderId]) {
              this.mockData.paymentsByOrder[sanitizedOrderId] = []
            }

            this.mockData.paymentsByOrder[sanitizedOrderId].push(paymentRecord)
            this.mockData.payments.push(paymentRecord)

            currentOrder.paid_amount = updatedPaid
            currentOrder.paid = updatedPaid
            currentOrder.balance_amount = balance
            currentOrder.paymentStatus = orderPaymentStatus
            currentOrder.payment_status = currentOrder.paymentStatus
            currentOrder.updated_at = nowIso
            currentOrder.updatedAt = nowIso

            if (this.mockData.stats) {
              const totalRevenue = this.mockData.orders.reduce((sum, order) => {
                return sum + Number(order.paid_amount || order.paid || 0)
              }, 0)
              this.mockData.stats.totalRevenue = totalRevenue
            }

            return {
              success: true,
              data: paymentRecord,
              message: 'Payment recorded successfully (mock)'
            }
          }
        }

        if (baseEndpoint.startsWith('/payments/')) {
          const paymentId = baseEndpoint.split('/payments/')[1]
          if (!paymentId) break

          if (method === 'GET') {
            const payment = (this.mockData.payments || []).find(p => p.id === paymentId)
            if (payment) {
              return {
                success: true,
                data: payment
              }
            }
            throw new Error('Payment not found')
          }

          if (method === 'PUT') {
            const body = options.body ? JSON.parse(options.body) : {}
            const payments = this.mockData.payments || []
            const paymentIndex = payments.findIndex(p => p.id === paymentId)
            if (paymentIndex === -1) {
              throw new Error('Payment not found')
            }

            const existingPayment = payments[paymentIndex]
            const oldOrderId = existingPayment.order_id
            const oldAmount = Number(existingPayment.amount || 0)
            const oldPaymentType = existingPayment.payment_type || existingPayment.paymentType || 'credit'
            const oldDelta = oldPaymentType === 'debit' ? -oldAmount : oldAmount

            const newOrderIdRaw = body.order_id || body.orderId || oldOrderId
            if (!newOrderIdRaw) {
              throw new Error('Order ID is required')
            }
            const newOrderId = newOrderIdRaw.toString().replace(/^#/, '').trim()
            const newAmount = Number(body.amount || existingPayment.amount || 0)
            if (!newAmount || Number.isNaN(newAmount) || newAmount <= 0) {
              throw new Error('Amount must be greater than zero')
            }
            const newPaymentType = body.payment_type || body.paymentType || existingPayment.payment_type || existingPayment.paymentType || 'credit'
            const newDelta = newPaymentType === 'debit' ? -newAmount : newAmount

            const orderIndexForNew = this.mockData.orders.findIndex(
              (o) => o.id === newOrderId || o.id === `#${newOrderId}` || o.orderNumber === `#${newOrderId}`
            )
            if (orderIndexForNew === -1) {
              throw new Error('Order not found')
            }

            const adjustOrderTotals = (orderId, delta) => {
              const orderIndex = this.mockData.orders.findIndex(
                (o) => o.id === orderId || o.id === `#${orderId}` || o.orderNumber === `#${orderId}`
              )
              if (orderIndex === -1) return
              const order = this.mockData.orders[orderIndex]
              const nowIso = new Date().toISOString()
              const totalAmount = Number(order.total_amount ?? order.total ?? 0)
              const paidAmountRaw = Number(order.paid_amount ?? order.paid ?? 0) + delta
              const paidAmount = Math.max(0, paidAmountRaw)
              const balanceAmount = Math.max(0, totalAmount - paidAmount)
              const orderPaymentStatus = balanceAmount === 0 ? 'paid' : (paidAmount === 0 ? 'pending' : 'partial')
              order.paid_amount = paidAmount
              order.paid = paidAmount
              order.balance_amount = balanceAmount
              order.paymentStatus = orderPaymentStatus
              order.payment_status = order.paymentStatus
              order.updated_at = nowIso
              order.updatedAt = nowIso
              return {
                paidAmount,
                balanceAmount,
                orderPaymentStatus
              }
            }

            // Revert previous order totals
            adjustOrderTotals(oldOrderId, -oldDelta)

            // Remove payment from previous order list
            if (this.mockData.paymentsByOrder[oldOrderId]) {
              this.mockData.paymentsByOrder[oldOrderId] = this.mockData.paymentsByOrder[oldOrderId].filter(
                (payment) => payment.id !== paymentId
              )
            }

            const nowIso = new Date().toISOString()
            const paymentDateInput = body.payment_date || body.paymentDate || existingPayment.payment_date || existingPayment.paymentDate || nowIso
            const paymentDate = new Date(paymentDateInput).toISOString()
            const paymentMethod = body.payment_method || body.paymentMethod || existingPayment.payment_method || 'cash'
            const remarks = body.remarks !== undefined ? body.remarks : existingPayment.remarks || null

            const updatedPayment = {
              ...existingPayment,
              order_id: newOrderId,
              amount: newAmount,
              payment_method: paymentMethod,
              payment_date: paymentDate,
              remarks,
              updated_at: nowIso,
              payment_type: newPaymentType,
              paymentType: newPaymentType
            }

            payments[paymentIndex] = updatedPayment

            if (!this.mockData.paymentsByOrder[newOrderId]) {
              this.mockData.paymentsByOrder[newOrderId] = []
            }
            const newOrderPayments = this.mockData.paymentsByOrder[newOrderId]
            if (oldOrderId !== newOrderId) {
              newOrderPayments.push(updatedPayment)
            } else {
              const existingIndex = newOrderPayments.findIndex(payment => payment.id === paymentId)
              if (existingIndex !== -1) {
                newOrderPayments[existingIndex] = updatedPayment
              } else {
                newOrderPayments.push(updatedPayment)
              }
            }

            // Apply new totals
            const orderAdjustment = adjustOrderTotals(newOrderId, newDelta)

            if (orderAdjustment) {
              updatedPayment.status = newPaymentType === 'debit'
                ? 'refunded'
                : orderAdjustment.orderPaymentStatus
            }

            // Update stats
            if (this.mockData.stats) {
              const totalRevenue = this.mockData.orders.reduce((sum, order) => {
                return sum + Number(order.paid_amount || order.paid || 0)
              }, 0)
              this.mockData.stats.totalRevenue = totalRevenue
            }

            return {
              success: true,
              data: updatedPayment,
              message: 'Payment updated successfully (mock)'
            }
          }
        }

        // Handle dynamic order endpoints
        if (baseEndpoint.startsWith('/orders/') && !baseEndpoint.includes('/stats')) {
          const orderPath = baseEndpoint.split('/orders/')[1]
          if (!orderPath) break

          const [orderId, subPath, subId] = orderPath.split('/')
          const sanitizedOrderId = orderId ? orderId.replace(/^#/, '').trim() : null
          if (!sanitizedOrderId) {
            throw new Error('Invalid order identifier')
          }

          const orderIndex = this.mockData.orders.findIndex(
            (o) => o.id === sanitizedOrderId || o.id === `#${sanitizedOrderId}` || o.orderNumber === `#${sanitizedOrderId}`
          )

          if (orderIndex === -1) {
            throw new Error('Order not found')
          }

          const currentOrder = this.mockData.orders[orderIndex]

          if (!subPath) {
            if (method === 'GET') {
              return {
                success: true,
                data: currentOrder
              }
            }

            if (method === 'PUT') {
              const updatedData = options.body ? JSON.parse(options.body) : {}
              const updatedOrder = {
                ...currentOrder,
                ...updatedData,
                id: currentOrder.id,
                orderNumber: currentOrder.orderNumber || `#${currentOrder.id}`,
                updated_at: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }

              this.mockData.orders.splice(orderIndex, 1, updatedOrder)

              return {
                success: true,
                data: updatedOrder,
                message: 'Order updated successfully (mock)'
              }
            }
          }

          if (subPath === 'status' && method === 'PATCH') {
            const { status } = options.body ? JSON.parse(options.body) : {}
            if (!status) {
              throw new Error('Status is required')
            }
            currentOrder.status = status
            currentOrder.updated_at = new Date().toISOString()
            currentOrder.updatedAt = currentOrder.updated_at
            return {
              success: true,
              data: currentOrder,
              message: 'Order status updated (mock)'
            }
          }

          if (subPath === 'payment-status' && method === 'PATCH') {
            const { paymentStatus, paymentMethod } = options.body ? JSON.parse(options.body) : {}
            if (!paymentStatus) {
              throw new Error('Payment status is required')
            }
            currentOrder.paymentStatus = paymentStatus
            if (paymentMethod) currentOrder.paymentMethod = paymentMethod
            currentOrder.updated_at = new Date().toISOString()
            currentOrder.updatedAt = currentOrder.updated_at
            return {
              success: true,
              data: currentOrder,
              message: 'Order payment status updated (mock)'
            }
          }

          throw new Error(`Mock endpoint not implemented: ${baseEndpoint}`)
        }
        if (baseEndpoint.startsWith('/payments/order/')) {
          const orderId = baseEndpoint.split('/payments/order/')[1]
          const sanitizedOrderId = orderId ? orderId.replace(/^#/, '').trim() : null
          const payments = sanitizedOrderId 
            ? this.mockData.paymentsByOrder[sanitizedOrderId] || []
            : []
          return {
            success: true,
            data: payments
          }
        }
        throw new Error(`Mock endpoint not implemented: ${baseEndpoint}`)
    }
  }

  // HTTP Methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }

  // Authentication Methods
  async login(credentials) {
    return this.post('/auth/login', credentials)
  }

  async register(userData) {
    return this.post('/auth/register', userData)
  }

  async forgotPassword(email) {
    return this.post('/auth/forgot-password', { email })
  }

  async resetPassword(token, newPassword) {
    return this.post('/auth/reset-password', { token, password: newPassword })
  }

  async logout() {
    // Clear local storage
    localStorage.removeItem(config.auth.storageKey)
    localStorage.removeItem(config.auth.userStorageKey)
    
    // Call logout endpoint if needed
    try {
      await this.post('/auth/logout')
    } catch (error) {
      console.warn('Logout endpoint failed:', error)
    }
  }

  // User Methods
  async getProfile() {
    return this.get('/user/profile')
  }

  async updateProfile(userData) {
    return this.put('/user/profile', userData)
  }
}

// Create and export singleton instance
const apiService = new ApiService()
export default apiService
