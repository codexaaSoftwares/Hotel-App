import React, { useState } from 'react'
import { Card, Button, Form, InputGroup, Badge, ListGroup } from 'react-bootstrap'
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
} from '@fortawesome/free-solid-svg-icons'
import { SelectField } from '../../../components/common/FormFields'
import customerService from '../../../services/customerService'
import { useToast } from '../../../components'
import { useDebounce } from '../../../hooks'

const BillingCartPanel = ({
  currentTable,
  currentOrder,
  cartItems,
  selectedCustomer,
  paymentMethod,
  isSplitPayment,
  totals,
  onQuantityChange,
  onRemoveItem,
  onCustomerSelect,
  onPaymentMethodChange,
  onSplitPaymentToggle,
  onSaveDraft,
  onPrintBill,
  onProcessPayment,
}) => {
  const { success, error } = useToast()
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [customerSearchResults, setCustomerSearchResults] = useState([])
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [searchingCustomers, setSearchingCustomers] = useState(false)
  const [quickAddCustomer, setQuickAddCustomer] = useState({ name: '', mobile: '' })
  const [addingCustomer, setAddingCustomer] = useState(false)

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
    <div className="billing-cart-panel h-100 d-flex flex-column">
      {/* Panel Header */}
      <div className="p-3 border-bottom bg-white">
        <h5 className="mb-0 fw-semibold">Billing Cart</h5>
      </div>

      {/* Scrollable Content */}
      <div className="flex-grow-1 overflow-auto">
        {/* Order Items List */}
        <div className="p-3 border-bottom">
          <h6 className="mb-2 fw-semibold" style={{ fontSize: '14px' }}>
            Order Items ({cartItems.length})
          </h6>
          {cartItems.length > 0 ? (
            <ListGroup variant="flush">
              {cartItems.map((item, index) => (
                <ListGroup.Item key={index} className="px-0 py-2 border-bottom">
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="flex-grow-1">
                      <div className="fw-semibold mb-1" style={{ fontSize: '13px' }}>
                        {item.item_name}
                      </div>
                      <div className="text-muted mb-2" style={{ fontSize: '11px' }}>
                        ₹{parseFloat(item.unit_price).toFixed(2)} × {item.quantity} = ₹
                        {parseFloat(item.total_price).toFixed(2)}
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => onQuantityChange(item.food_item_id, item.quantity - 1)}
                          style={{ fontSize: '11px', padding: '2px 6px', minWidth: '28px' }}
                        >
                          <FontAwesomeIcon icon={faMinus} style={{ fontSize: '10px' }} />
                        </Button>
                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            onQuantityChange(item.food_item_id, parseInt(e.target.value) || 1)
                          }
                          style={{ width: '60px', fontSize: '12px', textAlign: 'center' }}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => onQuantityChange(item.food_item_id, item.quantity + 1)}
                          style={{ fontSize: '11px', padding: '2px 6px', minWidth: '28px' }}
                        >
                          <FontAwesomeIcon icon={faPlus} style={{ fontSize: '10px' }} />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onRemoveItem(item.food_item_id)}
                      className="ms-2"
                      style={{ fontSize: '11px', padding: '2px 6px' }}
                    >
                      <FontAwesomeIcon icon={faTrash} style={{ fontSize: '10px' }} />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center text-muted p-4">
              <p style={{ fontSize: '13px' }}>No items in cart</p>
              <small>Select products to add items</small>
            </div>
          )}
        </div>

        {/* Customer Section */}
        <div className="p-3 border-bottom">
          <h6 className="mb-2 fw-semibold" style={{ fontSize: '14px' }}>
            Customer
          </h6>

          {selectedCustomer ? (
            <Card className="bg-light">
              <Card.Body className="p-2">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="fw-semibold" style={{ fontSize: '13px' }}>
                      {selectedCustomer.name}
                    </div>
                    {selectedCustomer.mobile && (
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        {selectedCustomer.mobile}
                      </div>
                    )}
                    {selectedCustomer.customer_type && (
                      <Badge bg={selectedCustomer.customer_type === 'credit' ? 'warning' : 'info'} className="mt-1" style={{ fontSize: '10px' }}>
                        {selectedCustomer.customer_type === 'credit' ? 'Credit' : 'Regular'}
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline-secondary" size="sm" onClick={handleRemoveCustomer} style={{ fontSize: '11px' }}>
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <div>
              {/* Quick Add Customer */}
              <div className="mb-2">
                <Form.Control
                  type="text"
                  placeholder="Name"
                  value={quickAddCustomer.name}
                  onChange={(e) => setQuickAddCustomer({ ...quickAddCustomer, name: e.target.value })}
                  style={{ fontSize: '12px' }}
                  className="mb-2"
                />
                <Form.Control
                  type="text"
                  placeholder="Mobile (optional)"
                  value={quickAddCustomer.mobile}
                  onChange={(e) => setQuickAddCustomer({ ...quickAddCustomer, mobile: e.target.value })}
                  style={{ fontSize: '12px' }}
                  className="mb-2"
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleQuickAddCustomer}
                  disabled={addingCustomer || !quickAddCustomer.name.trim()}
                  className="w-100"
                  style={{ fontSize: '12px' }}
                >
                  {addingCustomer ? 'Adding...' : 'Quick Add Customer'}
                </Button>
              </div>

              {/* Search Existing Customer */}
              <div className="position-relative">
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faSearch} />
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
                    style={{ fontSize: '12px' }}
                  />
                </InputGroup>

                {showCustomerSearch && customerSearchResults.length > 0 && (
                  <Card className="position-absolute w-100 mt-1" style={{ zIndex: 1000, maxHeight: '200px', overflow: 'auto' }}>
                    <ListGroup variant="flush">
                      {customerSearchResults.map((customer) => (
                        <ListGroup.Item
                          key={customer.id}
                          action
                          onClick={() => handleSelectCustomer(customer)}
                          style={{ fontSize: '12px', cursor: 'pointer' }}
                        >
                          <div className="fw-semibold">{customer.name}</div>
                          {customer.mobile && (
                            <div className="text-muted" style={{ fontSize: '11px' }}>
                              {customer.mobile}
                            </div>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card>
                )}
              </div>

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => onCustomerSelect(null)}
                className="w-100 mt-2"
                style={{ fontSize: '12px' }}
              >
                Walk-in Customer
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="p-3 border-bottom">
          <h6 className="mb-2 fw-semibold" style={{ fontSize: '14px' }}>
            Order Summary
          </h6>
          <div className="d-flex justify-content-between mb-1" style={{ fontSize: '12px' }}>
            <span>Subtotal:</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-1" style={{ fontSize: '12px' }}>
            <span>GST:</span>
            <span>₹{totals.gstAmount.toFixed(2)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="d-flex justify-content-between mb-1 text-success" style={{ fontSize: '12px' }}>
              <span>Discount:</span>
              <span>-₹{totals.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="d-flex justify-content-between mt-2 pt-2 border-top">
            <span className="fw-bold" style={{ fontSize: '16px' }}>
              Total:
            </span>
            <span className="fw-bold text-primary" style={{ fontSize: '18px' }}>
              ₹{totals.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Section */}
        <div className="p-3">
          <h6 className="mb-2 fw-semibold" style={{ fontSize: '14px' }}>
            Payment
          </h6>

          <SelectField
            id="payment_method"
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'upi', label: 'UPI' },
              { value: 'card', label: 'Card' },
            ]}
            showLabel={false}
            className="mb-2"
          />

          <Form.Check
            type="checkbox"
            label="Split Payment"
            checked={isSplitPayment}
            onChange={(e) => onSplitPaymentToggle(e.target.checked)}
            className="mb-3"
            style={{ fontSize: '12px' }}
          />

          <div className="d-grid gap-2">
            <Button variant="outline-secondary" size="sm" onClick={onPrintBill} disabled={cartItems.length === 0} style={{ fontSize: '12px' }}>
              <FontAwesomeIcon icon={faPrint} className="me-2" />
              Print Bill
            </Button>
            <Button variant="outline-primary" size="sm" onClick={onSaveDraft} disabled={cartItems.length === 0} style={{ fontSize: '12px' }}>
              <FontAwesomeIcon icon={faSave} className="me-2" />
              Save Draft
            </Button>
            <Button variant="primary" size="sm" onClick={onProcessPayment} disabled={cartItems.length === 0} style={{ fontSize: '12px' }}>
              <FontAwesomeIcon icon={faCreditCard} className="me-2" />
              Process Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingCartPanel

