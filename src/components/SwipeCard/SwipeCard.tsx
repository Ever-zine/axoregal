import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'
import type { Category } from '@/data/categories'
import type { SwipeMember } from '@/hooks/useSwipes'
import { FoodCharacter } from '@/components/FoodCharacter/FoodCharacter'
import { MemberAvatars } from '@/components/MemberAvatars/MemberAvatars'
import styles from './SwipeCard.module.css'

interface Props {
  category: Category
  members: SwipeMember[]
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}

const SWIPE_THRESHOLD = 80
const FLY_DISTANCE = 600

export function SwipeCard({ category, members, onSwipe, isTop }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-20, 20])

  // Opacité des badges LIKE / NOPE
  const likeOpacity  = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const nopeOpacity  = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])

  // Overlay vert/rouge selon direction
  const overlayColor = useTransform(
    x,
    [-100, 0, 100],
    ['rgba(255,23,68,0.35)', 'rgba(0,0,0,0)', 'rgba(0,230,118,0.35)'],
  )

  async function fly(direction: 'left' | 'right') {
    await animate(x, direction === 'right' ? FLY_DISTANCE : -FLY_DISTANCE, {
      type: 'tween',
      duration: 0.25,
      ease: 'easeOut',
    })
    onSwipe(direction)
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 500) {
      fly('right')
    } else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -500) {
      fly('left')
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 })
    }
  }

  return (
    <motion.div
      className={styles.card}
      style={{
        x,
        rotate,
        backgroundColor: category.bgColor,
        pointerEvents: isTop ? 'auto' : 'none',
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
    >
      {/* Overlay coloré */}
      <motion.div className={styles.overlay} style={{ backgroundColor: overlayColor }} />

      {/* Badges LIKE / NOPE */}
      <motion.div className={`${styles.badge} ${styles.badgeLike}`} style={{ opacity: likeOpacity }}>
        LIKE
      </motion.div>
      <motion.div className={`${styles.badge} ${styles.badgeNope}`} style={{ opacity: nopeOpacity }}>
        NOPE
      </motion.div>

      <span className={styles.name}>{category.name}</span>

      <div className={styles.characterWrap}>
        <FoodCharacter category={category} />
      </div>

      <div className={styles.footer}>
        <span className={styles.membersLabel}>
          {members.length} collègue{members.length !== 1 ? 's' : ''} intéressé{members.length !== 1 ? 's' : ''}
        </span>
        <MemberAvatars members={members} />

        {/* Boutons desktop (SWIPE-06) */}
        {isTop && (
          <div className={styles.buttons}>
            <button className={`${styles.btn} ${styles.btnReject}`} onClick={() => fly('left')} aria-label="Refuser">
              ✕
            </button>
            <button className={`${styles.btn} ${styles.btnAccept}`} onClick={() => fly('right')} aria-label="Accepter">
              ✓
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
