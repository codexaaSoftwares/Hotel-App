import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Container, Row, Col, Button, Badge, Card, Form, InputGroup, Modal } from 'react-bootstrap'
import { SelectField, TextField } from '../../components/common/FormFields'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrash,
  faEdit,
  faPlus,
  faSearch,
  faRefresh,
  faMoneyBillWave,
  faTags,
  faCalendarAlt,
  faFilter,
} from '@fortawesome/free-solid-svg-icons'
import { Table, FormModal } from '../../components'
import ExpenseForm from '../../components/pages/expenses/ExpenseForm'
import ExpenseCategoryModal from '../../components/pages/expenses/ExpenseCategoryModal'
import expenseService from '../../services/expenseService'
import { useToast } from '../../components'
import { usePermissions, useDebounce } from '../../hooks'

const ExpensesList = () => {
  const { success, error, warning } = useToast()
  const { hasPermission } = usePermissions()

  const [expenses, setExpenses] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortState, setSortState] = useState({
    columnKey: 'expenseDate',
    sortBy: 'expense_date',
    sortDirection: 'desc',
  })

  const [categories, setCategories] = useState([])

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [expenseToEdit, setExpenseToEdit] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const addFormRef = useRef()
  const editFormRef = useRef()

  const debouncedSearch = useDebounce(searchTerm, 400)

  // Check permissions (using development bypass for now)
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
  const canCreateExpense = isDevelopment || hasPermission('create_expense')
  const canUpdateExpense = isDevelopment || hasPermission('edit_expense')
  const canDeleteExpense = isDevelopment || hasPermission('delete_expense')
  const canViewExpense = isDevelopment || hasPermission('view_expense')
  const canManageCategories = isDevelopment || hasPermission('manage_expense_category')

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await expenseService.getExpenseCategories({ limit: 1000, status: 'active' })
        if (response.success) {
          setCategories(response.data || [])
        }
      } catch (err) {
        console.error('Error loading categories:', err)
      }
    }
    fetchCategories()
  }, [])

  const loadExpenses = useCallback(async () => {
    if (!canViewExpense) {
      return
    }
    setLoading(true)
    try {
      const response = await expenseService.getExpenses({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch || undefined,
        categoryId: categoryFilter || undefined,
        paymentMethod: paymentMethodFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy: sortState.sortBy,
        sortDirection: sortState.sortDirection,
      })

      if (response && response.success) {
        setExpenses(response.data || [])
        setMeta(response.meta || null)
      } else {
        error && error(response.message || 'Failed to load expenses.')
        setExpenses([])
        setMeta(null)
      }
    } catch (err) {
      console.error('Error loading expenses:', err)
      error && error('Failed to load expenses. Please try again.')
      setExpenses([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, categoryFilter, paymentMethodFilter, startDate, endDate, sortState.sortBy, sortState.sortDirection, canViewExpense, error])

  // Load expenses
  useEffect(() => {
    if (!canViewExpense) {
      return
    }
    loadExpenses()
  }, [canViewExpense, loadExpenses])

  // Calculate summary statistics
  const expenseSummary = useMemo(() => {
    const visibleExpenses = expenses || []
    const total = visibleExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
    const today = new Date().toISOString().split('T')[0]
    const todayTotal = visibleExpenses
      .filter((exp) => exp.expenseDate === today)
      .reduce((sum, exp) => sum + (exp.amount || 0), 0)
    const thisMonth = new Date().toISOString().slice(0, 7)
    const monthTotal = visibleExpenses
      .filter((exp) => exp.expenseDate?.startsWith(thisMonth))
      .reduce((sum, exp) => sum + (exp.amount || 0), 0)

    return {
      total: meta?.total ?? 0,
      totalAmount: total,
      todayTotal,
      monthTotal,
    }
  }, [expenses, meta])

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash':
        return 'success'
      case 'upi':
        return 'primary'
      case 'bank':
        return 'info'
      default:
        return 'secondary'
    }
  }

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cash':
        return 'Cash'
      case 'upi':
        return 'UPI'
      case 'bank':
        return 'Bank Transfer'
      default:
        return method
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSortChange = (columnKey, direction) => {
    const sortKeyMap = {
      expenseDate: 'expense_date',
      amount: 'amount',
      categoryName: 'category_name',
      paymentMethod: 'payment_method',
    }
    const sortBy = sortKeyMap[columnKey] || columnKey
    setSortState({
      columnKey,
      sortBy,
      sortDirection: direction,
    })
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    loadExpenses()
  }

  const handleAdd = () => {
    if (addFormRef.current) {
      addFormRef.current.reset?.()
    }
    setShowAddModal(true)
  }

  const handleEdit = (expense) => {
    setExpenseToEdit(expense)
    setShowEditModal(true)
  }

  const handleDelete = (expense) => {
    if (!expense || !expense.id) {
      error && error('Invalid expense selected.')
      return
    }
    setExpenseToDelete(expense)
    setShowDeleteModal(true)
  }

  const handleManageCategories = () => {
    setShowCategoryModal(true)
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

  const handleAddSubmit = async () => {
    if (!addFormRef.current) return

    const formData = addFormRef.current.submit()
    if (!formData) return

    setAddLoading(true)
    try {
      const response = await expenseService.createExpense(formData)
      if (response.success) {
        success && success('Expense created successfully.')
        setShowAddModal(false)
        if (addFormRef.current) {
          addFormRef.current.reset?.()
        }
        loadExpenses()
      } else {
        error && error(response.message || 'Failed to create expense.')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          addFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error creating expense:', err)
      error && error('Failed to create expense. Please try again.')
    } finally {
      setAddLoading(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!editFormRef.current || !expenseToEdit) return

    const formData = editFormRef.current.submit()
    if (!formData) return

    setEditLoading(true)
    try {
      const response = await expenseService.updateExpense(expenseToEdit.id, formData)
      if (response.success) {
        success && success('Expense updated successfully.')
        setShowEditModal(false)
        setExpenseToEdit(null)
        if (editFormRef.current) {
          editFormRef.current.reset?.()
        }
        loadExpenses()
      } else {
        error && error(response.message || 'Failed to update expense.')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          editFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error updating expense:', err)
      error && error('Failed to update expense. Please try again.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return

    setDeleteLoading(true)
    try {
      const response = await expenseService.deleteExpense(expenseToDelete.id)
      if (response.success) {
        success && success('Expense deleted successfully.')
        setShowDeleteModal(false)
        setExpenseToDelete(null)
        loadExpenses()
      } else {
        error && error(response.message || 'Failed to delete expense.')
      }
    } catch (err) {
      console.error('Error deleting expense:', err)
      error && error('Failed to delete expense. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCategoryUpdate = async (updatedCategories) => {
    // Reload categories from API (silently - no toast message)
    try {
      const response = await expenseService.getExpenseCategories({ limit: 1000 })
      if (response.success) {
        setCategories(response.data || [])
        // No success message - modal already shows messages for actions
      }
    } catch (err) {
      console.error('Error reloading categories:', err)
    }
  }

  const columns = [
    {
      key: 'expenseDate',
      label: 'Date',
      sortable: true,
      render: (value, expense) => {
        if (!expense) return <span className="text-muted">—</span>
        return expense.expenseDate
          ? new Date(expense.expenseDate).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '—'
      },
    },
    {
      key: 'categoryName',
      label: 'Category',
      sortable: true,
      render: (value, expense) => {
        if (!expense) return <span className="text-muted">—</span>
        return <Badge bg="primary">{expense.categoryName || 'N/A'}</Badge>
      },
    },
    {
      key: 'description',
      label: 'Description',
      render: (value, expense) => {
        if (!expense) return <span className="text-muted">—</span>
        return <span>{expense.description || '—'}</span>
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value, expense) => {
        if (!expense) return <span className="text-muted">—</span>
        return (
          <span className="fw-semibold text-danger">
            ₹{expense.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </span>
        )
      },
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      sortable: true,
      render: (value, expense) => {
        if (!expense) return <span className="text-muted">—</span>
        return (
          <Badge bg={getPaymentMethodColor(expense.paymentMethod)}>
            {getPaymentMethodLabel(expense.paymentMethod)}
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, expense) => {
        if (!expense) return null
        return (
          <div className="d-flex gap-2">
            {canUpdateExpense && (
              <Button variant="outline-primary" size="sm" onClick={() => handleEdit(expense)} title="Edit">
                <FontAwesomeIcon icon={faEdit} />
              </Button>
            )}
            {canDeleteExpense && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(expense)
                }}
                title="Delete"
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  if (!canViewExpense) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-muted mb-3" size="3x" />
            <h4 className="text-muted">Access Restricted</h4>
            <p className="text-muted">
              You do not have permission to view expenses. Please contact your administrator if you need additional
              access.
            </p>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          {/* Page Header */}
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div>
              <h2 className="mb-0 text-dark">
                <FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-primary" />
                Expense Management
              </h2>
              <p className="text-muted mb-0 mt-1">Manage restaurant expenses and categories</p>
            </div>
            <div className="ms-auto d-flex gap-2">
              {canManageCategories && (
                <Button variant="outline-primary" onClick={handleManageCategories}>
                  <FontAwesomeIcon icon={faTags} className="me-2" />
                  Manage Expense Categories
                </Button>
              )}
              {canCreateExpense && (
                <Button variant="primary" onClick={handleAdd}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Expense
                </Button>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col xs={12} sm={6} md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Total Expenses</p>
                      <h3 className="mb-0">{expenseSummary.total}</h3>
                    </div>
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-primary fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Total Amount</p>
                      <h3 className="mb-0 text-danger">
                        ₹{expenseSummary.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-danger fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">Today's Expenses</p>
                      <h3 className="mb-0 text-warning">
                        ₹{expenseSummary.todayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-warning fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-1 small">This Month</p>
                      <h3 className="mb-0 text-info">
                        ₹{expenseSummary.monthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-info fs-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filters and Search */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col xs={12} md={3}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by description, reference..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                      }}
                    />
                  </InputGroup>
                </Col>
                <Col xs={12} md={2}>
                  <SelectField
                    id="categoryFilter"
                    label="Category"
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    options={[
                      { value: '', label: 'All Categories' },
                      ...categories.map((cat) => ({
                        value: cat.id.toString(),
                        label: cat.name,
                      })),
                    ]}
                    col={12}
                    showLabel={false}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <SelectField
                    id="paymentMethodFilter"
                    label="Payment Method"
                    value={paymentMethodFilter}
                    onChange={(e) => {
                      setPaymentMethodFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    options={[
                      { value: '', label: 'All Methods' },
                      { value: 'cash', label: 'Cash' },
                      { value: 'upi', label: 'UPI' },
                      { value: 'bank', label: 'Bank Transfer' },
                    ]}
                    col={12}
                    showLabel={false}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <TextField
                    id="startDate"
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setCurrentPage(1)
                    }}
                    col={12}
                    showLabel={false}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <TextField
                    id="endDate"
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setCurrentPage(1)
                    }}
                    col={12}
                    showLabel={false}
                  />
                </Col>
                <Col xs={12} md={1}>
                  <Button variant="outline-secondary" onClick={handleRefresh} className="w-100">
                    <FontAwesomeIcon icon={faRefresh} />
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Expenses Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Table
                columns={columns}
                data={expenses}
                loading={loading}
                sortable={true}
                sortableColumns={['expenseDate', 'amount', 'categoryName', 'paymentMethod']}
                onSortChange={handleSortChange}
                pagination={true}
                serverSide={true}
                meta={meta}
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={meta?.total || 0}
                onPageChange={handlePageChange}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
                emptyMessage="No expenses found. Click 'Add Expense' to create a new expense record."
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Expense Modal */}
      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Expense"
        onSubmit={handleAddSubmit}
        submitText="Create Expense"
        loading={addLoading}
        loadingText="Creating..."
        size="lg"
      >
        <ExpenseForm ref={addFormRef} mode="create" categories={categories} />
      </FormModal>

      {/* Edit Expense Modal */}
      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setExpenseToEdit(null)
        }}
        title="Edit Expense"
        onSubmit={handleEditSubmit}
        submitText="Update Expense"
        loading={editLoading}
        loadingText="Updating..."
        size="lg"
      >
        <ExpenseForm ref={editFormRef} mode="edit" expenseData={expenseToEdit} categories={categories} />
      </FormModal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          if (!deleteLoading) {
            setShowDeleteModal(false)
            setExpenseToDelete(null)
          }
        }}
        backdrop={deleteLoading ? 'static' : true}
        keyboard={!deleteLoading}
      >
        <Modal.Header closeButton={!deleteLoading}>
          <Modal.Title>Delete Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {expenseToDelete ? (
            <>
              <p>
                Are you sure you want to delete this expense record for{' '}
                <strong>₹{expenseToDelete.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>?
              </p>
              <p className="text-danger small mb-0">This action cannot be undone.</p>
            </>
          ) : (
            'Loading...'
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false)
              setExpenseToDelete(null)
            }}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleteLoading || !expenseToDelete}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Expense Category Management Modal */}
      <ExpenseCategoryModal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        categories={categories}
        onUpdate={handleCategoryUpdate}
      />
    </Container>
  )
}

export default ExpensesList

