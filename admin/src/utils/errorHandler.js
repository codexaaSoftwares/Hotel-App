import { API_ERRORS } from '../constants/api'

/**
 * Handles API errors and returns a standardized error response
 * @param {Error} error - The error object from axios
 * @returns {Object} - Standardized error response
 */
export const handleApiError = (error) => {
  // Network error - no response from server
  if (!error.response) {
    return {
      success: false,
      data: null,
      message: API_ERRORS.NETWORK_ERROR,
      error: 'network',
      status: null,
    }
  }

  const { status, data } = error.response

  // Handle different error status codes
  switch (status) {
    case 400:
      return {
        success: false,
        data: null,
        message: data.detail || data.message || 'Bad request. Please check your input.',
        error: 'bad_request',
        status: 400,
      }
    
    case 401:
      return {
        success: false,
        data: null,
        message: data.detail || API_ERRORS.UNAUTHORIZED,
        error: 'unauthorized',
        status: 401,
      }
    
    case 403:
      return {
        success: false,
        data: null,
        message: API_ERRORS.FORBIDDEN,
        error: 'forbidden',
        status: 403,
      }
    
    case 404:
      return {
        success: false,
        data: null,
        message: API_ERRORS.NOT_FOUND,
        error: 'not_found',
        status: 404,
      }
    
    case 422:
      return {
        success: false,
        data: null,
        message: data.detail || API_ERRORS.VALIDATION_ERROR,
        errors: data.errors || [],
        error: 'validation',
        status: 422,
      }
    
    case 409:
      return {
        success: false,
        data: null,
        message: data.detail || 'Resource already exists.',
        error: 'conflict',
        status: 409,
      }
    
    case 500:
      return {
        success: false,
        data: null,
        message: API_ERRORS.SERVER_ERROR,
        error: 'server',
        status: 500,
      }
    
    default:
      return {
        success: false,
        data: null,
        message: data.detail || data.message || API_ERRORS.SERVER_ERROR,
        error: 'server',
        status: status || 500,
      }
  }
}

/**
 * Formats success response
 * @param {Object} response - The axios response object
 * @returns {Object} - Standardized success response
 */
export const formatSuccessResponse = (response) => {
  return {
    success: true,
    data: response.data,
    message: response.data.message || 'Operation successful',
  }
}

/**
 * Checks if error is a network error
 * @param {Error} error - The error object
 * @returns {Boolean}
 */
export const isNetworkError = (error) => {
  return !error.response || error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')
}

/**
 * Gets user-friendly error message
 * @param {Error} error - The error object
 * @returns {String} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error.response) {
    return API_ERRORS.NETWORK_ERROR
  }

  const { data, status } = error.response

  switch (status) {
    case 400:
      return data.detail || 'Invalid request. Please check your input.'
    case 401:
      return data.detail || 'Authentication failed. Please login again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 422:
      return data.detail || 'Validation error. Please check your input.'
    case 500:
      return 'Server error. Please try again later.'
    default:
      return data.detail || data.message || 'An error occurred.'
  }
}

