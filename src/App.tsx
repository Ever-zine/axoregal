import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '@/providers/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { SplashPage } from '@/pages/SplashPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { SwipePage } from '@/pages/SwipePage'
import { MatchPage } from '@/pages/MatchPage'
import { SurprisePage } from '@/pages/SurprisePage'
import { CreateGroupPage } from '@/pages/CreateGroupPage'
import { ChatPage } from '@/pages/ChatPage'
import { SearchPage } from '@/pages/SearchPage'
import { InstallBanner } from '@/components/InstallBanner/InstallBanner'

export function App() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null

  // Clé basée sur le premier segment de route pour éviter les transitions sur
  // les changements de paramètres dynamiques (/match/id1 → /match/id2)
  const routeKey = location.pathname.split('/')[1] || 'home'

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={routeKey}>
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/splash" replace /> : <LoginPage />}
          />
          <Route path="/splash"         element={<ProtectedRoute><SplashPage /></ProtectedRoute>} />
          <Route path="/swipe"          element={<ProtectedRoute><SwipePage /></ProtectedRoute>} />
          <Route path="/match/:groupId" element={<ProtectedRoute><MatchPage /></ProtectedRoute>} />
          <Route path="/surprise"       element={<ProtectedRoute><SurprisePage /></ProtectedRoute>} />
          <Route path="/create-group"   element={<ProtectedRoute><CreateGroupPage /></ProtectedRoute>} />
          <Route path="/chat"           element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/search"         element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/splash" replace /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </AnimatePresence>

      {isAuthenticated && <InstallBanner />}
    </>
  )
}
