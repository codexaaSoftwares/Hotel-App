// Room Service - API service for Room Management
import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'

// Normalize room category data from API to frontend format
const normalizeRoomCategory = (category) => {
  return {
    id: category.id,
    name: category.name || '',
    description: category.description || '',
    base_price: category.basePrice || category.base_price || 0,
    max_adults: category.maxAdults || category.max_adults || 2,
    max_children: category.maxChildren || category.max_children || 0,
    status: category.status || 'active',
    created_at: category.createdAt || category.created_at,
    updated_at: category.updatedAt || category.updated_at,
  }
}

const roomService = {
  /**
   * Get all room categories with pagination, filtering, and searching
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Response with categories array and meta
   */
  async getRoomCategories(params = {}) {
    try {
      const response = await apiClient.get('/room-categories', { params })
      return {
        success: true,
        data: response.data.data.map((category) => normalizeRoomCategory(category)),
        meta: response.data.meta,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get a single room category by ID
   * @param {number} id - Category ID
   * @returns {Promise<Object>} Response with category data
   */
  async getRoomCategoryById(id) {
    try {
      const response = await apiClient.get(`/room-categories/${id}`)
      return {
        success: true,
        data: normalizeRoomCategory(response.data.data),
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Create a new room category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Response with created category
   */
  async createRoomCategory(categoryData) {
    try {
      const response = await apiClient.post('/room-categories', {
        name: categoryData.name,
        description: categoryData.description || null,
        base_price: categoryData.base_price,
        max_adults: categoryData.max_adults,
        max_children: categoryData.max_children,
        status: categoryData.status || 'active',
      })
      return {
        success: true,
        data: normalizeRoomCategory(response.data.data),
        message: response.data.message || 'Room category created successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Update an existing room category
   * @param {number} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>} Response with updated category
   */
  async updateRoomCategory(id, categoryData) {
    try {
      const payload = {}
      if (categoryData.name !== undefined) payload.name = categoryData.name
      if (categoryData.description !== undefined) payload.description = categoryData.description || null
      if (categoryData.base_price !== undefined) payload.base_price = categoryData.base_price
      if (categoryData.max_adults !== undefined) payload.max_adults = categoryData.max_adults
      if (categoryData.max_children !== undefined) payload.max_children = categoryData.max_children
      if (categoryData.status !== undefined) payload.status = categoryData.status

      const response = await apiClient.put(`/room-categories/${id}`, payload)
      return {
        success: true,
        data: normalizeRoomCategory(response.data.data),
        message: response.data.message || 'Room category updated successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Delete a room category
   * @param {number} id - Category ID
   * @returns {Promise<Object>} Response with success message
   */
  async deleteRoomCategory(id) {
    try {
      const response = await apiClient.delete(`/room-categories/${id}`)
      return {
        success: true,
        message: response.data.message || 'Room category deleted successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },
}

export default roomService

