import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// API base URL: Worker in dev, same-origin or configured URL in prod
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8787' : '')

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (isLoading) => set({ isLoading }),

      login: (user, token) => set({
        user,
        token,
        isLoading: false,
        error: null,
      }),

      logout: () => {
        set({
          user: null,
          token: null,
          isLoading: false,
          error: null,
        })
      },

      setError: (error) => set({ error, isLoading: false }),

      // Exchange OAuth code for JWT via Worker
      exchangeCode: async (code, provider) => {
        set({ isLoading: true, error: null })

        try {
          const res = await fetch(`${API_BASE}/auth/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, provider }),
          })

          const data = await res.json()

          if (!res.ok) {
            set({ isLoading: false, error: data.error })
            return false
          }

          set({
            user: data.user,
            token: data.token,
            isLoading: false,
            error: null,
          })
          return true
        } catch (e) {
          set({ isLoading: false, error: 'Verbindung zum Server fehlgeschlagen' })
          return false
        }
      },

      // Computed getters
      isAuthenticated: () => {
        const { user, token } = get()
        return !!user && !!token
      },

      isAdmin: () => {
        const { user } = get()
        return user?.role === 'admin'
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
)

// Redirect to OAuth provider via Worker
// Worker handles the full OAuth flow and redirects back with ?token=...
export function initiateOAuth(provider) {
  const redirect = window.location.origin + (import.meta.env.BASE_URL || '/')
  window.location.href = `${API_BASE}/auth/${provider}?redirect=${encodeURIComponent(redirect)}`
}

// Authenticated fetch helper
export async function apiFetch(path, options = {}) {
  const { token } = useAuthStore.getState()

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // Auto-logout on 401
  if (res.status === 401) {
    useAuthStore.getState().logout()
    window.location.href = '/login'
    return null
  }

  return res
}
