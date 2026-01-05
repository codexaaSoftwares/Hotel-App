import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Button, FormControl, FormSelect, Badge, Card } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faTrash, 
  faEdit, 
  faPlus,
  faTag,
  faSearch, 
  faRefresh,
  faFilter,
  faSave,
  faRupeeSign,
  faFilePdf,
  faDownload,
} from '@fortawesome/free-solid-svg-icons'
import { Table, Modal, FormModal } from '../../components'
import PackageForm from '../../components/pages/packages/PackageForm'
import packageService from '../../services/packageService'
import { useToast } from '../../components/common/ToastProvider'
import { usePermissions } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const PackagesList = () => {
  const { success, error } = useToast()
  const { hasPermission } = usePermissions()
  
  // Permission checks
  const canCreatePackage = hasPermission
    ? hasPermission(PERMISSIONS.PACKAGE_WRITE) || hasPermission(PERMISSIONS.PACKAGE_MANAGE)
    : false
  const canEditPackage = hasPermission
    ? hasPermission(PERMISSIONS.PACKAGE_WRITE) || hasPermission(PERMISSIONS.PACKAGE_MANAGE)
    : false
  const canDeletePackage = hasPermission
    ? hasPermission(PERMISSIONS.PACKAGE_DELETE) || hasPermission(PERMISSIONS.PACKAGE_MANAGE)
    : false
  
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState(null)
  const [packageTypes, setPackageTypes] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  
  // Add/Edit Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [packageToEdit, setPackageToEdit] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  
  // Refs for form components
  const addFormRef = useRef()
  const editFormRef = useRef()

  // Load package types from API
  useEffect(() => {
    const loadPackageTypes = async () => {
      try {
        setLoadingTypes(true)
        const types = await packageService.getPackageTypes()
        setPackageTypes(types)
      } catch (error) {
        console.error('Error loading package types:', error)
        setPackageTypes([])
      } finally {
        setLoadingTypes(false)
      }
    }
    loadPackageTypes()
  }, [])

  // Load packages when filters, search, or pagination changes
  useEffect(() => {
    loadPackages()
  }, [currentPage, pageSize, searchTerm, typeFilter, statusFilter])

  const loadPackages = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        package_type: typeFilter || undefined,
        status: statusFilter || undefined,
      }
      
      const response = await packageService.getPackages(params)
      if (response && response.success) {
        setPackages(response.data || [])
        if (response.meta) {
          setPaginationMeta({
            total: response.meta.total || 0,
            totalPages: response.meta.totalPages || 1,
            hasNext: response.meta.hasNext || false,
            hasPrev: response.meta.hasPrev || false,
          })
        }
      } else {
        // If response is not successful, try to use mock data directly
        console.warn('Failed to load packages from API, using mock data')
        const mockResponse = packageService.getMockPackages(params)
        if (mockResponse && mockResponse.success) {
          setPackages(mockResponse.data || [])
          if (mockResponse.meta) {
            setPaginationMeta({
              total: mockResponse.meta.total || 0,
              totalPages: mockResponse.meta.totalPages || 1,
              hasNext: mockResponse.meta.hasNext || false,
              hasPrev: mockResponse.meta.hasPrev || false,
            })
          }
        }
      }
    } catch (error) {
      console.error('Error loading packages:', error)
      // Fallback to mock data on error
      try {
        const params = {
          page: currentPage,
          limit: pageSize,
          search: searchTerm || undefined,
          package_type: typeFilter || undefined,
          status: statusFilter || undefined,
        }
        const mockResponse = packageService.getMockPackages(params)
        if (mockResponse && mockResponse.success) {
          setPackages(mockResponse.data || [])
          if (mockResponse.meta) {
            setPaginationMeta({
              total: mockResponse.meta.total || 0,
              totalPages: mockResponse.meta.totalPages || 1,
              hasNext: mockResponse.meta.hasNext || false,
              hasPrev: mockResponse.meta.hasPrev || false,
            })
          }
        }
      } catch (mockError) {
        console.error('Error loading mock packages:', mockError)
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      default: return 'secondary'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  const handleDeletePackage = (pkg) => {
    setPackageToDelete(pkg)
    setShowDeleteModal(true)
  }

  const buildFilterParams = () => ({
    search: searchTerm || undefined,
    package_type: typeFilter || undefined,
    status: statusFilter || undefined,
  })

  const confirmDeletePackage = async () => {
    try {
      const response = await packageService.deletePackage(packageToDelete.id)
      if (response.success) {
        success('Package deleted successfully')
        setShowDeleteModal(false)
        setPackageToDelete(null)
        loadPackages()
      } else {
        error(response.message || 'Failed to delete package')
      }
    } catch (err) {
      console.error('Error deleting package:', err)
      error('An error occurred while deleting package')
    }
  }

  // Add Package Handlers
  const handleAddPackage = () => {
    setShowAddModal(true)
  }

  const handleAddPackageSubmit = () => {
    if (addFormRef.current) {
      addFormRef.current.handleSubmit()
    }
  }

  const handleAddPackageFormSubmit = async (formData) => {
    try {
      setAddLoading(true)
      const response = await packageService.createPackage(formData)
      if (response.success) {
        success('Package created successfully')
        setShowAddModal(false)
        loadPackages()
      } else {
        error(response.message || 'Failed to create package')
      }
    } catch (err) {
      console.error('Error creating package:', err)
      error('An error occurred while creating package')
    } finally {
      setAddLoading(false)
    }
  }

  // Edit Package Handlers
  const handleEditPackage = (pkg) => {
    setPackageToEdit(pkg)
    setShowEditModal(true)
  }

  const handleEditPackageSubmit = () => {
    if (editFormRef.current) {
      editFormRef.current.handleSubmit()
    }
  }

  const handleEditPackageFormSubmit = async (formData) => {
    try {
      setEditLoading(true)
      const response = await packageService.updatePackage(packageToEdit.id, formData)
      if (response.success) {
        success('Package updated successfully')
        setShowEditModal(false)
        setPackageToEdit(null)
        loadPackages()
      } else {
        error(response.message || 'Failed to update package')
      }
    } catch (err) {
      console.error('Error updating package:', err)
      error('An error occurred while updating package')
    } finally {
      setEditLoading(false)
    }
  }

  const sortableColumns = ['package', 'price']

  // Calculate statistics from current page data (or fetch separately if needed)
  const totalStats = packages.reduce((acc, pkg) => {
    acc.totalPackages += 1
    acc.totalValue += pkg.default_price || 0
    if (pkg.status === 'active') acc.activePackages += 1
    return acc
  }, { totalPackages: 0, totalValue: 0, activePackages: 0 })

  // Handle filter changes - reset to page 1
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'type') {
      setTypeFilter(value)
    } else if (filterType === 'status') {
      setStatusFilter(value)
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

  const columns = [
    {
      key: 'package',
      label: 'Package',
      render: (value, pkg) => (
        <div>
          <div className="fw-semibold text-dark">{pkg.package_name}</div>
          <small className="text-muted">Type: {pkg.package_type}</small>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value, pkg) => (
        <div className="text-muted">
          {pkg.description || 'No description'}
        </div>
      )
    },
    {
      key: 'price',
      label: 'Default Price',
      render: (value, pkg) => (
        <div className="fw-semibold text-primary">
          {formatCurrency(pkg.default_price)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, pkg) => (
        <Badge bg={getStatusColor(pkg.status)} className="px-2 py-1">
          {pkg.status || 'inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, pkg) => (
        <div className="d-flex gap-1 align-items-center" style={{ flexWrap: 'nowrap' }}>
          {canEditPackage && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleEditPackage(pkg)}
              title="Edit Package"
              style={{ minWidth: '32px', padding: '4px 8px' }}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          )}
          {canDeletePackage && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleDeletePackage(pkg)}
              title="Delete Package"
              style={{ minWidth: '32px', padding: '4px 8px' }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          {/* Page Header */}
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faTag} className="me-3 text-primary fs-4" />
              <h2 className="mb-0 text-dark">Package Management</h2>
            </div>
            <div className="ms-auto">
              <div className="d-flex gap-2">
                {canCreatePackage && (
                  <Button variant="primary" onClick={handleAddPackage} className="text-white">
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Add Package
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="bg-gradient-primary text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{totalStats.totalPackages}</h4>
                      <p className="mb-0 opacity-75">Total Packages</p>
                    </div>
                    <FontAwesomeIcon icon={faTag} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-gradient-info text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{formatCurrency(totalStats.totalValue)}</h4>
                      <p className="mb-0 opacity-75">Total Value</p>
                    </div>
                    <FontAwesomeIcon icon={faRupeeSign} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-gradient-success text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{totalStats.activePackages}</h4>
                      <p className="mb-0 opacity-75">Active Packages</p>
                    </div>
                    <FontAwesomeIcon icon={faTag} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-gradient-warning text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{paginationMeta.total}</h4>
                      <p className="mb-0 opacity-75">Total Packages</p>
                    </div>
                    <FontAwesomeIcon icon={faFilter} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Main Content Container */}
          <div className="bg-white rounded-3 shadow-sm p-4">
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
                      placeholder="Search by package name or description..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="border-2 ps-5"
                    />
                  </div>
                </Col>
                <Col md={3}>
                  <div className="position-relative">
                    <FontAwesomeIcon 
                      icon={faFilter} 
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                      style={{ zIndex: 10 }}
                    />
                    <FormSelect
                      value={typeFilter}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="border-2 ps-5"
                    >
                      <option value="">All Types</option>
                      {packageTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
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
                      value={statusFilter}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="border-2 ps-5"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </FormSelect>
                  </div>
                </Col>
                <Col md={3}>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      setSearchTerm('')
                      setTypeFilter('')
                      setStatusFilter('')
                      setCurrentPage(1)
                    }}
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
                <FontAwesomeIcon icon={faTag} className="me-3 text-primary fs-4" />
                <h4 className="mb-0 text-primary">Packages List</h4>
              </div>
              <div className="text-muted">
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, paginationMeta.total)} of {paginationMeta.total} packages
              </div>
            </div>

            {/* Table */}
            <div 
              style={{ 
                width: '100%',
                overflowX: 'auto',
                overflowY: 'visible',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <Table
                data={packages}
                columns={columns}
                sortableColumns={sortableColumns}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                loading={loading}
                pagination={true}
                serverSide={true}
                sortable={true}
                totalItems={paginationMeta.total}
                emptyMessage="No packages found"
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setPackageToDelete(null)
        }}
        title="Delete Package"
        onConfirm={confirmDeletePackage}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      >
        <p>Are you sure you want to delete the package <strong>"{packageToDelete?.package_name}"</strong>?</p>
        <p className="text-muted">This action cannot be undone.</p>
      </Modal>

      {/* Add Package Modal */}
      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Package"
        onSubmit={handleAddPackageSubmit}
        submitText="Create Package"
        submitIcon={faPlus}
        loading={addLoading}
        loadingText="Creating..."
        size="lg"
      >
        <PackageForm
          ref={addFormRef}
          mode="create"
          onSubmit={handleAddPackageFormSubmit}
          onCancel={() => setShowAddModal(false)}
        />
      </FormModal>

      {/* Edit Package Modal */}
      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setPackageToEdit(null)
        }}
        title="Edit Package"
        onSubmit={handleEditPackageSubmit}
        submitText="Update Package"
        submitIcon={faSave}
        loading={editLoading}
        loadingText="Updating..."
        size="lg"
      >
        <PackageForm
          ref={editFormRef}
          mode="edit"
          packageData={packageToEdit}
          onSubmit={handleEditPackageFormSubmit}
          onCancel={() => {
            setShowEditModal(false)
            setPackageToEdit(null)
          }}
        />
      </FormModal>
    </Container>
  )
}

export default PackagesList

