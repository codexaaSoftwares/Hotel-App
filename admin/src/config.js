const resolveApiBaseUrl = () => {
  const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()

  // Default to relative /api during local dev when nothing configured
  if (!rawBaseUrl || rawBaseUrl === '/') {
    return '/api'
  }

  const normalize = (value) => value.replace(/\/+$/, '')

  if (rawBaseUrl.startsWith('/')) {
    const relativeBase = normalize(rawBaseUrl)
    return relativeBase.endsWith('/api') ? relativeBase : `${relativeBase}/api`
  }

  const absoluteBase = normalize(rawBaseUrl)
  return absoluteBase.endsWith('/api') ? absoluteBase : `${absoluteBase}/api`
}

// App Configuration
const config = {
  // API Configuration
  api: {
    baseURL: resolveApiBaseUrl(),
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },

  // App Information
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Codexaa Base Project',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Base Project Template for Codexaa Applications',
  },

  // Authentication
  auth: {
    jwtSecret: import.meta.env.VITE_JWT_SECRET || 'your-jwt-secret-key',
    tokenExpiry: import.meta.env.VITE_TOKEN_EXPIRY || '24h',
    storageKey: 'authToken',
    userStorageKey: 'user',
  },

  // Development
  dev: {
    debug: import.meta.env.VITE_DEBUG === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },

  // Features
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    errorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  },

  // Routes
  routes: {
    login: '/login',
    dashboard: '/dashboard',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },

  // Toast Configuration
  toast: {
    defaultDelay: 5000,
    position: 'top-end',
  },
}

export default config
