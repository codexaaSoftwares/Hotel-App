// Report Service - API calls for reports
import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'

class ReportService {
  /**
   * Get Company Health Report
   * @param {Object} params - Report parameters
   * @param {string} params.start_date - Start date (YYYY-MM-DD)
   * @param {string} params.end_date - End date (YYYY-MM-DD)
   */
  async getCompanyHealthReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/company-health', { params })
      return {
        success: true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Get Sales Report
   * @param {Object} params - Report parameters
   * @param {string} params.start_date - Start date (YYYY-MM-DD)
   * @param {string} params.end_date - End date (YYYY-MM-DD)
   * @param {string} params.payment_status - Payment status filter (all, paid, pending, partial)
   * @param {string} params.payment_method - Payment method filter (all, cash, upi, card, wallet)
   * @param {number} params.table_id - Optional table ID filter
   * @param {number} params.customer_id - Optional customer ID filter
   */
  async getSalesReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/sales', { params })
      return {
        success: true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Get Expense Report
   * @param {Object} params - Report parameters
   * @param {string} params.start_date - Start date (YYYY-MM-DD)
   * @param {string} params.end_date - End date (YYYY-MM-DD)
   * @param {number} params.category_id - Optional category ID filter
   * @param {string} params.payment_method - Payment method filter (all, cash, upi, card, bank)
   */
  async getExpenseReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/expenses', { params })
      return {
        success: true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Get Customer Pending (Udhar) Report
   * @param {Object} params - Report parameters
   * @param {string} params.start_date - Optional start date (YYYY-MM-DD)
   * @param {string} params.end_date - Optional end date (YYYY-MM-DD)
   * @param {number} params.customer_id - Optional customer ID filter
   * @param {string} params.status - Status filter (all, active, inactive)
   */
  async getCustomerPendingReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/customer-pending', { params })
      return {
        success: true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Get Staff & Salary Report
   * @param {Object} params - Report parameters
   * @param {string} params.start_date - Start date (YYYY-MM-DD)
   * @param {string} params.end_date - End date (YYYY-MM-DD)
   * @param {number} params.staff_id - Optional staff ID filter
   * @param {string} params.department - Optional department filter
   * @param {number} params.month - Optional month filter (1-12)
   * @param {number} params.year - Optional year filter
   */
  async getStaffSalaryReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/staff-salary', { params })
      return {
        success: true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Get Category-wise Item Sales Report
   * @param {Object} params - Report parameters
   * @param {string} params.start_date - Start date (YYYY-MM-DD)
   * @param {string} params.end_date - End date (YYYY-MM-DD)
   * @param {number} params.category_id - Optional category ID filter
   * @param {string} params.item_status - Optional item status filter (all, active, inactive)
   */
  async getCategoryWiseItemReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/category-wise-items', { params })
      return {
        success: true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  async getLedgerReport(params = {}) {
    // Redirect to company health report
    return this.getCompanyHealthReport(params)
  }

  async getStaffReport(params = {}) {
    // Redirect to staff salary report
    return this.getStaffSalaryReport(params)
  }

  // Export report
  async exportReport(type, format = 'csv', params = {}) {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('format', format)
      
      Object.keys(params).forEach(key => {
        if (params[key]) queryParams.append(key, params[key])
      })

      const endpoint = `/reports/${type}/export?${queryParams.toString()}`
      const response = await apiClient.get(endpoint, { responseType: 'blob' })
      
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * Export Company Health Report as PDF
   * @param {Object} params - Report parameters
   * @param {string} params.start_date - Start date (YYYY-MM-DD)
   * @param {string} params.end_date - End date (YYYY-MM-DD)
   */
  async exportCompanyHealthReportPdf(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(params).forEach(key => {
        if (params[key]) queryParams.append(key, params[key])
      })
      
      const url = `/reports/company-health/export-pdf${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await apiClient.get(url, { responseType: 'blob' })
      
      // Extract filename from Content-Disposition header
      let filename = `company_health_report_${params.start_date || 'report'}_${params.end_date || 'report'}.pdf`
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
}

// Create and export singleton instance
const reportService = new ReportService()
export default reportService

