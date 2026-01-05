import React, { useState } from 'react'
import { Container, Row, Col, Button, FormControl, Card } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBarChart, faDownload } from '@fortawesome/free-solid-svg-icons'
import reportService from '../../services/reportService'

const SalesReport = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      const response = await reportService.getSalesReport({
        startDate,
        endDate
      })
      // Handle response
      console.log('Sales Report:', response)
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
              <h2 className="mb-0 text-dark">Sales Report</h2>
            </div>
          </div>

          <Card className="shadow-sm">
            <Card.Body>
              <Row className="g-3 mb-4">
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
                <Col md={3} className="d-flex align-items-end">
                  <Button variant="outline-primary">
                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                    Export
                  </Button>
                </Col>
              </Row>

              <div className="text-center text-muted py-5">
                <p>Report will be displayed here</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default SalesReport

