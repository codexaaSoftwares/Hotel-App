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
  const [isSplitPayment, setIsSplitPayment] = useState(false)

  // Get current time
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
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
        gst_percentage: product.gst_percentage ? parseFloat(product.gst_percentage) : null,
        total_price: parseFloat(product.price),
        gst_amount: 0, // Will be calculated
        display_order: cartItems.length,
      }
      setCartItems([...cartItems, newItem])
    }
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
  }

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter((item) => item.food_item_id !== itemId))
  }

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer)
  }

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
  }

  // Handle split payment toggle
  const handleSplitPaymentToggle = (checked) => {
    setIsSplitPayment(checked)
  }

  // Calculate order totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0)
    // TODO: Calculate GST based on restaurant settings (item-wise or bill-wise)
    const gstAmount = 0 // Placeholder
    const discount = 0 // Placeholder
    const totalAmount = subtotal + gstAmount - discount

    return {
      subtotal,
      gstAmount,
      discount,
      totalAmount,
    }
  }

  const totals = calculateTotals()

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
            isSplitPayment={isSplitPayment}
            totals={totals}
            onQuantityChange={handleQuantityChange}
            onRemoveItem={handleRemoveItem}
            onCustomerSelect={handleCustomerSelect}
            onPaymentMethodChange={handlePaymentMethodChange}
            onSplitPaymentToggle={handleSplitPaymentToggle}
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

