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
} from '@fortawesome/free-solid-svg-icons'
import { Table, Modal, FormModal } from '../../components'
import RoomCategoryForm from '../../components/pages/hotel-room/RoomCategoryForm'
import roomService from '../../services/roomService'
import { useToast } from '../../components'
import { usePermissions, useDebounce } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const RoomCategoriesList = () => {
  const { success, error, warning } = useToast()
  const { hasPermission } = usePermissions()

  const [categories, setCategories] = useState([])
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
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const addFormRef = useRef()
  const editFormRef = useRef()

  const debouncedSearch = useDebounce(searchTerm, 400)

  // Check permissions
  const canCreateCategory = hasPermission('create_room_type') || hasPermission(PERMISSIONS.ROOM_TYPE_WRITE)
  const canUpdateCategory = hasPermission('edit_room_type') || hasPermission(PERMISSIONS.ROOM_TYPE_WRITE)
  const canDeleteCategory = hasPermission('delete_room_type') || hasPermission(PERMISSIONS.ROOM_TYPE_DELETE)
  const canViewCategory = hasPermission('view_room_type') || hasPermission(PERMISSIONS.ROOM_TYPE_READ)

  const fetchCategoriesWithParams = useCallback(async () => {
    setLoading(true)
    const searchValue = (debouncedSearch || '').trim()
    try {
      const response = await roomService.getRoomCategories({
        page: currentPage,
        limit: pageSize,
        search: searchValue || undefined,
        status: statusFilter || undefined,
        sort_by: sortState.sortBy,
        sort_direction: sortState.sortDirection,
      })

      if (response && response.success) {
        setCategories(response.data || [])
        setMeta(response.meta || null)
      } else {
        error(response.message || 'Failed to load room categories')
        setCategories([])
        setMeta(null)
      }
    } catch (err) {
      console.error('Error loading room categories:', err)
      error('An error occurred while loading room categories')
      setCategories([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, sortState.sortBy, sortState.sortDirection, error])

  useEffect(() => {
    if (!canViewCategory) {
      warning && warning('You do not have permission to view room categories.', { title: 'Access limited' })
    }
  }, [canViewCategory, warning])

  useEffect(() => {
    if (!canViewCategory) {
      return
    }
    fetchCategoriesWithParams()
  }, [canViewCategory, fetchCategoriesWithParams])

  if (!canViewCategory) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FontAwesomeIcon icon={faBed} className="text-muted mb-3" size="3x" />
            <h4 className="text-muted">Access Restricted</h4>
            <p className="text-muted">
              You do not have permission to view room category information. Please contact your administrator if you need additional access.
            </p>
          </Col>
        </Row>
      </Container>
    )
  }

  const categorySummary = useMemo(() => {
    const visibleCategories = categories || []
    const active = visibleCategories.filter((cat) => cat.status === 'active').length
    const inactive = visibleCategories.filter((cat) => cat.status === 'inactive').length

    return {
      total: meta?.total ?? visibleCategories.length,
      active,
      inactive,
    }
  }, [categories, meta])

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

  const handleDeleteCategory = (category) => {
    if (!category || !category.id) {
      error('Invalid category selected.')
      return
    }
    if (!canDeleteCategory) {
      error('You do not have permission to delete room categories')
      return
    }
    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return

    setDeleteLoading(true)
    try {
      const response = await roomService.deleteRoomCategory(categoryToDelete.id)
      if (response.success) {
        success('Room category deleted successfully')
        setShowDeleteModal(false)
        setCategoryToDelete(null)
        await fetchCategoriesWithParams()
      } else {
        error(response.message || 'Failed to delete room category')
      }
    } catch (err) {
      console.error('Error deleting room category:', err)
      error('An error occurred while deleting room category')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAddCategory = () => {
    if (!canCreateCategory) {
      error('You do not have permission to create room categories')
      return
    }
    setShowAddModal(true)
  }

  const handleAddCategorySubmit = async () => {
    if (!addFormRef.current) return

    const formData = addFormRef.current.submit()
    if (!formData) return

    setAddLoading(true)
    try {
      const response = await roomService.createRoomCategory(formData)
      if (response.success) {
        success('Room category created successfully')
        setShowAddModal(false)
        if (addFormRef.current) {
          addFormRef.current.reset?.()
        }
        await fetchCategoriesWithParams()
      } else {
        error(response.message || 'Failed to create room category')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          addFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error creating room category:', err)
      error('An error occurred while creating room category')
    } finally {
      setAddLoading(false)
    }
  }

  const handleEditCategory = (category) => {
    if (!canUpdateCategory) {
      error('You do not have permission to edit room categories')
      return
    }
    setCategoryToEdit(category)
    setShowEditModal(true)
  }

  const handleEditCategorySubmit = async () => {
    if (!editFormRef.current || !categoryToEdit) return

    const formData = editFormRef.current.submit()
    if (!formData) return

    setEditLoading(true)
    try {
      const response = await roomService.updateRoomCategory(categoryToEdit.id, formData)
      if (response.success) {
        success('Room category updated successfully')
        setShowEditModal(false)
        setCategoryToEdit(null)
        if (editFormRef.current) {
          editFormRef.current.reset?.()
        }
        await fetchCategoriesWithParams()
      } else {
        error(response.message || 'Failed to update room category')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          editFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error updating room category:', err)
      error('An error occurred while updating room category')
    } finally {
      setEditLoading(false)
    }
  }

  const sortKeyMap = {
    name: 'name',
    base_price: 'base_price',
    max_adults: 'max_adults',
    max_children: 'max_children',
    status: 'status',
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
      label: 'Category Name',
      render: (value, category) => (
        <div>
          <div className="fw-semibold text-dark" style={{ fontSize: '14px' }}>
            {category.name}
          </div>
          {category.description && (
            <small className="text-muted" style={{ fontSize: '12px' }}>
              {category.description.length > 50 
                ? category.description.substring(0, 50) + '...' 
                : category.description}
            </small>
          )}
        </div>
      ),
    },
    {
      key: 'base_price',
      label: 'Base Price',
      render: (value, category) => (
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faRupeeSign} className="text-muted me-1" />
          <span className="fw-semibold">{formatCurrency(category.base_price)}</span>
          <small className="text-muted ms-1">/night</small>
        </div>
      ),
    },
    {
      key: 'max_adults',
      label: 'Capacity',
      render: (value, category) => (
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faUsers} className="text-muted me-2" />
          <span>
            {category.max_adults} Adult{category.max_adults !== 1 ? 's' : ''}
            {category.max_children > 0 && `, ${category.max_children} Child${category.max_children !== 1 ? 'ren' : ''}`}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, category) => (
        <Badge bg={getStatusColor(category.status)} className="px-2 py-1" style={{ fontSize: '12px' }}>
          {category.status || 'active'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value, category) => (
        <span className="text-muted">
          {category.created_at ? new Date(category.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, category) => (
        <div className="d-flex gap-1 align-items-center" style={{ flexWrap: 'nowrap' }}>
          {canUpdateCategory && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleEditCategory(category)}
              title="Edit Category"
              style={{ minWidth: '32px', padding: '4px 8px' }}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          )}
          {canDeleteCategory && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteCategory(category)
              }}
              title="Delete Category"
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
              <FontAwesomeIcon icon={faBed} className="me-3 text-primary fs-4" />
              <h2 className="mb-0 text-dark">Room Categories</h2>
            </div>
            <div className="ms-auto d-flex gap-2">
              {canCreateCategory && (
                <Button variant="primary" onClick={handleAddCategory} className="text-white shadow-sm">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Category
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
                      <h4 className="mb-0">{categorySummary.total}</h4>
                      <p className="mb-0 opacity-75">Total Categories</p>
                    </div>
                    <FontAwesomeIcon icon={faBed} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} sm={6}>
              <Card className="bg-gradient-success text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{categorySummary.active}</h4>
                      <p className="mb-0 opacity-75">Active</p>
                    </div>
                    <FontAwesomeIcon icon={faBed} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} sm={6}>
              <Card className="bg-gradient-info text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{categorySummary.inactive}</h4>
                      <p className="mb-0 opacity-75">Inactive</p>
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
                  <Col md={4} sm={12}>
                    <Form.Label className="fw-semibold text-muted">Search</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white border-2 text-muted">
                        <FontAwesomeIcon icon={faSearch} />
                      </InputGroup.Text>
                      <FormControl
                        placeholder="Search by category name or description"
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
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                      ]}
                      col={12}
                      showLabel={false}
                    />
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
                        onClick={fetchCategoriesWithParams}
                      >
                        <FontAwesomeIcon icon={faRefresh} className="me-1" /> Refresh
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>

              <Table
                data={categories}
                columns={columns}
                loading={loading}
                hover
                pagination={true}
                sortable={true}
                sortableColumns={['name', 'base_price', 'max_adults', 'max_children', 'status', 'created_at']}
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
        title="Delete Room Category"
        onConfirm={confirmDeleteCategory}
        confirmText={deleteLoading ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
        maskClosable={!deleteLoading}
      >
        {categoryToDelete ? (
          <p>
            Are you sure you want to delete room category <strong>{categoryToDelete.name}</strong>? This action cannot be undone.
          </p>
        ) : (
          'Loading...'
        )}
      </Modal>

      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Room Category"
        onSubmit={handleAddCategorySubmit}
        submitText="Create Category"
        submitIcon={faPlus}
        loading={addLoading}
        loadingText="Creating..."
      >
        <RoomCategoryForm
          ref={addFormRef}
          mode="create"
        />
      </FormModal>

      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setCategoryToEdit(null)
        }}
        title="Edit Room Category"
        onSubmit={handleEditCategorySubmit}
        submitText="Update Category"
        submitIcon={faEdit}
        loading={editLoading}
        loadingText="Updating..."
      >
        <RoomCategoryForm
          ref={editFormRef}
          mode="edit"
          categoryData={categoryToEdit}
        />
      </FormModal>
    </Container>
  )
}

export default RoomCategoriesList

