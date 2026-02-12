// Room Settings Management Service
import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'

class RoomSettingsService {
  // Get all room settings
  async getRoomSettings() {
    try {
      const response = await apiClient.get('/room-settings/')
      // Extract the data from the API response
      const apiData = response.data?.data || response.data || []
      return {
        success: true,
        data: apiData,
        message: 'Room settings fetched successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get room settings by section
  async getSettingsBySection(section) {
    try {
      const response = await apiClient.get(`/room-settings/by-section/${encodeURIComponent(section)}`)
      // Extract the data from the API response
      const apiData = response.data?.data || response.data || {}
      return {
        success: true,
        data: apiData,
        message: 'Settings fetched successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get all sections with their settings
  async getAllSections() {
    try {
      const response = await apiClient.get('/room-settings/by-section')
      // Extract the data from the API response (response.data contains {success: true, data: {...}})
      const apiData = response.data?.data || response.data || {}
      return {
        success: true,
        data: apiData,
        message: 'Sections fetched successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get setting by key
  async getSettingByKey(key, section, returnValueOnly = false) {
    try {
      const response = await apiClient.get(`/room-settings/key/${encodeURIComponent(key)}`, {
        params: { section }
      })
      // Extract the data from the API response
      const apiData = response.data?.data || response.data || {}
      if (returnValueOnly && apiData) {
        return {
          success: true,
          data: { value: apiData.value || apiData },
          message: 'Setting fetched successfully'
        }
      }
      return {
        success: true,
        data: apiData,
        message: 'Setting fetched successfully'
      }
    } catch (error) {
      // Return null for 404 (setting doesn't exist yet)
      if (error.response?.status === 404) {
        return {
          success: false,
          data: null,
          message: 'Setting not found'
        }
      }
      return handleApiError(error)
    }
  }

  // Create or update a setting
  async updateSetting(key, value, section, type = 'string') {
    try {
      const response = await apiClient.post('/room-settings/', {
        key,
        value,
        section,
        type
      })
      return {
        success: true,
        data: response.data,
        message: 'Setting updated successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Update multiple settings at once
  async updateAllSettings(settingsData) {
    try {
      const settingsArray = []
      
      // Transform settingsData object to array format
      Object.keys(settingsData).forEach(section => {
        Object.keys(settingsData[section]).forEach(key => {
          const value = settingsData[section][key]
          // Include all values except null/undefined (empty strings are allowed)
          if (value !== null && value !== undefined) {
            settingsArray.push({
              key,
              value: value === '' ? null : String(value), // Convert empty string to null
              section,
              type: typeof value === 'number' ? 'number' : 'string'
            })
          }
        })
      })

      const response = await apiClient.post('/room-settings/bulk', {
        settings: settingsArray
      })
      return {
        success: true,
        data: response.data,
        message: 'Settings updated successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Transform API response to form structure
  transformSettingsToForm(apiData) {
    const defaultData = {
      checkInOutTimes: {
        standard_checkin_time: '14:00',
        standard_checkout_time: '12:00',
        early_checkin_allowed: 'true',
        late_checkout_allowed: 'true',
        early_checkin_hours: '2',
        late_checkout_hours: '2'
      },
      roomGst: {
        cgst_percentage: '2.5',
        sgst_percentage: '2.5',
        service_tax_percentage: '0',
        gst_applicable: 'true'
      },
      roomInvoice: {
        invoice_prefix: 'ROOM',
        invoice_business_name: '',
        invoice_business_address: '',
        invoice_contact_phone: '',
        invoice_contact_email: '',
        invoice_footer_text: 'Thank you for staying with us!',
        invoice_terms: ''
      }
    }

    if (!apiData || typeof apiData !== 'object') {
      return defaultData
    }

    // Transform API data to form structure
    const formData = { ...defaultData }

    // Check-In/Check-Out Time Settings
    if (apiData['Check-In/Check-Out Time Settings']) {
      const timeData = apiData['Check-In/Check-Out Time Settings']
      Object.keys(defaultData.checkInOutTimes).forEach(key => {
        if (timeData.hasOwnProperty(key)) {
          formData.checkInOutTimes[key] = timeData[key] !== null && timeData[key] !== undefined 
            ? String(timeData[key]) 
            : defaultData.checkInOutTimes[key]
        }
      })
    }

    // Room GST Settings
    if (apiData['Room GST Settings']) {
      const gstData = apiData['Room GST Settings']
      Object.keys(defaultData.roomGst).forEach(key => {
        if (gstData.hasOwnProperty(key)) {
          formData.roomGst[key] = gstData[key] !== null && gstData[key] !== undefined 
            ? String(gstData[key]) 
            : defaultData.roomGst[key]
        }
      })
    }

    // Room Invoice Settings
    if (apiData['Room Invoice Settings']) {
      const invoiceData = apiData['Room Invoice Settings']
      Object.keys(defaultData.roomInvoice).forEach(key => {
        if (invoiceData.hasOwnProperty(key)) {
          formData.roomInvoice[key] = invoiceData[key] !== null && invoiceData[key] !== undefined 
            ? String(invoiceData[key]) 
            : defaultData.roomInvoice[key]
        }
      })
    }

    return formData
  }
}

const roomSettingsService = new RoomSettingsService()
export default roomSettingsService
export { roomSettingsService }

