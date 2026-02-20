import React from 'react'
import { Card } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

const STATUS_COLORS = {
  available: 'success',
  reserved: 'warning',
  occupied: 'danger',
  cleaning: 'secondary',
  maintenance: 'dark',
}

const STATUS_LABELS = {
  available: 'Free',
  reserved: 'Reserved',
  occupied: 'Occupied',
  cleaning: 'Cleaning',
  maintenance: 'Maint.',
}

/** Get booking pill label: Due Check-in, Due Check-out, Overstay, or Upcoming (based on selectedDate) */
function getBookingPill(booking, selectedDateStr) {
  if (!booking) return null
  const dateStr = selectedDateStr || new Date().toISOString().slice(0, 10)
  const today = dateStr
  const checkInDate = booking.checkInAt ? new Date(booking.checkInAt).toISOString().slice(0, 10) : ''
  const checkOutDate = booking.expectedCheckOutAt ? new Date(booking.expectedCheckOutAt).toISOString().slice(0, 10) : ''
  if (booking.status === 'checked_in') {
    if (checkOutDate < today) return { label: 'Overstay', variant: 'danger' }
    if (checkOutDate === today) return { label: 'Due Check-out', variant: 'warning' }
    return { label: 'Upcoming', variant: 'info' }
  }
  if (booking.status === 'booked') {
    if (checkInDate === today) return { label: 'Due Check-in', variant: 'info' }
    if (checkInDate > today) return { label: 'Upcoming', variant: 'secondary' }
    return { label: 'Due Check-in', variant: 'warning' }
  }
  return null
}

const RoomCard = ({ room, onClick, selectedDate }) => {
  const statusColor = STATUS_COLORS[room.status] || 'secondary'
  const booking = room.activeBooking
  const pill = getBookingPill(booking, selectedDate)

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch {
      return ''
    }
  }

  return (
    <Card
      className={`room-card room-card--${room.status} h-100 border cursor-pointer`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <Card.Body className="p-2">
        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-bold text-theme fs-6">{room.roomNumber}</span>
          <span className={`badge bg-${statusColor} text-uppercase`} style={{ fontSize: '0.65rem' }}>
            {STATUS_LABELS[room.status]}
          </span>
        </div>
        <div className="small text-muted" style={{ fontSize: '0.7rem' }}>
          {room.categoryName} · F{room.floorNumber}
          {room.maxOccupancy != null && (
            <span className="ms-1" title="Max occupancy"> · Max {room.maxOccupancy}</span>
          )}
        </div>
        {booking && (
          <div className="mt-1 pt-1 border-top small" style={{ fontSize: '0.65rem' }}>
            {pill && (
              <span className={`badge bg-${pill.variant} me-1 mb-1`} style={{ fontSize: '0.6rem' }}>
                {pill.label}
              </span>
            )}
            <div className="text-truncate fw-medium" title={booking.guestName}>
              <FontAwesomeIcon icon={faUser} className="me-1" />
              {booking.guestName}
            </div>
            <div className="text-muted">
              {formatTime(booking.checkInAt)}–{formatTime(booking.expectedCheckOutAt)}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export default RoomCard
