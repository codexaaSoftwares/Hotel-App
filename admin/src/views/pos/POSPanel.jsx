import React, { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faTable, faReceipt } from '@fortawesome/free-solid-svg-icons'
import TablesPanel from '../../components/pages/pos/TablesPanel'
import ProductsPanel from '../../components/pages/pos/ProductsPanel'
import BillingCartPanel from '../../components/pages/pos/BillingCartPanel'
import { useToast } from '../../components'
import { usePermissions } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'
import { playTicSound } from '../../utils/soundUtils'
import restaurantSettingsService from '../../services/restaurantSettingsService'

const POSPanel = () => {
  const { error } = useToast()
  const { hasPermission } = usePermissions()

  // Check permissions - Use canonical permission name
  const canAccessPOS = hasPermission('create_bill') || hasPermission(PERMISSIONS.BILL_CREATE) || hasPermission(PERMISSIONS.BILL_WRITE)

  // State management
  const [currentTable, setCurrentTable] = useState(null)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paidAmount, setPaidAmount] = useState(0)
  const [discount, setDiscount] = useState({ type: 'amount', value: 0 }) // 'amount' or 'percentage'
  const [paymentNotes, setPaymentNotes] = useState('')
  
  // Restaurant settings (GST & Tax)
  const [gstSettings, setGstSettings] = useState({
    cgstPercentage: 2.5, // Default 2.5%
    sgstPercentage: 2.5, // Default 2.5%
    serviceTaxPercentage: 0, // Default 0%
    roundNumberEnabled: false, // Default false
  })

  // Get current time
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Load restaurant GST & Tax settings
  useEffect(() => {
    const loadGstSettings = async () => {
      try {
        const response = await restaurantSettingsService.getSettingsBySection('GST Settings')
        if (response.success && response.data) {
          setGstSettings({
            cgstPercentage: parseFloat(response.data.cgst_percentage || 2.5),
            sgstPercentage: parseFloat(response.data.sgst_percentage || 2.5),
            serviceTaxPercentage: parseFloat(response.data.service_tax_percentage || 0),
            roundNumberEnabled: response.data.round_number_enabled === 'true' || response.data.round_number_enabled === true,
          })
        }
      } catch (err) {
        console.error('Error loading GST settings:', err)
        // Use defaults if loading fails
      }
    }
    loadGstSettings()
  }, [])

  // Format time display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Handle table selection
  const handleTableSelect = (table) => {
    setCurrentTable(table)
    // TODO: Load existing orders for this table
    setCurrentOrder(null)
    setCartItems([])
    setSelectedCustomer(null) // Reset to walk-in customer by default
    setDiscount({ type: 'amount', value: 0 }) // Reset discount
  }

  // Handle product add to cart
  const handleAddToCart = (product) => {
    // Check if product already exists in cart
    const existingItemIndex = cartItems.findIndex((item) => item.food_item_id === product.id)

    if (existingItemIndex >= 0) {
      // Increment quantity
      const updatedItems = [...cartItems]
      updatedItems[existingItemIndex].quantity += 1
      updatedItems[existingItemIndex].total_price =
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unit_price
      setCartItems(updatedItems)
    } else {
      // Add new item
      const newItem = {
        food_item_id: product.id,
        item_name: product.name,
        quantity: 1,
        unit_price: parseFloat(product.price),
        total_price: parseFloat(product.price),
        display_order: cartItems.length,
      }
      setCartItems([...cartItems, newItem])
    }
    
    // Play notification sound
    playTicSound()
  }

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId)
      return
    }

    const updatedItems = cartItems.map((item) => {
      if (item.food_item_id === itemId) {
        const totalPrice = newQuantity * item.unit_price
        return {
          ...item,
          quantity: newQuantity,
          total_price: totalPrice,
        }
      }
      return item
    })
    setCartItems(updatedItems)
    
    // Play notification sound
    playTicSound()
  }

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter((item) => item.food_item_id !== itemId))
    
    // Play notification sound
    playTicSound()
  }

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer)
  }

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
  }

  // Handle paid amount change
  const handlePaidAmountChange = (amount) => {
    setPaidAmount(amount)
  }

  // Calculate order totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0)
    
    // Calculate discount amount
    let discountAmount = 0
    if (discount.value > 0) {
      if (discount.type === 'percentage') {
        discountAmount = (subtotal * discount.value) / 100
      } else {
        discountAmount = discount.value
      }
      // Ensure discount doesn't exceed subtotal
      discountAmount = Math.min(discountAmount, subtotal)
    }
    
    // Calculate subtotal after discount
    const subtotalAfterDiscount = subtotal - discountAmount
    
    // Calculate CGST, SGST, and Service Tax on bill total (after discount)
    const cgstAmount = (subtotalAfterDiscount * gstSettings.cgstPercentage) / 100
    const sgstAmount = (subtotalAfterDiscount * gstSettings.sgstPercentage) / 100
    const serviceTaxAmount = (subtotalAfterDiscount * gstSettings.serviceTaxPercentage) / 100
    
    // Total tax amount
    const totalTaxAmount = cgstAmount + sgstAmount + serviceTaxAmount
    
    // Calculate total amount
    const originalTotalAmount = subtotalAfterDiscount + totalTaxAmount
    let totalAmount = originalTotalAmount
    let roundingAmount = 0

    // Apply rounding if enabled
    if (gstSettings.roundNumberEnabled) {
      totalAmount = Math.round(originalTotalAmount)
      roundingAmount = totalAmount - originalTotalAmount
    }

    return {
      subtotal,
      discountAmount,
      subtotalAfterDiscount,
      cgstAmount,
      sgstAmount,
      serviceTaxAmount,
      totalTaxAmount,
      originalTotalAmount,
      roundingAmount,
      totalAmount,
    }
  }

  const totals = calculateTotals()

  // Reset paid amount when total changes or payment method changes
  useEffect(() => {
    // Auto-fill with total amount for all payment methods
    setPaidAmount(totals.totalAmount)
  }, [totals.totalAmount, cartItems.length, discount.value])

  // Handle discount change
  const handleDiscountChange = (type, value) => {
    setDiscount({ type, value: parseFloat(value) || 0 })
  }

  // Handle payment notes change
  const handlePaymentNotesChange = (notes) => {
    setPaymentNotes(notes)
  }

  if (!canAccessPOS) {
    return (
      <Container fluid className="py-5">
        <div className="text-center">
          <h4>Access Denied</h4>
          <p>You don't have permission to access the POS Panel.</p>
        </div>
      </Container>
    )
  }

  return (
    <Container fluid className="pos-panel-container p-0">
      {/* POS Panel Header */}
      <div className="pos-header bg-white border-bottom shadow-sm p-3">
        <Row className="align-items-center">
          <Col xs={12} md={4}>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faTable} className="me-2 text-primary" />
              <span className="fw-semibold me-2">Table:</span>
              <span className="text-primary">
                {currentTable ? `${currentTable.table_number}${currentTable.table_name ? ` - ${currentTable.table_name}` : ''}` : 'None Selected'}
              </span>
            </div>
          </Col>
          <Col xs={12} md={4} className="text-center">
            {currentOrder && (
              <div className="d-flex align-items-center justify-content-center">
                <FontAwesomeIcon icon={faReceipt} className="me-2 text-primary" />
                <span className="fw-semibold me-2">Order #:</span>
                <span className="text-primary">{currentOrder.bill_number || 'New Order'}</span>
              </div>
            )}
          </Col>
          <Col xs={12} md={4} className="text-end">
            <div className="d-flex align-items-center justify-content-end">
              <FontAwesomeIcon icon={faClock} className="me-2 text-primary" />
              <span className="fw-semibold">{formatTime(currentTime)}</span>
            </div>
          </Col>
        </Row>
      </div>

      {/* Split Screen Layout */}
      <Row className="g-0 pos-panel-layout" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Tables Panel - Left (Compact, auto-width) */}
        <Col xs={12} md={3} lg={2} xl={2} className="pos-panel-left border-end bg-light">
          <TablesPanel
            currentTable={currentTable}
            onTableSelect={handleTableSelect}
          />
        </Col>

        {/* Products Panel - Center (Flexible) */}
        <Col xs={12} md={5} lg={6} xl={6} className="pos-panel-center border-end bg-white">
          <ProductsPanel
            onAddToCart={handleAddToCart}
            currentTable={currentTable}
          />
        </Col>

        {/* Billing Cart Panel - Right (Flexible) */}
        <Col xs={12} md={4} lg={4} xl={4} className="pos-panel-right bg-light">
          <BillingCartPanel
            currentTable={currentTable}
            currentOrder={currentOrder}
            cartItems={cartItems}
            selectedCustomer={selectedCustomer}
            paymentMethod={paymentMethod}
            totals={totals}
            onQuantityChange={handleQuantityChange}
            onRemoveItem={handleRemoveItem}
            onCustomerSelect={handleCustomerSelect}
            onPaymentMethodChange={handlePaymentMethodChange}
            discount={discount}
            onDiscountChange={handleDiscountChange}
            gstSettings={gstSettings}
            paidAmount={paidAmount}
            onPaidAmountChange={handlePaidAmountChange}
            paymentNotes={paymentNotes}
            onPaymentNotesChange={handlePaymentNotesChange}
            onSaveDraft={() => {
              // TODO: Implement save draft
              console.log('Save draft')
            }}
            onPrintBill={() => {
              // TODO: Implement print bill
              console.log('Print bill')
            }}
            onProcessPayment={() => {
              // TODO: Implement process payment
              console.log('Process payment')
            }}
          />
        </Col>
      </Row>
    </Container>
  )
}

export default POSPanel

