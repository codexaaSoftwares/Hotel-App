import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Button, Badge, Card, Form, FormSelect, InputGroup, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faRefresh,
  faArrowUp,
  faArrowDown,
  faWallet,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons'
import { Table, Modal, FormModal } from '../../components'
import WalletTransactionForm from '../../components/pages/customers/WalletTransactionForm'
import walletTransactionService from '../../services/walletTransactionService'
import customerService from '../../services/customerService'
import { useToast } from '../../components'
import { usePermissions, useDebounce } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const CustomerLedger = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { hasPermission } = usePermissions()

  const [customer, setCustomer] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [customerLoading, setCustomerLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [sortState, setSortState] = useState({
    columnKey: 'transactionDate',
    sortBy: 'transaction_date',
    sortDirection: 'desc',
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const addFormRef = useRef()
  const editFormRef = useRef()

  const debouncedSearch = useDebounce(searchTerm, 500)

  // Fetch customer details
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setCustomerLoading(true)
        const response = await customerService.getCustomerById(id)
        if (response.success) {
          setCustomer(response.data)
        } else {
          error(response.message || 'Failed to load customer details.')
          navigate('/customers')
        }
      } catch (err) {
        console.error('Error fetching customer:', err)
        error('Failed to load customer details. Please try again.')
        navigate('/customers')
      } finally {
        setCustomerLoading(false)
      }
    }

    if (id) {
      fetchCustomer()
    }
  }, [id, navigate, error])

  // Fetch transactions
  const fetchTransactions = useMemo(
    () => async () => {
      if (!id) return

      try {
        setLoading(true)
        const params = {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch || undefined,
          transaction_type: transactionTypeFilter || undefined,
          payment_method: paymentMethodFilter || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          sort_by: sortState.sortBy,
          sort_direction: sortState.sortDirection,
        }

        const response = await walletTransactionService.getCustomerLedger(id, params)
        if (response.success) {
          setTransactions(response.data || [])
          setMeta(response.meta)
          if (response.customer) {
            setCustomer(response.customer)
          }
        } else {
          error(response.message || 'Failed to load transactions.')
          setTransactions([])
        }
      } catch (err) {
        console.error('Error fetching transactions:', err)
        error('Failed to load transactions. Please try again.')
        setTransactions([])
      } finally {
        setLoading(false)
      }
    },
    [
      id,
      currentPage,
      pageSize,
      debouncedSearch,
      transactionTypeFilter,
      paymentMethodFilter,
      startDate,
      endDate,
      sortState.sortBy,
      sortState.sortDirection,
      error,
    ]
  )

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleSortChange = (columnKey, sortBy, sortDirection) => {
    setSortState({ columnKey, sortBy, sortDirection })
    setCurrentPage(1)
  }

  const handleAddSubmit = async (formData) => {
    try {
      setAddLoading(true)
      const transactionData = {
        ...formData,
        customer_id: parseInt(id),
      }
      const response = await walletTransactionService.createWalletTransaction(transactionData)
      if (response.success) {
        success('Transaction added successfully.')
        setShowAddModal(false)
        if (addFormRef.current) {
          addFormRef.current.reset?.()
        }
        fetchTransactions()
        // Refresh customer to get updated balance
        const customerResponse = await customerService.getCustomerById(id)
        if (customerResponse.success) {
          setCustomer(customerResponse.data)
        }
      } else {
        error(response.message || 'Failed to add transaction.')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          addFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error adding transaction:', err)
      error('Failed to add transaction. Please try again.')
    } finally {
      setAddLoading(false)
    }
  }

  const handleEditSubmit = async (formData) => {
    if (!transactionToEdit) return

    try {
      setEditLoading(true)
      const response = await walletTransactionService.updateWalletTransaction(
        transactionToEdit.id,
        formData
      )
      if (response.success) {
        success('Transaction updated successfully.')
        setShowEditModal(false)
        setTransactionToEdit(null)
        if (editFormRef.current) {
          editFormRef.current.reset?.()
        }
        fetchTransactions()
        // Refresh customer to get updated balance
        const customerResponse = await customerService.getCustomerById(id)
        if (customerResponse.success) {
          setCustomer(customerResponse.data)
        }
      } else {
        error(response.message || 'Failed to update transaction.')
        if (response.errors) {
          const transformedErrors = transformErrors(response.errors)
          editFormRef.current?.setErrors?.(transformedErrors)
        }
      }
    } catch (err) {
      console.error('Error updating transaction:', err)
      error('Failed to update transaction. Please try again.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return

    try {
      const response = await walletTransactionService.deleteWalletTransaction(
        transactionToDelete.id
      )
      if (response.success) {
        success('Transaction deleted successfully.')
        setShowDeleteModal(false)
        setTransactionToDelete(null)
        fetchTransactions()
        // Refresh customer to get updated balance
        const customerResponse = await customerService.getCustomerById(id)
        if (customerResponse.success) {
          setCustomer(customerResponse.data)
        }
      } else {
        error(response.message || 'Failed to delete transaction.')
      }
    } catch (err) {
      console.error('Error deleting transaction:', err)
      error('Failed to delete transaction. Please try again.')
    }
  }

  const transformErrors = (errors) => {
    if (!errors) return {}
    const transformed = {}
    Object.keys(errors).forEach((key) => {
      const errorArray = errors[key]
      if (Array.isArray(errorArray) && errorArray.length > 0) {
        transformed[key] = errorArray[0]
      } else {
        transformed[key] = errorArray
      }
    })
    return transformed
  }

  const handleEdit = (transaction) => {
    setTransactionToEdit(transaction)
    setShowEditModal(true)
  }

  const handleDelete = (transaction) => {
    setTransactionToDelete(transaction)
    setShowDeleteModal(true)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setTransactionTypeFilter('')
    setPaymentMethodFilter('')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  const getTransactionTypeColor = (type) => {
    return type === 'credit' ? 'success' : 'danger'
  }

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: 'Cash',
      upi: 'UPI',
      card: 'Card',
      bank_transfer: 'Bank Transfer',
    }
    return labels[method] || method
  }

  const sortKeyMap = {
    transactionDate: 'transaction_date',
    amount: 'amount',
    transactionType: 'transaction_type',
    createdAt: 'created_at',
  }

  const columns = [
    {
      key: 'transactionDate',
      label: 'Date',
      sortable: true,
      render: (value, transaction) => {
        if (!transaction) return <span className="text-muted">—</span>
        const date = transaction.transactionDate
          ? new Date(transaction.transactionDate)
          : null
        return date ? (
          <div>
            <div className="fw-semibold">{date.toLocaleDateString('en-IN')}</div>
            <small className="text-muted">{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</small>
          </div>
        ) : (
          <span className="text-muted">—</span>
        )
      },
    },
    {
      key: 'details',
      label: 'Method + Description + Ref',
      render: (value, transaction) => {
        if (!transaction) return <span className="text-muted">—</span>
        return (
          <div>
            {transaction.paymentMethod && (
              <div className="mb-1">
                <Badge bg="secondary" className="me-2">
                  {getPaymentMethodLabel(transaction.paymentMethod)}
                </Badge>
                <Badge bg={getTransactionTypeColor(transaction.transactionType)}>
                  {transaction.transactionType === 'credit' ? (
                    <>
                      <FontAwesomeIcon icon={faArrowUp} className="me-1" />
                      Credit
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faArrowDown} className="me-1" />
                      Debit
                    </>
                  )}
                </Badge>
              </div>
            )}
            {transaction.description && (
              <div className="text-dark mb-1">{transaction.description}</div>
            )}
            {transaction.referenceNumber && (
              <small className="text-muted">
                <strong>Ref:</strong> {transaction.referenceNumber}
              </small>
            )}
            {!transaction.description && !transaction.referenceNumber && (
              <span className="text-muted">—</span>
            )}
          </div>
        )
      },
    },
    {
      key: 'bill',
      label: 'Bill',
      render: (value, transaction) => {
        if (!transaction) return <span className="text-muted">—</span>
        return transaction.bill?.billNumber ? (
          <span className="text-primary fw-semibold">{transaction.bill.billNumber}</span>
        ) : (
          <span className="text-muted">—</span>
        )
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value, transaction) => {
        if (!transaction) return <span className="text-muted">—</span>
        const amount = parseFloat(transaction.amount || 0)
        return (
          <span className="fw-bold fs-6">
            ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        )
      },
    },
    {
      key: 'runningBalance',
      label: 'Balance',
      render: (value, transaction) => {
        if (!transaction) return <span className="text-muted">—</span>
        const balance = parseFloat(transaction.runningBalance ?? 0)
        return (
          <span className={balance >= 0 ? 'text-success fw-bold fs-6' : 'text-danger fw-bold fs-6'}>
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, transaction) => {
        if (!transaction) return null
        return (
          <div className="d-flex gap-2">
            {hasPermission(PERMISSIONS.WALLET_TRANSACTION_EDIT) && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleEdit(transaction)}
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
            )}
            {hasPermission(PERMISSIONS.WALLET_TRANSACTION_DELETE) && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDelete(transaction)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  if (customerLoading) {
    return (
      <Container fluid>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    )
  }

  if (!customer) {
    return (
      <Container fluid>
        <Alert variant="danger">Customer not found.</Alert>
      </Container>
    )
  }

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center gap-3">
              <Button variant="outline-secondary" onClick={() => navigate('/customers')}>
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Back
              </Button>
              <div>
                <h2 className="mb-0 text-dark">Customer Ledger</h2>
                <div className="text-muted">
                  <span className="fw-semibold">{customer.name}</span>
                  {customer.customerCode && (
                    <span className="ms-2 text-primary">{customer.customerCode}</span>
                  )}
                </div>
              </div>
            </div>
            {hasPermission(PERMISSIONS.WALLET_TRANSACTION_CREATE) && (
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Add Transaction
              </Button>
            )}
          </div>

          {/* Transaction Type Info */}
          <Alert variant="info" className="mb-4">
            <div className="d-flex align-items-start gap-3">
              <FontAwesomeIcon icon={faWallet} className="mt-1 text-primary" />
              <div className="flex-grow-1">
                <strong className="d-block mb-2">Transaction Types Explained:</strong>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Badge bg="success" className="me-2">
                      <FontAwesomeIcon icon={faArrowUp} className="me-1" />
                      Credit
                    </Badge>
                    <span className="text-dark">Payment received from customer (increases balance)</span>
                  </div>
                  <div className="col-md-6">
                    <Badge bg="danger" className="me-2">
                      <FontAwesomeIcon icon={faArrowDown} className="me-1" />
                      Debit
                    </Badge>
                    <span className="text-dark">Refund or adjustment given to customer (decreases balance)</span>
                  </div>
                </div>
              </div>
            </div>
          </Alert>

          {/* Customer Summary Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small">Total Amount</div>
                      <div className="h4 mb-0 fw-bold">
                        ₹{parseFloat(customer.totalAmount || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <FontAwesomeIcon icon={faWallet} className="text-primary fs-3" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small">Paid Amount</div>
                      <div className="h4 mb-0 fw-bold text-success">
                        ₹{parseFloat(customer.paidAmount || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <FontAwesomeIcon icon={faArrowUp} className="text-success fs-3" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small">Remaining Balance</div>
                      <div
                        className={`h4 mb-0 fw-bold ${
                          parseFloat(customer.remainingAmount || 0) > 0
                            ? 'text-danger'
                            : 'text-success'
                        }`}
                      >
                        ₹{parseFloat(customer.remainingAmount || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <FontAwesomeIcon
                      icon={faArrowDown}
                      className={
                        parseFloat(customer.remainingAmount || 0) > 0
                          ? 'text-danger fs-3'
                          : 'text-success fs-3'
                      }
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small">Total Bills</div>
                      <div className="h4 mb-0 fw-bold">
                        {customer.totalBills || 0}
                      </div>
                    </div>
                    <FontAwesomeIcon icon={faWallet} className="text-info fs-3" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col md={3}>
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
                <Col md={2}>
                  <FormSelect
                    value={transactionTypeFilter}
                    onChange={(e) => {
                      setTransactionTypeFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </FormSelect>
                </Col>
                <Col md={2}>
                  <FormSelect
                    value={paymentMethodFilter}
                    onChange={(e) => {
                      setPaymentMethodFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option value="">All Methods</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </FormSelect>
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="date"
                    placeholder="Start Date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="date"
                    placeholder="End Date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </Col>
                <Col md={1}>
                  <Button variant="outline-secondary" onClick={handleClearFilters} className="w-100">
                    <FontAwesomeIcon icon={faRefresh} />
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Transactions Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Table
                columns={columns}
                data={transactions}
                loading={loading}
                sortable={true}
                sortableColumns={['transactionDate', 'amount', 'transactionType']}
                onSortChange={handleSortChange}
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={meta?.total || 0}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                serverSide={true}
                meta={meta}
                sortBy={sortState.sortBy}
                sortDirection={sortState.sortDirection}
                emptyMessage="No transactions found"
              />
            </Card.Body>
          </Card>

          {/* Add Transaction Modal */}
          <FormModal
            visible={showAddModal}
            onClose={() => {
              setShowAddModal(false)
              if (addFormRef.current) {
                addFormRef.current.reset?.()
              }
            }}
            title="Add Transaction"
            onSubmit={() => {
              const formData = addFormRef.current?.submit()
              if (formData) {
                handleAddSubmit(formData)
              }
            }}
            loading={addLoading}
            submitLabel="Add Transaction"
          >
            <WalletTransactionForm
              ref={addFormRef}
              mode="create"
              customerId={parseInt(id)}
              onSubmit={handleAddSubmit}
            />
          </FormModal>

          {/* Edit Transaction Modal */}
          <FormModal
            visible={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setTransactionToEdit(null)
              if (editFormRef.current) {
                editFormRef.current.reset?.()
              }
            }}
            title="Edit Transaction"
            onSubmit={() => {
              const formData = editFormRef.current?.submit()
              if (formData) {
                handleEditSubmit(formData)
              }
            }}
            loading={editLoading}
            submitLabel="Update Transaction"
          >
            <WalletTransactionForm
              ref={editFormRef}
              mode="edit"
              transactionData={transactionToEdit}
              customerId={parseInt(id)}
              onSubmit={handleEditSubmit}
            />
          </FormModal>

          {/* Delete Confirmation Modal */}
          <Modal
            visible={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false)
              setTransactionToDelete(null)
            }}
            title="Delete Transaction"
            onSubmit={handleDeleteConfirm}
            submitLabel="Delete"
            submitVariant="danger"
          >
            <p>
              Are you sure you want to delete this transaction? This action cannot be undone and
              will update the customer balance.
            </p>
            {transactionToDelete && (
              <div className="mt-3">
                <strong>Transaction Details:</strong>
                <ul className="mt-2">
                  <li>
                    Type: <Badge bg={getTransactionTypeColor(transactionToDelete.transactionType)}>
                      {transactionToDelete.transactionType}
                    </Badge>
                  </li>
                  <li>
                    Amount: ₹
                    {parseFloat(transactionToDelete.amount || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </li>
                </ul>
              </div>
            )}
          </Modal>
        </Col>
      </Row>
    </Container>
  )
}

export default CustomerLedger

