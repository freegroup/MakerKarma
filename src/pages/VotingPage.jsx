import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../store/authStore'
import PageHeader from '../components/PageHeader'
import { ThumbsUp, Minus, Plus } from 'lucide-react'
import './VotingPage.less'

async function fetchVotingItems() {
  const res = await apiFetch('/api/voting')
  if (!res) return []
  return res.json()
}

async function fetchProfile() {
  const res = await apiFetch('/api/users/me')
  if (!res) return null
  return res.json()
}

export default function VotingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [votingId, setVotingId] = useState(null)
  const [votePoints, setVotePoints] = useState(1)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['voting-items'],
    queryFn: fetchVotingItems,
  })

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })

  const voteMutation = useMutation({
    mutationFn: async ({ id, points }) => {
      const res = await apiFetch(`/api/voting/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Vote fehlgeschlagen')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voting-items'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setVotingId(null)
      setVotePoints(1)
    },
  })

  const availablePoints = profile?.availablePoints ?? 0

  if (isLoading) {
    return (
      <div className="voting-loading">
        <div className="spinner" />
        <p>Voting wird geladen...</p>
      </div>
    )
  }

  return (
    <div className="voting">
      <PageHeader
        title="Voting"
        subtitle="Setze deine Karma-Punkte ein, um Projekte und Anschaffungen zu pushen"
      />

      {items.length === 0 ? (
        <p className="voting-empty">Keine Voting-Items vorhanden.</p>
      ) : (
        <div className="voting-list">
          {items.map((item) => (
            <div key={item.id} className="voting-card">
              <div className="voting-card-header" onClick={() => navigate(`/voting/${item.id}`)}>
                <h3 className="voting-card-title">{item.title}</h3>
                <div className="voting-card-stats">
                  <ThumbsUp size={14} />
                  <span>{item.totalVotes}</span>
                </div>
              </div>
              {item.description && (
                <p className="voting-card-desc">{item.description}</p>
              )}
              <div className="voting-card-meta">
                <span>{item.voterCount} Unterstützer</span>
                {item.myVotes > 0 && (
                  <span className="voting-card-my">Du: {item.myVotes} Punkt{item.myVotes > 1 ? 'e' : ''}</span>
                )}
              </div>

              {votingId === item.id ? (
                <div className="voting-card-input">
                  <div className="voting-card-stepper">
                    <button
                      className="voting-card-stepper-btn"
                      onClick={() => setVotePoints(p => Math.max(1, p - 1))}
                      disabled={votePoints <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      className="voting-card-stepper-value"
                      type="number"
                      min={1}
                      max={availablePoints}
                      value={votePoints}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (isNaN(val) || val < 1) setVotePoints(1)
                        else if (val > availablePoints) setVotePoints(availablePoints)
                        else setVotePoints(val)
                      }}
                    />
                    <button
                      className="voting-card-stepper-btn"
                      onClick={() => setVotePoints(p => Math.min(availablePoints, p + 1))}
                      disabled={votePoints >= availablePoints}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="voting-card-actions">
                    <button
                      className="voting-card-cancel"
                      onClick={() => { setVotingId(null); setVotePoints(1) }}
                    >
                      Abbrechen
                    </button>
                    <button
                      className="voting-card-confirm"
                      onClick={() => voteMutation.mutate({ id: item.id, points: votePoints })}
                      disabled={voteMutation.isPending}
                    >
                      {voteMutation.isPending ? 'Sende...' : `Ich übergebe ${votePoints} Karma Punkt${votePoints > 1 ? 'e' : ''}`}
                    </button>
                  </div>
                  {voteMutation.isError && (
                    <p className="voting-card-error">{voteMutation.error.message}</p>
                  )}
                </div>
              ) : (
                <button
                  className="voting-card-vote"
                  onClick={() => { setVotingId(item.id); setVotePoints(1) }}
                  disabled={availablePoints < 1}
                >
                  <ThumbsUp size={16} />
                  {availablePoints < 1 ? 'Keine Punkte verfügbar' : 'Voten'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
