import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.less'

// Handle OAuth token from URL BEFORE React renders
const params = new URLSearchParams(window.location.search)
const token = params.get('token')
if (token) {
  try {
    const user = JSON.parse(atob(token.split('.')[1]))
    localStorage.setItem('auth-storage', JSON.stringify({ state: { user, token }, version: 0 }))
  } catch { /* invalid token */ }
  // Clean URL
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
