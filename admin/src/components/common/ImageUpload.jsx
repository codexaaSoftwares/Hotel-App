import React, { useState, useRef, useEffect } from 'react'
import { Button, Form, Image, Alert } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faTrash, faImage } from '@fortawesome/free-solid-svg-icons'

const ImageUpload = ({
  value = '',
  onChange,
  label = 'Image',
  required = false,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  previewSize = { width: 200, height: 150 },
  className = '',
  disabled = false,
  error = null
}) => {
  const [preview, setPreview] = useState(value)
  // Keep preview in sync if parent updates value (e.g., edit form loads existing image URL)
  useEffect(() => {
    setPreview(value || '')
  }, [value])
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file')
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      setUploadError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    setUploadError('')

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target.result
      setPreview(imageUrl)
      onChange(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleRemoveImage = () => {
    setPreview('')
    onChange('')
    setUploadError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={`image-upload ${className}`}>
      <Form.Label className="fw-semibold">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Form.Label>

      {/* Upload Area */}
      <div
        className={`upload-area border-2 rounded-3 p-4 text-center ${
          dragActive ? 'border-primary bg-light' : 'border-secondary'
        } ${disabled ? 'opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{ minHeight: '120px', cursor: disabled ? 'not-allowed' : 'pointer' }}
        onClick={handleUploadClick}
      >
        {preview ? (
          <div className="position-relative d-inline-block">
            <Image
              src={preview}
              alt="Preview"
              rounded
              style={{
                width: previewSize.width,
                height: previewSize.height,
                objectFit: 'cover'
              }}
            />
            {!disabled && (
              <Button
                variant="danger"
                size="sm"
                className="position-absolute top-0 end-0 m-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveImage()
                }}
                title="Remove image"
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center h-100">
            <FontAwesomeIcon
              icon={faImage}
              className="text-muted mb-2"
              style={{ fontSize: '2rem' }}
            />
            <div className="text-muted">
              <FontAwesomeIcon icon={faUpload} className="me-2" />
              {disabled ? 'No image selected' : 'Click to upload or drag and drop'}
            </div>
            <small className="text-muted mt-1">
              PNG, JPG, GIF up to {Math.round(maxSize / 1024 / 1024)}MB
            </small>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {/* Error messages */}
      {(uploadError || error) && (
        <Alert variant="danger" className="mt-2 mb-0">
          {uploadError || error}
        </Alert>
      )}

      {/* Helper text */}
      {!uploadError && !error && (
        <Form.Text className="text-muted">
          Upload a category image to help customers identify this category.
        </Form.Text>
      )}
    </div>
  )
}

export default ImageUpload
