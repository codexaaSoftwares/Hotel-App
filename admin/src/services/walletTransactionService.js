// Wallet Transaction Service - API calls for wallet transaction management
import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'

class WalletTransactionService {
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
      customer: payload.customer ?? null,
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
      data: payload.data ?? null,
      message: payload.message ?? '',
    }
  }

  /**
   * Get wallet transactions with pagination, filtering, and searching
   */
  async getWalletTransactions(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALLET_TRANSACTIONS.LIST, { params })
      return this.transformListResponse(response.data)
    } catch (error) {
      console.error('Error fetching wallet transactions:', error)
      throw error
    }
  }

  /**
   * Get wallet transactions for a specific customer (Customer Ledger)
   */
  async getCustomerLedger(customerId, params = {}) {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.WALLET_TRANSACTIONS.GET_BY_CUSTOMER(customerId),
        { params }
      )
      return this.transformListResponse(response.data)
    } catch (error) {
      console.error('Error fetching customer ledger:', error)
      throw error
    }
  }

  /**
   * Get wallet transaction by ID
   */
  async getWalletTransactionById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALLET_TRANSACTIONS.GET_BY_ID(id))
      return this.transformItemResponse(response.data)
    } catch (error) {
      console.error('Error fetching wallet transaction:', error)
      throw error
    }
  }

  /**
   * Create a new wallet transaction
   */
  async createWalletTransaction(transactionData) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.WALLET_TRANSACTIONS.CREATE,
        transactionData
      )
      return this.transformItemResponse(response.data)
    } catch (error) {
      console.error('Error creating wallet transaction:', error)
      throw error
    }
  }

  /**
   * Update an existing wallet transaction
   */
  async updateWalletTransaction(id, transactionData) {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.WALLET_TRANSACTIONS.UPDATE(id),
        transactionData
      )
      return this.transformItemResponse(response.data)
    } catch (error) {
      console.error('Error updating wallet transaction:', error)
      throw error
    }
  }

  /**
   * Delete a wallet transaction
   */
  async deleteWalletTransaction(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.WALLET_TRANSACTIONS.DELETE(id))
      return this.transformItemResponse(response.data)
    } catch (error) {
      console.error('Error deleting wallet transaction:', error)
      throw error
    }
  }
}

export default new WalletTransactionService()

