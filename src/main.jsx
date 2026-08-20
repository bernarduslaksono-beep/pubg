import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import './index.css'

// Nota: StrictMode la uza iha ne'e tanba halo "double-mount" iha development,
// ne'ebe bele estraga koneksaun Supabase Realtime (subscribe → unsubscribe →
// subscribe fila-fali lalais liu, server rejeita re-join ne'e).
ReactDOM.createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </LanguageProvider>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
