import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function TokenHandler() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const error = params.get('error')

    if (token) {
      // Decode JWT payload to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        login(payload, token)
      } catch {
        // fallback: store token, fetch profile later
        login({}, token)
      }
      // Clean URL and go to home
      window.history.replaceState({}, '', window.location.pathname)
      navigate('/', { replace: true })
    } else if (error) {
      navigate('/login', { replace: true })
    }
  }, [])

  return null
}
