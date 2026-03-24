import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import TasksPage from './pages/TasksPage'
import TaskDetailPage from './pages/TaskDetailPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import CreateTaskPage from './pages/CreateTaskPage'

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
  return (
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
        <Route path="tasks/new" element={<CreateTaskPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
