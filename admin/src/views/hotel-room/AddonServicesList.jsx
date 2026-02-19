import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Container, Row, Col, Button, Badge, Card, Form, FormControl, InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrash,
  faEdit,
  faPlus,
  faRupeeSign,
  faSearch,
  faRefresh,
  faConciergeBell,
} from '@fortawesome/free-solid-svg-icons'
import { Table, Modal, FormModal } from '../../components'
import AddonServiceForm from '../../components/pages/hotel-room/AddonServiceForm'
import addonService from '../../services/addonService'
import { useToast } from '../../components'
import { usePermissions, useDebounce } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const AddonServicesList = () => {
  const { success, error, warning } = useToast()
  const { hasPermission } = usePermissions()

  const [services, setServices] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortState, setSortState] = useState({
    columnKey: 'name',
    sortBy: 'name',
    sortDirection: 'asc',
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [serviceToEdit, setServiceToEdit] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const addFormRef = useRef()
  const editFormRef = useRef()

  const debouncedSearch = useDebounce(searchTerm, 400)

  const canCreateService = hasPermission('create_addon_service')
  const canUpdateService = hasPermission('edit_addon_service')
  const canDeleteService = hasPermission('delete_addon_service')
  const canViewService = hasPermission('view_addon_service')

  const fetchServicesWithParams = useCallback(async () => {
    setLoading(true)
    const searchValue = (debouncedSearch || '').trim()
    try {
      const response = await addonService.getAddonServices({
        page: currentPage,
        limit: pageSize,
        search: searchValue || undefined,
        status: statusFilter || undefined,
        sort_by: sortState.sortBy,
        sort_direction: sortState.sortDirection,
      })

      if (response && response.success) {
        setServices(response.data || [])
        setMeta(response.meta || null)
      } else {
        error(response.message || 'Failed to load addon services')
        setServices([])
        setMeta(null)
      }
    } catch (err) {
      console.error('Error loading addon services:', err)
      error('An error occurred while loading addon services')
      setServices([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, sortState.sortBy, sortState.sortDirection, error])

  useEffect(() => {
    if (!canViewService) {
      warning && warning('You do not have permission to view addon services.', { title: 'Access limited' })
    }
  }, [canViewService, warning])

  useEffect(() => {
    if (!canViewService) return
    fetchServicesWithParams()
  }, [canViewService, fetchServicesWithParams])

  if (!canViewService) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FontAwesomeIcon icon={faConciergeBell} className="text-muted mb-3" size="3x" />
            <h4 className="text-muted">Access Restricted</h4>
            <p className="text-muted">
              You do not have permission to view addon services. Please contact your administrator.
            </p>
          </Col>
        </Row>
      </Container>
    )
  }

  const serviceSummary = useMemo(() => {
    const visibleServices = services || []
    const active = visibleServices.filter((s) => s.status === 'active').length
    const inactive = visibleServices.filter((s) => s.status === 'inactive').length

    return {
      total: meta?.total ?? visibleServices.length,
      active,
      inactive,
    }
  }, [services, meta])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const transformErrors = (laravelErrors) => {
    if (!laravelErrors || typeof laravelErrors !== 'object') return {}
    const transformed = {}
    Object.keys(laravelErrors).forEach((key) => {
      const errorValue = laravelErrors[key]
      transformed[key] = Array.isArray(errorValue) ? (errorValue[0] || '') : (errorValue || '')
    })
    return transformed
  }

  const handleDeleteService = (service) => {
    if (!service?.id) return
    if (!canDeleteService) {
      error('You do not have permission to delete addon services')
      return
    }
    setServiceToDelete(service)
    setShowDeleteModal(true)
  }

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return

    setDeleteLoading(true)
    try {
      const response = await addonService.deleteAddonService(serviceToDelete.id)
      if (response.success) {
        success('Addon service deleted successfully')
        setShowDeleteModal(false)
        setServiceToDelete(null)
        await fetchServicesWithParams()
      } else {
        error(response.message || 'Failed to delete addon service')
      }
    } catch (err) {
      console.error('Error deleting addon service:', err)
      error('An error occurred while deleting addon service')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAddService = () => {
    if (!canCreateService) {
      error('You do not have permission to create addon services')
      return
    }
    setShowAddModal(true)
  }

  const handleAddServiceSubmit = async () => {
    if (!addFormRef.current) return

    const formData = addFormRef.current.submit()
    if (!formData) return

    setAddLoading(true)
    try {
      const response = await addonService.createAddonService(formData)
      if (response.success) {
        success('Addon service created successfully')
        setShowAddModal(false)
        addFormRef.current?.reset?.()
        await fetchServicesWithParams()
      } else {
        error(response.message || 'Failed to create addon service')
        if (response.errors) {
          addFormRef.current?.setErrors?.(transformErrors(response.errors))
        }
      }
    } catch (err) {
      console.error('Error creating addon service:', err)
      error('An error occurred while creating addon service')
    } finally {
      setAddLoading(false)
    }
  }

  const handleEditService = (service) => {
    if (!canUpdateService) {
      error('You do not have permission to edit addon services')
      return
    }
    setServiceToEdit(service)
    setShowEditModal(true)
  }

  const handleEditServiceSubmit = async () => {
    if (!editFormRef.current || !serviceToEdit) return

    const formData = editFormRef.current.submit()
    if (!formData) return

    setEditLoading(true)
    try {
      const response = await addonService.updateAddonService(serviceToEdit.id, formData)
      if (response.success) {
        success('Addon service updated successfully')
        setShowEditModal(false)
        setServiceToEdit(null)
        editFormRef.current?.reset?.()
        await fetchServicesWithParams()
      } else {
        error(response.message || 'Failed to update addon service')
        if (response.errors) {
          editFormRef.current?.setErrors?.(transformErrors(response.errors))
        }
      }
    } catch (err) {
      console.error('Error updating addon service:', err)
      error('An error occurred while updating addon service')
    } finally {
      setEditLoading(false)
    }
  }

  const sortKeyMap = {
    name: 'name',
    charge: 'charge',
    status: 'status',
    created_at: 'created_at',
  }

  const handleSortChange = (columnKey, direction) => {
    const sortBy = sortKeyMap[columnKey]
    if (!sortBy) return
    setSortState({ columnKey, sortBy, sortDirection: direction })
    setCurrentPage(1)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const columns = [
    {
      key: 'name',
      label: 'Service Name',
      render: (value, service) => (
        <div className="fw-semibold text-dark" style={{ fontSize: '14px' }}>
          {service.name}
        </div>
      ),
    },
    {
      key: 'charge',
      label: 'Charge',
      render: (value, service) => (
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faRupeeSign} className="text-muted me-1" />
          <span className="fw-semibold">{formatCurrency(service.charge)}</span>
          <small className="text-muted ms-1">/pc</small>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, service) => (
        <Badge bg={getStatusColor(service.status)} className="px-2 py-1" style={{ fontSize: '12px' }}>
          {service.status || 'active'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value, service) => (
        <span className="text-muted">
          {service.created_at ? new Date(service.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, service) => (
        <div className="d-flex gap-1 align-items-center">
          {canUpdateService && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleEditService(service)}
              title="Edit Service"
              style={{ minWidth: '32px', padding: '4px 8px' }}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          )}
          {canDeleteService && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteService(service)
              }}
              title="Delete Service"
              style={{ minWidth: '32px', padding: '4px 8px' }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <Container fluid className="px-0 px-xl-3">
      <Row className="g-4">
        <Col xs={12}>
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faConciergeBell} className="me-3 text-primary fs-4" />
              <h2 className="mb-0 text-dark">Addon Services</h2>
            </div>
            <div className="ms-auto d-flex gap-2">
              {canCreateService && (
                <Button variant="primary" onClick={handleAddService} className="text-white shadow-sm">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Service
                </Button>
              )}
            </div>
          </div>

          <Row className="mb-4 g-3">
            <Col md={4} sm={6}>
              <Card className="bg-gradient-primary text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{serviceSummary.total}</h4>
                      <p className="mb-0 opacity-75">Total Services</p>
                    </div>
                    <FontAwesomeIcon icon={faConciergeBell} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} sm={6}>
              <Card className="bg-gradient-success text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{serviceSummary.active}</h4>
                      <p className="mb-0 opacity-75">Active</p>
                    </div>
                    <FontAwesomeIcon icon={faConciergeBell} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} sm={6}>
              <Card className="bg-gradient-info text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{serviceSummary.inactive}</h4>
                      <p className="mb-0 opacity-75">Inactive</p>
                    </div>
                    <FontAwesomeIcon icon={faRupeeSign} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="shadow-sm">
            <Card.Body>
              <Form className="mb-4">
                <Row className="g-3 align-items-end">
                  <Col md={4} sm={12}>
                    <Form.Label className="fw-semibold text-muted">Search</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white border-2 text-muted">
                        <FontAwesomeIcon icon={faSearch} />
                      </InputGroup.Text>
                      <FormControl
                        placeholder="Search by service name"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="border-2"
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3} sm={6}>
                    <Form.Label className="fw-semibold text-muted">Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="border-2"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Form.Select>
                  </Col>
                  <Col md={3} sm={12}>
                    <Form.Label className="fw-semibold text-muted">Actions</Form.Label>
                    <div className="d-flex gap-2">
                      <Button
                        type="button"
                        variant="outline-secondary"
                        className="border-2"
                        onClick={() => {
                          setSearchTerm('')
                          setStatusFilter('')
                          setCurrentPage(1)
                        }}
                      >
                        Clear
                      </Button>
                      <Button
                        type="button"
                        variant="outline-primary"
                        className="border-2"
                        disabled={loading}
                        onClick={fetchServicesWithParams}
                      >
                        <FontAwesomeIcon icon={faRefresh} className="me-1" /> Refresh
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>

              <Table
                data={services}
                columns={columns}
                loading={loading}
                hover
                pagination={true}
                sortable={true}
                sortableColumns={['name', 'charge', 'status', 'created_at']}
                serverSide={true}
                meta={meta}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
                sortBy={sortState.columnKey}
                sortDirection={sortState.sortDirection}
                onSortChange={handleSortChange}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        visible={showDeleteModal}
        onClose={() => !deleteLoading && setShowDeleteModal(false)}
        title="Delete Addon Service"
        onConfirm={confirmDeleteService}
        confirmText={deleteLoading ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
        maskClosable={!deleteLoading}
      >
        {serviceToDelete ? (
          <p>
            Are you sure you want to delete <strong>{serviceToDelete.name}</strong>? This action cannot be undone.
          </p>
        ) : (
          'Loading...'
        )}
      </Modal>

      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Addon Service"
        onSubmit={handleAddServiceSubmit}
        submitText="Create Service"
        submitIcon={faPlus}
        loading={addLoading}
        loadingText="Creating..."
      >
        <AddonServiceForm ref={addFormRef} mode="create" />
      </FormModal>

      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setServiceToEdit(null)
        }}
        title="Edit Addon Service"
        onSubmit={handleEditServiceSubmit}
        submitText="Update Service"
        submitIcon={faEdit}
        loading={editLoading}
        loadingText="Updating..."
      >
        <AddonServiceForm
          ref={editFormRef}
          mode="edit"
          serviceData={serviceToEdit}
        />
      </FormModal>
    </Container>
  )
}

export default AddonServicesList
