// Transaction Service - API calls for wallet/credit-debit management
import apiService from '../api'
import { API_ENDPOINTS } from '../constants/api'
import transactionsMockData from '../mock/transactions.json'
import customersData from '../mock/customers.json'
import ordersMockData from '../mock/orders.json'

class TransactionService {
  // Get all transactions
  async getTransactions(params = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.customer_id) queryParams.append('customer_id', params.customer_id)
    if (params.order_id) queryParams.append('order_id', params.order_id)
    if (params.type) queryParams.append('type', params.type)
    if (params.branch_id) queryParams.append('branch_id', params.branch_id)
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)

    const endpoint = `${API_ENDPOINTS.TRANSACTIONS.LIST}?${queryParams.toString()}`

    try {
      const response = await apiService.get(endpoint)
      if (response && response.success) {
        return response
      }
      return this.getMockTransactions(params)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.getMockTransactions(params)
    }
  }

  // Get transaction by ID
  async getTransactionById(id) {
    try {
      const response = await apiService.get(API_ENDPOINTS.TRANSACTIONS.GET_BY_ID(id))
      if (response && response.success) {
        return response
      }
      return this.getMockTransactionById(id)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.getMockTransactionById(id)
    }
  }

  // Create new transaction
  async createTransaction(transactionData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.TRANSACTIONS.CREATE, transactionData)
      if (response && response.success) {
        return response
      }
      return this.createMockTransaction(transactionData)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.createMockTransaction(transactionData)
    }
  }

  // Update transaction
  async updateTransaction(id, transactionData) {
    try {
      const response = await apiService.put(API_ENDPOINTS.TRANSACTIONS.UPDATE(id), transactionData)
      if (response && response.success) {
        return response
      }
      return this.updateMockTransaction(id, transactionData)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.updateMockTransaction(id, transactionData)
    }
  }

  // Get transactions by customer
  async getTransactionsByCustomer(customerId, params = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.type) queryParams.append('type', params.type)
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)

    const endpoint = `${API_ENDPOINTS.TRANSACTIONS.GET_BY_CUSTOMER(customerId)}?${queryParams.toString()}`

    try {
      const response = await apiService.get(endpoint)
      if (response && response.success) {
        return response
      }
      return this.getMockTransactions({ ...params, customer_id: customerId })
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.getMockTransactions({ ...params, customer_id: customerId })
    }
  }

  // Get transactions by order
  async getTransactionsByOrder(orderId) {
    try {
      const response = await apiService.get(API_ENDPOINTS.TRANSACTIONS.GET_BY_ORDER(orderId))
      if (response && response.success) {
        return response
      }
      return this.getMockTransactions({ order_id: orderId })
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.getMockTransactions({ order_id: orderId })
    }
  }

  // Get transaction types
  getTransactionTypes() {
    return [
      { value: 'credit', label: 'Credit (+ Money IN)', color: 'success' },
      { value: 'debit', label: 'Debit (- Money OUT)', color: 'danger' },
    ]
  }

  // Validate transaction data
  validateTransactionData(transactionData, isUpdate = false) {
    const errors = {}

    if (!isUpdate || transactionData.customer_id !== undefined) {
      if (!transactionData.customer_id) {
        errors.customer_id = 'Customer is required'
      }
    }

    if (!isUpdate || transactionData.branch_id !== undefined) {
      if (!transactionData.branch_id) {
        errors.branch_id = 'Branch is required'
      }
    }

    if (!isUpdate || transactionData.type !== undefined) {
      if (!transactionData.type || !['credit', 'debit'].includes(transactionData.type)) {
        errors.type = 'Transaction type is required (credit or debit)'
      }
    }

    if (!isUpdate || transactionData.amount !== undefined) {
      if (!transactionData.amount || transactionData.amount <= 0) {
        errors.amount = 'Amount is required and must be > 0'
      }
    }

    if (!isUpdate || transactionData.transaction_date !== undefined) {
      if (!transactionData.transaction_date) {
        errors.transaction_date = 'Transaction date is required'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  // ----------------------
  // Mock helpers
  // ----------------------

  enrichTransaction(transaction) {
    const customer = customersData.find(c => c.id === transaction.customer_id)
    const order = (ordersMockData.orders || []).find(o => o.id === transaction.order_id || o.id === Number(transaction.order_id) || o.orderNumber === transaction.order_id)

    const customerName = customer
      ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.name || `Customer #${customer.id}`
      : transaction.customer_name || `Customer #${transaction.customer_id}`

    const orderNumber = order?.orderNumber || order?.id || transaction.order_id || null

    // Calculate received amount (only for credit transactions - money received from customer)
    const receivedAmount = transaction.type === 'credit' ? Number(transaction.amount || 0) : 0

    // Calculate customer's remaining amount
    // Priority: 1. customer.remaining_amount, 2. customer.total_amount - customer.paid_amount, 3. Calculate from transactions
    let remainingAmount = 0
    if (customer) {
      if (customer.remaining_amount !== undefined && customer.remaining_amount !== null) {
        remainingAmount = Number(customer.remaining_amount)
      } else if (customer.total_amount !== undefined && customer.paid_amount !== undefined) {
        remainingAmount = Math.max(0, Number(customer.total_amount || 0) - Number(customer.paid_amount || 0))
      } else if (customer.totalSpent !== undefined) {
        // Fallback: Calculate from customer's totalSpent and transactions
        const customerTransactions = (transactionsMockData.transactions || [])
          .filter(tx => Number(tx.customer_id) === Number(transaction.customer_id))
        const totalPaid = customerTransactions
          .filter(tx => tx.type === 'credit')
          .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
        remainingAmount = Math.max(0, Number(customer.totalSpent || 0) - totalPaid)
      }
    }

    return {
      ...transaction,
      customer_name: transaction.customer_name || customerName,
      order_number: orderNumber,
      order_date: transaction.order_date || order?.order_date || order?.orderDate || null,
      branch_id: transaction.branch_id || customer?.branch_id || null,
      amount: Number(transaction.amount || 0),
      received_amount: receivedAmount,
      remaining_amount: remainingAmount
    }
  }

  getMockTransactions(params = {}) {
    let transactions = [...(transactionsMockData.transactions || [])]

    transactions = transactions.map(tx => this.enrichTransaction(tx))

    if (params.customer_id) {
      const id = Number(params.customer_id)
      transactions = transactions.filter(tx => Number(tx.customer_id) === id)
    }

    if (params.order_id) {
      transactions = transactions.filter(tx => tx.order_id && tx.order_id.toString() === params.order_id.toString())
    }

    if (params.type) {
      transactions = transactions.filter(tx => tx.type === params.type)
    }

    if (params.branch_id) {
      const branchId = Number(params.branch_id)
      transactions = transactions.filter(tx => Number(tx.branch_id) === branchId)
    }

    if (params.startDate) {
      const start = new Date(params.startDate)
      transactions = transactions.filter(tx => new Date(tx.transaction_date) >= start)
    }

    if (params.endDate) {
      const end = new Date(params.endDate)
      transactions = transactions.filter(tx => new Date(tx.transaction_date) <= end)
    }

    if (params.search) {
      const term = params.search.toLowerCase()
      transactions = transactions.filter(tx =>
        tx.remarks?.toLowerCase().includes(term) ||
        tx.customer_name?.toLowerCase().includes(term) ||
        tx.order_number?.toString().toLowerCase().includes(term)
      )
    }

    transactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))

    if (params.page || params.limit) {
      const page = Number(params.page || 1)
      const limit = Number(params.limit || transactions.length || 10)
      const startIndex = (page - 1) * limit
      const paginated = transactions.slice(startIndex, startIndex + limit)
      return {
        success: true,
        data: paginated,
        total: transactions.length,
        page,
        limit
      }
    }

    return {
      success: true,
      data: transactions,
      total: transactions.length
    }
  }

  getMockTransactionById(id) {
    const tx = (transactionsMockData.transactions || []).find(transaction => transaction.id === Number(id) || transaction.id?.toString() === id?.toString())
    if (!tx) {
      return {
        success: false,
        message: 'Transaction not found'
      }
    }

    return {
      success: true,
      data: this.enrichTransaction(tx)
    }
  }

  async createMockTransaction(transactionData) {
    const transactions = transactionsMockData.transactions || []
    const newId = transactions.length > 0
      ? Math.max(...transactions.map(tx => Number(tx.id) || 0)) + 1
      : 1

    const nowIso = new Date().toISOString()
    const transactionDate = transactionData.transaction_date
      ? new Date(transactionData.transaction_date).toISOString()
      : nowIso

    const rawTransaction = {
      id: newId,
      customer_id: Number(transactionData.customer_id),
      branch_id: transactionData.branch_id ? Number(transactionData.branch_id) : null,
      order_id: transactionData.order_id ? transactionData.order_id.toString() : null,
      type: transactionData.type || 'credit',
      amount: Number(transactionData.amount || 0),
      transaction_date: transactionDate,
      remarks: transactionData.remarks || null,
      created_at: nowIso,
      updated_at: nowIso
    }

    transactions.push(rawTransaction)

    this.applyTransactionToCustomer(rawTransaction)

    return {
      success: true,
      data: this.enrichTransaction(rawTransaction),
      message: 'Transaction created successfully (mock)'
    }
  }

  async updateMockTransaction(id, transactionData) {
    const transactions = transactionsMockData.transactions || []
    const index = transactions.findIndex(tx => tx.id === Number(id) || tx.id?.toString() === id?.toString())

    if (index === -1) {
      return {
        success: false,
        message: 'Transaction not found'
      }
    }

    const existing = transactions[index]
    this.applyTransactionToCustomer(existing, true)

    const updated = {
      ...existing,
      customer_id: transactionData.customer_id !== undefined ? Number(transactionData.customer_id) : existing.customer_id,
      branch_id: transactionData.branch_id !== undefined ? Number(transactionData.branch_id) : existing.branch_id,
      order_id: transactionData.order_id !== undefined && transactionData.order_id !== null ? transactionData.order_id.toString() : existing.order_id,
      type: transactionData.type || existing.type,
      amount: transactionData.amount !== undefined ? Number(transactionData.amount) : existing.amount,
      transaction_date: transactionData.transaction_date ? new Date(transactionData.transaction_date).toISOString() : existing.transaction_date,
      remarks: transactionData.remarks !== undefined ? transactionData.remarks : existing.remarks,
      updated_at: new Date().toISOString()
    }

    transactions[index] = updated

    this.applyTransactionToCustomer(updated)

    return {
      success: true,
      data: this.enrichTransaction(updated),
      message: 'Transaction updated successfully (mock)'
    }
  }

  applyTransactionToCustomer(transaction, revert = false) {
    const customer = customersData.find(c => c.id === Number(transaction.customer_id))
    if (!customer) {
      return
    }

    // Recalculate customer amounts from orders and transactions
    this.recalculateCustomerAmounts(Number(transaction.customer_id))

    if (!revert) {
      customer.lastTransactionDate = transaction.transaction_date
    } else {
      this.updateCustomerLastTransactionDate(customer.id)
    }

    customer.updatedAt = new Date().toISOString()
  }

  // Recalculate customer amounts from orders and transactions
  recalculateCustomerAmounts(customerId) {
    const customer = customersData.find(c => c.id === Number(customerId))
    if (!customer) {
      return
    }

    // Get all orders for customer
    const orders = (ordersMockData.orders || []).filter(order => 
      Number(order.customer_id || order.customerId || order.customer?.id) === Number(customerId)
    )
    
    // Calculate total amount from orders
    const totalAmount = orders.reduce((sum, order) => {
      return sum + (Number(order.total_amount || order.total || 0))
    }, 0)

    // Get all transactions for customer
    const transactions = (transactionsMockData.transactions || []).filter(tx => 
      Number(tx.customer_id) === Number(customerId)
    )
    
    // Calculate paid amount from credit transactions
    const paidAmount = transactions
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + (Number(tx.amount || 0)), 0)
    
    // Calculate remaining amount
    const remainingAmount = Math.max(0, totalAmount - paidAmount)

    // Update customer with calculated amounts
    customer.total_amount = totalAmount
    customer.total_earnings = totalAmount
    customer.totalSpent = totalAmount
    customer.paid_amount = paidAmount
    customer.wallet_balance = paidAmount
    customer.remaining_amount = remainingAmount
  }

  updateCustomerLastTransactionDate(customerId) {
    const customer = customersData.find(c => c.id === Number(customerId))
    if (!customer) return

    const transactions = (transactionsMockData.transactions || []).filter(tx => Number(tx.customer_id) === Number(customerId))
    if (transactions.length === 0) {
      customer.lastTransactionDate = null
      return
    }

    const latest = transactions.reduce((latestTx, currentTx) => {
      return new Date(currentTx.transaction_date) > new Date(latestTx.transaction_date) ? currentTx : latestTx
    })

    customer.lastTransactionDate = latest.transaction_date
  }
}

// Create and export singleton instance
const transactionService = new TransactionService()
export default transactionService

