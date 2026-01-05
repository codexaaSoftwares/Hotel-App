import React, { useState, useEffect } from 'react'
import { CContainer, CRow, CCol, CButton, CCard, CCardHeader, CCardBody, CCardTitle, CAlert, CSpinner } from '@coreui/react'
import { cilLockLocked, cilUser, cilSettings } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../components'
import { FormModal, ProfilePictureSection, PersonalInfoSection, AddressSection } from '../../components'
import { profileService } from '../../services/profileService'
import { useAuth } from '../../context/AuthContext'

const Profile = () => {
  const [profileData, setProfileData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Modal states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  
  // Password change form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({})

  const navigate = useNavigate()
  const { success, error } = useToast()
  const { user, updateUser } = useAuth()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await profileService.getProfile()
      if (response.success) {
        setProfileData(response.data)
        
        // Also update auth context with latest profile data
        if (updateUser && response.data) {
          // Ensure avatar is properly set
          const profileDataToUpdate = {
            ...response.data,
            avatar: response.data.avatar || null // Use the normalized avatar URL
          }
          
          if (import.meta.env.DEV) {
            console.log('[Profile] Updating auth context:', {
              profileData: response.data,
              avatar: response.data.avatar,
              updatingWith: profileDataToUpdate
            })
          }
          
          updateUser(profileDataToUpdate)
        }
      } else {
        error(response.message || 'Failed to fetch profile')
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }


  // Handle personal info save
  const handlePersonalInfoSave = async (personalData) => {
    try {
      setSaving(true)
      const response = await profileService.updateProfile(personalData)
      
      if (response.success) {
        setProfileData(response.data)
        success('Personal information updated successfully')
        
        // Update auth context with new user data
        if (updateUser) {
          updateUser(response.data)
        }
      } else {
        error(response.message || 'Failed to update personal information')
      }
    } catch (err) {
      console.error('Error updating personal info:', err)
      error('Failed to update personal information')
    } finally {
      setSaving(false)
    }
  }

  // Handle address save
  const handleAddressSave = async (addressData) => {
    try {
      setSaving(true)
      const response = await profileService.updateProfile(addressData)
      
      if (response.success) {
        setProfileData(response.data)
        success('Address information updated successfully')
        
        // Update auth context with new user data
        if (updateUser) {
          updateUser(response.data)
        }
      } else {
        error(response.message || 'Failed to update address information')
      }
    } catch (err) {
      console.error('Error updating address:', err)
      error('Failed to update address information')
    } finally {
      setSaving(false)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (file) => {
    try {
      const response = await profileService.uploadAvatar(file)
      
      if (response.success) {
        setProfileData(response.data)
        success(response.message || 'Profile picture uploaded successfully')
        
        // Update auth context with new user data
        if (updateUser) {
          updateUser(response.data)
        }
        return response
      } else {
        error(response.message || 'Failed to upload profile picture')
        return response
      }
    } catch (err) {
      console.error('Error uploading avatar:', err)
      error('Failed to upload profile picture')
      return { success: false, message: 'Failed to upload profile picture' }
    }
  }

  // Handle avatar delete
  const handleAvatarDelete = async () => {
    try {
      setSaving(true)
      const response = await profileService.deleteAvatar()
      
      if (response.success) {
        setProfileData(response.data)
        success(response.message || 'Profile picture removed successfully')
        
        // Update auth context with new user data
        if (updateUser) {
          updateUser(response.data)
        }
      } else {
        error(response.message || 'Failed to remove profile picture')
      }
    } catch (err) {
      console.error('Error deleting avatar:', err)
      error('Failed to remove profile picture')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = () => {
    setShowChangePasswordModal(true)
  }

  const handleSavePassword = async () => {
    // Validate password form
    const newErrors = {}
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setPasswordErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    try {
      setSaving(true)
      const response = await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      })
      
      if (response.success) {
        success(response.message || 'Password changed successfully')
        setShowChangePasswordModal(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setPasswordErrors({})
      } else {
        // Handle validation errors from backend
        if (response.errors) {
          setPasswordErrors(response.errors)
          error(response.message || 'Please fix the errors and try again')
        } else {
          error(response.message || 'Failed to change password')
        }
      }
    } catch (err) {
      console.error('Error changing password:', err)
      error('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelPasswordChange = () => {
    setShowChangePasswordModal(false)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setPasswordErrors({})
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (loading) {
    return (
      <CContainer fluid>
        <CRow>
          <CCol xs={12}>
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <CSpinner color="primary" variant="grow" />
            </div>
          </CCol>
        </CRow>
      </CContainer>
    )
  }

  return (
    <CContainer fluid>
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center w-100">
                <CCardTitle className="mb-0 d-flex align-items-center">
                  <CIcon icon={cilUser} className="me-2" />
                  My Profile
                </CCardTitle>
                <CButton
                  color="warning"
                  variant="outline"
                  onClick={handleChangePassword}
                  disabled={saving}
                >
                  <CIcon icon={cilLockLocked} className="me-2" />
                  Change Password
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              <CRow>
                {/* Profile Picture Section */}
                <CCol xs={12} className="mb-4">
                  <ProfilePictureSection
                    avatar={profileData.avatar}
                    loading={saving}
                    onAvatarUpload={handleAvatarUpload}
                    onAvatarDelete={handleAvatarDelete}
                  />
                </CCol>

                {/* Personal Information Section */}
                <CCol xs={12} className="mb-4">
                  <PersonalInfoSection
                    personalData={{
                      firstName: profileData.firstName,
                      lastName: profileData.lastName,
                      email: profileData.email,
                      phone: profileData.phone,
                      bio: profileData.bio,
                      dateOfBirth: profileData.dateOfBirth,
                      gender: profileData.gender
                    }}
                    onSave={handlePersonalInfoSave}
                    loading={saving}
                  />
                </CCol>

                {/* Address Information Section */}
                <CCol xs={12} className="mb-4">
                  <AddressSection
                    addressData={{
                      address: profileData.address,
                      city: profileData.city,
                      state: profileData.state,
                      zipCode: profileData.zipCode,
                      country: profileData.country
                    }}
                    onSave={handleAddressSave}
                    loading={saving}
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Change Password Modal */}
      <FormModal
        visible={showChangePasswordModal}
        onClose={handleCancelPasswordChange}
        title="Change Password"
        size="md"
        onConfirm={handleSavePassword}
        confirmText="Change Password"
        cancelText="Cancel"
        loading={saving}
      >
        <div className="mb-3">
          <label htmlFor="currentPassword" className="form-label">
            Current Password <span className="text-danger">*</span>
          </label>
          <input
            type="password"
            className={`form-control ${passwordErrors.currentPassword ? 'is-invalid' : ''}`}
            id="currentPassword"
            value={passwordData.currentPassword}
            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
            placeholder="Enter current password"
          />
          {passwordErrors.currentPassword && (
            <div className="invalid-feedback">
              {passwordErrors.currentPassword}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">
            New Password <span className="text-danger">*</span>
          </label>
          <input
            type="password"
            className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
            id="newPassword"
            value={passwordData.newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            placeholder="Enter new password"
          />
          {passwordErrors.newPassword && (
            <div className="invalid-feedback">
              {passwordErrors.newPassword}
            </div>
          )}
          <div className="form-text">
            Password must be at least 8 characters long
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm New Password <span className="text-danger">*</span>
          </label>
          <input
            type="password"
            className={`form-control ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`}
            id="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            placeholder="Confirm new password"
          />
          {passwordErrors.confirmPassword && (
            <div className="invalid-feedback">
              {passwordErrors.confirmPassword}
            </div>
          )}
        </div>

        <CAlert color="info" className="mt-3">
          <CIcon icon={cilLockLocked} className="me-2" />
          <strong>Security Tip:</strong> Use a strong password with a mix of letters, numbers, and special characters.
        </CAlert>
      </FormModal>
    </CContainer>
  )
}

export default Profile