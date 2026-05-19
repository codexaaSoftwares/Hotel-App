// Customer Service - API calls for customer management
import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'

class CustomerService {
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

    return {
      success: payload.success ?? true,
      data,
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
      links: payload.links ?? null,
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
      data: payload.data ?? payload,
      message: payload.message ?? '',
    }
  }

  buildQueryParams(params = {}) {
    const query = {}

    if (params.page) query.page = params.page
    if (params.limit) query.limit = params.limit
    if (params.per_page) query.limit = params.per_page
    if (params.search) query.search = params.search
    if (params.customer_type) query.customer_type = params.customer_type
    if (params.status) query.status = params.status
    if (params.city) query.city = params.city
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

      return {
        success: false,
        data: [],
        meta: null,
        message: 'Failed to fetch customers.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: [],
        meta: null,
        message: error?.response?.data?.message || 'Failed to fetch customers.',
      }
    }
  }

  // Get customer by ID
  async getCustomerById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.GET_BY_ID(id))
      const payload = this.transformItemResponse(response?.data)

      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to fetch customer.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to fetch customer.',
      }
    }
  }

  // Create new customer
  async createCustomer(customerData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CUSTOMERS.CREATE, customerData)
      const payload = this.transformItemResponse(response?.data)
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to create customer.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to create customer.',
        errors: error?.response?.data?.errors || {},
      }
    }
  }

  // Update customer
  async updateCustomer(id, customerData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.CUSTOMERS.UPDATE(id), customerData)
      const payload = this.transformItemResponse(response?.data)
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to update customer.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to update customer.',
        errors: error?.response?.data?.errors || {},
      }
    }
  }

  // Delete customer
  async deleteCustomer(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CUSTOMERS.DELETE(id))
      const payload = this.transformItemResponse(response?.data ?? { success: true })
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        message: 'Failed to delete customer.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete customer.',
      }
    }
  }

  // Validate customer data
  validateCustomerData(customerData, isUpdate = false) {
    const errors = {}

    if (!isUpdate || customerData.name !== undefined) {
      if (!customerData.name || customerData.name.trim() === '') {
        errors.name = 'Customer name is required'
      }
    }

    if (customerData.mobile !== undefined && customerData.mobile) {
      const mobileRegex = /^[0-9]{10}$/
      if (!mobileRegex.test(customerData.mobile.replace(/\D/g, ''))) {
        errors.mobile = 'Mobile number must be 10 digits'
      }
    }

    if (customerData.email !== undefined && customerData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerData.email)) {
        errors.email = 'Invalid email address'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }
}

// Create and export singleton instance
const customerService = new CustomerService()
export default customerService

