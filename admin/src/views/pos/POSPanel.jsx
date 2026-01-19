import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Modal, Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faTable, faReceipt, faCheckCircle, faInfoCircle, faUser } from '@fortawesome/free-solid-svg-icons'
import TablesPanel from '../../components/pages/pos/TablesPanel'
import ProductsPanel from '../../components/pages/pos/ProductsPanel'
import BillingCartPanel from '../../components/pages/pos/BillingCartPanel'
import { useToast } from '../../components'
import { usePermissions } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'
import { playTicSound, playSuccessSound, playErrorSound } from '../../utils/soundUtils'
import restaurantSettingsService from '../../services/restaurantSettingsService'
import walletTransactionService from '../../services/walletTransactionService'
import billService from '../../services/billService'
import { useAuth } from '../../context/AuthContext'

const POSPanel = () => {
  const { success, error } = useToast()
  const { hasPermission } = usePermissions()
  const { user } = useAuth()

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

  // Payment confirmation and success dialogs
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [paymentSuccessData, setPaymentSuccessData] = useState(null)
  const [processingPayment, setProcessingPayment] = useState(false)

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
  const handleTableSelect = async (table) => {
    setCurrentTable(table)
    setCurrentOrder(null)
    setCartItems([])
    setSelectedCustomer(null) // Reset to walk-in customer by default
    setDiscount({ type: 'amount', value: 0 }) // Reset discount

    // Load existing orders for this table
    try {
      const response = await billService.getBillsByTable(table.id, { include_draft: true })
      if (response.success && response.data && response.data.length > 0) {
        // Load the most recent draft/pending bill
        const latestBill = response.data[0]
        setCurrentOrder(latestBill)
        
        // Load bill items into cart
        if (latestBill.items && latestBill.items.length > 0) {
          const cartItemsFromBill = latestBill.items.map((item) => ({
            food_item_id: item.foodItemId,
            item_name: item.itemName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.totalPrice,
            display_order: item.displayOrder || 0,
          }))
          setCartItems(cartItemsFromBill)
        }
        
        // Load customer if exists
        if (latestBill.customerId) {
          setSelectedCustomer(latestBill.customer || { id: latestBill.customerId })
        }
      }
    } catch (err) {
      console.error('Error loading table orders:', err)
      // Silent fail - continue with new order
    }
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
    
    // Auto-generate payment notes when switching to wallet (if blank)
    if (method === 'wallet' && selectedCustomer && currentTable && !paymentNotes.trim()) {
      const tableName = currentTable.name || currentTable.table_number || `Table ${currentTable.id}`
      const customerName = selectedCustomer.name || 'Customer'
      const autoNote = `Bill sent to wallet - ${customerName} (${tableName})`
      setPaymentNotes(autoNote)
    }
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
    // Auto-fill with total amount for regular payment methods (not wallet)
    if (paymentMethod !== 'wallet') {
      setPaidAmount(totals.totalAmount)
    } else {
      // Reset to 0 for wallet payment
      setPaidAmount(0)
    }
  }, [totals.totalAmount, cartItems.length, discount.value, paymentMethod])


  // Handle discount change
  const handleDiscountChange = (type, value) => {
    setDiscount({ type, value: parseFloat(value) || 0 })
  }

  // Handle payment notes change
  const handlePaymentNotesChange = (notes) => {
    setPaymentNotes(notes)
  }

  // Handle save draft
  const handleSaveDraft = async () => {
    // Validation
    if (!currentTable) {
      error('Please select a table first')
      return
    }

    if (cartItems.length === 0) {
      error('Please add items to the cart before saving draft')
      return
    }

    try {
      // Prepare bill data for draft
      const billData = {
        table_id: currentTable.id,
        customer_id: selectedCustomer?.id || null,
        bill_date: new Date().toISOString(),
        status: 'draft',
        payment_status: 'pending',
        subtotal: totals.subtotal,
        gst_amount: totals.totalTaxAmount,
        discount: totals.discountAmount,
        total_amount: totals.totalAmount,
        paid_amount: 0,
        remaining_amount: totals.totalAmount,
        payment_method: null,
        gst_calculation_method: 'bill_wise',
        notes: paymentNotes || null,
        created_by: user?.id || null,
        items: cartItems.map((item) => ({
          food_item_id: item.food_item_id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          display_order: item.display_order || 0,
        })),
      }

      // Save draft via API
      if (currentOrder?.id && !currentOrder.id.toString().startsWith('draft-')) {
        // Update existing draft
        const response = await billService.updateBill(currentOrder.id, billData)
        if (response.success) {
          setCurrentOrder(response.data)
          success('Draft updated successfully!')
        } else {
          error(response.message || 'Failed to update draft')
        }
      } else {
        // Create new draft
        const response = await billService.createBill(billData)
        if (response.success) {
          setCurrentOrder(response.data)
          success('Draft saved successfully!')
        } else {
          error(response.message || 'Failed to save draft')
        }
      }
    } catch (err) {
      console.error('Error saving draft:', err)
      error('Failed to save draft. Please try again.')
    }
  }

  // Auto-save draft when cart changes (items, quantity, discount, customer, notes)
  useEffect(() => {
    // Don't auto-save if no table or no items
    if (!currentTable || cartItems.length === 0) return

    // Debounce auto-save to avoid too many saves
    const autoSaveTimeout = setTimeout(async () => {
      try {
        // Prepare bill data for draft
        const billData = {
          table_id: currentTable.id,
          customer_id: selectedCustomer?.id || null,
          bill_date: new Date().toISOString(),
          status: 'draft',
          payment_status: 'pending',
          subtotal: totals.subtotal,
          gst_amount: totals.totalTaxAmount,
          discount: totals.discountAmount,
          total_amount: totals.totalAmount,
          paid_amount: 0,
          remaining_amount: totals.totalAmount,
          payment_method: null,
          gst_calculation_method: 'bill_wise',
          notes: paymentNotes || null,
          created_by: user?.id || null,
          items: cartItems.map((item) => ({
            food_item_id: item.food_item_id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            display_order: item.display_order || 0,
          })),
        }

        // Auto-save draft via API
        if (currentOrder?.id && !currentOrder.id.toString().startsWith('draft-')) {
          await billService.updateBill(currentOrder.id, billData)
        } else {
          const response = await billService.createBill(billData)
          if (response.success) {
            setCurrentOrder(response.data)
          }
        }
        
        // Silent auto-save (no notification)
        console.log('Draft auto-saved')
      } catch (err) {
        console.error('Auto-save error:', err)
        // Silent fail for auto-save
      }
    }, 1000) // 1 second debounce to avoid too many saves

    return () => clearTimeout(autoSaveTimeout)
  }, [currentTable, cartItems, totals.subtotal, totals.totalTaxAmount, totals.totalAmount, discount, selectedCustomer, paymentNotes])

  // Handle print bill
  const handlePrintBill = () => {
    // Validation
    if (cartItems.length === 0) {
      error('Please add items to the cart before printing')
      return
    }

    // Prepare bill data for printing
    const billData = {
      billNumber: currentOrder?.bill_number || `DRAFT-${Date.now()}`,
      table: currentTable,
      customer: selectedCustomer,
      items: cartItems,
      totals: totals,
      discount: discount,
      paymentMethod: paymentMethod,
      paymentNotes: paymentNotes,
      billDate: new Date().toLocaleString('en-IN'),
      status: currentOrder?.status || 'draft',
    }

    // Create print window
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      error('Please allow popups to print the bill')
      return
    }

    // Generate HTML for bill
    const billHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${billData.billNumber}</title>
          <style>
            @media print {
              @page { margin: 10mm; size: A4; }
              body { margin: 0; padding: 0; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .bill-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .bill-info div {
              flex: 1;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .text-right {
              text-align: right;
            }
            .totals {
              margin-top: 20px;
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RESTAURANT BILL</h1>
            <p>Bill No: ${billData.billNumber}</p>
            <p>Date: ${billData.billDate}</p>
          </div>
          
          <div class="bill-info">
            <div>
              <strong>Table:</strong> ${billData.table?.name || billData.table?.table_number || 'N/A'}<br>
              ${billData.customer ? `<strong>Customer:</strong> ${billData.customer.name || 'N/A'}<br>` : ''}
            </div>
            <div>
              <strong>Status:</strong> ${billData.status.toUpperCase()}<br>
              ${billData.paymentMethod && billData.paymentMethod !== 'wallet' ? `<strong>Payment Method:</strong> ${billData.paymentMethod.toUpperCase()}<br>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${billData.items.map(item => `
                <tr>
                  <td>${item.item_name}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">₹${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td class="text-right">₹${parseFloat(item.total_price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>₹${billData.totals.subtotal.toFixed(2)}</span>
            </div>
            ${billData.discount.value > 0 ? `
              <div class="totals-row">
                <span>Discount (${billData.discount.type === 'percentage' ? billData.discount.value + '%' : '₹' + billData.discount.value.toFixed(2)}):</span>
                <span>-₹${billData.totals.discountAmount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="totals-row">
              <span>CGST:</span>
              <span>₹${billData.totals.cgstAmount.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>SGST:</span>
              <span>₹${billData.totals.sgstAmount.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Service Tax:</span>
              <span>₹${billData.totals.serviceTaxAmount.toFixed(2)}</span>
            </div>
            ${billData.totals.roundingAmount !== 0 ? `
              <div class="totals-row">
                <span>Rounding:</span>
                <span>₹${billData.totals.roundingAmount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="totals-row" style="font-weight: bold; font-size: 18px; margin-top: 10px; border-top: 1px solid #000; padding-top: 10px;">
              <span>Total Amount:</span>
              <span>₹${billData.totals.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          ${billData.paymentNotes ? `
            <div style="margin-top: 20px;">
              <strong>Notes:</strong> ${billData.paymentNotes}
            </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for your visit!</p>
            <p>Generated on ${new Date().toLocaleString('en-IN')}</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(billHTML)
    printWindow.document.close()
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  // Handle process payment - Show confirmation dialog first
  const handleProcessPayment = () => {
    // Validation
    if (!currentTable) {
      error('Please select a table first')
      return
    }

    if (cartItems.length === 0) {
      error('Please add items to the cart')
      return
    }

    // Wallet payment validation
    if (paymentMethod === 'wallet') {
      if (!selectedCustomer) {
        error('Please select a customer to send bill to wallet')
        return
      }
    } else {
      // Regular payment validation
      if (paidAmount < totals.totalAmount) {
        error(`Full payment required. Please enter ₹${totals.totalAmount.toFixed(2)}`)
        return
      }
    }

    // Show confirmation dialog
    setShowPaymentConfirm(true)
  }

  // Confirm and process payment
  const confirmProcessPayment = async () => {
    setShowPaymentConfirm(false)
    setProcessingPayment(true)

    try {
      // Prepare bill data (common for both wallet and regular payments)
      // Always create as 'draft' first, then processPayment will update the status
      const billData = {
        table_id: currentTable.id,
        customer_id: selectedCustomer?.id || null,
        bill_date: new Date().toISOString(),
        status: 'draft',
        payment_status: 'pending',
        subtotal: totals.subtotal,
        gst_amount: totals.totalTaxAmount,
        discount: totals.discountAmount,
        total_amount: totals.totalAmount,
        paid_amount: 0,
        remaining_amount: totals.totalAmount,
        payment_method: null, // Will be set by processPayment
        gst_calculation_method: 'bill_wise',
        notes: paymentNotes || null,
        created_by: user?.id || null,
        items: cartItems.map((item) => ({
          food_item_id: item.food_item_id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          display_order: item.display_order || 0,
        })),
      }

      let billResponse
      let createdBill

      // Check if we have an existing draft bill - use PUT to update, otherwise POST to create
      if (currentOrder?.id && !currentOrder.id.toString().startsWith('draft-')) {
        // Update existing bill using PUT API
        billResponse = await billService.updateBill(currentOrder.id, billData)
        if (!billResponse.success) {
          playErrorSound()
          error(billResponse.message || 'Failed to update bill')
          setProcessingPayment(false)
          return
        }
        createdBill = billResponse.data
      } else {
        // Create new bill using POST API
        billResponse = await billService.createBill(billData)
        if (!billResponse.success) {
          playErrorSound()
          error(billResponse.message || 'Failed to create bill')
          setProcessingPayment(false)
          return
        }
        createdBill = billResponse.data
      }

      if (paymentMethod === 'wallet') {
        // Auto-generate payment notes if blank
        let finalNotes = paymentNotes.trim()
        if (!finalNotes) {
          const tableName = currentTable.name || currentTable.table_number || `Table ${currentTable.id}`
          const customerName = selectedCustomer.name || 'Customer'
          finalNotes = `Bill sent to wallet - ${customerName} (${tableName})`
        }

        // Process wallet payment via API (creates wallet transaction and updates bill)
        const paymentData = {
          payment_type: 'debit',
          amount: totals.totalAmount,
          payment_method: 'wallet',
          payment_notes: finalNotes,
          is_wallet_payment: true,
        }

        const paymentResponse = await billService.processPayment(createdBill.id, paymentData)

        if (paymentResponse.success) {
          // Play success sound
          playSuccessSound()
          
          // Show success dialog
          setPaymentSuccessData({
            billNumber: paymentResponse.data.billNumber,
            amount: totals.totalAmount,
            paymentMethod: 'Wallet',
            customer: selectedCustomer?.name || 'Walk-in',
            table: currentTable.name || currentTable.table_number || `Table ${currentTable.id}`,
            message: 'Bill sent to customer wallet successfully!',
          })
          setShowPaymentSuccess(true)
          
          // Reset cart and form
          setCartItems([])
          setSelectedCustomer(null)
          setDiscount({ type: 'amount', value: 0 })
          setPaymentNotes('')
          setPaidAmount(0)
          setPaymentMethod('cash')
          setCurrentOrder(null)
        } else {
          playErrorSound()
          error(paymentResponse.message || 'Failed to send bill to wallet')
        }
      } else {
        // Regular payment (cash/upi/card) - Process payment via API
        const paymentData = {
          payment_type: 'credit',
          amount: paidAmount,
          payment_method: paymentMethod,
          payment_notes: paymentNotes || null,
          is_wallet_payment: false,
        }

        const paymentResponse = await billService.processPayment(createdBill.id, paymentData)

        if (paymentResponse.success) {
          // Play success sound
          playSuccessSound()
          
          // Show success dialog
          setPaymentSuccessData({
            billNumber: paymentResponse.data.billNumber,
            amount: paidAmount,
            paymentMethod: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1),
            customer: selectedCustomer?.name || 'Walk-in',
            table: currentTable.name || currentTable.table_number || `Table ${currentTable.id}`,
            message: 'Payment processed successfully!',
          })
          setShowPaymentSuccess(true)
          
          // Reset cart and form
          setCartItems([])
          setSelectedCustomer(null)
          setDiscount({ type: 'amount', value: 0 })
          setPaymentNotes('')
          setPaidAmount(0)
          setPaymentMethod('cash')
          setCurrentOrder(null)
        } else {
          playErrorSound()
          error(paymentResponse.message || 'Failed to process payment')
        }
      }
    } catch (err) {
      console.error('Error processing payment:', err)
      playErrorSound()
      error('An unexpected error occurred. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
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
          <Col xs={12} md={3}>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faTable} className="me-2 text-primary" />
              <span className="fw-semibold me-2">Table:</span>
              <span className="text-primary">
                {currentTable ? `${currentTable.table_number}${currentTable.table_name ? ` - ${currentTable.table_name}` : ''}` : 'None Selected'}
              </span>
            </div>
          </Col>
          <Col xs={12} md={4} className="text-center">
            <div className="d-flex align-items-center justify-content-center flex-wrap gap-3">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faReceipt} className="me-2 text-primary" />
                <span className="fw-semibold me-2">Bill #:</span>
                <span className="text-primary">
                  {currentOrder?.billNumber || currentOrder?.bill_number || 'New Order'}
                </span>
              </div>
              {cartItems.length > 0 && (
                <div className="d-flex align-items-center">
                  <span className="fw-semibold me-2">Total:</span>
                  <span className="text-success fw-bold">₹{totals.totalAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </Col>
          <Col xs={12} md={5} className="text-end">
            <div className="d-flex align-items-center justify-content-end flex-wrap gap-3">
              {selectedCustomer && (
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                  <span className="fw-semibold me-2">Customer:</span>
                  <span className="text-primary">{selectedCustomer.name || 'N/A'}</span>
                  {selectedCustomer.mobile && (
                    <span className="text-muted ms-2">({selectedCustomer.mobile})</span>
                  )}
                </div>
              )}
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faClock} className="me-2 text-primary" />
                <span className="fw-semibold">{formatTime(currentTime)}</span>
              </div>
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
            onSaveDraft={handleSaveDraft}
            onPrintBill={handlePrintBill}
            onProcessPayment={handleProcessPayment}
          />
        </Col>
      </Row>

      {/* Payment Confirmation Dialog */}
      <Modal show={showPaymentConfirm} onHide={() => setShowPaymentConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-warning" />
            Confirm Payment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <p className="mb-2"><strong>Payment Details:</strong></p>
            <div className="ps-3">
              <p className="mb-1"><strong>Table:</strong> {currentTable?.name || currentTable?.table_number || `Table ${currentTable?.id}`}</p>
              <p className="mb-1"><strong>Customer:</strong> {selectedCustomer?.name || 'Walk-in'}</p>
              <p className="mb-1"><strong>Payment Method:</strong> {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</p>
              <p className="mb-1"><strong>Total Amount:</strong> ₹{totals.totalAmount.toFixed(2)}</p>
              {paymentMethod !== 'wallet' && (
                <p className="mb-1"><strong>Amount Paid:</strong> ₹{paidAmount.toFixed(2)}</p>
              )}
              {paymentMethod !== 'wallet' && paidAmount > totals.totalAmount && (
                <p className="mb-1 text-success"><strong>Change:</strong> ₹{(paidAmount - totals.totalAmount).toFixed(2)}</p>
              )}
            </div>
          </div>
          {paymentMethod === 'wallet' ? (
            <div className="alert alert-info mb-0">
              <small>This bill will be sent to the customer's wallet. The customer can pay later.</small>
            </div>
          ) : (
            <div className="alert alert-warning mb-0">
              <small>Are you sure you want to process this payment? This action cannot be undone.</small>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentConfirm(false)} disabled={processingPayment}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={confirmProcessPayment} 
            disabled={processingPayment}
            style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
          >
            {processingPayment ? 'Processing...' : 'Confirm & Process Payment'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Success Dialog */}
      <Modal show={showPaymentSuccess} onHide={() => setShowPaymentSuccess(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
            Payment Successful
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {paymentSuccessData && (
            <div>
              <div className="text-center mb-4">
                <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-success mb-3" />
                <h5 className="text-success mb-2">{paymentSuccessData.message}</h5>
              </div>
              <div className="border rounded p-3 bg-light">
                <p className="mb-2"><strong>Bill Number:</strong> {paymentSuccessData.billNumber}</p>
                <p className="mb-2"><strong>Table:</strong> {paymentSuccessData.table}</p>
                <p className="mb-2"><strong>Customer:</strong> {paymentSuccessData.customer}</p>
                <p className="mb-2"><strong>Payment Method:</strong> {paymentSuccessData.paymentMethod}</p>
                <p className="mb-0"><strong>Amount:</strong> ₹{paymentSuccessData.amount.toFixed(2)}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="success" 
            onClick={() => {
              setShowPaymentSuccess(false)
              setPaymentSuccessData(null)
            }}
            style={{ width: '100%' }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default POSPanel

