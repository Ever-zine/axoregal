import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'
import type { Category } from '@/data/categories'
import type { SwipeMember } from '@/hooks/useSwipes'
import { MemberAvatars } from '@/components/MemberAvatars/MemberAvatars'
import mascot from '@/assets/figma-mascot-small.png'

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
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])
  const overlayBg   = useTransform(
    x,
    [-100, 0, 100],
    ['rgba(255,23,68,0.35)', 'rgba(0,0,0,0)', 'rgba(0,230,118,0.35)'],
  )

  async function fly(direction: 'left' | 'right') {
    await animate(x, direction === 'right' ? FLY_DISTANCE : -FLY_DISTANCE, {
      type: 'tween', duration: 0.25, ease: 'easeOut',
    })
    onSwipe(direction)
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 500) fly('right')
    else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -500) fly('left')
    else animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 })
  }

  return (
    <motion.div
      className="swipe-card-shell"
      style={{ x, rotate, cursor: isTop ? 'grab' : 'default' }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
    >
      {/* Overlay directionnel */}
      <motion.div className="pointer-events-none absolute inset-0 z-10 rounded-[22px]" style={{ backgroundColor: overlayBg }} />

      {/* Badge LIKE */}
      <motion.div
        className="pointer-events-none absolute left-6 top-6 z-20 rotate-[-15deg] rounded-lg border-[3px] border-accent px-3 py-1 font-display text-3xl text-accent"
        style={{ opacity: likeOpacity }}
      >
        LIKE
      </motion.div>

      {/* Badge NOPE */}
      <motion.div
        className="pointer-events-none absolute right-6 top-6 z-20 rotate-[15deg] rounded-lg border-[3px] border-primary px-3 py-1 font-display text-3xl text-primary"
        style={{ opacity: nopeOpacity }}
      >
        NOPE
      </motion.div>

      <div className="figma-card swipe-card">
        <span className="figma-title swipe-card-title">
          It’s {category.name} time
        </span>

        <div className="swipe-mascot-wrap">
          <img src={mascot} alt="" className="swipe-mascot" draggable={false} />
        </div>

        <div className="swipe-card-meta">
          <MemberAvatars members={members} />
          <span className="text-xs font-bold leading-snug text-muted">
            {members.length} collègue{members.length !== 1 ? 's' : ''} intéressé{members.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {isTop && (
        <div className="swipe-actions">
          <button
            className="figma-button swipe-action bg-accent text-surface"
            onClick={() => fly('right')}
            aria-label="Accepter"
          >
            Qu’est-ce qu’on mange ?
          </button>
          <button
            className="figma-button swipe-action bg-secondary text-text"
            onClick={() => fly('left')}
            aria-label="Passer"
          >
            Surprends-moi !
          </button>
        </div>
      )}
    </motion.div>
  )
}
