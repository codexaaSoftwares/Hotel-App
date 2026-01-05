// Application-wide static constants
// These values are used across the application for consistency

// Copyright start year (when the app was first created)
const COPYRIGHT_START_YEAR = 2024

// Get current year dynamically
const getCurrentYear = () => new Date().getFullYear()

// Generate copyright year range
const getCopyrightYearRange = () => {
  const currentYear = getCurrentYear()
  if (currentYear === COPYRIGHT_START_YEAR) {
    return COPYRIGHT_START_YEAR.toString()
  }
  return `${COPYRIGHT_START_YEAR}-${currentYear}`
}

// Generate footer text with dynamic year
const getFooterText = () => {
  const yearRange = getCopyrightYearRange()
  return `© ${yearRange} Codexaa Base Project. All rights reserved.`
}

export const APP_CONFIG = {
  // Application Name
  APP_NAME: 'Codexaa Base Project',
  
  // Application Subtitle/Tagline
  APP_SUBTITLE: 'Base Project Template for Codexaa Applications',
  
  // Application Tagline (for login page overlay)
  APP_TAGLINE: 'Build Excellence, Manage Innovation',
  
  // Footer Text (function to get dynamic year)
  get FOOTER_TEXT() {
    return getFooterText()
  },
  
  // Copyright Year (current year)
  COPYRIGHT_YEAR: getCurrentYear(),
  
  // Copyright Year Range (e.g., "2024-2025")
  COPYRIGHT_YEAR_RANGE: getCopyrightYearRange(),
  
  // Application Logo Alt Text
  LOGO_ALT_TEXT: 'Codexaa Base Project Logo',
  
  // Brand Information
  BRAND_NAME: 'Codexaa Software Solution',
  BRAND_URL: 'https://www.codexaatech.com',
}

// Export individual constants for convenience
export const APP_NAME = APP_CONFIG.APP_NAME
export const APP_SUBTITLE = APP_CONFIG.APP_SUBTITLE
export const APP_TAGLINE = APP_CONFIG.APP_TAGLINE
export const COPYRIGHT_YEAR = APP_CONFIG.COPYRIGHT_YEAR
export const COPYRIGHT_YEAR_RANGE = APP_CONFIG.COPYRIGHT_YEAR_RANGE
export const LOGO_ALT_TEXT = APP_CONFIG.LOGO_ALT_TEXT
export const BRAND_NAME = APP_CONFIG.BRAND_NAME
export const BRAND_URL = APP_CONFIG.BRAND_URL

// Export FOOTER_TEXT as a function to get dynamic year
// Components should call this function: FOOTER_TEXT()
export const FOOTER_TEXT = () => getFooterText()

// Also export as a getter property for backward compatibility
// But prefer using the function for dynamic year updates
Object.defineProperty(APP_CONFIG, 'FOOTER_TEXT', {
  get: getFooterText,
  enumerable: true,
  configurable: true
})

export default APP_CONFIG
