import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { useMatch } from '@/hooks/useMatch'
import { useMatchWindow } from '@/hooks/useMatchWindow'
import { SwipeDeck } from '@/components/SwipeDeck/SwipeDeck'
import { BottomNav } from '@/components/BottomNav/BottomNav'

export function SwipePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { group } = useMatch()
  const { isOpen, startLabel, endLabel } = useMatchWindow()

  // Redirige vers la page match dès qu'un groupe est détecté
  useEffect(() => {
    if (group) navigate(`/match/${group.id}`)
  }, [group, navigate])

  return (
    <div className="flex flex-col h-full bg-bg overflow-hidden">
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b-[2px] border-black">
        <span className="text-cuphead-lg text-2xl text-secondary">Axoregal</span>
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-cup object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full border-cup bg-primary flex items-center justify-center font-display text-base text-text">
            {user?.name.charAt(0).toUpperCase()}
          </div>
        )}
      </header>

      {/* Bandeau fenêtre de matching (MATCH-04) */}
      {isOpen ? (
        <div className="flex-shrink-0 bg-success border-b-[2px] border-black px-4 py-2 flex items-center justify-center gap-2">
          <span className="text-[18px]">🔥</span>
          <span className="font-display text-sm text-black uppercase tracking-wider">
            Matching ouvert jusqu'à {endLabel}
          </span>
        </div>
      ) : (
        <div className="flex-shrink-0 bg-surface border-b-[2px] border-black px-4 py-2 flex items-center justify-center gap-2">
          <span className="text-[16px]">⏰</span>
          <span className="font-body text-xs text-muted font-semibold">
            Matching actif de {startLabel} à {endLabel}
          </span>
        </div>
      )}

      <SwipeDeck />
      <BottomNav hasGroup={!!group} />
    </div>
  )
}
