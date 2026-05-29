import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { SplashPage } from '@/pages/SplashPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { SwipePage } from '@/pages/SwipePage'
import { MatchPage } from '@/pages/MatchPage'
import { SurprisePage } from '@/pages/SurprisePage'

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
      <Route path="/splash"    element={<ProtectedRoute><SplashPage /></ProtectedRoute>} />
      <Route path="/swipe"     element={<ProtectedRoute><SwipePage /></ProtectedRoute>} />
      <Route path="/match/:groupId" element={<ProtectedRoute><MatchPage /></ProtectedRoute>} />
      <Route path="/surprise"  element={<ProtectedRoute><SurprisePage /></ProtectedRoute>} />
      {/* Chat et Search — placeholders Epic 4 & 5 */}
      <Route path="/chat"      element={<ProtectedRoute><SwipePage /></ProtectedRoute>} />
      <Route path="/search"    element={<ProtectedRoute><SwipePage /></ProtectedRoute>} />
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/splash" replace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}
