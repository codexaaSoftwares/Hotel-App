import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
import { FormRow, TextField, SelectField } from '../../common/FormFields'
import { Form, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'
import financialService from '../../../services/financialService'
import financialCategoryService from '../../../services/financialCategoryService'

const FinancialTransactionForm = forwardRef(({ 
  mode = 'create', 
  transactionData = null, 
  onSubmit, 
  onCancel,
  loading = false 
}, ref) => {
  const [formData, setFormData] = useState({
    transaction_type: '',
    transaction_date: '',
    category_id: '',
    amount: '',
    description: ''
  })
  const [errors, setErrors] = useState({})
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const previousTransactionTypeRef = useRef(null)

  // Load transaction data for edit mode
  useEffect(() => {
    if (mode === 'edit' && transactionData) {
      const type = transactionData.transactionType || transactionData.transaction_type || ''
      const categoryId = transactionData.categoryId || transactionData.category_id || ''
      const date = transactionData.transactionDate || transactionData.transaction_date || ''
      
      // Set the previous type to the current type to prevent reset on initial load
      previousTransactionTypeRef.current = type
      
      // First load categories, then set form data
      if (type) {
        loadCategories(type).then(() => {
          setFormData({
            transaction_type: type,
            transaction_date: date ? new Date(date).toISOString().split('T')[0] : '',
            category_id: categoryId ? String(categoryId) : '',
            amount: transactionData.amount ? String(transactionData.amount) : '',
            description: transactionData.description || ''
          })
        })
      } else {
        setFormData({
          transaction_type: type,
          transaction_date: date ? new Date(date).toISOString().split('T')[0] : '',
          category_id: categoryId ? String(categoryId) : '',
          amount: transactionData.amount ? String(transactionData.amount) : '',
          description: transactionData.description || ''
        })
      }
    } else {
      previousTransactionTypeRef.current = null
    }
  }, [mode, transactionData])

  // Load categories when transaction type changes
  useEffect(() => {
    if (formData.transaction_type) {
      const previousType = previousTransactionTypeRef.current
      const typeChanged = previousType !== null && previousType !== formData.transaction_type
      
      loadCategories(formData.transaction_type)
      
      // Reset category when type changes (only if it actually changed, not on initial load)
      if (mode === 'create' || (mode === 'edit' && typeChanged)) {
        setFormData(prev => ({ ...prev, category_id: '' }))
      }
      
      // Update previous type
      previousTransactionTypeRef.current = formData.transaction_type
    } else {
      setCategories([])
      previousTransactionTypeRef.current = null
    }
  }, [formData.transaction_type, mode])

  const loadCategories = async (type) => {
    try {
      setLoadingCategories(true)
      const response = await financialCategoryService.getCategoriesByType(type)
      if (response && response.success) {
        setCategories(response.data || [])
        return response.data || []
      }
      return []
    } catch (err) {
      console.error('Error loading categories:', err)
      setCategories([])
      return []
    } finally {
      setLoadingCategories(false)
    }
  }

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

    if (!formData.transaction_type) {
      newErrors.transaction_type = 'Transaction type is required'
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Transaction date is required'
    } else {
      // Check if date is in the future
      const selectedDate = new Date(formData.transaction_date)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today
      if (selectedDate > today) {
        newErrors.transaction_date = 'Transaction date cannot be in the future'
      }
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required'
    } else {
      // Validate that selected category matches transaction type
      const selectedCategory = categories.find(cat => String(cat.id) === String(formData.category_id))
      if (selectedCategory) {
        const categoryType = selectedCategory.type
        if (categoryType !== formData.transaction_type) {
          newErrors.category_id = 'Selected category does not match transaction type'
        }
      }
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0'
    } else if (isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Please enter a valid amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const submitData = {
      // Only include transaction_type in create mode (backend doesn't allow changing it in update)
      ...(mode === 'create' && { transaction_type: formData.transaction_type }),
      transaction_date: formData.transaction_date,
      category_id: parseInt(formData.category_id),
      amount: parseFloat(formData.amount),
      description: formData.description.trim() || null
    }

    onSubmit(submitData)
  }

  // Expose handleSubmit to parent component via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: handleSubmit
  }), [formData, categories])

  const transactionTypeOptions = [
    { value: '', label: 'Select Transaction Type' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ]

  const categoryOptions = [
    { value: '', label: loadingCategories ? 'Loading categories...' : 'Select Category' },
    ...categories
      .filter(cat => cat.type === formData.transaction_type && (cat.status === 'active' || !cat.status))
      .map(cat => ({
        value: String(cat.id),
        label: cat.name
      }))
  ]

  // Get today's date in YYYY-MM-DD format for max date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <FormRow>
        <SelectField
          id="transaction_type"
          label="Transaction Type"
          value={formData.transaction_type}
          onChange={(e) => handleChange('transaction_type', e.target.value)}
          options={transactionTypeOptions}
          required
          disabled={mode === 'edit'}
          col={6}
          invalid={!!errors.transaction_type}
          feedback={errors.transaction_type}
          helpText={mode === 'edit' ? 'Transaction type cannot be changed' : 'Select whether this is an income or expense'}
        />
        <TextField
          id="transaction_date"
          label="Transaction Date"
          type="date"
          max={today}
          value={formData.transaction_date}
          onChange={(e) => handleChange('transaction_date', e.target.value)}
          required
          col={6}
          invalid={!!errors.transaction_date}
          feedback={errors.transaction_date}
        />
      </FormRow>

      <FormRow>
        <SelectField
          id="category_id"
          label="Category"
          value={formData.category_id}
          onChange={(e) => handleChange('category_id', e.target.value)}
          options={categoryOptions}
          required
          disabled={!formData.transaction_type || loadingCategories}
          col={6}
          invalid={!!errors.category_id}
          feedback={errors.category_id}
          helpText={formData.transaction_type ? `Select a ${formData.transaction_type} category` : 'Select transaction type first'}
        />
        <TextField
          id="amount"
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          placeholder="Enter amount"
          required
          col={6}
          invalid={!!errors.amount}
          feedback={errors.amount}
          helpText="Enter the transaction amount"
        />
      </FormRow>

      <FormRow>
        <Col md={12}>
          <Form.Label htmlFor="description" className="fw-semibold">
            Description/Notes <span className="text-muted">(Optional)</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter description or notes (optional)"
            className="border-2"
          />
          {errors.description && (
            <div className="invalid-feedback d-block">{errors.description}</div>
          )}
        </Col>
      </FormRow>
    </div>
  )
})

FinancialTransactionForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  transactionData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
}

export default FinancialTransactionForm
