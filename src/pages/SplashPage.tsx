import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingPage } from './LoadingPage'

// Écran dansant de 2 secondes affiché une seule fois après la connexion SSO
export function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/swipe', { replace: true })
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return <LoadingPage />
}
