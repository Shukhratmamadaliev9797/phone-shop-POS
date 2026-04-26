import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ReduxProvider } from './store/provider'
import { initTheme } from './lib/theme'
import { AppContextProvider } from './context'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </ReduxProvider>
  </StrictMode>,
)
