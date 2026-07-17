import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import '@fontsource-variable/inter/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import './index.css'
import App from './App.tsx'

// Privacy-friendly analytics — only loads when a domain is configured (no cookies,
// no external calls otherwise). Point VITE_ANALYTICS_DOMAIN at your Plausible/etc site.
const analyticsDomain = import.meta.env.VITE_ANALYTICS_DOMAIN
if (analyticsDomain) {
  const s = document.createElement('script')
  s.defer = true
  s.setAttribute('data-domain', analyticsDomain)
  s.src = import.meta.env.VITE_ANALYTICS_SRC || 'https://plausible.io/js/script.js'
  document.head.appendChild(s)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
