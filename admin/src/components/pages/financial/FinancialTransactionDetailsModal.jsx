import React from 'react'
import { Modal, Row, Col, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCalendarAlt,
  faTag,
  faRupeeSign,
  faFileAlt,
  faUser,
  faClock,
} from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import { formatDate } from '../../../utils'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount || 0)
}

const FinancialTransactionDetailsModal = ({ show, onHide, transaction }) => {
  if (!transaction) return null

  const transactionType = transaction.transactionType || transaction.transaction_type || ''
  const transactionNumber = transaction.transactionNumber || transaction.transaction_number || `#${transaction.id}`
  const transactionDate = transaction.transactionDate || transaction.transaction_date
  const category = transaction.category || {}
  const amount = transaction.amount || 0
  const description = transaction.description || ''
  const createdBy = transaction.createdBy || transaction.created_by || {}
  const createdAt = transaction.createdAt || transaction.created_at
  const updatedAt = transaction.updatedAt || transaction.updated_at

  const firstName = createdBy.firstName || createdBy.first_name || ''
  const lastName = createdBy.lastName || createdBy.last_name || ''
  const createdByName = `${firstName} ${lastName}`.trim() || 'N/A'

  const getTypeBadge = () => {
    if (transactionType === 'income') {
      return <Badge bg="success" className="px-3 py-2 fs-6">Income</Badge>
    }
    return <Badge bg="danger" className="px-3 py-2 fs-6">Expense</Badge>
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Transaction Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Basic Information */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3 pb-2 border-bottom border-primary border-2">
            <FontAwesomeIcon icon={faFileAlt} className="me-3 text-primary fs-4" />
            <h4 className="mb-0 text-primary">Basic Information</h4>
          </div>
          <Row className="g-3">
            <Col md={6}>
              <div className="mb-3">
                <label className="text-muted small mb-1 d-block">Transaction Number</label>
                <div className="fw-semibold">{transactionNumber}</div>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="text-muted small mb-1 d-block">Type</label>
                <div>{getTypeBadge()}</div>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="text-muted small mb-1 d-block">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Transaction Date
                </label>
                <div className="fw-semibold">{formatDate(transactionDate)}</div>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="text-muted small mb-1 d-block">
                  <FontAwesomeIcon icon={faTag} className="me-2" />
                  Category
                </label>
                <div>
                  <Badge bg="info" className="px-2 py-1">
                    {category.name || 'N/A'}
                  </Badge>
                </div>
              </div>
            </Col>
            <Col md={12}>
              <div className="mb-3">
                <label className="text-muted small mb-1 d-block">
                  <FontAwesomeIcon icon={faRupeeSign} className="me-2" />
                  Amount
                </label>
                <div className={`h4 mb-0 fw-bold ${transactionType === 'income' ? 'text-success' : 'text-danger'}`}>
                  {transactionType === 'income' ? '+' : '-'} {formatCurrency(amount)}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Description */}
        {description && (
          <div className="mb-4">
            <div className="d-flex align-items-center mb-3 pb-2 border-bottom border-primary border-2">
              <FontAwesomeIcon icon={faFileAlt} className="me-3 text-primary fs-4" />
              <h4 className="mb-0 text-primary">Description/Notes</h4>
            </div>
            <div className="p-3 bg-light rounded border">
              <p className="mb-0">{description}</p>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3 pb-2 border-bottom border-primary border-2">
            <FontAwesomeIcon icon={faUser} className="me-3 text-primary fs-4" />
            <h4 className="mb-0 text-primary">Additional Information</h4>
          </div>
          <Row className="g-3">
            <Col md={6}>
              <div className="mb-3">
                <label className="text-muted small mb-1 d-block">Created By</label>
                <div className="fw-semibold">{createdByName}</div>
              </div>
            </Col>
            {createdAt && (
              <Col md={6}>
                <div className="mb-3">
                  <label className="text-muted small mb-1 d-block">
                    <FontAwesomeIcon icon={faClock} className="me-2" />
                    Created At
                  </label>
                  <div className="fw-semibold">{formatDate(createdAt)}</div>
                </div>
              </Col>
            )}
            {updatedAt && (
              <Col md={6}>
                <div className="mb-3">
                  <label className="text-muted small mb-1 d-block">
                    <FontAwesomeIcon icon={faClock} className="me-2" />
                    Updated At
                  </label>
                  <div className="fw-semibold">{formatDate(updatedAt)}</div>
                </div>
              </Col>
            )}
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onHide}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  )
}

FinancialTransactionDetailsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  transaction: PropTypes.object
}

export default FinancialTransactionDetailsModal
