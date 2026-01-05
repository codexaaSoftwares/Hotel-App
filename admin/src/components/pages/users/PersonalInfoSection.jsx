import React, { useState, useRef, useEffect } from 'react'
import { Card, Button, Spinner } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faPencil, faSave, faX } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import { TextField, SelectField, FormRow } from '../../common/FormFields'

const PersonalInfoSection = ({ 
  personalData = {}, 
  onSave, 
  loading = false 
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
    ...personalData
  })
  const [errors, setErrors] = useState({})

  // Update formData when personalData prop changes (but not when editing)
  useEffect(() => {
    if (!isEditing && personalData) {
      setFormData({
        firstName: personalData.firstName || '',
        lastName: personalData.lastName || '',
        email: personalData.email || '',
        phone: personalData.phone || '',
        bio: personalData.bio || '',
        dateOfBirth: personalData.dateOfBirth || '',
        gender: personalData.gender || '',
      })
    }
  }, [personalData, isEditing])

  const handleEditClick = () => {
    setIsEditing(true)
    setErrors({})
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset form data to original personalData
    setFormData({
      firstName: personalData.firstName || '',
      lastName: personalData.lastName || '',
      email: personalData.email || '',
      phone: personalData.phone || '',
      bio: personalData.bio || '',
      dateOfBirth: personalData.dateOfBirth || '',
      gender: personalData.gender || '',
    })
    setErrors({})
  }

  const handleChange = (field, value) => {
    // For date fields, ensure proper format
    if (field === 'dateOfBirth' && value) {
      // Date input already provides YYYY-MM-DD format, so just use it as is
      setFormData(prev => ({ ...prev, [field]: value }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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

  const handleSave = async () => {
    if (validateForm()) {
      try {
        await onSave(formData)
        setIsEditing(false)
        setErrors({})
      } catch (error) {
        console.error('Error saving personal info:', error)
        // Re-throw error so parent can handle it
        throw error
      }
    }
  }

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center w-100">
          <Card.Title className="mb-0 d-flex align-items-center">
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Personal Information
          </Card.Title>
          {!isEditing && (
            <Button
              color="primary"
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faPencil} className="me-1" />
              Edit
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        {isEditing ? (
          <div>
            <FormRow>
              <TextField
                id="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter first name"
                required
                col={6}
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
              />
            </FormRow>

            <div className="d-flex gap-2 justify-content-end mt-3">
              <Button
                color="secondary"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faX} className="me-1" />
                Cancel
              </Button>
              <Button
                color="primary"
                size="sm"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="me-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>First Name:</strong>
              <p className="text-muted mb-0">{personalData.firstName || 'Not provided'}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Last Name:</strong>
              <p className="text-muted mb-0">{personalData.lastName || 'Not provided'}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Email:</strong>
              <p className="text-muted mb-0">{personalData.email || 'Not provided'}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Phone:</strong>
              <p className="text-muted mb-0">{personalData.phone || 'Not provided'}</p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Date of Birth:</strong>
              <p className="text-muted mb-0">
                {personalData.dateOfBirth 
                  ? new Date(personalData.dateOfBirth).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Not provided'}
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <strong>Gender:</strong>
              <p className="text-muted mb-0">
                {personalData.gender 
                  ? personalData.gender.charAt(0).toUpperCase() + personalData.gender.slice(1).replace(/-/g, ' ')
                  : 'Not provided'}
              </p>
            </div>
            <div className="col-12 mb-3">
              <strong>Bio:</strong>
              <p className="text-muted mb-0">{personalData.bio || 'Not provided'}</p>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

PersonalInfoSection.propTypes = {
  personalData: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool
}

export default PersonalInfoSection
