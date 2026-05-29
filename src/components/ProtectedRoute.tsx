import { useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { LoadingPage } from '@/pages/LoadingPage'

interface Props {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading, login } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login()
    }
  }, [isLoading, isAuthenticated, login])

  if (isLoading || !isAuthenticated) return <LoadingPage />

  return <>{children}</>
}
