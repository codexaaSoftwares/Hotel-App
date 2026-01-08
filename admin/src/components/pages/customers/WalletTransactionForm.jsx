import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { FormRow, TextField, SelectField, TextAreaField } from '../../common/FormFields'
import PropTypes from 'prop-types'

const WalletTransactionForm = forwardRef(
  ({ mode = 'create', transactionData = null, customerId, onSubmit }, ref) => {
    const [formData, setFormData] = useState({
      transaction_type: 'credit',
      amount: '',
      payment_method: 'cash',
      transaction_date: new Date().toISOString().slice(0, 16),
      description: '',
      reference_number: '',
      bill_id: null,
    })
    const [errors, setErrors] = useState({})

    // Load transaction data in edit mode
    useEffect(() => {
      if (mode === 'edit' && transactionData) {
        const date = transactionData.transactionDate
          ? new Date(transactionData.transactionDate).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16)

        setFormData({
          transaction_type: transactionData.transactionType || 'credit',
          amount: transactionData.amount?.toString() || '',
          payment_method: transactionData.paymentMethod || 'cash',
          transaction_date: date,
          description: transactionData.description || '',
          reference_number: transactionData.referenceNumber || '',
          bill_id: transactionData.billId || null,
        })
      }
    }, [mode, transactionData])

    const handleChange = (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    }

    const validate = () => {
      const newErrors = {}

      if (!formData.transaction_type) {
        newErrors.transaction_type = 'Transaction type is required'
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Amount must be greater than 0'
      }

      if (!formData.transaction_date) {
        newErrors.transaction_date = 'Transaction date is required'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
      if (!validate()) {
        return null
      }

      const submitData = {
        transaction_type: formData.transaction_type,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method || null,
        transaction_date: new Date(formData.transaction_date).toISOString(),
        description: formData.description || null,
        reference_number: formData.reference_number || null,
        bill_id: formData.bill_id || null,
      }

      return submitData
    }

    const resetForm = () => {
      setFormData({
        transaction_type: 'credit',
        amount: '',
        payment_method: 'cash',
        transaction_date: new Date().toISOString().slice(0, 16),
        description: '',
        reference_number: '',
        bill_id: null,
      })
      setErrors({})
    }

    // Expose submit method to parent via ref
    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      setErrors: (newErrors) => setErrors(newErrors),
      reset: resetForm,
    }))

    return (
      <div>
        <FormRow>
          <SelectField
            id="transaction_type"
            label="Transaction Type"
            value={formData.transaction_type}
            onChange={(e) => handleChange('transaction_type', e.target.value)}
            invalid={!!errors.transaction_type}
            feedback={errors.transaction_type}
            col={6}
            required
            options={[
              { value: 'credit', label: 'Credit - Payment Received (Increases Balance)' },
              { value: 'debit', label: 'Debit - Refund/Adjustment (Decreases Balance)' },
            ]}
            helpText="Credit = Money received from customer | Debit = Money given back to customer"
          />
          <TextField
            id="amount"
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            invalid={!!errors.amount}
            feedback={errors.amount}
            required
            placeholder="Enter amount"
            col={6}
          />
        </FormRow>

        <FormRow>
          <TextField
            id="transaction_date"
            label="Transaction Date & Time"
            type="datetime-local"
            value={formData.transaction_date}
            onChange={(e) => handleChange('transaction_date', e.target.value)}
            invalid={!!errors.transaction_date}
            feedback={errors.transaction_date}
            required
            col={6}
          />
          <SelectField
            id="payment_method"
            label="Payment Method"
            value={formData.payment_method}
            onChange={(e) => handleChange('payment_method', e.target.value)}
            invalid={!!errors.payment_method}
            feedback={errors.payment_method}
            col={6}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'upi', label: 'UPI' },
              { value: 'card', label: 'Card' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
            ]}
          />
        </FormRow>

        <FormRow>
          <TextAreaField
            id="description"
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            invalid={!!errors.description}
            feedback={errors.description}
            placeholder="Enter transaction description"
            rows={3}
            col={12}
          />
        </FormRow>

        <FormRow>
          <TextField
            id="reference_number"
            label="Reference Number"
            value={formData.reference_number}
            onChange={(e) => handleChange('reference_number', e.target.value)}
            invalid={!!errors.reference_number}
            feedback={errors.reference_number}
            placeholder="Receipt number, UPI reference, etc."
            col={12}
          />
        </FormRow>
      </div>
    )
  }
)

WalletTransactionForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  transactionData: PropTypes.object,
  customerId: PropTypes.number,
  onSubmit: PropTypes.func,
}

WalletTransactionForm.displayName = 'WalletTransactionForm'

export default WalletTransactionForm

