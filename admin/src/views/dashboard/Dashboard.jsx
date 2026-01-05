import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faClock } from '@fortawesome/free-solid-svg-icons'

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <Container fluid className="py-5">
        <Row className="justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <Col xs={12} md={8} lg={6} className="text-center">
            <div className="coming-soon-section">
              <div className="mb-4">
                <FontAwesomeIcon 
                  icon={faChartLine} 
                  className="text-primary" 
                  style={{ fontSize: '4rem', opacity: 0.8 }}
                />
              </div>
              <h2 className="text-dark fw-bold mb-3">Coming Soon</h2>
              <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
                We're working on building an amazing dashboard experience for you.
              </p>
              <div className="d-flex align-items-center justify-content-center gap-2 text-muted">
                <FontAwesomeIcon icon={faClock} />
                <span>Stay tuned for updates!</span>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Dashboard
