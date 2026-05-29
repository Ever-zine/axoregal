import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORIES } from '@/data/categories'
import { useAvailableGroups, useRecordSwipe, useJoinGroup, type AvailableGroup } from '@/hooks/useSwipes'
import { useGroup } from '@/providers/GroupProvider'
import { useAuth } from '@/providers/AuthProvider'
import { SwipeCard } from '@/components/SwipeCard/SwipeCard'

export function SwipeDeck() {
  const { user } = useAuth()
  const { group: myGroup } = useGroup()
  const { data: availableGroups = [], isLoading } = useAvailableGroups()
  const [localSwiped, setLocalSwiped] = useState<string[]>([])
  const { mutate: recordSwipe } = useRecordSwipe()
  const { mutate: joinGroup } = useJoinGroup()
  const navigate = useNavigate()

  if (myGroup) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-8">
        <span className="text-[80px]">🎉</span>
        <h2 className="text-cuphead-lg text-2xl text-secondary">Tu es dans un groupe !</h2>
        <p className="text-muted font-semibold text-lg">«{myGroup.name}»</p>
        <button
          className="bg-success text-text font-display text-lg px-8 py-3 border-cup-xl rounded-2xl shadow-cup-card btn-press uppercase"
          onClick={() => navigate('/chat')}
        >
          Aller au chat 💬
        </button>
      </div>
    )
  }

  const queue = availableGroups.filter((g) => !localSwiped.includes(g.id))
  const topGroup = queue[0]
  const nextGroup = queue[1]

  function handleSwipe(groupId: string, direction: 'left' | 'right') {
    setLocalSwiped((prev) => [...prev, groupId])
    if (direction === 'right') {
      recordSwipe({ groupId, direction })
      if (user) joinGroup(groupId)
    } else {
      recordSwipe({ groupId, direction })
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-muted font-semibold">Chargement des groupes…</span>
      </div>
    )
  }

  if (!topGroup) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-8">
        <span className="text-[80px] animate-whirl">🍽️</span>
        <h2 className="text-cuphead-lg text-3xl text-secondary">Aucun groupe dispo</h2>
        <p className="text-muted font-semibold">Sois le premier à en créer un !</p>
        <button
          className="bg-primary text-text font-display text-lg px-8 py-3 border-cup-xl rounded-2xl shadow-cup-card btn-press uppercase"
          onClick={() => navigate('/create-group')}
        >
          Créer un groupe ✚
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 pb-2">
      <div className="relative w-full max-w-[360px] h-full">
        {/* Carte du dessous */}
        {nextGroup && (
          <div className="absolute inset-0 scale-[0.94] translate-y-3">
            <GroupCard group={nextGroup} onSwipe={() => {}} isTop={false} />
          </div>
        )}

        {/* Carte du dessus */}
        <AnimatePresence>
          <motion.div
            key={topGroup.id}
            className="absolute inset-0 z-10"
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <GroupCard
              group={topGroup}
              onSwipe={(dir) => handleSwipe(topGroup.id, dir)}
              isTop
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function GroupCard({
  group,
  onSwipe,
  isTop,
}: {
  group: AvailableGroup
  onSwipe: (dir: 'left' | 'right') => void
  isTop: boolean
}) {
  const category = CATEGORIES.find((c) => c.id === group.category_id) ?? CATEGORIES[0]
  return <SwipeCard group={group} category={category} onSwipe={onSwipe} isTop={isTop} />
}
