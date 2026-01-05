// Profile Management Service
import apiClient from '../config/apiClient'
import { API_ENDPOINTS } from '../constants/api'
import { handleApiError } from '../utils/errorHandler'

class ProfileService {
  // Normalize user data from API to frontend format
  normalizeProfileData(user) {
    if (!user) return null
    
    // Use avatar_url if available (full URL), otherwise use avatar (relative path)
    // Priority: avatar_url > avatar
    let avatarUrl = null
    if (user.avatar_url) {
      avatarUrl = user.avatar_url
    } else if (user.avatar) {
      // If avatar is a relative path, convert to full URL
      if (user.avatar.startsWith('avatars/') || user.avatar.startsWith('/avatars/')) {
        // This shouldn't happen if backend is working correctly, but handle it
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        avatarUrl = `${baseURL}/storage/${user.avatar.replace(/^\/?/, '')}`
      } else if (user.avatar.startsWith('http')) {
        avatarUrl = user.avatar
      } else {
        avatarUrl = user.avatar
      }
    }
    
    return {
      id: user.id,
      firstName: user.first_name || user.firstName,
      lastName: user.last_name || user.lastName,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zip_code || user.zipCode || '',
      country: user.country || '',
      bio: user.bio || '',
      avatar: avatarUrl, // Always use full URL
      dateOfBirth: user.date_of_birth || user.dateOfBirth || '',
      gender: user.gender || '',
      status: user.status || 'active',
      roles: user.roles || [],
      createdAt: user.created_at || user.createdAt,
      updatedAt: user.updated_at || user.updatedAt,
    }
  }

  // Serialize profile data for API
  serializeProfileData(data) {
    // Helper to convert empty strings to null
    const toNullIfEmpty = (value) => {
      if (value === '' || value === undefined) return null
      return value
    }
    
    return {
      first_name: data.firstName || data.first_name,
      last_name: data.lastName || data.last_name,
      email: data.email,
      phone: toNullIfEmpty(data.phone),
      address: toNullIfEmpty(data.address),
      city: toNullIfEmpty(data.city),
      state: toNullIfEmpty(data.state),
      zip_code: toNullIfEmpty(data.zipCode || data.zip_code),
      country: toNullIfEmpty(data.country),
      bio: toNullIfEmpty(data.bio),
      avatar: data.avatar,
      date_of_birth: toNullIfEmpty(data.dateOfBirth || data.date_of_birth),
      gender: toNullIfEmpty(data.gender),
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.GET_PROFILE)
      
      if (response.data?.success && response.data?.data) {
        const normalizedData = this.normalizeProfileData(response.data.data)
        
        // Debug log
        if (import.meta.env.DEV) {
          console.log('[ProfileService] Profile fetched:', {
            raw: response.data.data,
            normalized: normalizedData,
            avatar_url: response.data.data.avatar_url,
            avatar: response.data.data.avatar
          })
        }
        
        return {
          success: true,
          data: normalizedData,
          message: 'Profile fetched successfully'
        }
      }
      
      return {
        success: false,
        data: null,
        message: 'Invalid response format'
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      return handleApiError(error)
    }
  }

