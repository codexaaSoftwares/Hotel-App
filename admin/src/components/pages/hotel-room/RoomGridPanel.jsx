import React from 'react'
import { Row, Col } from 'react-bootstrap'
import RoomCard from './RoomCard'

const RoomGridPanel = ({ rooms, onRoomClick }) => {
  return (
    <div className="room-grid-panel p-2 h-100 overflow-auto">
      <h6 className="mb-2 fw-semibold small">
        <span className="text-theme">Room Grid</span>
        <span className="text-muted ms-1">({rooms.length})</span>
      </h6>
      <Row className="g-2">
        {rooms.length === 0 ? (
          <Col xs={12}>
            <div className="text-center py-5 text-muted">
              <p className="mb-0">No rooms match the current filters.</p>
            </div>
          </Col>
        ) : (
          rooms.map((room) => (
            <Col key={room.id} xs={6} sm={4} md={3} lg={2} xl={2}>
              <RoomCard room={room} onClick={() => onRoomClick(room)} />
            </Col>
          ))
        )}
      </Row>
    </div>
  )
}

export default RoomGridPanel
