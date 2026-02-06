// Staff Service - API calls for staff management
import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'

class StaffService {
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
    if (params.department) query.department = params.department
    if (params.salary_type) query.salary_type = params.salary_type
    if (params.status) query.status = params.status
    if (params.sortBy) query.sort_by = params.sortBy
    if (params.sortDirection) query.sort_direction = params.sortDirection

    return query
  }

  buildSalaryPaymentQueryParams(params = {}) {
    const query = {}

    if (params.page) query.page = params.page
    if (params.limit) query.limit = params.limit
    if (params.per_page) query.limit = params.per_page
    if (params.search) query.search = params.search
    if (params.month) query.month = params.month
    if (params.year) query.year = params.year
    if (params.staff_id) query.staff_id = params.staff_id
    if (params.start_date) query.start_date = params.start_date
    if (params.end_date) query.end_date = params.end_date
    if (params.sortBy) query.sort_by = params.sortBy
    if (params.sortDirection) query.sort_direction = params.sortDirection

    return query
  }

  // Get all staff
  async getStaff(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.STAFF.LIST, {
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
        message: 'Failed to fetch staff.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: [],
        meta: null,
        message: error?.response?.data?.message || 'Failed to fetch staff.',
      }
    }
  }

  // Get staff by ID
  async getStaffById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.STAFF.GET_BY_ID(id))
      const payload = this.transformItemResponse(response?.data)

      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to fetch staff.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to fetch staff.',
      }
    }
  }

  // Create new staff
  async createStaff(staffData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.STAFF.CREATE, staffData)
      const payload = this.transformItemResponse(response?.data)
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to create staff.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to create staff.',
        errors: error?.response?.data?.errors || {},
      }
    }
  }

  // Update staff
  async updateStaff(id, staffData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.STAFF.UPDATE(id), staffData)
      const payload = this.transformItemResponse(response?.data)
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to update staff.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to update staff.',
        errors: error?.response?.data?.errors || {},
      }
    }
  }

  // Delete staff
  async deleteStaff(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.STAFF.DELETE(id))
      const payload = this.transformItemResponse(response?.data ?? { success: true })
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        message: 'Failed to delete staff.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete staff.',
      }
    }
  }

  // Get salary payments
  async getSalaryPayments(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SALARY_PAYMENTS.LIST, {
        params: this.buildSalaryPaymentQueryParams(params),
      })

      const payload = this.transformListResponse(response?.data)

      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: [],
        meta: null,
        message: 'Failed to fetch salary payments.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: [],
        meta: null,
        message: error?.response?.data?.message || 'Failed to fetch salary payments.',
      }
    }
  }

  // Get salary payments by staff ID
  async getSalaryPaymentsByStaff(staffId, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SALARY_PAYMENTS.GET_BY_STAFF(staffId), {
        params: this.buildSalaryPaymentQueryParams(params),
      })

      const payload = this.transformListResponse(response?.data)

      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: [],
        meta: null,
        message: 'Failed to fetch salary payments.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: [],
        meta: null,
        message: error?.response?.data?.message || 'Failed to fetch salary payments.',
      }
    }
  }

  // Get salary payment by ID
  async getSalaryPaymentById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SALARY_PAYMENTS.GET_BY_ID(id))
      const payload = this.transformItemResponse(response?.data)

      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to fetch salary payment.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to fetch salary payment.',
      }
    }
  }

  // Create salary payment
  async createSalaryPayment(salaryPaymentData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SALARY_PAYMENTS.CREATE, salaryPaymentData)
      const payload = this.transformItemResponse(response?.data)
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to create salary payment.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to create salary payment.',
        errors: error?.response?.data?.errors || {},
      }
    }
  }

  // Update salary payment
  async updateSalaryPayment(id, salaryPaymentData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.SALARY_PAYMENTS.UPDATE(id), salaryPaymentData)
      const payload = this.transformItemResponse(response?.data)
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to update salary payment.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to update salary payment.',
        errors: error?.response?.data?.errors || {},
      }
    }
  }

  // Delete salary payment
  async deleteSalaryPayment(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.SALARY_PAYMENTS.DELETE(id))
      const payload = this.transformItemResponse(response?.data ?? { success: true })
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        message: 'Failed to delete salary payment.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete salary payment.',
      }
    }
  }

  /**
   * Export salary payments report as PDF
   * @param {object} params - Export parameters (search, month, year, etc.)
   */
  async exportSalaryPaymentsReport(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key])
        }
      })
      
      const url = `/salary-payments/export-report${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await apiClient.get(url, { responseType: 'blob' })
      
      let filename = `salary_payments_report_${new Date().toISOString().split('T')[0]}.pdf`
      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '').trim()
          try {
            filename = decodeURIComponent(filename)
          } catch (e) {
            // If decoding fails, use as-is
          }
        }
      }
      
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url_blob = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url_blob
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url_blob)
      
      return { success: true, message: 'Salary payments report exported successfully' }
    } catch (error) {
      console.error('Error exporting salary payments report:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export salary payments report',
      }
    }
  }
}

// Create and export singleton instance
const staffService = new StaffService()
export default staffService
