// Branch Service - API calls for branch management
import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'
import branchesMockData from '../mock/branches.json'

class BranchService {
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
    if (params.per_page) query.limit = params.per_page
    if (params.search) query.search = params.search
    if (params.status) query.status = params.status
    if (params.city) query.city = params.city
    if (params.sortBy) query.sort_by = params.sortBy
    if (params.sortDirection) query.sort_direction = params.sortDirection

    return query
  }

  // Get all branches
  async getBranches(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BRANCHES.LIST, {
        params: this.buildQueryParams(params),
      })

      const payload = this.transformListResponse(response?.data)

      if (payload.success) {
        return payload
      }

      return this.getMockBranches(params)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      // Return mock data if API call fails
      return this.getMockBranches(params)
    }
  }

  // Get mock branches data (fallback)
  getMockBranches(params = {}) {
    let branches = [...branchesMockData]
    
    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase()
      branches = branches.filter(branch => 
        branch.branch_name?.toLowerCase().includes(searchTerm) ||
        branch.branch_code?.toLowerCase().includes(searchTerm) ||
        branch.city?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Apply status filter
    if (params.status) {
      branches = branches.filter(branch => branch.status === params.status)
    }
    
    // Apply city filter
    if (params.city) {
      branches = branches.filter(branch => branch.city?.toLowerCase().includes(params.city.toLowerCase()))
    }
    
    // Apply pagination
    const page = params.page || 1
    const limit = params.limit || 20
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedBranches = branches.slice(startIndex, endIndex)
    
    return {
      success: true,
      data: paginatedBranches,
      meta: {
        total: branches.length,
        page,
        limit,
        totalPages: Math.ceil(branches.length / limit) || 1,
        hasNext: endIndex < branches.length,
        hasPrev: page > 1,
      },
    }
  }

  // Get branch by ID
  async getBranchById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BRANCHES.GET_BY_ID(id))
      const payload = this.transformItemResponse(response?.data)

      if (payload.success) {
        return payload
      }
      // Fallback to mock data
      return this.getMockBranchById(id)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.getMockBranchById(id)
    }
  }

  // Get mock branch by ID (fallback)
  getMockBranchById(id) {
    const branch = branchesMockData.find(b => b.id === parseInt(id))
    if (branch) {
      return {
        success: true,
        data: branch
      }
    }
    return {
      success: false,
      message: 'Branch not found'
    }
  }

  // Create new branch
  async createBranch(branchData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BRANCHES.CREATE, branchData)
      const payload = this.transformItemResponse(response?.data)
      if (payload.success) {
        return payload
      }
      // Fallback to mock data (simulate creation)
      return this.createMockBranch(branchData)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.createMockBranch(branchData)
    }
  }

  // Create mock branch (fallback)
  createMockBranch(branchData) {
    const newBranch = {
      id: branchesMockData.length + 1,
      ...branchData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    // In real implementation, this would be saved to backend
    return {
      success: true,
      data: newBranch,
      message: 'Branch created successfully (mock)'
    }
  }

  // Update branch
  async updateBranch(id, branchData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.BRANCHES.UPDATE(id), branchData)
      const payload = this.transformItemResponse(response?.data)
      if (payload.success) {
        return payload
      }
      // Fallback to mock data (simulate update)
      return this.updateMockBranch(id, branchData)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.updateMockBranch(id, branchData)
    }
  }

  // Update mock branch (fallback)
  updateMockBranch(id, branchData) {
    const branchIndex = branchesMockData.findIndex(b => b.id === parseInt(id))
    if (branchIndex !== -1) {
      const updatedBranch = {
        ...branchesMockData[branchIndex],
        ...branchData,
        updated_at: new Date().toISOString()
      }
      // In real implementation, this would be saved to backend
      return {
        success: true,
        data: updatedBranch,
        message: 'Branch updated successfully (mock)'
      }
    }
    return {
      success: false,
      message: 'Branch not found'
    }
  }

  // Delete branch
  async deleteBranch(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.BRANCHES.DELETE(id))
      const payload = this.transformItemResponse(response?.data ?? { success: true })
      if (payload.success) {
        return payload
      }
      // Fallback to mock data (simulate delete)
      return this.deleteMockBranch(id)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.deleteMockBranch(id)
    }
  }

  // Delete mock branch (fallback)
  deleteMockBranch(id) {
    const branchIndex = branchesMockData.findIndex(b => b.id === parseInt(id))
    if (branchIndex !== -1) {
      // In real implementation, this would be deleted from backend
      return {
        success: true,
        message: 'Branch deleted successfully (mock)'
      }
    }
    return {
      success: false,
      message: 'Branch not found'
    }
  }

  // Validate branch data
  validateBranchData(branchData, isUpdate = false) {
    const errors = {}

    if (!isUpdate || branchData.branch_name !== undefined) {
      if (!branchData.branch_name || branchData.branch_name.trim() === '') {
        errors.branch_name = 'Branch name is required'
      }
    }

    if (!isUpdate || branchData.branch_code !== undefined) {
      if (!branchData.branch_code || branchData.branch_code.trim() === '') {
        errors.branch_code = 'Branch code is required'
      }
    }

    if (!isUpdate || branchData.address !== undefined) {
      if (!branchData.address || branchData.address.trim() === '') {
        errors.address = 'Address is required'
      }
    }

    if (!isUpdate || branchData.city !== undefined) {
      if (!branchData.city || branchData.city.trim() === '') {
        errors.city = 'City is required'
      }
    }

    if (!isUpdate || branchData.contact_number !== undefined) {
      if (!branchData.contact_number || branchData.contact_number.trim() === '') {
        errors.contact_number = 'Contact number is required'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }
}

// Create and export singleton instance
const branchService = new BranchService()
export default branchService

