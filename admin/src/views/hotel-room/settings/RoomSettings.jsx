import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Spinner, Form, Alert } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faPercent, faSave, faCheckCircle, faFileInvoice, faClock } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../../../components'
import { roomSettingsService } from '../../../services/roomSettingsService'
import { usePermissions } from '../../../hooks'
import { PERMISSIONS } from '../../../constants/permissions'
import { TextField, SelectField, TextAreaField, FormRow } from '../../../components/common/FormFields'

const RoomSettings = () => {
  const { hasPermission } = usePermissions()
  const { success, error, warning } = useToast()

  const canViewSettings = hasPermission
    ? hasPermission(PERMISSIONS.HOTEL_SETTINGS_READ) || hasPermission(PERMISSIONS.HOTEL_SETTINGS_WRITE)
    : true
  const canEditSettings = hasPermission
    ? hasPermission(PERMISSIONS.HOTEL_SETTINGS_WRITE)
    : true
  const isReadOnly = !canEditSettings

  const [settingsData, setSettingsData] = useState({
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
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [autoSaving, setAutoSaving] = useState({})
  const [autoSaved, setAutoSaved] = useState({})

  useEffect(() => {
    if (!canViewSettings) {
      setLoading(false)
      warning && warning('You do not have permission to view room settings.', { title: 'Access restricted' })
      return
    }

    const fetchSettings = async () => {
      setLoading(true)
      try {
        const response = await roomSettingsService.getAllSections()
        if (response.success) {
          console.log('API Response:', response.data)
          const transformedData = roomSettingsService.transformSettingsToForm(response.data)
          console.log('Transformed Data:', transformedData)
          setSettingsData(transformedData)
        } else {
          error(response.message || 'Failed to load room settings. Using default values.')
          const defaultData = roomSettingsService.transformSettingsToForm(null)
          setSettingsData(defaultData)
        }
      } catch (err) {
        console.error('Error fetching room settings:', err)
        error('Failed to load room settings.')
        const defaultData = roomSettingsService.transformSettingsToForm(null)
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

    const validateTimes = !section || section === 'checkInOutTimes'
    const validateGst = !section || section === 'roomGst'
    const validateInvoice = !section || section === 'roomInvoice'

    // Room GST validation
    if (validateGst) {
      if (settingsData.roomGst.cgst_percentage) {
        const cgstValue = parseFloat(settingsData.roomGst.cgst_percentage)
        if (isNaN(cgstValue) || cgstValue < 0 || cgstValue > 100) {
          newErrors['roomGst.cgst_percentage'] = 'CGST percentage must be between 0 and 100'
        }
      }
      if (settingsData.roomGst.sgst_percentage) {
        const sgstValue = parseFloat(settingsData.roomGst.sgst_percentage)
        if (isNaN(sgstValue) || sgstValue < 0 || sgstValue > 100) {
          newErrors['roomGst.sgst_percentage'] = 'SGST percentage must be between 0 and 100'
        }
      }
      if (settingsData.roomGst.service_tax_percentage) {
        const serviceTaxValue = parseFloat(settingsData.roomGst.service_tax_percentage)
        if (isNaN(serviceTaxValue) || serviceTaxValue < 0 || serviceTaxValue > 100) {
          newErrors['roomGst.service_tax_percentage'] = 'Service Tax percentage must be between 0 and 100'
        }
      }
    }

    // Invoice Settings validation
    if (validateInvoice) {
      if (!settingsData.roomInvoice.invoice_prefix?.trim()) {
        newErrors['roomInvoice.invoice_prefix'] = 'Invoice prefix is required'
      }
      
      if (settingsData.roomInvoice.invoice_contact_email && 
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settingsData.roomInvoice.invoice_contact_email)) {
        newErrors['roomInvoice.invoice_contact_email'] = 'Please enter a valid email address'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (section, field = null) => {
    if (!canEditSettings) {
      warning('You do not have permission to edit room settings.')
      return
    }

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
          'checkInOutTimes.standard_checkin_time': { key: 'standard_checkin_time', section: 'Check-In/Check-Out Time Settings' },
          'checkInOutTimes.standard_checkout_time': { key: 'standard_checkout_time', section: 'Check-In/Check-Out Time Settings' },
          'checkInOutTimes.early_checkin_allowed': { key: 'early_checkin_allowed', section: 'Check-In/Check-Out Time Settings' },
          'checkInOutTimes.late_checkout_allowed': { key: 'late_checkout_allowed', section: 'Check-In/Check-Out Time Settings' },
          'checkInOutTimes.early_checkin_hours': { key: 'early_checkin_hours', section: 'Check-In/Check-Out Time Settings' },
          'checkInOutTimes.late_checkout_hours': { key: 'late_checkout_hours', section: 'Check-In/Check-Out Time Settings' },
          'roomGst.cgst_percentage': { key: 'cgst_percentage', section: 'Room GST Settings' },
          'roomGst.sgst_percentage': { key: 'sgst_percentage', section: 'Room GST Settings' },
          'roomGst.service_tax_percentage': { key: 'service_tax_percentage', section: 'Room GST Settings' },
          'roomGst.gst_applicable': { key: 'gst_applicable', section: 'Room GST Settings' },
          'roomInvoice.invoice_prefix': { key: 'invoice_prefix', section: 'Room Invoice Settings' },
          'roomInvoice.invoice_business_name': { key: 'invoice_business_name', section: 'Room Invoice Settings' },
          'roomInvoice.invoice_business_address': { key: 'invoice_business_address', section: 'Room Invoice Settings' },
          'roomInvoice.invoice_contact_phone': { key: 'invoice_contact_phone', section: 'Room Invoice Settings' },
          'roomInvoice.invoice_contact_email': { key: 'invoice_contact_email', section: 'Room Invoice Settings' },
          'roomInvoice.invoice_footer_text': { key: 'invoice_footer_text', section: 'Room Invoice Settings' },
          'roomInvoice.invoice_terms': { key: 'invoice_terms', section: 'Room Invoice Settings' }
        }

        const mapping = fieldMapping[`${section}.${field}`]
        if (mapping) {
          response = await roomSettingsService.updateSetting(
            mapping.key,
            settingsData[section][field],
            mapping.section,
            typeof settingsData[section][field] === 'number' ? 'number' : 'string'
          )
        }
      } else {
        // Save entire section
        const sectionMapping = {
          checkInOutTimes: 'Check-In/Check-Out Time Settings',
          roomGst: 'Room GST Settings',
          roomInvoice: 'Room Invoice Settings',
        }

        const sectionName = sectionMapping[section]
        if (sectionName) {
          const sectionData = {}
          Object.keys(settingsData[section]).forEach(key => {
            sectionData[key] = settingsData[section][key]
          })

          response = await roomSettingsService.updateAllSettings({
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
        <Alert variant="warning">You do not have permission to view room settings.</Alert>
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
            <h2 className="mb-0 text-dark">Room Settings</h2>
          </div>

          {/* Main Content Container */}
          <div className="bg-white rounded-3 shadow-sm p-4">
            {/* Check-In/Check-Out Time Settings Section */}
            <div className="mb-5">
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-primary border-2">
                <FontAwesomeIcon icon={faClock} className="me-3 text-primary fs-4" />
                <h4 className="mb-0 text-primary">Check-In/Check-Out Time Settings</h4>
              </div>

              <Form>
                <FormRow>
                  <TextField
                    id="standard_checkin_time"
                    label="Standard Check-In Time"
                    type="time"
                    value={settingsData.checkInOutTimes.standard_checkin_time}
                    onChange={(e) => handleChange('checkInOutTimes', 'standard_checkin_time', e.target.value)}
                    disabled={isReadOnly}
                    helpText="Standard check-in time (24-hour format)"
                    required
                    col={6}
                  />
                  <TextField
                    id="standard_checkout_time"
                    label="Standard Check-Out Time"
                    type="time"
                    value={settingsData.checkInOutTimes.standard_checkout_time}
                    onChange={(e) => handleChange('checkInOutTimes', 'standard_checkout_time', e.target.value)}
                    disabled={isReadOnly}
                    helpText="Standard check-out time (24-hour format)"
                    required
                    col={6}
                  />
                </FormRow>

                <FormRow>
                  <SelectField
                    id="early_checkin_allowed"
                    label="Allow Early Check-In"
                    value={settingsData.checkInOutTimes.early_checkin_allowed}
                    onChange={(e) => handleChange('checkInOutTimes', 'early_checkin_allowed', e.target.value)}
                    disabled={isReadOnly}
                    options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]}
                    helpText="Allow guests to check-in before standard time"
                    required
                    col={6}
                  />
                  <SelectField
                    id="late_checkout_allowed"
                    label="Allow Late Check-Out"
                    value={settingsData.checkInOutTimes.late_checkout_allowed}
                    onChange={(e) => handleChange('checkInOutTimes', 'late_checkout_allowed', e.target.value)}
                    disabled={isReadOnly}
                    options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]}
                    helpText="Allow guests to check-out after standard time"
                    required
                    col={6}
                  />
                </FormRow>

                {settingsData.checkInOutTimes.early_checkin_allowed === 'true' && (
                  <FormRow>
                    <TextField
                      id="early_checkin_hours"
                      label="Early Check-In Hours (Before Standard Time)"
                      type="number"
                      min="0"
                      max="12"
                      value={settingsData.checkInOutTimes.early_checkin_hours}
                      onChange={(e) => handleChange('checkInOutTimes', 'early_checkin_hours', e.target.value)}
                      disabled={isReadOnly}
                      helpText="Maximum hours before standard check-in time allowed"
                      col={6}
                    />
                  </FormRow>
                )}

                {settingsData.checkInOutTimes.late_checkout_allowed === 'true' && (
                  <FormRow>
                    <TextField
                      id="late_checkout_hours"
                      label="Late Check-Out Hours (After Standard Time)"
                      type="number"
                      min="0"
                      max="12"
                      value={settingsData.checkInOutTimes.late_checkout_hours}
                      onChange={(e) => handleChange('checkInOutTimes', 'late_checkout_hours', e.target.value)}
                      disabled={isReadOnly}
                      helpText="Maximum hours after standard check-out time allowed"
                      col={6}
                    />
                  </FormRow>
                )}

                {!isReadOnly && (
                  <div className="mt-3">
                    <Button
                      variant="primary"
                      onClick={() => handleSave('checkInOutTimes')}
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
                          Save Time Settings
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Form>
            </div>

            {/* Room GST Settings Section */}
            <div className="mb-5">
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-primary border-2">
                <FontAwesomeIcon icon={faPercent} className="me-3 text-primary fs-4" />
                <h4 className="mb-0 text-primary">GST & Tax Settings</h4>
              </div>

              <Form>
                <FormRow>
                  <SelectField
                    id="gst_applicable"
                    label="GST Applicable"
                    value={settingsData.roomGst.gst_applicable}
                    onChange={(e) => handleChange('roomGst', 'gst_applicable', e.target.value)}
                    disabled={isReadOnly}
                    options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]}
                    helpText="Whether GST is applicable on room bookings"
                    required
                    col={12}
                  />
                </FormRow>

                {settingsData.roomGst.gst_applicable === 'true' && (
                  <>
                    <FormRow>
                      <TextField
                        id="cgst_percentage"
                        label="CGST Percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={settingsData.roomGst.cgst_percentage}
                        onChange={(e) => handleChange('roomGst', 'cgst_percentage', e.target.value)}
                        disabled={isReadOnly}
                        invalid={!!errors['roomGst.cgst_percentage']}
                        feedback={errors['roomGst.cgst_percentage']}
                        helpText="Central GST percentage (0-100)"
                        required
                        col={4}
                      />
                      <TextField
                        id="sgst_percentage"
                        label="SGST Percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={settingsData.roomGst.sgst_percentage}
                        onChange={(e) => handleChange('roomGst', 'sgst_percentage', e.target.value)}
                        disabled={isReadOnly}
                        invalid={!!errors['roomGst.sgst_percentage']}
                        feedback={errors['roomGst.sgst_percentage']}
                        helpText="State GST percentage (0-100)"
                        required
                        col={4}
                      />
                      <TextField
                        id="service_tax_percentage"
                        label="Service Tax Percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={settingsData.roomGst.service_tax_percentage}
                        onChange={(e) => handleChange('roomGst', 'service_tax_percentage', e.target.value)}
                        disabled={isReadOnly}
                        invalid={!!errors['roomGst.service_tax_percentage']}
                        feedback={errors['roomGst.service_tax_percentage']}
                        helpText="Service Tax percentage (can be 0)"
                        required
                        col={4}
                      />
                    </FormRow>
                  </>
                )}

                {!isReadOnly && (
                  <div className="mt-3">
                    <Button
                      variant="primary"
                      onClick={() => handleSave('roomGst')}
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

            {/* Room Invoice Settings Section */}
            <div className="mb-5">
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-primary border-2">
                <FontAwesomeIcon icon={faFileInvoice} className="me-3 text-primary fs-4" />
                <h4 className="mb-0 text-primary">Room Invoice Settings</h4>
              </div>

              <Form>
                <FormRow>
                  <TextField
                    id="invoice_prefix"
                    label="Invoice Prefix"
                    type="text"
                    value={settingsData.roomInvoice.invoice_prefix}
                    onChange={(e) => handleChange('roomInvoice', 'invoice_prefix', e.target.value)}
                    disabled={isReadOnly}
                    invalid={!!errors['roomInvoice.invoice_prefix']}
                    feedback={errors['roomInvoice.invoice_prefix']}
                    helpText="Prefix for room booking invoice numbers (e.g., ROOM001, BOOK-INV001)"
                    placeholder="e.g., ROOM, BOOK-INV"
                    maxLength={20}
                    required
                    col={6}
                  />
                  <TextField
                    id="invoice_business_name"
                    label="Invoice Business Name"
                    type="text"
                    value={settingsData.roomInvoice.invoice_business_name}
                    onChange={(e) => handleChange('roomInvoice', 'invoice_business_name', e.target.value)}
                    disabled={isReadOnly}
                    helpText="Business name to display on room invoices"
                    placeholder="e.g., Teja Hotel"
                    maxLength={200}
                    col={6}
                  />
                </FormRow>

                <FormRow>
                  <TextAreaField
                    id="invoice_business_address"
                    label="Invoice Business Address"
                    value={settingsData.roomInvoice.invoice_business_address}
                    onChange={(e) => handleChange('roomInvoice', 'invoice_business_address', e.target.value)}
                    disabled={isReadOnly}
                    helpText="Business address to display on room invoices"
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
                    value={settingsData.roomInvoice.invoice_contact_phone}
                    onChange={(e) => handleChange('roomInvoice', 'invoice_contact_phone', e.target.value)}
                    disabled={isReadOnly}
                    helpText="Contact phone number to display on room invoices"
                    placeholder="e.g., +91 1234567890"
                    maxLength={50}
                    col={6}
                  />
                  <TextField
                    id="invoice_contact_email"
                    label="Invoice Contact Email"
                    type="email"
                    value={settingsData.roomInvoice.invoice_contact_email}
                    onChange={(e) => handleChange('roomInvoice', 'invoice_contact_email', e.target.value)}
                    disabled={isReadOnly}
                    invalid={!!errors['roomInvoice.invoice_contact_email']}
                    feedback={errors['roomInvoice.invoice_contact_email']}
                    helpText="Contact email to display on room invoices"
                    placeholder="e.g., info@hotel.com"
                    maxLength={200}
                    col={6}
                  />
                </FormRow>

                <FormRow>
                  <TextField
                    id="invoice_footer_text"
                    label="Invoice Footer Text"
                    type="text"
                    value={settingsData.roomInvoice.invoice_footer_text}
                    onChange={(e) => handleChange('roomInvoice', 'invoice_footer_text', e.target.value)}
                    disabled={isReadOnly}
                    helpText="Footer text to display on room invoices"
                    placeholder="e.g., Thank you for staying with us!"
                    maxLength={200}
                    col={6}
                  />
                </FormRow>

                <FormRow>
                  <TextAreaField
                    id="invoice_terms"
                    label="Invoice Terms & Conditions"
                    value={settingsData.roomInvoice.invoice_terms}
                    onChange={(e) => handleChange('roomInvoice', 'invoice_terms', e.target.value)}
                    disabled={isReadOnly}
                    helpText="Terms and conditions to display on room invoices"
                    placeholder="e.g., Terms & Conditions, Cancellation Policy, etc."
                    maxLength={1000}
                    rows={4}
                    col={12}
                  />
                </FormRow>

                {!isReadOnly && (
                  <div className="mt-3">
                    <Button
                      variant="primary"
                      onClick={() => handleSave('roomInvoice')}
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
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default RoomSettings