  // Update current user profile
  async updateProfile(profileData) {
    try {
      const payload = this.serializeProfileData(profileData)
      const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, payload)
      
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: this.normalizeProfileData(response.data.data),
          message: response.data.message || 'Profile updated successfully'
        }
      }
      
      return {
        success: false,
        data: null,
        message: 'Invalid response format'
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      return handleApiError(error)
    }
  }

  // Upload profile avatar
  async uploadAvatar(file) {
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await apiClient.post(API_ENDPOINTS.USERS.UPLOAD_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        return {
          success: true,
          data: this.normalizeProfileData(response.data.data),
          message: response.data.message || 'Avatar uploaded successfully',
        }
      }

      return {
        success: false,
        message: response.data.message || 'Failed to upload avatar',
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return handleApiError(error)
    }
  }

  // Delete profile avatar
  async deleteAvatar() {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.USERS.DELETE_AVATAR)

      if (response.data.success) {
        return {
          success: true,
          data: this.normalizeProfileData(response.data.data),
          message: response.data.message || 'Avatar deleted successfully',
        }
      }

      return {
        success: false,
        message: response.data.message || 'Failed to delete avatar',
      }
    } catch (error) {
      console.error('Error deleting avatar:', error)
      return handleApiError(error)
    }
  }

  // Change user password
  async changePassword(passwordData) {
    try {
      const payload = {
        current_password: passwordData.currentPassword || passwordData.current_password,
        new_password: passwordData.newPassword || passwordData.new_password,
        new_password_confirmation: passwordData.confirmPassword || passwordData.new_password_confirmation || passwordData.newPassword || passwordData.new_password,
      }
      
      const response = await apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload)
      
      // Backend returns { message: "..." } on success
      if (response.data?.message) {
        return {
          success: true,
          data: response.data,
          message: response.data.message
        }
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Password changed successfully'
      }
    } catch (error) {
      console.error('Error changing password:', error)
      const errorResponse = handleApiError(error)
      
      // Map backend validation errors to frontend format
      if (errorResponse.errors && typeof errorResponse.errors === 'object') {
        const mappedErrors = {}
        Object.keys(errorResponse.errors).forEach(key => {
          // Map backend field names to frontend field names
          if (key === 'current_password') {
            mappedErrors.currentPassword = Array.isArray(errorResponse.errors[key]) 
              ? errorResponse.errors[key][0] 
              : errorResponse.errors[key]
          } else if (key === 'new_password') {
            mappedErrors.newPassword = Array.isArray(errorResponse.errors[key]) 
              ? errorResponse.errors[key][0] 
              : errorResponse.errors[key]
          } else if (key === 'new_password_confirmation') {
            mappedErrors.confirmPassword = Array.isArray(errorResponse.errors[key]) 
              ? errorResponse.errors[key][0] 
              : errorResponse.errors[key]
          } else {
            mappedErrors[key] = Array.isArray(errorResponse.errors[key]) 
              ? errorResponse.errors[key][0] 
              : errorResponse.errors[key]
          }
        })
        errorResponse.errors = mappedErrors
      }
      
      return errorResponse
    }
  }

  // Get user activity logs
  async getActivityLogs(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      if (params.activity) queryParams.append('activity', params.activity)

      const endpoint = `${API_ENDPOINTS.USERS.GET_PROFILE}/activity?${queryParams.toString()}`
      const response = await apiService.get(endpoint)
      
      return {
        success: true,
        data: response.data,
        message: 'Activity logs fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch activity logs'
      }
    }
  }

  // Export profile data
  async exportProfileData(format = 'json') {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.USERS.GET_PROFILE}/export?format=${format}`, {
        responseType: 'blob'
      })
      
      return {
        success: true,
        data: response.data,
        message: 'Profile data exported successfully'
      }
    } catch (error) {
      console.error('Error exporting profile data:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to export profile data'
      }
    }
  }

  // Update profile preferences
  async updatePreferences(preferences) {
    try {
      const response = await apiService.put(`${API_ENDPOINTS.USERS.GET_PROFILE}/preferences`, preferences)
      return {
        success: true,
        data: response.data,
        message: 'Preferences updated successfully'
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update preferences'
      }
    }
  }

  // Get profile statistics
  async getProfileStats() {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.USERS.GET_PROFILE}/stats`)
      return {
        success: true,
        data: response.data,
        message: 'Profile statistics fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching profile statistics:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch profile statistics'
      }
    }
  }

  // Validate profile data
  validateProfileData(data) {
    const errors = {}

    // Required fields
    if (!data.firstName?.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!data.lastName?.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!data.email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Optional field validations
    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number'
    }

    if (data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (age < 13) {
        errors.dateOfBirth = 'You must be at least 13 years old'
      } else if (age > 120) {
        errors.dateOfBirth = 'Please enter a valid birth date'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // Format profile data for API
  formatProfileData(data) {
    return {
      firstName: data.firstName?.trim(),
      lastName: data.lastName?.trim(),
      email: data.email?.trim(),
      phone: data.phone?.trim(),
      address: data.address?.trim(),
      city: data.city?.trim(),
      state: data.state?.trim(),
      zipCode: data.zipCode?.trim(),
      country: data.country?.trim(),
      bio: data.bio?.trim(),
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      avatar: data.avatar
    }
  }
}

// Create and export service instance
export const profileService = new ProfileService()

// Export class for testing
export { ProfileService }

export default profileService
