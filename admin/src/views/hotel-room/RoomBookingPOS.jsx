import React, { useState, useMemo, useRef, useCallback } from 'react'
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

/** Build today's timeline from current rooms and selected date (YYYY-MM-DD) */
function buildTimelineFromRooms(rooms, selectedDateStr) {
  const dateStr = selectedDateStr || new Date().toISOString().slice(0, 10)
  const toDateStr = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '')
  const formatT = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '')
  const getNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 1
    return Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (24 * 60 * 60 * 1000)))
  }
  const occupied = rooms.filter(r => r.status === 'occupied' && r.activeBooking)
  const reserved = rooms.filter(r => r.status === 'reserved' && r.activeBooking)
  const checkOuts = occupied
    .filter(r => toDateStr(r.activeBooking.expectedCheckOutAt) === dateStr)
    .sort((a, b) => new Date(a.activeBooking.expectedCheckOutAt) - new Date(b.activeBooking.expectedCheckOutAt))
    .map(r => ({
      type: 'check_out',
      time: formatT(r.activeBooking.expectedCheckOutAt),
      roomId: r.id,
      roomNumber: r.roomNumber,
      categoryName: r.categoryName,
      bookingId: r.activeBooking.id,
      bookingNumber: r.activeBooking.bookingNumber,
      guestName: r.activeBooking.guestName,
      nights: getNights(r.activeBooking.checkInAt, r.activeBooking.expectedCheckOutAt),
      status: 'due',
      expectedCheckOutAt: r.activeBooking.expectedCheckOutAt,
    }))
  const checkIns = reserved
    .filter(r => toDateStr(r.activeBooking.checkInAt) === dateStr)
    .sort((a, b) => new Date(a.activeBooking.checkInAt) - new Date(b.activeBooking.checkInAt))
    .map(r => ({
      type: 'check_in',
      time: formatT(r.activeBooking.checkInAt),
      roomId: r.id,
      roomNumber: r.roomNumber,
      categoryName: r.categoryName,
      bookingId: r.activeBooking.id,
      bookingNumber: r.activeBooking.bookingNumber,
      guestName: r.activeBooking.guestName,
      nights: getNights(r.activeBooking.checkInAt, r.activeBooking.expectedCheckOutAt),
      status: 'due',
      checkInAt: r.activeBooking.checkInAt,
    }))
  const upcomingCheckOuts = occupied
    .filter(r => toDateStr(r.activeBooking.expectedCheckOutAt) === dateStr)
    .slice(0, 3)
    .map(r => ({ type: 'upcoming', time: formatT(r.activeBooking.expectedCheckOutAt), roomId: r.id, roomNumber: r.roomNumber, categoryName: r.categoryName, bookingId: r.activeBooking.id, guestName: r.activeBooking.guestName, action: 'Check-out' }))
  const upcomingCheckIns = reserved
    .filter(r => toDateStr(r.activeBooking.checkInAt) === dateStr)
    .slice(0, 3)
    .map(r => ({ type: 'upcoming', time: formatT(r.activeBooking.checkInAt), roomId: r.id, roomNumber: r.roomNumber, categoryName: r.categoryName, bookingId: r.activeBooking.id, guestName: r.activeBooking.guestName, action: 'Check-in' }))
  return {
    checkOuts,
    checkIns,
    upcoming: [...upcomingCheckOuts, ...upcomingCheckIns],
  }
}

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

  const [rooms, setRooms] = useState(() => buildMockRooms())
  const [linkGroups, setLinkGroups] = useState({ L1: [11, 12, 13] })
  const nextBookingIdRef = useRef(100)
  const nextLinkGroupIdRef = useRef(10)
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
    const floorSet = new Set(rooms.map(r => r.floorNumber).sort((a, b) => a - b))
    return [{ value: '', label: 'All Floors' }, ...Array.from(floorSet).map(f => ({ value: String(f), label: `Floor ${f}` }))]
  }, [rooms])

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
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
  }, [rooms, statusFilter, categoryFilter, floorFilter, searchQuery])

  const timeline = useMemo(
    () => buildTimelineFromRooms(rooms, selectedDate),
    [rooms, selectedDate]
  )

  const summary = useMemo(() => {
    const total = rooms.length
    const available = rooms.filter(r => r.status === 'available').length
    const occupied = rooms.filter(r => r.status === 'occupied').length
    const reserved = rooms.filter(r => r.status === 'reserved').length
    const cleaning = rooms.filter(r => r.status === 'cleaning').length
    const maintenance = rooms.filter(r => r.status === 'maintenance').length
    return { total, available, occupied, reserved, cleaning, maintenance }
  }, [rooms])

  const handleRoomCardClick = (room, booking = null) => {
    setSelectedRoom(room)
    setSelectedBooking(booking || room.activeBooking)
    setShowRoomModal(true)
  }

  const handleTimelineItemClick = useCallback((item) => {
    const room = rooms.find(r => r.id === item.roomId)
    if (room) {
      setSelectedRoom(room)
      setSelectedBooking(room.activeBooking)
      setShowRoomModal(true)
    }
  }, [rooms])

  const handleCloseModal = useCallback(() => {
    setShowRoomModal(false)
    setSelectedRoom(null)
    setSelectedBooking(null)
  }, [])

  const handleNewBooking = useCallback((roomId, formData) => {
    const bookingId = nextBookingIdRef.current++
    const booking = {
      id: bookingId,
      bookingNumber: `#BOOK${bookingId}`,
      guestName: formData.guestName || 'Guest',
      guestMobile: formData.guestMobile || '',
      bookingType: formData.bookingType || 'walk_in',
      checkInAt: formData.checkInAt || new Date().toISOString(),
      expectedCheckOutAt: formData.expectedCheckOutAt || new Date(Date.now() + 86400000).toISOString(),
      status: 'booked',
    }
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'reserved', activeBooking: booking } : r))
    handleCloseModal()
  }, [handleCloseModal])

  const handleCheckIn = useCallback((roomId) => {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId || !r.activeBooking) return r
      return { ...r, status: 'occupied', activeBooking: { ...r.activeBooking, status: 'checked_in' } }
    }))
    handleCloseModal()
  }, [handleCloseModal])

  const handleCheckOut = useCallback((roomId) => {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId || !r.activeBooking) return r
      return { ...r, status: 'cleaning', activeBooking: { ...r.activeBooking, status: 'checked_out' } }
    }))
    handleCloseModal()
  }, [handleCloseModal])

  const handleCancelBooking = useCallback((roomId) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'available', activeBooking: null } : r))
    handleCloseModal()
  }, [handleCloseModal])

  const handleUpdateBooking = useCallback((roomId, payload) => {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId || !r.activeBooking) return r
      return {
        ...r,
        activeBooking: {
          ...r.activeBooking,
          guestName: payload.guestName ?? r.activeBooking.guestName,
          guestMobile: payload.guestMobile ?? r.activeBooking.guestMobile,
          checkInAt: payload.checkInAt ?? r.activeBooking.checkInAt,
          expectedCheckOutAt: payload.expectedCheckOutAt ?? r.activeBooking.expectedCheckOutAt,
          bookingType: payload.bookingType ?? r.activeBooking.bookingType,
        },
      }
    }))
    handleCloseModal()
  }, [handleCloseModal])

  const getMockBillTotal = useCallback((room, booking) => {
    if (!room || !booking?.checkInAt || !booking?.expectedCheckOutAt) return 0
    const nights = Math.max(1, Math.ceil((new Date(booking.expectedCheckOutAt) - new Date(booking.checkInAt)) / (24 * 60 * 60 * 1000)))
    const rates = { Standard: 2000, Deluxe: 3500, Suite: 5000 }
    const rate = rates[room.categoryName] ?? 2500
    const addonsTotal = (room.id % 2) === 0 ? 700 : 500
    return rate * nights + addonsTotal
  }, [])
  const linkedBillDetails = useMemo(() => {
    if (!selectedRoom?.id) return { linkedRooms: [], combinedTotal: 0 }
    const groupRoomIds = Object.values(linkGroups).find(ids => ids.includes(selectedRoom.id))
    if (!groupRoomIds || groupRoomIds.length < 2) return { linkedRooms: [], combinedTotal: 0 }
    const linkedRooms = groupRoomIds
      .map(rid => rooms.find(r => r.id === rid))
      .filter(Boolean)
      .map(r => ({
        roomId: r.id,
        roomNumber: r.roomNumber,
        categoryName: r.categoryName,
        total: r.activeBooking ? getMockBillTotal(r, r.activeBooking) : 0,
      }))
    const combinedTotal = linkedRooms.reduce((sum, x) => sum + x.total, 0)
    return { linkedRooms, combinedTotal }
  }, [selectedRoom?.id, rooms, linkGroups, getMockBillTotal])

  const handleLinkRooms = useCallback((roomId, selectedRoomIds) => {
    if (!selectedRoomIds?.length) return
    const existingGroup = Object.entries(linkGroups).find(([, ids]) => ids.includes(roomId))
    const newIds = [...new Set([roomId, ...selectedRoomIds])]
    if (existingGroup) {
      const [key, ids] = existingGroup
      const merged = [...new Set([...ids, ...selectedRoomIds])]
      setLinkGroups(prev => ({ ...prev, [key]: merged }))
    } else {
      const newKey = `L${nextLinkGroupIdRef.current++}`
      setLinkGroups(prev => ({ ...prev, [newKey]: newIds }))
    }
  }, [linkGroups])

  const handleUnlinkRoom = useCallback((roomId) => {
    setLinkGroups(prev => {
      const next = { ...prev }
      for (const [key, ids] of Object.entries(next)) {
        const filtered = ids.filter(id => id !== roomId)
        if (filtered.length < 2) delete next[key]
        else next[key] = filtered
      }
      return next
    })
  }, [])

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
            selectedDate={selectedDate}
          />
        </Col>
        <Col xs={12} lg={4} xl={3} className="timeline-col bg-white">
          <TodayTimelinePanel
            timeline={timeline}
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
        onNewBooking={handleNewBooking}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onCancelBooking={handleCancelBooking}
        onUpdateBooking={handleUpdateBooking}
        linkedBillDetails={linkedBillDetails}
        allRooms={rooms}
        onLinkRooms={handleLinkRooms}
        onUnlinkRoom={handleUnlinkRoom}
        mockCustomers={[
          { id: 1, name: 'John Doe', mobile: '9876543210' },
          { id: 2, name: 'Jane Smith', mobile: '9876543211' },
        ]}
      />
    </Container>
  )
}

export default RoomBookingPOS
