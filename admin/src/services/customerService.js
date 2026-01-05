// Customer Service - API calls for customer management
import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'
import customersData from '../mock/customers.json'
import { handleApiError } from '../utils/errorHandler'

const normalizeNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback
  const num = Number(value)
  return Number.isNaN(num) ? fallback : num
}

class CustomerService {
  normalizeName(customerData = {}) {
    const directFirst = customerData.firstName || customerData.first_name
    const directLast = customerData.lastName || customerData.last_name

    if (directFirst || directLast) {
      return {
        firstName: directFirst || '',
        lastName: directLast || ''
      }
    }

    const rawName = customerData.name || ''
    if (!rawName.trim()) {
      return {
        firstName: '',
        lastName: ''
      }
    }

    const parts = rawName.trim().split(/\s+/)
    const firstName = parts.shift() || ''
    const lastName = parts.join(' ')

    return {
      firstName,
      lastName
    }
  }
  enrichCustomer(customer = {}) {
    if (!customer || typeof customer !== 'object') {
      return customer
    }

    const total = normalizeNumber(
      customer.total_amount ??
      customer.total_earnings ??
      customer.totalSpent ??
      customer.totalAmount
    )

    const paid = normalizeNumber(
      customer.paid_amount ??
      customer.paidAmount ??
      customer.wallet_balance ??
      customer.walletBalance
    )

    const remaining = customer.remaining_amount !== undefined && customer.remaining_amount !== null
      ? normalizeNumber(customer.remaining_amount)
      : customer.remainingAmount !== undefined && customer.remainingAmount !== null
        ? normalizeNumber(customer.remainingAmount)
        : Math.max(0, total - paid)

    const totalOrders = normalizeNumber(
      customer.total_orders ??
      customer.totalOrders ??
      customer.total_services ??
      customer.totalServices,
      0
    )

    const totalServices = normalizeNumber(
      customer.total_services ??
      customer.totalServices ??
      customer.total_orders ??
      customer.totalOrders,
      0
    )

    const customerCode = customer.customer_code ||
      customer.customerCode ||
      customer.photographerId ||
      (customer.id ? `#CUST${String(customer.id).padStart(3, '0')}` : '')

    const joinedDate = customer.joinedDate || customer.createdAt || customer.created_at

    return {
      ...customer,
      total_amount: total,
      total_earnings: total,
      totalSpent: total,
      paid_amount: paid,
      remaining_amount: remaining,
      wallet_balance: customer.wallet_balance ?? customer.walletBalance ?? paid,
      total_orders: totalOrders,
      total_services: totalServices,
      customer_code: customerCode,
      photographerId: customer.photographerId || customerCode,
      joinedDate,
      created_at: customer.created_at || customer.createdAt || joinedDate,
    }
  }

  transformListResponse(payload) {
    if (!payload) {
      return {
        success: false,
        data: [],
        meta: null,
        message: 'No response received from server.',
      }
    }

    const data = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.data?.data)
        ? payload.data.data
        : payload.data || []

    const meta = payload.meta ?? {}

    const normalizedData = data.map((customer) => this.enrichCustomer(customer))

