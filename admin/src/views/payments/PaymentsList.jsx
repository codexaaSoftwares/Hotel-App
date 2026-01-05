import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button, FormControl, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCreditCard,
  faSearch, 
  faRefresh,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { Table } from '../../components'
import paymentService from '../../services/paymentService'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

const PaymentsList = () => {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  
  // Permission checks
  const canCreatePayment = hasPermission
    ? hasPermission(PERMISSIONS.PAYMENT_WRITE) || hasPermission(PERMISSIONS.PAYMENT_MANAGE)
    : false
  
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      // TODO: Implement payment list endpoint
      // const response = await paymentService.getPayments()
      // if (response.success) {
      //   setPayments(response.data || [])
      // }
      setPayments([])
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const columns = [
    {
      key: 'order',
      label: 'Order',
      render: (value, payment) => `Order #${payment.order_id}`
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value, payment) => (
        <div className="fw-semibold text-success">
          {formatCurrency(payment.amount)}
        </div>
      )
    },
    {
      key: 'method',
      label: 'Payment Method',
      render: (value, payment) => (
        <Badge bg="info" className="px-2 py-1">
          {payment.payment_method || 'Cash'}
        </Badge>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (value, payment) => formatDate(payment.payment_date)
    }
  ]

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faCreditCard} className="me-3 text-dark fs-4" />
              <h2 className="mb-0 text-dark">Payments</h2>
            </div>
            <div className="ms-auto">
              {canCreatePayment && (
                <Button variant="primary" onClick={() => navigate('/payments/create')}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Record Payment
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3 shadow-sm p-4">
            <div className="mb-4">
              <Row className="g-3">
                <Col md={4}>
                  <FormControl
                    placeholder="Search payments"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-2"
                  />
                </Col>
                <Col md={2}>
                  <Button variant="outline-secondary" onClick={loadPayments}>
                    <FontAwesomeIcon icon={faRefresh} className="me-2" />
                    Refresh
                  </Button>
                </Col>
              </Row>
            </div>

            <Table
              data={payments}
              columns={columns}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              loading={loading}
              pagination={true}
            />
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default PaymentsList

