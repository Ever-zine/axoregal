import { useState, useRef, useEffect, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CATEGORIES } from '@/data/categories'
import { fetchGroupWithMembers } from '@/services/matching'
import { useGroup } from '@/providers/GroupProvider'
import { FoodCharacter } from '@/components/FoodCharacter/FoodCharacter'
import { PageTransition } from '@/components/PageTransition/PageTransition'
import { LoadingPage } from './LoadingPage'
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog'
import './MatchPage.scss'
import soundMatch from '@/assets/Match.m4a'

const EMOJIS = ['⭐', '✨', '🎉', '💥', '🌟', '🎊', '⚡', '🔥', '💫', '🎈', '🏆', '❤️']

function Sparkles() {
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * 360
        const dist = 100 + Math.random() * 80
        const tx = Math.cos((angle * Math.PI) / 180) * dist
        const ty = Math.sin((angle * Math.PI) / 180) * dist
        const delay = i * 0.05
        const emoji = EMOJIS[i % EMOJIS.length]
        return (
          <span
            key={i}
            className="star"
            style={{ '--tx': `${tx}px`, '--ty': `${ty}px`, animationDelay: `${delay}s` } as CSSProperties}
          >
            {emoji}
          </span>
        )
      })}
    </>
  )
}

const audioRef = useRef<HTMLAudioElement | null>(null)

useEffect(() => {
  const audio = new Audio(soundMatch)
  audioRef.current = audio
  audio.play()

  return () => {
    audio.pause()
    audio.currentTime = 0
  }
}, [])

export function MatchPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { leaveGroup } = useGroup()
  const [isLeaving, setIsLeaving] = useState(false)
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false)

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => fetchGroupWithMembers(groupId!),
    enabled: !!groupId,
  })

  if (isLoading || !group) return <LoadingPage />

  const category = CATEGORIES.find((c) => c.id === group.category_id) ?? CATEGORIES[0]

  async function confirmLeaveGroup() {
    setLeaveConfirmOpen(false)
    setIsLeaving(true)
    try {
      await leaveGroup()
      navigate('/swipe', { replace: true })
    } finally {
      setIsLeaving(false)
    }
  }

  function handleLeaveGroup() {
    setLeaveConfirmOpen(true)
  }

  return (
    <PageTransition variant="pop">
    <div
      className="match-screen relative"
      style={{ backgroundColor: category.bgColor }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <Sparkles />
      </div>

      <div className="match-title-block animate-match-title">
        <span className="text-cuphead-lg match-title-kicker text-secondary">
          It's a
        </span>
        <span
          className="text-cuphead-lg match-title-main"
          style={{ color: category.color }}
        >
          Match !
        </span>
        <span className="match-group-name">«{group.name}»</span>
      </div>

      <div className="match-character">
        <FoodCharacter category={category} />
      </div>

      <div className="match-panel">
        <p className="text-cuphead text-center text-sm text-muted">
          {category.name} · {group.members.length} membre{group.members.length !== 1 ? 's' : ''}
        </p>

        <div className="match-members">
          {group.members.map((m, i) => (
            <div
              key={m.id}
              className="flex flex-col items-center gap-1"
              style={{
                marginLeft: i === 0 ? 0 : -12,
                animationDelay: `${i * 0.12}s`,
                zIndex: group.members.length - i,
              }}
            >
              {m.avatar_url ? (
                <img
                  src={m.avatar_url}
                  alt={m.name}
                  className="match-member-avatar rounded-full border-cup-xl object-cover shadow-cup-card animate-avatar-pop"
                  style={{ animationDelay: `${0.3 + i * 0.12}s`, opacity: 0 } as CSSProperties}
                />
              ) : (
                <div
                  className="match-member-avatar flex items-center justify-center rounded-full border-cup-xl bg-primary font-display text-2xl text-text shadow-cup-card animate-avatar-pop"
                  style={{ animationDelay: `${0.3 + i * 0.12}s`, opacity: 0 } as CSSProperties}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          className="figma-button match-primary-action bg-success text-text"
          onClick={() => navigate('/chat')}
        >
          Aller au chat 💬
        </button>

        <button
          className="match-leave-action"
          onClick={handleLeaveGroup}
          disabled={isLeaving}
        >
          {isLeaving ? 'Départ...' : 'Quitter le groupe'}
        </button>
      </div>
    </div>
    <ConfirmDialog
      open={leaveConfirmOpen}
      message="Quitter ce groupe ?"
      confirmLabel="Quitter"
      cancelLabel="Annuler"
      onConfirm={confirmLeaveGroup}
      onCancel={() => setLeaveConfirmOpen(false)}
    />
    </PageTransition>
  )
}
