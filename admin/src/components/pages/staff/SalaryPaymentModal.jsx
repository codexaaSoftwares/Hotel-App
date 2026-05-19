import React, { useState, useEffect } from 'react'
import { Modal, Form, Alert } from 'react-bootstrap'
import { FormRow, TextField, SelectField, TextAreaField } from '../../common/FormFields'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'

const SalaryPaymentModal = ({ show, onHide, staff, salaryPayment, mode = 'create', onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    paidAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: '',
  })
  const [errors, setErrors] = useState({})

  // Load salary payment data for edit mode
  useEffect(() => {
    if (mode === 'edit' && salaryPayment && show) {
      setFormData({
        month: salaryPayment.month || new Date().getMonth() + 1,
        year: salaryPayment.year || new Date().getFullYear(),
        paidAmount: salaryPayment.paidAmount || '',
        paymentDate: salaryPayment.paymentDate
          ? new Date(salaryPayment.paymentDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        paymentMethod: salaryPayment.paymentMethod || 'cash',
        notes: salaryPayment.notes || '',
      })
    } else if (mode === 'create' && staff && show) {
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        paidAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        notes: '',
      })
    }
  }, [staff, salaryPayment, mode, show])

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        paidAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        notes: '',
      })
      setErrors({})
    }
  }, [show])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Recalculate payable amount if month/year changes (for future use if needed)
    // Currently, both monthly and other use the same salary amount

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.month || formData.month < 1 || formData.month > 12) {
      newErrors.month = 'Please select a valid month'
    }

    if (!formData.year || formData.year < 2000 || formData.year > 2100) {
      newErrors.year = 'Please enter a valid year'
    }

    if (!formData.paidAmount || parseFloat(formData.paidAmount) <= 0) {
      newErrors.paidAmount = 'Paid amount must be greater than 0'
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required'
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const paymentData = {
      month: parseInt(formData.month),
      year: parseInt(formData.year),
      paidAmount: parseFloat(formData.paidAmount),
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes.trim() || null,
    }

    // Only include staffId for create mode
    if (mode === 'create' && staff) {
      paymentData.staffId = staff.id
    }

    onSubmit(paymentData)
  }

  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank', label: 'Bank Transfer' },
  ]

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faWallet} className="me-2" />
          {mode === 'edit' ? 'Edit Salary Payment' : `Pay Salary - ${staff?.name} (${staff?.staffCode})`}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {(staff || (mode === 'edit' && salaryPayment?.staff)) && (
            <Alert variant="info" className="mb-3">
              <strong>Staff Details:</strong>
              <br />
              {(() => {
                const staffInfo = staff || salaryPayment?.staff
                return `Department: ${staffInfo?.department || '—'} | Salary Type: ${staffInfo?.salaryType === 'monthly' ? 'Monthly' : 'Other'} | Salary: ₹${staffInfo?.salaryAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`
              })()}
            </Alert>
          )}

          <FormRow>
            <SelectField
              id="month"
              label="Month"
              value={formData.month}
              onChange={(e) => handleChange('month', parseInt(e.target.value))}
              options={monthOptions}
              required
              invalid={!!errors.month}
              feedback={errors.month}
              col={6}
            />
            <TextField
              id="year"
              label="Year"
              type="number"
              value={formData.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value))}
              placeholder="Enter year (e.g., 2025)"
              required
              invalid={!!errors.year}
              feedback={errors.year}
              col={6}
            />
          </FormRow>

          <FormRow>
            <TextField
              id="paidAmount"
              label="Paid Amount"
              type="number"
              value={formData.paidAmount}
              onChange={(e) => handleChange('paidAmount', e.target.value)}
              placeholder="Enter paid amount"
              required
              invalid={!!errors.paidAmount}
              feedback={errors.paidAmount}
              col={6}
            />
          </FormRow>

          <FormRow>
            <TextField
              id="paymentDate"
              label="Payment Date"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => handleChange('paymentDate', e.target.value)}
              required
              invalid={!!errors.paymentDate}
              feedback={errors.paymentDate}
              col={6}
            />
            <SelectField
              id="paymentMethod"
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
              options={paymentMethodOptions}
              required
              invalid={!!errors.paymentMethod}
              feedback={errors.paymentMethod}
              col={6}
            />
          </FormRow>

          <FormRow>
            <TextAreaField
              id="notes"
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Enter any additional notes (optional)"
              rows={3}
              col={12}
            />
          </FormRow>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={onHide} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : mode === 'edit' ? 'Update Payment' : 'Record Payment'}
          </button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

SalaryPaymentModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  staff: PropTypes.object,
  salaryPayment: PropTypes.object,
  mode: PropTypes.oneOf(['create', 'edit']),
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

export default SalaryPaymentModal

