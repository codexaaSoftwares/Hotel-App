import React, { useState, useEffect, useRef } from 'react'
import { Card, Image, Button, Spinner, Form } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faUpload, faTimes, faCamera } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'

const ProfilePictureSection = ({ 
  avatar, 
  loading = false,
  onAvatarUpload,
  onAvatarDelete
}) => {
  const [avatarPreview, setAvatarPreview] = useState(avatar || '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Update avatarPreview when avatar prop changes
  useEffect(() => {
    if (avatar) {
      // Add cache busting to prevent browser caching issues
      const separator = avatar.includes('?') ? '&' : '?'
      setAvatarPreview(`${avatar}${separator}t=${Date.now()}`)
    } else {
      setAvatarPreview('')
    }
  }, [avatar])

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB')
      return
    }

    setUploading(true)
    try {
      if (onAvatarUpload) {
        const result = await onAvatarUpload(file)
        if (result && result.success) {
          // Preview will be updated via prop change
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return
    }

    setUploading(true)
    try {
      if (onAvatarDelete) {
        await onAvatarDelete()
      }
    } catch (error) {
      console.error('Error deleting avatar:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="mb-0 d-flex align-items-center">
          <FontAwesomeIcon icon={faUser} className="me-2" />
          Profile Picture
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-start gap-4">
          <div className="position-relative">
            {avatarPreview ? (
              <div className="position-relative">
                <Image
                  src={avatarPreview}
                  alt="Profile Avatar"
                  className="rounded-circle border border-2"
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    objectFit: 'cover',
                    borderColor: '#dee2e6'
                  }}
                  onError={() => {
                    setAvatarPreview('')
                  }}
                />
                {uploading && (
                  <div 
                    className="position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(2px)'
                    }}
                  >
                    <Spinner animation="border" variant="light" size="sm" />
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center border border-2"
                style={{ 
                  width: '120px', 
                  height: '120px',
                  borderColor: '#dee2e6'
                }}
              >
                {uploading ? (
                  <Spinner animation="border" variant="light" />
                ) : (
                  <FontAwesomeIcon icon={faUser} size="2x" className="text-white" />
                )}
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <div className="mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                disabled={loading || uploading}
                style={{ display: 'none' }}
              />
              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || uploading}
                  size="sm"
                >
                  {uploading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={avatarPreview ? faCamera : faUpload} className="me-2" />
                      {avatarPreview ? 'Change Picture' : 'Upload Picture'}
                    </>
                  )}
                </Button>
                {avatarPreview && (
                  <Button
                    variant="danger"
                    onClick={handleRemoveAvatar}
                    disabled={loading || uploading}
                    size="sm"
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <Form.Text className="text-muted">
              Upload your profile picture (JPEG, PNG, or WebP, max 2MB). 
              {avatarPreview && ' Click "Change Picture" to upload a new one.'}
            </Form.Text>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

ProfilePictureSection.propTypes = {
  avatar: PropTypes.string,
  loading: PropTypes.bool,
  onAvatarUpload: PropTypes.func,
  onAvatarDelete: PropTypes.func,
}

export default ProfilePictureSection
