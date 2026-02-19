import React from 'react'
import { Card, ListGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignInAlt, faSignOutAlt, faClock, faUser } from '@fortawesome/free-solid-svg-icons'

const TodayTimelinePanel = ({ timeline, onItemClick }) => {
  const formatTime = (timeStr) => timeStr || ''

  const TimelineSection = ({ title, icon, items, emptyMessage }) => (
    <div className="mb-2">
      <div className="d-flex align-items-center mb-1 small fw-semibold text-muted" style={{ fontSize: '0.75rem' }}>
        <FontAwesomeIcon icon={icon} className="me-1 text-theme" style={{ fontSize: '0.65rem' }} />
        {title}
      </div>
      {!items || items.length === 0 ? (
        <p className="small text-muted mb-0 py-1" style={{ fontSize: '0.7rem' }}>{emptyMessage}</p>
      ) : (
        <ListGroup variant="flush" className="small">
          {items.map((item, idx) => (
            <ListGroup.Item
              key={`${item.type}-${item.roomId}-${item.bookingId || idx}`}
              action
              onClick={() => onItemClick(item)}
              className="py-1 px-2 cursor-pointer timeline-item"
              style={{ fontSize: '0.75rem' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-medium">{formatTime(item.time)}</span>
                <span className={`badge ${item.status === 'due' ? 'bg-warning' : 'bg-success'}`} style={{ fontSize: '0.6rem' }}>
                  {item.status === 'due' ? 'Due' : item.status}
                </span>
              </div>
              <div className="text-truncate">
                <span className="fw-semibold">{item.roomNumber}</span>
                <span className="text-muted mx-1">·</span>
                <span className="text-muted">{item.guestName}</span>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  )

  return (
    <div className="today-timeline-panel p-2 h-100 overflow-auto">
      <h6 className="mb-2 fw-semibold small">
        <span className="text-theme">Today&apos;s Activity</span>
      </h6>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-2">
          <TimelineSection
            title="Check-outs"
            icon={faSignOutAlt}
            items={timeline?.checkOuts || []}
            emptyMessage="No check-outs today."
          />
          <TimelineSection
            title="Check-ins"
            icon={faSignInAlt}
            items={timeline?.checkIns || []}
            emptyMessage="No check-ins today."
          />
          <TimelineSection
            title="Upcoming"
            icon={faClock}
            items={timeline?.upcoming || []}
            emptyMessage="Nothing upcoming."
          />
        </Card.Body>
      </Card>
    </div>
  )
}

export default TodayTimelinePanel
