import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../store/authStore'
import { ArrowLeft, Star, Clock, CheckCircle } from 'lucide-react'
import './TaskDetailPage.less'

async function fetchCategories() {
  const res = await apiFetch('/api/labels/categories')
  if (!res) return []
  return res.json()
}

async function fetchTask(id) {
  const res = await apiFetch(`/api/tasks/${id}`)
  if (!res) return null
  return res.json()
}

async function fetchHistory(id) {
  const res = await apiFetch(`/api/tasks/${id}/history`)
  if (!res) return []
  return res.json()
}

async function completeTask(id) {
  const res = await apiFetch(`/api/tasks/${id}/complete`, { method: 'POST' })
  if (!res) throw new Error('Fehler')
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Fehler beim Abschließen')
  }
  return res.json()
}

export default function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: categories = [] } = useQuery({
    queryKey: ['category-labels'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30,
  })

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id),
  })

  const { data: history = [] } = useQuery({
    queryKey: ['task-history', id],
    queryFn: () => fetchHistory(id),
  })

  const mutation = useMutation({
    mutationFn: () => completeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['task-history', id] })
    },
  })

  if (isLoading) {
    return <div className="detail-loading"><div className="spinner" /></div>
  }

  if (!task) {
    return <div className="detail-error">Aufgabe nicht gefunden.</div>
  }

  const category = categories.find(c => c.key === task?.category) || { icon: '📋', name: task?.category || '', color: '#6B7280' }

  return (
    <div className="detail">
      <button className="detail-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Zurück
      </button>

      <div className="detail-header">
        <div className="detail-category" style={{ backgroundColor: category.color }}>
          {category.icon}
        </div>
        <div>
          <span className="detail-category-name">{category.name}</span>
          <h1 className="detail-title">{task.title}</h1>
        </div>
      </div>

      {task.description && (
        <p className="detail-desc">{task.description}</p>
      )}

      <div className="detail-info">
        {task.points > 0 && (
          <div className="detail-info-item">
            <Star size={16} /> {task.points} Punkte
          </div>
        )}
        {task.recurring && (
          <div className="detail-info-item">
            <Clock size={16} /> Wiederkehrend
          </div>
        )}
      </div>

      <button
        className="detail-complete-btn"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        <CheckCircle size={20} />
        {mutation.isPending ? 'Wird abgeschlossen...' : 'Aufgabe erledigt'}
      </button>

      {mutation.isSuccess && (
        <p className="detail-success">Aufgabe erfolgreich abgeschlossen!</p>
      )}
      {mutation.isError && (
        <p className="detail-error-msg">{mutation.error.message}</p>
      )}

      {history.length > 0 && (
        <div className="detail-history">
          <h3>Zuletzt erledigt</h3>
          {history.map((entry, i) => (
            <div key={i} className="detail-history-item">
              <span>{entry.user}</span>
              <span className="detail-history-date">
                {new Date(entry.date).toLocaleDateString('de-DE')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
