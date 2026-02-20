import React, { useState, useEffect } from 'react'
import { Modal, Button, Row, Col, Badge, Form, Card, Collapse, Alert, ListGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBed, faUser, faPhone, faCalendarCheck, faCalendarXmark, faPlus, faSignInAlt, faSignOutAlt, faTimes, faUserClock, faHistory, faRupeeSign, faChevronDown, faChevronUp, faLink, faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { TextField, SelectField, FormRow } from '../../common/FormFields'

/** Mock room rate per night by category (replace with API/room category later) */
const MOCK_RATE_PER_NIGHT = { Standard: 2000, Deluxe: 3500, Suite: 5000 }

/** Mock addons for bill summary (replace with API/addon services later) */
function getMockAddonsForRoom(roomId) {
  const addons = [
    { name: 'Extra Bed', qty: 1, charge: 500 },
    { name: 'Laundry', qty: 2, charge: 100 },
  ]
  return addons.slice(0, (roomId % 2) + 1)
}

/** Build mock bill summary from room + booking for display */
function getMockBillSummary(room, booking) {
  if (!room || !booking?.checkInAt || !booking?.expectedCheckOutAt) return null
  const nights = Math.max(1, Math.ceil((new Date(booking.expectedCheckOutAt) - new Date(booking.checkInAt)) / (24 * 60 * 60 * 1000)))
  const ratePerNight = MOCK_RATE_PER_NIGHT[room.categoryName] ?? 2500
  const roomCharge = ratePerNight * nights
  const addons = getMockAddonsForRoom(room.id)
  const addonsTotal = addons.reduce((sum, a) => sum + a.qty * a.charge, 0)
  const total = roomCharge + addonsTotal
  return { nights, ratePerNight, roomCharge, addons, addonsTotal, total }
}

/** Mock past bookings for a room (for UI demo; replace with API later) */
function getMockBookingHistory(roomId) {
  const names = ['Ramesh Kumar', 'Sita Devi', 'Vijay Singh']
  const history = []
  for (let i = 0; i < 3; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (7 + i * 5))
    const checkIn = new Date(d)
    const checkOut = new Date(d)
    checkOut.setDate(checkOut.getDate() + 2)
    history.push({
      id: `hist-${roomId}-${i}`,
      bookingNumber: `#BOOK${roomId * 10 + i}`,
      guestName: names[i],
      checkInAt: checkIn.toISOString(),
      expectedCheckOutAt: checkOut.toISOString(),
      status: 'checked_out',
    })
  }
  return history
}

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

