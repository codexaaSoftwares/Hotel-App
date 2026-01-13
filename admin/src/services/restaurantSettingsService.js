// Restaurant Settings Management Service
import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'

class RestaurantSettingsService {
  // Get all restaurant settings
  async getRestaurantSettings() {
    try {
      const response = await apiClient.get('/restaurant-settings/')
      // Extract the data from the API response
      const apiData = response.data?.data || response.data || []
      return {
        success: true,
        data: apiData,
        message: 'Restaurant settings fetched successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get restaurant settings by section
  async getSettingsBySection(section) {
    try {
      const response = await apiClient.get(`/restaurant-settings/by-section/${encodeURIComponent(section)}`)
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
      const response = await apiClient.get('/restaurant-settings/by-section')
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
      const response = await apiClient.get(`/restaurant-settings/key/${encodeURIComponent(key)}`, {
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
      const response = await apiClient.post('/restaurant-settings/', {
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

      const response = await apiClient.post('/restaurant-settings/bulk', {
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
      gstSettings: {
        cgst_percentage: '2.5',
        sgst_percentage: '2.5',
        service_tax_percentage: '0',
        round_number_enabled: 'false'
      },
      invoiceSettings: {
        invoice_prefix: 'BILL',
        invoice_business_name: '',
        invoice_business_address: '',
        invoice_contact_phone: '',
        invoice_contact_email: '',
        invoice_footer_text: 'Thank you for visiting!',
        invoice_other_text: ''
      },
      thermalPrinter: {
        printer_name: '',
        printer_ip: '',
        printer_port: '9100',
        paper_width: '80', // 80mm
        enabled: 'true'
      }
    }

    if (!apiData || typeof apiData !== 'object') {
      return defaultData
    }

    // Transform API data to form structure
    const formData = { ...defaultData }

    // GST Settings
    if (apiData['GST Settings']) {
      const gstData = apiData['GST Settings']
      if (gstData.hasOwnProperty('cgst_percentage')) {
        formData.gstSettings.cgst_percentage = gstData.cgst_percentage !== null && gstData.cgst_percentage !== undefined 
          ? String(gstData.cgst_percentage) 
          : '2.5'
      }
      if (gstData.hasOwnProperty('sgst_percentage')) {
        formData.gstSettings.sgst_percentage = gstData.sgst_percentage !== null && gstData.sgst_percentage !== undefined 
          ? String(gstData.sgst_percentage) 
          : '2.5'
      }
      if (gstData.hasOwnProperty('service_tax_percentage')) {
        formData.gstSettings.service_tax_percentage = gstData.service_tax_percentage !== null && gstData.service_tax_percentage !== undefined 
          ? String(gstData.service_tax_percentage) 
          : '0'
      }
      if (gstData.hasOwnProperty('round_number_enabled')) {
        formData.gstSettings.round_number_enabled = gstData.round_number_enabled !== null && gstData.round_number_enabled !== undefined 
          ? String(gstData.round_number_enabled) 
          : 'false'
      }
      // Legacy support: If old default_gst_percentage exists, split it into CGST and SGST
      if (gstData.hasOwnProperty('default_gst_percentage') && !gstData.hasOwnProperty('cgst_percentage')) {
        const oldGst = parseFloat(gstData.default_gst_percentage) || 5
        formData.gstSettings.cgst_percentage = String(oldGst / 2)
        formData.gstSettings.sgst_percentage = String(oldGst / 2)
      }
    }

    // Invoice Settings
    if (apiData['Invoice Settings']) {
      const invoiceData = apiData['Invoice Settings']
      if (invoiceData.hasOwnProperty('invoice_prefix')) {
        formData.invoiceSettings.invoice_prefix = invoiceData.invoice_prefix !== null && invoiceData.invoice_prefix !== undefined 
          ? String(invoiceData.invoice_prefix) 
          : ''
      }
      if (invoiceData.hasOwnProperty('invoice_business_name')) {
        formData.invoiceSettings.invoice_business_name = invoiceData.invoice_business_name !== null && invoiceData.invoice_business_name !== undefined 
          ? String(invoiceData.invoice_business_name) 
          : ''
      }
      if (invoiceData.hasOwnProperty('invoice_business_address')) {
        formData.invoiceSettings.invoice_business_address = invoiceData.invoice_business_address !== null && invoiceData.invoice_business_address !== undefined 
          ? String(invoiceData.invoice_business_address) 
          : ''
      }
      if (invoiceData.hasOwnProperty('invoice_contact_phone')) {
        formData.invoiceSettings.invoice_contact_phone = invoiceData.invoice_contact_phone !== null && invoiceData.invoice_contact_phone !== undefined 
          ? String(invoiceData.invoice_contact_phone) 
          : ''
      }
      if (invoiceData.hasOwnProperty('invoice_contact_email')) {
        formData.invoiceSettings.invoice_contact_email = invoiceData.invoice_contact_email !== null && invoiceData.invoice_contact_email !== undefined 
          ? String(invoiceData.invoice_contact_email) 
          : ''
      }
      if (invoiceData.hasOwnProperty('invoice_footer_text')) {
        formData.invoiceSettings.invoice_footer_text = invoiceData.invoice_footer_text !== null && invoiceData.invoice_footer_text !== undefined 
          ? String(invoiceData.invoice_footer_text) 
          : ''
      }
      if (invoiceData.hasOwnProperty('invoice_other_text')) {
        formData.invoiceSettings.invoice_other_text = invoiceData.invoice_other_text !== null && invoiceData.invoice_other_text !== undefined 
          ? String(invoiceData.invoice_other_text) 
          : ''
      }
    }

    // Thermal Printer Settings
    if (apiData['Thermal Printer']) {
      const printerData = apiData['Thermal Printer']
      if (printerData.hasOwnProperty('printer_name')) {
        formData.thermalPrinter.printer_name = printerData.printer_name !== null && printerData.printer_name !== undefined 
          ? String(printerData.printer_name) 
          : ''
      }
      if (printerData.hasOwnProperty('printer_ip')) {
        formData.thermalPrinter.printer_ip = printerData.printer_ip !== null && printerData.printer_ip !== undefined 
          ? String(printerData.printer_ip) 
          : ''
      }
      if (printerData.hasOwnProperty('printer_port')) {
        formData.thermalPrinter.printer_port = printerData.printer_port !== null && printerData.printer_port !== undefined 
          ? String(printerData.printer_port) 
          : '9100'
      }
      if (printerData.hasOwnProperty('paper_width')) {
        formData.thermalPrinter.paper_width = printerData.paper_width !== null && printerData.paper_width !== undefined 
          ? String(printerData.paper_width) 
          : '80'
      }
      if (printerData.hasOwnProperty('enabled')) {
        formData.thermalPrinter.enabled = printerData.enabled !== null && printerData.enabled !== undefined 
          ? String(printerData.enabled) 
          : 'true'
      }
    }

    return formData
  }
}

const restaurantSettingsService = new RestaurantSettingsService()
export default restaurantSettingsService
export { restaurantSettingsService }

