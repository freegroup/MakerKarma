import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../store/authStore'
import { Star } from 'lucide-react'
import './IssueListItem.less'

async function fetchCategories() {
  const res = await apiFetch('/api/labels/categories')
  if (!res) return []
  return res.json()
}

export default function IssueListItem({ task }) {
  const navigate = useNavigate()
  const { data: categories = [] } = useQuery({
    queryKey: ['category-labels'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30,
  })

  const category = categories.find(c => c.key === task.category) || { name: task.category || '', color: '#6B7280' }

  return (
    <div
      className="issue-item"
      style={{ '--cat-color': category.color }}
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <h3 className="issue-item-title">{task.title}</h3>
      {task.description && (
        <p className="issue-item-desc">{task.description}</p>
      )}
      {task.points > 0 && (
        <span className="issue-item-points">
          {Array.from({ length: task.points }, (_, i) => <Star key={i} size={12} />)}
        </span>
      )}
    </div>
  )
}
