import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { useGroup } from '@/providers/GroupProvider'
import { useMatchWindow } from '@/hooks/useMatchWindow'
import { PageTransition } from '@/components/PageTransition/PageTransition'
import { SwipeDeck } from '@/components/SwipeDeck/SwipeDeck'
import { BottomNav } from '@/components/BottomNav/BottomNav'

export function SwipePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { group } = useGroup()
  const { isOpen, startLabel, endLabel } = useMatchWindow()

  return (
    <PageTransition>
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

      {!group && (
        <div className="flex-shrink-0 px-5 pb-3">
          <button
            className="w-full bg-surface border-cup rounded-2xl shadow-cup-btn btn-press font-display text-sm text-secondary uppercase py-3"
            onClick={() => navigate('/surprise')}
          >
            🎲 Surprends-moi
          </button>
        </div>
      )}

      <BottomNav />
    </div>
    </PageTransition>
  )
}
