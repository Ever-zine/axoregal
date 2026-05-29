import type { SwipeMember } from '@/hooks/useSwipes'

interface Props {
  members: SwipeMember[]
  max?: number
}

export function MemberAvatars({ members, max = 5 }: Props) {
  if (members.length === 0) {
    return <span className="text-sm text-muted italic">Sois le premier !</span>
  }

  const visible = members.slice(0, max)
  const overflow = members.length - max

  return (
    <div className="flex items-center">
      {visible.map((m, i) =>
        m.avatar_url ? (
          <img
            key={m.id}
            src={m.avatar_url}
            alt={m.name}
            className="w-9 h-9 rounded-full border-cup object-cover shadow-cup-btn flex-shrink-0"
            style={{ marginLeft: i === 0 ? 0 : -8 }}
          />
        ) : (
          <div
            key={m.id}
            className="w-9 h-9 rounded-full border-cup bg-primary flex items-center justify-center font-display text-xs text-text flex-shrink-0"
            style={{ marginLeft: i === 0 ? 0 : -8 }}
          >
            {m.name.charAt(0).toUpperCase()}
          </div>
        ),
      )}
      {overflow > 0 && (
        <div
          className="w-9 h-9 rounded-full border-cup bg-surface flex items-center justify-center font-display text-[10px] text-muted flex-shrink-0"
          style={{ marginLeft: -8 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
