import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './design-system/lift-tailux'
import { syncColorScheme } from './design-system/sync-color-scheme'
import App from './App.tsx'

syncColorScheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
