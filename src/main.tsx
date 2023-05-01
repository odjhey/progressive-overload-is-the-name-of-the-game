import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


// const updateSW = registerSW({
registerSW({
  onOfflineReady() {
    // test: do nothing for now
  },
})