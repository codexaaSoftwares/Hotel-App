import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Button, FormControl, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faWallet,
  faRefresh,
  faPlus,
  faEye,
  faEdit,
  faSave,
  faFilePdf,
  faTrash
} from '@fortawesome/free-solid-svg-icons'
import { Table, FormModal, Modal, useToast } from '../../components'
import paymentService from '../../services/paymentService'
import { useNavigate } from 'react-router-dom'
import PaymentDetailsModal from '../../components/pages/payments/PaymentDetailsModal'
import PaymentForm from '../../components/pages/payments/PaymentForm'
import { usePermissions } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const TransactionsList = () => {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const { hasPermission } = usePermissions()
  
  // Permission checks
  const canCreateTransaction = hasPermission
    ? hasPermission(PERMISSIONS.PAYMENT_WRITE) || hasPermission(PERMISSIONS.PAYMENT_MANAGE)
    : false
  const canEditTransaction = hasPermission
    ? hasPermission(PERMISSIONS.PAYMENT_WRITE) || hasPermission(PERMISSIONS.PAYMENT_MANAGE)
    : false
  const canDeleteTransaction = hasPermission
    ? hasPermission(PERMISSIONS.PAYMENT_DELETE) || hasPermission(PERMISSIONS.PAYMENT_MANAGE)
    : false
  const editFormRef = useRef()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const paymentsResponse = await paymentService.getPayments({ limit: 1000 })

      let rawPayments = []
      if (paymentsResponse?.success && Array.isArray(paymentsResponse.data)) {
        rawPayments = paymentsResponse.data
      } else if (Array.isArray(paymentsResponse)) {
        rawPayments = paymentsResponse
      }

      const normalizedPayments = rawPayments.map(payment => {
        const paymentType = payment.payment_type || payment.paymentType || 'credit'
        const orderInfo = payment.order || {}
        const rawOrderId = orderInfo.id ||
          payment.order_id ||
          payment.orderId ||
          orderInfo.order_id ||
          orderInfo.orderId ||
          orderInfo.order_number ||
          orderInfo.orderNumber ||
          ''
        const sanitizedOrderId = rawOrderId
          ? rawOrderId.toString().replace(/^#/, '').trim()
          : ''

        const totalAmount = Number(orderInfo.total_amount ?? orderInfo.totalAmount ?? 0)
        const paidAmount = Number(orderInfo.paid_amount ?? orderInfo.paidAmount ?? 0)
        const balanceAmount = Number(orderInfo.balance_amount ?? orderInfo.balanceAmount ?? Math.max(0, totalAmount - paidAmount))

        const customerInfo = payment.customer || {}
        const customerName = customerInfo.name ||
          `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim() ||
          payment.customer_name ||
          ''

        const paymentNumber = payment.paymentNumber ||
          payment.payment_number ||
          (payment.id ? `#PAY${String(payment.id).padStart(3, '0')}` : '-')

        return {
          ...payment,
          paymentNumber,
          orderId: sanitizedOrderId,
          orderNumber: orderInfo.order_number ||
            orderInfo.orderNumber ||
            payment.order_number ||
            payment.orderNumber ||
            sanitizedOrderId ||
            '-',
          customerName,
          customer_id: payment.customer_id || payment.customerId || customerInfo.id || null,
          totalAmount,
          paidAmount,
          remainingAmount: balanceAmount >= 0 ? balanceAmount : 0,
          paymentAmount: Number(payment.amount ?? payment.paymentAmount ?? 0),
          paymentDate: payment.payment_date || payment.paymentDate,
          paymentMethod: payment.payment_method || payment.paymentMethod || 'cash',
          payment_type: paymentType,
          paymentType
        }
      })

      setPayments(normalizedPayments)
    } catch (error) {
      console.error('Error loading payments:', error)
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      })
      // Set empty array on error to prevent map errors
      setPayments([])
      // Optionally show error toast/notification here
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(payment => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = !term ||
      payment.remarks?.toLowerCase().includes(term) ||
      payment.customerName?.toLowerCase().includes(term) ||
      payment.orderNumber?.toString().toLowerCase().includes(term) ||
      payment.paymentMethod?.toLowerCase().includes(term) ||
      payment.paymentType?.toLowerCase().includes(term)
    return matchesSearch
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewTransaction = (payment) => {
    setSelectedPayment(payment)
    setShowViewModal(true)
  }

  const handleExportTransaction = async (payment) => {
    try {
      const paymentId = payment.id || payment.paymentId
      const result = await paymentService.exportTransactionPdf(paymentId)
      if (result.success) {
        success('Transaction PDF exported successfully')
      } else {
        showError(result.message || 'Failed to export PDF')
      }
    } catch (err) {
      console.error('Error exporting transaction PDF:', err)
      showError('An error occurred while exporting PDF')
    }
  }

  const handleDeletePayment = (payment) => {
    setPaymentToDelete(payment)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setPaymentToDelete(null)
  }

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return
    const paymentId = paymentToDelete.id || paymentToDelete.paymentId
    if (!paymentId) {
      showError('Unable to determine payment ID for deletion')
      return
    }

    try {
      setDeleteLoading(true)
      const response = await paymentService.deletePayment(paymentId)
      if (response.success) {
        success('Payment deleted successfully')
        closeDeleteModal()
        await loadTransactions()
      } else {
        showError(response.message || 'Failed to delete payment')
      }
    } catch (error) {
      console.error('Error deleting payment:', error)
      showError('An error occurred while deleting payment')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleEditSubmit = async (formData) => {
    if (!selectedPayment) return
    try {
      setLoading(true)
      const response = await paymentService.updatePayment(selectedPayment.id, formData)
      if (response.success) {
        await loadTransactions()
        setShowEditModal(false)
        setSelectedPayment(null)
        success('Payment updated successfully')
      } else {
        showError(response.message || 'Failed to update payment')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      showError('An error occurred while updating payment')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'paymentNumber',
      label: 'Payment #',
      render: (value, payment) => (
        <div className="fw-semibold text-primary">
          {payment.paymentNumber || payment.payment_number || (payment.id ? `#PAY${String(payment.id).padStart(3, '0')}` : '-')}
        </div>
      )
    },
    {
      key: 'paymentDate',
      label: 'Payment Date',
      render: (value, payment) => formatDate(payment.paymentDate)
    },
    {
      key: 'orderNumber',
      label: 'Order',
      render: (value, payment) => (
        <div>
          <div className="fw-semibold">#{payment.orderNumber || payment.orderId || '-'}</div>
          {payment.customerName && (
            <small className="text-muted">{payment.customerName}</small>
          )}
        </div>
      )
    },
    {
      key: 'paymentType',
      label: 'Type',
      render: (value, payment) => (
        <Badge bg={payment.paymentType === 'debit' ? 'warning' : 'success'}>
          {payment.paymentType === 'debit' ? 'Debit' : 'Credit'}
        </Badge>
      )
    },
    {
      key: 'paymentAmount',
      label: 'Payment Amount',
      render: (value, payment) => {
        const formattedAmount = formatCurrency(payment.paymentAmount || payment.amount)
        return (
          <div className={`fw-semibold ${payment.paymentType === 'debit' ? 'text-danger' : 'text-success'}`}>
            {payment.paymentType === 'debit' ? `-${formattedAmount}` : formattedAmount}
          </div>
        )
      }
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (value, payment) => payment.paymentMethod
        ? payment.paymentMethod.toString().replace(/_/g, ' ').toUpperCase()
        : 'N/A'
    },
    {
      key: 'remainingAmount',
      label: 'Remaining Amount',
      render: (value, payment) => (
        <div className={`fw-semibold ${payment.remainingAmount > 0 ? 'text-warning' : 'text-success'}`}>
          {payment.remainingAmount !== null && payment.remainingAmount !== undefined
            ? formatCurrency(payment.remainingAmount)
            : '-'}
        </div>
      )
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (value, payment) => payment.remarks || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, payment) => (
        <div className="d-flex gap-1" style={{ flexWrap: 'nowrap' }}>
          <Button
            variant="outline-info"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleViewTransaction(payment)
            }}
            title="View Payment"
          >
            <FontAwesomeIcon icon={faEye} />
          </Button>
          {canEditTransaction && (
            <Button
              variant="outline-success"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedPayment(payment)
                setShowEditModal(true)
              }}
              title="Edit Payment"
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          )}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleExportTransaction(payment)
            }}
            title="Export Transaction PDF"
          >
            <FontAwesomeIcon icon={faFilePdf} />
          </Button>
          {canDeleteTransaction && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDeletePayment(payment)
              }}
              title="Delete Transaction"
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </div>
      )
    }
  ]

  const sortableColumns = ['paymentDate', 'orderNumber', 'paymentAmount']

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faWallet} className="me-3 text-dark fs-4" />
              <h2 className="mb-0 text-dark">Transactions</h2>
            </div>
            <div className="ms-auto d-flex gap-2">
              {canCreateTransaction && (
                <Button variant="primary" onClick={() => navigate('/transactions/create')}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Payment
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3 shadow-sm p-4">
            <div className="mb-4">
              <Row className="g-3">
                <Col md={6}>
                  <FormControl
                    placeholder="Search by customer name or remarks"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-2"
                  />
                </Col>
                <Col md={2}>
                  <Button variant="outline-secondary" onClick={loadTransactions}>
                    <FontAwesomeIcon icon={faRefresh} className="me-2" />
                    Refresh
                  </Button>
                </Col>
              </Row>
            </div>

            <Table
              data={filteredPayments}
              columns={columns}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              sortableColumns={sortableColumns}
              loading={loading}
              pagination={true}
            />
          </div>
        </Col>
      </Row>

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        visible={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedPayment(null)
        }}
        payment={selectedPayment}
      />

      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedPayment(null)
        }}
        title="Edit Payment"
        onSubmit={() => editFormRef.current?.handleSubmit()}
        submitText="Update Payment"
        submitIcon={faSave}
        loading={loading}
        loadingText="Updating..."
        size="lg"
      >
        <PaymentForm
          ref={editFormRef}
          mode="edit"
          paymentData={selectedPayment}
          initialOrderId={selectedPayment?.orderId}
          initialAmount={selectedPayment?.paymentAmount || selectedPayment?.amount}
          onSubmit={handleEditSubmit}
        />
      </FormModal>

      <Modal
        visible={showDeleteModal}
        onClose={closeDeleteModal}
        title="Delete Transaction"
        onConfirm={confirmDeletePayment}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      >
        <p>
          Are you sure you want to delete transaction{' '}
          <strong>{paymentToDelete?.payment_number || paymentToDelete?.paymentNumber || ''}</strong>?
        </p>
        <p className="text-muted mb-0">This action cannot be undone.</p>
      </Modal>
    </Container>
  )
}

export default TransactionsList

