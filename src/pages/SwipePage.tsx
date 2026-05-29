import { useAuth } from '@/providers/AuthProvider'
import { SwipeDeck } from '@/components/SwipeDeck/SwipeDeck'
import { BottomNav } from '@/components/BottomNav/BottomNav'

export function SwipePage() {
  const { user } = useAuth()

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

      <SwipeDeck />
      <BottomNav />
    </div>
  )
}
