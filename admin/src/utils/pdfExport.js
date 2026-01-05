/**
 * PDF Export Utility
 * Uses jsPDF library to export data to PDF
 */

// Simple PDF export using browser's print functionality
// For full PDF generation, install jspdf: npm install jspdf jspdf-autotable

export const exportToPDF = (data, columns, title = 'Export', filename = 'export.pdf') => {
  try {
    // Create a temporary table element
    const table = document.createElement('table')
    table.style.borderCollapse = 'collapse'
    table.style.width = '100%'
    table.style.fontSize = '12px'
    
    // Create header row
    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr')
    headerRow.style.backgroundColor = '#f8f9fa'
    headerRow.style.borderBottom = '2px solid #dee2e6'
    
    columns.forEach(col => {
      const th = document.createElement('th')
      th.textContent = col.label || col.key
      th.style.padding = '8px'
      th.style.border = '1px solid #dee2e6'
      th.style.textAlign = 'left'
      headerRow.appendChild(th)
    })
    
    thead.appendChild(headerRow)
    table.appendChild(thead)
    
    // Create body rows
    const tbody = document.createElement('tbody')
    data.forEach((item, index) => {
      const row = document.createElement('tr')
      row.style.borderBottom = '1px solid #dee2e6'
      
      columns.forEach(col => {
        const td = document.createElement('td')
        td.style.padding = '8px'
        td.style.border = '1px solid #dee2e6'
        
        if (col.render) {
          // For render functions, we need to extract text content
          const tempDiv = document.createElement('div')
          const rendered = col.render(null, item, index)
          if (typeof rendered === 'string') {
            td.textContent = rendered
          } else {
            td.textContent = item[col.key] || ''
          }
        } else {
          td.textContent = item[col.key] || ''
        }
        row.appendChild(td)
      })
      tbody.appendChild(row)
    })
    
    table.appendChild(tbody)
    
    // Create a temporary container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.appendChild(table)
    document.body.appendChild(container)
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            @media print {
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          ${table.outerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print()
      // Clean up
      setTimeout(() => {
        document.body.removeChild(container)
        printWindow.close()
      }, 1000)
    }
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    alert('Failed to export PDF. Please try again.')
  }
}

export const exportPhotographersToPDF = (photographers, filters = {}) => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'total_services', label: 'Services' },
    { key: 'total_amount', label: 'Total Amount' },
    { key: 'status', label: 'Status' }
  ]
  
  const data = photographers.map(p => ({
    name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
    email: p.email || 'N/A',
    mobile: p.mobile || p.phone || 'N/A',
    total_services: p.total_services || p.total_orders || 0,
    total_amount: `₹${(p.total_amount || p.total_earnings || 0).toLocaleString('en-IN')}`,
    status: p.status || 'active'
  }))
  
  exportToPDF(data, columns, 'Photographers List', 'photographers.pdf')
}

