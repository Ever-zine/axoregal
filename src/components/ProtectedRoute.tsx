import { Navigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { LoadingPage } from '@/pages/LoadingPage'

interface Props {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingPage />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <>{children}</>
}
