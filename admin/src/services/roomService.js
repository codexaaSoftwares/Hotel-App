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

  // Room Management Methods
  /**
   * Normalize room data from API to frontend format
   */
  normalizeRoom(room) {
    return {
      id: room.id,
      room_number: room.roomNumber || room.room_number || '',
      room_category_id: room.roomCategoryId || room.room_category_id || null,
      room_category: room.roomCategory || null,
      floor_number: room.floorNumber || room.floor_number || 1,
      bed_type: room.bedType || room.bed_type || 'double',
      max_occupancy: room.maxOccupancy || room.max_occupancy || 2,
      room_price: room.roomPrice !== undefined ? room.roomPrice : (room.room_price !== undefined ? room.room_price : null),
      effective_price: room.effectivePrice || room.effective_price || 0,
      status: room.status || 'available',
      notes: room.notes || '',
      is_active: room.isActive !== undefined ? room.isActive : (room.is_active !== undefined ? room.is_active : true),
      created_at: room.createdAt || room.created_at,
      updated_at: room.updatedAt || room.updated_at,
    }
  },

  /**
   * Get all rooms with pagination, filtering, and searching
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Response with rooms array and meta
   */
  async getRooms(params = {}) {
    try {
      const response = await apiClient.get('/rooms', { params })
      return {
        success: true,
        data: response.data.data.map((room) => this.normalizeRoom(room)),
        meta: response.data.meta,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get a single room by ID
   * @param {number} id - Room ID
   * @returns {Promise<Object>} Response with room data
   */
  async getRoomById(id) {
    try {
      const response = await apiClient.get(`/rooms/${id}`)
      return {
        success: true,
        data: this.normalizeRoom(response.data.data),
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Create a new room
   * @param {Object} roomData - Room data
   * @returns {Promise<Object>} Response with created room
   */
  async createRoom(roomData) {
    try {
      const response = await apiClient.post('/rooms', {
        room_number: roomData.room_number,
        room_category_id: roomData.room_category_id,
        floor_number: roomData.floor_number,
        bed_type: roomData.bed_type,
        max_occupancy: roomData.max_occupancy,
        room_price: roomData.room_price || null,
        status: roomData.status || 'available',
        notes: roomData.notes || null,
        is_active: roomData.is_active !== undefined ? roomData.is_active : true,
      })
      return {
        success: true,
        data: this.normalizeRoom(response.data.data),
        message: response.data.message || 'Room created successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Update an existing room
   * @param {number} id - Room ID
   * @param {Object} roomData - Updated room data
   * @returns {Promise<Object>} Response with updated room
   */
  async updateRoom(id, roomData) {
    try {
      const payload = {}
      if (roomData.room_number !== undefined) payload.room_number = roomData.room_number
      if (roomData.room_category_id !== undefined) payload.room_category_id = roomData.room_category_id
      if (roomData.floor_number !== undefined) payload.floor_number = roomData.floor_number
      if (roomData.bed_type !== undefined) payload.bed_type = roomData.bed_type
      if (roomData.max_occupancy !== undefined) payload.max_occupancy = roomData.max_occupancy
      if (roomData.room_price !== undefined) payload.room_price = roomData.room_price || null
      if (roomData.status !== undefined) payload.status = roomData.status
      if (roomData.notes !== undefined) payload.notes = roomData.notes || null
      if (roomData.is_active !== undefined) payload.is_active = roomData.is_active

      const response = await apiClient.put(`/rooms/${id}`, payload)
      return {
        success: true,
        data: this.normalizeRoom(response.data.data),
        message: response.data.message || 'Room updated successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Delete a room
   * @param {number} id - Room ID
   * @returns {Promise<Object>} Response with success message
   */
  async deleteRoom(id) {
    try {
      const response = await apiClient.delete(`/rooms/${id}`)
      return {
        success: true,
        message: response.data.message || 'Room deleted successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Export rooms as PDF
   * @param {Object} params - Query parameters (search, status, category_id, floor_number, is_active)
   * @returns {Promise<Object>} Response with success status
   */
  async exportRooms(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key])
        }
      })
      
      const url = `/rooms/export-rooms${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await apiClient.get(url, { responseType: 'blob' })
      
      let filename = `rooms_${new Date().toISOString().split('T')[0]}.pdf`
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
      
      return { success: true, message: 'Rooms exported successfully' }
    } catch (error) {
      return handleApiError(error)
    }
  },
}

export default roomService

