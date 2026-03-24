import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './AppHeader.less'

export default function AppHeader({ title, showBack = false, right }) {
  const navigate = useNavigate()

  return (
    <header className="appheader">
      <div className="appheader-left">
        {showBack && (
          <button className="appheader-back" onClick={() => {
            window.history.length > 1 ? navigate(-1) : navigate('/')
          }}>
            <ArrowLeft size={24} />
          </button>
        )}
      </div>
      <div className="appheader-center">
        <h1 className="appheader-title">Karma Yoga <span>for Maker</span></h1>
        <p className="appheader-slogan">Tue Gutes. Hilf allen.</p>
      </div>
      <div className="appheader-right">
        {right}
      </div>
    </header>
  )
}
