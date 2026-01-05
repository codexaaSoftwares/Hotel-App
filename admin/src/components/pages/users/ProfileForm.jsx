import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { Form, FormLabel, FormControl, FormSelect, FormText, Row, Col, Button, Card, Image, Spinner } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faPhone, faLocationPin, faLock, faSave, faX } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import { TextField, SelectField, FormRow } from '../../common/FormFields'

const ProfileForm = forwardRef(({ 
  mode = 'view', 
  userData = {}, 
  onSubmit, 
  onCancel, 
  loading = false,
  onAvatarChange 
}, ref) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
    avatar: '',
    ...userData
  })

  const [errors, setErrors] = useState({})
  const [avatarPreview, setAvatarPreview] = useState(userData.avatar || '')
  const [avatarLoading, setAvatarLoading] = useState(false)

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      setFormData(prev => ({ ...prev, ...userData }))
      setAvatarPreview(userData.avatar || '')
    }
  }, [userData])

  useImperativeHandle(ref, () => ({
    handleSubmit: () => {
      if (validateForm()) {
        onSubmit(formData)
      }
    },
    getFormData: () => formData,
    resetForm: () => {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        bio: '',
        dateOfBirth: '',
        gender: '',
        avatar: '',
        ...userData
      })
      setErrors({})
    }
  }))

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, avatar: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' }))
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'File size must be less than 5MB' }))
      return
    }

    setAvatarLoading(true)
    
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)
      
      // Convert to base64 for form submission
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target.result
        handleChange('avatar', base64)
        setAvatarLoading(false)
        
        // Call parent callback if provided
        if (onAvatarChange) {
          onAvatarChange(file, base64)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing avatar:', error)
      setErrors(prev => ({ ...prev, avatar: 'Error processing image' }))
      setAvatarLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Required fields validation
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Date of birth validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old'
      } else if (age > 120) {
        newErrors.dateOfBirth = 'Please enter a valid birth date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isViewMode = mode === 'view'
  const isEditMode = mode === 'edit'

  return (
    <Form>
      <Row>
        {/* Avatar Section */}
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Header>
              <Card.Title className="mb-0 d-flex align-items-center">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Profile Picture
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="position-relative">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile Avatar"
                      className="rounded-circle"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <FontAwesomeIcon icon={faUser} size="xl" className="text-white" />
                    </div>
                  )}
                  {avatarLoading && (
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <Spinner size="sm" />
                    </div>
                  )}
                </div>
                <div>
                  {isEditMode && (
                    <>
                      <FormControl
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="mb-2"
                        style={{ width: '200px' }}
                      />
                      <FormText className="text-muted">
                        JPG, PNG, GIF or WebP. Max size 5MB.
                      </FormText>
                    </>
                  )}
                  {errors.avatar && (
                    <FormText className="text-danger">
                      {errors.avatar}
                    </FormText>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Personal Information */}
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Header>
              <Card.Title className="mb-0 d-flex align-items-center">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Personal Information
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <FormRow>
                  <TextField
                    id="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    required
                    col={6}
                    disabled={isViewMode}
                    invalid={!!errors.firstName}
                    feedback={errors.firstName}
                  />
                  <TextField
                    id="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    required
                    col={6}
                    disabled={isViewMode}
                    invalid={!!errors.lastName}
                    feedback={errors.lastName}
                  />
                </FormRow>

                <FormRow>
                  <TextField
                    id="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                    col={6}
                    disabled={isViewMode}
                    invalid={!!errors.email}
                    feedback={errors.email}
                  />
                  <TextField
                    id="phone"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    col={6}
                    disabled={isViewMode}
                    invalid={!!errors.phone}
                    feedback={errors.phone}
                  />
                </FormRow>

                <FormRow>
                  <TextField
                    id="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    col={6}
                    disabled={isViewMode}
                    invalid={!!errors.dateOfBirth}
                    feedback={errors.dateOfBirth}
                  />
                  <SelectField
                    id="gender"
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    options={[
                      { value: '', label: 'Select Gender' },
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
                    ]}
                    col={6}
                    disabled={isViewMode}
                  />
                </FormRow>

                <FormRow>
                  <TextField
                    id="bio"
                    label="Bio"
                    type="textarea"
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    col={12}
                    disabled={isViewMode}
                  />
                </FormRow>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Address Information */}
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Header>
              <Card.Title className="mb-0 d-flex align-items-center">
                <FontAwesomeIcon icon={faLocationPin} className="me-2" />
                Address Information
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <FormRow>
                  <TextField
                    id="address"
                    label="Street Address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Enter street address"
                    col={12}
                    disabled={isViewMode}
                  />
                </FormRow>

                <FormRow>
                  <TextField
                    id="city"
                    label="City"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Enter city"
                    col={4}
                    disabled={isViewMode}
                  />
                  <TextField
                    id="state"
                    label="State/Province"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="Enter state/province"
                    col={4}
                    disabled={isViewMode}
                  />
                  <TextField
                    id="zipCode"
                    label="ZIP/Postal Code"
                    value={formData.zipCode}
                    onChange={(e) => handleChange('zipCode', e.target.value)}
                    placeholder="Enter ZIP/postal code"
                    col={4}
                    disabled={isViewMode}
                  />
                </FormRow>

                <FormRow>
                  <TextField
                    id="country"
                    label="Country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="Enter country"
                    col={12}
                    disabled={isViewMode}
                  />
                </FormRow>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      {isEditMode && (
        <div className="d-flex gap-2 justify-content-end mt-4">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faX} className="me-2" />
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (validateForm()) {
                onSubmit(formData)
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </Form>
  )
})

ProfileForm.propTypes = {
  mode: PropTypes.oneOf(['view', 'edit']).isRequired,
  userData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
  onAvatarChange: PropTypes.func
}

ProfileForm.displayName = 'ProfileForm'

export default ProfileForm
