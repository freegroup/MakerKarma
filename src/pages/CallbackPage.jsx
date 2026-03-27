import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function CallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { exchangeCode, error } = useAuthStore()

  useEffect(() => {
    const code = searchParams.get('code')
    const provider = searchParams.get('provider') || 'google'

    if (code) {
      exchangeCode(code, provider).then((success) => {
        navigate(success ? '/' : '/login', { replace: true })
      })
    } else {
      navigate('/login', { replace: true })
    }
  }, [])

  return (
    <div className="callback">
      {error ? (
        <p className="callback-error">{error}</p>
      ) : (
        <p>Anmeldung wird verarbeitet...</p>
      )}
    </div>
  )
}
