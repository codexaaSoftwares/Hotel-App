// Settings Management Service
import apiClient from '../config/apiClient'
import { handleApiError } from '../utils/errorHandler'

class SettingsService {
  // Get all settings with optional filters
  async getSettings(params = {}) {
    try {
      const response = await apiClient.get('/global-settings/', { params })
      return {
        success: true,
        data: response.data,
        message: 'Settings fetched successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get settings by section
  async getSettingsBySection(section) {
    try {
      const response = await apiClient.get(`/global-settings/by-section/${encodeURIComponent(section)}`)
      return {
        success: true,
        data: response.data,
        message: 'Settings fetched successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get all sections with their settings
  async getAllSections() {
    try {
      const response = await apiClient.get('/global-settings/by-section')
      return {
        success: true,
        data: response.data,
        message: 'Sections fetched successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Send test email
  async sendTestEmail(email) {
    try {
      // Validate email format before sending
      if (!email || !email.trim()) {
        return {
          success: false,
          message: 'Email address is required'
        }
      }

      const emailRegex = /\S+@\S+\.\S+/
      if (!emailRegex.test(email.trim())) {
        return {
          success: false,
          message: 'Please enter a valid email address'
        }
      }

      const response = await apiClient.post('/settings/test-email', { 
        email: email.trim() 
      })
      
      return {
        success: true,
        data: response.data,
        message: response.data?.message || 'Test email sent successfully'
      }
    } catch (error) {
      const errorResponse = handleApiError(error)
      
      // Map validation errors to user-friendly messages
      if (errorResponse.status === 422 && errorResponse.errors) {
        const errorMessages = Object.values(errorResponse.errors).flat()
        return {
          success: false,
          message: errorMessages.join(', ') || 'Invalid email address',
          errors: errorResponse.errors
        }
      }
      
      return errorResponse
    }
  }

  // Get setting by ID
  async getSettingById(id) {
    try {
      const response = await apiClient.get(`/global-settings/${id}`)
      return {
        success: true,
        data: response.data,
        message: 'Setting fetched successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Get setting by key
  async getSettingByKey(key, section, suppressNotFoundError = false) {
    try {
      const params = {}
      if (section) {
        params.section = section
      }

      const response = await apiClient.get(`/global-settings/key/${encodeURIComponent(key)}`, {
        params,
      })

      return {
        success: true,
        data: response.data,
        message: 'Setting fetched successfully',
      }
    } catch (error) {
      // For 404 errors, if suppressNotFoundError is true, return a clean not found response
      // This is expected when checking if a setting exists before creating it
      if (suppressNotFoundError) {
        // Handle 404 from response
        if (error.response?.status === 404) {
          return {
            success: false,
            data: null,
            status: 404,
            error: 'not_found',
            message: 'Setting not found'
          }
        }
        // Handle network errors or errors without response (also treat as not found for settings lookup)
        if (!error.response) {
          return {
            success: false,
            data: null,
            status: 404,
            error: 'not_found',
            message: 'Setting not found'
          }
        }
      }
      return handleApiError(error)
    }
  }

  // Create new setting
  async createSetting(settingData) {
    try {
      const payload = { ...settingData }
      if (!payload.section) {
        payload.section = 'general'
      }
      if (payload.value === undefined || payload.value === null) {
        payload.value = ''
      }

      const response = await apiClient.post('/global-settings/', payload)
      return {
        success: true,
        data: response.data,
        message: 'Setting created successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Update setting by ID
  async updateSetting(id, settingData) {
    try {
      const response = await apiClient.put(`/global-settings/${id}`, settingData)
      return {
        success: true,
        data: response.data,
        message: 'Setting updated successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Update setting by key
  async updateSettingByKey(key, settingData, section) {
    try {
      const payload = { ...settingData }
      if (section) {
        payload.section = section
      }

      const response = await apiClient.put(`/global-settings/key/${encodeURIComponent(key)}`, payload)
      return {
        success: true,
        data: response.data,
        message: 'Setting updated successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Save or update a single setting by key (used for auto-save on change)
  async saveSetting(key, section, value) {
    const normalizedSection = section || 'general'
    // For boolean values, convert to 'true'/'false'
    let normalizedValue
    if (typeof value === 'boolean') {
      normalizedValue = value ? 'true' : 'false'
    } else {
      normalizedValue = value === undefined || value === null ? '' : String(value)
    }

    // Suppress 404 error logging when checking if setting exists (expected behavior)
    const lookup = await this.getSettingByKey(key, normalizedSection, true)

    if (lookup.success && lookup.data) {
      return this.updateSettingByKey(key, { value: normalizedValue }, normalizedSection)
    }

    if (lookup.status === 404 || lookup.error === 'not_found') {
      return this.createSetting({
        key,
        section: normalizedSection,
        value: normalizedValue,
      })
    }

    return lookup
  }

  // Delete setting by ID
  async deleteSetting(id) {
    try {
      await apiClient.delete(`/global-settings/${id}`)
      return {
        success: true,
        data: null,
        message: 'Setting deleted successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Delete setting by key
  async deleteSettingByKey(key, section) {
    try {
      const params = {}
      if (section) {
        params.section = section
      }

      await apiClient.delete(`/global-settings/key/${encodeURIComponent(key)}`, {
        params,
      })
      return {
        success: true,
        data: null,
        message: 'Setting deleted successfully',
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Update multiple settings at once (helper method)
  // This method will create settings if they don't exist, or update them if they do
  async updateAllSettings(settingsData) {
    try {
      // Define all settings that should exist with their mapping
      const settingsMapping = [
        // Business Information
        { key: 'company_name', section: 'Business Information', formPath: ['businessInfo', 'company_name'], type: 'string' },
        { key: 'business_email', section: 'Business Information', formPath: ['businessInfo', 'business_email'], type: 'string' },
        { key: 'business_phone', section: 'Business Information', formPath: ['businessInfo', 'business_phone'], type: 'string' },
        { key: 'business_website', section: 'Business Information', formPath: ['businessInfo', 'business_website'], type: 'string' },
        { key: 'gstNumber', section: 'Business Information', formPath: ['businessInfo', 'gstNumber'], type: 'string' },
        { key: 'businessAddress', section: 'Business Information', formPath: ['businessInfo', 'businessAddress'], type: 'string' },
        // Invoice Settings
        { key: 'invoice_prefix', section: 'Invoice Settings', formPath: ['invoiceSettings', 'invoice_prefix'], type: 'string' },
        { key: 'invoice_business_name', section: 'Invoice Settings', formPath: ['invoiceSettings', 'invoice_business_name'], type: 'string' },
        { key: 'invoice_business_website', section: 'Invoice Settings', formPath: ['invoiceSettings', 'invoice_business_website'], type: 'string' },
        { key: 'invoice_business_address', section: 'Invoice Settings', formPath: ['invoiceSettings', 'invoice_business_address'], type: 'string' },
        { key: 'invoice_contact_phone', section: 'Invoice Settings', formPath: ['invoiceSettings', 'invoice_contact_phone'], type: 'string' },
        { key: 'invoice_contact_email', section: 'Invoice Settings', formPath: ['invoiceSettings', 'invoice_contact_email'], type: 'string' },
        { key: 'invoice_footer_text', section: 'Invoice Settings', formPath: ['invoiceSettings', 'invoice_footer_text'], type: 'string' },
        // Email Settings
        { key: 'mailer', section: 'Email Settings', formPath: ['emailSettings', 'mailer'], type: 'string' },
        { key: 'host', section: 'Email Settings', formPath: ['emailSettings', 'host'], type: 'string' },
        { key: 'port', section: 'Email Settings', formPath: ['emailSettings', 'port'], type: 'string' },
        { key: 'username', section: 'Email Settings', formPath: ['emailSettings', 'username'], type: 'string' },
        { key: 'password', section: 'Email Settings', formPath: ['emailSettings', 'password'], type: 'string' },
        { key: 'encryption', section: 'Email Settings', formPath: ['emailSettings', 'encryption'], type: 'string' },
        { key: 'from_address', section: 'Email Settings', formPath: ['emailSettings', 'from_address'], type: 'string' },
        { key: 'from_name', section: 'Email Settings', formPath: ['emailSettings', 'from_name'], type: 'string' },
        // Currency & Regional
        { key: 'currency', section: 'Currency & Regional', formPath: ['currencyRegional', 'currency'], type: 'string' },
        { key: 'dateFormat', section: 'Currency & Regional', formPath: ['currencyRegional', 'dateFormat'], type: 'string' },
        { key: 'timeZone', section: 'Currency & Regional', formPath: ['currencyRegional', 'timeZone'], type: 'string' },
      ]

      // Get all current settings to check what exists
      const currentSettingsResponse = await this.getAllSections()
      const existingSettingsMap = new Map()
      
      if (currentSettingsResponse.success && currentSettingsResponse.data) {
        currentSettingsResponse.data.forEach(section => {
          if (section.settings && Array.isArray(section.settings)) {
            section.settings.forEach(setting => {
              existingSettingsMap.set(setting.key, setting)
            })
          }
        })
      }

      const errors = []
      const successes = []

      // Process each setting mapping
      for (const mapping of settingsMapping) {
        try {
          // Get value from form data
          const formValue = settingsData[mapping.formPath[0]]?.[mapping.formPath[1]]
          
          // Convert value to string for API
          let stringValue = ''
          if (mapping.type === 'number') {
            stringValue = String(formValue ?? 0)
          } else if (mapping.type === 'boolean') {
            stringValue = String(formValue ?? false)
          } else {
            stringValue = String(formValue ?? '')
          }


          // Check if setting exists
          const existingSetting = existingSettingsMap.get(mapping.key)
          
          if (existingSetting) {
            // Setting exists - update it only if value changed
            const currentValue = existingSetting.value || ''
            if (currentValue !== stringValue) {
              const updateResponse = await this.updateSettingByKey(mapping.key, { value: stringValue }, mapping.section)
              if (updateResponse.success) {
                successes.push(mapping.key)
              } else {
                errors.push({ key: mapping.key, error: updateResponse.message })
              }
            } else {
              // Value unchanged, skip update
              successes.push(mapping.key + ' (unchanged)')
            }
          } else {
            // Setting doesn't exist - create it
            const createResponse = await this.createSetting({
              key: mapping.key,
              section: mapping.section,
              value: stringValue
            })
            if (createResponse.success) {
              successes.push(mapping.key + ' (created)')
            } else {
              errors.push({ key: mapping.key, error: createResponse.message })
            }
          }
        } catch (err) {
          errors.push({ key: mapping.key, error: err.message || 'Unknown error' })
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          data: { successes, errors },
          message: `Some settings failed: ${errors.map(e => e.key).join(', ')}`
        }
    }

    return {
        success: true,
        data: { successes, errors: [] },
        message: 'All settings saved successfully'
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Helper method to find setting value in nested structure
  findSettingValue(settingsData, section, key) {
    // Map section names to settingsData keys
    const sectionMap = {
      'Business Information': 'businessInfo',
      'Invoice Settings': 'invoiceSettings',
      'Email Settings': 'emailSettings',
      'Currency & Regional': 'currencyRegional',
    }

    const sectionKey = sectionMap[section]
    if (!sectionKey || !settingsData[sectionKey]) {
      return undefined
    }

    // Map API keys to form field names
    const keyMap = {
      'company_name': 'company_name',
      'businessName': 'company_name',
      'business_email': 'business_email',
      'business_phone': 'business_phone',
      'business_website': 'business_website',
      'gstNumber': 'gstNumber',
      'businessAddress': 'businessAddress',
      'invoice_prefix': 'invoice_prefix',
      'supportEmail': 'supportEmail',
      'adminEmail': 'adminEmail',
      'enableOrderNotifications': 'enableOrderNotifications',
      'currency': 'currency',
      'dateFormat': 'dateFormat',
      'timeZone': 'timeZone',
      'enabled': 'enabled',
      'bucket': 'bucketName',
      'region': 'region',
      'key': 'accessKey',
      'secret': 'secretKey',
      'use_path_style': 'useSSL',
      'sessionTimeout': 'sessionTimeout',
      'passwordExpiry': 'passwordExpiry',
      'enableTwoFactor': 'enableTwoFactor'
    }

    const fieldName = keyMap[key] || key
    return settingsData[sectionKey][fieldName]
  }

  // Transform API settings response to form structure
  transformSettingsToForm(apiSections) {
    // Define default values - these will be used if API response is empty or missing fields
    const formData = {
      businessInfo: {
        company_name: 'Codexaa Base Project',
        business_email: '',
        business_phone: '',
        gstNumber: '',
        businessAddress: '',
      },
      invoiceSettings: {
        invoice_prefix: 'INV',
        invoice_business_name: '',
        invoice_business_website: '',
        invoice_business_address: '',
        invoice_contact_phone: '',
        invoice_contact_email: '',
        invoice_footer_text: '',
      },
      emailSettings: {
        mailer: 'smtp',
        host: '',
        port: '',
        username: '',
        password: '',
        encryption: 'tls',
        from_address: '',
        from_name: '',
      },
      currencyRegional: {
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'Asia/Kolkata',
      },
      appSettings: {
        web_url: '',
      }
    }

    // Key mapping from API keys to form structure
    // Fields with 'useDefaultIfEmpty: true' will use default value if API returns empty string
    const keyMapping = {
      'company_name': { section: 'Business Information', field: 'businessInfo', prop: 'company_name', type: 'string', useDefaultIfEmpty: true },
      'businessName': { section: 'Business Information', field: 'businessInfo', prop: 'company_name', type: 'string', useDefaultIfEmpty: true },
      'business_email': { section: 'Business Information', field: 'businessInfo', prop: 'business_email', type: 'string', useDefaultIfEmpty: false },
      'business_phone': { section: 'Business Information', field: 'businessInfo', prop: 'business_phone', type: 'string', useDefaultIfEmpty: false },
      'business_website': { section: 'Business Information', field: 'businessInfo', prop: 'business_website', type: 'string', useDefaultIfEmpty: false },
      'gstNumber': { section: 'Business Information', field: 'businessInfo', prop: 'gstNumber', type: 'string', useDefaultIfEmpty: false },
      'businessAddress': { section: 'Business Information', field: 'businessInfo', prop: 'businessAddress', type: 'string', useDefaultIfEmpty: false },
      'invoice_prefix': { section: 'Invoice Settings', field: 'invoiceSettings', prop: 'invoice_prefix', type: 'string', useDefaultIfEmpty: true },
      'invoice_business_name': { section: 'Invoice Settings', field: 'invoiceSettings', prop: 'invoice_business_name', type: 'string', useDefaultIfEmpty: false },
      'invoice_business_website': { section: 'Invoice Settings', field: 'invoiceSettings', prop: 'invoice_business_website', type: 'string', useDefaultIfEmpty: false },
      'invoice_business_address': { section: 'Invoice Settings', field: 'invoiceSettings', prop: 'invoice_business_address', type: 'string', useDefaultIfEmpty: false },
      'invoice_contact_phone': { section: 'Invoice Settings', field: 'invoiceSettings', prop: 'invoice_contact_phone', type: 'string', useDefaultIfEmpty: false },
      'invoice_contact_email': { section: 'Invoice Settings', field: 'invoiceSettings', prop: 'invoice_contact_email', type: 'string', useDefaultIfEmpty: false },
      'invoice_footer_text': { section: 'Invoice Settings', field: 'invoiceSettings', prop: 'invoice_footer_text', type: 'string', useDefaultIfEmpty: false },
      'mailer': { section: 'Email Settings', field: 'emailSettings', prop: 'mailer', type: 'string', useDefaultIfEmpty: true },
      'host': { section: 'Email Settings', field: 'emailSettings', prop: 'host', type: 'string', useDefaultIfEmpty: false },
      'port': { section: 'Email Settings', field: 'emailSettings', prop: 'port', type: 'string', useDefaultIfEmpty: false },
      'username': { section: 'Email Settings', field: 'emailSettings', prop: 'username', type: 'string', useDefaultIfEmpty: false },
      'password': { section: 'Email Settings', field: 'emailSettings', prop: 'password', type: 'string', useDefaultIfEmpty: false },
      'encryption': { section: 'Email Settings', field: 'emailSettings', prop: 'encryption', type: 'string', useDefaultIfEmpty: true },
      'from_address': { section: 'Email Settings', field: 'emailSettings', prop: 'from_address', type: 'string', useDefaultIfEmpty: false },
      'from_name': { section: 'Email Settings', field: 'emailSettings', prop: 'from_name', type: 'string', useDefaultIfEmpty: false },
      'currency': { section: 'Currency & Regional', field: 'currencyRegional', prop: 'currency', type: 'string', useDefaultIfEmpty: true },
      'dateFormat': { section: 'Currency & Regional', field: 'currencyRegional', prop: 'dateFormat', type: 'string', useDefaultIfEmpty: true },
      'timeZone': { section: 'Currency & Regional', field: 'currencyRegional', prop: 'timeZone', type: 'string', useDefaultIfEmpty: true },
      'web_url': { section: 'App Settings', field: 'appSettings', prop: 'web_url', type: 'string', useDefaultIfEmpty: false },
    }

    // If API response is null, undefined, or empty array, return defaults
    if (!apiSections || !Array.isArray(apiSections) || apiSections.length === 0) {
      return formData
    }

    // Process each section from API
    apiSections.forEach(section => {
      // Skip if section is invalid or has no settings
      if (!section || !section.settings || !Array.isArray(section.settings) || section.settings.length === 0) {
        return
      }

      // Process each setting in the section
      section.settings.forEach(setting => {
        // Skip if setting is invalid
        if (!setting || !setting.key) {
          return
        }

        const mapping = keyMapping[setting.key]
        if (!mapping || !formData[mapping.field]) {
          return
        }

        if (mapping.key === 'secret') {
          formData[mapping.field][mapping.prop] = ''
          return
        }

        let value = setting.value
        
        // Handle null/undefined - always use default
        if (value === null || value === undefined) {
          return // Keep default value
        }

        // Handle empty string for fields that should use defaults
        if (mapping.useDefaultIfEmpty && value === '') {
          return // Keep default value
        }

        // Special handling for port field - always use empty string if value is '587' (old default)
        if (mapping.prop === 'port' && value === '587') {
          formData[mapping.field][mapping.prop] = ''
          return
        }

        // Convert value based on type
        if (mapping.type === 'number') {
          const numValue = parseFloat(value)
          // If conversion fails, keep default; otherwise use parsed value or 0
          if (!isNaN(numValue)) {
            formData[mapping.field][mapping.prop] = numValue
          }
          // If NaN, keep default (don't update)
        } else if (mapping.type === 'boolean') {
          // Convert various boolean representations
          formData[mapping.field][mapping.prop] = (
            value === 'true' || 
            value === true || 
            value === '1' || 
            value === 1
          )
        } else {
          // String type - use the value (even if empty string, unless useDefaultIfEmpty is true)
          formData[mapping.field][mapping.prop] = value
        }
      })
    })

    return formData
  }

  // Upload business logo
  async uploadLogo(file) {
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await apiClient.post('/settings/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Logo uploaded successfully',
        }
      }

      return {
        success: false,
        message: response.data.message || 'Failed to upload logo',
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Delete business logo
  async deleteLogo() {
    try {
      const response = await apiClient.delete('/settings/delete-logo')
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Logo deleted successfully',
        }
      }

      return {
        success: false,
        message: response.data.message || 'Failed to delete logo',
      }
    } catch (error) {
      return handleApiError(error)
    }
  }
}

// Create and export service instance
export const settingsService = new SettingsService()

// Export class for testing
export { SettingsService }

export default settingsService
