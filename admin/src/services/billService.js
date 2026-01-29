// Bill Service - API calls for bill management
import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'

class BillService {
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
    if (params.per_page) query.per_page = params.per_page
    if (params.search) query.search = params.search
    if (params.status) query.status = params.status
    if (params.payment_status) query.payment_status = params.payment_status
    if (params.payment_method) {
      // Handle null payment method (wallet transactions)
      if (params.payment_method === 'null') {
        query.payment_method = null
      } else {
        query.payment_method = params.payment_method
      }
    }
    if (params.table_id) query.table_id = params.table_id
    if (params.customer_id) query.customer_id = params.customer_id
    if (params.start_date) query.start_date = params.start_date
    if (params.end_date) query.end_date = params.end_date
    if (params.sortBy) query.sort_by = params.sortBy
    if (params.sortDirection) query.sort_direction = params.sortDirection

    return query
  }

  // Get all bills
  async getBills(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BILLS.LIST, {
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
        message: 'Failed to fetch bills.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: [],
        meta: null,
        message: error?.response?.data?.message || 'Failed to fetch bills.',
      }
    }
  }

  // Get bill by ID
  async getBillById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BILLS.GET_BY_ID(id))

      return this.transformItemResponse(response?.data)
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to fetch bill.',
      }
    }
  }

  // Create new bill
  async createBill(billData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BILLS.CREATE, billData)

      return this.transformItemResponse(response?.data)
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to create bill.',
      }
    }
  }

  // Update bill
  async updateBill(id, billData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.BILLS.UPDATE(id), billData)

      return this.transformItemResponse(response?.data)
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to update bill.',
      }
    }
  }

  // Delete bill
  async deleteBill(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.BILLS.DELETE(id))

      return this.transformItemResponse(response?.data)
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to delete bill.',
      }
    }
  }

  // Get bills by table
  async getBillsByTable(tableId, params = {}) {
    try {
      const query = {}
      if (params.status) query.status = params.status
      if (params.include_draft !== undefined) query.include_draft = params.include_draft

      const response = await apiClient.get(API_ENDPOINTS.BILLS.GET_BY_TABLE(tableId), {
        params: query,
      })

      return this.transformItemResponse(response?.data)
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: [],
        message: error?.response?.data?.message || 'Failed to fetch bills for table.',
      }
    }
  }

  // Process payment
  async processPayment(billId, paymentData) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.BILLS.PROCESS_PAYMENT(billId),
        paymentData
      )

      return this.transformItemResponse(response?.data)
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to process payment.',
      }
    }
  }
}

export default new BillService()

