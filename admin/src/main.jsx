import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App'
import store from './store'

// Suppress React 19 compatibility warnings from CoreUI components
// This is a temporary fix until CoreUI releases React 19 compatible version
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

// Override console methods to filter out React 19 warnings
console.warn = (...args) => {
  const message = args[0]
  if (typeof message === 'string' && message.includes('element.ref was removed in React 19')) {
    return // Suppress this specific warning
  }
  originalConsoleWarn.apply(console, args)
}

console.error = (...args) => {
  const message = args[0]
  if (typeof message === 'string' && message.includes('element.ref was removed in React 19')) {
    return // Suppress this specific warning
  }
  originalConsoleError.apply(console, args)
}

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)