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
      className="absolute inset-0 rounded-3xl border-cup-xl shadow-cup-card flex flex-col items-center justify-between p-8 pb-6 overflow-hidden touch-none"
      style={{ x, rotate, backgroundColor: category.bgColor, cursor: isTop ? 'grab' : 'default' }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
    >
      {/* Overlay directionnel */}
      <motion.div className="absolute inset-0 rounded-[22px] pointer-events-none z-10" style={{ backgroundColor: overlayBg }} />

      {/* Badge LIKE */}
      <motion.div
        className="absolute top-6 left-6 font-display text-3xl text-success border-[3px] border-success px-3 py-1 rounded-lg rotate-[-15deg] z-20 pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        LIKE
      </motion.div>

      {/* Badge NOPE */}
      <motion.div
        className="absolute top-6 right-6 font-display text-3xl text-accent border-[3px] border-accent px-3 py-1 rounded-lg rotate-[15deg] z-20 pointer-events-none"
        style={{ opacity: nopeOpacity }}
      >
        NOPE
      </motion.div>

      <div className="flex flex-col items-center gap-1 z-10">
        <span className="text-cuphead text-4xl text-text [text-shadow:3px_3px_0_#000] text-center">
          {group.name}
        </span>
        <span className="text-sm text-muted font-semibold">
          {category.emoji} {category.name}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center py-4">
        <FoodCharacter category={category} />
      </div>

      <div className="flex flex-col items-center gap-3 w-full z-10">
        <span className="text-xs text-muted font-bold uppercase tracking-wider">
          {group.members.length} membre{group.members.length !== 1 ? 's' : ''} déjà partant{group.members.length !== 1 ? 's' : ''}
        </span>
        <MemberAvatars members={group.members} />

        {isTop && (
          <div className="flex gap-6 mt-4">
            <button
              className="w-14 h-14 rounded-full border-cup bg-accent text-text text-2xl shadow-cup-btn btn-press flex items-center justify-center"
              onClick={() => fly('left')}
              aria-label="Refuser"
            >
              ✕
            </button>
            <button
              className="w-14 h-14 rounded-full border-cup bg-success text-text text-2xl shadow-cup-btn btn-press flex items-center justify-center"
              onClick={() => fly('right')}
              aria-label="Accepter"
            >
              ✓
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
