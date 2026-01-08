import React, { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { TextField, TextAreaField, SelectField, FormRow } from '../../common/FormFields'

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

          <FormRow>
            <TextField
              id="name"
              label="Category Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter category name"
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
              placeholder="Enter category description (optional)"
              rows={3}
              col={12}
            />
          </FormRow>

          <FormRow>
            <TextField
              id="display_order"
              label="Display Order"
              name="display_order"
              type="number"
              value={formData.display_order}
              onChange={handleChange}
              min="1"
              required
              invalid={!!errors.display_order}
              feedback={errors.display_order}
              helpText="Lower numbers appear first in the menu"
              col={12}
            />
          </FormRow>

          <FormRow>
            <SelectField
              id="status"
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              col={12}
            />
          </FormRow>
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

