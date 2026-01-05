import React from 'react'
import { AppContent, AppFooter, AppHeader } from '../components'

const DefaultLayout = () => {
  return (
    <div>
      {/* Sidebar removed - using horizontal navigation instead */}
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout

