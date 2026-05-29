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

function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const ratio = maxScore > 0 ? Math.min(score / maxScore, 1) : 0
  return (
    <div className="contest-bar-track">
      <motion.div
        className="contest-bar-fill"
        style={{ transformOrigin: 'left' }}
        animate={{ scaleX: ratio }}
        initial={{ scaleX: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      />
    </div>
  )
}

// Visualiseur de volume micro — cercle pulsant
function MicVisualizer({ volume, active }: { volume: number; active: boolean }) {
  const scale = active ? 1 + (volume / 100) * 0.6 : 1
  const opacity = active ? 0.4 + (volume / 100) * 0.6 : 0.3

  return (
    <div className="contest-mic-wrapper">
      <motion.div
        className="contest-mic-ring"
        animate={{ scale, opacity }}
        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      />
      <div className={['contest-mic-icon', active ? 'contest-mic-active' : ''].join(' ')}>
        🎙️
      </div>
      {active && (
        <span className="contest-mic-volume">{volume}%</span>
      )}
    </div>
  )
}

interface ContestPageProps {
  phase: ContestPhase
  myScore: number
  opponentScore: number
  micVolume: number
  countdownSeconds: number
  winner: string | null
  myUserId: string
  me: GroupMember | null
  opponent: GroupMember | null
  micError: string | null
}

export function ContestPage({
  phase,
  myScore,
  opponentScore,
  micVolume,
  countdownSeconds,
  winner,
  myUserId,
  me,
  opponent,
  micError,
}: ContestPageProps) {
  const isFinished = phase === 'finished'
  const isRunning = phase === 'running'
  const isCountdown = phase === 'countdown'
  const iWon = isFinished && winner === myUserId
  const maxScore = Math.max(myScore, opponentScore, 1)

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
      <div className={['contest-player contest-opponent', isFinished && !iWon ? 'contest-winner-side' : isFinished ? 'contest-loser-side' : ''].join(' ')}>
        <div className="contest-player-info">
          <Avatar member={opponent} size={52} />
          <span className="contest-player-name">{opponent?.name ?? '…'}</span>
          <span className="contest-score">🐺 {opponentScore}</span>
        </div>
        <ScoreBar score={opponentScore} maxScore={maxScore} />
      </div>

      {/* Zone centrale — countdown ou visualiseur micro */}
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
          <div className="contest-mic-center">
            <MicVisualizer volume={micVolume} active={!micError} />
            {micError ? (
              <p className="contest-mic-error">{micError}</p>
            ) : (
              <span className="contest-running-label">ABOIE !</span>
            )}
          </div>
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
        {!isCountdown && !isRunning && !isFinished && (
          <span className="contest-waiting">Prêt…</span>
        )}
      </div>

      {/* Zone joueur */}
      <div className={['contest-player contest-me', isFinished && iWon ? 'contest-winner-side' : isFinished ? 'contest-loser-side' : ''].join(' ')}>
        <ScoreBar score={myScore} maxScore={maxScore} />
        <div className="contest-player-info">
          <span className="contest-score">🐾 {myScore}</span>
          <Avatar member={me} size={52} />
          <span className="contest-player-name">{me?.name ?? '…'}</span>
        </div>
      </div>

      {/* Footer — instruction ou résultat */}
      <div className="contest-footer">
        {isRunning && !micError && (
          <p className="contest-footer-hint">Crie, aboie, hurle… le plus fort gagne !</p>
        )}
        {isCountdown && (
          <p className="contest-footer-hint">Prépare ta voix… 🎙️</p>
        )}
        {isFinished && (
          <p className="contest-footer-hint">Retour au chat dans quelques secondes…</p>
        )}
        {micError && isRunning && (
          <p className="contest-footer-hint contest-footer-error">{micError}</p>
        )}
      </div>
    </motion.div>
  )
}
