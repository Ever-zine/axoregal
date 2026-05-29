import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORIES } from '@/data/categories'
import { useCategoryMembers, useRecordSwipe, useTodaySwipedIds } from '@/hooks/useSwipes'
import { SwipeCard } from '@/components/SwipeCard/SwipeCard'

export function SwipeDeck() {
  const alreadySwiped = useTodaySwipedIds()
  const remaining = CATEGORIES.filter((c) => !alreadySwiped.has(c.id))
  const [localSwiped, setLocalSwiped] = useState<string[]>([])
  const { mutate: recordSwipe } = useRecordSwipe()

  const queue = remaining.filter((c) => !localSwiped.includes(c.id))
  const topCategory = queue[0]
  const nextCategory = queue[1]

  function handleSwipe(categoryId: string, direction: 'left' | 'right') {
    setLocalSwiped((prev) => [...prev, categoryId])
    recordSwipe({ categoryId, direction })
  }

  if (!topCategory) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-8">
        <span className="text-[80px] animate-whirl">🎉</span>
        <h2 className="text-cuphead-lg text-3xl text-secondary">Tout swipé !</h2>
        <p className="text-muted font-semibold">Reviens demain pour de nouveaux choix.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 pb-2">
      <div className="relative w-full max-w-[360px] h-full">
        {/* Carte du dessous */}
        {nextCategory && (
          <div className="absolute inset-0 scale-[0.94] translate-y-3">
            <CardWithMembers category={nextCategory} onSwipe={() => {}} isTop={false} />
          </div>
        )}

        {/* Carte du dessus */}
        <AnimatePresence>
          <motion.div
            key={topCategory.id}
            className="absolute inset-0 z-10"
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <CardWithMembers
              category={topCategory}
              onSwipe={(dir) => handleSwipe(topCategory.id, dir)}
              isTop
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function CardWithMembers({
  category,
  onSwipe,
  isTop,
}: {
  category: (typeof CATEGORIES)[0]
  onSwipe: (dir: 'left' | 'right') => void
  isTop: boolean
}) {
  const { data: members = [] } = useCategoryMembers(category.id)
  return <SwipeCard category={category} members={members} onSwipe={onSwipe} isTop={isTop} />
}
