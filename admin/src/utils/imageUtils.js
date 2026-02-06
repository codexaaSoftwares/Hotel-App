/**
 * Image URL Utility
 * 
 * Handles construction of storage image URLs.
 * Backend typically returns full URLs, but this utility provides fallback
 * for cases where only relative paths are available.
 */

/**
 * Get full image URL from backend response or relative path
 * 
 * @param {string|null|undefined} url - Full URL from backend (preferred)
 * @param {string|null|undefined} path - Relative path from storage (fallback)
 * @returns {string|null} Full image URL or null if neither provided
 */
export function getImageUrl(url, path = null) {
  // If full URL is provided, use it directly
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url
  }
  
  // If no URL but path is provided, construct full URL
  if (!url && path) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    
    try {
      // Extract domain from base URL
      const urlObj = new URL(baseURL)
      const domain = `${urlObj.protocol}//${urlObj.host}${urlObj.port ? ':' + urlObj.port : ''}`
      return `${domain}/admin/api/storage/${path}`
    } catch (err) {
      // Fallback: handle relative paths or malformed URLs
      const cleanUrl = baseURL.replace(/\/api\/?$/, '').replace(/\/+$/, '')
      return `${cleanUrl}/admin/api/storage/${path}`
    }
  }
  
  // If URL is provided but not a full URL, treat it as a path
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    
    try {
      const urlObj = new URL(baseURL)
      const domain = `${urlObj.protocol}//${urlObj.host}${urlObj.port ? ':' + urlObj.port : ''}`
      return `${domain}/admin/api/storage/${url}`
    } catch (err) {
      const cleanUrl = baseURL.replace(/\/api\/?$/, '').replace(/\/+$/, '')
      return `${cleanUrl}/admin/api/storage/${url}`
    }
  }
  
  return null
}

