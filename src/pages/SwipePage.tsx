import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { useGroup } from '@/providers/GroupProvider'
import { PageTransition } from '@/components/PageTransition/PageTransition'
import { SwipeDeck } from '@/components/SwipeDeck/SwipeDeck'
import { BottomNav } from '@/components/BottomNav/BottomNav'

export function SwipePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { group } = useGroup()
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
    <div className="flex flex-col h-full bg-bg overflow-hidden">
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b-[2px] border-black">
        <span className="text-cuphead-lg text-2xl text-secondary">Axoregal</span>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu utilisateur"
            className="focus:outline-none"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-cup object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full border-cup bg-primary flex items-center justify-center font-display text-base text-text">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 min-w-[180px] bg-surface border-cup rounded-2xl shadow-cup-card overflow-hidden">
              <div className="px-4 py-3 border-b-[2px] border-black">
                <p className="font-display text-sm text-text truncate">{user?.name}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
              <button
                className="w-full px-4 py-3 text-left font-semibold text-sm text-accent hover:bg-[rgba(255,23,68,0.08)] transition-colors"
                onClick={handleLogout}
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </header>

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
