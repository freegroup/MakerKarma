import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../types'
import { Star } from 'lucide-react'
import './TaskCard.less'

export default function TaskCard({ task }) {
  const navigate = useNavigate()
  const category = CATEGORIES[task.category] || CATEGORIES.sonstiges

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
              <Star size={14} /> {task.points} Punkte
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
