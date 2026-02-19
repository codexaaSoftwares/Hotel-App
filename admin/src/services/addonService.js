// Addon Service - API service for Room Addon Services
import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'

const normalizeAddonService = (service) => {
  return {
    id: service.id,
    name: service.name || '',
    charge: parseFloat(service.charge) || 0,
    status: service.status || 'active',
    created_at: service.createdAt || service.created_at,
    updated_at: service.updatedAt || service.updated_at,
  }
}

const addonService = {
  /**
   * Get all addon services with pagination, filtering, and searching
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Response with services array and meta
   */
  async getAddonServices(params = {}) {
    try {
      const response = await apiClient.get('/addon-services', { params })
      return {
        success: true,
        data: (response.data.data || []).map(normalizeAddonService),
        meta: response.data.meta,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get a single addon service by ID
   * @param {number} id - Service ID
   * @returns {Promise<Object>} Response with service data
   */
  async getAddonServiceById(id) {
    try {
      const response = await apiClient.get(`/addon-services/${id}`)
      return {
        success: true,
        data: normalizeAddonService(response.data.data),
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get active addon services only (for dropdowns, billing forms)
   * @returns {Promise<Object>} Response with active services
   */
  async getActiveAddonServices() {
    try {
      const response = await apiClient.get('/addon-services', {
        params: { status: 'active', limit: 100 },
      })
      return {
        success: true,
        data: (response.data.data || []).map(normalizeAddonService),
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Create a new addon service
   * @param {Object} serviceData - Service data
   * @returns {Promise<Object>} Response with created service
   */
  async createAddonService(serviceData) {
    try {
      const response = await apiClient.post('/addon-services', {
        name: serviceData.name,
        charge: serviceData.charge,
        status: serviceData.status || 'active',
      })
      return {
        success: true,
        data: normalizeAddonService(response.data.data),
        message: response.data.message || 'Addon service created successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Update an existing addon service
   * @param {number} id - Service ID
   * @param {Object} serviceData - Updated service data
   * @returns {Promise<Object>} Response with updated service
   */
  async updateAddonService(id, serviceData) {
    try {
      const payload = {}
      if (serviceData.name !== undefined) payload.name = serviceData.name
      if (serviceData.charge !== undefined) payload.charge = serviceData.charge
      if (serviceData.status !== undefined) payload.status = serviceData.status

      const response = await apiClient.put(`/addon-services/${id}`, payload)
      return {
        success: true,
        data: normalizeAddonService(response.data.data),
        message: response.data.message || 'Addon service updated successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Delete an addon service
   * @param {number} id - Service ID
   * @returns {Promise<Object>}
   */
  async deleteAddonService(id) {
    try {
      await apiClient.delete(`/addon-services/${id}`)
      return {
        success: true,
        message: 'Addon service deleted successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },
}

export default addonService
export { addonService }
