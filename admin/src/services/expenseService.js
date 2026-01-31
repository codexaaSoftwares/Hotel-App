// Expense Service - API calls for expense management
import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'

class ExpenseService {
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
    if (params.search) query.search = params.search
    if (params.categoryId) query.category_id = params.categoryId
    if (params.category_id) query.category_id = params.category_id
    if (params.paymentMethod) query.payment_method = params.paymentMethod
    if (params.payment_method) query.payment_method = params.payment_method
    if (params.startDate) query.start_date = params.startDate
    if (params.start_date) query.start_date = params.start_date
    if (params.endDate) query.end_date = params.endDate
    if (params.end_date) query.end_date = params.end_date
    if (params.sortBy) query.sort_by = params.sortBy
    if (params.sortDirection) query.sort_direction = params.sortDirection

    return query
  }

  // Get all expenses
  async getExpenses(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EXPENSES.LIST, {
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
        message: 'Failed to fetch expenses.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: [],
        meta: null,
        message: error?.response?.data?.message || 'Failed to fetch expenses.',
      }
    }
  }

  // Get expense by ID
  async getExpenseById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EXPENSES.GET_BY_ID(id))
      const payload = this.transformItemResponse(response?.data)

      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to fetch expense.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to fetch expense.',
      }
    }
  }

  // Create new expense
  async createExpense(expenseData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.EXPENSES.CREATE, expenseData)
      const payload = this.transformItemResponse(response?.data)
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to create expense.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to create expense.',
        errors: error?.response?.data?.errors || {},
      }
    }
  }

  // Update expense
  async updateExpense(id, expenseData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.EXPENSES.UPDATE(id), expenseData)
      const payload = this.transformItemResponse(response?.data)
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to update expense.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to update expense.',
        errors: error?.response?.data?.errors || {},
      }
    }
  }

  // Delete expense
  async deleteExpense(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.EXPENSES.DELETE(id))
      const payload = this.transformItemResponse(response?.data ?? { success: true })
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        message: 'Failed to delete expense.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete expense.',
      }
    }
  }

  // Get all expense categories
  async getExpenseCategories(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EXPENSE_CATEGORIES.LIST, {
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
        message: 'Failed to fetch expense categories.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: [],
        meta: null,
        message: error?.response?.data?.message || 'Failed to fetch expense categories.',
      }
    }
  }

  // Create expense category
  async createExpenseCategory(categoryData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.EXPENSE_CATEGORIES.CREATE, categoryData)
      const payload = this.transformItemResponse(response?.data)
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to create expense category.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to create expense category.',
        errors: error?.response?.data?.errors || {},
      }
    }
  }

  // Update expense category
  async updateExpenseCategory(id, categoryData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.EXPENSE_CATEGORIES.UPDATE(id), categoryData)
      const payload = this.transformItemResponse(response?.data)
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        data: null,
        message: 'Failed to update expense category.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to update expense category.',
        errors: error?.response?.data?.errors || {},
      }
    }
  }

  // Delete expense category
  async deleteExpenseCategory(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.EXPENSE_CATEGORIES.DELETE(id))
      const payload = this.transformItemResponse(response?.data ?? { success: true })
      
      if (payload.success) {
        return payload
      }

      return {
        success: false,
        message: 'Failed to delete expense category.',
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to delete expense category.',
      }
    }
  }
}

// Create and export singleton instance
const expenseService = new ExpenseService()
export default expenseService

