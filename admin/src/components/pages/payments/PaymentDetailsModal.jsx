import React from 'react'
import { Modal, Row, Col, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCreditCard,
  faShoppingCart,
  faCalendarAlt,
  faUser,
  faMoneyBill,
  faWallet,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons'

const PaymentDetailsModal = ({ visible, onClose, payment }) => {
  if (!payment) return null

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const paymentType = payment.payment_type || payment.paymentType || 'credit'
  const isCredit = paymentType !== 'debit'
  const paymentAmount = Number(payment.paymentAmount ?? payment.amount ?? 0)
  const paymentDateValue = payment.paymentDate || payment.payment_date
  const recordedAtValue = payment.created_at || payment.updated_at || paymentDateValue
  const totalAmount = payment.totalAmount ?? null
  const paidAmount = payment.paidAmount ?? null
  const remainingAmount = payment.remainingAmount ?? (
    totalAmount !== null && paidAmount !== null
      ? Math.max(0, totalAmount - paidAmount)
      : null
  )
  const paymentStatus = payment.status || (
    isCredit
      ? (remainingAmount === 0 ? 'paid' : 'partial')
      : 'refunded'
  )
  const paymentMethod = payment.payment_method || payment.paymentMethod || 'N/A'

  const formattedPaymentAmount = formatCurrency(paymentAmount)
  const displayPaymentAmount = isCredit ? formattedPaymentAmount : `-${formattedPaymentAmount}`

  return (
    <Modal show={visible} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="d-flex align-items-center">
          <FontAwesomeIcon icon={faCreditCard} className="me-2 text-primary" />
          Payment Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="payment-details">
          <Row className="g-3 mb-3">
            <Col xs={12}>
              <div className="border rounded p-3 bg-light d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block">Payment ID</small>
                  <strong>#{payment.id}</strong>
                </div>
                <Badge
                  bg={isCredit ? 'success' : 'warning'}
                  className="px-3 py-2 text-uppercase"
                >
                  <FontAwesomeIcon icon={faWallet} className="me-2" />
                  {isCredit ? 'Credit (Payment Received)' : 'Debit (Refund)'}
                </Badge>
              </div>
            </Col>

            <Col xs={12} md={6}>
              <div className="border rounded p-3">
                <h6 className="mb-3 d-flex align-items-center">
                  <FontAwesomeIcon icon={faShoppingCart} className="me-2 text-primary" />
                  Order Information
                </h6>
                <div className="mb-2">
                  <small className="text-muted d-block">Order Number</small>
                  <strong>#{payment.orderNumber || payment.orderId || '-'}</strong>
                </div>
                {totalAmount !== null && totalAmount !== undefined && (
                  <div className="mb-2">
                    <small className="text-muted d-block">Order Total</small>
                    <strong>{formatCurrency(totalAmount)}</strong>
                  </div>
                )}
                {paidAmount !== null && paidAmount !== undefined && (
                  <div className="mb-2">
                    <small className="text-muted d-block">Total Paid</small>
                    <strong className="text-success">{formatCurrency(paidAmount)}</strong>
                  </div>
                )}
                {remainingAmount !== null && remainingAmount !== undefined && (
                  <div>
                    <small className="text-muted d-block">Remaining Amount</small>
                    <strong className={remainingAmount > 0 ? 'text-warning' : 'text-success'}>
                      {formatCurrency(remainingAmount)}
                    </strong>
                  </div>
                )}
              </div>
            </Col>

            <Col xs={12} md={6}>
              <div className="border rounded p-3">
                <h6 className="mb-3 d-flex align-items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-info" />
                  Payment Timing
                </h6>
                <div className="mb-2">
                  <small className="text-muted d-block">Payment Date</small>
                  <strong>{formatDate(paymentDateValue)}</strong>
                </div>
                <div>
                  <small className="text-muted d-block">Recorded At</small>
                  <strong>{formatDateTime(recordedAtValue)}</strong>
                </div>
              </div>
            </Col>

            <Col xs={12}>
              <div className="border rounded p-3 bg-light">
                <h6 className="mb-3 d-flex align-items-center">
                  <FontAwesomeIcon icon={faMoneyBill} className="me-2 text-success" />
                  Payment Details
                </h6>
                <Row className="g-3">
                  <Col xs={12} md={4}>
                    <div className="p-3 bg-white rounded text-center">
                      <small className="text-muted d-block mb-1">
                        {isCredit ? 'Payment Amount' : 'Refund Amount'}
                      </small>
                      <strong className={`fs-5 ${isCredit ? 'text-primary' : 'text-danger'}`}>
                        {displayPaymentAmount}
                      </strong>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="p-3 bg-white rounded text-center">
                      <small className="text-muted d-block mb-1">Payment Method</small>
                      <strong className="text-uppercase">{paymentMethod.replace(/_/g, ' ')}</strong>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="p-3 bg-white rounded text-center">
                      <small className="text-muted d-block mb-1">Status</small>
                      <strong className={isCredit ? (remainingAmount === 0 ? 'text-success' : 'text-warning') : 'text-warning'}>
                        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                      </strong>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>

            <Col xs={12}>
              <div className="border rounded p-3">
                <h6 className="mb-3 d-flex align-items-center">
                  <FontAwesomeIcon icon={faUser} className="me-2 text-secondary" />
                  Customer
                </h6>
                <div className="row g-2">
                  <div className="col-md-6">
                    <small className="text-muted d-block">Customer Name</small>
                    <strong>{payment.customerName || 'N/A'}</strong>
                  </div>
                  {payment.customer_id && (
                    <div className="col-md-6">
                      <small className="text-muted d-block">Customer ID</small>
                      <strong>#{payment.customer_id}</strong>
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {payment.remarks && (
              <Col xs={12}>
                <div className="border rounded p-3 bg-white">
                  <h6 className="mb-3 d-flex align-items-center">
                    <FontAwesomeIcon icon={faFileAlt} className="me-2 text-info" />
                    Remarks
                  </h6>
                  <p className="mb-0">{payment.remarks}</p>
                </div>
              </Col>
            )}
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default PaymentDetailsModal

