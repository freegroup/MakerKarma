import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.less'

// Handle OAuth token from URL BEFORE React renders
// URL can be: /MakerKarma/?token=... or /MakerKarma?token=...
const urlParams = new URLSearchParams(window.location.search)
const oauthToken = urlParams.get('token')
if (oauthToken && oauthToken.includes('.')) {
  try {
    const payload = JSON.parse(atob(oauthToken.split('.')[1]))
    localStorage.setItem('auth-storage', JSON.stringify({ state: { user: payload, token: oauthToken }, version: 0 }))
  } catch { /* invalid token */ }
  // Clean URL - keep pathname, remove query
  window.history.replaceState({}, '', window.location.pathname)
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/MakerKarma">
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
