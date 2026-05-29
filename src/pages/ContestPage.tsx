import { type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import type { ContestPhase } from '@/hooks/useContest'
import type { GroupMember } from '@/services/matching'
import './ContestPage.scss'

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
        return (
          <span
            key={i}
            className="star"
            style={{ '--tx': `${tx}px`, '--ty': `${ty}px`, animationDelay: `${delay}s` } as CSSProperties}
          >
            {EMOJIS[i % EMOJIS.length]}
          </span>
        )
      })}
    </>
  )
}

function Avatar({ member, size = 64 }: { member: GroupMember | null; size?: number }) {
  if (!member) return <div className="contest-avatar-placeholder" style={{ width: size, height: size }} />
  return member.avatar_url ? (
    <img
      src={member.avatar_url}
      alt={member.name}
      className="contest-avatar"
      style={{ width: size, height: size }}
    />
  ) : (
    <div className="contest-avatar contest-avatar-initial" style={{ width: size, height: size }}>
      {member.name.charAt(0).toUpperCase()}
    </div>
  )
}

function ScoreBar({ score, maxScore, reversed }: { score: number; maxScore: number; reversed?: boolean }) {
  const ratio = maxScore > 0 ? Math.min(score / maxScore, 1) : 0
  return (
    <div className="contest-bar-track">
      <motion.div
        className="contest-bar-fill"
        style={{ transformOrigin: reversed ? 'right' : 'left' }}
        animate={{ scaleX: ratio }}
        initial={{ scaleX: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      />
    </div>
  )
}

interface ContestPageProps {
  phase: ContestPhase
  myScore: number
  opponentScore: number
  countdownSeconds: number
  winner: string | null
  myUserId: string
  me: GroupMember | null
  opponent: GroupMember | null
  isChallenger: boolean
  onTap: () => void
}

export function ContestPage({
  phase,
  myScore,
  opponentScore,
  countdownSeconds,
  winner,
  myUserId,
  me,
  opponent,
  onTap,
}: ContestPageProps) {
  const isFinished = phase === 'finished'
  const isRunning = phase === 'running'
  const isCountdown = phase === 'countdown'
  const iWon = isFinished && winner === myUserId
  const maxScore = Math.max(myScore, opponentScore, 10)

  return (
    <motion.div
      className="contest-overlay"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
    >
      {/* Sparkles victoire */}
      {isFinished && iWon && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" style={{ zIndex: 10 }}>
          <Sparkles />
        </div>
      )}

      {/* Header */}
      <div className="contest-header">
        <span className="contest-header-title">👑 ALPHA CONTEST</span>
      </div>

      {/* Zone adversaire */}
      <div className={['contest-player contest-opponent', isFinished && winner !== myUserId ? 'contest-winner-side' : isFinished ? 'contest-loser-side' : ''].join(' ')}>
        <div className="contest-player-info">
          <Avatar member={opponent} size={56} />
          <span className="contest-player-name">{opponent?.name ?? '…'}</span>
          <span className="contest-score">🐺 x{opponentScore}</span>
        </div>
        <ScoreBar score={opponentScore} maxScore={maxScore} reversed />
      </div>

      {/* Countdown / Timer central */}
      <div className="contest-center">
        {isCountdown && (
          <motion.span
            key={countdownSeconds}
            className="contest-countdown"
            initial={{ scale: 2.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            {countdownSeconds}
          </motion.span>
        )}
        {isRunning && (
          <span className="contest-running-label">ABOIE !</span>
        )}
        {isFinished && (
          <motion.div
            className="contest-result"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.1 }}
          >
            {iWon ? '👑 ALPHA !' : '😤 DÉFAITE'}
          </motion.div>
        )}
      </div>

      {/* Zone joueur */}
      <div className={['contest-player contest-me', isFinished && winner === myUserId ? 'contest-winner-side' : isFinished ? 'contest-loser-side' : ''].join(' ')}>
        <ScoreBar score={myScore} maxScore={maxScore} />
        <div className="contest-player-info">
          <span className="contest-score">🐾 x{myScore}</span>
          <Avatar member={me} size={56} />
          <span className="contest-player-name">{me?.name ?? '…'}</span>
        </div>
      </div>

      {/* Bouton tap */}
      <motion.button
        className={['contest-tap-button figma-button', isRunning ? 'bg-primary text-surface' : 'bg-surface text-muted opacity-60'].join(' ')}
        onClick={onTap}
        disabled={!isRunning}
        whileTap={isRunning ? { scale: 0.9 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {isRunning ? '🐺 ABOYER / HURLER !' : isCountdown ? `Prêt… ${countdownSeconds}` : isFinished ? 'Retour au chat…' : '…'}
      </motion.button>
    </motion.div>
  )
}
