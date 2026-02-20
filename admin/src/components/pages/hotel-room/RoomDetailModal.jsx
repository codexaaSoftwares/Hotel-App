import React, { useState, useEffect } from 'react'
import { Modal, Button, Row, Col, Badge, Form } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBed, faUser, faCalendarCheck, faCalendarXmark, faPlus, faSignInAlt, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons'
import { TextField, SelectField, FormRow } from '../../common/FormFields'

const STATUS_LABELS = {
  available: 'Available',
  reserved: 'Reserved',
  occupied: 'Occupied',
  cleaning: 'Cleaning',
  maintenance: 'Maintenance',
}

const BOOKING_STATUS_LABELS = {
  booked: 'Booked',
  checked_in: 'Checked-in',
  checked_out: 'Checked-out',
  cancelled: 'Cancelled',
}

const BOOKING_TYPE_OPTIONS = [
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'advance', label: 'Advance' },
  { value: 'online', label: 'Online' },
]

const DEFAULT_BOOKING_FORM = {
  customerId: '',
  guestName: '',
  guestMobile: '',
  bookingType: 'walk_in',
  checkInAt: '',
  expectedCheckOutAt: '',
  adultsCount: 2,
  childrenCount: 0,
  notes: '',
}

const RoomDetailModal = ({ show, onHide, room, booking, onAction, mockCustomers = [] }) => {
  const [bookingForm, setBookingForm] = useState({ ...DEFAULT_BOOKING_FORM })

  // Reset form when opening modal for an available room so "New Booking" always starts clean
  useEffect(() => {
    if (show && room?.status === 'available') {
      setBookingForm({ ...DEFAULT_BOOKING_FORM })
    }
  }, [show, room?.id, room?.status])

  const customerOptions = [
    { value: '', label: 'Select customer or enter guest details' },
    ...mockCustomers.map(c => ({ value: String(c.id), label: `${c.name} (${c.mobile})` })),
  ]

  const formatDateTime = (iso) => {
    try {
      return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
    } catch {
      return ''
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const numValue = (name === 'adultsCount' || name === 'childrenCount')
      ? (value === '' ? 0 : parseInt(value, 10) || 0)
      : value
    setBookingForm(prev => ({ ...prev, [name]: numValue }))
    if (name === 'customerId' && value) {
      const cust = mockCustomers.find(c => String(c.id) === value)
      if (cust) {
        setBookingForm(prev => ({ ...prev, guestName: cust.name, guestMobile: cust.mobile || '' }))
      }
    }
  }

  const handleNewBooking = () => {
    // Mock: in real implementation, call bookingService.createBooking()
    console.log('New booking', { room, bookingForm })
    onAction?.()
  }

  const handleCheckIn = () => {
    console.log('Check-in', { room, booking })
    onAction?.()
  }

  const handleCheckOut = () => {
    console.log('Check-out', { room, booking })
    onAction?.()
  }

  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      console.log('Cancel booking', { booking })
      onAction?.()
    }
  }

  if (!room) return null

  const hasActiveBooking = booking && !['checked_out', 'cancelled'].includes(booking.status)
  const canCheckIn = booking?.status === 'booked'
  const canCheckOut = booking?.status === 'checked_in'
  const isAvailable = room.status === 'available'

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      fullscreen="lg-down"
      backdrop="static"
      className="modal-xl-large"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faBed} className="me-2 text-theme" />
          Room {room.roomNumber} - {room.categoryName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', padding: '1.5rem' }}>
        {/* Room Summary */}
        <div className="mb-4 pb-3 border-bottom">
          <h5 className="mb-3">Room Summary</h5>
          <Row>
            <Col md={6}>
              <div className="mb-2">
                <strong>Room:</strong> {room.roomNumber} | <strong>Floor:</strong> {room.floorNumber}
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-2">
                <strong>Status:</strong>{' '}
                <Badge bg={room.status === 'available' ? 'success' : room.status === 'occupied' ? 'danger' : 'warning'}>
                  {STATUS_LABELS[room.status]}
                </Badge>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-2">
                <strong>Category:</strong> {room.categoryName} | <strong>Max Occupancy:</strong> {room.maxOccupancy}
              </div>
            </Col>
          </Row>
        </div>

        {/* Current / Upcoming Booking */}
        {hasActiveBooking && (
          <div className="mb-4 pb-3 border-bottom">
            <h5 className="mb-3">Current Booking</h5>
            <Row>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Booking #:</strong> {booking.bookingNumber}
                </div>
                <div className="mb-2">
                  <strong>Guest:</strong> {booking.guestName}
                  {booking.guestMobile && <span className="text-muted ms-2">({booking.guestMobile})</span>}
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Check-in:</strong> {formatDateTime(booking.checkInAt)}
                </div>
                <div className="mb-2">
                  <strong>Expected Check-out:</strong> {formatDateTime(booking.expectedCheckOutAt)}
                </div>
                <div className="mb-2">
                  <strong>Status:</strong>{' '}
                  <Badge bg={booking.status === 'checked_in' ? 'success' : 'info'}>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </Badge>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Quick Booking Form (when available) */}
        {isAvailable && (
          <div className="mb-4">
            <h5 className="mb-3">New Booking</h5>
            <Form>
              <FormRow>
                <SelectField
                  id="customerId"
                  name="customerId"
                  label="Customer"
                  value={bookingForm.customerId}
                  onChange={handleInputChange}
                  options={customerOptions}
                  col={6}
                />
                <TextField
                  id="guestName"
                  name="guestName"
                  label="Guest Name"
                  value={bookingForm.guestName}
                  onChange={handleInputChange}
                  col={6}
                />
              </FormRow>
              <FormRow>
                <TextField
                  id="guestMobile"
                  name="guestMobile"
                  label="Guest Mobile"
                  value={bookingForm.guestMobile}
                  onChange={handleInputChange}
                  col={6}
                />
                <SelectField
                  id="bookingType"
                  name="bookingType"
                  label="Booking Type"
                  value={bookingForm.bookingType}
                  onChange={handleInputChange}
                  options={BOOKING_TYPE_OPTIONS}
                  col={6}
                />
              </FormRow>
              <FormRow>
                <TextField
                  id="checkInAt"
                  name="checkInAt"
                  label="Check-in"
                  type="datetime-local"
                  value={bookingForm.checkInAt}
                  onChange={handleInputChange}
                  col={6}
                />
                <TextField
                  id="expectedCheckOutAt"
                  name="expectedCheckOutAt"
                  label="Expected Check-out"
                  type="datetime-local"
                  value={bookingForm.expectedCheckOutAt}
                  onChange={handleInputChange}
                  col={6}
                />
              </FormRow>
              <FormRow>
                <TextField
                  id="adultsCount"
                  name="adultsCount"
                  label="Adults"
                  type="number"
                  min={1}
                  max={20}
                  value={bookingForm.adultsCount}
                  onChange={handleInputChange}
                  col={6}
                />
                <TextField
                  id="childrenCount"
                  name="childrenCount"
                  label="Children"
                  type="number"
                  min={0}
                  max={20}
                  value={bookingForm.childrenCount}
                  onChange={handleInputChange}
                  col={6}
                />
              </FormRow>
              <FormRow>
                <TextField
                  id="notes"
                  name="notes"
                  label="Notes"
                  value={bookingForm.notes}
                  onChange={handleInputChange}
                  col={12}
                />
              </FormRow>
            </Form>
          </div>
        )}

        {/* View Booking History link placeholder */}
        <div className="small">
          <Button variant="link" className="p-0 text-muted" size="sm">
            View booking history for this room
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        {isAvailable && (
          <Button
            variant="primary"
            onClick={handleNewBooking}
            style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            New Booking
          </Button>
        )}
        {canCheckIn && (
          <Button
            variant="success"
            onClick={handleCheckIn}
          >
            <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
            Check-In
          </Button>
        )}
        {canCheckOut && (
          <Button
            variant="warning"
            onClick={handleCheckOut}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
            Check-Out
          </Button>
        )}
        {hasActiveBooking && booking?.status === 'booked' && (
          <Button variant="danger" onClick={handleCancelBooking}>
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Cancel Booking
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default RoomDetailModal
