import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleAuthCallback } from '@/services/auth'
import { LoadingPage } from './LoadingPage'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const params = new URLSearchParams(window.location.search)
    if (params.has('error')) {
      navigate('/login', { replace: true })
      return
    }

    handleAuthCallback()
      .then(() => navigate('/splash', { replace: true }))
      .catch(() => navigate('/login', { replace: true }))
  }, [navigate])

  return <LoadingPage />
}
