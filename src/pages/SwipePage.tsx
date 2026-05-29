import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { useGroup } from '@/providers/GroupProvider'
import { useAvailableGroups } from '@/hooks/useSwipes'
import { PageTransition } from '@/components/PageTransition/PageTransition'
import { SwipeDeck } from '@/components/SwipeDeck/SwipeDeck'
import { BottomNav } from '@/components/BottomNav/BottomNav'

export function SwipePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { group } = useGroup()
  const { data: availableGroups = [] } = useAvailableGroups()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
  }

  return (
    <PageTransition>
    <div className="figma-screen swipe-screen">
    <div className="figma-screen-bg" />
    <div className="figma-page swipe-page">
      <header className="swipe-header">
        <span className="figma-brand swipe-brand text-secondary">Axoregal</span>

        <div ref={menuRef} className="swipe-user-menu">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu utilisateur"
            className="swipe-user-button"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="swipe-avatar rounded-full border-cup object-cover" />
            ) : (
              <div className="swipe-avatar rounded-full border-cup bg-primary flex items-center justify-center font-display text-base text-text">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {menuOpen && (
            <div className="swipe-menu-popover border-cup bg-surface shadow-cup-card">
              <div className="px-6 py-5 border-b-[2px] border-black">
                <p className="font-display text-sm text-text truncate">{user?.name}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
              <button
                className="w-full px-6 py-5 text-left font-semibold text-sm text-accent hover:bg-[rgba(255,23,68,0.08)] transition-colors"
                onClick={handleLogout}
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </header>

      <SwipeDeck />

      {!group && availableGroups.length > 0 && (
        <div className="swipe-surprise">
          <button
            className="figma-button swipe-surprise-button bg-surface text-secondary"
            onClick={() => navigate('/surprise')}
          >
            🎲 Surprends-moi
          </button>
        </div>
      )}

      <BottomNav />
    </div>
    </div>
    </PageTransition>
  )
}
