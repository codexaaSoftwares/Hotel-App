import React, { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import PropTypes from 'prop-types'

const CategoryForm = ({ show, onHide, category, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 1,
    status: 'active',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        display_order: category.display_order || 1,
        status: category.status || 'active',
      })
    } else {
      setFormData({
        name: '',
        description: '',
        display_order: 1,
        status: 'active',
      })
    }
    setErrors({})
  }, [category, show])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    }
    if (formData.display_order < 1) {
      newErrors.display_order = 'Display order must be at least 1'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{category ? 'Edit Category' : 'Add Category'}</Modal.Title>
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

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Category Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter category name"
              isInvalid={!!errors.name}
              className="border-2"
              required
            />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter category description (optional)"
              className="border-2"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Display Order <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              name="display_order"
              value={formData.display_order}
              onChange={handleChange}
              min="1"
              isInvalid={!!errors.display_order}
              className="border-2"
              required
            />
            <Form.Control.Feedback type="invalid">{errors.display_order}</Form.Control.Feedback>
            <Form.Text className="text-muted">Lower numbers appear first in the menu</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Status</Form.Label>
            <Form.Select name="status" value={formData.status} onChange={handleChange} className="border-2">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

CategoryForm.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  category: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

export default CategoryForm

