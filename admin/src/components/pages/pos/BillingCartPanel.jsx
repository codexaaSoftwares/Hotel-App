import React, { useState } from 'react'
import { Card, Button, Form, InputGroup, Badge, ListGroup, Modal } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faMinus,
  faTrash,
  faUser,
  faPrint,
  faSave,
  faCreditCard,
  faSearch,
  faTimes,
  faUserPlus,
  faPercent,
  faRupeeSign,
  faMoneyBillWave,
  faMobileAlt,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { SelectField, TextField } from '../../../components/common/FormFields'
import customerService from '../../../services/customerService'
import { useToast } from '../../../components'
import { useDebounce } from '../../../hooks'

const BillingCartPanel = ({
  currentTable,
  currentOrder,
  cartItems,
  selectedCustomer,
  paymentMethod,
  totals,
  discount,
  gstSettings,
  paidAmount,
  onPaidAmountChange,
  paymentNotes,
  onPaymentNotesChange,
  onQuantityChange,
  onRemoveItem,
  onCustomerSelect,
  onPaymentMethodChange,
  onDiscountChange,
  onSaveDraft,
  onPrintBill,
  onProcessPayment,
  onDeleteBill,
  deletingBill = false,
}) => {
  const { success, error } = useToast()
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [customerSearchResults, setCustomerSearchResults] = useState([])
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  
  // Show search when user clicks "Add/Select Customer" button
  const handleShowCustomerSearch = () => {
    setShowCustomerSearch(true)
  }
  const [searchingCustomers, setSearchingCustomers] = useState(false)
  const [quickAddCustomer, setQuickAddCustomer] = useState({ name: '', mobile: '' })
  const [addingCustomer, setAddingCustomer] = useState(false)
  const [showQuickAddModal, setShowQuickAddModal] = useState(false)

  const debouncedCustomerSearch = useDebounce(customerSearchTerm, 400)

  // Search customers
  React.useEffect(() => {
    if (debouncedCustomerSearch.trim().length >= 2) {
      searchCustomers(debouncedCustomerSearch)
    } else {
      setCustomerSearchResults([])
    }
  }, [debouncedCustomerSearch])

  const searchCustomers = async (searchTerm) => {
    setSearchingCustomers(true)
    try {
      const response = await customerService.getCustomers({
        search: searchTerm,
        limit: 10,
        status: 'active',
      })

      if (response.success) {
        setCustomerSearchResults(response.data || [])
      }
    } catch (err) {
      console.error('Error searching customers:', err)
    } finally {
      setSearchingCustomers(false)
    }
  }

  const handleQuickAddCustomer = async () => {
    if (!quickAddCustomer.name.trim()) {
      error && error('Please enter customer name')
      return
    }

    setAddingCustomer(true)
    try {
      const response = await customerService.createCustomer({
        name: quickAddCustomer.name.trim(),
        mobile: quickAddCustomer.mobile.trim() || null,
        customer_type: 'regular',
        status: 'active',
      })

      if (response.success) {
        success && success('Customer added successfully')
        onCustomerSelect(response.data)
        setQuickAddCustomer({ name: '', mobile: '' })
        setShowQuickAddModal(false)
        setShowCustomerSearch(false)
      } else {
        error && error(response.message || 'Failed to add customer')
      }
    } catch (err) {
      console.error('Error adding customer:', err)
      error && error('Failed to add customer. Please try again.')
    } finally {
      setAddingCustomer(false)
    }
  }

  const handleSelectCustomer = (customer) => {
    onCustomerSelect(customer)
    setCustomerSearchTerm('')
    setCustomerSearchResults([])
    setShowCustomerSearch(false)
  }

  const handleRemoveCustomer = () => {
    onCustomerSelect(null)
    setCustomerSearchTerm('')
  }

  return (
    <>
    <div className="billing-cart-panel h-100 d-flex flex-column">
        {/* Panel Header - Compact */}
        <div className="p-2 border-bottom bg-white">
          <h6 className="mb-0 fw-semibold" style={{ fontSize: '14px', color: '#0d9488' }}>
            Billing Cart
          </h6>
      </div>

      {/* Scrollable Content */}
      <div className="flex-grow-1 overflow-auto">
          {/* Order Items List - Compact */}
          <div className="p-2 border-bottom">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="mb-0 fw-semibold" style={{ fontSize: '13px', color: '#0d9488' }}>
                Items
          </h6>
              <Badge bg="secondary" style={{ fontSize: '10px' }}>
                {cartItems.length}
              </Badge>
            </div>
          {cartItems.length > 0 ? (
              <div className="d-flex flex-column gap-1">
              {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-light rounded p-2 border"
                    style={{ fontSize: '12px' }}
                  >
                    {/* Single Row: Name | Counter | Price & Delete */}
                    <div className="d-flex align-items-center justify-content-between gap-2">
                      {/* Left: Item Name */}
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="fw-semibold text-truncate" style={{ fontSize: '12px' }}>
                        {item.item_name}
                      </div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>
                          ₹{parseFloat(item.unit_price).toFixed(2)}
                        </div>
                      </div>

                      {/* Middle: Quantity Counter */}
                      <div className="d-flex align-items-center gap-1 flex-shrink-0">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => onQuantityChange(item.food_item_id, item.quantity - 1)}
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            minWidth: '24px',
                            height: '24px',
                          }}
                        >
                          <FontAwesomeIcon icon={faMinus} style={{ fontSize: '9px' }} />
                        </Button>
                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            onQuantityChange(item.food_item_id, parseInt(e.target.value) || 1)
                          }
                          style={{
                            width: '55px',
                            fontSize: '11px',
                            textAlign: 'center',
                            height: '24px',
                            padding: '2px 6px',
                          }}
                          className="no-spinner"
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => onQuantityChange(item.food_item_id, item.quantity + 1)}
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            minWidth: '24px',
                            height: '24px',
                          }}
                        >
                          <FontAwesomeIcon icon={faPlus} style={{ fontSize: '9px' }} />
                        </Button>
                      </div>

                      {/* Right: Total Price & Delete */}
                      <div className="d-flex align-items-center gap-1 flex-shrink-0">
                        <div className="fw-bold text-primary" style={{ fontSize: '12px', minWidth: '45px', textAlign: 'right' }}>
                          ₹{parseFloat(item.total_price).toFixed(2)}
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onRemoveItem(item.food_item_id)}
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            minWidth: '24px',
                            height: '24px',
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} style={{ fontSize: '9px' }} />
                    </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted p-3">
                <p className="mb-0" style={{ fontSize: '12px' }}>
                  No items in cart
                </p>
                <small style={{ fontSize: '11px' }}>Select products to add</small>
            </div>
          )}
        </div>

          {/* Customer Section - Compact */}
          <div className="p-2 border-bottom">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="mb-0 fw-semibold" style={{ fontSize: '13px', color: '#0d9488' }}>
            Customer
          </h6>
            </div>

          {selectedCustomer ? (
              <div className="bg-light rounded p-2 border d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <div className="fw-semibold text-truncate" style={{ fontSize: '12px' }}>
                      {selectedCustomer.name}
                    </div>
                    {selectedCustomer.mobile && (
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        {selectedCustomer.mobile}
                      </div>
                    )}
                    {selectedCustomer.customer_type && (
                    <Badge
                      bg={selectedCustomer.customer_type === 'credit' ? 'warning' : 'info'}
                      className="mt-1"
                      style={{ fontSize: '9px' }}
                    >
                        {selectedCustomer.customer_type === 'credit' ? 'Credit' : 'Regular'}
                      </Badge>
                    )}
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleRemoveCustomer}
                  style={{ fontSize: '10px', padding: '2px 6px', minWidth: '24px', height: '24px' }}
                >
                  <FontAwesomeIcon icon={faTimes} style={{ fontSize: '9px' }} />
                </Button>
              </div>
            ) : (
              <div>
                {/* Default: Walk-in Customer Display */}
                <div className="bg-light rounded p-2 border d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="text-muted" style={{ fontSize: '12px' }} />
                    <div>
                      <div className="fw-semibold" style={{ fontSize: '12px' }}>
                        Walk-in Customer
                      </div>
                      <div className="text-muted" style={{ fontSize: '10px' }}>
                        Default
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional: Add/Select Customer Buttons */}
                <div className="d-flex gap-1">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowQuickAddModal(true)}
                    className="flex-grow-1"
                    style={{ fontSize: '11px', height: '32px' }}
                  >
                    <FontAwesomeIcon icon={faUserPlus} className="me-1" style={{ fontSize: '10px' }} />
                    Quick Add
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleShowCustomerSearch}
                    className="flex-grow-1"
                    style={{ fontSize: '11px', height: '32px' }}
                  >
                    <FontAwesomeIcon icon={faSearch} className="me-1" style={{ fontSize: '10px' }} />
                    Search
                </Button>
              </div>

                {/* Search Existing Customer (Hidden by default, show on button click) */}
                {showCustomerSearch && (
                  <div className="position-relative mt-2">
                    <InputGroup size="sm">
                      <InputGroup.Text style={{ fontSize: '11px', padding: '4px 8px' }}>
                        <FontAwesomeIcon icon={faSearch} style={{ fontSize: '10px' }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search customer..."
                    value={customerSearchTerm}
                    onChange={(e) => {
                      setCustomerSearchTerm(e.target.value)
                      setShowCustomerSearch(true)
                    }}
                    onFocus={() => setShowCustomerSearch(true)}
                        style={{ fontSize: '11px', height: '32px' }}
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setShowCustomerSearch(false)
                          setCustomerSearchTerm('')
                          setCustomerSearchResults([])
                        }}
                        style={{ fontSize: '11px' }}
                      >
                        <FontAwesomeIcon icon={faTimes} style={{ fontSize: '10px' }} />
                      </Button>
                </InputGroup>

                    {customerSearchResults.length > 0 && (
                      <Card
                        className="position-absolute w-100 mt-1 shadow-sm"
                        style={{ zIndex: 1000, maxHeight: '180px', overflow: 'auto' }}
                      >
                    <ListGroup variant="flush">
                      {customerSearchResults.map((customer) => (
                        <ListGroup.Item
                          key={customer.id}
                          action
                          onClick={() => handleSelectCustomer(customer)}
                              style={{ fontSize: '11px', cursor: 'pointer', padding: '8px 12px' }}
                        >
                          <div className="fw-semibold">{customer.name}</div>
                          {customer.mobile && (
                                <div className="text-muted" style={{ fontSize: '10px' }}>
                              {customer.mobile}
                            </div>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card>
                    )}
                  </div>
                )}
              </div>
                )}
              </div>

          {/* Discount Section - Compact */}
          <div className="p-2 border-bottom">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="mb-0 fw-semibold" style={{ fontSize: '13px', color: '#0d9488' }}>
                Discount
              </h6>
              <div className="btn-group" role="group" style={{ height: '28px' }}>
                <Button
                  variant={discount.type === 'amount' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => onDiscountChange('amount', discount.value)}
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    height: '28px',
                    backgroundColor: discount.type === 'amount' ? '#0d9488' : undefined,
                    borderColor: discount.type === 'amount' ? '#0d9488' : undefined,
                  }}
                >
                  <FontAwesomeIcon icon={faRupeeSign} style={{ fontSize: '9px' }} />
                </Button>
              <Button
                  variant={discount.type === 'percentage' ? 'primary' : 'outline-primary'}
                size="sm"
                  onClick={() => onDiscountChange('percentage', discount.value)}
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    height: '28px',
                    backgroundColor: discount.type === 'percentage' ? '#0d9488' : undefined,
                    borderColor: discount.type === 'percentage' ? '#0d9488' : undefined,
                  }}
                >
                  <FontAwesomeIcon icon={faPercent} style={{ fontSize: '9px' }} />
              </Button>
              </div>
            </div>
            <InputGroup size="sm">
              <InputGroup.Text style={{ fontSize: '11px', padding: '4px 8px' }}>
                {discount.type === 'percentage' ? (
                  <FontAwesomeIcon icon={faPercent} style={{ fontSize: '10px' }} />
                ) : (
                  <FontAwesomeIcon icon={faRupeeSign} style={{ fontSize: '10px' }} />
                )}
              </InputGroup.Text>
              <Form.Control
                type="number"
                min="0"
                step={discount.type === 'percentage' ? '0.1' : '1'}
                max={discount.type === 'percentage' ? '100' : undefined}
                value={discount.value || ''}
                onChange={(e) => onDiscountChange(discount.type, e.target.value)}
                placeholder={discount.type === 'percentage' ? '0' : '0'}
                style={{ fontSize: '11px', height: '32px' }}
              />
              {discount.value > 0 && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => onDiscountChange(discount.type, 0)}
                  style={{ fontSize: '11px' }}
                >
                  <FontAwesomeIcon icon={faTimes} style={{ fontSize: '10px' }} />
                </Button>
              )}
            </InputGroup>
        </div>

          {/* Order Summary - Compact */}
          <div className="p-2 border-bottom">
            <h6 className="mb-2 fw-semibold" style={{ fontSize: '13px', color: '#0d9488' }}>
              Summary
          </h6>
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '11px' }}>
              <span className="text-muted">Subtotal:</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>
            {totals.discountAmount > 0 && (
              <div className="d-flex justify-content-between mb-1 text-success" style={{ fontSize: '11px' }}>
                <span>Discount:</span>
                <span>-₹{totals.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '11px' }}>
              <span className="text-muted">CGST @ {gstSettings?.cgstPercentage || 2.5}%:</span>
              <span>₹{totals.cgstAmount.toFixed(2)}</span>
          </div>
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '11px' }}>
              <span className="text-muted">SGST @ {gstSettings?.sgstPercentage || 2.5}%:</span>
              <span>₹{totals.sgstAmount.toFixed(2)}</span>
            </div>
            {totals.serviceTaxAmount > 0 && (
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '11px' }}>
                <span className="text-muted">S.Tax @ {gstSettings?.serviceTaxPercentage || 0}%:</span>
                <span>₹{totals.serviceTaxAmount.toFixed(2)}</span>
            </div>
          )}
          {gstSettings?.roundNumberEnabled && totals.roundingAmount !== 0 && (
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '11px' }}>
              <span className="text-muted">Subtotal (Before Rounding):</span>
              <span>₹{totals.originalTotalAmount.toFixed(2)}</span>
            </div>
          )}
          {gstSettings?.roundNumberEnabled && totals.roundingAmount !== 0 && (
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '11px' }}>
              <span className="text-muted">
                Rounding {totals.roundingAmount > 0 ? '(Added)' : '(Deducted)'}:
              </span>
              <span className={totals.roundingAmount > 0 ? 'text-success' : 'text-danger'}>
                {totals.roundingAmount > 0 ? '+' : ''}₹{totals.roundingAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="d-flex justify-content-between mt-2 pt-2 border-top">
              <span className="fw-bold" style={{ fontSize: '14px', color: '#0d9488' }}>
              Total{gstSettings?.roundNumberEnabled ? ' (Rounded)' : ''}:
            </span>
              <span className="fw-bold" style={{ fontSize: '16px', color: '#0d9488' }}>
              ₹{totals.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

          {/* Payment Section - Enhanced */}
          <div className="p-2 border-top">
            <h6 className="mb-2 fw-semibold" style={{ fontSize: '13px', color: '#0d9488' }}>
            Payment
          </h6>

            {/* Payment Method Selection - Icon Buttons */}
            <div className="mb-2">
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', color: '#6c757d' }}>
                Payment Method
              </label>
              <div className="d-flex gap-1 flex-wrap">
                <Button
                  variant={paymentMethod === 'cash' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => onPaymentMethodChange('cash')}
                  className="flex-fill"
                  style={{
                    fontSize: '10px',
                    height: '32px',
                    backgroundColor: paymentMethod === 'cash' ? '#0d9488' : '',
                    borderColor: paymentMethod === 'cash' ? '#0d9488' : '',
                  }}
                >
                  <FontAwesomeIcon icon={faMoneyBillWave} className="me-1" style={{ fontSize: '9px' }} />
                  Cash
                </Button>
                <Button
                  variant={paymentMethod === 'upi' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => onPaymentMethodChange('upi')}
                  className="flex-fill"
                  style={{
                    fontSize: '10px',
                    height: '32px',
                    backgroundColor: paymentMethod === 'upi' ? '#0d9488' : '',
                    borderColor: paymentMethod === 'upi' ? '#0d9488' : '',
                  }}
                >
                  <FontAwesomeIcon icon={faMobileAlt} className="me-1" style={{ fontSize: '9px' }} />
                  UPI
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => onPaymentMethodChange('card')}
                  className="flex-fill"
                  style={{
                    fontSize: '10px',
                    height: '32px',
                    backgroundColor: paymentMethod === 'card' ? '#0d9488' : '',
                    borderColor: paymentMethod === 'card' ? '#0d9488' : '',
                  }}
                >
                  <FontAwesomeIcon icon={faCreditCard} className="me-1" style={{ fontSize: '9px' }} />
                  Card
                </Button>
                {/* Wallet Option - Only for selected customers */}
                {selectedCustomer && (
                  <Button
                    variant={paymentMethod === 'wallet' ? 'warning' : 'outline-warning'}
                    size="sm"
                    onClick={() => onPaymentMethodChange('wallet')}
                    className="flex-fill"
                    style={{
                      fontSize: '10px',
                      height: '32px',
                      backgroundColor: paymentMethod === 'wallet' ? '#ffc107' : '',
                      borderColor: paymentMethod === 'wallet' ? '#ffc107' : '',
                      color: paymentMethod === 'wallet' ? '#000' : '',
                    }}
                  >
                    <FontAwesomeIcon icon={faWallet} className="me-1" style={{ fontSize: '9px' }} />
                    Wallet
                  </Button>
                )}
              </div>
              {paymentMethod === 'wallet' && (
                <div className="alert alert-warning py-1 px-2 mt-2 mb-0" style={{ fontSize: '10px' }}>
                  <small>
                    <FontAwesomeIcon icon={faWallet} className="me-1" style={{ fontSize: '9px' }} />
                    Bill will be sent to customer wallet (₹{totals.totalAmount.toFixed(2)})
                  </small>
                </div>
              )}
            </div>

            {/* Payment Amount Input - Hidden for Wallet */}
            {paymentMethod !== 'wallet' && (
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', color: '#6c757d' }}>
                  Amount Received (₹)
                </label>
                <InputGroup size="sm">
                  <InputGroup.Text style={{ backgroundColor: '#f8f9fa', fontSize: '11px' }}>
                    <FontAwesomeIcon icon={faRupeeSign} style={{ fontSize: '9px' }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={paidAmount > 0 ? paidAmount : ''}
                    onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
                    placeholder={totals.totalAmount.toFixed(2)}
                    style={{ fontSize: '11px', height: '32px' }}
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => onPaidAmountChange(totals.totalAmount)}
                    style={{ fontSize: '10px' }}
                  >
                    Full
                  </Button>
                </InputGroup>
                {paymentMethod === 'cash' && paidAmount > totals.totalAmount && (
                  <div className="mt-1 text-success" style={{ fontSize: '10px' }}>
                    Change: ₹{(paidAmount - totals.totalAmount).toFixed(2)}
                  </div>
                )}
                {paidAmount < totals.totalAmount && paidAmount > 0 && (
                  <div className="mt-1 text-warning" style={{ fontSize: '10px' }}>
                    Remaining: ₹{(totals.totalAmount - paidAmount).toFixed(2)}
                  </div>
                )}
              </div>
            )}

            {/* Payment Notes */}
            <div className="mb-2">
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', color: '#6c757d' }}>
                Payment Notes (Optional)
              </label>
              <Form.Control
                as="textarea"
                rows={2}
                value={paymentNotes || ''}
                onChange={(e) => onPaymentNotesChange(e.target.value)}
                placeholder="Add any payment-related notes or information..."
                style={{ fontSize: '11px', resize: 'none' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-1">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onPrintBill}
                disabled={cartItems.length === 0}
                style={{ fontSize: '11px', height: '32px' }}
              >
                <FontAwesomeIcon icon={faPrint} className="me-1" style={{ fontSize: '10px' }} />
              Print Bill
            </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={onSaveDraft}
                disabled={cartItems.length === 0}
                style={{ fontSize: '11px', height: '32px' }}
              >
                <FontAwesomeIcon icon={faSave} className="me-1" style={{ fontSize: '10px' }} />
              Save Draft
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={onDeleteBill}
                disabled={(!currentOrder && cartItems.length === 0) || deletingBill}
                style={{ fontSize: '11px', height: '32px' }}
              >
                <FontAwesomeIcon icon={faTrash} className="me-1" style={{ fontSize: '10px' }} />
                {deletingBill ? 'Deleting Bill...' : 'Delete Bill'}
              </Button>
              <Button
                variant={paymentMethod === 'wallet' ? 'warning' : 'primary'}
                size="sm"
                onClick={onProcessPayment}
                disabled={
                  cartItems.length === 0 || 
                  (paymentMethod !== 'wallet' && paidAmount < totals.totalAmount)
                }
                style={{
                  fontSize: '12px',
                  height: '36px',
                  backgroundColor: paymentMethod === 'wallet' ? '#ffc107' : '#0d9488',
                  borderColor: paymentMethod === 'wallet' ? '#ffc107' : '#0d9488',
                  fontWeight: '600',
                  color: paymentMethod === 'wallet' ? '#000' : '#fff',
                }}
              >
                <FontAwesomeIcon 
                  icon={paymentMethod === 'wallet' ? faWallet : faCreditCard} 
                  className="me-1" 
                  style={{ fontSize: '11px' }} 
                />
                Process Payment
                {paymentMethod === 'wallet' 
                  ? ` (₹${totals.totalAmount.toFixed(2)})`
                  : ` (₹${paidAmount > 0 ? paidAmount.toFixed(2) : totals.totalAmount.toFixed(2)})`
                }
            </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      <Modal show={showQuickAddModal} onHide={() => setShowQuickAddModal(false)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '14px' }}>Quick Add Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TextField
            id="customer_name"
            label="Name"
            type="text"
            value={quickAddCustomer.name}
            onChange={(e) => setQuickAddCustomer({ ...quickAddCustomer, name: e.target.value })}
            placeholder="Enter customer name"
            required
            col={12}
          />
          <TextField
            id="customer_mobile"
            label="Mobile (Optional)"
            type="text"
            value={quickAddCustomer.mobile}
            onChange={(e) => setQuickAddCustomer({ ...quickAddCustomer, mobile: e.target.value })}
            placeholder="Enter mobile number"
            col={12}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowQuickAddModal(false)} style={{ fontSize: '12px' }}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleQuickAddCustomer}
            disabled={addingCustomer || !quickAddCustomer.name.trim()}
            style={{ fontSize: '12px', backgroundColor: '#0d9488', borderColor: '#0d9488' }}
          >
            {addingCustomer ? 'Adding...' : 'Add Customer'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default BillingCartPanel

