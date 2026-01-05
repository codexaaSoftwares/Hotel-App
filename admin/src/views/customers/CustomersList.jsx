import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Container, Row, Col, Button, FormControl, FormSelect, Badge, Card } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faTrash, 
  faEye, 
  faSearch, 
  faRefresh, 
  faUsers, 
  faUser,
  faPlus,
  faEdit,
  faFilePdf,
  faSave,
  faFilter,
} from '@fortawesome/free-solid-svg-icons'
import { Table, Modal, FormModal, useToast } from '../../components'
import CustomerForm from '../../components/pages/customers/CustomerForm'
import CustomerDetailsModal from '../../components/pages/customers/CustomerDetailsModal'
import { customerService } from '../../services/customerService'
import branchService from '../../services/branchService'
import photographersData from '../../mock/photographers.json'
import { useLocation } from 'react-router-dom'
import { usePermissions } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const CustomersList = () => {
  const location = useLocation()
  const { success, error } = useToast()
  const { hasPermission, user } = usePermissions()
  
  // Permission checks - strict boolean checks with useMemo to recalculate on user/permissions change
  const canCreateCustomer = useMemo(() => {
    if (!hasPermission || !user || !user.permissions) return false
    return hasPermission(PERMISSIONS.CUSTOMER_WRITE) || hasPermission(PERMISSIONS.CUSTOMER_MANAGE)
  }, [hasPermission, user])
  
  const canEditCustomer = useMemo(() => {
    if (!hasPermission || !user || !user.permissions) return false
    return hasPermission(PERMISSIONS.CUSTOMER_WRITE) || hasPermission(PERMISSIONS.CUSTOMER_MANAGE)
  }, [hasPermission, user])
  
  const canDeleteCustomer = useMemo(() => {
    if (!hasPermission || !user || !user.permissions) return false
    return hasPermission(PERMISSIONS.CUSTOMER_DELETE) || hasPermission(PERMISSIONS.CUSTOMER_MANAGE)
  }, [hasPermission, user])
  
  // State management
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [registrationDateFilter, setRegistrationDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  // Add/Edit Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [customerToEdit, setCustomerToEdit] = useState(null)
  const [branches, setBranches] = useState([])
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  
  // Refs for form components
  const addFormRef = useRef()
  const editFormRef = useRef()
  
  // Data states
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  
  // Stats state
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0
  })
  

  // Pagination meta state
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  })

  // Load customers and branches
  useEffect(() => {
    loadBranches()
  }, [])

  // Load customers when filters, search, or pagination changes
  useEffect(() => {
    loadCustomers()
  }, [currentPage, pageSize, searchTerm, statusFilter, locationFilter, registrationDateFilter])

  // Load stats separately (can be optimized later)
  useEffect(() => {
    loadStats()
  }, [customers])

  const loadBranches = async () => {
    try {
      const response = await branchService.getBranches()
      if (response.success) {
        setBranches(response.data || [])
      }
    } catch (err) {
      console.error('Error loading branches:', err)
    }
  }

  const loadCustomers = async () => {
    try {
      setLoading(true)
      // Build params for server-side pagination and filtering
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        city: locationFilter || undefined,
      }
      
      // Load from service with server-side pagination
      const response = await customerService.getCustomers(params)

      if (!response?.success || !Array.isArray(response?.data)) {
        error(response?.message || 'Failed to load customers')
        setCustomers([])
        setPaginationMeta({
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        })
        return
      }

      const convertedCustomers = response.data.map((customer) => {
        const financials = getCustomerFinancials(customer)

        return {
          ...customer,
          name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
          mobile: customer.mobile || customer.phone,
          phone: customer.phone || customer.mobile,
          joinedDate: customer.joinedDate || customer.createdAt || customer.created_at,
          created_at: customer.created_at || customer.createdAt || customer.joinedDate,
          photographerId: customer.photographerId || customer.customerId || customer.customer_code || `#${customer.id}`,
          job_code: customer.job_code || customer.jobCode || '',
          jobCode: customer.jobCode || customer.job_code || '',
          total_earnings: financials.total,
          total_amount: financials.total,
          totalSpent: financials.total,
          paid_amount: financials.paid,
          remaining_amount: financials.remaining,
          total_orders: customer.total_orders ?? customer.total_services ?? customer.totalOrders ?? 0,
          total_services: customer.total_services ?? customer.total_orders ?? customer.totalOrders ?? 0,
          wallet_balance: customer.wallet_balance ?? customer.walletBalance ?? financials.paid,
          branch_id: customer.branch_id || null,
          branch_name: customer.branch_name || null,
        }
      })

      setCustomers(convertedCustomers)

      if (response.meta) {
        setPaginationMeta({
          total: response.meta.total || 0,
          totalPages: response.meta.totalPages || 1,
          hasNext: response.meta.hasNext || false,
          hasPrev: response.meta.hasPrev || false,
        })
      }

      console.log('Loaded customers:', convertedCustomers.length, 'items (server-side)')
    } catch (err) {
      console.error('Error loading customers:', err)
      error('Failed to load customers. Please try again.')
      setCustomers([])
      setPaginationMeta({
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Use paginationMeta.total for total customers (from API)
      // This gives us the actual total count, not just current page
      const totalCustomers = paginationMeta.total || 0
      
      // Only calculate stats if we have customers
      if (totalCustomers === 0) {
        setStats({
          totalCustomers: 0,
          activeCustomers: 0,
          newThisMonth: 0
        })
        return
      }
      
      // Calculate active customers and new this month from current page data
      // Note: For accurate stats across all pages, we should ideally use an API endpoint
      // For now, we'll use the current page data as an approximation
      const activeCustomers = customers.filter(c => c.status === 'active').length
      const now = new Date()
      const newThisMonth = customers.filter(c => {
        const joinedDate = c.created_at || c.createdAt || c.joinedDate
        if (!joinedDate) return false
        const joinDate = new Date(joinedDate)
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
      }).length
      
      setStats({
        totalCustomers,
        activeCustomers,
        newThisMonth
      })
    } catch (err) {
      console.error('Error loading stats:', err)
      // Set stats to 0 on error
      setStats({
        totalCustomers: 0,
        activeCustomers: 0,
        newThisMonth: 0
      })
    }
  }

  // Update stats when customers or paginationMeta changes
  useEffect(() => {
    loadStats()
  }, [customers, paginationMeta.total])

  // Handle filter changes - reset to page 1
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'status') {
      setStatusFilter(value)
    } else if (filterType === 'location') {
      setLocationFilter(value)
    } else if (filterType === 'registrationDate') {
      setRegistrationDateFilter(value)
    }
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Handle search - reset to page 1
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when search changes
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Handle page size change
  const handlePageSizeChange = (size) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when page size changes
  }

  // Get unique locations for filter
  const locations = [...new Set(customers.map(p => p.location?.city).filter(Boolean))]

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'suspended': return 'danger'
      case 'pending': return 'warning'
      default: return 'secondary'
    }
  }

  // Get branch indicator (L for Lunawada, V for Vadodara)
  const getBranchIndicator = (photographer) => {
    if (!photographer) return ''
    
    const branchName = (photographer.branch_name || '').toLowerCase().trim()
    const branchCode = (photographer.branch_code || '').toUpperCase().trim()
    const branchId = photographer.branch_id
    
    // Check branch name first
    if (branchName.includes('lunawada') || branchName.includes('luna') || branchName.includes('main')) {
      return 'L'
    }
    if (branchName.includes('vadodara') || branchName.includes('vado') || branchName.includes('baroda') || branchName.includes('mumbai')) {
      return 'V'
    }
    
    // Check branch code - if starts with L or V
    if (branchCode && branchCode.length > 0) {
      const firstChar = branchCode.charAt(0)
      if (firstChar === 'L') return 'L'
      if (firstChar === 'V') return 'V'
      // If starts with M, check if it's MB001 (Lunawada) or MB002 (Vadodara)
      if (firstChar === 'M' && branchCode.includes('001')) return 'L'
      if (firstChar === 'M' && branchCode.includes('002')) return 'V'
    }
    
    // Check branch_id - branch_id 1 = Lunawada (L), branch_id 2 = Vadodara (V)
    if (branchId) {
      if (branchId === 1) return 'L'
      if (branchId === 2) return 'V'
    }
    
    return ''
  }

  // Generate initials for avatar
  const getInitials = (customer) => {
    if (customer.name) {
      const names = customer.name.split(' ')
      if (names.length >= 2) {
        return `${names[0]?.charAt(0) || ''}${names[names.length - 1]?.charAt(0) || ''}`.toUpperCase()
      }
      return customer.name.substring(0, 2).toUpperCase()
    }
    return `${customer.firstName?.charAt(0) || ''}${customer.lastName?.charAt(0) || ''}`.toUpperCase()
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Table columns
  const normalizeNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined || value === '') return defaultValue
    const num = Number(value)
    return Number.isNaN(num) ? defaultValue : num
  }

  const getCustomerFinancials = (customer = {}) => {
    const total = normalizeNumber(
      customer.total_amount ??
      customer.total_earnings ??
      customer.totalSpent ??
      customer.totalAmount
    )

    const paidSource = normalizeNumber(
      customer.paid_amount ??
      customer.paidAmount ??
      customer.wallet_balance ??
      customer.walletBalance
    )

    const remainingSource = customer.remaining_amount !== undefined && customer.remaining_amount !== null
      ? normalizeNumber(customer.remaining_amount)
      : customer.remainingAmount !== undefined && customer.remainingAmount !== null
        ? normalizeNumber(customer.remainingAmount)
        : null

    const remaining = remainingSource !== null
      ? remainingSource
      : Math.max(0, total - paidSource)

    const paid = paidSource > 0
      ? paidSource
      : Math.max(0, total - remaining)

    return {
      total,
      paid,
      remaining,
    }
  }

  const columns = useMemo(() => [
    {
      key: 'job_code',
      label: 'Job Code',
      render: (value, photographer, index) => {
        const jobCode = photographer.job_code || photographer.jobCode || ''
        return (
          <div style={{ width: '90px', flexShrink: 0 }}>
            {jobCode ? (
              <div className="fw-bold text-primary" style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{jobCode}</div>
            ) : (
              <span className="text-muted" style={{ fontSize: '12px' }}>—</span>
            )}
          </div>
        )
      }
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (value, photographer, index) => {
        const photographerName = photographer.name || `${photographer.firstName || ''} ${photographer.lastName || ''}`.trim()
        const branchIndicator = getBranchIndicator(photographer)
        const displayName = branchIndicator ? `${photographerName} (${branchIndicator})` : photographerName
        return (
          <div className="d-flex align-items-center" style={{ width: '180px', flexShrink: 0 }}>
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle me-2"
              style={{ 
                width: '35px', 
                height: '35px', 
                backgroundColor: '#8b5cf6',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0
              }}
            >
              {getInitials(photographer)}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="fw-semibold text-dark" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
              <small className="text-muted" style={{ fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{photographer.photographerId || photographer.customerId || `#${photographer.id}` || 'N/A'}</small>
            </div>
          </div>
        )
      }
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (value, photographer, index) => (
        <div style={{ width: '150px', flexShrink: 0 }}>
          <div className="fw-semibold text-dark" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{photographer.mobile || photographer.phone || 'N/A'}</div>
          <small className="text-muted" style={{ fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{photographer.email || 'No email'}</small>
        </div>
      )
    },
    {
      key: 'financials',
      label: 'Financials',
      render: (value, photographer, index) => {
        const { total, paid, remaining } = getCustomerFinancials(photographer)
        return (
          <div style={{ width: '140px', flexShrink: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-muted" style={{ fontSize: '11px' }}>Total:</small>
              <div className="fw-semibold text-primary" style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>
                {formatCurrency(total)}
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-muted" style={{ fontSize: '11px' }}>Paid:</small>
              <div className="fw-semibold text-primary" style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>
                {formatCurrency(paid)}
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted" style={{ fontSize: '11px' }}>Remaining:</small>
              <div className={`fw-semibold ${remaining > 0 ? 'text-danger' : 'text-success'}`} style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>
                {formatCurrency(remaining)}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'orders',
      label: 'Services',
      render: (value, photographer, index) => (
        <Badge bg="info" className="px-2 py-1" style={{ fontSize: '12px' }}>
          {photographer.total_orders || photographer.totalOrders || photographer.total_services || 0}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, customer, index) => {
        const { remaining } = getCustomerFinancials(customer)
        const derivedStatus = remaining > 0 ? 'pending' : 'completed'
        const statusColor = derivedStatus === 'pending' ? 'warning' : 'success'

        return (
          <Badge bg={statusColor} className="px-2 py-1" style={{ fontSize: '12px' }}>
            {derivedStatus.charAt(0).toUpperCase() + derivedStatus.slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'joined',
      label: 'Joined',
      render: (value, customer, index) => (
        <div className="text-muted" style={{ fontSize: '12px', whiteSpace: 'nowrap', width: '100px', flexShrink: 0 }}>
          {formatDate(customer.joinedDate || customer.createdAt || customer.created_at)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, photographer, index) => (
        <div className="d-flex gap-1 align-items-center" style={{ flexWrap: 'nowrap', width: '140px', flexShrink: 0, justifyContent: 'flex-start' }}>
          <Button
            variant="outline-info"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleViewCustomer(photographer)
            }}
            title="View Customer"
            style={{ minWidth: '30px', padding: '4px 6px', flexShrink: 0 }}
          >
            <FontAwesomeIcon icon={faEye} style={{ fontSize: '12px' }} />
          </Button>
          {canEditCustomer && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleEditCustomer(photographer)
              }}
              title="Edit Customer"
              style={{ minWidth: '30px', padding: '4px 6px', flexShrink: 0 }}
            >
              <FontAwesomeIcon icon={faEdit} style={{ fontSize: '12px' }} />
            </Button>
          )}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleExportSingle(photographer)
            }}
            title="Export Customer PDF"
            style={{ minWidth: '30px', padding: '4px 6px', flexShrink: 0 }}
          >
            <FontAwesomeIcon icon={faFilePdf} style={{ fontSize: '12px' }} />
          </Button>
          {canDeleteCustomer && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteCustomer(photographer)
              }}
              title="Delete Customer"
              style={{ minWidth: '30px', padding: '4px 6px', flexShrink: 0 }}
            >
              <FontAwesomeIcon icon={faTrash} style={{ fontSize: '12px' }} />
            </Button>
          )}
        </div>
      )
    }
  ], [canEditCustomer, canDeleteCustomer, user])

  // Sortable columns
  const sortableColumns = ['firstName', 'email', 'totalOrders', 'totalSpent', 'status', 'joinedDate']

  // Event handlers
  const handleSearch = (e) => {
    handleSearchChange(e.target.value)
  }



  const handleViewCustomer = (customer) => {
    console.log('View customer clicked:', customer)
    if (!customer) {
      console.error('Customer is null or undefined')
      return
    }
    setSelectedCustomer(customer)
    setShowDetailsModal(true)
    console.log('Modal should be visible now')
  }

  const handleDeleteCustomer = (customer) => {
    if (!canDeleteCustomer) {
      error('You do not have permission to delete customers')
      return
    }
    setCustomerToDelete(customer)
    setShowDeleteModal(true)
  }

  const handleExportSingle = async (customer) => {
    try {
      const customerId = customer.id || customer.customer_id
      if (!customerId) {
        error('Customer ID not found for export')
        return
      }
      const result = await customerService.exportCustomerPdf(customerId)
      if (result.success) {
        success('Customer PDF exported successfully')
      } else {
        error(result.message || 'Failed to export PDF')
      }
    } catch (err) {
      console.error('Error exporting customer PDF:', err)
      error('An error occurred while exporting PDF')
    }
  }

  const handleReset = () => {
    setSearchTerm('')
    setStatusFilter('')
    setLocationFilter('')
    setRegistrationDateFilter('')
    setCurrentPage(1)
  }



  const confirmDeleteCustomer = async () => {
    if (!canDeleteCustomer) {
      error('You do not have permission to delete customers')
      setShowDeleteModal(false)
      setCustomerToDelete(null)
      return
    }
    try {
      const response = await customerService.deleteCustomer(customerToDelete.id)
      if (response.success) {
        success('Customer deleted successfully')
        setShowDeleteModal(false)
        setCustomerToDelete(null)
        loadCustomers()
        loadStats()
      } else {
        // Check for 403 or permission errors
        if (response.status === 403 || response.message?.toLowerCase().includes('permission')) {
          error('You do not have permission to delete customers')
        } else {
          error(response.message || 'Failed to delete customer')
        }
        setShowDeleteModal(false)
        setCustomerToDelete(null)
      }
    } catch (err) {
      console.error('Error deleting customer:', err)
      // Check for 403 errors in the error object
      if (err?.response?.status === 403 || err?.status === 403 || err?.message?.toLowerCase().includes('permission')) {
        error('You do not have permission to delete customers')
      } else {
        error(err?.message || 'An error occurred while deleting customer')
      }
      setShowDeleteModal(false)
      setCustomerToDelete(null)
    }
  }

  // Add Customer Handlers
  const handleAddCustomer = () => {
    if (!canCreateCustomer) {
      error('You do not have permission to create customers')
      return
    }
    setShowAddModal(true)
  }

  const handleAddCustomerSubmit = () => {
    if (!canCreateCustomer) {
      error('You do not have permission to create customers')
      return
    }
    if (addFormRef.current) {
      addFormRef.current.handleSubmit()
    }
  }

  const handleAddCustomerFormSubmit = async (formData) => {
    if (!canCreateCustomer) {
      error('You do not have permission to create customers')
      return
    }
    try {
      setAddLoading(true)
      const response = await customerService.createCustomer(formData)
      if (response.success) {
        success('Customer created successfully')
        setShowAddModal(false)
        loadCustomers()
        loadStats()
      } else {
        error(response.message || 'Failed to create customer')
      }
    } catch (err) {
      console.error('Error creating customer:', err)
      error('An error occurred while creating customer')
    } finally {
      setAddLoading(false)
    }
  }

  // Edit Customer Handlers
  const handleEditCustomer = (customer) => {
    if (!canEditCustomer) {
      error('You do not have permission to edit customers')
      return
    }
    setCustomerToEdit(customer)
    setShowEditModal(true)
  }

  const handleEditCustomerSubmit = () => {
    if (!canEditCustomer) {
      error('You do not have permission to edit customers')
      return
    }
    if (editFormRef.current) {
      editFormRef.current.handleSubmit()
    }
  }

  const handleEditCustomerFormSubmit = async (formData) => {
    if (!canEditCustomer) {
      error('You do not have permission to edit customers')
      setShowEditModal(false)
      setCustomerToEdit(null)
      return
    }
    try {
      setEditLoading(true)
      const response = await customerService.updateCustomer(customerToEdit.id, formData)
      if (response.success) {
        success('Customer updated successfully')
        setShowEditModal(false)
        setCustomerToEdit(null)
        loadCustomers()
        loadStats()
      } else {
        // Check for 403 or permission errors
        if (response.status === 403 || response.message?.toLowerCase().includes('permission')) {
          error('You do not have permission to edit customers')
        } else {
          error(response.message || 'Failed to update customer')
        }
        setShowEditModal(false)
        setCustomerToEdit(null)
      }
    } catch (err) {
      console.error('Error updating customer:', err)
      // Check for 403 errors in the error object
      if (err?.response?.status === 403 || err?.status === 403 || err?.message?.toLowerCase().includes('permission')) {
        error('You do not have permission to edit customers')
      } else {
        error(err?.message || 'An error occurred while updating customer')
      }
      setShowEditModal(false)
      setCustomerToEdit(null)
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <>
    <div style={{ width: '100%', padding: 0, margin: 0 }}>
      <Container fluid style={{ paddingLeft: 0, paddingRight: 0, maxWidth: '100%' }}>
        <Row style={{ marginLeft: 0, marginRight: 0 }}>
          <Col xs={12} style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {/* Page Header */}
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faUsers} className="me-3 text-primary fs-4" />
              <h2 className="mb-0 text-dark">Customer Management</h2>
            </div>
            <div className="ms-auto d-flex align-items-center gap-3">
              {canCreateCustomer && (
                <Button variant="primary" onClick={handleAddCustomer} className="text-white">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Customer
                </Button>
              )}
            </div>
          </div>

          {/* Statistics Cards - Only show when there are customers */}
          {paginationMeta.total > 0 && (
            <Row className="mb-4">
              <Col md={3}>
                <Card className="bg-gradient-primary text-white border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h4 className="mb-0">{stats.totalCustomers}</h4>
                        <p className="mb-0 opacity-75">Total Customers</p>
                      </div>
                      <FontAwesomeIcon icon={faUsers} className="fs-1 opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="bg-gradient-success text-white border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h4 className="mb-0">{stats.activeCustomers}</h4>
                        <p className="mb-0 opacity-75">Active Customers</p>
                      </div>
                      <FontAwesomeIcon icon={faUser} className="fs-1 opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="bg-gradient-info text-white border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h4 className="mb-0">{stats.newThisMonth}</h4>
                        <p className="mb-0 opacity-75">New This Month</p>
                      </div>
                      <FontAwesomeIcon icon={faUser} className="fs-1 opacity-50" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Main Content Container */}
          <div className="bg-white rounded-3 shadow-sm p-4" style={{ overflowX: 'hidden' }}>
            {/* Search and Filter Section */}
            <div className="mb-4">
              <Row className="g-3">
                <Col md={4}>
                  <div className="position-relative">
                    <FontAwesomeIcon 
                      icon={faSearch} 
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                      style={{ zIndex: 10 }}
                    />
                    <FormControl
                      placeholder="Search by name, email, phone, job code, or ID..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="border-2 ps-5"
                    />
                  </div>
                </Col>
                <Col md={2}>
                  <div className="position-relative">
                    <FontAwesomeIcon 
                      icon={faFilter} 
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                      style={{ zIndex: 10 }}
                    />
                    <FormSelect
                      value={statusFilter}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="border-2 ps-5"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </FormSelect>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="position-relative">
                    <FontAwesomeIcon 
                      icon={faFilter} 
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                      style={{ zIndex: 10 }}
                    />
                    <FormSelect
                      value={locationFilter}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="border-2 ps-5"
                    >
                      <option value="">All Locations</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </FormSelect>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="position-relative">
                    <FontAwesomeIcon 
                      icon={faFilter} 
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                      style={{ zIndex: 10 }}
                    />
                    <FormSelect
                      value={registrationDateFilter}
                      onChange={(e) => handleFilterChange('registrationDate', e.target.value)}
                      className="border-2 ps-5"
                    >
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </FormSelect>
                  </div>
                </Col>
                <Col md={2}>
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleReset}
                    className="w-100"
                  >
                    <FontAwesomeIcon icon={faRefresh} className="me-2" />
                    Reset
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Section Header */}
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-primary border-2">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faUsers} className="me-3 text-primary fs-4" />
                <h4 className="mb-0 text-primary">Customers List</h4>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="text-muted">
                  Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, paginationMeta.total)} of {paginationMeta.total} customers
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ width: '100%', overflow: 'hidden' }}>
              <Table
                data={customers}
                columns={columns}
                sortableColumns={sortableColumns}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                loading={loading}
                hover
                pagination={true}
                serverSide={true}
                sortable={true}
                totalItems={paginationMeta.total}
                emptyMessage="No customers found"
                className="table-sm"
                style={{ width: '100%', marginBottom: 0, tableLayout: 'fixed' }}
              />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
    </div>

    {/* Customer Details Modal */}
      <CustomerDetailsModal
        visible={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedCustomer(null)
        }}
        customer={selectedCustomer}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setCustomerToDelete(null)
        }}
        title="Delete Customer"
        onConfirm={confirmDeleteCustomer}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      >
        <p>Are you sure you want to delete the customer <strong>"{customerToDelete?.name || `${customerToDelete?.firstName || ''} ${customerToDelete?.lastName || ''}`.trim()}"</strong>?</p>
        <p className="text-muted">This action cannot be undone.</p>
      </Modal>

      {/* Add Customer Modal */}
      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Customer"
        onSubmit={handleAddCustomerSubmit}
        submitText="Create Customer"
        submitIcon={faPlus}
        loading={addLoading}
        loadingText="Creating..."
        size="lg"
      >
        <CustomerForm
          ref={addFormRef}
          mode="create"
          branches={branches}
          onSubmit={handleAddCustomerFormSubmit}
          onCancel={() => setShowAddModal(false)}
        />
      </FormModal>

      {/* Edit Customer Modal */}
      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setCustomerToEdit(null)
        }}
        title="Edit Customer"
        onSubmit={handleEditCustomerSubmit}
        submitText="Update Customer"
        submitIcon={faSave}
        loading={editLoading}
        loadingText="Updating..."
        size="lg"
      >
        <CustomerForm
          ref={editFormRef}
          mode="edit"
          customerData={customerToEdit}
          branches={branches}
          onSubmit={handleEditCustomerFormSubmit}
          onCancel={() => {
            setShowEditModal(false)
            setCustomerToEdit(null)
          }}
        />
      </FormModal>
    </>
  )
}

export default CustomersList

