import React, { useState } from 'react'
import { Container, Row, Col, Button, FormControl, Card } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBarChart, faDownload } from '@fortawesome/free-solid-svg-icons'
import reportService from '../../services/reportService'

const LedgerReport = () => {
  const [customerId, setCustomerId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      const response = await reportService.getLedgerReport({
        customer_id: customerId,
        startDate,
        endDate
      })
      console.log('Ledger Report:', response)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faBarChart} className="me-3 text-dark fs-4" />
              <h2 className="mb-0 text-dark">Ledger Report</h2>
            </div>
          </div>

          <Card className="shadow-sm">
            <Card.Body>
              <Row className="g-3 mb-4">
                <Col md={3}>
                  <label className="form-label">Customer ID</label>
                  <FormControl
                    placeholder="Enter customer ID"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <label className="form-label">Start Date</label>
                  <FormControl
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <label className="form-label">End Date</label>
                  <FormControl
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <Button 
                    variant="primary" 
                    onClick={handleGenerateReport}
                    disabled={loading}
                  >
                    Generate Report
                  </Button>
                </Col>
              </Row>

              <div className="text-center text-muted py-5">
                <p>Ledger report will be displayed here</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default LedgerReport

