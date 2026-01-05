import { legacy_createStore as createStore } from 'redux'

// Get theme from localStorage or default to 'light'
// Migrate 'auto' to 'light' if found
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  // If theme is 'auto', migrate to 'light' and update localStorage
  if (savedTheme === 'auto') {
    localStorage.setItem('theme', 'light')
    return 'light'
  }
  // Return saved theme if valid, otherwise default to 'light'
  return savedTheme && (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light'
}

const initialState = {
  sidebarShow: true,
  theme: getInitialTheme(),
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

const store = createStore(changeState)
export default store
