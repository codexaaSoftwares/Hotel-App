import React, { useState, useEffect } from 'react'
import { Modal, Row, Col, Button, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faReceipt, faPrint, faTable, faUser } from '@fortawesome/free-solid-svg-icons'
import billService from '../../../services/billService'
import { useToast } from '../../../components'

const BillViewModal = ({ show, onHide, billId, onPrint }) => {
  const { error } = useToast()
  const [billDetails, setBillDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (show && billId) {
      fetchBillDetails()
    } else {
      setBillDetails(null)
    }
  }, [show, billId])

  const fetchBillDetails = async () => {
    try {
      setLoading(true)
      const response = await billService.getBillById(billId)
      if (response.success) {
        setBillDetails(response.data)
      } else {
        error(response.message || 'Failed to load bill details.')
      }
    } catch (err) {
      console.error('Error fetching bill details:', err)
      error('Failed to load bill details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'secondary',
      pending: 'warning',
      paid: 'success',
      cancelled: 'danger',
    }
    return colors[status] || 'secondary'
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      partial: 'info',
      paid: 'success',
    }
    return colors[status] || 'secondary'
  }

  const handlePrint = () => {
    if (billDetails && onPrint) {
      onPrint(billDetails)
    }
  }

  const items = billDetails?.items || billDetails?.billItems || []
  const subtotal = parseFloat(billDetails?.subtotal || 0)
  const cgstAmount = parseFloat(billDetails?.cgstAmount || billDetails?.cgst_amount || 0)
  const sgstAmount = parseFloat(billDetails?.sgstAmount || billDetails?.sgst_amount || 0)
  const serviceTaxAmount = parseFloat(billDetails?.serviceTaxAmount || billDetails?.service_tax_amount || 0)
  const discount = parseFloat(billDetails?.discount || 0)
  const totalAmount = parseFloat(billDetails?.totalAmount || billDetails?.total_amount || 0)
  const paidAmount = parseFloat(billDetails?.paidAmount || billDetails?.paid_amount || 0)
  const remainingAmount = parseFloat(billDetails?.remainingAmount || billDetails?.remaining_amount || 0)

  return (
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
        <Modal.Title>
          <FontAwesomeIcon icon={faReceipt} className="me-2" />
          Bill Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', padding: '1.5rem' }}>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : billDetails ? (
          <div>
            {/* Bill Information */}
            <div className="mb-4 pb-3 border-bottom">
              <h5 className="mb-3">Bill Information</h5>
              <Row className="mb-2">
                <Col md={6}>
                  <div className="mb-2">
                    <strong>Bill Number:</strong>
                    <div className="text-primary fw-semibold">
                      {billDetails.billNumber || billDetails.bill_number || `#BILL${billDetails.id}`}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-2">
                    <strong>Date & Time:</strong>
                    <div>
                      {new Date(billDetails.billDate || billDetails.bill_date).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <div className="mb-2">
                    <strong>Status:</strong>
                    <div>
                      <Badge bg={getStatusColor(billDetails.status)} className="fs-6">
                        {billDetails.status?.toUpperCase() || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-2">
                    <strong>Payment Status:</strong>
                    <div>
                      <Badge bg={getPaymentStatusColor(billDetails.paymentStatus || billDetails.payment_status)} className="fs-6">
                        {(billDetails.paymentStatus || billDetails.payment_status)?.toUpperCase() || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Table & Customer Information */}
            <div className="mb-4 pb-3 border-bottom">
              <h5 className="mb-3">Table & Customer</h5>
              <Row className="mb-2">
                <Col md={6}>
                  <div className="mb-2">
                    <strong>Table:</strong>
                    <div>
                      {billDetails.table ? (
                        <>
                          <FontAwesomeIcon icon={faTable} className="me-1 text-muted" />
                          {billDetails.table.tableNumber || billDetails.table.table_number || 'N/A'}
                          {billDetails.table.tableName && (
                            <span className="text-muted ms-1">({billDetails.table.tableName})</span>
                          )}
                          {billDetails.table.capacity && (
                            <small className="text-muted ms-1">- {billDetails.table.capacity} seats</small>
                          )}
                        </>
                      ) : (
                        <Badge bg="secondary">Takeaway</Badge>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-2">
                    <strong>Customer:</strong>
                    <div>
                      {billDetails.customer ? (
                        <>
                          <FontAwesomeIcon icon={faUser} className="me-1 text-muted" />
                          {billDetails.customer.name || 'N/A'}
                          {billDetails.customer.customerCode && (
                            <Badge bg="info" className="ms-2">{billDetails.customer.customerCode}</Badge>
                          )}
                          {billDetails.customer.customerType && (
                            <Badge bg={billDetails.customer.customerType === 'credit' ? 'warning' : 'success'} className="ms-1">
                              {billDetails.customer.customerType === 'credit' ? 'Credit' : 'Regular'}
                            </Badge>
                          )}
                          {billDetails.customer.mobile && (
                            <div className="text-muted small mt-1">
                              <FontAwesomeIcon icon={faUser} className="me-1" />
                              {billDetails.customer.mobile}
                            </div>
                          )}
                          {billDetails.customer.email && (
                            <div className="text-muted small">
                              {billDetails.customer.email}
                            </div>
                          )}
                        </>
                      ) : (
                        <Badge bg="secondary">Walk-in Customer</Badge>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Items Table with Summary on Right */}
            {items.length > 0 && (
              <div className="mb-4">
                <h5 className="mb-3">Items ({items.length})</h5>
                <Row>
                  <Col md={8}>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '5%' }}>#</th>
                            <th>Item Name</th>
                            <th className="text-end" style={{ width: '12%' }}>Qty</th>
                            <th className="text-end" style={{ width: '18%' }}>Unit Price</th>
                            <th className="text-end" style={{ width: '18%' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr key={item.id || idx}>
                              <td>{idx + 1}</td>
                              <td>
                                {item.itemName || item.item_name}
                                {item.notes && (
                                  <div className="text-muted small mt-1">
                                    <em>Note: {item.notes}</em>
                                  </div>
                                )}
                              </td>
                              <td className="text-end">{item.quantity}</td>
                              <td className="text-end">
                                ₹{parseFloat(item.unitPrice || item.unit_price || 0).toFixed(2)}
                              </td>
                              <td className="text-end fw-semibold">
                                ₹{parseFloat(item.totalPrice || item.total_price || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="bg-light p-3 rounded">
                      <h6 className="mb-3 border-bottom pb-2">Bill Summary</h6>
                      
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <strong>₹{subtotal.toFixed(2)}</strong>
                      </div>

                      {(cgstAmount > 0 || sgstAmount > 0 || serviceTaxAmount > 0) && (
                        <>
                          {cgstAmount > 0 && (
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted small">CGST:</span>
                              <span className="small">₹{cgstAmount.toFixed(2)}</span>
                            </div>
                          )}
                          {sgstAmount > 0 && (
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted small">SGST:</span>
                              <span className="small">₹{sgstAmount.toFixed(2)}</span>
                            </div>
                          )}
                          {serviceTaxAmount > 0 && (
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted small">Service Tax:</span>
                              <span className="small">₹{serviceTaxAmount.toFixed(2)}</span>
                            </div>
                          )}
                        </>
                      )}

                      {discount > 0 && (
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-danger">Discount:</span>
                          <strong className="text-danger">- ₹{discount.toFixed(2)}</strong>
                        </div>
                      )}

                      <div className="d-flex justify-content-between mt-3 pt-2 border-top">
                        <span className="fs-5 fw-bold">Total Amount:</span>
                        <span className="fs-5 fw-bold text-primary">₹{totalAmount.toFixed(2)}</span>
                      </div>

                      {(paidAmount > 0 || remainingAmount > 0) && (
                        <>
                          <div className="d-flex justify-content-between mt-3 mb-2">
                            <span>Paid Amount:</span>
                            <strong className="text-success">₹{paidAmount.toFixed(2)}</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Remaining:</span>
                            <strong className={remainingAmount > 0 ? 'text-danger' : 'text-success'}>
                              ₹{remainingAmount.toFixed(2)}
                            </strong>
                          </div>
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {/* Additional Information */}
            {(billDetails.paymentMethod || billDetails.notes || billDetails.creator) && (
              <div className="mb-3">
                <h5 className="mb-3">Additional Information</h5>
                {billDetails.paymentMethod && (
                  <div className="mb-2">
                    <strong>Payment Method:</strong>
                    <Badge bg="info" className="ms-2">
                      {billDetails.paymentMethod.toUpperCase()}
                    </Badge>
                  </div>
                )}
                {billDetails.notes && (
                  <div className="mb-2">
                    <strong>Notes:</strong>
                    <div className="text-muted mt-1">{billDetails.notes}</div>
                  </div>
                )}
                {billDetails.creator && (
                  <div className="mb-2">
                    <strong>Created By:</strong>
                    <div className="text-muted mt-1">
                      {billDetails.creator.name || billDetails.creator.email || 'N/A'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted">No details available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        {billDetails && (
          <Button variant="primary" onClick={handlePrint}>
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            Print Bill
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default BillViewModal

