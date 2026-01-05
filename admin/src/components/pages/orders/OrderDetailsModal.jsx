import React, { useState, useEffect } from 'react'
import { Modal, Row, Col, Card, Badge, Button, Spinner, Tab, Tabs, Form, Table } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faShoppingCart,
  faUser,
  faCreditCard,
  faTag,
  faCalendarAlt,
  faBuilding,
  faFileInvoiceDollar,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faList,
  faHistory,
  faDownload,
  faEdit,
  faLink,
  faImage,
  faVideo,
  faExternalLinkAlt,
  faPlus,
  faTrash,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import orderService from '../../../services/orderService'
import { formatCurrency, formatDate } from '../../../utils'
import { useToast } from '../../common/ToastProvider'

const OrderDetailsModal = ({ show, onHide, orderId, onOrderUpdate, onEdit, orderSnapshot }) => {
  const { success, error: showError } = useToast()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [exportingPdf, setExportingPdf] = useState(false)
  const [editingLinkIndex, setEditingLinkIndex] = useState(null)
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const [linkErrors, setLinkErrors] = useState('')
  const [updatingLinks, setUpdatingLinks] = useState(false)

  const getSanitizedOrderId = (value) => {
    if (!value) return null
    return value.toString().replace(/^#/, '').trim()
  }

  const sanitizedOrderId = getSanitizedOrderId(orderId)

  useEffect(() => {
    if (orderSnapshot) {
      setOrder(orderSnapshot)
    }
  }, [orderSnapshot])

  useEffect(() => {
    if (show && sanitizedOrderId) {
      fetchOrderDetails()
    }
  }, [show, sanitizedOrderId])

  const fetchOrderDetails = async () => {
    setLoading(true)
    try {
      const response = await orderService.getOrderById(sanitizedOrderId)
      if (response.success) {
        setOrder(response.data)
      } else {
        showError('Failed to load order details')
      }
    } catch (err) {
      showError('Failed to load order details')
      console.error('Error fetching order details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      setExportingPdf(true)
      const response = await orderService.exportOrderPdf(sanitizedOrderId)
      if (response.success) {
        success('PDF exported successfully')
      } else {
        showError(response.message || 'Failed to export PDF')
      }
    } catch (err) {
      console.error('Error exporting PDF:', err)
      showError('Failed to export PDF')
    } finally {
      setExportingPdf(false)
    }
  }

  // Link Management Functions
  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      setLinkErrors('Both title and URL are required')
      return
    }

    // Basic URL validation
    try {
      new URL(newLink.url)
    } catch (e) {
      setLinkErrors('Please enter a valid URL')
      return
    }

    const updatedLinks = [...(order?.links || []), { ...newLink, id: Date.now() }]
    handleUpdateOrderLinks(updatedLinks)
    setNewLink({ title: '', url: '' })
    setLinkErrors('')
  }

  const handleEditLink = (index) => {
    setEditingLinkIndex(index)
    setNewLink({ ...order.links[index] })
    setLinkErrors('')
  }

  const handleUpdateLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      setLinkErrors('Both title and URL are required')
      return
    }

    // Basic URL validation
    try {
      new URL(newLink.url)
    } catch (e) {
      setLinkErrors('Please enter a valid URL')
      return
    }

    const updatedLinks = order.links.map((link, i) => i === editingLinkIndex ? { ...newLink } : link)
    handleUpdateOrderLinks(updatedLinks)
    setEditingLinkIndex(null)
    setNewLink({ title: '', url: '' })
    setLinkErrors('')
  }

  const handleDeleteLink = async (index) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      const updatedLinks = order.links.filter((_, i) => i !== index)
      handleUpdateOrderLinks(updatedLinks)
      if (editingLinkIndex === index) {
        setEditingLinkIndex(null)
        setNewLink({ title: '', url: '' })
      }
    }
  }

  const handleCancelEditLink = () => {
    setEditingLinkIndex(null)
    setNewLink({ title: '', url: '' })
    setLinkErrors('')
  }

  const handleUpdateOrderLinks = async (updatedLinks) => {
    if (!sanitizedOrderId) return

    try {
      setUpdatingLinks(true)
      // Update order with new links array
      const response = await orderService.updateOrder(sanitizedOrderId, {
        links: updatedLinks
      })
      
      if (response.success) {
        setOrder(prev => ({ ...prev, links: updatedLinks }))
        success('Links updated successfully')
        if (onOrderUpdate) {
          onOrderUpdate()
        }
      } else {
        showError(response.message || 'Failed to update links')
      }
    } catch (err) {
      console.error('Error updating links:', err)
      showError('Failed to update links')
    } finally {
      setUpdatingLinks(false)
    }
  }

  const getStatusColor = (status) => {
    const statusMap = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'primary',
      completed: 'success',
      cancelled: 'danger'
    }
    return statusMap[status?.toLowerCase()] || 'secondary'
  }

  const getPaymentStatusColor = (status) => {
    const statusMap = {
      pending: 'warning',
      paid: 'success',
      partial: 'info',
      failed: 'danger',
      refunded: 'secondary'
    }
    return statusMap[status?.toLowerCase()] || 'secondary'
  }

  if (!order && !loading) return null

  const totalAmount = order?.totalAmount || 0
  const paidAmount = order?.paidAmount || 0
  const balanceAmount = order?.remainingAmount || 0
  const discount = order?.discount || 0
  const items = order?.items || []
  const payments = order?.payments || []
  const customerName = order?.customer 
    ? (order.customer.name || `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'Unknown')
    : 'Unknown'

  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.totalPrice || 0) || 0), 0)


  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="border-bottom border-primary border-2">
        <Modal.Title className="text-primary">
          <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
          Order Details - #{order?.orderNumber || order?.id || orderId}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3">Loading order details...</p>
          </div>
        ) : (
          <>
            {/* Order Header Summary */}
            <div className="bg-gradient-primary-subtle p-4 border-bottom">
              <Row className="g-4">
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-circle me-3"
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                    </div>
                    <div>
                      <h5 className="mb-1">{customerName}</h5>
                      {(order?.customer?.jobCode || order?.customer?.job_code) && (
                        <p className="text-primary mb-1 small fw-bold">
                          Job Code: {order?.customer?.jobCode || order?.customer?.job_code}
                        </p>
                      )}
                      <p className="text-muted mb-0 small">
                        {order?.customer?.mobile || order?.customer?.phone || order?.customer?.email || 'N/A'}
                      </p>
                      {order?.branch?.branchName && (
                        <small className="text-muted">
                          <FontAwesomeIcon icon={faBuilding} className="me-1" />
                          {order.branch.branchName} {order.branch.branchCode && `(${order.branch.branchCode})`}
                        </small>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div>
                    <div className="text-muted small mb-1">Order Date</div>
                    <div className="fw-semibold">
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                      {formatDate(order?.orderDate)}
                    </div>
                    {order?.dueDate && (
                      <>
                        <div className="text-muted small mb-1 mt-2">Due Date</div>
                        <div className={`fw-semibold ${new Date(order.dueDate) < new Date() ? 'text-danger' : 'text-primary'}`}>
                          {formatDate(order.dueDate)}
                        </div>
                      </>
                    )}
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-end">
                    <div className="text-muted small mb-1">Total Amount</div>
                    <div className="h4 mb-0 fw-bold text-primary">{formatCurrency(totalAmount)}</div>
                    <div className="mt-2">
                      <Badge bg={getStatusColor(order?.status)} className="me-2 px-3 py-2">
                        {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                      </Badge>
                      <Badge bg={getPaymentStatusColor(order?.paymentStatus)} className="px-3 py-2">
                        {order?.paymentStatus ? 
                          order.paymentStatus.charAt(0).toUpperCase() + 
                          order.paymentStatus.slice(1) : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="px-4 pt-3 border-bottom"
            >
              <Tab eventKey="details" title={
                <>
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Order Details
                </>
              }>
                <div className="p-4">
                  <Row>
                    {/* Left Column - Order Items & Links */}
                    <Col lg={8}>
                      {/* Order Packages */}
                      <div className="mb-4">
                        <h5 className="mb-3 pb-2 border-bottom border-primary border-2">
                          <FontAwesomeIcon icon={faList} className="me-2 text-primary" />
                          Order Packages
                        </h5>
                        {items.length === 0 ? (
                          <div className="text-center py-5">
                            <FontAwesomeIcon icon={faTag} className="text-muted mb-3" size="3x" />
                            <p className="text-muted">No packages in this order</p>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead className="table-light">
                                <tr>
                                  <th>Package</th>
                                  <th>Price</th>
                                  <th>Qty</th>
                                  <th className="text-end">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((item, index) => (
                                  <tr key={item.id || index}>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <FontAwesomeIcon icon={faTag} className="me-2 text-primary" />
                                        <div>
                                          <div className="fw-semibold">{item.packageName || 'Package'}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td>{formatCurrency(item.unitPrice || 0)}</td>
                                    <td>{item.quantity || 1}</td>
                                    <td className="text-end fw-semibold text-primary">
                                      {formatCurrency(item.totalPrice || 0)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Important Links - CRUD (Moved to Left Side) */}
                      <Card className="mb-4 border-primary border-2">
                        <Card.Header className="bg-gradient-primary-subtle">
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="mb-0 text-primary">
                              <FontAwesomeIcon icon={faLink} className="me-2" />
                              Important Links ({order?.links?.length || 0})
                            </h5>
                          </div>
                        </Card.Header>
                        <Card.Body>
                          {/* Add/Edit Link Form */}
                          <div className="bg-light p-3 rounded mb-3">
                            <Row className="g-2">
                              <Col md={5}>
                                <Form.Label className="fw-semibold small">Link Title</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="e.g., Photo Share Link, Video Link"
                                  value={newLink.title}
                                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                                  className="border-2"
                                  size="sm"
                                />
                              </Col>
                              <Col md={6}>
                                <Form.Label className="fw-semibold small">Link URL</Form.Label>
                                <Form.Control
                                  type="url"
                                  placeholder="https://example.com/link"
                                  value={newLink.url}
                                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                  className="border-2"
                                  size="sm"
                                />
                              </Col>
                              <Col md={1} className="d-flex align-items-end">
                                {editingLinkIndex !== null ? (
                                  <>
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={handleUpdateLink}
                                      className="me-1"
                                      title="Save"
                                      disabled={updatingLinks}
                                    >
                                      <FontAwesomeIcon icon={faSave} />
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={handleCancelEditLink}
                                      title="Cancel"
                                      disabled={updatingLinks}
                                    >
                                      <FontAwesomeIcon icon={faTimes} />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleAddLink}
                                    title="Add Link"
                                    disabled={updatingLinks}
                                  >
                                    <FontAwesomeIcon icon={faPlus} />
                                  </Button>
                                )}
                              </Col>
                            </Row>
                            {linkErrors && (
                              <div className="text-danger small mt-2">{linkErrors}</div>
                            )}
                          </div>

                          {/* Links List */}
                          {order?.links && Array.isArray(order.links) && order.links.length > 0 ? (
                            <div className="table-responsive">
                              <Table striped bordered hover size="sm">
                                <thead>
                                  <tr>
                                    <th style={{ width: '30%' }}>Link Title</th>
                                    <th style={{ width: '50%' }}>Link URL</th>
                                    <th style={{ width: '20%' }}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.links.map((link, index) => (
                                    <tr key={link.id || index}>
                                      <td className="fw-semibold">{link.title || 'Untitled Link'}</td>
                                      <td>
                                        <a
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary text-decoration-none d-flex align-items-center"
                                        >
                                          <span className="text-truncate me-2" style={{ maxWidth: '300px' }}>
                                            {link.url}
                                          </span>
                                          <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
                                        </a>
                                      </td>
                                      <td>
                                        <div className="d-flex gap-1">
                                          <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleEditLink(index)}
                                            title="Edit Link"
                                            disabled={editingLinkIndex !== null && editingLinkIndex !== index || updatingLinks}
                                          >
                                            <FontAwesomeIcon icon={faEdit} />
                                          </Button>
                                          <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeleteLink(index)}
                                            title="Delete Link"
                                            disabled={editingLinkIndex !== null || updatingLinks}
                                          >
                                            <FontAwesomeIcon icon={faTrash} />
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          ) : (
                            // Fallback to legacy individual fields if links array doesn't exist
                            <>
                              {order?.photoShareLink || order?.photo_share_link ? (
                                <div className="mb-3">
                                  <div className="d-flex align-items-center mb-2">
                                    <FontAwesomeIcon icon={faImage} className="me-2 text-primary" />
                                    <div className="text-muted small fw-semibold">Photo Share Link</div>
                                  </div>
                                  <a
                                    href={order?.photoShareLink || order?.photo_share_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="d-flex align-items-center text-decoration-none text-primary"
                                  >
                                    <span className="text-truncate me-2" style={{ maxWidth: '200px' }}>
                                      {order?.photoShareLink || order?.photo_share_link}
                                    </span>
                                    <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
                                  </a>
                                </div>
                              ) : null}
                              {order?.videoLink || order?.video_link ? (
                                <div className="mb-3">
                                  <div className="d-flex align-items-center mb-2">
                                    <FontAwesomeIcon icon={faVideo} className="me-2 text-danger" />
                                    <div className="text-muted small fw-semibold">Video Link</div>
                                  </div>
                                  <a
                                    href={order?.videoLink || order?.video_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="d-flex align-items-center text-decoration-none text-danger"
                                  >
                                    <span className="text-truncate me-2" style={{ maxWidth: '200px' }}>
                                      {order?.videoLink || order?.video_link}
                                    </span>
                                    <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
                                  </a>
                                </div>
                              ) : null}
                              {order?.otherImportantLink || order?.other_important_link ? (
                                <div className="mb-3">
                                  <div className="d-flex align-items-center mb-2">
                                    <FontAwesomeIcon icon={faLink} className="me-2 text-success" />
                                    <div className="text-muted small fw-semibold">Other Important Link</div>
                                  </div>
                                  <a
                                    href={order?.otherImportantLink || order?.other_important_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="d-flex align-items-center text-decoration-none text-success"
                                  >
                                    <span className="text-truncate me-2" style={{ maxWidth: '200px' }}>
                                      {order?.otherImportantLink || order?.other_important_link}
                                    </span>
                                    <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
                                  </a>
                                </div>
                              ) : null}
                              {!order?.links && (!order?.photoShareLink && !order?.photo_share_link && 
                               !order?.videoLink && !order?.video_link && 
                               !order?.otherImportantLink && !order?.other_important_link) && (
                                <div className="text-center py-3 text-muted">
                                  <FontAwesomeIcon icon={faLink} className="mb-2" size="2x" />
                                  <p className="mb-0">No links added for this order. Add links using the form above.</p>
                                </div>
                              )}
                            </>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Right Column - Summary & Info */}
                    <Col lg={4}>
                      {/* Order Summary */}
                      <Card className="mb-4 border-primary border-2">
                        <Card.Header className="bg-gradient-primary-subtle">
                          <h5 className="mb-0 text-primary">
                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                            Order Summary
                          </h5>
                        </Card.Header>
                        <Card.Body>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Subtotal:</span>
                            <span className="fw-semibold">{formatCurrency(subtotal)}</span>
                          </div>
                          {discount > 0 && (
                            <div className="d-flex justify-content-between mb-2 text-danger">
                              <span>Discount:</span>
                              <span className="fw-semibold">-{formatCurrency(discount)}</span>
                            </div>
                          )}
                          <hr />
                          <div className="d-flex justify-content-between mb-3">
                            <strong>Total Amount:</strong>
                            <strong className="text-primary fs-5">{formatCurrency(totalAmount)}</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-success">Paid Amount:</span>
                            <span className="text-success fw-bold">{formatCurrency(paidAmount >= 0 ? paidAmount : 0)}</span>
                          </div>
                    <div className="d-flex justify-content-between">
                      <span className={balanceAmount > 0 ? 'text-danger' : 'text-success'}>Remaining Amount:</span>
                      <span className={`fw-bold fs-5 ${balanceAmount > 0 ? 'text-danger' : 'text-success'}`}>
                        {formatCurrency(balanceAmount >= 0 ? balanceAmount : 0)}
                      </span>
                    </div>
                        </Card.Body>
                      </Card>

                      {/* Customer Information */}
                      <Card className="mb-4">
                        <Card.Header>
                          <h5 className="mb-0">
                            <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                            Customer Information
                          </h5>
                        </Card.Header>
                        <Card.Body>
                          <div className="mb-2">
                            <div className="text-muted small">Name</div>
                            <div className="fw-semibold">{customerName}</div>
                          </div>
                          {(order?.customer?.jobCode || order?.customer?.job_code) && (
                            <div className="mb-2">
                              <div className="text-muted small">Job Code</div>
                              <div className="fw-semibold text-primary">{order?.customer?.jobCode || order?.customer?.job_code}</div>
                            </div>
                          )}
                          <div className="mb-2">
                            <div className="text-muted small">Contact</div>
                            <div className="fw-semibold">
                              {order?.customer?.mobile || order?.customer?.phone || order?.customer?.email || 'N/A'}
                            </div>
                          </div>
                          {order?.customer?.email && (
                            <div>
                              <div className="text-muted small">Email</div>
                              <div className="fw-semibold">{order.customer.email}</div>
                            </div>
                          )}
                        </Card.Body>
                      </Card>

                      {/* Order Notes */}
                      {(order?.notes || order?.Notes) && (
                        <Card className="mb-4">
                          <Card.Header>
                            <h5 className="mb-0">
                              <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-info" />
                              Notes
                            </h5>
                          </Card.Header>
                          <Card.Body>
                            <div className="text-muted small mb-2">Order Notes</div>
                            <div className="fw-normal" style={{ whiteSpace: 'pre-wrap' }}>
                              {order.notes || order.Notes || 'No notes available'}
                            </div>
                          </Card.Body>
                        </Card>
                      )}
                    </Col>
                  </Row>
                </div>
              </Tab>

              <Tab eventKey="payments" title={
                <>
                  <FontAwesomeIcon icon={faHistory} className="me-2" />
                  Payment History ({payments.length})
                </>
              }>
                <div className="p-4">
                  {payments.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                          <th>Payment #</th>
                          <th>Date</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment, index) => (
                            <tr key={payment.id || index}>
                              <td className="fw-semibold text-primary">
                                {payment.paymentNumber || payment.payment_number || (payment.id ? `#PAY${String(payment.id).padStart(3, '0')}` : '-')}
                              </td>
                              <td>{formatDate(payment.paymentDate || payment.payment_date || payment.createdAt)}</td>
                              <td>
                                <Badge bg={payment.paymentType === 'debit' ? 'danger' : 'success'}>
                                  {(payment.paymentType || 'credit').toUpperCase()}
                                </Badge>
                              </td>
                              <td className={`fw-semibold ${payment.paymentType === 'debit' ? 'text-danger' : 'text-success'}`}>
                                {formatCurrency(payment.amount || 0)}
                              </td>
                              <td>
                                <Badge bg="info">
                                  {payment.paymentMethod || 'Cash'}
                                </Badge>
                              </td>
                              <td>
                                <small className="text-muted">{payment.remarks || '-'}</small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <FontAwesomeIcon icon={faCreditCard} className="text-muted mb-3" size="3x" />
                      <p className="text-muted">No payment history found for this order</p>
                    </div>
                  )}
                </div>
              </Tab>
            </Tabs>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer className="border-top">
        <div className="d-flex justify-content-between w-100 align-items-center">
          <div>
            <Badge bg={getStatusColor(order?.status)} className="me-2 px-3 py-2">
              {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
            </Badge>
            {balanceAmount === 0 ? (
              <Badge bg="success" className="px-3 py-2">Fully Paid</Badge>
            ) : (
              <Badge bg="warning" className="px-3 py-2">
                Remaining Amount: {formatCurrency(balanceAmount >= 0 ? balanceAmount : 0)}
              </Badge>
            )}
          </div>
          <div className="d-flex gap-2">
            {onEdit && (
              <Button 
                variant="outline-primary" 
                onClick={() => {
                  onHide()
                  onEdit(order)
                }}
              >
                <FontAwesomeIcon icon={faEdit} className="me-2" />
                Edit Order
              </Button>
            )}
            <Button 
              variant="outline-secondary" 
              onClick={handleExportPDF}
              disabled={exportingPdf}
            >
              {exportingPdf ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                  Export PDF
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={onHide}>
              Close
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default OrderDetailsModal
