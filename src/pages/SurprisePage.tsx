import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { joinRandomGroup } from '@/services/matching'
import { useAuth } from '@/providers/AuthProvider'
import { LoadingPage } from './LoadingPage'

export function SurprisePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    joinRandomGroup(user.id)
      .then((group) => navigate(`/match/${group.id}`, { replace: true }))
      .catch(() => setError('Impossible de trouver un groupe. Réessaie !'))
  }, [user, navigate])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-bg gap-6 px-8 text-center">
        <span className="text-5xl">😔</span>
        <p className="text-cuphead text-xl text-primary">{error}</p>
        <button
          className="bg-primary text-text font-display text-lg px-8 py-3 border-cup rounded-2xl shadow-cup-btn btn-press uppercase"
          onClick={() => navigate('/swipe')}
        >
          Retour
        </button>
      </div>
    )
  }

  return <LoadingPage />
}
