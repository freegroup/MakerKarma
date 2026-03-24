import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../store/authStore'
import { Star } from 'lucide-react'
import './TaskCard.less'

async function fetchCategories() {
  const res = await apiFetch('/api/labels/categories')
  if (!res) return []
  return res.json()
}

export default function TaskCard({ task }) {
  const navigate = useNavigate()
  const { data: categories = [] } = useQuery({
    queryKey: ['category-labels'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30,
  })

  const category = categories.find(c => c.key === task.category) || { icon: '📋', name: task.category || '', color: '#6B7280' }

  return (
    <div className="task-card" onClick={() => navigate(`/tasks/${task.id}`)}>
      <div className="task-card-category" style={{ backgroundColor: category.color }}>
        {category.icon}
      </div>
      <div className="task-card-body">
        <h3 className="task-card-title">{task.title}</h3>
        {task.description && (
          <p className="task-card-desc">{task.description}</p>
        )}
        <div className="task-card-meta">
          {task.points > 0 && (
            <span className="task-card-points">
              {Array.from({ length: task.points }, (_, i) => <Star key={i} size={14} />)}
            </span>
          )}
          {task.recurring && (
            <span className="task-card-badge">Wiederkehrend</span>
          )}
        </div>
      </div>
    </div>
  )
}
