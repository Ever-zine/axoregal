import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleAuthCallback } from '@/services/auth'
import { LoadingPage } from './LoadingPage'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    handleAuthCallback()
      .then(() => navigate('/splash', { replace: true }))
      .catch(() => navigate('/login', { replace: true }))
  }, [navigate])

  return <LoadingPage />
}
