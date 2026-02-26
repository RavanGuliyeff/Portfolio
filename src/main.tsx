import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

// ─── Console Easter egg ──────────────────────────────────────────────────────
console.log(
  '%c⚡ RAVAN GULIYEV',
  'font-size:28px;font-weight:900;background:linear-gradient(90deg,#7c3aed,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;padding:4px 0;'
)
console.log(
  '%cHey — a fellow dev in the DevTools. You know the vibe.',
  'font-size:13px;color:#a78bfa;font-style:italic;'
)
console.log(
  '%cBuilt with  React 18 · TypeScript · Three.js · Framer Motion',
  'font-size:12px;color:#94a3b8;'
)
console.log(
  '%c📬  guliyeffravan@gmail.com  |  github.com/ravan',
  'font-size:12px;color:#64748b;'
)
console.log(
  '%c(No bugs here. Probably.)',
  'font-size:11px;color:#475569;font-style:italic;'
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
