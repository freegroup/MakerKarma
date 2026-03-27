import { Outlet, NavLink } from 'react-router-dom'
import { Compass, User, Trophy, Heart, ThumbsUp } from 'lucide-react'
import AppHeader from './AppHeader'
import './Layout.less'

export default function Layout() {
  return (
    <div className="layout">
      <AppHeader title="Maker Karma Yoga" />

      <main className="content">
        <Outlet />
      </main>

      <nav className="bottomnav">
        <NavLink to="/" end className="bottomnav-item">
          <Heart size={26} />
          <span>Wünsche</span>
        </NavLink>
        <NavLink to="/voting" className="bottomnav-item">
          <ThumbsUp size={26} />
          <span>Voting</span>
        </NavLink>
        <NavLink to="/board" className="bottomnav-item">
          <Trophy size={26} />
          <span>Board</span>
        </NavLink>
        <NavLink to="/profile" className="bottomnav-item">
          <User size={26} />
          <span>Karma</span>
        </NavLink>
      </nav>
    </div>
  )
}
