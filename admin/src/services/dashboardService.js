import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'

const dashboardService = {
  async getSummary(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.startDate) queryParams.append('start_date', params.startDate)
      if (params.endDate) queryParams.append('end_date', params.endDate)

      const url = `/dashboard/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getRevenueTrend(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.range) queryParams.append('range', params.range)
      if (params.endDate) queryParams.append('end_date', params.endDate)

      const url = `/dashboard/revenue-trend${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getRecentActivities() {
    try {
      const response = await apiClient.get('/dashboard/recent-activities')
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getOrdersSummary(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.startDate) queryParams.append('start_date', params.startDate)
      if (params.endDate) queryParams.append('end_date', params.endDate)

      const url = `/dashboard/orders-summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getCustomersSummary(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.startDate) queryParams.append('start_date', params.startDate)
      if (params.endDate) queryParams.append('end_date', params.endDate)

      const url = `/dashboard/customers-summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getFinancialSummary(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.startDate) queryParams.append('start_date', params.startDate)
      if (params.endDate) queryParams.append('end_date', params.endDate)

      const url = `/dashboard/financial-summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getTopPaidCustomers(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.limit) queryParams.append('limit', params.limit)

      const url = `/dashboard/top-paid-customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getUpcomingEvents(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.days) queryParams.append('days', params.days)

      const url = `/dashboard/upcoming-events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getUpcomingOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.limit) queryParams.append('limit', params.limit)

      const url = `/dashboard/upcoming-orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getCompanyHealthChart(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.months) queryParams.append('months', params.months)

      const url = `/dashboard/company-health-chart${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getLastTransactions(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.limit) queryParams.append('limit', params.limit)

      const url = `/dashboard/last-transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },
}

export default dashboardService

