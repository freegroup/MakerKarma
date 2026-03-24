import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../store/authStore'
import { CATEGORIES } from '../types'
import TaskCard from '../components/TaskCard'
import './TasksPage.less'

async function fetchTasks() {
  const res = await apiFetch('/api/tasks')
  if (!res) return []
  return res.json()
}

export default function TasksPage() {
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })

  if (isLoading) {
    return (
      <div className="tasks-loading">
        <div className="spinner" />
        <p>Aufgaben werden geladen...</p>
      </div>
    )
  }

  if (error) {
    return <div className="tasks-error">Fehler beim Laden der Aufgaben.</div>
  }

  if (tasks.length === 0) {
    return (
      <div className="tasks-empty">
        <p>Keine offenen Aufgaben vorhanden.</p>
      </div>
    )
  }

  return (
    <div className="tasks">
      <h2 className="tasks-title">Offene Aufgaben</h2>
      <div className="tasks-list">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
