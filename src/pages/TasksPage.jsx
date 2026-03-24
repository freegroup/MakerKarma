import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../store/authStore'
import { CATEGORIES } from '../types'
import TaskCard from '../components/TaskCard'
import { Plus } from 'lucide-react'
import './TasksPage.less'

async function fetchTasks() {
  const res = await apiFetch('/api/tasks')
  if (!res) return []
  return res.json()
}

export default function TasksPage() {
  const navigate = useNavigate()
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })

  if (isLoading) {
    return (
      <div className="tasks-loading">
        <div className="spinner" />
        <p>Karma wird geladen...</p>
      </div>
    )
  }

  if (error) {
    return <div className="tasks-error">Fehler beim Laden.</div>
  }

  return (
    <div className="tasks">
      <h2 className="tasks-title">Karma sammeln</h2>
      {tasks.length === 0 ? (
        <p className="tasks-empty">Gerade keine Karma-Chancen. Komm später wieder!</p>
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
      <button className="tasks-fab" onClick={() => navigate('/tasks/new')}>
        <Plus size={24} />
      </button>
    </div>
  )
}
