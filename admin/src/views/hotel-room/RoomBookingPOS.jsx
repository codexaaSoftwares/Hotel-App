import React, { useState, useMemo } from 'react'
import { Container, Row, Col, Form, Badge, InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDay, faSearch } from '@fortawesome/free-solid-svg-icons'
import RoomGridPanel from '../../components/pages/hotel-room/RoomGridPanel'
import TodayTimelinePanel from '../../components/pages/hotel-room/TodayTimelinePanel'
import RoomDetailModal from '../../components/pages/hotel-room/RoomDetailModal'
import { usePermissions } from '../../hooks'
import { PERMISSIONS } from '../../constants/permissions'

// Mock data for Room Booking POS (replace with API when backend is ready)
// 40 rooms: floors 1–4, mix of Standard/Deluxe/Suite, varied statuses
const GUEST_NAMES = ['John Doe', 'Jane Smith', 'Raj Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh', 'Ananya Nair', 'Rahul Verma', 'Kavita Joshi', 'David Lee', 'Maria Garcia', 'Carlos Ruiz', 'Emma Wilson', 'James Brown']
const buildMockRooms = () => {
  const rooms = []
  const categories = ['Standard', 'Deluxe', 'Suite']
  const statuses = ['available', 'occupied', 'reserved', 'cleaning', 'maintenance']
  let id = 1
  for (let floor = 1; floor <= 4; floor++) {
    for (let num = 1; num <= 10; num++) {
      const roomNum = `${floor}0${num}`.slice(-3)
      const catIdx = (floor + num) % 3
      const cat = categories[catIdx]
      const maxOcc = cat === 'Suite' ? 4 : cat === 'Deluxe' ? 3 : 2
      // Distribute statuses: ~40% available, ~25% occupied, ~15% reserved, ~10% cleaning, ~10% maintenance
      const statusRand = (floor * 10 + num) % 20
      let status = 'available'
      if (statusRand < 8) status = 'occupied'
      else if (statusRand < 11) status = 'reserved'
      else if (statusRand < 13) status = 'cleaning'
      else if (statusRand < 15) status = 'maintenance'
      const hasBooking = ['occupied', 'reserved'].includes(status)
      const guest = hasBooking ? GUEST_NAMES[(id - 1) % GUEST_NAMES.length] : null
      const checkIn = hasBooking ? new Date(Date.now() - (status === 'occupied' ? 86400000 : 0)).toISOString() : null
      const checkOut = hasBooking ? new Date(Date.now() + 86400000 * (status === 'occupied' ? 1 : 2)).toISOString() : null
      rooms.push({
        id,
        roomNumber: roomNum,
        categoryName: cat,
        floorNumber: floor,
        maxOccupancy: maxOcc,
        status,
        isActive: true,
        activeBooking: hasBooking ? {
          id: 20 + id,
          bookingNumber: `#BOOK${20 + id}`,
          bookingType: statusRand % 3 === 0 ? 'online' : statusRand % 3 === 1 ? 'advance' : 'walk_in',
          guestName: guest,
          checkInAt: checkIn,
          expectedCheckOutAt: checkOut,
          status: status === 'occupied' ? 'checked_in' : 'booked',
        } : null,
      })
      id++
    }
  }
  return rooms
}
const MOCK_ROOMS = buildMockRooms()

