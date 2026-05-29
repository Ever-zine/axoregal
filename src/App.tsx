import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { SplashPage } from '@/pages/SplashPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { SwipePage } from '@/pages/SwipePage'

export function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/splash" replace /> : <LoginPage />}
      />
      <Route
        path="/splash"
        element={
          <ProtectedRoute>
            <SplashPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/swipe"
        element={
          <ProtectedRoute>
            <SwipePage />
          </ProtectedRoute>
        }
      />
      {/* Première visite après connexion → splash */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to="/splash" replace />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  )
}
