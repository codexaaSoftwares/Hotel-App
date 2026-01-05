import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { FormRow, TextField, SelectField } from '../../common/FormFields'
import PropTypes from 'prop-types'
import { Row, Col, Card } from 'react-bootstrap'
import { customerService } from '../../../services/customerService'
import branchService from '../../../services/branchService'
import transactionService from '../../../services/transactionService'
import orderService from '../../../services/orderService'

const TransactionForm = forwardRef(({ 
  mode = 'create', 
  transactionData = null,
  initialCustomerId = null,
  initialOrderId = null,
  initialBranchId = null,
  initialAmount = '',
  initialRemarks = '',
  orderDetails = null,
  onSubmit, 
  onCancel,
  loading = false 
}, ref) => {
  const toAmountString = (value) => {
    if (value === null || value === undefined || value === '') return ''
    const numeric = Number(value)
    return Number.isNaN(numeric) ? '' : numeric.toString()
  }

  const [formData, setFormData] = useState({
    customer_id: initialCustomerId || '',
    branch_id: initialBranchId || '',
    order_id: initialOrderId || '',
    transaction_date: new Date().toISOString().split('T')[0],
    type: 'credit', // Default to credit (payment received)
    amount: toAmountString(initialAmount),
    remarks: initialRemarks || ''
  })
  const [customers, setCustomers] = useState([])
  const [branches, setBranches] = useState([])
  const [errors, setErrors] = useState({})
  const [customerAmounts, setCustomerAmounts] = useState({
    totalAmount: 0,
    receivedAmount: 0,
    remainingAmount: 0
  })
  const [loadingAmounts, setLoadingAmounts] = useState(false)

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(Number(amount) || 0)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  useEffect(() => {
    loadCustomers()
    loadBranches()
  }, [])

  useEffect(() => {
    if (mode !== 'create') return

    setFormData(prev => ({
      ...prev,
      customer_id: initialCustomerId || '',
      branch_id: initialBranchId || '',
      order_id: initialOrderId || '',
      amount: initialAmount !== undefined && initialAmount !== null && initialAmount !== ''
        ? toAmountString(initialAmount)
        : prev.amount,
      remarks: initialRemarks || prev.remarks
    }))
  }, [initialCustomerId, initialOrderId, initialBranchId, initialAmount, initialRemarks, mode])

  // Load customer amounts when customer is selected
  useEffect(() => {
    if (formData.customer_id) {
      loadCustomerAmounts(formData.customer_id)
    } else {
      setCustomerAmounts({
        totalAmount: 0,
        receivedAmount: 0,
        remainingAmount: 0
      })
    }
  }, [formData.customer_id])

  useEffect(() => {
    if (mode === 'edit' && transactionData) {
      setFormData({
        customer_id: transactionData.customer_id?.toString() || '',
        branch_id: transactionData.branch_id?.toString() || '',
        order_id: transactionData.order_id?.toString() || transactionData.order?.id?.toString() || '',
        transaction_date: transactionData.transaction_date ? transactionData.transaction_date.split('T')[0] : new Date().toISOString().split('T')[0],
        type: transactionData.type || 'credit',
        amount: toAmountString(transactionData.amount),
        remarks: transactionData.remarks || ''
      })
      
      // Load customer amounts for edit mode
      if (transactionData.customer_id) {
        loadCustomerAmounts(transactionData.customer_id)
      }
    }
  }, [mode, transactionData])

  const loadCustomers = async () => {
    try {
      // Load customers from database via customerService
      const response = await customerService.getCustomers({ limit: 1000 })
      if (response.success) {
        setCustomers(response.data || [])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      setCustomers([])
    }
  }

  const loadBranches = async () => {
    try {
      const response = await branchService.getBranches({ status: 'active' })
      if (response.success) {
        setBranches(response.data || [])
      }
    } catch (error) {
      console.error('Error loading branches:', error)
    }
  }

  // Calculate customer amounts from orders and transactions
  const loadCustomerAmounts = async (customerId) => {
    try {
      setLoadingAmounts(true)
      
      // Get all orders for customer
      const ordersResponse = await orderService.getOrders({ customerId, limit: 1000 })
      const orders = ordersResponse?.data?.orders || ordersResponse?.data || []
      
      // Calculate total amount from orders
      const totalAmount = orders.reduce((sum, order) => {
        return sum + (Number(order.total_amount || order.total || 0))
      }, 0)
      
      // Get all transactions for customer
      const transactionsResponse = await transactionService.getTransactions({ customer_id: customerId, limit: 1000 })
      const transactions = Array.isArray(transactionsResponse?.data)
        ? transactionsResponse.data
        : transactionsResponse?.data?.transactions || transactionsResponse?.data?.data || []
      
      // Calculate received amount from credit transactions
      const receivedAmount = transactions
        .filter(tx => tx.type === 'credit')
        .reduce((sum, tx) => sum + (Number(tx.amount || 0)), 0)
      
      // If editing, subtract current transaction amount if it's credit (to show amount before this transaction)
      let currentTransactionAmount = 0
      if (mode === 'edit' && transactionData) {
        if (transactionData.type === 'credit') {
          currentTransactionAmount = Number(transactionData.amount || 0)
        }
      }
      
      const adjustedReceivedAmount = Math.max(0, receivedAmount - currentTransactionAmount)
      const remainingAmount = Math.max(0, totalAmount - adjustedReceivedAmount)
      
      setCustomerAmounts({
        totalAmount,
        receivedAmount: adjustedReceivedAmount,
        remainingAmount
      })
    } catch (error) {
      console.error('Error loading customer amounts:', error)
      setCustomerAmounts({
        totalAmount: 0,
        receivedAmount: 0,
        remainingAmount: 0
      })
    } finally {
      setLoadingAmounts(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      }
      
      // If amount or type changes and customer is selected, update remaining amount display
      if ((field === 'amount' || field === 'type') && prev.customer_id) {
        const newAmount = field === 'amount' ? (parseFloat(value) || 0) : (parseFloat(prev.amount) || 0)
        const transactionType = field === 'type' ? value : (prev.type || 'credit')
        
        if (transactionType === 'credit') {
          // New received = current received + new transaction amount (if create) or updated amount (if edit)
          const currentReceived = customerAmounts.receivedAmount
          const oldTransactionAmount = (mode === 'edit' && transactionData?.type === 'credit') 
            ? Number(transactionData.amount || 0) 
            : 0
          const newReceived = currentReceived - oldTransactionAmount + newAmount
          const newRemaining = Math.max(0, customerAmounts.totalAmount - newReceived)
          
          setCustomerAmounts(prevAmounts => ({
            ...prevAmounts,
            receivedAmount: newReceived,
            remainingAmount: newRemaining
          }))
        } else {
          // For debit, amounts don't affect received/remaining (it's a refund)
          // Reset to base amounts
          setCustomerAmounts(prevAmounts => ({
            ...prevAmounts,
            receivedAmount: prevAmounts.receivedAmount,
            remainingAmount: Math.max(0, prevAmounts.totalAmount - prevAmounts.receivedAmount)
          }))
        }
      }
      
      return updated
    })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer selection is required'
    }

    if (!formData.branch_id) {
      newErrors.branch_id = 'Branch selection is required'
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Transaction date is required'
    }

    if (!formData.type) {
      newErrors.type = 'Transaction type is required'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const customerId = parseInt(formData.customer_id, 10)
    const branchId = formData.branch_id ? parseInt(formData.branch_id, 10) : null
    const amountValue = parseFloat(formData.amount)

    const submitData = {
      customer_id: customerId,
      branch_id: branchId,
      order_id: formData.order_id ? formData.order_id.toString() : null,
      transaction_date: formData.transaction_date,
      type: formData.type || 'credit', // Default to credit for photographer business
      amount: amountValue,
      remarks: formData.remarks.trim() || null
    }

    onSubmit(submitData)
  }

  useImperativeHandle(ref, () => ({
    handleSubmit: handleSubmit
  }), [formData])

  const customerOptions = [
    { value: '', label: 'Select Customer' },
    ...customers.map(customer => {
      // Get customer name (ONLY name, no mobile/phone)
      let customerName = 'Customer'
      if (customer.name) {
        customerName = customer.name.trim()
      } else if (customer.firstName || customer.lastName) {
        customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
      }
      
      // Get customer_code in #CUST format (like in customer list)
      const customerCode = customer.customer_code || customer.customerId || customer.photographerId || (customer.id ? `#CUST${String(customer.id).padStart(3, '0')}` : '')
      
      // Format: Customer Name (#CUST006)
      return {
        value: customer.id.toString(),
        label: customerCode ? `${customerName} (${customerCode})` : customerName
      }
    })
  ]

  const branchOptions = [
    { value: '', label: 'Select Branch' },
    ...branches.map(branch => ({
      value: branch.id.toString(),
      label: `${branch.branch_name} (${branch.branch_code})`
    }))
  ]

  const transactionTypes = transactionService.getTransactionTypes()

  return (
    <div>
      {orderDetails && (
        <FormRow className="mb-3">
          <Col xs={12}>
            <Card className="border-primary border-2 bg-gradient-primary-subtle">
              <Card.Body className="p-3">
                <Row className="g-3 align-items-center">
                  <Col md={4}>
                    <div>
                      <div className="text-muted small">Order</div>
                      <div className="fw-bold fs-5 text-primary">
                        #{orderDetails.orderNumber || orderDetails.id || formData.order_id || 'N/A'}
                      </div>
                      {orderDetails.orderDate && (
                        <div className="text-muted small">
                          {formatDate(orderDetails.orderDate)}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <div className="text-muted small">Customer</div>
                      <div className="fw-semibold">
                        {orderDetails.customerName || 'N/A'}
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="d-flex justify-content-between flex-wrap gap-2">
                      <div>
                        <div className="text-muted small">Total</div>
                        <div className="fw-bold text-dark">
                          {formatCurrency(orderDetails.total)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted small">Paid</div>
                        <div className="fw-bold text-success">
                          {formatCurrency(orderDetails.paid)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted small">Balance</div>
                        <div className={`fw-bold ${orderDetails.balance > 0 ? 'text-danger' : 'text-success'}`}>
                          {formatCurrency(orderDetails.balance)}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </FormRow>
      )}

      <FormRow>
        <SelectField
          id="customer_id"
          label="Customer"
          value={formData.customer_id}
          onChange={(e) => handleChange('customer_id', e.target.value)}
          options={customerOptions}
          required
          col={6}
          invalid={!!errors.customer_id}
          feedback={errors.customer_id}
        />
        <SelectField
          id="branch_id"
          label="Branch"
          value={formData.branch_id}
          onChange={(e) => handleChange('branch_id', e.target.value)}
          options={branchOptions}
          required
          col={6}
          invalid={!!errors.branch_id}
          feedback={errors.branch_id}
        />
      </FormRow>

      <FormRow>
        <TextField
          id="transaction_date"
          label="Payment Date"
          type="date"
          value={formData.transaction_date}
          onChange={(e) => handleChange('transaction_date', e.target.value)}
          required
          col={6}
          invalid={!!errors.transaction_date}
          feedback={errors.transaction_date}
        />
        <SelectField
          id="type"
          label="Transaction Type"
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          options={transactionTypes}
          required
          col={6}
          invalid={!!errors.type}
          feedback={errors.type}
          helpText="Usually 'Credit' for payment received from customer"
        />
      </FormRow>

      {/* Customer Amount Summary */}
      {formData.customer_id && (
        <FormRow>
          <Col xs={12}>
            <Card className="mb-3" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
              <Card.Body className="p-3">
                <Row className="g-3">
                  <Col xs={12} md={4}>
                    <div className="text-center">
                      <div className="text-muted small mb-1">Total Amount (Orders)</div>
                      <div className="fw-bold fs-5 text-primary">
                        {loadingAmounts ? '...' : new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }).format(customerAmounts.totalAmount)}
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="text-center">
                      <div className="text-muted small mb-1">Received Amount</div>
                      <div className="fw-bold fs-5 text-success">
                        {loadingAmounts ? '...' : new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }).format(
                          formData.type === 'credit' && formData.amount
                            ? customerAmounts.receivedAmount + (parseFloat(formData.amount) || 0) - (mode === 'edit' && transactionData?.type === 'credit' ? Number(transactionData.amount || 0) : 0)
                            : customerAmounts.receivedAmount
                        )}
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="text-center">
                      <div className="text-muted small mb-1">Remaining Amount</div>
                      <div className={`fw-bold fs-5 ${customerAmounts.remainingAmount > 0 ? 'text-warning' : 'text-success'}`}>
                        {loadingAmounts ? '...' : new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }).format(
                          formData.type === 'credit' && formData.amount
                            ? Math.max(0, customerAmounts.totalAmount - (customerAmounts.receivedAmount + (parseFloat(formData.amount) || 0) - (mode === 'edit' && transactionData?.type === 'credit' ? Number(transactionData.amount || 0) : 0)))
                            : customerAmounts.remainingAmount
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </FormRow>
      )}

      <FormRow>
        <TextField
          id="amount"
          label="Received Amount"
          type="number"
          min="0.01"
          step="0.01"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          placeholder="Enter amount received"
          required
          col={12}
          invalid={!!errors.amount}
          feedback={errors.amount}
          helpText={
            formData.type === 'credit' 
              ? `💰 Amount received from customer. After this payment, remaining will be: ${formData.amount ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.max(0, customerAmounts.totalAmount - (customerAmounts.receivedAmount + (parseFloat(formData.amount) || 0) - (mode === 'edit' && transactionData?.type === 'credit' ? Number(transactionData.amount || 0) : 0)))) : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(customerAmounts.remainingAmount)}`
              : '⚠️ Debit: Amount refunded or returned to customer (rare case)'
          }
        />
      </FormRow>

      <FormRow>
        <TextField
          id="remarks"
          label="Payment Remarks"
          value={formData.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          placeholder="e.g., Advance payment, UPI payment, Cash payment, Balance payment, etc."
          col={12}
          helpText="Add notes about this payment (payment method, purpose, etc.)"
        />
      </FormRow>
    </div>
  )
})

TransactionForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  transactionData: PropTypes.object,
  initialCustomerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialOrderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialBranchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialRemarks: PropTypes.string,
  orderDetails: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
}

export default TransactionForm

