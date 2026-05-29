import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Restaurant } from '@/data/restaurants'
import { distanceLabel, walkMinutes, mapsUrl, shareChatText } from '@/services/restaurants'
import { sendMessage } from '@/services/chat'
import { useAuth } from '@/providers/AuthProvider'
import { useGroup } from '@/providers/GroupProvider'

interface Props {
  restaurant: Restaurant
}

function StarRating({ rating }: { rating: number }) {
  const full  = Math.floor(rating)
  const half  = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <span className="text-sm" aria-label={`${rating} étoiles`}>
      {'⭐'.repeat(full)}
      {half ? '✨' : ''}
      {'☆'.repeat(empty)}
      <span className="ml-1 font-bold text-text">{rating.toFixed(1)}</span>
    </span>
  )
}

const PRICE_ICONS: Record<string, string> = { low: '💰', medium: '💰💰', high: '💰💰💰' }

export function RestaurantCard({ restaurant: r }: Props) {
  const [open, setOpen] = useState(false)
  const [shared, setShared] = useState(false)
  const { user } = useAuth()
  const { group } = useGroup()

  async function handleShare() {
    if (!group || !user) return
    await sendMessage(group.id, user.id, shareChatText(r))
    setShared(true)
    setTimeout(() => setShared(false), 2500)
  }

  return (
    <>
      {/* Carte compacte */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-4 p-4 bg-surface border-cup rounded-2xl shadow-cup-btn btn-press text-left"
      >
        <span className="text-4xl flex-shrink-0">{r.emoji}</span>
        <div className="flex-1 min-w-0">
          <span className="text-cuphead text-base text-text block truncate">{r.name}</span>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <StarRating rating={r.rating} />
            <span className="text-xs text-muted">🚶 {walkMinutes(r.distanceMeters)} min</span>
            <span className="text-xs text-muted">{PRICE_ICONS[r.price]}</span>
          </div>
        </div>
        <span className="text-muted text-xl flex-shrink-0">›</span>
      </button>

      {/* Bottom sheet détail (REST-06) */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 z-[200]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface border-t-[4px] border-x-[4px] border-black rounded-t-3xl z-[201] pb-8"
              initial={{ y: '100%' }}
              animate={{ y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }}
              exit={{ y: '100%', transition: { duration: 0.2 } }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => { if (info.offset.y > 80) setOpen(false) }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-muted rounded-full" />
              </div>

              <div className="px-6 flex flex-col gap-5">
                {/* En-tête */}
                <div className="flex items-start gap-4">
                  <span className="text-6xl">{r.emoji}</span>
                  <div>
                    <h3 className="text-cuphead text-xl text-text">{r.name}</h3>
                    <StarRating rating={r.rating} />
                  </div>
                </div>

                {/* Infos */}
                <div className="flex flex-col gap-3">
                  <Row icon="📍" text={r.address} />
                  <Row icon="⏰" text={r.hours} />
                  <Row icon="🚶" text={`${distanceLabel(r.distanceMeters)} — ${walkMinutes(r.distanceMeters)} min à pied`} />
                  <Row icon="💰" text={PRICE_ICONS[r.price] + ' ' + (r.price === 'low' ? '< 10 €' : r.price === 'medium' ? '10–20 €' : '> 20 €')} />
                  {r.phone && <Row icon="📞" text={r.phone} />}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <a
                    href={mapsUrl(r)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 bg-primary border-cup rounded-2xl shadow-cup-btn btn-press text-text font-display uppercase tracking-wider"
                  >
                    🗺️ Voir sur Maps
                  </a>

                  {group && (
                    <button
                      onClick={handleShare}
                      className={[
                        'flex items-center justify-center gap-2 py-3 border-cup rounded-2xl shadow-cup-btn btn-press font-display uppercase tracking-wider',
                        shared ? 'bg-success text-black' : 'bg-bg text-text',
                      ].join(' ')}
                    >
                      {shared ? '✅ Partagé !' : '💬 Partager au groupe'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function Row({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
      <span className="text-sm text-text leading-relaxed">{text}</span>
    </div>
  )
}
