import { useQuery } from '@tanstack/react-query'
import { useAuthStore, apiFetch } from '../store/authStore'
import { Star, LogOut } from 'lucide-react'
import './ProfilePage.less'

async function fetchProfile() {
  const res = await apiFetch('/api/users/me')
  if (!res) return null
  return res.json()
}

export default function ProfilePage() {
  const { user, logout } = useAuthStore()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })

  const displayUser = profile || user

  return (
    <div className="profile">
      <div className="profile-card">
        {displayUser?.avatarUrl && (
          <img className="profile-avatar" src={displayUser.avatarUrl} alt="" />
        )}
        <h2 className="profile-name">{displayUser?.name || 'Mitglied'}</h2>
        <p className="profile-email">{displayUser?.email}</p>

        <div className="profile-points">
          <Star size={24} />
          <span className="profile-points-value">{profile?.points ?? 0}</span>
          <span className="profile-points-label">Punkte</span>
        </div>
      </div>

      <button className="profile-logout" onClick={logout}>
        <LogOut size={18} /> Abmelden
      </button>
    </div>
  )
}
