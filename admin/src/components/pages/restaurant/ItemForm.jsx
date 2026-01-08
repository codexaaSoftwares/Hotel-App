import React, { useState, useEffect, useRef } from 'react'
import { Modal, Form, Button, Alert, Image } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import { TextField, SelectField, TextAreaField, FormRow } from '../../common/FormFields'

const ItemForm = ({ show, onHide, item, categories = [], selectedCategory = null, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    food_category_id: '',
    name: '',
    description: '',
    price: '',
    gst_percentage: '',
    is_veg: true,
    status: 'active',
    image: '',
    display_order: 0,
  })
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (item) {
      // Editing: Use item's category (auto-selected, read-only)
      setFormData({
        food_category_id: item.food_category_id || '',
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        gst_percentage: item.gst_percentage || '',
        is_veg: item.is_veg !== undefined ? item.is_veg : true,
        status: item.status || 'active',
        image: item.image || '',
        display_order: item.display_order || 0,
      })
      setImagePreview(item.image || '')
      setImageFile(null)
    } else {
      // Creating: Use selectedCategory if provided, otherwise first category
      const categoryId = selectedCategory?.id 
        ? selectedCategory.id.toString()
        : (categories.length > 0 ? categories[0].id.toString() : '')
      
      setFormData({
        food_category_id: categoryId,
        name: '',
        description: '',
        price: '',
        gst_percentage: '',
        is_veg: true,
        status: 'active',
        image: '',
        display_order: 0,
      })
      setImagePreview('')
      setImageFile(null)
    }
    setErrors({})
  }, [item, show, categories, selectedCategory])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.food_category_id) {
      newErrors.food_category_id = 'Category is required'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required'
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    if (formData.gst_percentage && (parseFloat(formData.gst_percentage) < 0 || parseFloat(formData.gst_percentage) > 100)) {
      newErrors.gst_percentage = 'GST percentage must be between 0 and 100'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Please select a valid image file (JPEG, PNG, or WebP)' }))
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image size must be less than 2MB' }))
      return
    }

    setErrors((prev) => ({ ...prev, image: '' }))

    // Store the file for upload
    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target.result
      setImagePreview(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImagePreview('')
    setImageFile(null)
    setFormData((prev) => ({ ...prev, image: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getDefaultImage = () => {
    // Return a data URI for a simple placeholder image
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave({
        ...formData,
        food_category_id: parseInt(formData.food_category_id),
        price: parseFloat(formData.price),
        gst_percentage: formData.gst_percentage ? parseFloat(formData.gst_percentage) : null,
        display_order: parseInt(formData.display_order) || 0,
        imageFile: imageFile, // Pass the file separately for upload
      })
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{item ? 'Edit Item' : 'Add Item'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {Object.keys(errors).length > 0 && (
            <Alert variant="danger">
              <strong>Please fix the following errors:</strong>
              <ul className="mb-0">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <FormRow>
            <SelectField
              id="food_category_id"
              label="Category"
              name="food_category_id"
              value={formData.food_category_id}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select a category' },
                ...categories
                  .filter((cat) => cat.status === 'active')
                  .map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  })),
              ]}
              required
              invalid={!!errors.food_category_id}
              feedback={errors.food_category_id}
              helpText={(item || selectedCategory) 
                ? (item 
                    ? 'Category cannot be changed after item is created.'
                    : 'Category is pre-selected from the category you clicked.')
                : undefined}
              col={12}
              disabled={!!item || !!selectedCategory}
            />
          </FormRow>

          <FormRow>
            <TextField
              id="name"
              label="Item Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter item name"
              required
              invalid={!!errors.name}
              feedback={errors.name}
              col={12}
            />
          </FormRow>

          <FormRow>
            <TextAreaField
              id="description"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter item description (optional)"
              rows={3}
              col={12}
            />
          </FormRow>

          <FormRow>
            <TextField
              id="price"
              label="Price (₹)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              invalid={!!errors.price}
              feedback={errors.price}
              col={6}
            />
            <TextField
              id="gst_percentage"
              label="GST Percentage (%)"
              name="gst_percentage"
              type="number"
              value={formData.gst_percentage}
              onChange={handleChange}
              placeholder="5.00"
              min="0"
              max="100"
              step="0.01"
              invalid={!!errors.gst_percentage}
              feedback={errors.gst_percentage}
              helpText="Leave empty to use default GST"
              col={6}
            />
          </FormRow>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Food Type</Form.Label>
                <div className="mt-2">
                  <Form.Check
                    type="radio"
                    label="Vegetarian"
                    name="is_veg"
                    id="veg-true"
                    checked={formData.is_veg === true}
                    onChange={() => setFormData((prev) => ({ ...prev, is_veg: true }))}
                  />
                  <Form.Check
                    type="radio"
                    label="Non-Vegetarian"
                    name="is_veg"
                    id="veg-false"
                    checked={formData.is_veg === false}
                    onChange={() => setFormData((prev) => ({ ...prev, is_veg: false }))}
                  />
                </div>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Status</Form.Label>
                <Form.Select name="status" value={formData.status} onChange={handleChange} className="border-2">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <FormRow>
            <TextField
              id="display_order"
              label="Display Order"
              name="display_order"
              type="number"
              value={formData.display_order}
              onChange={handleChange}
              min="0"
              placeholder="0"
              helpText="Lower numbers appear first in the menu"
              col={12}
            />
          </FormRow>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Item Image (Optional)</Form.Label>
            <div className="border-2 rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
              {imagePreview ? (
                <div className="position-relative d-inline-block">
                  <Image
                    src={imagePreview}
                    alt="Item preview"
                    rounded
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-1"
                    onClick={handleRemoveImage}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              ) : (
                <div
                  className="d-flex flex-column align-items-center justify-content-center"
                  style={{ minHeight: '150px', cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image
                    src={getDefaultImage()}
                    alt="Default"
                    rounded
                    style={{ width: '150px', height: '150px', objectFit: 'cover', opacity: 0.5 }}
                  />
                  <small className="text-muted mt-2">
                    <FontAwesomeIcon icon={faUpload} className="me-1" />
                    Click to upload image
                  </small>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              {errors.image && (
                <div className="text-danger small mt-2">{errors.image}</div>
              )}
              <Form.Text className="text-muted d-block mt-2">
                JPEG, PNG, WebP up to 2MB. Leave empty to use default image.
              </Form.Text>
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

ItemForm.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  item: PropTypes.object,
  categories: PropTypes.array,
  selectedCategory: PropTypes.object, // Category to auto-select when creating
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

export default ItemForm

