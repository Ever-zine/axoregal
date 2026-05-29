import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORIES } from '@/data/categories'
import { useAvailableGroups, useRecordSwipe, useJoinGroup, type AvailableGroup } from '@/hooks/useSwipes'
import { useGroup } from '@/providers/GroupProvider'
import { useAuth } from '@/providers/AuthProvider'
import { SwipeCard } from '@/components/SwipeCard/SwipeCard'
import soundGood from '@/assets/Wouhou.m4a'
import soundNul from '@/assets/Pinpin.m4a'

export function SwipeDeck() {
  const { user } = useAuth()
  const { group: myGroup, leaveGroup } = useGroup()
  const { data: availableGroups = [], isLoading } = useAvailableGroups()
  const [localSwiped, setLocalSwiped] = useState<string[]>([])
  const [isLeaving, setIsLeaving] = useState(false)
  const { mutate: recordSwipe } = useRecordSwipe()
  const { mutate: joinGroup } = useJoinGroup()
  const navigate = useNavigate()

  async function handleLeaveGroup() {
    if (!window.confirm('Quitter ce groupe ?')) return
    setIsLeaving(true)
    try {
      await leaveGroup()
    } finally {
      setIsLeaving(false)
    }
  }

  if (myGroup) {
    return (
      <div className="figma-main swipe-empty">
        <span className="text-[80px]">🎉</span>
        <h2 className="figma-title text-3xl">Tu es dans un groupe !</h2>
        <p className="text-lg font-semibold text-muted">«{myGroup.name}»</p>
        <button
          className="figma-button bg-success px-8 text-lg text-text"
          onClick={() => navigate('/chat')}
        >
          Aller au chat
        </button>
        <button
          className="text-sm font-bold text-muted underline"
          onClick={handleLeaveGroup}
          disabled={isLeaving}
        >
          {isLeaving ? 'Départ...' : 'Quitter le groupe'}
        </button>
      </div>
    )
  }

  const queue = availableGroups.filter((g) => !localSwiped.includes(g.id))
  const topGroup = queue[0]
  const nextGroup = queue[1]

  function handleSwipe(groupId: string, direction: 'left' | 'right') {
    setLocalSwiped((prev) => [...prev, groupId])
    recordSwipe({ groupId, direction })
    if (direction === 'right' && user) 
    {
      joinGroup(groupId)
      const audio = new Audio(soundGood)
      audio.play()
      navigate(/match/ + groupId)
    }
    else
    {
      const audio = new Audio(soundNul)
      audio.play()
    }
  }

  if (isLoading) {
    return (
      <div className="figma-main swipe-empty">
        <span className="font-semibold text-muted">Chargement des groupes...</span>
      </div>
    )
  }

  if (!topGroup) {
    return (
      <div className="figma-main swipe-empty">
        <span className="text-[80px] animate-whirl">✦</span>
        <h2 className="figma-title text-3xl">Aucun groupe dispo</h2>
        <p className="font-semibold text-muted">Sois le premier à en créer un !</p>
        <button
          className="figma-button bg-primary px-8 text-lg text-surface"
          onClick={() => navigate('/create-group')}
        >
          Créer un groupe
        </button>
      </div>
    )
  }

  return (
    <div className="figma-main swipe-deck figma-scroll">
      <div className="swipe-deck-inner">
        <div className="swipe-card-stage">
          {nextGroup && (
            <div className="absolute inset-0 scale-[0.94] translate-y-3">
              <GroupCard group={nextGroup} onSwipe={() => {}} isTop={false} />
            </div>
          )}

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
