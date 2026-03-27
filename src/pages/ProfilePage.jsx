import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore, apiFetch } from '../store/authStore'
import { Star, LogOut, ThumbsUp, Sparkles, TrendingUp } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import karmaMessages from '../data/karma-messages.json'
import './ProfilePage.less'

async function fetchProfile() {
  const res = await apiFetch('/api/users/me')
  if (!res) return null
  return res.json()
}

function getCurrentMonthPoints(monthPoints) {
  if (!monthPoints) return 0
  const now = new Date().toISOString().slice(0, 7)
  return monthPoints[now] || 0
}

function getKarmaMessage(points) {
  const tier = karmaMessages.tiers.find(t => points >= t.min && points <= t.max)
    || karmaMessages.tiers[0]
  const messages = tier.messages
  return messages[Math.floor(Math.random() * messages.length)]
}

export default function ProfilePage() {
  const { user, logout } = useAuthStore()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })

  const displayUser = profile || user
  const earned = profile?.earnedPoints ?? profile?.points ?? 0
  const available = profile?.availablePoints ?? 0
  const thisMonth = getCurrentMonthPoints(profile?.monthPoints)

  // Stable random message per render (won't flicker on re-renders from same data)
  const [message] = useState(() => getKarmaMessage(thisMonth))

  return (
    <div className="profile">
      <PageHeader
        title="Dein Karma"
        subtitle="Jede Hilfe zählt und wird belohnt - mit Karma und Vergünstigungen für dich"
      />
      <div className="profile-card">
        {displayUser?.avatarUrl && (
          <img className="profile-avatar" src={displayUser.avatarUrl} alt="" />
        )}
        <h2 className="profile-name">{displayUser?.name || 'Mitglied'}</h2>
        <p className="profile-email">{displayUser?.email}</p>

        <div className="profile-stats">
          <div className="profile-stat profile-stat--total">
            <Star size={18} />
            <span className="profile-stat-value">{earned}</span>
            <span className="profile-stat-label">Karma-Konto</span>
          </div>

          {thisMonth > 0 && (
            <div className="profile-stat profile-stat--month">
              <TrendingUp size={18} />
              <span className="profile-stat-value">+{thisMonth}</span>
              <span className="profile-stat-label">diesen Monat</span>
            </div>
          )}

          <div className="profile-stat profile-stat--available">
            <ThumbsUp size={18} />
            <span className="profile-stat-value">{available}</span>
            <span className="profile-stat-label">zum Weitergeben</span>
          </div>
        </div>

        <p className={`profile-message profile-message--${thisMonth > 0 ? 'active' : 'welcome'}`}>
          <Sparkles size={14} />
          {message}
        </p>
      </div>

      <button className="profile-logout" onClick={logout}>
        <LogOut size={18} /> Abmelden
      </button>
    </div>
  )
}
