import React, { useState, useRef } from 'react'
import { Container, Row, Col, Button, Card, Spinner } from 'react-bootstrap'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCreditCard, faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons'
import PaymentForm from '../../components/pages/payments/PaymentForm'
import paymentService from '../../services/paymentService'
import { useToast } from '../../components/common/ToastProvider'

const PaymentFormView = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const formRef = useRef()
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const [loadingData, setLoadingData] = useState(!!id)

  const mode = id ? 'edit' : 'create'
  const initialOrderId = searchParams.get('order_id') || null

  // Load payment data for edit mode
  React.useEffect(() => {
    if (mode === 'edit' && id) {
      const loadPayment = async () => {
        try {
          setLoadingData(true)
          const response = await paymentService.getPaymentById(id)
          if (response.success) {
            setPaymentData(response.data)
          } else {
            showToast('Error loading payment data', 'error')
            navigate('/payments')
          }
        } catch (error) {
          console.error('Error loading payment:', error)
          showToast('Error loading payment data', 'error')
          navigate('/payments')
        } finally {
          setLoadingData(false)
        }
      }
      loadPayment()
    }
  }, [id, mode, navigate, showToast])

  const handleSubmit = async (formData) => {
    try {
      setLoading(true)
      
      if (mode === 'create') {
        const response = await paymentService.createPayment(formData)
        if (response.success) {
          showToast('Payment recorded successfully', 'success')
          if (initialOrderId) {
            navigate(`/orders/${initialOrderId}`)
          } else {
            navigate('/payments')
          }
        } else {
          showToast(response.message || 'Error recording payment', 'error')
        }
      } else {
        showToast('Payment editing not supported', 'error')
      }
    } catch (error) {
      console.error('Error saving payment:', error)
      showToast('An error occurred while recording payment', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (initialOrderId) {
      navigate(`/orders/${initialOrderId}`)
    } else {
      navigate('/payments')
    }
  }

  if (loadingData) {
    return (
      <Container fluid>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" variant="success" />
        </div>
      </Container>
    )
  }

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <Button
              variant="outline-secondary"
              className="me-3"
              onClick={handleCancel}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back
            </Button>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faCreditCard} className="me-3 text-dark fs-4" />
              <h2 className="mb-0 text-dark">
                {mode === 'create' ? 'Record Payment' : 'Edit Payment'}
              </h2>
            </div>
          </div>

          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <PaymentForm
                ref={formRef}
                mode={mode}
                paymentData={paymentData}
                initialOrderId={initialOrderId}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
              />

              <div className="d-flex gap-2 justify-content-end mt-4">
                <Button variant="outline-secondary" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant="success"
                  onClick={() => formRef.current?.handleSubmit()}
                  disabled={loading}
                  className="text-white"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                      {mode === 'create' ? 'Record Payment' : 'Update Payment'}
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default PaymentFormView

