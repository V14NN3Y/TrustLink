import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { initDefaults } from '@/lib/storage'

// Seed shared localStorage defaults (exchange rate, auth) if not already set
initDefaults();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
