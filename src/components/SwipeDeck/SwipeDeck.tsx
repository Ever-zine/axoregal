import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORIES } from '@/data/categories'
import { useCategoryMembers, useRecordSwipe, useTodaySwipedIds } from '@/hooks/useSwipes'
import { SwipeCard } from '@/components/SwipeCard/SwipeCard'
import styles from './SwipeDeck.module.css'

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
      <div className={styles.wrap}>
        <div className={styles.empty}>
          <span className={styles.emptyEmoji}>🎉</span>
          <h2 className={styles.emptyTitle}>Tout swipé !</h2>
          <p className={styles.emptyText}>Reviens demain pour de nouveaux choix.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.deck}>
        {/* Carte du dessous — pas interactive */}
        {nextCategory && (
          <div className={styles.cardBack}>
            <CardWithMembers category={nextCategory} onSwipe={() => {}} isTop={false} />
          </div>
        )}

        {/* Carte du dessus */}
        <AnimatePresence>
          <motion.div
            key={topCategory.id}
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
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

// Sous-composant pour charger les membres par catégorie
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