// Build timeline from mock rooms (occupied = check-outs, reserved = check-ins)
const buildMockTimeline = () => {
  const occupied = MOCK_ROOMS.filter(r => r.status === 'occupied' && r.activeBooking).slice(0, 4)
  const reserved = MOCK_ROOMS.filter(r => r.status === 'reserved' && r.activeBooking).slice(0, 4)
  const formatT = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  return {
    checkOuts: occupied.map((r, i) => ({
      type: 'check_out', time: formatT(r.activeBooking.expectedCheckOutAt), roomId: r.id, roomNumber: r.roomNumber,
      categoryName: r.categoryName, bookingId: r.activeBooking.id, bookingNumber: r.activeBooking.bookingNumber,
      guestName: r.activeBooking.guestName, nights: 1, status: 'due', expectedCheckOutAt: r.activeBooking.expectedCheckOutAt,
    })),
    checkIns: reserved.map((r, i) => ({
      type: 'check_in', time: formatT(r.activeBooking.checkInAt), roomId: r.id, roomNumber: r.roomNumber,
      categoryName: r.categoryName, bookingId: r.activeBooking.id, bookingNumber: r.activeBooking.bookingNumber,
      guestName: r.activeBooking.guestName, nights: 2, status: 'due', checkInAt: r.activeBooking.checkInAt,
    })),
    upcoming: [
      ...occupied.slice(0, 2).map(r => ({ type: 'upcoming', time: formatT(r.activeBooking.expectedCheckOutAt), roomId: r.id, roomNumber: r.roomNumber, categoryName: r.categoryName, bookingId: r.activeBooking.id, guestName: r.activeBooking.guestName, action: 'Check-out' })),
      ...reserved.slice(0, 2).map(r => ({ type: 'upcoming', time: formatT(r.activeBooking.checkInAt), roomId: r.id, roomNumber: r.roomNumber, categoryName: r.categoryName, bookingId: r.activeBooking.id, guestName: r.activeBooking.guestName, action: 'Check-in' })),
    ],
  }
}
const MOCK_TODAY_TIMELINE = buildMockTimeline()

const ROOM_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Deluxe', label: 'Deluxe' },
  { value: 'Suite', label: 'Suite' },
]

