import { useNavigate, useLocation } from 'react-router-dom'
import styles from './BottomNav.module.css'

interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  disabled?: boolean
}

const ITEMS: NavItem[] = [
  { id: 'swipe',    label: 'Swipe',      icon: '🔥', path: '/swipe' },
  { id: 'surprise', label: 'Surprends',  icon: '🎲', path: '/surprise' },
  { id: 'chat',     label: 'Chat',       icon: '💬', path: '/chat',    disabled: true },
  { id: 'search',   label: 'Resto',      icon: '🗺️', path: '/search' },
]

interface Props {
  hasGroup?: boolean
}

export function BottomNav({ hasGroup = false }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className={styles.nav}>
      {ITEMS.map((item) => {
        const isDisabled = item.id === 'chat' && !hasGroup
        const isActive = pathname.startsWith(item.path)

        return (
          <button
            key={item.id}
            className={[
              styles.item,
              isActive ? styles.active : '',
              isDisabled ? styles.disabled : '',
            ].join(' ')}
            onClick={() => !isDisabled && navigate(item.path)}
            disabled={isDisabled}
            aria-label={item.label}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