const RoomDetailModal = ({
  show,
  onHide,
  room,
  booking,
  onNewBooking: onNewBookingProp,
  onCheckIn: onCheckInProp,
  onCheckOut: onCheckOutProp,
  onCancelBooking: onCancelBookingProp,
  onUpdateBooking: onUpdateBookingProp,
  linkedBillDetails = { linkedRooms: [], combinedTotal: 0 },
  allRooms = [],
  onLinkRooms: onLinkRoomsProp,
  onUnlinkRoom: onUnlinkRoomProp,
  mockCustomers = [],
}) => {
  const [bookingForm, setBookingForm] = useState({ ...DEFAULT_BOOKING_FORM })
  const [bookingFormError, setBookingFormError] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [editForm, setEditForm] = useState({ ...DEFAULT_BOOKING_FORM })
  const [linkPickerOpen, setLinkPickerOpen] = useState(false)
  const [selectedRoomIdsForLink, setSelectedRoomIdsForLink] = useState([])

  // Reset form when opening modal for an available room so "New Booking" always starts clean
  useEffect(() => {
    if (show && room?.status === 'available') {
      setBookingForm({ ...DEFAULT_BOOKING_FORM })
      setBookingFormError('')
    }
  }, [show, room?.id, room?.status])

  // Sync edit form from current booking when modal opens for a reserved room (booked)
  useEffect(() => {
    if (show && booking?.status === 'booked') {
      setEditForm({
        customerId: '',
        guestName: booking.guestName || '',
        guestMobile: booking.guestMobile || '',
        bookingType: booking.bookingType || 'walk_in',
        checkInAt: booking.checkInAt ? new Date(booking.checkInAt).toISOString().slice(0, 16) : '',
        expectedCheckOutAt: booking.expectedCheckOutAt ? new Date(booking.expectedCheckOutAt).toISOString().slice(0, 16) : '',
        adultsCount: booking.adultsCount ?? 2,
        childrenCount: booking.childrenCount ?? 0,
        notes: booking.notes || '',
      })
    }
  }, [show, booking?.id, booking?.status])

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

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return ''
    }
  }

  const getNightsStay = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null
    const a = new Date(checkIn)
    const b = new Date(checkOut)
    const nights = Math.max(0, Math.ceil((b - a) / (24 * 60 * 60 * 1000)))
    return nights
  }

  const bookingTypeLabel = (type) => BOOKING_TYPE_OPTIONS.find(o => o.value === type)?.label || type || '—'

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
    if (!room?.id) return
    const name = (bookingForm.guestName || '').trim()
    if (!name) {
      setBookingFormError('Guest name is required.')
      return
    }
    setBookingFormError('')
    onNewBookingProp?.(room.id, { ...bookingForm, guestName: name })
  }

  const handleCheckIn = () => {
    if (!room?.id) return
    onCheckInProp?.(room.id)
  }

  const handleCheckOut = () => {
    if (!room?.id) return
    onCheckOutProp?.(room.id)
  }

  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      if (room?.id) onCancelBookingProp?.(room.id)
    }
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    const numValue = (name === 'adultsCount' || name === 'childrenCount')
      ? (value === '' ? 0 : parseInt(value, 10) || 0)
      : value
    setEditForm(prev => ({ ...prev, [name]: numValue }))
  }

  const handleSaveBookingEdit = () => {
    if (!room?.id) return
    const name = (editForm.guestName || '').trim()
    if (!name) {
      setBookingFormError('Guest name is required.')
      return
    }
    setBookingFormError('')
    const payload = {
      ...editForm,
      guestName: name,
      checkInAt: editForm.checkInAt ? new Date(editForm.checkInAt).toISOString() : booking?.checkInAt,
      expectedCheckOutAt: editForm.expectedCheckOutAt ? new Date(editForm.expectedCheckOutAt).toISOString() : booking?.expectedCheckOutAt,
    }
    onUpdateBookingProp?.(room.id, payload)
  }

  if (!room) return null

  const hasActiveBooking = booking && !['checked_out', 'cancelled'].includes(booking.status)
  const canCheckIn = booking?.status === 'booked'
  const canCheckOut = booking?.status === 'checked_in'
  const isAvailable = room.status === 'available'
  const isInLinkGroup = linkedBillDetails.linkedRooms?.length > 0
  const otherRoomsForLink = allRooms.filter(r => r.id !== room.id)

  const handleToggleLinkRoom = (roomId) => {
    setSelectedRoomIdsForLink(prev =>
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    )
  }

  const handleSaveLink = () => {
    if (selectedRoomIdsForLink.length === 0) return
    onLinkRoomsProp?.(room.id, selectedRoomIdsForLink)
    setLinkPickerOpen(false)
    setSelectedRoomIdsForLink([])
  }

  const handleUnlink = () => {
    if (window.confirm('Unlink this room from the group? Other rooms stay linked.')) {
      onUnlinkRoomProp?.(room.id)
    }
  }

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
        {/* Compact Room Summary bar */}
        <Card className="mb-3 bg-light border-0">
          <Card.Body className="py-2 px-3">
            <Row className="align-items-center g-2">
              <Col xs="auto">
                <span className="fw-bold text-theme">Room {room.roomNumber}</span>
                <span className="text-muted ms-2">{room.categoryName}</span>
              </Col>
              <Col xs="auto">
                <span className="text-muted small">Floor {room.floorNumber}</span>
              </Col>
              <Col xs="auto">
                <span className="text-muted small">Max {room.maxOccupancy} guests</span>
              </Col>
              <Col>
                <Badge
                  bg={
                    room.status === 'available' ? 'success'
                      : room.status === 'occupied' ? 'danger'
                        : room.status === 'reserved' ? 'warning'
                          : 'secondary'
                  }
                  className="float-end"
                >
                  {STATUS_LABELS[room.status]}
                </Badge>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* —— NEW BOOKING VIEW (room available) —— */}
        {isAvailable && (
          <Card className="mb-3 border">
            <Card.Header className="bg-white py-2">
              <FontAwesomeIcon icon={faPlus} className="me-2 text-theme" />
              <strong>New Booking</strong>
              <span className="text-muted small ms-2">— Enter guest and stay details</span>
            </Card.Header>
            <Card.Body>
              {bookingFormError && (
                <Alert variant="danger" className="py-2 mb-3" onClose={() => setBookingFormError('')} dismissible>
                  {bookingFormError}
                </Alert>
              )}
              <Form>
                <div className="small text-muted mb-2">Guest details</div>
                <FormRow>
                  <SelectField
                    id="customerId"
                    name="customerId"
                    label="Customer (optional)"
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
                    onChange={(e) => { handleInputChange(e); setBookingFormError('') }}
                    col={6}
                    placeholder="Full name"
                    required
                    invalid={!!bookingFormError}
                    feedback={bookingFormError}
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
                    placeholder="10-digit mobile"
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
                <div className="small text-muted mb-2 mt-3">Stay details</div>
                <FormRow>
                  <TextField
                    id="checkInAt"
                    name="checkInAt"
                    label="Check-in Date & Time"
                    type="datetime-local"
                    value={bookingForm.checkInAt}
                    onChange={handleInputChange}
                    col={6}
                  />
                  <TextField
                    id="expectedCheckOutAt"
                    name="expectedCheckOutAt"
                    label="Expected Check-out Date & Time"
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
                    label="Notes (optional)"
                    value={bookingForm.notes}
                    onChange={handleInputChange}
                    col={12}
                    placeholder="Special requests, ID details, etc."
                  />
                </FormRow>
              </Form>
            </Card.Body>
          </Card>
        )}

        {/* —— CHECK-IN VIEW (room reserved, booking = booked) —— */}
        {hasActiveBooking && (
          <Card className="mb-3 border">
            <Card.Header className="bg-white py-2 d-flex justify-content-between align-items-center">
              <span>
                <FontAwesomeIcon icon={faUserClock} className="me-2 text-theme" />
                <strong>Current Booking</strong>
                <Badge bg="info" className="ms-2">{booking.bookingNumber}</Badge>
              </span>
              <Badge bg={booking.status === 'checked_in' ? 'success' : 'warning'}>
                {BOOKING_STATUS_LABELS[booking.status]}
              </Badge>
            </Card.Header>
            <Card.Body>
              <p className="small text-muted mb-3">
                {canCheckIn ? 'Confirm guest details and click Check-In to mark the room occupied.' : 'Booking and stay details below.'}
              </p>
              <Row>
                <Col md={6}>
                  <div className="mb-2">
                    <FontAwesomeIcon icon={faUser} className="me-2 text-muted" style={{ width: '1rem' }} />
                    <strong>{booking.guestName || '—'}</strong>
                  </div>
                  {booking.guestMobile && (
                    <div className="mb-2 ms-4 small">
                      <FontAwesomeIcon icon={faPhone} className="me-2 text-muted" style={{ width: '1rem' }} />
                      {booking.guestMobile}
                    </div>
                  )}
                  <div className="ms-4 small text-muted">
                    Type: {bookingTypeLabel(booking.bookingType)}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-2 small">
                    <FontAwesomeIcon icon={faCalendarCheck} className="me-2 text-muted" style={{ width: '1rem' }} />
                    <strong>Check-in:</strong> {formatDateTime(booking.checkInAt)}
                  </div>
                  <div className="mb-2 small">
                    <FontAwesomeIcon icon={faCalendarXmark} className="me-2 text-muted" style={{ width: '1rem' }} />
                    <strong>Check-out:</strong> {formatDateTime(booking.expectedCheckOutAt)}
                  </div>
                  {getNightsStay(booking.checkInAt, booking.expectedCheckOutAt) != null && (
                    <div className="small text-muted">
                      {getNightsStay(booking.checkInAt, booking.expectedCheckOutAt)} night(s)
                    </div>
                  )}
                </Col>
              </Row>

              {/* Edit booking (reserved only — easy to edit before check-in) */}
              {canCheckIn && (
                <>
                  <hr className="my-3" />
                  <p className="small text-muted mb-2">
                    <FontAwesomeIcon icon={faPencilAlt} className="me-1" />
                    Edit guest or stay details before check-in
                  </p>
                  {bookingFormError && (
                    <Alert variant="danger" className="py-2 mb-2" onClose={() => setBookingFormError('')} dismissible>
                      {bookingFormError}
                    </Alert>
                  )}
                  <Form>
                    <FormRow>
                      <TextField
                        id="editGuestName"
                        name="guestName"
                        label="Guest Name"
                        value={editForm.guestName}
                        onChange={handleEditInputChange}
                        col={6}
                      />
                      <TextField
                        id="editGuestMobile"
                        name="guestMobile"
                        label="Guest Mobile"
                        value={editForm.guestMobile}
                        onChange={handleEditInputChange}
                        col={6}
                      />
                    </FormRow>
                    <FormRow>
                      <SelectField
                        id="editBookingType"
                        name="bookingType"
                        label="Booking Type"
                        value={editForm.bookingType}
                        onChange={handleEditInputChange}
                        options={BOOKING_TYPE_OPTIONS}
                        col={6}
                      />
                      <Col md={6} />
                    </FormRow>
                    <FormRow>
                      <TextField
                        id="editCheckInAt"
                        name="checkInAt"
                        label="Check-in"
                        type="datetime-local"
                        value={editForm.checkInAt}
                        onChange={handleEditInputChange}
                        col={6}
                      />
                      <TextField
                        id="editExpectedCheckOutAt"
                        name="expectedCheckOutAt"
                        label="Expected Check-out"
                        type="datetime-local"
                        value={editForm.expectedCheckOutAt}
                        onChange={handleEditInputChange}
                        col={6}
                      />
                    </FormRow>
                    <FormRow>
                      <TextField
                        id="editAdultsCount"
                        name="adultsCount"
                        label="Adults"
                        type="number"
                        min={1}
                        max={20}
                        value={editForm.adultsCount}
                        onChange={handleEditInputChange}
                        col={6}
                      />
                      <TextField
                        id="editChildrenCount"
                        name="childrenCount"
                        label="Children"
                        type="number"
                        min={0}
                        max={20}
                        value={editForm.childrenCount}
                        onChange={handleEditInputChange}
                        col={6}
                      />
                    </FormRow>
                    <div className="mt-2">
                      <Button variant="outline-primary" size="sm" onClick={handleSaveBookingEdit}>
                        <FontAwesomeIcon icon={faPencilAlt} className="me-1" />
                        Save changes
                      </Button>
                    </div>
                  </Form>
                </>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Linked bill details — view all linked room bills, link/unlink option */}
        <Card className="mb-3 border">
          <Card.Header className="bg-white py-2">
            <FontAwesomeIcon icon={faLink} className="me-2 text-theme" />
            <strong>Linked bill details</strong>
            <span className="text-muted small ms-2">— Same group: view & pay together</span>
          </Card.Header>
          <Card.Body className="py-2">
            {linkedBillDetails.linkedRooms?.length > 0 ? (
              <>
                <ListGroup variant="flush" className="small mb-2">
                  {linkedBillDetails.linkedRooms.map((r) => (
                    <ListGroup.Item key={r.roomId} className="d-flex justify-content-between px-0">
                      <span>Room {r.roomNumber} ({r.categoryName})</span>
                      <span className="fw-medium">₹{r.total.toLocaleString('en-IN')}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <hr className="my-2" />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Combined total</span>
                  <span className="fw-bold text-theme">₹{linkedBillDetails.combinedTotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="small text-muted mb-2 mt-2">You can pay this room only or pay all linked in one shot.</p>
                <Button variant="outline-secondary" size="sm" onClick={handleUnlink}>
                  Unlink this room from group
                </Button>
              </>
            ) : (
              <>
                <p className="small text-muted mb-2">No linked bills. Link with other rooms to pay together.</p>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => { setLinkPickerOpen(!linkPickerOpen); setSelectedRoomIdsForLink([]) }}
                >
                  <FontAwesomeIcon icon={faLink} className="me-1" />
                  Link with other rooms
                </Button>
                <Collapse in={linkPickerOpen}>
                  <div className="mt-3 p-2 border rounded">
                    <p className="small mb-2">Select rooms to link (same bill group):</p>
                    <div className="d-flex flex-wrap gap-2">
                      {otherRoomsForLink.map((r) => (
                        <Form.Check
                          key={r.id}
                          type="checkbox"
                          id={`link-room-${r.id}`}
                          label={`${r.roomNumber} (${r.categoryName})`}
                          checked={selectedRoomIdsForLink.includes(r.id)}
                          onChange={() => handleToggleLinkRoom(r.id)}
                        />
                      ))}
                    </div>
                    {otherRoomsForLink.length === 0 && (
                      <p className="small text-muted mb-0">No other rooms to link.</p>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-2"
                      onClick={handleSaveLink}
                      disabled={selectedRoomIdsForLink.length === 0}
                      style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
                    >
                      Save link
                    </Button>
                  </div>
                </Collapse>
              </>
            )}
          </Card.Body>
        </Card>

        {/* Bill summary (mock data — room charge + addons; replace with API at check-out) */}
        {hasActiveBooking && (() => {
          const bill = getMockBillSummary(room, booking)
          if (!bill) return null
          return (
            <Card className="mb-3 border">
              <Card.Header className="bg-white py-2">
                <FontAwesomeIcon icon={faRupeeSign} className="me-2 text-theme" />
                <strong>Bill summary</strong>
                <span className="text-muted small ms-2">— Room & addons (final at check-out)</span>
              </Card.Header>
              <Card.Body className="py-2">
                <div className="d-flex justify-content-between small mb-2">
                  <span>Room ({room.categoryName}) × {bill.nights} night(s) @ ₹{bill.ratePerNight.toLocaleString('en-IN')}/night</span>
                  <span className="fw-medium">₹{bill.roomCharge.toLocaleString('en-IN')}</span>
                </div>
                {bill.addons.map((a, i) => (
                  <div key={i} className="d-flex justify-content-between small mb-2 text-muted">
                    <span>{a.name} × {a.qty}</span>
                    <span>₹{(a.qty * a.charge).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <hr className="my-2" />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Total</span>
                  <span className="fw-bold text-theme fs-6">₹{bill.total.toLocaleString('en-IN')}</span>
                </div>
              </Card.Body>
            </Card>
          )
        })()}

        {/* Booking history (expandable, mock data) */}
        <Card className="mb-0 border-0 bg-light">
          <Button
            variant="link"
            className="text-decoration-none p-2 w-100 d-flex align-items-center justify-content-between"
            onClick={() => setHistoryOpen(!historyOpen)}
            aria-expanded={historyOpen}
          >
            <span className="small">
              <FontAwesomeIcon icon={faHistory} className="me-2 text-muted" />
              View booking history for this room
            </span>
            <FontAwesomeIcon icon={historyOpen ? faChevronUp : faChevronDown} className="text-muted small" />
          </Button>
          <Collapse in={historyOpen}>
            <Card.Body className="pt-0">
              <ListGroup variant="flush" className="small">
                {getMockBookingHistory(room.id).map((h) => (
                  <ListGroup.Item key={h.id} className="px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="fw-medium">{h.bookingNumber}</span>
                      <Badge bg="secondary">{BOOKING_STATUS_LABELS[h.status]}</Badge>
                    </div>
                    <div className="text-muted">{h.guestName}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {formatDate(h.checkInAt)} → {formatDate(h.expectedCheckOutAt)}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Collapse>
        </Card>
      </Modal.Body>
      <Modal.Footer className="d-flex flex-wrap gap-2 justify-content-between">
        <div className="d-flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
          {hasActiveBooking && booking?.status === 'booked' && (
            <Button variant="outline-danger" onClick={handleCancelBooking}>
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              Cancel Booking
            </Button>
          )}
        </div>
        <div className="d-flex flex-wrap gap-2">
          {isAvailable && (
            <Button
              variant="primary"
              onClick={handleNewBooking}
              style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Save & New Booking
            </Button>
          )}
          {canCheckIn && (
            <Button variant="success" onClick={handleCheckIn}>
              <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
              Check-In
            </Button>
          )}
          {canCheckOut && (
            <Button variant="warning" onClick={handleCheckOut}>
              <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
              Check-Out
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default RoomDetailModal
