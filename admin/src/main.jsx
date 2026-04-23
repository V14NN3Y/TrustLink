import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { StorageManager } from '@/lib/storage'

// Initialize local mock storage
StorageManager.init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
