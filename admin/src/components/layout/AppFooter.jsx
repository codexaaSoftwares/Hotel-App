import React from 'react'
import { CFooter } from '@coreui/react'
import { FOOTER_TEXT, BRAND_NAME, BRAND_URL } from '../../constants/app'

const AppFooter = () => {
  return (
    <CFooter className="px-4 py-3">
      <div>
        <span className="text-muted small">
          {FOOTER_TEXT()} | Powered by{' '}
          <a 
            href={BRAND_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-decoration-none text-primary fw-medium"
          >
            {BRAND_NAME}
          </a>
        </span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
