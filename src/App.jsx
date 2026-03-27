import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import ScrollToTop from './components/ScrollToTop'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import TasksPage from './pages/TasksPage'
import TaskDetailPage from './pages/TaskDetailPage'
import ProfilePage from './pages/ProfilePage'
import KarmaBoardPage from './pages/KarmaBoardPage'
import CreateTaskPage from './pages/CreateTaskPage'
import VotingPage from './pages/VotingPage'
import VotingDetailPage from './pages/VotingDetailPage'

function ProtectedRoute({ children }) {
  const { user, token } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Wait for Zustand persist to hydrate from localStorage
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    // Already hydrated?
    if (useAuthStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  if (!hydrated) return null

  if (!user || !token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  // Apply persisted theme on mount
  useThemeStore.getState().initTheme()

  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TasksPage />} />
        <Route path="voting" element={<VotingPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="board" element={<KarmaBoardPage />} />
      </Route>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route path="tasks/new" element={<CreateTaskPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="voting/:id" element={<VotingDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
