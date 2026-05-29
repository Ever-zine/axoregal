import { useEffect } from 'react'
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

  useEffect(() => {
    if (group) navigate(`/match/${group.id}`)
  }, [group, navigate])

  return (
    <PageTransition>
    <div className="figma-screen swipe-screen">
    <div className="figma-screen-bg" />
    <div className="figma-page swipe-page">
      <header className="swipe-header">
        <span className="figma-brand swipe-brand">AxoRégale</span>
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="swipe-avatar rounded-full border-cup object-cover" />
        ) : (
          <div className="swipe-avatar flex items-center justify-center rounded-full border-cup bg-primary font-display text-base text-surface">
            {user?.name.charAt(0).toUpperCase()}
          </div>
        )}
      </header>

      {isOpen ? (
        <div className="swipe-status border-cup bg-success">
          <span className="font-body text-xs font-bold text-text">
            Matching ouvert jusqu'à {endLabel}
          </span>
        </div>
      ) : (
        <div className="swipe-status border-cup bg-surface">
          <span className="font-body text-xs font-bold text-muted">
            Matching actif de {startLabel} à {endLabel}
          </span>
        </div>
      )}

      <SwipeDeck />
      <BottomNav />
    </div>
    </div>
    </PageTransition>
  )
}
