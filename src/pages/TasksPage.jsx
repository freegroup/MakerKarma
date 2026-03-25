import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../store/authStore'
import IssueListItem from '../components/IssueListItem'
import PageHeader from '../components/PageHeader'
import CategoryTag from '../components/CategoryTag'
import { Plus, X } from 'lucide-react'
import './TasksPage.less'

async function fetchTasks() {
  const res = await apiFetch('/api/tasks')
  if (!res) return []
  return res.json()
}

async function fetchCategories() {
  const res = await apiFetch('/api/labels/categories')
  if (!res) return []
  return res.json()
}

export default function TasksPage() {
  const navigate = useNavigate()
  const [activeFilters, setActiveFilters] = useState(new Set())

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['category-labels'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30,
  })

  function toggleFilter(key) {
    setActiveFilters(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const filteredTasks = activeFilters.size === 0
    ? tasks
    : tasks.filter(t => activeFilters.has(t.category))

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
      <PageHeader
        title="Verbessere dein Karma"
        subtitle="Erfülle einen Wunsch der unten aufgeführt ist und markiere ihn als erledigt - dafür bekommst du Karma Punkte"
      />

      {categories.length > 0 && (
        <div className="tasks-filters">
          {categories.map((cat) => (
            <CategoryTag
              key={cat.key}
              name={cat.name}
              color={cat.color}
              active={activeFilters.has(cat.key)}
              onClick={() => toggleFilter(cat.key)}
            />
          ))}
          {activeFilters.size > 0 && (
            <button
              className="tasks-filter-clear"
              onClick={() => setActiveFilters(new Set())}
            >
              <X size={14} /> Alle
            </button>
          )}
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <p className="tasks-empty">
          {activeFilters.size > 0
            ? 'Keine Karma-Chancen in dieser Kategorie.'
            : 'Gerade keine Karma-Chancen. Komm später wieder!'}
        </p>
      ) : (
        <div className="tasks-list">
          {filteredTasks.map((task) => (
            <IssueListItem key={task.id} task={task} />
          ))}
        </div>
      )}
      <button className="tasks-fab" onClick={() => navigate('/tasks/new')}>
        <Plus size={24} />
      </button>
    </div>
  )
}