    return {
      success: payload.success ?? true,
      data: normalizedData,
      meta: {
        total: meta.total ?? data.length,
        page: meta.page ?? 1,
        limit: meta.limit ?? (data.length || 1),
        totalPages: meta.totalPages ?? 1,
        hasNext: meta.hasNext ?? false,
        hasPrev: meta.hasPrev ?? false,
        sortBy: meta.sortBy ?? null,
        sortDirection: meta.sortDirection ?? null,
      },
      message: payload.message ?? '',
    }
  }

  transformItemResponse(payload) {
    if (!payload) {
      return {
        success: false,
        data: null,
        message: 'No response received from server.',
      }
    }

    return {
      success: payload.success ?? true,
      data: this.enrichCustomer(payload.data ?? payload),
      message: payload.message ?? '',
    }
  }

  buildQueryParams(params = {}) {
    const query = {}

    if (params.page) query.page = params.page
    if (params.limit) query.limit = params.limit
    if (params.per_page) query.limit = params.per_page
    if (params.search) query.search = params.search
    if (params.status) query.status = params.status
    if (params.branch_id) query.branch_id = params.branch_id
    if (params.city) query.city = params.city
    if (params.state) query.state = params.state
    if (params.country) query.country = params.country
    if (params.created_from || params.createdFrom) query.created_from = params.created_from || params.createdFrom
    if (params.created_to || params.createdTo) query.created_to = params.created_to || params.createdTo
    if (params.last_order_from || params.lastOrderFrom) query.last_order_from = params.last_order_from || params.lastOrderFrom
    if (params.last_order_to || params.lastOrderTo) query.last_order_to = params.last_order_to || params.lastOrderTo
    if (params.min_total_amount || params.minTotalAmount) query.min_total_amount = params.min_total_amount || params.minTotalAmount
    if (params.max_total_amount || params.maxTotalAmount) query.max_total_amount = params.max_total_amount || params.maxTotalAmount
    if (params.min_paid_amount || params.minPaidAmount) query.min_paid_amount = params.min_paid_amount || params.minPaidAmount
    if (params.max_paid_amount || params.maxPaidAmount) query.max_paid_amount = params.max_paid_amount || params.maxPaidAmount
    if (params.min_remaining_amount || params.minRemainingAmount) query.min_remaining_amount = params.min_remaining_amount || params.minRemainingAmount
    if (params.max_remaining_amount || params.maxRemainingAmount) query.max_remaining_amount = params.max_remaining_amount || params.maxRemainingAmount
    if (params.sortBy) query.sort_by = params.sortBy
    if (params.sortDirection) query.sort_direction = params.sortDirection

    return query
  }

  // Get all customers
  async getCustomers(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.LIST, {
        params: this.buildQueryParams(params),
      })

      const payload = this.transformListResponse(response?.data)

      if (payload.success) {
        return payload
      }

      return this.getMockCustomers(params)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.getMockCustomers(params)
    }
  }

  // Get mock customers data (fallback)
  getMockCustomers(params = {}) {
    let customers = customersData.map((customer) => this.enrichCustomer(customer))
    
    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase()
      customers = customers.filter(c => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm) ||
        c.phone?.toLowerCase().includes(searchTerm) ||
        c.mobile?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Apply status filter
    if (params.status) {
      customers = customers.filter(c => c.status === params.status)
    }
    
    // Apply pagination
    const page = params.page || 1
    const limit = params.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCustomers = customers.slice(startIndex, endIndex)
    
    return {
      success: true,
      data: paginatedCustomers,
      meta: {
        total: customers.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(customers.length / limit),
        hasNext: endIndex < customers.length,
        hasPrev: page > 1,
      },
      message: 'Customers fetched successfully (mock)'
    }
  }

  // Get customer by ID
  async getCustomerById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.GET_BY_ID(id))
      return this.transformItemResponse(response?.data)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.getMockCustomerById(id)
    }
  }

  // Get mock customer by ID (fallback)
  getMockCustomerById(id) {
    const customer = customersData.find(c => c.id === parseInt(id))
    if (customer) {
      return {
        success: true,
        data: this.enrichCustomer(customer),
        message: 'Customer fetched successfully (mock)'
      }
    } else {
      return {
        success: false,
        data: null,
        message: 'Customer not found'
      }
    }
  }

  // Create new customer
  async createCustomer(customerData) {
    try {
      // Transform frontend format to backend format
      const nameParts = this.normalizeName(customerData)
      const backendData = {
        job_code: customerData.job_code || customerData.jobCode || null,
        first_name: nameParts.firstName,
        last_name: nameParts.lastName,
        email: customerData.email,
        phone: customerData.phone || customerData.mobile,
        mobile: customerData.mobile || customerData.phone,
        address: typeof customerData.address === 'string' 
          ? customerData.address 
          : customerData.address?.street || customerData.address,
        city: customerData.city || customerData.address?.city,
        state: customerData.state || customerData.address?.state,
        postal_code: customerData.postalCode || customerData.postal_code || customerData.address?.postalCode,
        country: customerData.country || customerData.address?.country,
        branch_id: customerData.branch_id || customerData.branchId,
        status: customerData.status || 'active',
        dob: customerData.dob,
        anniversary_date: customerData.anniversary_date,
        notes: customerData.notes,
        preferences: customerData.preferences,
        avatar: customerData.avatar,
      }

      const response = await apiClient.post(API_ENDPOINTS.CUSTOMERS.CREATE, backendData)
      return this.transformItemResponse(response?.data)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.createMockCustomer(customerData)
    }
  }

  // Create mock customer (fallback)
  async createMockCustomer(customerData) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Generate new ID
    const existingIds = customersData.map(c => parseInt(c.id)).filter(id => !isNaN(id))
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
    
    // Handle both name format (single name field) and firstName/lastName format
    let firstName = customerData.firstName || ''
    let lastName = customerData.lastName || ''
    
    if (!firstName && !lastName && customerData.name) {
      // Split single name field into firstName and lastName
      const nameParts = customerData.name.trim().split(' ')
      firstName = nameParts[0] || ''
      lastName = nameParts.slice(1).join(' ') || ''
    }
    
    const newCustomer = {
      id: newId,
      customerId: `#${String(newId).padStart(5, '0')}`,
      name: customerData.name || `${firstName} ${lastName}`.trim(),
      firstName: firstName,
      lastName: lastName,
      email: customerData.email || null,
      phone: customerData.mobile || customerData.phone || '',
      mobile: customerData.mobile || customerData.phone || '',
      address: typeof customerData.address === 'string' ? customerData.address : (customerData.address || {}),
      location: customerData.location || {},
      branch_id: customerData.branch_id || null,
      status: customerData.status || 'active',
      totalOrders: 0,
      totalSpent: 0,
      joinedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lastOrderDate: null,
      avatar: customerData.avatar || '',
      notes: customerData.notes || '',
      preferences: customerData.preferences || {},
      dob: customerData.dob || null,
      anniversary_date: customerData.anniversary_date || null
    }
    
    customersData.push(newCustomer)
    const normalized = this.enrichCustomer(newCustomer)
    
    return {
      success: true,
      data: normalized,
      message: 'Customer created successfully'
    }
  }

  // Update customer
  async updateCustomer(id, customerData) {
    try {
      // Transform frontend format to backend format
      const nameParts = this.normalizeName(customerData)
      const backendData = {
        job_code: customerData.job_code || customerData.jobCode || null,
        first_name: nameParts.firstName,
        last_name: nameParts.lastName,
        email: customerData.email,
        phone: customerData.phone || customerData.mobile,
        mobile: customerData.mobile || customerData.phone,
        address: typeof customerData.address === 'string' 
          ? customerData.address 
          : customerData.address?.street || customerData.address,
        city: customerData.city || customerData.address?.city,
        state: customerData.state || customerData.address?.state,
        postal_code: customerData.postalCode || customerData.postal_code || customerData.address?.postalCode,
        country: customerData.country || customerData.address?.country,
        branch_id: customerData.branch_id || customerData.branchId,
        status: customerData.status,
        dob: customerData.dob,
        anniversary_date: customerData.anniversary_date,
        notes: customerData.notes,
        preferences: customerData.preferences,
        avatar: customerData.avatar,
      }

      const response = await apiClient.put(API_ENDPOINTS.CUSTOMERS.UPDATE(id), backendData)
      return this.transformItemResponse(response?.data)
    } catch (error) {
      // Check for 403 or permission errors - don't fallback to mock
      if (error?.response?.status === 403 || error?.status === 403) {
        return {
          success: false,
          data: null,
          status: 403,
          message: error?.response?.data?.message || error?.message || 'Insufficient permissions'
        }
      }
      // For other errors, use error handler
      return handleApiError(error)
    }
  }

  // Update mock customer (fallback)
  async updateMockCustomer(id, customerData) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const customerIndex = customersData.findIndex(c => c.id === parseInt(id))
    if (customerIndex !== -1) {
      const existingCustomer = customersData[customerIndex]
      
      // Merge all fields from customerData, keeping existing values if not provided
      customersData[customerIndex] = {
        ...existingCustomer,
        ...customerData, // Spread new data first
        // Override with existing values if new data is undefined (to preserve existing data)
        id: existingCustomer.id, // Never change ID
        customerId: customerData.customerId !== undefined ? customerData.customerId : existingCustomer.customerId,
        firstName: customerData.firstName !== undefined ? customerData.firstName : existingCustomer.firstName,
        lastName: customerData.lastName !== undefined ? customerData.lastName : existingCustomer.lastName,
        name: customerData.name !== undefined ? customerData.name : (existingCustomer.name || `${existingCustomer.firstName || ''} ${existingCustomer.lastName || ''}`.trim()),
        email: customerData.email !== undefined ? customerData.email : existingCustomer.email,
        phone: customerData.phone !== undefined ? customerData.phone : existingCustomer.phone,
        mobile: customerData.mobile !== undefined ? customerData.mobile : (existingCustomer.mobile || existingCustomer.phone),
        address: customerData.address !== undefined ? customerData.address : existingCustomer.address,
        location: customerData.location !== undefined ? customerData.location : existingCustomer.location,
        branch_id: customerData.branch_id !== undefined ? customerData.branch_id : existingCustomer.branch_id,
        status: customerData.status !== undefined ? customerData.status : existingCustomer.status,
        avatar: customerData.avatar !== undefined ? customerData.avatar : existingCustomer.avatar,
        notes: customerData.notes !== undefined ? customerData.notes : existingCustomer.notes,
        preferences: customerData.preferences !== undefined ? customerData.preferences : existingCustomer.preferences,
        // Order-related fields
        totalOrders: customerData.totalOrders !== undefined ? customerData.totalOrders : existingCustomer.totalOrders,
        total_orders: customerData.total_orders !== undefined ? customerData.total_orders : (existingCustomer.total_orders || existingCustomer.totalOrders),
        total_services: customerData.total_services !== undefined ? customerData.total_services : (existingCustomer.total_services || existingCustomer.total_orders || existingCustomer.totalOrders),
        totalSpent: customerData.totalSpent !== undefined ? customerData.totalSpent : existingCustomer.totalSpent,
        total_amount: customerData.total_amount !== undefined ? customerData.total_amount : (existingCustomer.total_amount || existingCustomer.totalSpent),
        total_earnings: customerData.total_earnings !== undefined ? customerData.total_earnings : (existingCustomer.total_earnings || existingCustomer.total_amount || existingCustomer.totalSpent),
        paid_amount: customerData.paid_amount !== undefined ? customerData.paid_amount : existingCustomer.paid_amount,
        remaining_amount: customerData.remaining_amount !== undefined ? customerData.remaining_amount : existingCustomer.remaining_amount,
        wallet_balance: customerData.wallet_balance !== undefined ? customerData.wallet_balance : existingCustomer.wallet_balance,
        lastOrderDate: customerData.lastOrderDate !== undefined ? customerData.lastOrderDate : existingCustomer.lastOrderDate,
        dob: customerData.dob !== undefined ? customerData.dob : existingCustomer.dob,
        anniversary_date: customerData.anniversary_date !== undefined ? customerData.anniversary_date : existingCustomer.anniversary_date,
        joinedDate: customerData.joinedDate !== undefined ? customerData.joinedDate : existingCustomer.joinedDate,
        createdAt: existingCustomer.createdAt || existingCustomer.created_at || existingCustomer.joinedDate, // Preserve creation date
        created_at: existingCustomer.created_at || existingCustomer.createdAt || existingCustomer.joinedDate,
        updatedAt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const normalized = this.enrichCustomer(customersData[customerIndex])

      return {
        success: true,
        data: normalized,
        message: 'Customer updated successfully'
      }
    } else {
      return {
        success: false,
        data: null,
        message: 'Customer not found'
      }
    }
  }

  // Delete customer
  async deleteCustomer(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CUSTOMERS.DELETE(id))
      return this.transformItemResponse(response?.data)
    } catch (error) {
      // Check for 403 or permission errors - don't fallback to mock
      if (error?.response?.status === 403 || error?.status === 403) {
        return {
          success: false,
          data: null,
          status: 403,
          message: error?.response?.data?.message || error?.message || 'Insufficient permissions'
        }
      }
      // For other errors, use error handler
      return handleApiError(error)
    }
  }

  // Delete mock customer (fallback)
  async deleteMockCustomer(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const customerIndex = customersData.findIndex(c => c.id === parseInt(id))
    if (customerIndex !== -1) {
      const deletedCustomer = customersData.splice(customerIndex, 1)[0]
      
      return {
        success: true,
        data: deletedCustomer,
        message: 'Customer deleted successfully'
      }
    } else {
      return {
        success: false,
        data: null,
        message: 'Customer not found'
      }
    }
  }

  // Export customer to PDF
  async exportCustomerPdf(customerId, params = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(params).forEach(key => {
        if (params[key]) queryParams.append(key, params[key])
      })
      
      const url = `${API_ENDPOINTS.CUSTOMERS.EXPORT_PDF(customerId)}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await apiClient.get(url, { responseType: 'blob' })
      
      // Extract filename from Content-Disposition header
      let filename = `customer_${customerId}.pdf`
      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition']
      if (contentDisposition) {
        // Try to extract filename (handles both quoted and unquoted, and URL-encoded)
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '').trim()
          // Decode URL-encoded filename if needed
          try {
            filename = decodeURIComponent(filename)
          } catch (e) {
            // If decoding fails, use as-is
          }
        }
      }
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url_blob = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url_blob
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url_blob)
      
      return { success: true, message: 'PDF exported successfully' }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get customer statistics
  async getCustomerStats() {
    try {
      // Calculate stats from customers list
      const response = await this.getCustomers({ limit: 1000 })
      if (response.success && response.data) {
        const customers = response.data
        const totalCustomers = customers.length
        const activeCustomers = customers.filter(c => c.status === 'active').length
        const now = new Date()
        const newThisMonth = customers.filter(c => {
          const joinedDate = new Date(c.joinedDate || c.created_at)
          return joinedDate.getMonth() === now.getMonth() && joinedDate.getFullYear() === now.getFullYear()
        }).length

        return {
          success: true,
          data: {
            totalCustomers,
            activeCustomers,
            newThisMonth
          },
          message: 'Customer statistics fetched successfully'
        }
      }
      return this.getMockCustomerStats()
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.getMockCustomerStats()
    }
  }

  // Get mock customer statistics (fallback)
  getMockCustomerStats() {
    
    const totalCustomers = customersData.length
    const activeCustomers = customersData.filter(c => c.status === 'active').length
    const newThisMonth = customersData.filter(c => {
      const joinedDate = new Date(c.joinedDate)
      const now = new Date()
      return joinedDate.getMonth() === now.getMonth() && joinedDate.getFullYear() === now.getFullYear()
    }).length
    
    return {
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        newThisMonth
      },
      message: 'Customer statistics fetched successfully'
    }
  }

  // Search customers
  async searchCustomers(searchTerm, filters = {}) {
    return this.getCustomers({ search: searchTerm, ...filters })
  }

  // Search mock customers (fallback)
  getMockSearchCustomers(searchTerm, filters = {}) {
    
    let filteredCustomers = customersData
    
    if (searchTerm) {
      filteredCustomers = filteredCustomers.filter(c => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filters.status) {
      filteredCustomers = filteredCustomers.filter(c => c.status === filters.status)
    }
    
    if (filters.location) {
      filteredCustomers = filteredCustomers.filter(c => 
        c.location.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        c.location.country?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }
    
    if (filters.registrationDate) {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filters.registrationDate) {
        case 'today':
          filterDate.setDate(now.getDate() - 1)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          break
      }
      
      filteredCustomers = filteredCustomers.filter(c => new Date(c.joinedDate) >= filterDate)
    }
    
    return {
      success: true,
      data: filteredCustomers,
      message: 'Customers searched successfully'
    }
  }

  // Export customers
  async exportCustomers(format = 'csv', filters = {}) {
    try {
      const response = await this.getCustomers({ ...filters, limit: 10000 })
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Customers exported successfully'
        }
      }
      return this.exportMockCustomers(format, filters)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.exportMockCustomers(format, filters)
    }
  }

  // Export mock customers (fallback)
  exportMockCustomers(format = 'csv', filters = {}) {
    const filteredCustomers = customersData
    return {
      success: true,
      data: filteredCustomers,
      message: 'Customers exported successfully (mock)'
    }
  }
}

// Create and export singleton instance
const customerService = new CustomerService()
export { customerService }
export default customerService
