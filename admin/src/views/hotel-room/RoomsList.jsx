import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Container, Row, Col, Button, Badge, Card, Form, FormControl, InputGroup } from 'react-bootstrap'
import { SelectField } from '../../components/common/FormFields'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrash,
  faEdit,
  faPlus,
  faBed,
  faUsers,
  faSearch,
  faRefresh,
  faRupeeSign,
  faFilePdf,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons'
import { Table, Modal, FormModal } from '../../components'
import RoomForm from '../../components/pages/hotel-room/RoomForm'
import roomService from '../../services/roomService'
import { useToast } from '../../components'
import { usePermissions, useDebounce } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const RoomsList = () => {
  const { success, error, warning } = useToast()
  const { hasPermission } = usePermissions()

  const [rooms, setRooms] = useState([])
  const [categories, setCategories] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [floorFilter, setFloorFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortState, setSortState] = useState({
    columnKey: 'room_number',
    sortBy: 'room_number',
    sortDirection: 'asc',
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [roomToEdit, setRoomToEdit] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  const addFormRef = useRef()
  const editFormRef = useRef()

  const debouncedSearch = useDebounce(searchTerm, 400)

  // Check permissions
  const canCreateRoom = hasPermission('create_room') || hasPermission(PERMISSIONS.ROOM_WRITE)
  const canUpdateRoom = hasPermission('edit_room') || hasPermission(PERMISSIONS.ROOM_WRITE)
  const canDeleteRoom = hasPermission('delete_room') || hasPermission(PERMISSIONS.ROOM_DELETE)
  const canViewRoom = hasPermission('view_room') || hasPermission(PERMISSIONS.ROOM_READ)

  // Load categories for filter
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const response = await roomService.getRoomCategories({ limit: 100, status: 'active' })
        if (response.success) {
          setCategories(response.data || [])
        }
      } catch (err) {
        console.error('Error loading categories:', err)
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

  const fetchRoomsWithParams = useCallback(async () => {
    setLoading(true)
    const searchValue = (debouncedSearch || '').trim()
    try {
      const response = await roomService.getRooms({
        page: currentPage,
        limit: pageSize,
        search: searchValue || undefined,
        status: statusFilter || undefined,
        category_id: categoryFilter || undefined,
        floor_number: floorFilter || undefined,
        is_active: activeFilter !== '' ? activeFilter === 'true' : undefined,
        sort_by: sortState.sortBy,
        sort_direction: sortState.sortDirection,
      })

      if (response && response.success) {
        setRooms(response.data || [])
        setMeta(response.meta || null)
      } else {
        error(response.message || 'Failed to load rooms')
        setRooms([])
        setMeta(null)
      }
    } catch (err) {
      console.error('Error loading rooms:', err)
      error('An error occurred while loading rooms')
      setRooms([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, categoryFilter, floorFilter, activeFilter, sortState.sortBy, sortState.sortDirection, error])

  useEffect(() => {
    if (!canViewRoom) {
      warning && warning('You do not have permission to view rooms.', { title: 'Access limited' })
    }
  }, [canViewRoom, warning])

  useEffect(() => {
    if (!canViewRoom) {
      return
    }
    fetchRoomsWithParams()
  }, [canViewRoom, fetchRoomsWithParams])

  if (!canViewRoom) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FontAwesomeIcon icon={faBed} className="text-muted mb-3" size="3x" />
            <h4 className="text-muted">Access Restricted</h4>
            <p className="text-muted">
              You do not have permission to view room information. Please contact your administrator if you need additional access.
            </p>
          </Col>
        </Row>
      </Container>
    )
  }

  const roomSummary = useMemo(() => {
    const visibleRooms = rooms || []
    const available = visibleRooms.filter((room) => room.status === 'available').length
    const occupied = visibleRooms.filter((room) => room.status === 'occupied').length
    const reserved = visibleRooms.filter((room) => room.status === 'reserved').length
    const active = visibleRooms.filter((room) => room.is_active).length

    return {
      total: meta?.total ?? visibleRooms.length,
      available,
      occupied,
      reserved,
      active,
    }
  }, [rooms, meta])

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success'
      case 'occupied':
        return 'danger'
      case 'reserved':
        return 'warning'
      case 'cleaning':
        return 'info'
      case 'maintenance':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getBedTypeLabel = (bedType) => {
    const labels = {
      single: 'Single',
      double: 'Double',
      king: 'King',
      queen: 'Queen',
      twin: 'Twin'
    }
    return labels[bedType] || bedType
  }

  const transformErrors = (laravelErrors) => {
    if (!laravelErrors || typeof laravelErrors !== 'object') {
      return {}
    }

    const transformed = {}
    Object.keys(laravelErrors).forEach((key) => {
      const errorValue = laravelErrors[key]
      if (Array.isArray(errorValue)) {
        transformed[key] = errorValue[0] || ''
      } else if (typeof errorValue === 'string') {
        transformed[key] = errorValue
      }
    })
    return transformed
  }

  const handleDeleteRoom = (room) => {
    if (!room || !room.id) {
      error('Invalid room selected.')
      return
    }
    if (!canDeleteRoom) {
      error('You do not have permission to delete rooms')
      return
    }
    setRoomToDelete(room)
    setShowDeleteModal(true)
  }

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return

    setDeleteLoading(true)
    try {
      const response = await roomService.deleteRoom(roomToDelete.id)
      if (response.success) {
        success('Room deleted successfully')
        setShowDeleteModal(false)
        setRoomToDelete(null)
        await fetchRoomsWithParams()
      } else {
        error(response.message || 'Failed to delete room')
      }
    } catch (err) {
      console.error('Error deleting room:', err)
      error('An error occurred while deleting room')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAddRoom = () => {
    if (!canCreateRoom) {
      error('You do not have permission to create rooms')
      return
    }
    setShowAddModal(true)
  }

  const handleAddRoomSubmit = async () => {
    if (!addFormRef.current) return

    const formData = addFormRef.current.submit()
    if (!formData) return

    setAddLoading(true)
    try {
      const response = await roomService.createRoom(formData)
      if (response.success) {
        success('Room created successfully')
        setShowAddModal(false)
        if (addFormRef.current) {
          addFormRef.current.reset?.()
        }
        await fetchRoomsWithParams()
      } else {
        error(response.message || 'Failed to create room')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          addFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error creating room:', err)
      error('An error occurred while creating room')
    } finally {
      setAddLoading(false)
    }
  }

  const handleEditRoom = (room) => {
    if (!canUpdateRoom) {
      error('You do not have permission to edit rooms')
      return
    }
    setRoomToEdit(room)
    setShowEditModal(true)
  }

  const handleEditRoomSubmit = async () => {
    if (!editFormRef.current || !roomToEdit) return

    const formData = editFormRef.current.submit()
    if (!formData) return

    setEditLoading(true)
    try {
      const response = await roomService.updateRoom(roomToEdit.id, formData)
      if (response.success) {
        success('Room updated successfully')
        setShowEditModal(false)
        setRoomToEdit(null)
        if (editFormRef.current) {
          editFormRef.current.reset?.()
        }
        await fetchRoomsWithParams()
      } else {
        error(response.message || 'Failed to update room')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          editFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error updating room:', err)
      error('An error occurred while updating room')
    } finally {
      setEditLoading(false)
    }
  }

  const sortKeyMap = {
    room_number: 'room_number',
    floor_number: 'floor_number',
    bed_type: 'bed_type',
    max_occupancy: 'max_occupancy',
    status: 'status',
    is_active: 'is_active',
    created_at: 'created_at',
  }

  const handleSortChange = (columnKey, direction) => {
    const sortBy = sortKeyMap[columnKey]
    if (!sortBy) {
      return
    }
    setSortState({
      columnKey,
      sortBy,
      sortDirection: direction,
    })
    setCurrentPage(1)
  }

  const handleExportRooms = async () => {
    setExportLoading(true)
    try {
      const params = {}
      if (searchTerm) {
        params.search = searchTerm
      }
      if (statusFilter) {
        params.status = statusFilter
      }
      if (categoryFilter) {
        params.category_id = categoryFilter
      }
      if (floorFilter) {
        params.floor_number = floorFilter
      }
      if (activeFilter !== '') {
        params.is_active = activeFilter === 'true'
      }
      const response = await roomService.exportRooms(params)
      if (response.success) {
        success('Rooms exported successfully')
      } else {
        error(response.message || 'Failed to export rooms')
      }
    } catch (err) {
      console.error('Error exporting rooms:', err)
      error('Failed to export rooms. Please try again.')
    } finally {
      setExportLoading(false)
    }
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
      key: 'room_number',
      label: 'Room',
      render: (value, room) => (
        <div>
          <div className="fw-semibold text-dark" style={{ fontSize: '14px' }}>
            {room.room_number}
          </div>
          {room.room_category && (
            <small className="text-muted" style={{ fontSize: '12px' }}>
              {room.room_category.name}
            </small>
          )}
        </div>
      ),
    },
    {
      key: 'floor_number',
      label: 'Floor',
      render: (value, room) => (
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faLayerGroup} className="text-muted me-2" />
          <span>{room.floor_number}</span>
        </div>
      ),
    },
    {
      key: 'bed_type',
      label: 'Bed Type',
      render: (value, room) => (
        <span>{getBedTypeLabel(room.bed_type)}</span>
      ),
    },
    {
      key: 'max_occupancy',
      label: 'Capacity',
      render: (value, room) => (
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faUsers} className="text-muted me-2" />
          <span>{room.max_occupancy} {room.max_occupancy === 1 ? 'Person' : 'People'}</span>
        </div>
      ),
    },
    {
      key: 'effective_price',
      label: 'Price/Night',
      render: (value, room) => (
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faRupeeSign} className="text-muted me-1" />
          <span className="fw-semibold">{formatCurrency(room.effective_price || 0)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, room) => (
        <Badge bg={getStatusColor(room.status)} className="px-2 py-1" style={{ fontSize: '12px' }}>
          {room.status || 'available'}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Active',
      render: (value, room) => (
        <Badge bg={room.is_active ? 'success' : 'secondary'} className="px-2 py-1" style={{ fontSize: '12px' }}>
          {room.is_active ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value, room) => (
        <span className="text-muted">
          {room.created_at ? new Date(room.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, room) => (
        <div className="d-flex gap-1 align-items-center" style={{ flexWrap: 'nowrap' }}>
          {canUpdateRoom && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleEditRoom(room)}
              title="Edit Room"
              style={{ minWidth: '32px', padding: '4px 8px' }}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          )}
          {canDeleteRoom && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteRoom(room)
              }}
              title="Delete Room"
              style={{ minWidth: '32px', padding: '4px 8px' }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(cat => ({
      value: cat.id,
      label: cat.name
    }))
  ]

  // Get unique floors from rooms for filter
  const floorOptions = useMemo(() => {
    const floors = [...new Set(rooms.map(room => room.floor_number).filter(f => f !== null && f !== undefined).sort((a, b) => a - b))]
    return [
      { value: '', label: 'All Floors' },
      ...floors.map(floor => ({
        value: floor,
        label: `Floor ${floor}`
      }))
    ]
  }, [rooms])

  return (
    <Container fluid className="px-0 px-xl-3">
      <Row className="g-4">
        <Col xs={12}>
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faBed} className="me-3 text-primary fs-4" />
              <h2 className="mb-0 text-dark">Rooms Management</h2>
            </div>
            <div className="ms-auto d-flex gap-2">
              <Button 
                variant="outline-danger" 
                onClick={handleExportRooms} 
                disabled={exportLoading}
                className="shadow-sm"
              >
                <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                {exportLoading ? 'Exporting...' : 'Export Rooms'}
              </Button>
              {canCreateRoom && (
                <Button variant="primary" onClick={handleAddRoom} className="text-white shadow-sm">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Room
                </Button>
              )}
            </div>
          </div>

          <Row className="mb-4 g-3">
            <Col md={3} sm={6}>
              <Card className="bg-gradient-primary text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{roomSummary.total}</h4>
                      <p className="mb-0 opacity-75">Total Rooms</p>
                    </div>
                    <FontAwesomeIcon icon={faBed} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="bg-gradient-success text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{roomSummary.available}</h4>
                      <p className="mb-0 opacity-75">Available</p>
                    </div>
                    <FontAwesomeIcon icon={faBed} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="text-white border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{roomSummary.occupied}</h4>
                      <p className="mb-0 opacity-75">Occupied</p>
                    </div>
                    <FontAwesomeIcon icon={faBed} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="bg-gradient-info text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{roomSummary.active}</h4>
                      <p className="mb-0 opacity-75">Active Rooms</p>
                    </div>
                    <FontAwesomeIcon icon={faUsers} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="shadow-sm">
            <Card.Body>
              <Form className="mb-4">
                <Row className="g-3 align-items-end">
                  <Col md={3} sm={12}>
                    <Form.Label className="fw-semibold text-muted">Search</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white border-2 text-muted">
                        <FontAwesomeIcon icon={faSearch} />
                      </InputGroup.Text>
                      <FormControl
                        placeholder="Search by room number, category, or notes"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="border-2"
                      />
                    </InputGroup>
                  </Col>
                  <Col md={2} sm={6}>
                    <SelectField
                      id="statusFilter"
                      label="Status"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                      options={[
                        { value: '', label: 'All Status' },
                        { value: 'available', label: 'Available' },
                        { value: 'occupied', label: 'Occupied' },
                        { value: 'reserved', label: 'Reserved' },
                        { value: 'cleaning', label: 'Cleaning' },
                        { value: 'maintenance', label: 'Maintenance' },
                      ]}
                      col={12}
                      showLabel={false}
                    />
                  </Col>
                  <Col md={2} sm={6}>
                    <SelectField
                      id="categoryFilter"
                      label="Category"
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                      options={categoryOptions}
                      col={12}
                      showLabel={false}
                      disabled={loadingCategories}
                    />
                  </Col>
                  <Col md={2} sm={6}>
                    <SelectField
                      id="floorFilter"
                      label="Floor"
                      value={floorFilter}
                      onChange={(e) => {
                        setFloorFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                      options={floorOptions}
                      col={12}
                      showLabel={false}
                    />
                  </Col>
                  <Col md={2} sm={6}>
                    <SelectField
                      id="activeFilter"
                      label="Active"
                      value={activeFilter}
                      onChange={(e) => {
                        setActiveFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                      options={[
                        { value: '', label: 'All' },
                        { value: 'true', label: 'Active' },
                        { value: 'false', label: 'Inactive' },
                      ]}
                      col={12}
                      showLabel={false}
                    />
                  </Col>
                  <Col md={1} sm={12}>
                    <Form.Label className="fw-semibold text-muted">Actions</Form.Label>
                    <div className="d-flex gap-2">
                      <Button
                        type="button"
                        variant="outline-secondary"
                        className="border-2"
                        onClick={() => {
                          setSearchTerm('')
                          setStatusFilter('')
                          setCategoryFilter('')
                          setFloorFilter('')
                          setActiveFilter('')
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
                        onClick={fetchRoomsWithParams}
                      >
                        <FontAwesomeIcon icon={faRefresh} className="me-1" /> Refresh
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>

              <Table
                data={rooms}
                columns={columns}
                loading={loading}
                hover
                pagination={true}
                sortable={true}
                sortableColumns={['room_number', 'floor_number', 'bed_type', 'max_occupancy', 'status', 'is_active', 'created_at']}
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
        title="Delete Room"
        onConfirm={confirmDeleteRoom}
        confirmText={deleteLoading ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
        maskClosable={!deleteLoading}
      >
        {roomToDelete ? (
          <p>
            Are you sure you want to delete room <strong>{roomToDelete.room_number}</strong>? This action cannot be undone.
          </p>
        ) : (
          'Loading...'
        )}
      </Modal>

      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Room"
        onSubmit={handleAddRoomSubmit}
        submitText="Create Room"
        submitIcon={faPlus}
        loading={addLoading}
        loadingText="Creating..."
        size="lg"
      >
        <RoomForm
          ref={addFormRef}
          mode="create"
        />
      </FormModal>

      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setRoomToEdit(null)
        }}
        title="Edit Room"
        onSubmit={handleEditRoomSubmit}
        submitText="Update Room"
        submitIcon={faEdit}
        loading={editLoading}
        loadingText="Updating..."
        size="lg"
      >
        <RoomForm
          ref={editFormRef}
          mode="edit"
          roomData={roomToEdit}
        />
      </FormModal>
    </Container>
  )
}

export default RoomsList

