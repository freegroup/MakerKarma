import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './AppHeader.less'

export default function AppHeader({ title, showBack = false, right }) {
  const navigate = useNavigate()

  return (
    <header className="appheader">
      <div className="appheader-left">
        {showBack && (
          <button className="appheader-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
        )}
      </div>
      <h1 className="appheader-title">{title}</h1>
      <div className="appheader-right">
        {right}
      </div>
    </header>
  )
}
