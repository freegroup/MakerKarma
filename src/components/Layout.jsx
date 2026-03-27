import { Outlet, NavLink } from 'react-router-dom'
import { Compass, User, Trophy, Heart, ThumbsUp, Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'
import AppHeader from './AppHeader'
import './Layout.less'

export default function Layout() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="layout">
      <AppHeader title="Maker Karma Yoga" right={
        <button onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      } />

      <main className="content">
        <Outlet />
      </main>

      <nav className="bottomnav">
        <NavLink to="/" end className="bottomnav-item">
          <Heart size={26} strokeWidth={null} />
          <span>Wünsche</span>
        </NavLink>
        <NavLink to="/voting" className="bottomnav-item">
          <ThumbsUp size={26} strokeWidth={null} />
          <span>Voting</span>
        </NavLink>
        <NavLink to="/board" className="bottomnav-item">
          <Trophy size={26} strokeWidth={null} />
          <span>Board</span>
        </NavLink>
        <NavLink to="/profile" className="bottomnav-item">
          <User size={26} strokeWidth={null} />
          <span>Karma</span>
        </NavLink>
      </nav>
    </div>
  )
}
