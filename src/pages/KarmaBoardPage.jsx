import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../store/authStore'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import './KarmaBoardPage.less'

async function fetchPoints() {
  const res = await apiFetch('/api/admin/points')
  if (!res) return []
  return res.json()
}

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function formatMonth(month) {
  const [year, m] = month.split('-')
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  return `${months[parseInt(m) - 1]} ${year}`
}

function shiftMonth(month, delta) {
  const [year, m] = month.split('-').map(Number)
  const d = new Date(year, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function KarmaBoardPage() {
  const [month, setMonth] = useState(getCurrentMonth)

  const { data: allPoints = [], isLoading } = useQuery({
    queryKey: ['admin-points'],
    queryFn: fetchPoints,
  })

  const monthPoints = allPoints
    .filter(p => p.month === month)
    .sort((a, b) => b.points - a.points)

  const totalPoints = monthPoints.reduce((sum, p) => sum + p.points, 0)
  const totalTasks = monthPoints.reduce((sum, p) => sum + p.tasks, 0)

  return (
    <div className="admin">
      <PageHeader
        title="Karma Board"
        subtitle="Gemeinsam machen wir unseren Space ein bisschen besser"
      />

      <div className="admin-month-nav">
        <button onClick={() => setMonth(m => shiftMonth(m, -1))}><ChevronLeft size={20} /></button>
        <span className="admin-month">{formatMonth(month)}</span>
        <button onClick={() => setMonth(m => shiftMonth(m, 1))}><ChevronRight size={20} /></button>
      </div>

      <div className="admin-summary">
        <div className="admin-summary-item">
          <span className="admin-summary-value">{totalPoints}</span>
          <span className="admin-summary-label">Karma</span>
        </div>
        <div className="admin-summary-item">
          <span className="admin-summary-value">{totalTasks}</span>
          <span className="admin-summary-label">Gute Taten</span>
        </div>
        <div className="admin-summary-item">
          <span className="admin-summary-value">{monthPoints.length}</span>
          <span className="admin-summary-label">Aktive</span>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-loading"><div className="spinner" /></div>
      ) : monthPoints.length === 0 ? (
        <p className="admin-empty">Noch kein Karma in {formatMonth(month)}.</p>
      ) : (
        <div className="admin-list">
          {monthPoints.map((entry, i) => (
            <div key={entry.userId} className="admin-row">
              <span className="admin-row-rank">#{i + 1}</span>
              <div className="admin-row-user">
                <span className="admin-row-name">{entry.userName}</span>
                <span className="admin-row-tasks">{entry.tasks} Gute Taten</span>
              </div>
              <span className="admin-row-points">
                <Star size={14} /> {entry.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
