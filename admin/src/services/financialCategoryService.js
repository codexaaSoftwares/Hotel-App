// Financial Category Service - API calls for financial category management
import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'
import { handleApiError } from '../utils/errorHandler'

class FinancialCategoryService {
  // Get all financial categories
  async getCategories(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.search) queryParams.append('search', params.search)
      if (params.type) queryParams.append('type', params.type)
      if (params.status) queryParams.append('status', params.status)
      if (params.sort_by || params.sortBy) queryParams.append('sort_by', params.sort_by || params.sortBy)
      if (params.sort_direction || params.sortDirection) queryParams.append('sort_direction', params.sort_direction || params.sortDirection)

      const url = `${API_ENDPOINTS.FINANCIAL_CATEGORIES.BASE}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await apiClient.get(url)

      let categories = []
      const responseData = response.data?.data ?? response.data

      if (Array.isArray(responseData)) {
        categories = responseData
      } else if (Array.isArray(responseData?.data)) {
        categories = responseData.data
      }
      
      return {
        success: true,
        data: categories,
        meta: response.data?.meta || responseData?.meta || {},
        message: response.data?.message || 'Categories retrieved successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get category by ID
  async getCategoryById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FINANCIAL_CATEGORIES.GET_BY_ID(id))
      
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Category retrieved successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Create new category
  async createCategory(categoryData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.FINANCIAL_CATEGORIES.CREATE, categoryData)
      
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Category created successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Update category
  async updateCategory(id, categoryData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.FINANCIAL_CATEGORIES.UPDATE(id), categoryData)
      
      return {
        success: response.data?.success ?? true,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Category updated successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Delete category
  async deleteCategory(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.FINANCIAL_CATEGORIES.DELETE(id))

      return {
        success: response.data?.success ?? true,
        data: response.data?.data || null,
        message: response.data?.message || 'Category deleted successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get categories by type (helper method)
  async getCategoriesByType(type) {
    return this.getCategories({ type, status: 'active' })
  }
}

const financialCategoryService = new FinancialCategoryService()
export default financialCategoryService
