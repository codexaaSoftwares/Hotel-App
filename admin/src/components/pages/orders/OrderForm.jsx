import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { FormRow, TextField, SelectField } from '../../common/FormFields'
import { Button, Table as BootstrapTable, Badge, Form, Col, Card } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPlus, faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import packageService from '../../../services/packageService'
import { customerService } from '../../../services/customerService'
import branchService from '../../../services/branchService'

const OrderForm = forwardRef(({ 
  mode = 'create', 
  orderData = null, 
  onSubmit, 
  onCancel,
  loading = false 
}, ref) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    branch_id: '',
    order_date: new Date().toISOString().split('T')[0],
    due_date: '',
    flat_discount: 0,
    notes: '',
    items: []
  })
  const [packages, setPackages] = useState([])
  const [customers, setCustomers] = useState([])
  const [branches, setBranches] = useState([])
  const [errors, setErrors] = useState({})
  const [newItem, setNewItem] = useState({
    package_id: '',
    price: '',
    qty: 1
  })
  const [selectedPackageIds, setSelectedPackageIds] = useState([])
  const [showMultipleSelect, setShowMultipleSelect] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMultipleSelect && !event.target.closest('.position-relative')) {
        setShowMultipleSelect(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMultipleSelect])

  // Load data
  useEffect(() => {
    loadPackages()
    loadCustomers()
    loadBranches()
  }, [])

  // Load order data for edit mode
  useEffect(() => {
    if (mode === 'edit' && orderData) {
      const items = orderData.items || []
      setFormData({
        customer_id: orderData.customer_id?.toString() || '',
        branch_id: orderData.branch_id?.toString() || '',
        order_date: orderData.order_date ? orderData.order_date.split('T')[0] : new Date().toISOString().split('T')[0],
        due_date: orderData.due_date ? orderData.due_date.split('T')[0] : '',
        flat_discount: orderData.flat_discount || 0,
        notes: orderData.notes || '',
        items: items
      })
      // Sync selectedPackageIds with items
      const itemPackageIds = items.map(item => item.package_id?.toString()).filter(Boolean)
      setSelectedPackageIds(itemPackageIds)
    }
  }, [mode, orderData])

  const loadPackages = async () => {
    try {
      const response = await packageService.getPackages({ status: 'active' })
      if (response && response.success) {
        setPackages(response.data || [])
      } else {
        // Fallback to mock data
        console.warn('Failed to load packages from API, using mock data')
        const mockResponse = packageService.getMockPackages({ status: 'active' })
        if (mockResponse && mockResponse.success) {
          setPackages(mockResponse.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading packages:', error)
      // Fallback to mock data on error
      try {
        const mockResponse = packageService.getMockPackages({ status: 'active' })
        if (mockResponse && mockResponse.success) {
          setPackages(mockResponse.data || [])
        }
      } catch (mockError) {
        console.error('Error loading mock packages:', mockError)
      }
    }
  }

  const loadCustomers = async () => {
    try {
      const response = await customerService.getCustomers()
      if (response && response.success) {
        setCustomers(response.data || [])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      // customerService already uses mock data, so if it fails, set empty array
      setCustomers([])
    }
  }

  const loadBranches = async () => {
    try {
      const response = await branchService.getBranches({ status: 'active' })
      if (response && response.success) {
        setBranches(response.data || [])
      } else {
        // Fallback to mock data
        console.warn('Failed to load branches from API, using mock data')
        const mockResponse = branchService.getMockBranches({ status: 'active' })
        if (mockResponse && mockResponse.success) {
          setBranches(mockResponse.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading branches:', error)
      // Fallback to mock data on error
      try {
        const mockResponse = branchService.getMockBranches({ status: 'active' })
        if (mockResponse && mockResponse.success) {
          setBranches(mockResponse.data || [])
        }
      } catch (mockError) {
        console.error('Error loading mock branches:', mockError)
      }
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handlePackageSelect = (packageId) => {
    // Clear multiple selection when selecting single package
    if (selectedPackageIds.length > 0) {
      setSelectedPackageIds([])
    }
    
    const selectedPackage = packages.find(p => p.id.toString() === packageId)
    if (selectedPackage) {
      setNewItem({
        package_id: packageId,
        price: selectedPackage.default_price || '',
        qty: newItem.qty || 1
      })
    }
  }

  // Handle single package selection from dropdown (for backward compatibility)
  const handleSinglePackageSelect = (packageId) => {
    handlePackageSelect(packageId)
    setShowMultipleSelect(false)
  }

  const handleAddItem = () => {
    if (!newItem.package_id) {
      setErrors(prev => ({ ...prev, items: 'Please select a package' }))
      return
    }

    const selectedPackage = packages.find(p => p.id.toString() === newItem.package_id)
    if (!selectedPackage) {
      setErrors(prev => ({ ...prev, items: 'Package not found' }))
      return
    }

    // Check if package already exists in items
    const existingItemIndex = formData.items.findIndex(
      item => item.package_id === parseInt(newItem.package_id)
    )

    if (existingItemIndex !== -1) {
      // Update quantity if package already exists
      setFormData(prev => ({
        ...prev,
        items: prev.items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQty = item.qty + (parseInt(newItem.qty) || 1)
            return {
              ...item,
              qty: newQty,
              amount: item.price * newQty
            }
          }
          return item
        })
      }))
    } else {
      // Add new item
      const item = {
        package_id: parseInt(newItem.package_id),
        package_name: selectedPackage.package_name,
        price: parseFloat(newItem.price) || selectedPackage.default_price || 0,
        qty: parseInt(newItem.qty) || 1,
        amount: (parseFloat(newItem.price) || selectedPackage.default_price || 0) * (parseInt(newItem.qty) || 1)
      }

      setFormData(prev => ({
        ...prev,
        items: [...prev.items, item]
      }))
    }

    setNewItem({
      package_id: '',
      price: '',
      qty: 1
    })

    // Clear items error if it exists
    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors.items) {
        delete newErrors.items
      }
      return newErrors
    })
  }

  // Handle multiple package selection - Auto add/remove on checkbox change
  const handlePackageToggle = (packageId) => {
    const packageIdStr = packageId.toString()
    const selectedPackage = packages.find(p => p.id.toString() === packageIdStr)
    if (!selectedPackage) return

    const isAlreadyAdded = formData.items.some(item => item.package_id === parseInt(packageId))

    if (isAlreadyAdded) {
      // Remove from selection and from items
      setSelectedPackageIds(prev => prev.filter(id => id !== packageIdStr))
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.package_id !== parseInt(packageId))
      }))
    } else {
      // Add to selection and to items automatically with default price and qty
      const defaultPrice = selectedPackage.default_price || 0
      const defaultQty = 1
      
      const itemToAdd = {
        package_id: parseInt(packageId),
        package_name: selectedPackage.package_name,
        price: defaultPrice,
        qty: defaultQty,
        amount: defaultPrice * defaultQty
      }

      setSelectedPackageIds(prev => [...prev, packageIdStr])
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, itemToAdd]
      }))

      // Clear items error if it exists
      setErrors(prev => {
        const newErrors = { ...prev }
        if (newErrors.items) {
          delete newErrors.items
        }
        return newErrors
      })
    }
  }

  // Update item price/quantity when changed in table
  const handleItemPriceChange = (packageId, newPrice) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.package_id === parseInt(packageId)) {
          return {
            ...item,
            price: parseFloat(newPrice) || 0,
            amount: (parseFloat(newPrice) || 0) * item.qty
          }
        }
        return item
      })
    }))
  }

  const handleItemQtyChange = (packageId, newQty) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.package_id === parseInt(packageId)) {
          return {
            ...item,
            qty: parseInt(newQty) || 1,
            amount: item.price * (parseInt(newQty) || 1)
          }
        }
        return item
      })
    }))
  }

  // Select all packages
  const handleSelectAllPackages = () => {
    const availablePackages = packages.filter(pkg => {
      return !formData.items.some(item => item.package_id === pkg.id)
    })
    
    // Auto-add all packages to items
    const newItems = availablePackages.map(pkg => {
      const defaultPrice = pkg.default_price || 0
      const defaultQty = 1
      return {
        package_id: pkg.id,
        package_name: pkg.package_name,
        price: defaultPrice,
        qty: defaultQty,
        amount: defaultPrice * defaultQty
      }
    })

    const newPackageIds = availablePackages.map(p => p.id.toString())
    setSelectedPackageIds(prev => [...prev, ...newPackageIds])

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, ...newItems]
    }))

    // Clear items error if it exists
    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors.items) {
        delete newErrors.items
      }
      return newErrors
    })
  }

  // Deselect all packages
  const handleDeselectAllPackages = () => {
    // Remove all items (clear all)
    setFormData(prev => ({
      ...prev,
      items: []
    }))
    setSelectedPackageIds([])

    // Clear items error if it exists
    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors.items) {
        delete newErrors.items
      }
      return newErrors
    })
  }

  const handleRemoveItem = (index) => {
    const itemToRemove = formData.items[index]
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
    
    // Remove from selectedPackageIds
    setSelectedPackageIds(prev => 
      prev.filter(id => id !== itemToRemove.package_id.toString())
    )
  }


  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const updatedItems = prev.items.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: value }
          if (field === 'price' || field === 'qty') {
            updated.amount = (parseFloat(updated.price) || 0) * (parseInt(updated.qty) || 1)
          }
          return updated
        }
        return item
      })
      
      // Update selectedPackageIds based on updated items
      const itemPackageIds = updatedItems.map(item => item.package_id.toString())
      setSelectedPackageIds(itemPackageIds)
      
      return {
        ...prev,
        items: updatedItems
      }
    })
  }

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const discount = parseFloat(formData.flat_discount) || 0
    return subtotal - discount
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer selection is required'
    }

    if (!formData.branch_id) {
      newErrors.branch_id = 'Branch selection is required'
    }

    if (!formData.order_date) {
      newErrors.order_date = 'Order date is required'
    }

    if (formData.items.length === 0) {
      newErrors.items = 'At least one package item is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    const submitData = {
      customer_id: parseInt(formData.customer_id),
      branch_id: parseInt(formData.branch_id),
      order_date: formData.order_date,
      due_date: formData.due_date || null,
      flat_discount: parseFloat(formData.flat_discount) || 0,
      notes: formData.notes || null,
      total_amount: calculateTotal(),
      items: formData.items
    }

    onSubmit(submitData)
  }

  useImperativeHandle(ref, () => ({
    handleSubmit: handleSubmit
  }), [formData, errors, onSubmit])

  const customerOptions = [
    { value: '', label: 'Select Customer' },
    ...customers.map(customer => ({
      value: customer.id.toString(),
      label: `${customer.name || customer.firstName} ${customer.lastName || ''} - ${customer.mobile || customer.phone || ''}`
    }))
  ]

  const branchOptions = [
    { value: '', label: 'Select Branch' },
    ...branches.map(branch => ({
      value: branch.id.toString(),
      label: `${branch.branch_name} (${branch.branch_code})`
    }))
  ]

  const packageOptions = packages.map(pkg => ({
    value: pkg.id.toString(),
    label: `${pkg.package_name} - ${pkg.package_type} (₹${pkg.default_price})`
  }))

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  return (
    <div>
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
          id="order_date"
          label="Order Date (Event Date)"
          type="date"
          value={formData.order_date}
          onChange={(e) => handleChange('order_date', e.target.value)}
          required
          col={6}
          invalid={!!errors.order_date}
          feedback={errors.order_date}
        />
        <TextField
          id="due_date"
          label="Due Date (Final Delivery Date)"
          type="date"
          value={formData.due_date}
          onChange={(e) => handleChange('due_date', e.target.value)}
          col={6}
        />
      </FormRow>

      <FormRow>
        <Col md={12}>
          <Form.Label className="fw-semibold">Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any notes or special instructions for this order..."
            className={errors.notes ? 'is-invalid' : ''}
          />
          {errors.notes && (
            <Form.Control.Feedback type="invalid">
              {errors.notes}
            </Form.Control.Feedback>
          )}
        </Col>
      </FormRow>

      {/* Order Items Section */}
      <div className="mt-4">
        <div className="d-flex align-items-center mb-3 pb-2 border-bottom border-success border-2">
          <h5 className="mb-0 text-success">Order Items</h5>
        </div>

        {/* Package Selection with Multiple Select Dropdown */}
        <div className="bg-light p-3 rounded mb-3">
          <FormRow className="mb-0">
            <Col md={12}>
              <Form.Label className="fw-semibold">Select Packages</Form.Label>
              <div className="position-relative">
                <div
                  className="form-control border-2 d-flex align-items-center justify-content-between"
                  style={{ cursor: 'pointer', minHeight: '38px' }}
                  onClick={() => setShowMultipleSelect(!showMultipleSelect)}
                >
                  <span className={formData.items.length === 0 ? 'text-muted' : ''}>
                    {formData.items.length > 0 
                      ? `${formData.items.length} package(s) added`
                      : 'Select Packages (Click to open)'
                    }
                  </span>
                  <FontAwesomeIcon 
                    icon={showMultipleSelect ? faCheckSquare : faSquare} 
                    className="text-muted"
                  />
                </div>
                
                {/* Dropdown Menu with Checkboxes */}
                {showMultipleSelect && (
                  <div
                    className="position-absolute w-100 bg-white border rounded shadow-lg"
                    style={{
                      zIndex: 1000,
                      maxHeight: '400px',
                      overflowY: 'auto',
                      marginTop: '2px'
                    }}
                    onMouseLeave={() => setShowMultipleSelect(false)}
                  >
                    <div className="p-2 border-bottom bg-light sticky-top">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="fw-semibold">Select Packages (Auto-add on selection)</small>
                        <div className="d-flex gap-2">
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectAllPackages()
                            }}
                          >
                            <small>Select All</small>
                          </Button>
                          <span className="text-muted">|</span>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeselectAllPackages()
                            }}
                          >
                            <small>Clear All</small>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      {packages.map(pkg => {
                        const pkgIdStr = pkg.id?.toString()
                        const isSelected = formData.items.some(item => item.package_id?.toString() === pkgIdStr)
                        
                        return (
                          <div
                            key={pkg.id}
                            className="d-flex align-items-center p-2 rounded hover-bg-light"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePackageToggle(pkg.id)
                            }}
                            style={{
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f8f9fa'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <Form.Check
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation()
                                handlePackageToggle(pkg.id)
                              }}
                              className="me-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-grow-1">
                              <div className="fw-semibold">{pkg.package_name}</div>
                              <small className="text-muted">{pkg.package_type}</small>
                              <div className="text-success fw-bold">{formatCurrency(pkg.default_price)}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </FormRow>
        </div>

        {errors.items && (
          <div className="text-danger small mb-2">{errors.items}</div>
        )}

        {/* Items Table */}
        {formData.items.length > 0 && (
          <div className="mb-3">
            <BootstrapTable striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.package_name}</td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        className="border-2"
                        style={{ width: '100px' }}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                        className="border-2"
                        style={{ width: '80px' }}
                      />
                    </td>
                    <td className="fw-semibold">{formatCurrency(item.amount)}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </BootstrapTable>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="mt-4 p-3 bg-light rounded">
        <FormRow className="mb-2">
          <Col md={6}>
            <div className="d-flex justify-content-between">
              <span className="fw-semibold">Subtotal:</span>
              <span>{formatCurrency(formData.items.reduce((sum, item) => sum + (item.amount || 0), 0))}</span>
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-semibold">Flat Discount:</span>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.flat_discount}
                  onChange={(e) => handleChange('flat_discount', e.target.value)}
                  className="border-2"
                  style={{ width: '120px' }}
                />
              </div>
            </div>
          </Col>
        </FormRow>
        <div className="border-top pt-2 mt-2">
          <div className="d-flex justify-content-between">
            <span className="fw-bold fs-5">Total Amount:</span>
            <span className="fw-bold fs-5 text-success">{formatCurrency(calculateTotal())}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

OrderForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  orderData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
}

export default OrderForm

