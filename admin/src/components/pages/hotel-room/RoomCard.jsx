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

const RoomCard = ({ room, onClick }) => {
  const statusColor = STATUS_COLORS[room.status] || 'secondary'
  const booking = room.activeBooking

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
        </div>
        {booking && (
          <div className="mt-1 pt-1 border-top small" style={{ fontSize: '0.65rem' }}>
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
