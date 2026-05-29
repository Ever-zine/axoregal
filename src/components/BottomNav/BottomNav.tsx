import { useNavigate, useLocation } from 'react-router-dom'

interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  chatOnly?: boolean
}

const ITEMS: NavItem[] = [
  { id: 'swipe',    label: 'Swipe',    icon: '🔥', path: '/swipe' },
  { id: 'surprise', label: 'Surprends', icon: '🎲', path: '/surprise' },
  { id: 'chat',     label: 'Chat',     icon: '💬', path: '/chat', chatOnly: true },
  { id: 'search',   label: 'Resto',    icon: '🗺️', path: '/search' },
]

interface Props { hasGroup?: boolean }

export function BottomNav({ hasGroup = false }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="flex-shrink-0 flex border-t-[3px] border-black bg-surface h-[68px] z-[100]">
      {ITEMS.map((item, i) => {
        const isDisabled = item.chatOnly && !hasGroup
        const isActive = pathname.startsWith(item.path)

        return (
          <button
            key={item.id}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-[3px]',
              'text-[10px] font-bold uppercase tracking-wider font-body',
              i < ITEMS.length - 1 ? 'border-r-[2px] border-black' : '',
              'relative transition-colors',
              isActive   ? 'text-secondary bg-[rgba(255,215,0,0.08)]' : 'text-muted',
              isDisabled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
            onClick={() => !isDisabled && navigate(item.path)}
            disabled={isDisabled}
            aria-label={item.label}
          >
            {/* Indicateur actif */}
            {isActive && (
              <span className="absolute top-0 left-[10%] w-[80%] h-[3px] bg-secondary rounded-b-[4px] shadow-[0_1px_0_#000]" />
            )}
            <span className="text-[22px] leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
