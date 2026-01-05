import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { FormRow, TextField, SelectField } from '../../common/FormFields'
import { Card } from 'react-bootstrap'
import PropTypes from 'prop-types'
import paymentService from '../../../services/paymentService'
import orderService from '../../../services/orderService'

const PaymentForm = forwardRef(({ 
  mode = 'create', 
  paymentData = null,
  initialOrderId = null,
  initialAmount = '',
  onSubmit, 
  onCancel,
  loading = false 
}, ref) => {
  const [formData, setFormData] = useState({
    order_id: initialOrderId || '',
    amount: initialAmount !== undefined && initialAmount !== null && initialAmount !== ''
      ? initialAmount.toString()
      : '',
    payment_type: 'credit',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    remarks: ''
  })
  const [order, setOrder] = useState(null)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    if (mode === 'edit' && paymentData) {
      setFormData({
        order_id: paymentData.order_id?.toString() || paymentData.orderId?.toString() || '',
        amount: paymentData.amount !== undefined && paymentData.amount !== null
          ? paymentData.amount.toString()
          : '',
        payment_type: paymentData.payment_type || paymentData.paymentType || 'credit',
        payment_method: paymentData.payment_method || paymentData.paymentMethod || 'cash',
        payment_date: paymentData.payment_date
          ? paymentData.payment_date.split('T')[0]
          : (paymentData.paymentDate ? paymentData.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0]),
        remarks: paymentData.remarks || ''
      })
    } else if (mode === 'create') {
      setFormData(prev => {
        const nextOrderId = initialOrderId ? initialOrderId.toString() : ''
        const hasOrderChanged = nextOrderId !== prev.order_id

        const nextAmount = initialAmount !== undefined && initialAmount !== null && initialAmount !== ''
          ? initialAmount.toString()
          : (hasOrderChanged ? '' : prev.amount)

        if (!hasOrderChanged && nextAmount === prev.amount) {
          return prev
        }

        return {
          ...prev,
          order_id: nextOrderId,
          amount: nextAmount
        }
      })
    }
  }, [mode, paymentData, initialOrderId, initialAmount])

  useEffect(() => {
    if (formData.order_id) {
      loadOrderDetails(formData.order_id)
    } else {
      setOrder(null)
    }
  }, [formData.order_id])

  const loadOrders = async () => {
    try {
      setLoadingOrders(true)
      // Load orders without status filter (to get all orders) with customer data
      // Use a large limit to get all orders for the dropdown
      const response = await orderService.getOrders({ 
        limit: 1000, // Large limit to get all orders
        // Don't pass status: 'all' as backend doesn't accept it
      })
      if (response.success) {
        // Backend returns orders with customer relationship loaded via OrderResource
        const ordersList = response.data?.orders || response.data || []
        
        // Debug: Log first order to see customer data structure
        if (ordersList.length > 0) {
          console.log('Sample order with customer data:', {
            id: ordersList[0].id,
            order_number: ordersList[0].order_number || ordersList[0].orderNumber,
            customer: ordersList[0].customer,
            hasCustomer: !!ordersList[0].customer
          })
        }
        
        setOrders(ordersList)
        console.log('Loaded orders for payment:', ordersList.length, 'orders with customer data')
      } else {
        console.warn('Failed to load orders, response:', response)
        setOrders([])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      console.error('Error details:', error.response?.data || error.message)
      setOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  const getRemainingAmount = (source) => {
    if (!source) return 0

    const totalAmount = Number(
      source.totalAmount ??
      source.total_amount ??
      source.total ??
      0
    )
    const paidAmount = Number(
      source.paidAmount ??
      source.paid_amount ??
      source.paid ??
      0
    )
    const remaining = Number(
      source.remainingAmount ??
        source.remaining_amount ??
        source.balanceAmount ??
        source.balance_amount ??
        source.remaining ??
        (totalAmount - paidAmount)
    )

    return Math.max(0, remaining)
  }

  const loadOrderDetails = async (orderId) => {
    const sanitizedId = orderId.toString().replace(/^#/, '').trim()
    try {
      setLoadingOrder(true)
      const response = await orderService.getOrderById(sanitizedId)
      if (response.success) {
        const fetchedOrder = response.data || {}
        const totalAmount = Number(
          fetchedOrder.totalAmount ??
          fetchedOrder.total_amount ??
          fetchedOrder.total ??
          0
        )
        const paidAmount = Number(
          fetchedOrder.paidAmount ??
          fetchedOrder.paid_amount ??
          fetchedOrder.paid ??
          0
        )
        const remainingAmount = getRemainingAmount(fetchedOrder)

        const normalizedOrder = {
          ...fetchedOrder,
          total_amount: totalAmount,
          totalAmount,
          paid_amount: paidAmount,
          paidAmount,
          remaining_amount: remainingAmount,
          remainingAmount,
          balance_amount: remainingAmount
        }

        setOrder(normalizedOrder)
        if (mode !== 'edit') {
          setFormData(prev => {
            const suggestion = prev.payment_type === 'debit' ? paidAmount : remainingAmount

            if (prev.order_id !== sanitizedId) {
              return suggestion > 0
                ? {
                    ...prev,
                    order_id: sanitizedId,
                    amount: suggestion.toString()
                  }
                : prev
            }

            if (!prev.amount && suggestion > 0) {
              return {
                ...prev,
                order_id: sanitizedId,
                amount: suggestion.toString()
              }
            }

            return prev
          })
        }
      }
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setLoadingOrder(false)
    }
  }

  useEffect(() => {
    if (!order || mode === 'edit') return

    setFormData(prev => {
      if (prev.amount) return prev

      const totalAmount = Number(order.totalAmount ?? order.total_amount ?? order.total ?? 0)
      const paidAmount = Number(order.paidAmount ?? order.paid_amount ?? order.paid ?? 0)
      const balanceAmount = getRemainingAmount(order)
      const suggestion = prev.payment_type === 'debit' ? paidAmount : balanceAmount

      if (suggestion > 0) {
        return {
          ...prev,
          amount: suggestion.toString()
        }
      }

      return prev
    })
  }, [formData.payment_type, order, mode])

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      }
      if (field === 'payment_type' && mode === 'create') {
        updated.amount = ''
      }
      return updated
    })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.order_id) {
      newErrors.order_id = 'Order selection is required'
    }

    if (!formData.payment_type) {
      newErrors.payment_type = 'Payment type is required'
    }

    const numericAmount = parseFloat(formData.amount)
    if (!formData.amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0'
    } else if (formData.payment_type === 'credit' && order) {
      const balanceAmount = getRemainingAmount(order)
      if (balanceAmount >= 0 && numericAmount > balanceAmount) {
        newErrors.amount = `Amount cannot exceed order balance of ${formatCurrency(balanceAmount)}`
      }
    } else if (formData.payment_type === 'debit' && order) {
      const paidAmount = Number(order.paidAmount ?? order.paid_amount ?? order.paid ?? 0)
      if (numericAmount > paidAmount) {
        newErrors.amount = `Debit amount cannot exceed total paid amount of ${formatCurrency(paidAmount)}`
      }
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Payment method is required'
    }

    if (!formData.payment_date) {
      newErrors.payment_date = 'Payment date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const sanitizedOrderId = formData.order_id
      ? formData.order_id.toString().replace(/^#/, '').trim()
      : ''

    const submitData = {
      order_id: sanitizedOrderId,
      amount: parseFloat(formData.amount),
      payment_type: formData.payment_type || 'credit',
      payment_method: formData.payment_method,
      payment_date: formData.payment_date,
      remarks: formData.remarks.trim() || null
    }

    onSubmit(submitData)
  }

  useImperativeHandle(ref, () => ({
    handleSubmit: handleSubmit
  }), [formData, order])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  const paymentMethods = paymentService.getPaymentMethods()
  const paymentTypeOptions = [
    { value: 'credit', label: 'Credit (Payment Received)' },
    { value: 'debit', label: 'Debit (Refund to Customer)' }
  ]
  const totalAmount = order ? Number(order.totalAmount ?? order.total_amount ?? order.total ?? 0) : 0
  const paidAmount = order ? Number(order.paidAmount ?? order.paid_amount ?? order.paid ?? 0) : 0
  const balanceAmount = order ? getRemainingAmount(order) : 0
  const amountHelpText = formData.payment_type === 'debit'
    ? (order ? `Max refund: ${formatCurrency(paidAmount)}` : 'Debit: amount returned to customer')
    : (order ? `Max payment: ${formatCurrency(balanceAmount)}` : 'Credit: amount received from customer')
  const amountLabel = formData.payment_type === 'debit' ? 'Refund Amount' : 'Payment Amount'
  const amountPlaceholder = formData.payment_type === 'debit' ? 'Enter refund amount' : 'Enter payment amount'

  return (
    <div>
      <FormRow>
        <SelectField
          id="order_id"
          label="Order (with Customer)"
          value={formData.order_id}
          onChange={(e) => handleChange('order_id', e.target.value)}
          options={[
            { value: '', label: 'Select Order' },
            ...orders
              .sort((a, b) => {
                // Sort by ID (ascending)
                const idA = parseInt(a.id) || 0
                const idB = parseInt(b.id) || 0
                return idA - idB
              })
              .map(order => {
                // Get customer name from various possible formats (ONLY name, no mobile/phone)
                let customerName = 'Customer'
                if (order.customer) {
                  // Use name accessor if available
                  if (order.customer.name) {
                    customerName = order.customer.name.trim()
                  } 
                  // Or build from firstName and lastName
                  else if (order.customer.firstName || order.customer.lastName) {
                    customerName = `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
                  }
                } else if (order.customer_name) {
                  // Remove any mobile/phone numbers if present in customer_name
                  customerName = order.customer_name.toString().replace(/\d{10,}/g, '').trim()
                }
                
                // Get customer_code in #CUST format (like in customer list)
                const customerCode = order.customer?.customer_code || 
                                    order.customer?.customerId || 
                                    order.customer?.photographerId ||
                                    (order.customer?.id ? `#CUST${String(order.customer.id).padStart(3, '0')}` : '') ||
                                    (order.customer_id ? `#CUST${String(order.customer_id).padStart(3, '0')}` : '')
                
                // Format: Customer Name (#CUST006)
                // Example: "Rajesh Patel (#CUST001)"
                return {
                  value: order.id.toString(), // Order ID as value
                  label: customerCode ? `${customerName} (${customerCode})` : customerName
                }
              })
          ]}
          required
          col={6}
          invalid={!!errors.order_id}
          feedback={errors.order_id}
          helpText={loadingOrders ? 'Loading orders...' : 'Select order to record payment or refund'}
        />
        <TextField
          id="payment_date"
          label={formData.payment_type === 'debit' ? 'Refund Date' : 'Payment Date'}
          type="date"
          value={formData.payment_date}
          onChange={(e) => handleChange('payment_date', e.target.value)}
          required
          col={6}
          invalid={!!errors.payment_date}
          feedback={errors.payment_date}
        />
      </FormRow>

      <FormRow>
        <SelectField
          id="payment_type"
          label="Payment Type"
          value={formData.payment_type}
          onChange={(e) => handleChange('payment_type', e.target.value)}
          options={paymentTypeOptions}
          required
          col={6}
          invalid={!!errors.payment_type}
          feedback={errors.payment_type}
        />
        <SelectField
          id="payment_method"
          label="Payment Method"
          value={formData.payment_method}
          onChange={(e) => handleChange('payment_method', e.target.value)}
          options={paymentMethods}
          required
          col={6}
          invalid={!!errors.payment_method}
          feedback={errors.payment_method}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="amount"
          label={amountLabel}
          type="number"
          min="0.01"
          step="0.01"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          placeholder={amountPlaceholder}
          required
          col={12}
          invalid={!!errors.amount}
          feedback={errors.amount}
          helpText={amountHelpText}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="remarks"
          label="Remarks"
          value={formData.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          placeholder="Enter remarks (optional)"
          col={12}
        />
      </FormRow>
    </div>
  )
})

PaymentForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  paymentData: PropTypes.object,
  initialOrderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
}

export default PaymentForm

