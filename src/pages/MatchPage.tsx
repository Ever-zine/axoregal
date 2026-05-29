import type { CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CATEGORIES } from '@/data/categories'
import { fetchGroupWithMembers } from '@/services/matching'
import { FoodCharacter } from '@/components/FoodCharacter/FoodCharacter'
import { PageTransition } from '@/components/PageTransition/PageTransition'
import { LoadingPage } from './LoadingPage'
import './MatchPage.scss'

const EMOJIS = ['⭐', '✨', '🎉', '💥', '🌟', '🎊', '⚡', '🔥', '💫', '🎈', '🏆', '❤️']

function Sparkles() {
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * 360
        const dist  = 100 + Math.random() * 80
        const tx    = Math.cos((angle * Math.PI) / 180) * dist
        const ty    = Math.sin((angle * Math.PI) / 180) * dist
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

export function MatchPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => fetchGroupWithMembers(groupId!),
    enabled: !!groupId,
  })

  if (isLoading || !group) return <LoadingPage />

  const category = CATEGORIES.find((c) => c.id === group.category_id) ?? CATEGORIES[0]

  return (
    <PageTransition variant="pop">
    <div
      className="flex flex-col items-center justify-between h-full px-6 py-10 overflow-hidden relative"
      style={{ backgroundColor: category.bgColor }}
    >
      {/* Étoiles burst */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <Sparkles />
      </div>

      {/* Titre */}
      <div className="flex flex-col items-center gap-2 z-10 animate-match-title">
        <span className="text-cuphead-lg text-5xl text-secondary text-center leading-tight">
          It's a
        </span>
        <span
          className="text-cuphead-lg text-6xl text-center leading-tight"
          style={{ color: category.color }}
        >
          Match !
        </span>
        <span className="font-body text-base text-muted text-center">«{group.name}»</span>
      </div>

      {/* Personnage */}
      <div className="z-10 scale-110">
        <FoodCharacter category={category} />
      </div>

      {/* Membres */}
      <div className="flex flex-col items-center gap-4 z-10 w-full">
        <p className="text-cuphead text-sm text-muted text-center">
          {category.name} · {group.members.length} membre{group.members.length !== 1 ? 's' : ''}
        </p>

        <div className="flex items-center justify-center">
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
                  className="w-16 h-16 rounded-full border-cup-xl shadow-cup-card object-cover animate-avatar-pop"
                  style={{ animationDelay: `${0.3 + i * 0.12}s`, opacity: 0 } as CSSProperties}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full border-cup-xl shadow-cup-card bg-primary flex items-center justify-center font-display text-2xl text-text animate-avatar-pop"
                  style={{ animationDelay: `${0.3 + i * 0.12}s`, opacity: 0 } as CSSProperties}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          className="w-full mt-2 bg-success text-text font-display text-xl py-4 border-cup-xl rounded-2xl shadow-cup-card btn-press uppercase tracking-wider"
          onClick={() => navigate('/chat')}
        >
          Aller au chat 💬
        </button>

      </div>
    </div>
    </PageTransition>
  )
}
