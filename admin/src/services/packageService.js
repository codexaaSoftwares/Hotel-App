// Package Service - API calls for package management
import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'
import packagesMockData from '../mock/packages.json'
import { handleApiError } from '../utils/errorHandler'

class PackageService {
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
    if (params.package_type) query.package_type = params.package_type
    if (params.status) query.status = params.status
    if (params.min_price) query.min_price = params.min_price
    if (params.max_price) query.max_price = params.max_price
    if (params.sortBy) query.sort_by = params.sortBy
    if (params.sortDirection) query.sort_direction = params.sortDirection

    return query
  }

  // Get all packages
  async getPackages(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PACKAGES.LIST, {
        params: this.buildQueryParams(params),
      })

      const payload = this.transformListResponse(response?.data)

      if (payload.success) {
        return payload
      }

      return this.getMockPackages(params)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      // Return mock data if API call fails
      return this.getMockPackages(params)
    }
  }

  // Get mock packages data (fallback)
  getMockPackages(params = {}) {
    let packages = [...packagesMockData]
    
    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase()
      packages = packages.filter(pkg => 
        pkg.package_name?.toLowerCase().includes(searchTerm) ||
        pkg.description?.toLowerCase().includes(searchTerm) ||
        pkg.package_type?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Apply package type filter
    if (params.package_type) {
      packages = packages.filter(pkg => pkg.package_type === params.package_type)
    }
    
    // Apply status filter
    if (params.status) {
      packages = packages.filter(pkg => pkg.status === params.status)
    }
    
    // Apply pagination
    const page = params.page || 1
    const limit = params.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPackages = packages.slice(startIndex, endIndex)
    
    return {
      success: true,
      data: paginatedPackages,
      meta: {
        total: packages.length,
        page,
        limit,
        totalPages: Math.ceil(packages.length / limit) || 1,
        hasNext: endIndex < packages.length,
        hasPrev: page > 1,
      },
    }
  }

  // Get package by ID
  async getPackageById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PACKAGES.GET_BY_ID(id))
      const payload = this.transformItemResponse(response?.data)

      if (payload.success) {
        return payload
      }
      // Fallback to mock data
      return this.getMockPackageById(id)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.getMockPackageById(id)
    }
  }

  // Get mock package by ID (fallback)
  getMockPackageById(id) {
    const pkg = packagesMockData.find(p => p.id === parseInt(id))
    if (pkg) {
      return {
        success: true,
        data: pkg
      }
    }
    return {
      success: false,
      message: 'Package not found'
    }
  }

  // Create new package
  async createPackage(packageData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PACKAGES.CREATE, packageData)
      const payload = this.transformItemResponse(response?.data)
      if (payload.success) {
        return payload
      }
      // Fallback to mock data (simulate creation)
      return this.createMockPackage(packageData)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.createMockPackage(packageData)
    }
  }

  // Create mock package (fallback)
  createMockPackage(packageData) {
    const newPackage = {
      id: packagesMockData.length + 1,
      ...packageData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    // In real implementation, this would be saved to backend
    return {
      success: true,
      data: newPackage,
      message: 'Package created successfully (mock)'
    }
  }

  // Update package
  async updatePackage(id, packageData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PACKAGES.UPDATE(id), packageData)
      const payload = this.transformItemResponse(response?.data)
      if (payload.success) {
        return payload
      }
      // Fallback to mock data (simulate update)
      return this.updateMockPackage(id, packageData)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.updateMockPackage(id, packageData)
    }
  }

  // Update mock package (fallback)
  updateMockPackage(id, packageData) {
    const packageIndex = packagesMockData.findIndex(p => p.id === parseInt(id))
    if (packageIndex !== -1) {
      const updatedPackage = {
        ...packagesMockData[packageIndex],
        ...packageData,
        updated_at: new Date().toISOString()
      }
      // In real implementation, this would be saved to backend
      return {
        success: true,
        data: updatedPackage,
        message: 'Package updated successfully (mock)'
      }
    }
    return {
      success: false,
      message: 'Package not found'
    }
  }

  // Delete package
  async deletePackage(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.PACKAGES.DELETE(id))
      const payload = this.transformItemResponse(response?.data ?? { success: true })
      if (payload.success) {
        return payload
      }
      // Fallback to mock data (simulate delete)
      return this.deleteMockPackage(id)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return this.deleteMockPackage(id)
    }
  }

  // Delete mock package (fallback)
  deleteMockPackage(id) {
    const packageIndex = packagesMockData.findIndex(p => p.id === parseInt(id))
    if (packageIndex !== -1) {
      // In real implementation, this would be deleted from backend
      return {
        success: true,
        message: 'Package deleted successfully (mock)'
      }
    }
    return {
      success: false,
      message: 'Package not found'
    }
  }

  // Get package types from API
  async getPackageTypes() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PACKAGE_TYPES.LIST)
      
      if (response.data && response.data.success) {
        // Transform API response to match expected format
        return response.data.data.map(type => ({
          value: type.name || type.value,
          label: type.name || type.label,
          id: type.id,
          description: type.description,
          status: type.status,
        }))
      }
      
      // Fallback to default types if API fails
      return [
        { value: 'Album', label: 'Album' },
        { value: 'PhotoShoot', label: 'PhotoShoot' },
        { value: 'Editing', label: 'Editing' },
        { value: 'Video', label: 'Video' },
      ]
    } catch (error) {
      console.error('Error fetching package types:', error)
      // Fallback to default types on error
      return [
        { value: 'Album', label: 'Album' },
        { value: 'PhotoShoot', label: 'PhotoShoot' },
        { value: 'Editing', label: 'Editing' },
        { value: 'Video', label: 'Video' },
      ]
    }
  }

  // Validate package data
  validatePackageData(packageData, isUpdate = false) {
    const errors = {}

    if (!isUpdate || packageData.package_name !== undefined) {
      if (!packageData.package_name || packageData.package_name.trim() === '') {
        errors.package_name = 'Package name is required'
      }
    }

    if (!isUpdate || packageData.package_type !== undefined) {
      if (!packageData.package_type || packageData.package_type.trim() === '') {
        errors.package_type = 'Package type is required'
      }
    }

    if (!isUpdate || packageData.default_price !== undefined) {
      if (!packageData.default_price || packageData.default_price < 0) {
        errors.default_price = 'Default price is required and must be >= 0'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

}

// Create and export singleton instance
const packageService = new PackageService()
export default packageService