export const exportSinglePhotographerToPDF = (photographer) => {
  if (!photographer) {
    console.error('No photographer data provided')
    return
  }

  const photographerName = photographer.name || `${photographer.firstName || ''} ${photographer.lastName || ''}`.trim()
  const photographerId = photographer.photographerId || photographer.customerId || `#${photographer.id}` || 'N/A'
  
  const totalAmount = photographer.total_amount || photographer.total_earnings || photographer.totalSpent || 0
  const paidAmount = photographer.paid_amount || photographer.wallet_balance || 0
  const remainingAmount = photographer.remaining_amount || (totalAmount - paidAmount)
  const totalServices = photographer.total_services || photographer.total_orders || photographer.totalOrders || 0

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getBranchIndicator = (photographer) => {
    if (!photographer) return ''
    
    const branchName = (photographer.branch_name || '').toLowerCase().trim()
    const branchCode = (photographer.branch_code || '').toUpperCase().trim()
    const branchId = photographer.branch_id
    
    if (branchName.includes('lunawada') || branchName.includes('luna') || branchName.includes('main')) {
      return 'L'
    }
    if (branchName.includes('vadodara') || branchName.includes('vado') || branchName.includes('baroda') || branchName.includes('mumbai')) {
      return 'V'
    }
    
    if (branchCode && branchCode.length > 0) {
      const firstChar = branchCode.charAt(0)
      if (firstChar === 'L') return 'L'
      if (firstChar === 'V') return 'V'
      if (firstChar === 'M' && branchCode.includes('001')) return 'L'
      if (firstChar === 'M' && branchCode.includes('002')) return 'V'
    }
    
    if (branchId) {
      if (branchId === 1) return 'L'
      if (branchId === 2) return 'V'
    }
    
    return ''
  }

  const branchIndicator = getBranchIndicator(photographer)
  const displayName = branchIndicator ? `${photographerName} (${branchIndicator})` : photographerName

  const htmlContent = `
    <!DOCTYPE html>
    <html>
        <head>
          <meta charset="UTF-8">
          <title>Photographer Profile - ${photographerName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #2c3e50;
              background: #ffffff;
              line-height: 1.6;
            }
            .container {
              max-width: 900px;
              margin: 0 auto;
              background: #ffffff;
            }
            .header {
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
              color: white;
              padding: 40px 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header h1 {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 10px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .header .subtitle {
              font-size: 14px;
              opacity: 0.95;
              font-weight: 300;
            }
            .header .photographer-id {
              background: rgba(255,255,255,0.2);
              display: inline-block;
              padding: 8px 20px;
              border-radius: 20px;
              margin-top: 15px;
              font-weight: 600;
              font-size: 16px;
            }
            .content {
              background: #ffffff;
              padding: 30px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .stat-card {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 25px;
              border-radius: 10px;
              border-left: 5px solid #8b5cf6;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .stat-card.earnings {
              border-left-color: #10b981;
              background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            }
            .stat-card.wallet {
              border-left-color: #3b82f6;
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            }
            .stat-card.rating {
              border-left-color: #f59e0b;
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            }
            .stat-card.orders {
              border-left-color: #8b5cf6;
              background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
            }
            .stat-label {
              font-size: 13px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
              font-weight: 600;
            }
            .stat-value {
              font-size: 28px;
              font-weight: 700;
              color: #1f2937;
            }
            .section {
              margin-bottom: 30px;
              background: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            .section-title {
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
              color: white;
              padding: 15px 20px;
              font-size: 18px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .section-title::before {
              content: '';
              width: 4px;
              height: 20px;
              background: white;
              border-radius: 2px;
            }
            .section-content {
              padding: 20px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .info-item {
              padding: 12px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            .info-item:last-child {
              border-bottom: none;
            }
            .info-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
              font-weight: 600;
            }
            .info-value {
              font-size: 16px;
              color: #1f2937;
              font-weight: 500;
            }
            .badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .badge.active {
              background: #d1fae5;
              color: #065f46;
            }
            .badge.suspended {
              background: #fee2e2;
              color: #991b1b;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #e5e7eb, transparent);
              margin: 20px 0;
            }
            @media print {
              body { 
                margin: 0;
                padding: 20px;
              }
              @page { 
                margin: 1cm;
                size: A4;
              }
              .section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📸 Photographer Profile</h1>
              <div class="subtitle">${photographerName}</div>
              <div class="photographer-id">ID: ${photographerId}</div>
              <div style="margin-top: 15px; font-size: 12px; opacity: 0.9;">
                Generated on: ${new Date().toLocaleString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            <div class="content">
              <!-- Statistics Cards -->
              <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
                <div class="stat-card earnings">
                  <div class="stat-label">Total Amount</div>
                  <div class="stat-value">${formatCurrency(totalAmount)}</div>
                </div>
                <div class="stat-card wallet">
                  <div class="stat-label">Paid Amount</div>
                  <div class="stat-value">${formatCurrency(paidAmount)}</div>
                </div>
                <div class="stat-card orders">
                  <div class="stat-label">Total Services</div>
                  <div class="stat-value">${totalServices}</div>
                </div>
                <div class="stat-card rating" style="grid-column: span 1;">
                  <div class="stat-label">Remaining Amount</div>
                  <div class="stat-value">${formatCurrency(remainingAmount)}</div>
                </div>
              </div>

              <!-- Personal Information -->
              <div class="section">
                <div class="section-title">👤 Personal Information</div>
                <div class="section-content">
                  <div class="info-grid">
                    <div class="info-item">
                      <div class="info-label">Full Name</div>
                      <div class="info-value">${displayName}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Photographer ID</div>
                      <div class="info-value">${photographerId}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Email</div>
                      <div class="info-value">${photographer.email || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Mobile</div>
                      <div class="info-value">${photographer.mobile || photographer.phone || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Status</div>
                      <div class="info-value">
                        <span class="badge ${photographer.status === 'active' ? 'active' : 'suspended'}">
                          ${photographer.status || 'active'}
                        </span>
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Joined Date</div>
                      <div class="info-value">${formatDate(photographer.joinedDate || photographer.createdAt || photographer.created_at)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contact Information -->
              ${(photographer.address || photographer.location) ? `
              <div class="section">
                <div class="section-title">📍 Contact Information</div>
                <div class="section-content">
                  <div class="info-grid">
                    ${typeof photographer.address === 'string' ? `
                      <div class="info-item" style="grid-column: span 2;">
                        <div class="info-label">Address</div>
                        <div class="info-value">${photographer.address}</div>
                      </div>
                    ` : (photographer.address && typeof photographer.address === 'object') ? `
                      <div class="info-item">
                        <div class="info-label">Street</div>
                        <div class="info-value">${photographer.address.street || 'N/A'}</div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">City</div>
                        <div class="info-value">${photographer.address.city || 'N/A'}</div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">State</div>
                        <div class="info-value">${photographer.address.state || 'N/A'}</div>
                      </div>
                      <div class="info-item">
                        <div class="info-label">Postal Code</div>
                        <div class="info-value">${photographer.address.postalCode || 'N/A'}</div>
                      </div>
                    ` : ''}
                    ${photographer.location ? `
                      <div class="info-item">
                        <div class="info-label">Location</div>
                        <div class="info-value">${photographer.location.city || photographer.location || 'N/A'}</div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
              ` : ''}

              <!-- Performance Statistics -->
              <div class="section">
                <div class="section-title">📊 Performance Statistics</div>
                <div class="section-content">
                  <div class="info-grid">
                    <div class="info-item">
                      <div class="info-label">Total Services</div>
                      <div class="info-value" style="font-size: 20px; font-weight: 700; color: #8b5cf6;">${totalServices}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Total Amount</div>
                      <div class="info-value" style="font-size: 20px; font-weight: 700; color: #10b981;">${formatCurrency(totalAmount)}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Paid Amount</div>
                      <div class="info-value" style="font-size: 20px; font-weight: 700; color: #3b82f6;">${formatCurrency(paidAmount)}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Remaining Amount</div>
                      <div class="info-value" style="font-size: 20px; font-weight: 700; color: ${remainingAmount > 0 ? '#ef4444' : '#8b5cf6'};">${formatCurrency(remainingAmount)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>This document was generated automatically by Codexaa Base Project</p>
              <p style="margin-top: 5px;">© ${new Date().getFullYear()} Codexaa Base Project. All rights reserved.</p>
            </div>
          </div>
        </body>
    </html>
  `

  // Create a new window for printing
  const printWindow = window.open('', '_blank')
  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

// Export order to PDF
export const exportOrderToPDF = (order) => {
  if (!order) {
    console.error('No order data provided')
    return
  }

  const orderNumber = order.orderNumber || order.id || 'N/A'
  const customerName = order.customer_name || 
    (order.customer ? (order.customer.name || `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()) : 'Unknown')
  const customerEmail = order.customer?.email || 'N/A'
  const customerPhone = order.customer?.mobile || order.customer?.phone || 'N/A'
  
  const totalAmount = order.total_amount || order.total || 0
  const paidAmount = order.paid_amount || order.paid || 0
  const balanceAmount = order.balance_amount || (totalAmount - paidAmount)
  const subtotal = order.subtotal || totalAmount
  const discount = order.flat_discount || order.discount || 0
  const items = order.items || []

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
      processing: { bg: '#dbeafe', color: '#1e40af', label: 'Processing' },
      completed: { bg: '#d1fae5', color: '#065f46', label: 'Completed' },
      cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' }
    }
    const statusInfo = statusMap[status?.toLowerCase()] || statusMap.pending
    return `<span style="background: ${statusInfo.bg}; color: ${statusInfo.color}; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${statusInfo.label}</span>`
  }

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusMap = {
      pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
      paid: { bg: '#d1fae5', color: '#065f46', label: 'Paid' },
      partial: { bg: '#dbeafe', color: '#1e40af', label: 'Partial' },
      failed: { bg: '#fee2e2', color: '#991b1b', label: 'Failed' }
    }
    const statusInfo = statusMap[paymentStatus?.toLowerCase()] || statusMap.pending
    return `<span style="background: ${statusInfo.bg}; color: ${statusInfo.color}; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${statusInfo.label}</span>`
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
        <head>
          <meta charset="UTF-8">
          <title>Order Invoice - ${orderNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #2c3e50;
              background: #ffffff;
              line-height: 1.6;
            }
            .container {
              max-width: 900px;
              margin: 0 auto;
              background: #ffffff;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              padding: 40px 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header h1 {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 10px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .header .subtitle {
              font-size: 14px;
              opacity: 0.95;
              font-weight: 300;
            }
            .header .order-number {
              background: rgba(255,255,255,0.2);
              display: inline-block;
              padding: 8px 20px;
              border-radius: 20px;
              margin-top: 15px;
              font-weight: 600;
              font-size: 16px;
            }
            .content {
              background: #ffffff;
              padding: 30px;
            }
            .info-section {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 30px;
              margin-bottom: 30px;
            }
            .info-box {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              border-left: 5px solid #3b82f6;
            }
            .info-box h3 {
              font-size: 16px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 15px;
              font-weight: 600;
            }
            .info-item {
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-item:last-child {
              border-bottom: none;
            }
            .info-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 4px;
              font-weight: 500;
            }
            .info-value {
              font-size: 14px;
              color: #1f2937;
              font-weight: 600;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
              background: #ffffff;
              box-shadow: 0 1px 3px rgba(0,0,0,0.05);
              border-radius: 10px;
              overflow: hidden;
            }
            .items-table thead {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
            }
            .items-table th {
              padding: 15px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .items-table td {
              padding: 15px;
              border-bottom: 1px solid #e5e7eb;
            }
            .items-table tbody tr:last-child td {
              border-bottom: none;
            }
            .items-table tbody tr:hover {
              background: #f8f9fa;
            }
            .summary-section {
              background: #f8f9fa;
              padding: 25px;
              border-radius: 10px;
              margin-top: 30px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .summary-row:last-child {
              border-bottom: none;
              border-top: 2px solid #3b82f6;
              margin-top: 10px;
              padding-top: 15px;
            }
            .summary-label {
              font-size: 14px;
              color: #6b7280;
              font-weight: 500;
            }
            .summary-value {
              font-size: 16px;
              color: #1f2937;
              font-weight: 700;
            }
            .summary-row:last-child .summary-label,
            .summary-row:last-child .summary-value {
              font-size: 18px;
              color: #3b82f6;
            }
            .status-section {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-top: 30px;
            }
            .status-card {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
            }
            .status-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 10px;
              font-weight: 600;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            @media print {
              body { 
                margin: 0;
                padding: 20px;
              }
              @page { 
                margin: 1cm;
                size: A4;
              }
              .section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Order Invoice</h1>
              <div class="subtitle">Order Details</div>
              <div class="order-number">Order ${orderNumber}</div>
              <div style="margin-top: 15px; font-size: 12px; opacity: 0.9;">
                Generated on: ${new Date().toLocaleString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            <div class="content">
              <!-- Order and Customer Information -->
              <div class="info-section">
                <div class="info-box">
                  <h3>Order Information</h3>
                  <div class="info-item">
                    <div class="info-label">Order Number</div>
                    <div class="info-value">${orderNumber}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Order Date</div>
                    <div class="info-value">${formatDate(order.order_date || order.orderDate)}</div>
                  </div>
                  ${order.due_date ? `
                  <div class="info-item">
                    <div class="info-label">Due Date</div>
                    <div class="info-value">${formatDate(order.due_date)}</div>
                  </div>
                  ` : ''}
                  <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value">${getStatusBadge(order.status)}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Payment Status</div>
                    <div class="info-value">${getPaymentStatusBadge(order.paymentStatus)}</div>
                  </div>
                </div>

                <div class="info-box">
                  <h3>Customer Information</h3>
                  <div class="info-item">
                    <div class="info-label">Customer Name</div>
                    <div class="info-value">${customerName}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${customerEmail}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value">${customerPhone}</div>
                  </div>
                  ${order.customer?.address ? `
                  <div class="info-item">
                    <div class="info-label">Address</div>
                    <div class="info-value">${typeof order.customer.address === 'string' ? order.customer.address : (order.customer.address.street || 'N/A')}</div>
                  </div>
                  ` : ''}
                </div>
              </div>

              <!-- Order Items -->
              <div style="margin-top: 30px;">
                <h3 style="font-size: 18px; color: #1f2937; margin-bottom: 15px; font-weight: 600;">Order Items</h3>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Package Name</th>
                      <th style="text-align: center;">Quantity</th>
                      <th style="text-align: right;">Price</th>
                      <th style="text-align: right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map(item => `
                      <tr>
                        <td style="font-weight: 600;">${item.package_name || item.productName || 'Package'}</td>
                        <td style="text-align: center;">${item.qty || item.quantity || 1}</td>
                        <td style="text-align: right;">${formatCurrency(item.price || item.unitPrice || 0)}</td>
                        <td style="text-align: right; font-weight: 700;">${formatCurrency(item.amount || item.totalPrice || 0)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Order Summary -->
              <div class="summary-section">
                <div class="summary-row">
                  <span class="summary-label">Subtotal</span>
                  <span class="summary-value">${formatCurrency(subtotal)}</span>
                </div>
                ${discount > 0 ? `
                <div class="summary-row">
                  <span class="summary-label">Discount</span>
                  <span class="summary-value" style="color: #10b981;">- ${formatCurrency(discount)}</span>
                </div>
                ` : ''}
                <div class="summary-row">
                  <span class="summary-label">Total Amount</span>
                  <span class="summary-value">${formatCurrency(totalAmount)}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Paid Amount</span>
                  <span class="summary-value" style="color: #10b981;">${formatCurrency(paidAmount)}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Balance Amount</span>
                  <span class="summary-value" style="color: ${balanceAmount > 0 ? '#ef4444' : '#10b981'};">${formatCurrency(balanceAmount)}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>This invoice was generated automatically by Codexaa Base Project</p>
              <p style="margin-top: 5px;">© ${new Date().getFullYear()} Codexaa Base Project. All rights reserved.</p>
            </div>
          </div>
        </body>
    </html>
  `

  // Create a new window for printing
  const printWindow = window.open('', '_blank')
  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

/**
 * Export Transaction to PDF
 * Generates a professional receipt/invoice for a transaction
 */
export const exportTransactionToPDF = (transaction) => {
  if (!transaction) {
    console.error('Transaction data is required')
    return
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const transactionType = transaction.type || 'credit'
  const isCredit = transactionType === 'credit'
  const receivedAmount = transaction.received_amount !== undefined 
    ? transaction.received_amount 
    : (isCredit ? transaction.amount : 0)
  const remainingAmount = transaction.remaining_amount !== undefined 
    ? transaction.remaining_amount 
    : 0

  const customerName = transaction.customer_name || `Customer #${transaction.customer_id}`
  const transactionNumber = `#${transaction.id || 'N/A'}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Transaction Receipt - ${transactionNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #2c3e50;
            background: #ffffff;
            line-height: 1.6;
            padding: 20px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, ${isCredit ? '#8b5cf6' : '#ef4444'} 0%, ${isCredit ? '#7c3aed' : '#dc2626'} 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .header .subtitle {
            font-size: 14px;
            opacity: 0.95;
            margin-top: 10px;
          }
          .header .transaction-number {
            background: rgba(255,255,255,0.2);
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            margin-top: 15px;
            font-weight: 600;
            font-size: 16px;
          }
          .content {
            padding: 30px;
          }
          .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid ${isCredit ? '#8b5cf6' : '#ef4444'};
          }
          .info-box h3 {
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 15px;
            font-weight: 600;
          }
          .info-item {
            margin-bottom: 12px;
          }
          .info-item:last-child {
            margin-bottom: 0;
          }
          .info-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
            font-weight: 600;
          }
          .info-value {
            font-size: 15px;
            color: #1f2937;
            font-weight: 600;
          }
          .amount-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 25px;
            border-radius: 10px;
            margin: 30px 0;
            border: 2px solid ${isCredit ? '#8b5cf6' : '#ef4444'};
          }
          .amount-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 15px;
          }
          .amount-box {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e5e7eb;
          }
          .amount-label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .amount-value {
            font-size: 24px;
            font-weight: 700;
          }
          .amount-value.received {
            color: #8b5cf6;
          }
          .amount-value.remaining {
            color: #f59e0b;
          }
          .amount-value.transaction {
            color: #3b82f6;
          }
          .remarks-section {
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            margin-top: 20px;
          }
          .remarks-section h3 {
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 10px;
            font-weight: 600;
          }
          .remarks-text {
            color: #4b5563;
            font-size: 14px;
            line-height: 1.6;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
          }
          .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .badge.credit {
            background: #d1fae5;
            color: #065f46;
          }
          .badge.debit {
            background: #fee2e2;
            color: #991b1b;
          }
          @media print {
            body {
              padding: 0;
            }
            .container {
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isCredit ? '💰 Payment Receipt' : '💸 Refund Receipt'}</h1>
            <div class="subtitle">Transaction Receipt</div>
            <div class="transaction-number">Transaction ${transactionNumber}</div>
            <div style="margin-top: 15px; font-size: 12px; opacity: 0.9;">
              Generated on: ${new Date().toLocaleString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          
          <div class="content">
            <!-- Transaction and Customer Information -->
            <div class="info-section">
              <div class="info-box">
                <h3>Transaction Information</h3>
                <div class="info-item">
                  <div class="info-label">Transaction Number</div>
                  <div class="info-value">${transactionNumber}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Transaction Date</div>
                  <div class="info-value">${formatDate(transaction.transaction_date)}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Type</div>
                  <div class="info-value">
                    <span class="badge ${transactionType}">${isCredit ? 'Credit' : 'Debit'}</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">Branch</div>
                  <div class="info-value">Branch #${transaction.branch_id || 'N/A'}</div>
                </div>
              </div>

              <div class="info-box">
                <h3>Customer Information</h3>
                <div class="info-item">
                  <div class="info-label">Customer Name</div>
                  <div class="info-value">${customerName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Customer ID</div>
                  <div class="info-value">#${transaction.customer_id || 'N/A'}</div>
                </div>
              </div>
            </div>

            <!-- Amount Details -->
            <div class="amount-section">
              <h3 style="font-size: 18px; color: #1f2937; margin-bottom: 15px; font-weight: 600; text-align: center;">
                Amount Details
              </h3>
              <div class="amount-grid">
                <div class="amount-box">
                  <div class="amount-label">Transaction Amount</div>
                  <div class="amount-value transaction">${formatCurrency(transaction.amount || 0)}</div>
                </div>
                <div class="amount-box">
                  <div class="amount-label">Received Amount</div>
                  <div class="amount-value received">${receivedAmount > 0 ? formatCurrency(receivedAmount) : '-'}</div>
                </div>
                <div class="amount-box">
                  <div class="amount-label">Remaining Amount</div>
                  <div class="amount-value remaining">${formatCurrency(remainingAmount)}</div>
                </div>
              </div>
            </div>

            ${transaction.remarks ? `
            <!-- Remarks -->
            <div class="remarks-section">
              <h3>Remarks</h3>
              <div class="remarks-text">${transaction.remarks}</div>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>This is a computer-generated receipt. No signature required.</p>
            <p style="margin-top: 5px;">Transaction ID: ${transaction.id || 'N/A'}</p>
          </div>
        </div>
      </body>
    </html>
  `

  // Create a new window for printing
  const printWindow = window.open('', '_blank')
  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}
