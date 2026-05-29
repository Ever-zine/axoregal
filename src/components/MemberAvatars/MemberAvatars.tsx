import type { SwipeMember } from '@/hooks/useSwipes'
import styles from './MemberAvatars.module.css'

interface Props {
  members: SwipeMember[]
  max?: number
}

export function MemberAvatars({ members, max = 5 }: Props) {
  if (members.length === 0) {
    return <span className={styles.empty}>Sois le premier !</span>
  }

  const visible = members.slice(0, max)
  const overflow = members.length - max

  return (
    <div className={styles.list}>
      {visible.map((m) =>
        m.avatar_url ? (
          <img key={m.id} src={m.avatar_url} alt={m.name} className={styles.avatar} />
        ) : (
          <div key={m.id} className={styles.placeholder}>
            {m.name.charAt(0).toUpperCase()}
          </div>
        ),
      )}
      {overflow > 0 && <div className={styles.overflow}>+{overflow}</div>}
    </div>
  )
}
