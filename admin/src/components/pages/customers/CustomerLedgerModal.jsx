import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Modal, Row, Col, Button, Badge, Card, Form, InputGroup, Alert } from 'react-bootstrap'
import { SelectField } from '../../../components/common/FormFields'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUp,
  faArrowDown,
  faWallet,
  faSearch,
  faPlus,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { Table, FormModal } from '../../../components'
import WalletTransactionForm from './WalletTransactionForm'
import walletTransactionService from '../../../services/walletTransactionService'
import customerService from '../../../services/customerService'
import { useToast } from '../../../components'
import { usePermissions, useDebounce } from '../../../hooks'
import { PERMISSIONS } from '../../../constants/permissions'

const CustomerLedgerModal = ({ show, onHide, customerId, customer: initialCustomer }) => {
  const { success, error } = useToast()
  const { hasPermission } = usePermissions()

  const addFormRef = useRef()
  const editFormRef = useRef()

  const [customer, setCustomer] = useState(initialCustomer || null)
  const [transactions, setTransactions] = useState([])
  const [meta, setMeta] = useState(null)
  const [totals, setTotals] = useState({ totalDebit: 0, totalCredit: 0, remainingAmount: 0 })
  const [loading, setLoading] = useState(true)
  const [customerLoading, setCustomerLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [sortState, setSortState] = useState({
    columnKey: 'transactionDate',
    sortBy: 'transaction_date',
    sortDirection: 'desc',
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState(null)
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 500)

  // Fetch customer details when modal opens
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId || !show) return

      try {
        setCustomerLoading(true)
        const response = await customerService.getCustomerById(customerId)
        if (response.success) {
          setCustomer(response.data)
        } else {
          error(response.message || 'Failed to load customer details.')
        }
      } catch (err) {
        console.error('Error fetching customer:', err)
        error('Failed to load customer details. Please try again.')
      } finally {
        setCustomerLoading(false)
      }
    }

    fetchCustomer()
  }, [customerId, show, error])

  // Fetch transactions
  const fetchTransactions = useMemo(
    () => async () => {
      if (!customerId || !show) return

      try {
        setLoading(true)
        const params = {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch || undefined,
          transaction_type: transactionTypeFilter || undefined,
          sort_by: sortState.sortBy,
          sort_direction: sortState.sortDirection,
        }

        const response = await walletTransactionService.getCustomerLedger(customerId, params)
        if (response.success) {
          setTransactions(response.data || [])
          setMeta(response.meta)
          if (response.totals) {
            setTotals(response.totals)
          }
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
      customerId,
      show,
      currentPage,
      pageSize,
      debouncedSearch,
      transactionTypeFilter,
      sortState.sortBy,
      sortState.sortDirection,
      error,
    ]
  )

  useEffect(() => {
    if (show && customerId) {
      fetchTransactions()
    }
  }, [show, customerId, fetchTransactions])

  // Reset state when modal closes
  useEffect(() => {
    if (!show) {
      setSearchTerm('')
      setTransactionTypeFilter('')
      setCurrentPage(1)
      setTransactions([])
      setMeta(null)
      setTotals({ totalDebit: 0, totalCredit: 0, remainingAmount: 0 })
    }
  }, [show])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleSortChange = (columnKey, sortBy, sortDirection) => {
    const sortKeyMap = {
      transactionDate: 'transaction_date',
      amount: 'amount',
      transactionType: 'transaction_type',
      createdAt: 'created_at',
    }
    setSortState({
      columnKey,
      sortBy: sortKeyMap[columnKey] || sortBy,
      sortDirection,
    })
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

  const handleEdit = (transaction) => {
    setTransactionToEdit(transaction)
    setShowEditModal(true)
  }

  const handleDelete = (transaction) => {
    setTransactionToDelete(transaction)
    setShowDeleteModal(true)
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

  const handleAddSubmit = async (formData) => {
    if (!customerId) return

    try {
      setAddLoading(true)
      const transactionData = {
        ...formData,
        customer_id: parseInt(customerId),
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
        const customerResponse = await customerService.getCustomerById(customerId)
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
        const customerResponse = await customerService.getCustomerById(customerId)
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
        const customerResponse = await customerService.getCustomerById(customerId)
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
            <small className="text-muted">
              {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </small>
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
        const isCredit = transaction.transactionType === 'credit'
        return (
          <span
            className={`fw-bold fs-6 ${isCredit ? 'text-success' : 'text-danger'}`}
          >
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
          <span
            className={
              balance >= 0 ? 'text-success fw-bold fs-6' : 'text-danger fw-bold fs-6'
            }
          >
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
                title="Edit transaction"
              >
                <FontAwesomeIcon icon={faEdit} />
              </Button>
            )}
            {hasPermission(PERMISSIONS.WALLET_TRANSACTION_DELETE) && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDelete(transaction)}
                title="Delete transaction"
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  if (!show) return null

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="xl"
        fullscreen="lg-down"
        backdrop="static"
        keyboard={false}
        className="modal-xl-large"
      >
        <Modal.Header closeButton>
          <div className="d-flex align-items-center justify-content-between w-100 me-3">
            <Modal.Title>
              <div>
                <div>Customer Ledger</div>
                {customer && (
                  <div className="text-muted small mt-1">
                    <span className="fw-semibold">{customer.name}</span>
                    {customer.customerCode && (
                      <span className="ms-2 text-primary">{customer.customerCode}</span>
                    )}
                  </div>
                )}
              </div>
            </Modal.Title>
            {hasPermission(PERMISSIONS.WALLET_TRANSACTION_CREATE) && customer && (
              <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Add Transaction
              </Button>
            )}
          </div>
        </Modal.Header>
      <Modal.Body style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', padding: '1.5rem' }}>
        {customerLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : customer ? (
          <>
            {/* Transaction Type Info */}
            <Alert variant="info" className="mb-4">
              <div className="d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faWallet} className="text-primary" />
                <div>
                  <Badge bg="success" className="me-2">
                    <FontAwesomeIcon icon={faArrowUp} className="me-1" />
                    Credit
                  </Badge>
                  <span className="text-dark me-3">Customer pays money OR Hotel refunds</span>
                  <Badge bg="danger" className="me-2">
                    <FontAwesomeIcon icon={faArrowDown} className="me-1" />
                    Debit
                  </Badge>
                  <span className="text-dark">Customer owes money (bills/usage)</span>
                </div>
              </div>
            </Alert>

            {/* Customer Summary Cards - Calculated from Backend */}
            <Row className="mb-4">
              <Col md={4}>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <div className="text-muted small mb-1">Total Debit Amount So Far</div>
                        <div className="h4 mb-0 fw-bold text-danger">
                          ₹{totals.totalDebit.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faArrowDown} className="text-danger fs-2" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <div className="text-muted small mb-1">Total Credit Amount So Far</div>
                        <div className="h4 mb-0 fw-bold text-success">
                          ₹{totals.totalCredit.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <FontAwesomeIcon icon={faArrowUp} className="text-success fs-2" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <div className="text-muted small mb-1">Remaining Amount</div>
                        <div
                          className={`h4 mb-0 fw-bold ${
                            totals.remainingAmount > 0 ? 'text-danger' : 'text-success'
                          }`}
                        >
                          ₹{totals.remainingAmount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-muted small mt-1">
                          {totals.remainingAmount > 0
                            ? 'Customer needs to pay'
                            : 'All cleared'}
                        </div>
                      </div>
                      <FontAwesomeIcon
                        icon={totals.remainingAmount > 0 ? faArrowDown : faArrowUp}
                        className={
                          totals.remainingAmount > 0 ? 'text-danger fs-2' : 'text-success fs-2'
                        }
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Filters */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <Row className="g-3">
                  <Col md={8}>
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
                  <Col md={4}>
                    <SelectField
                      id="transactionTypeFilter"
                      label="Transaction Type"
                      value={transactionTypeFilter}
                      onChange={(e) => {
                        setTransactionTypeFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                      options={[
                        { value: '', label: 'All Types' },
                        { value: 'credit', label: 'Credit' },
                        { value: 'debit', label: 'Debit' },
                      ]}
                      col={12}
                      showLabel={false}
                    />
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
          </>
        ) : (
          <Alert variant="danger">Customer not found.</Alert>
        )}
      </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

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
          customerId={parseInt(customerId)}
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
          customerId={parseInt(customerId)}
          onSubmit={handleEditSubmit}
        />
      </FormModal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false)
          setTransactionToDelete(null)
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete this transaction? This action cannot be undone and will
            update the customer balance.
          </p>
          {transactionToDelete && (
            <div className="mt-3">
              <strong>Transaction Details:</strong>
              <ul className="mt-2">
                <li>
                  Type:{' '}
                  <Badge bg={getTransactionTypeColor(transactionToDelete.transactionType)}>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CustomerLedgerModal

