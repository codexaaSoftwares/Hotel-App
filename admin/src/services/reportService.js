// Report Service - API calls for reports
import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'

class ReportService {
  /**
   * Get Company Health Report
   * @param {Object} params - Report parameters
   * @param {string} params.start_date - Start date (YYYY-MM-DD)
   * @param {string} params.end_date - End date (YYYY-MM-DD)
   * @param {number} params.branch_id - Optional branch ID filter
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

  // Legacy methods (kept for backward compatibility)
  async getSalesReport(params = {}) {
    // Redirect to company health report
    return this.getCompanyHealthReport(params)
  }

  async getLedgerReport(params = {}) {
    // Redirect to company health report
    return this.getCompanyHealthReport(params)
  }

  async getBranchReport(params = {}) {
    // Redirect to company health report with branch filter
    return this.getCompanyHealthReport(params)
  }

  async getStaffReport(params = {}) {
    // Not implemented yet
    return {
      success: false,
      message: 'Staff report not implemented',
    }
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
   * @param {number} params.branch_id - Optional branch ID filter
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

