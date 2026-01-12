import React, { useState, useEffect } from 'react'
import { Badge, Spinner } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import tableService from '../../../services/tableService'
import { useToast } from '../../../components'

const TablesPanel = ({ currentTable, onTableSelect }) => {
  const { error } = useToast()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    setLoading(true)
    try {
      const response = await tableService.getTables({
        is_active: true, // Only show active tables
        include_bills: true, // Include bill information for POS Panel
        limit: 100, // Get all tables
      })

      if (response.success) {
        // Filter only active tables and sort by table_number
        const activeTables = (response.data || [])
          .filter((table) => table.is_active)
          .sort((a, b) => {
            // Sort by table number (extract numeric part if exists)
            const numA = parseInt(a.table_number.replace(/\D/g, '')) || 0
            const numB = parseInt(b.table_number.replace(/\D/g, '')) || 0
            return numA - numB
          })
        setTables(activeTables)
      } else {
        error && error(response.message || 'Failed to load tables')
      }
    } catch (err) {
      console.error('Error loading tables:', err)
      error && error('Failed to load tables. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#10b981' // Green
      case 'occupied':
        return '#f59e0b' // Orange
      case 'reserved':
        return '#3b82f6' // Blue
      case 'cleaning':
        return '#6b7280' // Gray
      case 'maintenance':
        return '#ef4444' // Red
      default:
        return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <Spinner animation="border" variant="primary" size="sm" />
      </div>
    )
  }

  return (
    <div className="tables-panel h-100 d-flex flex-column">
      {/* Panel Header - Compact */}
      <div className="p-2 border-bottom bg-white">
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="mb-0 fw-semibold" style={{ fontSize: '14px' }}>Tables</h6>
          <Badge bg="secondary" style={{ fontSize: '10px' }}>
            {tables.length}
          </Badge>
        </div>
      </div>

      {/* Tables List - Compact */}
      <div className="flex-grow-1 overflow-auto">
        {tables.map((table) => {
          const isSelected = currentTable?.id === table.id
          const statusColor = getStatusColor(table.status)
          const isDisabled = table.status === 'cleaning' || table.status === 'maintenance'

          return (
            <div
              key={table.id}
              className={`table-list-item p-2 cursor-pointer transition-all ${
                isSelected ? 'bg-primary text-white shadow-sm' : isDisabled ? 'opacity-50 bg-light' : 'bg-white'
              }`}
              onClick={() => {
                if (!isDisabled) {
                  onTableSelect(table)
                }
              }}
              style={{
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                minHeight: '48px',
                borderBottom: '1px solid #e5e7eb',
                borderLeft: isSelected ? '3px solid #0d9488' : '3px solid transparent',
                boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2 flex-grow-1">
                  {/* Status Indicator */}
                  <FontAwesomeIcon
                    icon={faCircle}
                    style={{
                      fontSize: '8px',
                      color: statusColor,
                    }}
                  />
                  {/* Table Number */}
                  <span className="fw-semibold" style={{ fontSize: '13px' }}>
                    {table.table_number}
                  </span>
                  {/* Table Name (if exists) */}
                  {table.table_name && (
                    <span className="text-muted" style={{ fontSize: '11px' }}>
                      - {table.table_name}
                    </span>
                  )}
                </div>

                {/* Active Orders Badge */}
                {table.active_orders_count > 0 && (
                  <Badge
                    bg={isSelected ? 'light' : 'info'}
                    text={isSelected ? 'dark' : 'white'}
                    style={{ fontSize: '10px', minWidth: '20px' }}
                  >
                    {table.active_orders_count}
                  </Badge>
                )}

                {/* Total Amount (if has active orders) */}
                {table.active_bills_total > 0 && (
                  <span
                    className={`ms-2 fw-semibold ${isSelected ? 'text-dark' : 'text-primary'}`}
                    style={{ fontSize: '11px' }}
                  >
                    ₹{parseFloat(table.active_bills_total).toFixed(0)}
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {tables.length === 0 && (
          <div className="text-center text-muted p-4">
            <p style={{ fontSize: '12px' }}>No tables available</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TablesPanel

