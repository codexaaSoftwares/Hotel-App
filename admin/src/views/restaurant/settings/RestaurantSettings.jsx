import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Spinner, Form, Alert } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faPercent, faPrint, faSave, faCheckCircle, faFileInvoice } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../../components'
import { restaurantSettingsService } from '../../../services/restaurantSettingsService'
import { usePermissions } from '../../../hooks'
import { PERMISSIONS } from '../../../constants/permissions'
import { TextField, SelectField, TextAreaField, FormRow } from '../../../components/common/FormFields'

const RestaurantSettings = () => {
  const { hasPermission } = usePermissions()
  const { success, error, warning } = useToast()

  const canViewSettings = hasPermission
    ? hasPermission(PERMISSIONS.RESTAURANT_SETTINGS_READ) || hasPermission(PERMISSIONS.RESTAURANT_SETTINGS_WRITE)
    : true
  const canEditSettings = hasPermission
    ? hasPermission(PERMISSIONS.RESTAURANT_SETTINGS_WRITE)
    : true
  const isReadOnly = !canEditSettings

  const [settingsData, setSettingsData] = useState({
    gstSettings: {
      default_gst_percentage: '5',
      gst_calculation_method: 'bill_total'
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
      paper_width: '80',
      enabled: 'true'
    }
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [autoSaving, setAutoSaving] = useState({})
  const [autoSaved, setAutoSaved] = useState({})

  useEffect(() => {
    if (!canViewSettings) {
      setLoading(false)
      warning && warning('You do not have permission to view restaurant settings.', { title: 'Access restricted' })
      return
    }

    const fetchSettings = async () => {
      setLoading(true)
      try {
        const response = await restaurantSettingsService.getAllSections()
        if (response.success) {
          // Debug: Log the API response
          console.log('API Response:', response.data)
          const transformedData = restaurantSettingsService.transformSettingsToForm(response.data)
          console.log('Transformed Data:', transformedData)
          setSettingsData(transformedData)
        } else {
          error(response.message || 'Failed to load restaurant settings. Using default values.')
          const defaultData = restaurantSettingsService.transformSettingsToForm(null)
          setSettingsData(defaultData)
        }
      } catch (err) {
        console.error('Error fetching restaurant settings:', err)
        error('Failed to load restaurant settings.')
        const defaultData = restaurantSettingsService.transformSettingsToForm(null)
        setSettingsData(defaultData)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [canViewSettings, error, warning])

  const handleChange = (section, field, value) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    setErrors(prev => ({
      ...prev,
      [`${section}.${field}`]: ''
    }))
  }

  const validateForm = (section = null) => {
    const newErrors = {}

    // Only validate the section being saved, or all sections if no section specified
    const validateGST = !section || section === 'gstSettings'
    const validateInvoice = !section || section === 'invoiceSettings'
    const validatePrinter = !section || section === 'thermalPrinter'

    // GST Settings validation
    if (validateGST && settingsData.gstSettings.default_gst_percentage) {
      const gstValue = parseFloat(settingsData.gstSettings.default_gst_percentage)
      if (isNaN(gstValue) || gstValue < 0 || gstValue > 100) {
        newErrors['gstSettings.default_gst_percentage'] = 'GST percentage must be between 0 and 100'
      }
    }

    // Invoice Settings validation
    if (validateInvoice) {
      if (!settingsData.invoiceSettings.invoice_prefix?.trim()) {
        newErrors['invoiceSettings.invoice_prefix'] = 'Invoice prefix is required'
      }
      
      // Email validation
      if (settingsData.invoiceSettings.invoice_contact_email && 
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settingsData.invoiceSettings.invoice_contact_email)) {
        newErrors['invoiceSettings.invoice_contact_email'] = 'Please enter a valid email address'
      }
    }

    // Thermal Printer validation
    if (validatePrinter && settingsData.thermalPrinter.enabled === 'true') {
      if (!settingsData.thermalPrinter.printer_name?.trim()) {
        newErrors['thermalPrinter.printer_name'] = 'Printer name is required when printer is enabled'
      }
      if (!settingsData.thermalPrinter.printer_ip?.trim()) {
        newErrors['thermalPrinter.printer_ip'] = 'Printer IP is required when printer is enabled'
      }
      if (settingsData.thermalPrinter.printer_port) {
        const port = parseInt(settingsData.thermalPrinter.printer_port)
        if (isNaN(port) || port < 1 || port > 65535) {
          newErrors['thermalPrinter.printer_port'] = 'Printer port must be between 1 and 65535'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (section, field = null) => {
    if (!canEditSettings) {
      warning('You do not have permission to edit restaurant settings.')
      return
    }

    // Validate only the section being saved
    if (!validateForm(section)) {
      error('Please fix the errors before saving.')
      return
    }

    setSaving(true)
    setAutoSaving(prev => ({ ...prev, [`${section}.${field}`]: true }))

    try {
      let response

      if (field) {
        // Save single field
        const fieldMapping = {
          'gstSettings.default_gst_percentage': { key: 'default_gst_percentage', section: 'GST Settings' },
          'gstSettings.gst_calculation_method': { key: 'gst_calculation_method', section: 'GST Settings' },
          'invoiceSettings.invoice_prefix': { key: 'invoice_prefix', section: 'Invoice Settings' },
          'invoiceSettings.invoice_business_name': { key: 'invoice_business_name', section: 'Invoice Settings' },
          'invoiceSettings.invoice_business_address': { key: 'invoice_business_address', section: 'Invoice Settings' },
          'invoiceSettings.invoice_contact_phone': { key: 'invoice_contact_phone', section: 'Invoice Settings' },
          'invoiceSettings.invoice_contact_email': { key: 'invoice_contact_email', section: 'Invoice Settings' },
          'invoiceSettings.invoice_footer_text': { key: 'invoice_footer_text', section: 'Invoice Settings' },
          'invoiceSettings.invoice_other_text': { key: 'invoice_other_text', section: 'Invoice Settings' },
          'thermalPrinter.printer_name': { key: 'printer_name', section: 'Thermal Printer' },
          'thermalPrinter.printer_ip': { key: 'printer_ip', section: 'Thermal Printer' },
          'thermalPrinter.printer_port': { key: 'printer_port', section: 'Thermal Printer' },
          'thermalPrinter.paper_width': { key: 'paper_width', section: 'Thermal Printer' },
          'thermalPrinter.enabled': { key: 'enabled', section: 'Thermal Printer' }
        }

        const mapping = fieldMapping[`${section}.${field}`]
        if (mapping) {
          response = await restaurantSettingsService.updateSetting(
            mapping.key,
            settingsData[section][field],
            mapping.section,
            typeof settingsData[section][field] === 'number' ? 'number' : 'string'
          )
        }
      } else {
        // Save entire section
        const sectionMapping = {
          gstSettings: 'GST Settings',
          invoiceSettings: 'Invoice Settings',
          thermalPrinter: 'Thermal Printer'
        }

        const sectionName = sectionMapping[section]
        if (sectionName) {
          const sectionData = {}
          Object.keys(settingsData[section]).forEach(key => {
            sectionData[key] = settingsData[section][key]
          })

          response = await restaurantSettingsService.updateAllSettings({
            [sectionName]: sectionData
          })
        }
      }

      if (response?.success) {
        success('Settings saved successfully!')
        setAutoSaved(prev => ({ ...prev, [`${section}.${field}`]: true }))
        setTimeout(() => {
          setAutoSaved(prev => {
            const newState = { ...prev }
            delete newState[`${section}.${field}`]
            return newState
          })
        }, 2000)
      } else {
        error(response?.message || 'Failed to save settings.')
      }
    } catch (err) {
      error('An error occurred while saving settings.')
    } finally {
      setSaving(false)
      setAutoSaving(prev => {
        const newState = { ...prev }
        delete newState[`${section}.${field}`]
        return newState
      })
    }
  }

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    )
  }

  if (!canViewSettings) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">You do not have permission to view restaurant settings.</Alert>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col xs={12}>
          {/* Page Header */}
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <FontAwesomeIcon icon={faCog} className="me-3 text-primary fs-4" />
            <h2 className="mb-0 text-dark">Restaurant Settings</h2>
          </div>

          {/* Main Content Container */}
          <div className="bg-white rounded-3 shadow-sm p-4">
            {/* GST Settings Section */}
            <div className="mb-5">
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-primary border-2">
                <FontAwesomeIcon icon={faPercent} className="me-3 text-primary fs-4" />
                <h4 className="mb-0 text-primary">GST Settings</h4>
              </div>

              <Form>
                <FormRow>
                  <TextField
                    id="default_gst_percentage"
                    label="Default GST Percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settingsData.gstSettings.default_gst_percentage}
                    onChange={(e) => handleChange('gstSettings', 'default_gst_percentage', e.target.value)}
                    disabled={isReadOnly}
                    invalid={!!errors['gstSettings.default_gst_percentage']}
                    feedback={errors['gstSettings.default_gst_percentage']}
                    helpText="Default GST percentage applied to bills (0-100)"
                    required
                    col={6}
                  />
                  <SelectField
                    id="gst_calculation_method"
                    label="GST Calculation Method"
                    value={settingsData.gstSettings.gst_calculation_method}
                    onChange={(e) => handleChange('gstSettings', 'gst_calculation_method', e.target.value)}
                    disabled={isReadOnly}
                    options={[
                      { value: 'bill_total', label: 'Calculate on Bill Total' },
                      { value: 'item_wise', label: 'Calculate Item-wise' },
                    ]}
                    helpText="How GST should be calculated for bills"
                    required
                    col={6}
                  />
                </FormRow>

                {!isReadOnly && (
                  <div className="mt-3">
                    <Button
                      variant="primary"
                      onClick={() => handleSave('gstSettings')}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="me-2" />
                          Save GST Settings
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Form>
            </div>

            {/* Invoice Settings Section */}
            <div className="mb-5">
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-primary border-2">
                <FontAwesomeIcon icon={faFileInvoice} className="me-3 text-primary fs-4" />
                <h4 className="mb-0 text-primary">Invoice Settings</h4>
              </div>

              <Form>
                <FormRow>
                  <TextField
                    id="invoice_prefix"
                    label="Invoice Prefix"
                    type="text"
                    value={settingsData.invoiceSettings.invoice_prefix}
                    onChange={(e) => handleChange('invoiceSettings', 'invoice_prefix', e.target.value)}
                    disabled={isReadOnly}
                    invalid={!!errors['invoiceSettings.invoice_prefix']}
                    feedback={errors['invoiceSettings.invoice_prefix']}
                    helpText="Prefix for restaurant bill/invoice numbers (e.g., BILL001, REST-INV001)"
                    placeholder="e.g., BILL, REST-INV"
                    maxLength={20}
                    required
                    col={6}
                  />
                  <TextField
                    id="invoice_business_name"
                    label="Invoice Business Name"
                    type="text"
                    value={settingsData.invoiceSettings.invoice_business_name}
                    onChange={(e) => handleChange('invoiceSettings', 'invoice_business_name', e.target.value)}
                    disabled={isReadOnly}
                    helpText="Business name to display on restaurant invoices"
                    placeholder="e.g., Teja Hotel Restaurant"
                    maxLength={200}
                    col={6}
                  />
                </FormRow>

                <FormRow>
                  <TextAreaField
                    id="invoice_business_address"
                    label="Invoice Business Address"
                    value={settingsData.invoiceSettings.invoice_business_address}
                    onChange={(e) => handleChange('invoiceSettings', 'invoice_business_address', e.target.value)}
                    disabled={isReadOnly}
                    helpText="Business address to display on restaurant invoices"
                    placeholder="e.g., 123 Main Street, City, State, ZIP"
                    maxLength={500}
                    rows={2}
                    col={12}
                  />
                </FormRow>

                <FormRow>
                  <TextField
                    id="invoice_contact_phone"
                    label="Invoice Contact Phone"
                    type="text"
                    value={settingsData.invoiceSettings.invoice_contact_phone}
                    onChange={(e) => handleChange('invoiceSettings', 'invoice_contact_phone', e.target.value)}
                    disabled={isReadOnly}
                    helpText="Contact phone number to display on restaurant invoices"
                    placeholder="e.g., +91 1234567890"
                    maxLength={50}
                    col={6}
                  />
                  <TextField
                    id="invoice_contact_email"
                    label="Invoice Contact Email"
                    type="email"
                    value={settingsData.invoiceSettings.invoice_contact_email}
                    onChange={(e) => handleChange('invoiceSettings', 'invoice_contact_email', e.target.value)}
                    disabled={isReadOnly}
                    invalid={!!errors['invoiceSettings.invoice_contact_email']}
                    feedback={errors['invoiceSettings.invoice_contact_email']}
                    helpText="Contact email to display on restaurant invoices"
                    placeholder="e.g., info@restaurant.com"
                    maxLength={200}
                    col={6}
                  />
                </FormRow>

                <FormRow>
                  <TextField
                    id="invoice_footer_text"
                    label="Invoice Footer Text"
                    type="text"
                    value={settingsData.invoiceSettings.invoice_footer_text}
                    onChange={(e) => handleChange('invoiceSettings', 'invoice_footer_text', e.target.value)}
                    disabled={isReadOnly}
                    helpText="Footer text to display on restaurant bills/invoices"
                    placeholder="e.g., Thank you for visiting!"
                    maxLength={200}
                    col={6}
                  />
                  <TextField
                    id="invoice_other_text"
                    label="Invoice Other Text"
                    type="text"
                    value={settingsData.invoiceSettings.invoice_other_text}
                    onChange={(e) => handleChange('invoiceSettings', 'invoice_other_text', e.target.value)}
                    disabled={isReadOnly}
                    helpText="Additional text to display on restaurant bills/invoices"
                    placeholder="e.g., Terms and conditions"
                    maxLength={200}
                    col={6}
                  />
                </FormRow>

                <FormRow>
                  <TextAreaField
                    id="invoice_other_text"
                    label="Invoice Other Text / Notes"
                    value={settingsData.invoiceSettings.invoice_other_text}
                    onChange={(e) => handleChange('invoiceSettings', 'invoice_other_text', e.target.value)}
                    disabled={isReadOnly}
                    helpText="Additional text/notes to display on invoices (Terms & Conditions, special instructions, etc.)"
                    placeholder="e.g., Terms & Conditions, Additional Notes, Special Instructions..."
                    maxLength={500}
                    rows={4}
                    col={12}
                  />
                </FormRow>

                {!isReadOnly && (
                  <div className="mt-3">
                    <Button
                      variant="primary"
                      onClick={() => handleSave('invoiceSettings')}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="me-2" />
                          Save Invoice Settings
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Form>
            </div>

            {/* Thermal Printer Settings Section */}
            <div className="mb-5">
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-primary border-2">
                <FontAwesomeIcon icon={faPrint} className="me-3 text-primary fs-4" />
                <h4 className="mb-0 text-primary">Thermal Printer Settings (80mm)</h4>
              </div>

              <Form>
                <FormRow>
                  <SelectField
                    id="thermal_printer_enabled"
                    label="Enable Thermal Printer"
                    value={settingsData.thermalPrinter.enabled}
                    onChange={(e) => handleChange('thermalPrinter', 'enabled', e.target.value)}
                    disabled={isReadOnly}
                    options={[
                      { value: 'true', label: 'Enabled' },
                      { value: 'false', label: 'Disabled' },
                    ]}
                    helpText="Enable or disable thermal printer functionality"
                    col={6}
                  />
                  <TextField
                    id="paper_width"
                    label="Paper Width (mm)"
                    type="text"
                    value={settingsData.thermalPrinter.paper_width}
                    onChange={(e) => handleChange('thermalPrinter', 'paper_width', e.target.value)}
                    disabled={isReadOnly}
                    readOnly
                    helpText="Thermal printer paper width (fixed at 80mm)"
                    col={6}
                  />
                </FormRow>

                {settingsData.thermalPrinter.enabled === 'true' && (
                  <>
                    <FormRow>
                      <TextField
                        id="printer_name"
                        label="Printer Name"
                        type="text"
                        value={settingsData.thermalPrinter.printer_name}
                        onChange={(e) => handleChange('thermalPrinter', 'printer_name', e.target.value)}
                        disabled={isReadOnly}
                        invalid={!!errors['thermalPrinter.printer_name']}
                        feedback={errors['thermalPrinter.printer_name']}
                        helpText="Name or identifier for the printer"
                        placeholder="e.g., Kitchen Printer"
                        required
                        col={6}
                      />
                      <TextField
                        id="printer_ip"
                        label="Printer IP Address"
                        type="text"
                        value={settingsData.thermalPrinter.printer_ip}
                        onChange={(e) => handleChange('thermalPrinter', 'printer_ip', e.target.value)}
                        disabled={isReadOnly}
                        invalid={!!errors['thermalPrinter.printer_ip']}
                        feedback={errors['thermalPrinter.printer_ip']}
                        placeholder="e.g., 192.168.1.100"
                        helpText="IP address of the thermal printer"
                        required
                        col={6}
                      />
                      <TextField
                        id="printer_port"
                        label="Printer Port"
                        type="number"
                        min="1"
                        max="65535"
                        value={settingsData.thermalPrinter.printer_port}
                        onChange={(e) => handleChange('thermalPrinter', 'printer_port', e.target.value)}
                        disabled={isReadOnly}
                        invalid={!!errors['thermalPrinter.printer_port']}
                        feedback={errors['thermalPrinter.printer_port']}
                        helpText="Network port for printer communication (default: 9100)"
                        placeholder="9100"
                        col={6}
                      />
                    </FormRow>
                  </>
                )}

                {!isReadOnly && (
                  <div className="mt-3">
                    <Button
                      variant="primary"
                      onClick={() => handleSave('thermalPrinter')}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="me-2" />
                          Save Printer Settings
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default RestaurantSettings

