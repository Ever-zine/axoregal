import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { LoadingPage } from './LoadingPage'
import soundTitre from '@/assets/Titre.m4a'

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
              const audioRef = useRef<HTMLAudioElement | null>(null)

              useEffect(() => {
                const audio = new Audio(soundTitre)
                audioRef.current = audio
                audio.play().catch(() => {})
              }, [])
          }
        })
      }
    })
  }, [navigate])

  return <LoadingPage />
}
