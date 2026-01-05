import React from 'react'
import { Modal, Row, Col, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faWallet,
  faUser,
  faCalendarAlt,
  faBuilding,
  faMoneyBillWave,
  faFileAlt,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons'

const TransactionDetailsModal = ({ 
  visible, 
  onClose, 
  transaction 
}) => {
  if (!transaction) return null

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const transactionType = transaction.type || 'credit'
  const isCredit = transactionType === 'credit'
  const receivedAmount = transaction.received_amount !== undefined 
    ? transaction.received_amount 
    : (isCredit ? transaction.amount : 0)
  const remainingAmount = transaction.remaining_amount !== undefined 
    ? transaction.remaining_amount 
    : 0

  return (
    <Modal show={visible} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="d-flex align-items-center">
          <FontAwesomeIcon icon={faWallet} className="me-2 text-primary" />
          Transaction Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="transaction-details">
          {/* Transaction Type Badge */}
          <div className="text-center mb-4">
            <Badge 
              bg={isCredit ? 'success' : 'danger'} 
              className="px-4 py-2 fs-6"
            >
              <FontAwesomeIcon 
                icon={isCredit ? faCheckCircle : faTimesCircle} 
                className="me-2" 
              />
              {isCredit ? 'Payment Received (Credit)' : 'Refund (Debit)'}
            </Badge>
          </div>

          <Row className="g-3">
            {/* Customer Information */}
            <Col xs={12}>
              <div className="border rounded p-3 bg-light">
                <h6 className="mb-3 d-flex align-items-center">
                  <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                  Customer Information
                </h6>
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted d-block">Customer Name</small>
                    <strong>{transaction.customer_name || `Customer #${transaction.customer_id}`}</strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Customer ID</small>
                    <strong>#{transaction.customer_id}</strong>
                  </div>
                </div>
              </div>
            </Col>

            {/* Transaction Details */}
            <Col xs={12} md={6}>
              <div className="border rounded p-3">
                <h6 className="mb-3 d-flex align-items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-info" />
                  Transaction Date
                </h6>
                <div>
                  <small className="text-muted d-block">Date & Time</small>
                  <strong>{formatDate(transaction.transaction_date)}</strong>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6}>
              <div className="border rounded p-3">
                <h6 className="mb-3 d-flex align-items-center">
                  <FontAwesomeIcon icon={faBuilding} className="me-2 text-secondary" />
                  Branch
                </h6>
                <div>
                  <small className="text-muted d-block">Branch ID</small>
                  <strong>Branch #{transaction.branch_id || 'N/A'}</strong>
                </div>
              </div>
            </Col>

            {/* Amount Information */}
            <Col xs={12}>
              <div className="border rounded p-3 bg-light">
                <h6 className="mb-3 d-flex align-items-center">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-success" />
                  Amount Details
                </h6>
                <Row className="g-3">
                  <Col xs={12} md={4}>
                    <div className="text-center p-2 bg-white rounded">
                      <small className="text-muted d-block mb-1">Transaction Amount</small>
                      <strong className="text-primary fs-5">
                        {formatCurrency(transaction.amount || 0)}
                      </strong>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="text-center p-2 bg-white rounded">
                      <small className="text-muted d-block mb-1">Received Amount</small>
                      <strong className={`fs-5 ${receivedAmount > 0 ? 'text-success' : 'text-muted'}`}>
                        {receivedAmount > 0 ? formatCurrency(receivedAmount) : '-'}
                      </strong>
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="text-center p-2 bg-white rounded">
                      <small className="text-muted d-block mb-1">Remaining Amount</small>
                      <strong className={`fs-5 ${remainingAmount > 0 ? 'text-warning' : 'text-success'}`}>
                        {formatCurrency(remainingAmount)}
                      </strong>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>

            {/* Remarks */}
            {transaction.remarks && (
              <Col xs={12}>
                <div className="border rounded p-3">
                  <h6 className="mb-3 d-flex align-items-center">
                    <FontAwesomeIcon icon={faFileAlt} className="me-2 text-info" />
                    Remarks
                  </h6>
                  <p className="mb-0">{transaction.remarks}</p>
                </div>
              </Col>
            )}

            {/* Transaction ID */}
            <Col xs={12}>
              <div className="text-center text-muted">
                <small>Transaction ID: #{transaction.id}</small>
              </div>
            </Col>
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

export default TransactionDetailsModal

