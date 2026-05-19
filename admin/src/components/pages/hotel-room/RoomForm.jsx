import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import { FormRow, TextField, SelectField, TextAreaField } from '../../common/FormFields'
import PropTypes from 'prop-types'
import roomService from '../../../services/roomService'

const RoomForm = forwardRef(({ 
  mode = 'create', 
  roomData = null, 
  onSubmit, 
  onCancel,
  loading = false 
}, ref) => {
  const [formData, setFormData] = useState({
    room_number: '',
    room_category_id: '',
    floor_number: 1,
    bed_type: 'double',
    max_occupancy: 2,
    room_price: '',
    status: 'available',
    notes: '',
    is_active: true
  })
  const [errors, setErrors] = useState({})
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Load room categories
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const response = await roomService.getRoomCategories({ limit: 100, status: 'active' })
        if (response.success) {
          setCategories(response.data || [])
        }
      } catch (err) {
        console.error('Error loading categories:', err)
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

  // Load room data for edit mode
  useEffect(() => {
    if (mode === 'edit' && roomData) {
      setFormData({
        room_number: roomData.room_number || '',
        room_category_id: roomData.room_category_id || '',
        floor_number: roomData.floor_number || 1,
        bed_type: roomData.bed_type || 'double',
        max_occupancy: roomData.max_occupancy || 2,
        room_price: roomData.room_price !== null && roomData.room_price !== undefined ? roomData.room_price : '',
        status: roomData.status || 'available',
        notes: roomData.notes || '',
        is_active: roomData.is_active !== undefined ? roomData.is_active : true
      })
    }
  }, [mode, roomData])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.room_number.trim()) {
      newErrors.room_number = 'Room number is required'
    } else if (formData.room_number.trim().length > 50) {
      newErrors.room_number = 'Room number must be 50 characters or less'
    }

    if (!formData.room_category_id) {
      newErrors.room_category_id = 'Room category is required'
    }

    if (formData.floor_number === null || formData.floor_number === undefined || formData.floor_number < 0) {
      newErrors.floor_number = 'Floor number must be 0 or greater'
    } else if (formData.floor_number > 100) {
      newErrors.floor_number = 'Floor number cannot exceed 100'
    }

    if (!['single', 'double', 'king', 'queen', 'twin'].includes(formData.bed_type)) {
      newErrors.bed_type = 'Invalid bed type'
    }

    if (!formData.max_occupancy || formData.max_occupancy < 1) {
      newErrors.max_occupancy = 'Max occupancy must be at least 1'
    } else if (formData.max_occupancy > 20) {
      newErrors.max_occupancy = 'Max occupancy cannot exceed 20'
    }

    if (formData.room_price !== '' && formData.room_price !== null && formData.room_price !== undefined) {
      if (parseFloat(formData.room_price) < 0) {
        newErrors.room_price = 'Room price must be 0 or greater'
      }
    }

    if (!['available', 'occupied', 'cleaning', 'maintenance', 'reserved'].includes(formData.status)) {
      newErrors.status = 'Invalid status'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return null
    }

    const submitData = {
      room_number: formData.room_number.trim(),
      room_category_id: parseInt(formData.room_category_id),
      floor_number: parseInt(formData.floor_number) || 1,
      bed_type: formData.bed_type,
      max_occupancy: parseInt(formData.max_occupancy) || 2,
      room_price: formData.room_price === '' ? null : (parseFloat(formData.room_price) || null),
      status: formData.status,
      notes: formData.notes.trim() || null,
      is_active: formData.is_active,
    }

    return submitData
  }

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({
      room_number: '',
      room_category_id: '',
      floor_number: 1,
      bed_type: 'double',
      max_occupancy: 2,
      room_price: '',
      status: 'available',
      notes: '',
      is_active: true
    })
    setErrors({})
  }, [])

  // Reset form when mode changes to create
  useEffect(() => {
    if (mode === 'create') {
      resetForm()
    }
  }, [mode, resetForm])

  // Expose submit method to parent via ref
  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    setErrors: (newErrors) => setErrors(newErrors),
    reset: resetForm,
  }))

  const bedTypeOptions = [
    { value: 'single', label: 'Single' },
    { value: 'double', label: 'Double' },
    { value: 'king', label: 'King' },
    { value: 'queen', label: 'Queen' },
    { value: 'twin', label: 'Twin' }
  ]

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'maintenance', label: 'Maintenance' }
  ]

  const categoryOptions = [
    { value: '', label: 'Select Category' },
    ...categories.map(cat => ({
      value: cat.id,
      label: cat.name
    }))
  ]

  return (
    <div>
      <FormRow>
        <TextField
          id="room_number"
          label="Room Number"
          value={formData.room_number}
          onChange={(e) => handleChange('room_number', e.target.value)}
          invalid={!!errors.room_number}
          feedback={errors.room_number}
          required
          placeholder="e.g., 101, 201A, 301B"
          disabled={loading}
          col={6}
        />
        <SelectField
          id="room_category_id"
          label="Room Category"
          value={formData.room_category_id}
          onChange={(e) => handleChange('room_category_id', e.target.value)}
          invalid={!!errors.room_category_id}
          feedback={errors.room_category_id}
          options={categoryOptions}
          required
          disabled={loading || loadingCategories}
          col={6}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="floor_number"
          label="Floor Number"
          type="number"
          value={formData.floor_number}
          onChange={(e) => handleChange('floor_number', parseInt(e.target.value) || 0)}
          invalid={!!errors.floor_number}
          feedback={errors.floor_number}
          required
          min={0}
          max={100}
          disabled={loading}
          col={4}
        />
        <SelectField
          id="bed_type"
          label="Bed Type"
          value={formData.bed_type}
          onChange={(e) => handleChange('bed_type', e.target.value)}
          invalid={!!errors.bed_type}
          feedback={errors.bed_type}
          options={bedTypeOptions}
          required
          disabled={loading}
          col={4}
        />
        <TextField
          id="max_occupancy"
          label="Max Occupancy"
          type="number"
          value={formData.max_occupancy}
          onChange={(e) => handleChange('max_occupancy', parseInt(e.target.value) || 1)}
          invalid={!!errors.max_occupancy}
          feedback={errors.max_occupancy}
          required
          min={1}
          max={20}
          disabled={loading}
          col={4}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="room_price"
          label="Room Price (Per Night)"
          type="number"
          value={formData.room_price}
          onChange={(e) => handleChange('room_price', e.target.value)}
          invalid={!!errors.room_price}
          feedback={errors.room_price}
          placeholder="Leave empty to use category price"
          min={0}
          step="0.01"
          disabled={loading}
          col={6}
        />
        <SelectField
          id="status"
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          invalid={!!errors.status}
          feedback={errors.status}
          options={statusOptions}
          disabled={loading}
          col={6}
        />
      </FormRow>

      <FormRow>
        <TextAreaField
          id="notes"
          label="Notes (Optional)"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          invalid={!!errors.notes}
          feedback={errors.notes}
          placeholder="Enter any additional notes about the room"
          disabled={loading}
          rows={3}
          col={12}
        />
      </FormRow>

      <FormRow>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
            disabled={loading}
          />
          <label className="form-check-label" htmlFor="is_active">
            Active
          </label>
          <small className="form-text text-muted d-block">
            Inactive rooms will be hidden from booking selection
          </small>
        </div>
      </FormRow>
    </div>
  )
})

RoomForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  roomData: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
}

RoomForm.displayName = 'RoomForm'

export default RoomForm

