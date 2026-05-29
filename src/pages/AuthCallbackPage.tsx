import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { LoadingPage } from './LoadingPage'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('error')) {
      navigate('/login', { replace: true })
      return
    }

    // Supabase échange automatiquement le code PKCE (detectSessionInUrl: true)
    // On attend juste que la session soit établie
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/splash', { replace: true })
      } else {
        // Session pas encore prête, on attend onAuthStateChange
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'SIGNED_IN') {
            subscription.unsubscribe()
            navigate('/splash', { replace: true })
          }
        })
      }
    })
  }, [navigate])

  return <LoadingPage />
}
