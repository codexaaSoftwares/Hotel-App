import axios from 'axios'
import config from '../config'
import { REQUEST_CONFIG } from '../constants/api'

const apiClient = axios.create({
  baseURL: config.api.baseURL,
  timeout: REQUEST_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.params || config.data)
    }
    
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data)
    }
    
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Log error in development (skip 404 for settings lookup as it's expected)
    if (import.meta.env.DEV) {
      const isSettingsLookup = error.config?.url?.includes('/global-settings/key/') && 
                               (error.response?.status === 404 || !error.response)
      const isSettingsSave = error.config?.url?.includes('/global-settings/') && 
                            (error.config?.method === 'post' || error.config?.method === 'put') &&
                            (error.response?.status === 404 || !error.response)
      
      // Don't log 404 errors or network errors for settings lookup (expected behavior)
      if (!isSettingsLookup && !isSettingsSave) {
        // Only log if we have a response or it's a real error
        if (error.response || (!error.response && !error.config?.url?.includes('/global-settings/key/'))) {
          console.error('[API Error]', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.response?.data?.detail || error.response?.data?.message || error.message,
            fullError: error.response || error,
          })
        }
      }
      
      // Special handling for 401 errors
      if (error.response?.status === 401) {
        console.warn('[401 Unauthorized]', {
          endpoint: error.config?.url,
          baseURL: error.config?.baseURL,
          message: 'Authentication failed. Possible reasons:',
          reasons: [
            '1. Invalid email or password',
            '2. User does not exist in backend database',
            '3. Backend authentication endpoint format mismatch',
            '4. CORS issues (check browser console)',
          ],
          requestData: error.config?.data,
          responseData: error.response?.data,
        })
      }
    }
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Clear auth data
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      
      // If not already on login page, redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient

