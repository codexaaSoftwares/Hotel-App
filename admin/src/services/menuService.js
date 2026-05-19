// Menu Service - Unified service for Food Categories and Food Items
import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'

// Normalize item data from API to frontend format
const normalizeItem = (item) => {
  // Ensure image URL is properly formatted
  let imageUrl = item.image || ''
  // If image is a relative path, convert it to full URL
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const cleanBaseURL = baseURL.replace(/\/+$/, '')
    if (cleanBaseURL.includes('/admin/api')) {
      imageUrl = `${cleanBaseURL}/storage/${imageUrl}`
    } else if (cleanBaseURL.includes('/admin')) {
      imageUrl = `${cleanBaseURL}/api/storage/${imageUrl}`
    } else {
      imageUrl = `${cleanBaseURL}/api/storage/${imageUrl}`
    }
  }

  return {
    id: item.id,
    food_category_id: item.food_category_id,
    category_name: item.food_category?.name || item.category_name || '',
    name: item.name,
    description: item.description || '',
    price: parseFloat(item.price).toFixed(2),
    is_veg: item.food_type === 'veg' || item.is_veg === true,
    food_type: item.food_type || (item.is_veg ? 'veg' : 'non_veg'),
    status: item.status || 'active',
    image: imageUrl,
    display_order: item.display_order || 0,
    isPopular: item.isPopular !== undefined ? Boolean(item.isPopular) : (item.is_popular !== undefined ? Boolean(item.is_popular) : false),
    created_at: item.created_at,
    updated_at: item.updated_at,
  }
}

// Normalize category data from API to frontend format
const normalizeCategory = (category) => {
  return {
    id: category.id,
    name: category.name,
    description: category.description || '',
    display_order: category.display_order || 0,
    status: category.status || 'active',
    created_at: category.created_at,
    updated_at: category.updated_at,
    items: category.items ? category.items.map(normalizeItem) : [],
  }
}

// Serialize item data for API
const serializeItem = (itemData) => {
  const serialized = {
    name: itemData.name,
    food_category_id: parseInt(itemData.food_category_id),
    price: parseFloat(itemData.price),
    food_type: itemData.is_veg !== undefined ? (itemData.is_veg ? 'veg' : 'non_veg') : (itemData.food_type || 'veg'),
    status: itemData.status || 'active',
    description: itemData.description || null,
    display_order: itemData.display_order ? parseInt(itemData.display_order) : null,
    is_popular: itemData.is_popular !== undefined ? Boolean(itemData.is_popular) : false,
  }
  
  // Only include image if it's provided (don't convert empty string to null)
  // If image is not in itemData, it won't be included (preserves existing image on update)
  if (itemData.image !== undefined && itemData.image !== null && itemData.image !== '') {
    serialized.image = itemData.image
  }
  
  return serialized
}

// Serialize category data for API
const serializeCategory = (categoryData) => {
  return {
    name: categoryData.name,
    description: categoryData.description || null,
    display_order: categoryData.display_order ? parseInt(categoryData.display_order) : null,
    status: categoryData.status || 'active',
  }
}

// Get all categories with their items (hierarchical structure)
export const getMenuHierarchy = async () => {
  try {
    const response = await apiClient.get('/food-categories/hierarchy')
    
    if (response.data?.success && response.data?.data) {
      const normalizedData = response.data.data.map(normalizeCategory)
      return {
        success: true,
        data: normalizedData,
      }
    }
    
    return {
      success: false,
      data: [],
      message: 'Invalid response format',
    }
  } catch (error) {
    console.error('Error fetching menu hierarchy:', error)
    return handleApiError(error)
  }
}

// Get all categories
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/food-categories', {
      params: {
        status: 'active',
      },
    })
    
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: response.data.data.map(normalizeCategory),
      }
    }
    
    return {
      success: false,
      data: [],
      message: 'Invalid response format',
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return handleApiError(error)
  }
}

// Get category by ID
export const getCategoryById = async (id) => {
  try {
    const response = await apiClient.get(`/food-categories/${id}`)
    
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: normalizeCategory(response.data.data),
      }
    }
    
    return {
      success: false,
      message: 'Category not found',
    }
  } catch (error) {
    console.error('Error fetching category:', error)
    return handleApiError(error)
  }
}

// Create category
export const createCategory = async (categoryData) => {
  try {
    const payload = serializeCategory(categoryData)
    const response = await apiClient.post('/food-categories', payload)
    
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: normalizeCategory(response.data.data),
        message: response.data.message || 'Category created successfully',
      }
    }
    
    return {
      success: false,
      message: 'Invalid response format',
    }
  } catch (error) {
    console.error('Error creating category:', error)
    return handleApiError(error)
  }
}

// Update category
export const updateCategory = async (id, categoryData) => {
  try {
    const payload = serializeCategory(categoryData)
    const response = await apiClient.put(`/food-categories/${id}`, payload)
    
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: normalizeCategory(response.data.data),
        message: response.data.message || 'Category updated successfully',
      }
    }
    
    return {
      success: false,
      message: 'Invalid response format',
    }
  } catch (error) {
    console.error('Error updating category:', error)
    return handleApiError(error)
  }
}

// Delete category
export const deleteCategory = async (id) => {
  try {
    const response = await apiClient.delete(`/food-categories/${id}`)
    
    if (response.data?.success) {
      return {
        success: true,
        message: response.data.message || 'Category deleted successfully',
      }
    }
    
    return {
      success: false,
      message: 'Invalid response format',
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    return handleApiError(error)
  }
}

// Get all items
export const getItems = async (categoryId = null) => {
  try {
    const params = {}
    if (categoryId) {
      params.category_id = categoryId
    }
    
    const response = await apiClient.get('/food-items', { params })
    
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: response.data.data.map(normalizeItem),
      }
    }
    
    return {
      success: false,
      data: [],
      message: 'Invalid response format',
    }
  } catch (error) {
    console.error('Error fetching items:', error)
    return handleApiError(error)
  }
}

// Get POS menu (categories + popular items) - Combined endpoint
export const getPOSMenu = async (popularLimit = 20) => {
  try {
    const response = await apiClient.get('/pos-menu', {
      params: { popular_limit: popularLimit },
    })
    
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: {
          categories: response.data.data.categories || [],
          popularItems: (response.data.data.popular_items || []).map(normalizeItem),
        },
      }
    }
    
    return {
      success: false,
      data: { categories: [], popularItems: [] },
      message: 'Invalid response format',
    }
  } catch (error) {
    console.error('Error fetching POS menu:', error)
    return handleApiError(error)
  }
}

// Get item by ID
export const getItemById = async (id) => {
  try {
    const response = await apiClient.get(`/food-items/${id}`)
    
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: normalizeItem(response.data.data),
      }
    }
    
    return {
      success: false,
      message: 'Item not found',
    }
  } catch (error) {
    console.error('Error fetching item:', error)
    return handleApiError(error)
  }
}

// Create item
export const createItem = async (itemData) => {
  try {
    const payload = serializeItem(itemData)
    const response = await apiClient.post('/food-items', payload)
    
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: normalizeItem(response.data.data),
        message: response.data.message || 'Item created successfully',
      }
    }
    
    return {
      success: false,
      message: 'Invalid response format',
    }
  } catch (error) {
    console.error('Error creating item:', error)
    return handleApiError(error)
  }
}

// Update item
export const updateItem = async (id, itemData) => {
  try {
    const payload = serializeItem(itemData)
    const response = await apiClient.put(`/food-items/${id}`, payload)
    
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: normalizeItem(response.data.data),
        message: response.data.message || 'Item updated successfully',
      }
    }
    
    return {
      success: false,
      message: 'Invalid response format',
    }
  } catch (error) {
    console.error('Error updating item:', error)
    return handleApiError(error)
  }
}

// Delete item
export const deleteItem = async (id) => {
  try {
    const response = await apiClient.delete(`/food-items/${id}`)
    
    if (response.data?.success) {
      return {
        success: true,
        message: response.data.message || 'Item deleted successfully',
      }
    }
    
    return {
      success: false,
      message: 'Invalid response format',
    }
  } catch (error) {
    console.error('Error deleting item:', error)
    return handleApiError(error)
  }
}

// Upload item image
export const uploadItemImage = async (itemId, file) => {
  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await apiClient.post(`/food-items/${itemId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: normalizeItem(response.data.data),
        message: response.data.message || 'Image uploaded successfully',
      }
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to upload image',
    }
  } catch (error) {
    console.error('Error uploading item image:', error)
    return handleApiError(error)
  }
}

// Delete item image
export const deleteItemImage = async (itemId) => {
  try {
    const response = await apiClient.delete(`/food-items/${itemId}/image`)

    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: normalizeItem(response.data.data),
        message: response.data.message || 'Image deleted successfully',
      }
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to delete image',
    }
  } catch (error) {
    console.error('Error deleting item image:', error)
    return handleApiError(error)
  }
}

// Move item up (decrease display_order)
export const moveItemUp = async (itemId, categoryId) => {
  try {
    const response = await apiClient.post(`/food-items/${itemId}/move-up`)
    
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: normalizeItem(response.data.data),
        message: response.data.message || 'Item moved up successfully',
      }
    }
    
    return {
      success: false,
      message: response.data?.message || 'Failed to move item up',
    }
  } catch (error) {
    console.error('Error moving item up:', error)
    return handleApiError(error)
  }
}

// Move item down (increase display_order)
export const moveItemDown = async (itemId, categoryId) => {
  try {
    const response = await apiClient.post(`/food-items/${itemId}/move-down`)
    
    if (response.data?.success && response.data?.data) {
      return {
        success: true,
        data: normalizeItem(response.data.data),
        message: response.data.message || 'Item moved down successfully',
      }
    }
    
    return {
      success: false,
      message: response.data?.message || 'Failed to move item down',
    }
  } catch (error) {
    console.error('Error moving item down:', error)
    return handleApiError(error)
  }
}

// Update category display order (bulk)
export const updateCategoryOrder = async (categoryOrders) => {
  try {
    // Note: This endpoint doesn't exist yet, but we can implement it if needed
    // For now, we'll update each category individually
    const promises = categoryOrders.map(({ id, display_order }) =>
      updateCategory(id, { display_order })
    )
    
    await Promise.all(promises)
    
    return {
      success: true,
      message: 'Category order updated successfully',
    }
  } catch (error) {
    console.error('Error updating category order:', error)
    return handleApiError(error)
  }
}

// Export menu as PDF
export const exportMenu = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key])
    })
    
    const url = `/food-categories/export-menu${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const response = await apiClient.get(url, { responseType: 'blob' })
    
    let filename = `menu_${new Date().toISOString().split('T')[0]}.pdf`
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
    
    return { success: true, message: 'Menu exported successfully' }
  } catch (error) {
    console.error('Error exporting menu:', error)
    return handleApiError(error)
  }
}

// Export menu as Excel (CSV)
export const exportMenuCsv = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    
    const url = `/food-categories/export-menu-csv${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const response = await apiClient.get(url, { responseType: 'blob' })
    
    let filename = `menu_${new Date().toISOString().split('T')[0]}.csv`
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
    
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
    const url_blob = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url_blob
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url_blob)
    
    return { success: true, message: 'Menu exported to Excel successfully' }
  } catch (error) {
    console.error('Error exporting menu to Excel:', error)
    return handleApiError(error)
  }
}

const menuService = {
  getMenuHierarchy,
  getPOSMenu,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  uploadItemImage,
  deleteItemImage,
  updateCategoryOrder,
  moveItemUp,
  moveItemDown,
  exportMenu,
  exportMenuCsv,
}

export default menuService
