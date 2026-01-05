import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Container, Row, Col, Button, Spinner, Form, FormControl, FormSelect, FormText, Alert } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faEnvelope, faGlobe, faSave, faCheckCircle, faFileInvoice, faPaperPlane, faCog, faImage, faUpload, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../components'
import { settingsService } from '../../services/settingsService'
import { usePermissions } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const Settings = () => {
  const { hasPermission } = usePermissions()
  const { success, error, warning } = useToast()

  const canViewSettings = hasPermission
    ? hasPermission(PERMISSIONS.SETTINGS_READ) || hasPermission(PERMISSIONS.SETTINGS_WRITE)
    : true
  const canEditSettings = hasPermission
    ? hasPermission(PERMISSIONS.SETTINGS_WRITE)
    : true
  const isReadOnly = !canEditSettings

  const [settingsData, setSettingsData] = useState({
    businessInfo: {
      company_name: 'Codexaa Base Project',
      business_email: '',
      business_phone: '',
      business_website: '',
      gstNumber: '',
      businessAddress: ''
    },
    invoiceSettings: {
      invoice_prefix: 'INV',
      invoice_business_name: '',
      invoice_business_website: '',
      invoice_business_address: '',
      invoice_contact_phone: '',
      invoice_contact_email: '',
      invoice_footer_text: ''
    },
    emailSettings: {
      mailer: 'smtp',
      host: '',
      port: '',
      username: '',
      password: '',
      encryption: 'tls',
      from_address: '',
      from_name: ''
    },
    currencyRegional: {
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      timeZone: 'Asia/Kolkata'
    },
    appSettings: {
      web_url: ''
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [autoSaving, setAutoSaving] = useState({}) // Track which fields are auto-saving
  const [autoSaved, setAutoSaved] = useState({}) // Track which fields were recently saved
  const [testEmailAddress, setTestEmailAddress] = useState('')
  const [sendingTestEmail, setSendingTestEmail] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const fileInputRef = useRef(null)
  
  const isInitialLoadRef = useRef(true) // Track if we're still loading initial data
  
  // Mapping from form fields to API keys and sections
  const fieldMapping = {
    'businessInfo.company_name': { key: 'company_name', section: 'Business Information' },
    'businessInfo.business_email': { key: 'business_email', section: 'Business Information' },
    'businessInfo.business_phone': { key: 'business_phone', section: 'Business Information' },
    'businessInfo.business_website': { key: 'business_website', section: 'Business Information' },
    'businessInfo.gstNumber': { key: 'gstNumber', section: 'Business Information' },
    'businessInfo.businessAddress': { key: 'businessAddress', section: 'Business Information' },
    'invoiceSettings.invoice_prefix': { key: 'invoice_prefix', section: 'Invoice Settings' },
    'invoiceSettings.invoice_business_name': { key: 'invoice_business_name', section: 'Invoice Settings' },
    'invoiceSettings.invoice_business_website': { key: 'invoice_business_website', section: 'Invoice Settings' },
    'invoiceSettings.invoice_business_address': { key: 'invoice_business_address', section: 'Invoice Settings' },
    'invoiceSettings.invoice_contact_phone': { key: 'invoice_contact_phone', section: 'Invoice Settings' },
    'invoiceSettings.invoice_contact_email': { key: 'invoice_contact_email', section: 'Invoice Settings' },
    'invoiceSettings.invoice_footer_text': { key: 'invoice_footer_text', section: 'Invoice Settings' },
    'emailSettings.mailer': { key: 'mailer', section: 'Email Settings' },
    'emailSettings.host': { key: 'host', section: 'Email Settings' },
    'emailSettings.port': { key: 'port', section: 'Email Settings' },
    'emailSettings.username': { key: 'username', section: 'Email Settings' },
    'emailSettings.password': { key: 'password', section: 'Email Settings' },
    'emailSettings.encryption': { key: 'encryption', section: 'Email Settings' },
    'emailSettings.from_address': { key: 'from_address', section: 'Email Settings' },
    'emailSettings.from_name': { key: 'from_name', section: 'Email Settings' },
    'currencyRegional.currency': { key: 'currency', section: 'Currency & Regional' },
    'currencyRegional.dateFormat': { key: 'dateFormat', section: 'Currency & Regional' },
    'currencyRegional.timeZone': { key: 'timeZone', section: 'Currency & Regional' },
    'appSettings.web_url': { key: 'web_url', section: 'App Settings' }
  }

  useEffect(() => {
    if (!canViewSettings) {
      setLoading(false)
      warning && warning('You do not have permission to view settings.', { title: 'Access restricted' })
      return
    }

    const fetchSettings = async () => {
      setLoading(true)
      try {
        const response = await settingsService.getAllSections()
        if (response.success) {
          // Transform API response to form structure
          // transformSettingsToForm handles empty/null/undefined responses and returns defaults
          const transformedData = settingsService.transformSettingsToForm(response.data)
          setSettingsData(transformedData)
          // Mark initial load as complete
          isInitialLoadRef.current = false
        } else {
          // If API call fails, use default values
          error(response.message || 'Failed to load settings. Using default values.')
          // transformSettingsToForm will return defaults when passed null/undefined
          const defaultData = settingsService.transformSettingsToForm(null)
          setSettingsData(defaultData)
          isInitialLoadRef.current = false
        }
        
        // Load business logo
        const logoResponse = await settingsService.getSettingByKey('business_logo', 'Business Information', true)
        if (logoResponse.success && logoResponse.data && logoResponse.data.value) {
          const logoPath = logoResponse.data.value
          // Convert storage path to URL
          // For subdirectory installations like /admin/api, storage is at /admin/api/storage/
          let logoUrl
          if (logoPath.startsWith('http')) {
            // Already a full URL, use it as is
            logoUrl = logoPath
          } else {
            // Construct URL from API base URL
            let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
            // Remove trailing slash if present
            baseUrl = baseUrl.replace(/\/+$/, '')
            // For subdirectory installations (/admin/api), storage is at /admin/api/storage/
            // If baseUrl includes /admin/api, use it as is
            if (baseUrl.includes('/admin/api')) {
              logoUrl = `${baseUrl}/storage/${logoPath}`
            } else if (baseUrl.includes('/admin')) {
              // If baseUrl is /admin, add /api/storage
              logoUrl = `${baseUrl}/api/storage/${logoPath}`
            } else {
              // For root installations, remove /api if present and add /storage
              baseUrl = baseUrl.replace(/\/api\/?$/, '')
              logoUrl = `${baseUrl}/storage/${logoPath}`
            }
          }
          
          // Add cache busting to prevent browser caching issues
          const logoUrlWithCache = `${logoUrl}?t=${Date.now()}`
          setLogoPreview(logoUrlWithCache)
        }
      } catch (err) {
        // If error occurs, use default values
        error('Failed to load settings. Using default values.')
        console.error('Error fetching settings:', err)
        const defaultData = settingsService.transformSettingsToForm(null)
        setSettingsData(defaultData)
        isInitialLoadRef.current = false
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewSettings, warning])

  // Auto-save function (triggered on blur)
  const autoSaveSetting = useCallback(async (fieldPath, key, section, value) => {
    if (!canEditSettings) {
      return
    }

    const fieldId = fieldPath
    
    // Set auto-saving state
    setAutoSaving(prev => ({ ...prev, [fieldId]: true }))
    
    // Clear auto-saved indicator
    setAutoSaved(prev => {
      const newState = { ...prev }
      delete newState[fieldId]
      return newState
    })

    try {
      const response = await settingsService.saveSetting(key, section, value)
      if (response.success) {
        // Show success indicator
        setAutoSaved(prev => ({ ...prev, [fieldId]: true }))
        // Clear indicator after 2 seconds
        setTimeout(() => {
          setAutoSaved(prev => {
            const newState = { ...prev }
            delete newState[fieldId]
            return newState
          })
        }, 2000)
      } else {
        error(`Failed to save ${key}: ${response.message}`)
      }
    } catch (err) {
      error(`Failed to save ${key}. Please try again.`)
      console.error('Auto-save error:', err)
    } finally {
      setAutoSaving(prev => {
        const newState = { ...prev }
        delete newState[fieldId]
        return newState
      })
    }
  }, [error, canEditSettings])

  const handleChange = (section, field, value) => {
    if (!canEditSettings) {
      warning && warning('You do not have permission to modify settings.', { title: 'Read only' })
      return
    }
    const fieldPath = `${section}.${field}`
    
    // Update form data
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    
    // Clear error if exists
    if (errors[fieldPath]) {
      setErrors(prev => ({
        ...prev,
        [fieldPath]: ''
      }))
    }
  }

  // Handle blur event (save when field loses focus)
  const handleBlur = (section, field, value) => {
    if (!canEditSettings) {
      return
    }
    const fieldPath = `${section}.${field}`
    
    // Don't auto-save email settings on blur - they should be saved together via "Save Email Settings" button
    if (section === 'emailSettings') {
      return
    }
    
    // Auto-save if field mapping exists and not during initial load
    if (!isInitialLoadRef.current) {
      const mapping = fieldMapping[fieldPath]
      if (mapping) {
        autoSaveSetting(fieldPath, mapping.key, mapping.section, value)
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Validate Business Information
    if (!settingsData.businessInfo.company_name?.trim()) {
      newErrors['businessInfo.company_name'] = 'Company name is required'
    }

    const emailRegex = /\S+@\S+\.\S+/
    if (settingsData.businessInfo.business_email && !emailRegex.test(settingsData.businessInfo.business_email)) {
      newErrors['businessInfo.business_email'] = 'Please enter a valid business email address'
    }

    const phoneRegex = /^[0-9+()\-\s]{6,20}$/
    if (settingsData.businessInfo.business_phone && !phoneRegex.test(settingsData.businessInfo.business_phone)) {
      newErrors['businessInfo.business_phone'] = 'Please enter a valid phone number'
    }

    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/
    if (settingsData.businessInfo.business_website && !urlRegex.test(settingsData.businessInfo.business_website.trim())) {
      newErrors['businessInfo.business_website'] = 'Please enter a valid website URL'
    }

    // Validate Email Settings
    if (settingsData.emailSettings.from_address && !emailRegex.test(settingsData.emailSettings.from_address)) {
      newErrors['emailSettings.from_address'] = 'Please enter a valid email address'
    }
    if (settingsData.emailSettings.host && !settingsData.emailSettings.host.trim()) {
      newErrors['emailSettings.host'] = 'SMTP Host is required'
    }
    if (settingsData.emailSettings.port && (!/^\d+$/.test(settingsData.emailSettings.port) || parseInt(settingsData.emailSettings.port) < 1 || parseInt(settingsData.emailSettings.port) > 65535)) {
      newErrors['emailSettings.port'] = 'Please enter a valid port number (1-65535)'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveAll = async () => {
    if (!canEditSettings) {
      error('You do not have permission to update settings.')
      return
    }
    
    if (!validateForm()) {
      error('Please fix the validation errors before saving')
      return
    }
    
    setSaving(true)
    try {
      const response = await settingsService.updateAllSettings(settingsData)
      if (response.success) {
        success('All settings saved successfully!')
      } else {
        error(response.message || 'Failed to save settings')
      }
    } catch (err) {
      error('Failed to save settings. Please try again.')
    }
    setSaving(false)
  }

  // Handle logo upload
  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      error('Please upload a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      error('Image size must be less than 2MB')
      return
    }

    setUploadingLogo(true)
    try {
      const result = await settingsService.uploadLogo(file)
      if (result.success) {
        success('Logo uploaded successfully')
        // Use URL from backend response, add cache busting
        const logoUrl = result.data.url || result.data.path
        const logoUrlWithCache = logoUrl ? `${logoUrl}?t=${Date.now()}` : null
        setLogoPreview(logoUrlWithCache)
        
        // Update localStorage settings for immediate sidebar update
        try {
          const settingsStr = localStorage.getItem('app_settings')
          const settings = settingsStr ? JSON.parse(settingsStr) : {}
          settings.business_logo = logoUrl
          settings.business_logo_path = result.data.path
          localStorage.setItem('app_settings', JSON.stringify(settings))
          // Dispatch custom event for sidebar to update (same-tab)
          window.dispatchEvent(new CustomEvent('settingsUpdated', {
            detail: settings
          }))
        } catch (err) {
          console.warn('Failed to update localStorage settings:', err)
        }
      } else {
        error(result.message || 'Failed to upload logo')
      }
    } catch (err) {
      error('Failed to upload logo')
      console.error('Logo upload error:', err)
    } finally {
      setUploadingLogo(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = async () => {
    if (!canEditSettings) {
      error('You do not have permission to delete logo.')
      return
    }

    try {
      const result = await settingsService.deleteLogo()
      if (result.success) {
        success('Logo deleted successfully')
        setLogoPreview(null)
        // Clear the logo from settings data
        setSettingsData(prev => ({
          ...prev,
          businessInfo: { ...prev.businessInfo, business_logo: '' }
        }))
        
        // Update localStorage settings for immediate sidebar update
        try {
          const settingsStr = localStorage.getItem('app_settings')
          const settings = settingsStr ? JSON.parse(settingsStr) : {}
          settings.business_logo = null
          settings.business_logo_path = null
          localStorage.setItem('app_settings', JSON.stringify(settings))
          // Dispatch custom event for sidebar to update (same-tab)
          window.dispatchEvent(new CustomEvent('settingsUpdated', {
            detail: settings
          }))
        } catch (err) {
          console.warn('Failed to update localStorage settings:', err)
        }
      } else {
        error(result.message || 'Failed to delete logo')
      }
    } catch (err) {
      error('Failed to delete logo. Please try again.')
      console.error('Logo deletion error:', err)
    }
  }

  const renderBusinessInfo = () => (
    <div className="mb-5">
      {/* Section Header */}
      <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-success border-2">
        <FontAwesomeIcon icon={faBuilding} className="me-3 text-success fs-4" />
        <h4 className="mb-0 text-success">Business Information</h4>
      </div>

      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Company Name
              {autoSaving['businessInfo.company_name'] && (
                <Spinner size="sm" className="ms-2" variant="primary" />
              )}
              {autoSaved['businessInfo.company_name'] && (
                <FontAwesomeIcon icon={faCheckCircle} className="ms-2 text-success" />
              )}
            </Form.Label>
            <FormControl
              value={settingsData.businessInfo.company_name}
              onChange={(e) => handleChange('businessInfo', 'company_name', e.target.value)}
              onBlur={(e) => handleBlur('businessInfo', 'company_name', e.target.value)}
              isInvalid={!!errors['businessInfo.company_name']}
              className="border-2"
            />
            {errors['businessInfo.company_name'] && (
              <FormText className="text-danger">{errors['businessInfo.company_name']}</FormText>
            )}
          </Form.Group>
        </Col>
      </Row>
      
      {/* Logo Upload Section */}
      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <FontAwesomeIcon icon={faImage} className="me-2" />
              Business Logo
            </Form.Label>
            <div className="d-flex align-items-start gap-3">
              {logoPreview && (
                <div className="position-relative" style={{ minWidth: '120px' }}>
                  <img
                    src={logoPreview}
                    alt="Business Logo"
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'contain',
                      border: '2px solid #dee2e6',
                      borderRadius: '8px',
                      padding: '8px',
                      backgroundColor: '#f8f9fa'
                    }}
                    onError={() => {
                      setLogoPreview(null)
                      error('Failed to load logo image')
                    }}
                  />
                  {!isReadOnly && (
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0"
                      style={{ transform: 'translate(50%, -50%)' }}
                      onClick={handleRemoveLogo}
                      title="Remove logo"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                  )}
                </div>
              )}
              <div className="flex-grow-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleLogoUpload}
                  disabled={isReadOnly || uploadingLogo}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outline-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isReadOnly || uploadingLogo}
                  className="mb-2"
                >
                  {uploadingLogo ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUpload} className="me-2" />
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </>
                  )}
                </Button>
                <FormText className="d-block text-muted">
                  Upload your business logo (JPEG, PNG, or WebP, max 2MB). This logo will appear on all PDF exports.
                </FormText>
              </div>
            </div>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">GST Number</Form.Label>
            <FormControl
              placeholder="Enter GST registration number"
              value={settingsData.businessInfo.gstNumber}
              onChange={(e) => handleChange('businessInfo', 'gstNumber', e.target.value)}
              onBlur={(e) => handleBlur('businessInfo', 'gstNumber', e.target.value)}
              className="border-2"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Business Email
              {autoSaving['businessInfo.business_email'] && (
                <Spinner size="sm" className="ms-2" variant="primary" />
              )}
              {autoSaved['businessInfo.business_email'] && (
                <FontAwesomeIcon icon={faCheckCircle} className="ms-2 text-success" />
              )}
            </Form.Label>
            <FormControl
              type="email"
              placeholder="contact@yourcompany.com"
              value={settingsData.businessInfo.business_email}
              onChange={(e) => handleChange('businessInfo', 'business_email', e.target.value)}
              onBlur={(e) => handleBlur('businessInfo', 'business_email', e.target.value)}
              className="border-2"
              isInvalid={!!errors['businessInfo.business_email']}
            />
            {errors['businessInfo.business_email'] && (
              <FormText className="text-danger">{errors['businessInfo.business_email']}</FormText>
            )}
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Business Phone
              {autoSaving['businessInfo.business_phone'] && (
                <Spinner size="sm" className="ms-2" variant="primary" />
              )}
              {autoSaved['businessInfo.business_phone'] && (
                <FontAwesomeIcon icon={faCheckCircle} className="ms-2 text-success" />
              )}
            </Form.Label>
            <FormControl
              placeholder="+91 98765 43210"
              value={settingsData.businessInfo.business_phone}
              onChange={(e) => handleChange('businessInfo', 'business_phone', e.target.value)}
              onBlur={(e) => handleBlur('businessInfo', 'business_phone', e.target.value)}
              className="border-2"
              isInvalid={!!errors['businessInfo.business_phone']}
            />
            {errors['businessInfo.business_phone'] && (
              <FormText className="text-danger">{errors['businessInfo.business_phone']}</FormText>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Business Website
              {autoSaving['businessInfo.business_website'] && (
                <Spinner size="sm" className="ms-2" variant="primary" />
              )}
              {autoSaved['businessInfo.business_website'] && (
                <FontAwesomeIcon icon={faCheckCircle} className="ms-2 text-success" />
              )}
            </Form.Label>
            <FormControl
              placeholder="https://www.yourcompany.com"
              value={settingsData.businessInfo.business_website}
              onChange={(e) => handleChange('businessInfo', 'business_website', e.target.value)}
              onBlur={(e) => handleBlur('businessInfo', 'business_website', e.target.value)}
              className="border-2"
              isInvalid={!!errors['businessInfo.business_website']}
            />
            {errors['businessInfo.business_website'] && (
              <FormText className="text-danger">{errors['businessInfo.business_website']}</FormText>
            )}
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Business Address</Form.Label>
            <FormControl
              as="textarea"
              rows={3}
              value={settingsData.businessInfo.businessAddress}
              onChange={(e) => handleChange('businessInfo', 'businessAddress', e.target.value)}
              onBlur={(e) => handleBlur('businessInfo', 'businessAddress', e.target.value)}
              className="border-2"
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  )

  const renderInvoiceSettings = () => (
    <div className="mb-5">
      {/* Section Header */}
      <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-success border-2">
        <FontAwesomeIcon icon={faFileInvoice} className="me-3 text-success fs-4" />
        <h4 className="mb-0 text-success">Invoice Settings</h4>
      </div>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Invoice Prefix
              {autoSaving['invoiceSettings.invoice_prefix'] && (
                <Spinner size="sm" className="ms-2" variant="primary" />
              )}
              {autoSaved['invoiceSettings.invoice_prefix'] && (
                <FontAwesomeIcon icon={faCheckCircle} className="ms-2 text-success" />
              )}
            </Form.Label>
            <FormControl
              placeholder="INV"
              value={settingsData.invoiceSettings.invoice_prefix}
              onChange={(e) => handleChange('invoiceSettings', 'invoice_prefix', e.target.value)}
              onBlur={(e) => handleBlur('invoiceSettings', 'invoice_prefix', e.target.value)}
              className="border-2"
            />
            <FormText className="text-muted">Prefix for invoice numbers (e.g., INV-001, ORD-001)</FormText>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Invoice Business Name
              {autoSaving['invoiceSettings.invoice_business_name'] && (
                <Spinner size="sm" className="ms-2" variant="primary" />
              )}
              {autoSaved['invoiceSettings.invoice_business_name'] && (
                <FontAwesomeIcon icon={faCheckCircle} className="ms-2 text-success" />
              )}
            </Form.Label>
            <FormControl
              placeholder="Your Business Name"
              value={settingsData.invoiceSettings.invoice_business_name}
              onChange={(e) => handleChange('invoiceSettings', 'invoice_business_name', e.target.value)}
              onBlur={(e) => handleBlur('invoiceSettings', 'invoice_business_name', e.target.value)}
              className="border-2"
            />
            <FormText className="text-muted">Business name to display on invoices</FormText>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Invoice Business Website
              {autoSaving['invoiceSettings.invoice_business_website'] && (
                <Spinner size="sm" className="ms-2" variant="primary" />
              )}
              {autoSaved['invoiceSettings.invoice_business_website'] && (
                <FontAwesomeIcon icon={faCheckCircle} className="ms-2 text-success" />
              )}
            </Form.Label>
            <FormControl
              placeholder="https://www.example.com"
              value={settingsData.invoiceSettings.invoice_business_website}
              onChange={(e) => handleChange('invoiceSettings', 'invoice_business_website', e.target.value)}
              onBlur={(e) => handleBlur('invoiceSettings', 'invoice_business_website', e.target.value)}
              className="border-2"
            />
            <FormText className="text-muted">Business website URL to display on invoices</FormText>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Invoice Business Address
              {autoSaving['invoiceSettings.invoice_business_address'] && (
                <Spinner size="sm" className="ms-2" variant="primary" />
              )}
              {autoSaved['invoiceSettings.invoice_business_address'] && (
                <FontAwesomeIcon icon={faCheckCircle} className="ms-2 text-success" />
              )}
            </Form.Label>
            <FormControl
              as="textarea"
              rows={3}
              placeholder="Street Address, City, State, ZIP Code"
              value={settingsData.invoiceSettings.invoice_business_address}
              onChange={(e) => handleChange('invoiceSettings', 'invoice_business_address', e.target.value)}
              onBlur={(e) => handleBlur('invoiceSettings', 'invoice_business_address', e.target.value)}
              className="border-2"
            />
            <FormText className="text-muted">Complete business address to display on invoices</FormText>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Invoice Contact Phone
              {autoSaving['invoiceSettings.invoice_contact_phone'] && (
                <Spinner size="sm" className="ms-2" variant="primary" />
              )}
              {autoSaved['invoiceSettings.invoice_contact_phone'] && (
                <FontAwesomeIcon icon={faCheckCircle} className="ms-2 text-success" />
              )}
            </Form.Label>
            <FormControl
              placeholder="+1 234 567 8900"
              value={settingsData.invoiceSettings.invoice_contact_phone}
              onChange={(e) => handleChange('invoiceSettings', 'invoice_contact_phone', e.target.value)}
              onBlur={(e) => handleBlur('invoiceSettings', 'invoice_contact_phone', e.target.value)}
              className="border-2"
            />
            <FormText className="text-muted">Contact phone number to display on invoices</FormText>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Invoice Contact Email
              {autoSaving['invoiceSettings.invoice_contact_email'] && (
                <Spinner size="sm" className="ms-2" variant="primary" />
              )}
              {autoSaved['invoiceSettings.invoice_contact_email'] && (
                <FontAwesomeIcon icon={faCheckCircle} className="ms-2 text-success" />
              )}
            </Form.Label>
            <FormControl
              type="email"
              placeholder="contact@example.com"
              value={settingsData.invoiceSettings.invoice_contact_email}
              onChange={(e) => handleChange('invoiceSettings', 'invoice_contact_email', e.target.value)}
              onBlur={(e) => handleBlur('invoiceSettings', 'invoice_contact_email', e.target.value)}
              className="border-2"
            />
            <FormText className="text-muted">Contact email address to display on invoices</FormText>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Invoice Footer Text
              {autoSaving['invoiceSettings.invoice_footer_text'] && (
                <Spinner size="sm" className="ms-2" variant="primary" />
              )}
              {autoSaved['invoiceSettings.invoice_footer_text'] && (
                <FontAwesomeIcon icon={faCheckCircle} className="ms-2 text-success" />
              )}
            </Form.Label>
            <FormControl
              as="textarea"
              rows={3}
              placeholder="Thank you for your business!"
              value={settingsData.invoiceSettings.invoice_footer_text}
              onChange={(e) => handleChange('invoiceSettings', 'invoice_footer_text', e.target.value)}
              onBlur={(e) => handleBlur('invoiceSettings', 'invoice_footer_text', e.target.value)}
              className="border-2"
            />
            <FormText className="text-muted">Footer text/message to display at the bottom of invoices</FormText>
          </Form.Group>
        </Col>
      </Row>
    </div>
  )

  const handleSaveEmailSettings = async () => {
    if (!canEditSettings) {
      error('You do not have permission to update settings.')
      return
    }

    // Validate email settings
    const emailRegex = /\S+@\S+\.\S+/
    const newErrors = {}
    
    if (!settingsData.emailSettings.host?.trim()) {
      newErrors['emailSettings.host'] = 'SMTP Host is required'
    }
    if (!settingsData.emailSettings.port?.trim()) {
      newErrors['emailSettings.port'] = 'SMTP Port is required'
    }
    if (!/^\d+$/.test(settingsData.emailSettings.port) || parseInt(settingsData.emailSettings.port) < 1 || parseInt(settingsData.emailSettings.port) > 65535) {
      newErrors['emailSettings.port'] = 'Please enter a valid port number (1-65535)'
    }
    if (!settingsData.emailSettings.username?.trim()) {
      newErrors['emailSettings.username'] = 'SMTP User is required'
    }
    if (!settingsData.emailSettings.password?.trim()) {
      newErrors['emailSettings.password'] = 'SMTP Password is required'
    }
    if (!settingsData.emailSettings.from_address?.trim()) {
      newErrors['emailSettings.from_address'] = 'From Email is required'
    } else if (!emailRegex.test(settingsData.emailSettings.from_address)) {
      newErrors['emailSettings.from_address'] = 'Please enter a valid email address'
    }
    if (!settingsData.emailSettings.from_name?.trim()) {
      newErrors['emailSettings.from_name'] = 'From Name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      error('Please fix the validation errors before saving')
      return
    }

    setSaving(true)
    try {
      // Save all email settings
      const emailSettingsToSave = {
        mailer: settingsData.emailSettings.mailer,
        host: settingsData.emailSettings.host,
        port: settingsData.emailSettings.port,
        username: settingsData.emailSettings.username,
        password: settingsData.emailSettings.password,
        encryption: settingsData.emailSettings.encryption,
        from_address: settingsData.emailSettings.from_address,
        from_name: settingsData.emailSettings.from_name,
      }

      // Save each setting (suppress 404 errors as they're expected for new settings)
      const savePromises = Object.entries(emailSettingsToSave).map(async ([key, value]) => {
        try {
          return await settingsService.saveSetting(key, 'Email Settings', value)
        } catch (err) {
          // Ignore 404 errors as they're expected when creating new settings
          if (err.response?.status === 404) {
            return { success: true, message: `${key} saved` }
          }
          throw err
        }
      })

      const results = await Promise.all(savePromises)
      const allSuccess = results.every(r => r && r.success)

      if (allSuccess) {
        success('Email settings saved successfully!')
      } else {
        const failedSettings = results
          .map((r, index) => (!r || !r.success) ? Object.keys(emailSettingsToSave)[index] : null)
          .filter(Boolean)
        error(`Failed to save: ${failedSettings.join(', ')}. Please try again.`)
      }
    } catch (err) {
      error('Failed to save email settings. Please try again.')
      console.error('Save email settings error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmailAddress?.trim()) {
      error('Please enter a test email address')
      return
    }

    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(testEmailAddress.trim())) {
      error('Please enter a valid email address')
      return
    }

    setSendingTestEmail(true)
    try {
      const response = await settingsService.sendTestEmail(testEmailAddress.trim())
      if (response.success) {
        success(response.message || 'Test email sent successfully! Please check your inbox.')
        setTestEmailAddress('')
      } else {
        // Show validation errors if available
        if (response.errors && typeof response.errors === 'object') {
          const errorMessages = Object.values(response.errors).flat()
          error(errorMessages.join(', ') || response.message || 'Failed to send test email. Please check your email configuration.')
        } else {
          error(response.message || 'Failed to send test email. Please check your email configuration.')
        }
      }
    } catch (err) {
      error('Failed to send test email. Please try again.')
      console.error('Send test email error:', err)
    } finally {
      setSendingTestEmail(false)
    }
  }

  const renderEmailSettings = () => (
    <div className="mb-5">
      {/* Section Header */}
      <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-success border-2">
        <FontAwesomeIcon icon={faEnvelope} className="me-3 text-success fs-4" />
        <h4 className="mb-0 text-success">Email Settings</h4>
      </div>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">SMTP Host</Form.Label>
            <FormControl
              placeholder="e.g., smtp.gmail.com"
              value={settingsData.emailSettings.host}
              onChange={(e) => handleChange('emailSettings', 'host', e.target.value)}
              onBlur={(e) => handleBlur('emailSettings', 'host', e.target.value)}
              isInvalid={!!errors['emailSettings.host']}
              className="border-2"
            />
            {errors['emailSettings.host'] && (
              <FormText className="text-danger">{errors['emailSettings.host']}</FormText>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">SMTP Port</Form.Label>
            <FormControl
              placeholder="e.g., 587"
              value={settingsData.emailSettings.port}
              onChange={(e) => handleChange('emailSettings', 'port', e.target.value)}
              onBlur={(e) => handleBlur('emailSettings', 'port', e.target.value)}
              isInvalid={!!errors['emailSettings.port']}
              className="border-2"
            />
            {errors['emailSettings.port'] && (
              <FormText className="text-danger">{errors['emailSettings.port']}</FormText>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">SMTP User</Form.Label>
            <FormControl
              type="email"
              placeholder="e.g., your-email@gmail.com"
              value={settingsData.emailSettings.username}
              onChange={(e) => handleChange('emailSettings', 'username', e.target.value)}
              onBlur={(e) => handleBlur('emailSettings', 'username', e.target.value)}
              isInvalid={!!errors['emailSettings.username']}
              className="border-2"
            />
            {errors['emailSettings.username'] && (
              <FormText className="text-danger">{errors['emailSettings.username']}</FormText>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">SMTP Password</Form.Label>
            <FormControl
              type="password"
              placeholder="Enter SMTP password"
              value={settingsData.emailSettings.password}
              onChange={(e) => handleChange('emailSettings', 'password', e.target.value)}
              onBlur={(e) => handleBlur('emailSettings', 'password', e.target.value)}
              isInvalid={!!errors['emailSettings.password']}
              className="border-2"
            />
            {errors['emailSettings.password'] && (
              <FormText className="text-danger">{errors['emailSettings.password']}</FormText>
            )}
            <FormText className="text-muted">We store this encrypted. Leave blank to keep the current password.</FormText>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">From Email</Form.Label>
            <FormControl
              type="email"
              placeholder="e.g., noreply@codexaa.com"
              value={settingsData.emailSettings.from_address}
              onChange={(e) => handleChange('emailSettings', 'from_address', e.target.value)}
              onBlur={(e) => handleBlur('emailSettings', 'from_address', e.target.value)}
              isInvalid={!!errors['emailSettings.from_address']}
              className="border-2"
            />
            {errors['emailSettings.from_address'] && (
              <FormText className="text-danger">{errors['emailSettings.from_address']}</FormText>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">From Name</Form.Label>
            <FormControl
              placeholder="e.g., Codexaa Base Project"
              value={settingsData.emailSettings.from_name}
              onChange={(e) => handleChange('emailSettings', 'from_name', e.target.value)}
              onBlur={(e) => handleBlur('emailSettings', 'from_name', e.target.value)}
              isInvalid={!!errors['emailSettings.from_name']}
              className="border-2"
            />
            {errors['emailSettings.from_name'] && (
              <FormText className="text-danger">{errors['emailSettings.from_name']}</FormText>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <div className="d-flex justify-content-end mb-4">
            <Button
              variant="primary"
              onClick={handleSaveEmailSettings}
              disabled={saving || isReadOnly}
              className="px-4"
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Save Email Settings
                </>
              )}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Test Email Configuration Section */}
      <div className="mt-5 pt-4 border-top">
        <h5 className="mb-3">Test Email Configuration</h5>
        <p className="text-muted mb-4">Test your email settings by sending a test email.</p>
        
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Test Email Address</Form.Label>
              <FormControl
                type="email"
                placeholder="Enter email address to test"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="border-2"
              />
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end">
            <Button
              variant="primary"
              onClick={handleSendTestEmail}
              disabled={sendingTestEmail || isReadOnly}
              className="w-100"
            >
              {sendingTestEmail ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Sending...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  )

  const renderAppSettings = () => (
    <div className="mb-5">
      {/* Section Header */}
      <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-primary border-2">
        <FontAwesomeIcon icon={faCog} className="me-3 text-primary fs-4" />
        <h4 className="mb-0 text-primary">App Settings</h4>
      </div>

      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Web URL
              {autoSaving['appSettings.web_url'] && (
                <Spinner size="sm" className="ms-2" variant="primary" />
              )}
              {autoSaved['appSettings.web_url'] && (
                <FontAwesomeIcon icon={faCheckCircle} className="ms-2 text-success" />
              )}
            </Form.Label>
            <FormControl
              type="url"
              placeholder="e.g., https://www.example.com"
              value={settingsData.appSettings.web_url}
              onChange={(e) => handleChange('appSettings', 'web_url', e.target.value)}
              onBlur={(e) => handleBlur('appSettings', 'web_url', e.target.value)}
              isInvalid={!!errors['appSettings.web_url']}
              className="border-2"
            />
            {errors['appSettings.web_url'] && (
              <FormText className="text-danger">{errors['appSettings.web_url']}</FormText>
            )}
            <FormText className="text-muted">Enter the web URL for your application</FormText>
          </Form.Group>
        </Col>
      </Row>
    </div>
  )

  const renderCurrencyRegional = () => (
    <div className="mb-5">
      {/* Section Header */}
      <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-success border-2">
        <FontAwesomeIcon icon={faGlobe} className="me-3 text-success fs-4" />
        <h4 className="mb-0 text-success">Currency & Regional Settings</h4>
      </div>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Currency</Form.Label>
            <FormSelect
              value={settingsData.currencyRegional.currency}
              onChange={(e) => handleChange('currencyRegional', 'currency', e.target.value)}
              onBlur={(e) => handleBlur('currencyRegional', 'currency', e.target.value)}
              className="border-2"  
            >
              <option value="INR">Indian Rupee (INR)</option>
              <option value="NZD">New Zealand Dollar (NZD)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
              <option value="AUD">Australian Dollar (AUD)</option>
            </FormSelect>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Date Format</Form.Label>
            <FormSelect
              value={settingsData.currencyRegional.dateFormat}
              onChange={(e) => handleChange('currencyRegional', 'dateFormat', e.target.value)}
              onBlur={(e) => handleBlur('currencyRegional', 'dateFormat', e.target.value)}
              className="border-2"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD-MM-YYYY">DD-MM-YYYY</option>
            </FormSelect>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Time Zone</Form.Label>
            <FormSelect
              value={settingsData.currencyRegional.timeZone}
              onChange={(e) => handleChange('currencyRegional', 'timeZone', e.target.value)}
              onBlur={(e) => handleBlur('currencyRegional', 'timeZone', e.target.value)}
              className="border-2"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Pacific/Auckland">Pacific/Auckland (NZDT/NZST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </FormSelect>
          </Form.Group>
        </Col>
      </Row>
    </div>
  )

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner variant="primary" />
      </Container>
    )
  }

  if (!canViewSettings) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FontAwesomeIcon icon={faCog} className="text-muted mb-3" size="3x" />
            <h4 className="text-muted">Access Restricted</h4>
            <p className="text-muted">
              You do not have permission to view application settings. Please contact your administrator if you need additional access.
            </p>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          {/* Page Header */}
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <h2 className="mb-0 text-dark">Global Settings</h2>
            {canEditSettings && (
              <div className="ms-auto">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-4"
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                      Save All Settings
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Settings Sections */}
          <div className="bg-white rounded-3 shadow-sm p-4">
            <fieldset disabled={isReadOnly} style={{ border: 'none', padding: 0, margin: 0 }}>
              {renderBusinessInfo()}
              {renderInvoiceSettings()}
              {renderEmailSettings()}
              {renderAppSettings()}
              {renderCurrencyRegional()}
            </fieldset>
            
            {/* Bottom Save Button */}
            {canEditSettings && (
              <div className="text-center mt-4 pt-4 border-top">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-5"
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                      Save All Settings
                    </>
                  )}
                </Button>
              </div>
            )}
            {!canEditSettings && (
              <div className="text-center mt-4 pt-4 border-top">
                <Alert variant="info" className="mb-0">
                  You have read-only access to settings.
                </Alert>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default Settings