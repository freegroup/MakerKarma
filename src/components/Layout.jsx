import { Outlet, NavLink } from 'react-router-dom'
import { Compass, User, Trophy } from 'lucide-react'
import AppHeader from './AppHeader'
import BlobBackground from './BlobBackground'
import './Layout.less'

export default function Layout() {
  return (
    <div className="layout">
      <BlobBackground />
      <AppHeader title="Maker Karma Yoga" />

      <main className="content">
        <Outlet />
      </main>

      <nav className="bottomnav">
        <NavLink to="/" end className="bottomnav-item">
          <Compass size={22} />
          <span>Entdecken</span>
        </NavLink>
        <NavLink to="/board" className="bottomnav-item">
          <Trophy size={22} />
          <span>Board</span>
        </NavLink>
        <NavLink to="/profile" className="bottomnav-item">
          <User size={22} />
          <span>Mein Karma</span>
        </NavLink>
      </nav>
    </div>
  )
}
