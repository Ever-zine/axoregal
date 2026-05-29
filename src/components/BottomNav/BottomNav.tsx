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
  { id: 'swipe',    label: 'Swipe',    icon: '🔥', path: '/swipe' },
  { id: 'surprise', label: 'Surprends', icon: '🎲', path: '/surprise' },
  { id: 'chat',     label: 'Chat',     icon: '💬', path: '/chat', requiresGroup: true },
  { id: 'search',   label: 'Resto',    icon: '🗺️', path: '/search' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { group } = useGroup()

  return (
    <nav className="flex-shrink-0 flex border-t-[3px] border-black bg-surface h-[68px] z-[100]">
      {ITEMS.map((item, i) => {
        const isDisabled = item.requiresGroup && !group
        const isActive = pathname.startsWith(item.path)

        return (
          <button
            key={item.id}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-[3px] relative',
              'text-[10px] font-bold uppercase tracking-wider',
              i < ITEMS.length - 1 ? 'border-r-[2px] border-black' : '',
              isActive   ? 'text-secondary bg-[rgba(255,215,0,0.08)]' : 'text-muted',
              isDisabled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
            onClick={() => !isDisabled && navigate(item.path)}
            disabled={isDisabled}
            aria-label={item.label}
          >
            {isActive && (
              <span className="absolute top-0 left-[10%] w-[80%] h-[3px] bg-secondary rounded-b shadow-[0_1px_0_#000]" />
            )}
            <span className="text-[22px] leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
