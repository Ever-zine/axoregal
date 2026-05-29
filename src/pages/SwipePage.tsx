import { useAuth } from '@/providers/AuthProvider'
import { SwipeDeck } from '@/components/SwipeDeck/SwipeDeck'
import { BottomNav } from '@/components/BottomNav/BottomNav'
import styles from './SwipePage.module.css'

export function SwipePage() {
  const { user } = useAuth()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>Axoregal</span>
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className={styles.userAvatar} />
        ) : (
          <div className={styles.userInitial}>
            {user?.name.charAt(0).toUpperCase()}
          </div>
        )}
      </header>

      <SwipeDeck />

      <BottomNav />
    </div>
  )
}
