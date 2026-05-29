import { useNavigate, useLocation } from 'react-router-dom'
import { useGroup } from '@/providers/GroupProvider'

interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  requiresGroup?: boolean
}

const ITEMS: NavItem[] = [
  { id: 'swipe',  label: 'Swipe', icon: '♨', path: '/swipe' },
  { id: 'create', label: 'Créer', icon: '✚', path: '/create-group' },
  { id: 'chat',   label: 'Chat',  icon: '♨', path: '/chat', requiresGroup: true },
  { id: 'search', label: 'Resto', icon: '✦', path: '/search' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { group } = useGroup()

  return (
    <nav className="figma-safe-bottom bottom-nav z-[100] mx-auto flex w-full max-w-[430px] flex-shrink-0 border-t-[3px] border-black bg-surface">
      {ITEMS.map((item) => {
        const isDisabled = item.requiresGroup && !group
        const isActive = pathname.startsWith(item.path)

        return (
          <button
            key={item.id}
            className={[
              'relative flex flex-1 flex-col items-center justify-center gap-[3px]',
              'text-[10px] font-bold',
              isActive ? 'text-primary' : 'text-text',
              isDisabled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
            onClick={() => !isDisabled && navigate(item.path)}
            disabled={isDisabled}
            aria-label={item.label}
          >
            {isActive && (
              <span className="absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary" />
            )}
            <span className="bottom-nav-icon leading-none text-primary">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
