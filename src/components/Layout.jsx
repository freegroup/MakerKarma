import { Outlet, NavLink } from 'react-router-dom'
import { ClipboardList, User } from 'lucide-react'
import './Layout.less'

export default function Layout() {
  return (
    <div className="layout">
      <header className="topbar">
        <h1 className="topbar-title">MakerKarma</h1>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <nav className="bottomnav">
        <NavLink to="/" end className="bottomnav-item">
          <ClipboardList size={22} />
          <span>Aufgaben</span>
        </NavLink>
        <NavLink to="/profile" className="bottomnav-item">
          <User size={22} />
          <span>Profil</span>
        </NavLink>
      </nav>
    </div>
  )
}