const ROOM_STATUSES = [
  { value: '', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
]

const RoomBookingPOS = () => {
  const { hasPermission } = usePermissions()
  const canAccess = hasPermission(PERMISSIONS.ROOM_READ) || hasPermission(PERMISSIONS.BOOKING_READ) || hasPermission(PERMISSIONS.HOTEL_ROOM_DASHBOARD_READ)

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [floorFilter, setFloorFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showRoomModal, setShowRoomModal] = useState(false)

  const floors = useMemo(() => {
    const floorSet = new Set(MOCK_ROOMS.map(r => r.floorNumber).sort((a, b) => a - b))
    return [{ value: '', label: 'All Floors' }, ...Array.from(floorSet).map(f => ({ value: String(f), label: `Floor ${f}` }))]
  }, [])

  const filteredRooms = useMemo(() => {
    return MOCK_ROOMS.filter((room) => {
      if (statusFilter && room.status !== statusFilter) return false
      if (categoryFilter && room.categoryName !== categoryFilter) return false
      if (floorFilter && String(room.floorNumber) !== floorFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchRoom = room.roomNumber?.toLowerCase().includes(q)
        const matchGuest = room.activeBooking?.guestName?.toLowerCase().includes(q)
        const matchBooking = room.activeBooking?.bookingNumber?.toLowerCase().includes(q)
        if (!matchRoom && !matchGuest && !matchBooking) return false
      }
      return true
    })
  }, [statusFilter, categoryFilter, floorFilter, searchQuery])

  const summary = useMemo(() => {
    const total = MOCK_ROOMS.length
    const available = MOCK_ROOMS.filter(r => r.status === 'available').length
    const occupied = MOCK_ROOMS.filter(r => r.status === 'occupied').length
    const reserved = MOCK_ROOMS.filter(r => r.status === 'reserved').length
    const cleaning = MOCK_ROOMS.filter(r => r.status === 'cleaning').length
    const maintenance = MOCK_ROOMS.filter(r => r.status === 'maintenance').length
    return { total, available, occupied, reserved, cleaning, maintenance }
  }, [])

  const handleRoomCardClick = (room, booking = null) => {
    setSelectedRoom(room)
    setSelectedBooking(booking || room.activeBooking)
    setShowRoomModal(true)
  }

  const handleTimelineItemClick = (item) => {
    const room = MOCK_ROOMS.find(r => r.id === item.roomId)
    if (room) {
      setSelectedRoom(room)
      setSelectedBooking(room.activeBooking)
      setShowRoomModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowRoomModal(false)
    setSelectedRoom(null)
    setSelectedBooking(null)
  }

  const handleModalAction = () => {
    // When API is integrated, refresh data here
    handleCloseModal()
  }

  if (!canAccess) {
    return (
      <Container fluid className="py-5">
        <div className="text-center">
          <h4>Access Denied</h4>
          <p>You don&apos;t have permission to access the Room Booking POS Panel.</p>
        </div>
      </Container>
    )
  }

  return (
    <Container fluid className="room-booking-pos p-0">
      {/* Header with filters - compact */}
      <div className="room-pos-header bg-white border-bottom shadow-sm p-2" style={{ fontSize: '0.8rem' }}>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <InputGroup size="sm" className="room-pos-filter-input" style={{ maxWidth: '180px', fontSize: '0.8rem' }}>
            <InputGroup.Text className="py-1 px-1" style={{ fontSize: '0.75rem' }}>
              <FontAwesomeIcon icon={faCalendarDay} className="me-1" />
              Date
            </InputGroup.Text>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="py-1"
              style={{ fontSize: '0.8rem' }}
            />
          </InputGroup>
          <InputGroup size="sm" className="room-pos-filter-input" style={{ maxWidth: '165px', fontSize: '0.8rem' }}>
            <InputGroup.Text className="py-1 px-1" style={{ fontSize: '0.75rem' }}>Status</InputGroup.Text>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1"
              style={{ fontSize: '0.8rem' }}
            >
              {ROOM_STATUSES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Form.Select>
          </InputGroup>
          <InputGroup size="sm" className="room-pos-filter-input" style={{ maxWidth: '155px', fontSize: '0.8rem' }}>
            <InputGroup.Text className="py-1 px-1" style={{ fontSize: '0.75rem' }}>Cat</InputGroup.Text>
            <Form.Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1"
              style={{ fontSize: '0.8rem' }}
            >
              {ROOM_CATEGORIES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Form.Select>
          </InputGroup>
          <InputGroup size="sm" className="room-pos-filter-input" style={{ maxWidth: '140px', fontSize: '0.8rem' }}>
            <InputGroup.Text className="py-1 px-1" style={{ fontSize: '0.75rem' }}>Floor</InputGroup.Text>
            <Form.Select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="py-1"
              style={{ fontSize: '0.8rem' }}
            >
              {floors.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Form.Select>
          </InputGroup>
          <InputGroup size="sm" className="room-pos-filter-input" style={{ maxWidth: '220px', fontSize: '0.8rem' }}>
            <InputGroup.Text className="py-1 px-1" style={{ fontSize: '0.75rem' }}>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Room / Guest / #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-1"
              style={{ fontSize: '0.8rem' }}
            />
          </InputGroup>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center mt-1">
          <Badge bg="secondary">Total {summary.total}</Badge>
          <Badge bg="success">Avail {summary.available}</Badge>
          <Badge bg="danger">Occ {summary.occupied}</Badge>
          <Badge bg="warning">Res {summary.reserved}</Badge>
          <Badge bg="info">Clean {summary.cleaning}</Badge>
          <Badge bg="dark">Maint {summary.maintenance}</Badge>
        </div>
      </div>

      {/* Split layout: Room Grid + Today Timeline */}
      <Row className="g-0 room-pos-layout" style={{ minHeight: 'calc(100vh - 130px)' }}>
        <Col xs={12} lg={8} xl={9} className="room-grid-col border-end bg-light">
          <RoomGridPanel
            rooms={filteredRooms}
            onRoomClick={handleRoomCardClick}
          />
        </Col>
        <Col xs={12} lg={4} xl={3} className="timeline-col bg-white">
          <TodayTimelinePanel
            timeline={MOCK_TODAY_TIMELINE}
            onItemClick={handleTimelineItemClick}
          />
        </Col>
      </Row>

      {/* Room Detail Modal */}
      <RoomDetailModal
        show={showRoomModal}
        onHide={handleCloseModal}
        room={selectedRoom}
        booking={selectedBooking}
        onAction={handleModalAction}
        mockCustomers={[
          { id: 1, name: 'John Doe', mobile: '9876543210' },
          { id: 2, name: 'Jane Smith', mobile: '9876543211' },
        ]}
      />
    </Container>
  )
}

export default RoomBookingPOS
