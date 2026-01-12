// Table Service - API service for Table Management
import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'

// Normalize table data from API to frontend format
const normalizeTable = (table) => {
  return {
    id: table.id,
    table_number: table.tableNumber || table.table_number,
    table_name: table.tableName || table.table_name || '',
    display_name: table.displayName || table.display_name || table.tableNumber || table.table_number,
    capacity: table.capacity || 4,
    status: table.status || 'available',
    is_active: table.isActive !== undefined ? table.isActive : table.is_active !== undefined ? table.is_active : true,
    created_at: table.createdAt || table.created_at,
    updated_at: table.updatedAt || table.updated_at,
  }
}

const tableService = {
  /**
   * Get all tables with pagination, filtering, and searching
   * @param {Object} params - Query parameters
   * @param {boolean} params.include_bills - Include bill information (for POS Panel)
   * @returns {Promise<Object>} Response with tables array and meta
   */
  async getTables(params = {}) {
    try {
      const response = await apiClient.get('/tables', { params })
      return {
        success: true,
        data: response.data.data.map((table) => {
          const normalized = normalizeTable(table)
          // Include bill information if present
          if (table.active_orders_count !== undefined) {
            normalized.active_orders_count = table.active_orders_count
            normalized.total_orders_count = table.total_orders_count
            normalized.active_bills_total = table.active_bills_total || 0
            normalized.active_bills = table.active_bills || []
          }
          return normalized
        }),
        meta: response.data.meta,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get a single table by ID
   * @param {number} id - Table ID
   * @returns {Promise<Object>} Response with table data
   */
  async getTableById(id) {
    try {
      const response = await apiClient.get(`/tables/${id}`)
      return {
        success: true,
        data: normalizeTable(response.data.data),
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Create a new table
   * @param {Object} tableData - Table data
   * @returns {Promise<Object>} Response with created table
   */
  async createTable(tableData) {
    try {
      const response = await apiClient.post('/tables', {
        table_number: tableData.table_number,
        table_name: tableData.table_name || null,
        capacity: tableData.capacity,
        status: tableData.status || 'available',
        is_active: tableData.is_active !== undefined ? tableData.is_active : true,
      })
      return {
        success: true,
        data: normalizeTable(response.data.data),
        message: response.data.message || 'Table created successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Update an existing table
   * @param {number} id - Table ID
   * @param {Object} tableData - Updated table data
   * @returns {Promise<Object>} Response with updated table
   */
  async updateTable(id, tableData) {
    try {
      const payload = {}
      if (tableData.table_number !== undefined) payload.table_number = tableData.table_number
      if (tableData.table_name !== undefined) payload.table_name = tableData.table_name || null
      if (tableData.capacity !== undefined) payload.capacity = tableData.capacity
      if (tableData.status !== undefined) payload.status = tableData.status
      if (tableData.is_active !== undefined) payload.is_active = tableData.is_active

      const response = await apiClient.put(`/tables/${id}`, payload)
      return {
        success: true,
        data: normalizeTable(response.data.data),
        message: response.data.message || 'Table updated successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Delete a table
   * @param {number} id - Table ID
   * @returns {Promise<Object>} Response with success message
   */
  async deleteTable(id) {
    try {
      const response = await apiClient.delete(`/tables/${id}`)
      return {
        success: true,
        message: response.data.message || 'Table deleted successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  },
}

export default tableService

