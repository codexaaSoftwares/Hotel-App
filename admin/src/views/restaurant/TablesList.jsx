import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Container, Row, Col, Button, Badge, Card, Form, FormControl, InputGroup } from 'react-bootstrap'
import { SelectField } from '../../components/common/FormFields'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrash,
  faEdit,
  faPlus,
  faTable,
  faUsers,
  faSearch,
  faFilter,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons'
import { Table, Modal, FormModal } from '../../components'
import TableForm from '../../components/pages/restaurant/TableForm'
import tableService from '../../services/tableService'
import { useToast } from '../../components'
import { usePermissions, useDebounce } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const TablesList = () => {
  const { success, error, warning } = useToast()
  const { hasPermission } = usePermissions()

  const [tables, setTables] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortState, setSortState] = useState({
    columnKey: 'table_number',
    sortBy: 'table_number',
    sortDirection: 'asc',
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [tableToDelete, setTableToDelete] = useState(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [tableToEdit, setTableToEdit] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const addFormRef = useRef()
  const editFormRef = useRef()

  const debouncedSearch = useDebounce(searchTerm, 400)

  // Check permissions
  const canCreateTable = hasPermission('create_table')
  const canUpdateTable = hasPermission('edit_table')
  const canDeleteTable = hasPermission('delete_table')
  const canViewTable = hasPermission('view_table') || hasPermission(PERMISSIONS.TABLE_READ)

  const fetchTablesWithParams = useCallback(async () => {
    setLoading(true)
    const searchValue = (debouncedSearch || '').trim()
    try {
      const response = await tableService.getTables({
        page: currentPage,
        limit: pageSize,
        search: searchValue || undefined,
        status: statusFilter || undefined,
        is_active: activeFilter !== '' ? activeFilter === 'true' : undefined,
        sort_by: sortState.sortBy,
        sort_direction: sortState.sortDirection,
      })

      if (response && response.success) {
        setTables(response.data || [])
        setMeta(response.meta || null)
      } else {
        error(response.message || 'Failed to load tables')
        setTables([])
        setMeta(null)
      }
    } catch (err) {
      console.error('Error loading tables:', err)
      error('An error occurred while loading tables')
      setTables([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, activeFilter, sortState.sortBy, sortState.sortDirection, error])

  useEffect(() => {
    if (!canViewTable) {
      warning && warning('You do not have permission to view tables.', { title: 'Access limited' })
    }
  }, [canViewTable, warning])

  useEffect(() => {
    if (!canViewTable) {
      return
    }
    fetchTablesWithParams()
  }, [canViewTable, fetchTablesWithParams])

  if (!canViewTable) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FontAwesomeIcon icon={faTable} className="text-muted mb-3" size="3x" />
            <h4 className="text-muted">Access Restricted</h4>
            <p className="text-muted">
              You do not have permission to view table information. Please contact your administrator if you need additional access.
            </p>
          </Col>
        </Row>
      </Container>
    )
  }

  const tableSummary = useMemo(() => {
    const visibleTables = tables || []
    const available = visibleTables.filter((table) => table.status === 'available').length
    const occupied = visibleTables.filter((table) => table.status === 'occupied').length
    const active = visibleTables.filter((table) => table.is_active).length
    const inactive = visibleTables.filter((table) => !table.is_active).length

    return {
      total: meta?.total ?? visibleTables.length,
      available,
      occupied,
      active,
      inactive,
    }
  }, [tables, meta])

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

  const handleDeleteTable = (table) => {
    if (!table || !table.id) {
      error('Invalid table selected.')
      return
    }
    if (!canDeleteTable) {
      error('You do not have permission to delete tables')
      return
    }
    setTableToDelete(table)
    setShowDeleteModal(true)
  }

  const confirmDeleteTable = async () => {
    if (!tableToDelete) return

    setDeleteLoading(true)
    try {
      const response = await tableService.deleteTable(tableToDelete.id)
      if (response.success) {
        success('Table deleted successfully')
        setShowDeleteModal(false)
        setTableToDelete(null)
        await fetchTablesWithParams()
      } else {
        error(response.message || 'Failed to delete table')
      }
    } catch (err) {
      console.error('Error deleting table:', err)
      error('An error occurred while deleting table')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAddTable = () => {
    if (!canCreateTable) {
      error('You do not have permission to create tables')
      return
    }
    setShowAddModal(true)
  }

  const handleAddTableSubmit = async () => {
    if (!addFormRef.current) return

    const formData = addFormRef.current.submit()
    if (!formData) return

    setAddLoading(true)
    try {
      const response = await tableService.createTable(formData)
      if (response.success) {
        success('Table created successfully')
        setShowAddModal(false)
        if (addFormRef.current) {
          addFormRef.current.reset?.()
        }
        await fetchTablesWithParams()
      } else {
        error(response.message || 'Failed to create table')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          addFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error creating table:', err)
      error('An error occurred while creating table')
    } finally {
      setAddLoading(false)
    }
  }

  const handleEditTable = (table) => {
    if (!canUpdateTable) {
      error('You do not have permission to edit tables')
      return
    }
    setTableToEdit(table)
    setShowEditModal(true)
  }

  const handleEditTableSubmit = async () => {
    if (!editFormRef.current || !tableToEdit) return

    const formData = editFormRef.current.submit()
    if (!formData) return

    setEditLoading(true)
    try {
      const response = await tableService.updateTable(tableToEdit.id, formData)
      if (response.success) {
        success('Table updated successfully')
        setShowEditModal(false)
        setTableToEdit(null)
        if (editFormRef.current) {
          editFormRef.current.reset?.()
        }
        await fetchTablesWithParams()
      } else {
        error(response.message || 'Failed to update table')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          editFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error updating table:', err)
      error('An error occurred while updating table')
    } finally {
      setEditLoading(false)
    }
  }

  const sortKeyMap = {
    table_number: 'table_number',
    table_name: 'table_name',
    capacity: 'capacity',
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

  const columns = [
    {
      key: 'table_number',
      label: 'Table',
      render: (value, table) => (
        <div>
          <div className="fw-semibold text-dark" style={{ fontSize: '14px' }}>
            {table.table_number}
          </div>
          {table.table_name && (
            <small className="text-muted" style={{ fontSize: '12px' }}>{table.table_name}</small>
          )}
        </div>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (value, table) => (
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faUsers} className="text-muted me-2" />
          <span>{table.capacity} seats</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, table) => (
        <Badge bg={getStatusColor(table.status)} className="px-2 py-1" style={{ fontSize: '12px' }}>
          {table.status || 'available'}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Active',
      render: (value, table) => (
        <Badge bg={table.is_active ? 'success' : 'secondary'} className="px-2 py-1" style={{ fontSize: '12px' }}>
          {table.is_active ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value, table) => (
        <span className="text-muted">
          {table.created_at ? new Date(table.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, table) => (
        <div className="d-flex gap-1 align-items-center" style={{ flexWrap: 'nowrap' }}>
          {canUpdateTable && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleEditTable(table)}
              title="Edit Table"
              style={{ minWidth: '32px', padding: '4px 8px' }}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          )}
          {canDeleteTable && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteTable(table)
              }}
              title="Delete Table"
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
              <FontAwesomeIcon icon={faTable} className="me-3 text-primary fs-4" />
              <h2 className="mb-0 text-dark">Table Management</h2>
            </div>
            {canCreateTable && (
              <div className="ms-auto">
                <Button variant="primary" onClick={handleAddTable} className="text-white">
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Table
                </Button>
              </div>
            )}
          </div>

          <Row className="mb-4 g-3">
            <Col md={3} sm={6}>
              <Card className="bg-gradient-primary text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{tableSummary.total}</h4>
                      <p className="mb-0 opacity-75">Total Tables</p>
                    </div>
                    <FontAwesomeIcon icon={faTable} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="bg-gradient-success text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{tableSummary.available}</h4>
                      <p className="mb-0 opacity-75">Available</p>
                    </div>
                    <FontAwesomeIcon icon={faTable} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="text-white border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{tableSummary.occupied}</h4>
                      <p className="mb-0 opacity-75">Occupied</p>
                    </div>
                    <FontAwesomeIcon icon={faTable} className="fs-1 opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="bg-gradient-info text-white border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h4 className="mb-0">{tableSummary.active}</h4>
                      <p className="mb-0 opacity-75">Active Tables</p>
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
                        placeholder="Search by table number or name"
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
                        onClick={fetchTablesWithParams}
                      >
                        <FontAwesomeIcon icon={faRefresh} className="me-1" /> Refresh
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>

              <Table
                data={tables}
                columns={columns}
                loading={loading}
                hover
                pagination={true}
                sortable={true}
                sortableColumns={['table_number', 'table_name', 'capacity', 'status', 'is_active', 'created_at']}
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
        title="Delete Table"
        onConfirm={confirmDeleteTable}
        confirmText={deleteLoading ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
        maskClosable={!deleteLoading}
      >
        {tableToDelete ? (
          <p>
            Are you sure you want to delete table <strong>{tableToDelete.table_number}</strong>? This action cannot be undone.
          </p>
        ) : (
          'Loading...'
        )}
      </Modal>

      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Table"
        onSubmit={handleAddTableSubmit}
        submitText="Create Table"
        submitIcon={faPlus}
        loading={addLoading}
        loadingText="Creating..."
      >
        <TableForm
          ref={addFormRef}
          mode="create"
        />
      </FormModal>

      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setTableToEdit(null)
        }}
        title="Edit Table"
        onSubmit={handleEditTableSubmit}
        submitText="Update Table"
        submitIcon={faEdit}
        loading={editLoading}
        loadingText="Updating..."
      >
        <TableForm
          ref={editFormRef}
          mode="edit"
          tableData={tableToEdit}
        />
      </FormModal>
    </Container>
  )
}

export default TablesList

