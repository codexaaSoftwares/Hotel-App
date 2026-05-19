import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { FormRow, TextField, SelectField, TextAreaField } from '../../common/FormFields'
import PropTypes from 'prop-types'

const ExpenseForm = forwardRef(
  ({ mode = 'create', expenseData = null, categories = [], onSubmit, onCancel, loading = false }, ref) => {
    const [formData, setFormData] = useState({
      categoryId: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      description: '',
    })
    const [errors, setErrors] = useState({})

    // Load expense data for edit mode
    useEffect(() => {
      if (mode === 'edit' && expenseData) {
        setFormData({
          categoryId: expenseData.categoryId?.toString() || '',
          amount: expenseData.amount?.toString() || '',
          expenseDate: expenseData.expenseDate || new Date().toISOString().split('T')[0],
          paymentMethod: expenseData.paymentMethod || 'cash',
          description: expenseData.description || '',
        })
      }
    }, [mode, expenseData])

    const handleChange = (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }))
      }
    }

    const validateForm = () => {
      const newErrors = {}

      if (!formData.categoryId || formData.categoryId === '') {
        newErrors.categoryId = 'Category is required'
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Amount must be greater than 0'
      }

      if (!formData.expenseDate) {
        newErrors.expenseDate = 'Expense date is required'
      }

      if (!formData.paymentMethod) {
        newErrors.paymentMethod = 'Payment method is required'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
      if (!validateForm()) {
        return null
      }

      const submitData = {
        categoryId: parseInt(formData.categoryId),
        amount: parseFloat(formData.amount),
        expenseDate: formData.expenseDate,
        paymentMethod: formData.paymentMethod,
        description: formData.description.trim() || null,
      }

      return submitData
    }

    const reset = () => {
      setFormData({
        categoryId: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        description: '',
      })
      setErrors({})
    }

    const setErrorsExternal = (externalErrors) => {
      setErrors(externalErrors || {})
    }

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      reset: reset,
      setErrors: setErrorsExternal,
    }))

    return (
      <div>
        <FormRow>
          <SelectField
            id="categoryId"
            label="Category"
            value={formData.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            options={[
              { value: '', label: 'Select Category' },
              ...categories
                .filter((cat) => cat.status === 'active')
                .map((cat) => ({
                  value: cat.id.toString(),
                  label: cat.name,
                })),
            ]}
            required
            invalid={!!errors.categoryId}
            feedback={errors.categoryId}
            col={6}
          />
          <TextField
            id="amount"
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            placeholder="0.00"
            required
            invalid={!!errors.amount}
            feedback={errors.amount}
            col={6}
          />
        </FormRow>

        <FormRow>
          <TextField
            id="expenseDate"
            label="Expense Date"
            type="date"
            value={formData.expenseDate}
            onChange={(e) => handleChange('expenseDate', e.target.value)}
            required
            invalid={!!errors.expenseDate}
            feedback={errors.expenseDate}
            col={6}
          />
          <SelectField
            id="paymentMethod"
            label="Payment Method"
            value={formData.paymentMethod}
            onChange={(e) => handleChange('paymentMethod', e.target.value)}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'upi', label: 'UPI' },
              { value: 'bank', label: 'Bank Transfer' },
            ]}
            required
            invalid={!!errors.paymentMethod}
            feedback={errors.paymentMethod}
            col={6}
          />
        </FormRow>

        <FormRow>
          <TextAreaField
            id="description"
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter expense description..."
            rows={3}
            invalid={!!errors.description}
            feedback={errors.description}
            col={12}
          />
        </FormRow>
      </div>
    )
  }
)

ExpenseForm.displayName = 'ExpenseForm'

ExpenseForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  expenseData: PropTypes.object,
  categories: PropTypes.array,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
}

export default ExpenseForm

