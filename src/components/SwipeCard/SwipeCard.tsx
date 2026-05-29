import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'
import type { Category } from '@/data/categories'
import type { AvailableGroup } from '@/hooks/useSwipes'
import { FoodCharacter } from '@/components/FoodCharacter/FoodCharacter'
import { MemberAvatars } from '@/components/MemberAvatars/MemberAvatars'

interface Props {
  group: AvailableGroup
  category: Category
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}

const SWIPE_THRESHOLD = 80
const FLY_DISTANCE = 600

export function SwipeCard({ group, category, onSwipe, isTop }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-20, 20])
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])
  const overlayBg = useTransform(
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
      <motion.div className="pointer-events-none absolute inset-0 z-10 rounded-[22px]" style={{ backgroundColor: overlayBg }} />

      <motion.div
        className="pointer-events-none absolute left-6 top-6 z-20 rotate-[-15deg] rounded-lg border-[3px] border-accent px-3 py-1 font-display text-3xl text-accent"
        style={{ opacity: likeOpacity }}
      >
        LIKE
      </motion.div>

      <motion.div
        className="pointer-events-none absolute right-6 top-6 z-20 rotate-[15deg] rounded-lg border-[3px] border-primary px-3 py-1 font-display text-3xl text-primary"
        style={{ opacity: nopeOpacity }}
      >
        NOPE
      </motion.div>

      <div className="figma-card swipe-card">
        <div className="swipe-card-heading">
          <span className="figma-title swipe-card-title">{group.name}</span>
          <span className="swipe-card-subtitle">
            {category.emoji} {category.name}
          </span>
        </div>

        <div className="swipe-mascot-wrap">
          <FoodCharacter category={category} />
        </div>

        <div className="swipe-card-meta">
          <MemberAvatars members={group.members} />
          <span className="text-xs font-bold leading-snug text-muted">
            {group.members.length} membre{group.members.length !== 1 ? 's' : ''} déjà partant{group.members.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {isTop && (
        <div className="swipe-actions">
          <button
            className="figma-button swipe-action bg-accent text-surface"
            onClick={() => fly('right')}
            aria-label="Rejoindre le groupe"
          >
            Je viens avec vous !
          </button>
          <button
            className="figma-button swipe-action bg-secondary text-text"
            onClick={() => fly('left')}
            aria-label="Passer"
          >
            Passer
          </button>
        </div>
      )}
    </motion.div>
  )
}
