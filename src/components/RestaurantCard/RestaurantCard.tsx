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
        className="figma-button restaurant-card bg-surface"
      >
        <span className="restaurant-card-emoji">{r.emoji}</span>
        <div className="restaurant-card-body">
          <span className="figma-title restaurant-card-title">{r.name}</span>
          <div className="restaurant-card-meta">
            <StarRating rating={r.rating} />
            <span className="text-xs text-muted">🚶 {walkMinutes(r.distanceMeters)} min</span>
            <span className="text-xs text-muted">{PRICE_ICONS[r.price]}</span>
          </div>
        </div>
        <span className="restaurant-card-arrow">›</span>
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
              className="restaurant-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }}
              exit={{ y: '100%', transition: { duration: 0.2 } }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => { if (info.offset.y > 80) setOpen(false) }}
            >
              {/* Handle */}
              <div className="flex justify-center pb-2 pt-3">
                <div className="h-1.5 w-12 rounded-full bg-muted" />
              </div>

              <div className="restaurant-sheet-content">
                {/* En-tête */}
                <div className="restaurant-sheet-header">
                  <span className="restaurant-sheet-emoji">{r.emoji}</span>
                  <div>
                    <h3 className="figma-title restaurant-sheet-title">{r.name}</h3>
                    <StarRating rating={r.rating} />
                  </div>
                </div>

                {/* Infos */}
                <div className="restaurant-sheet-info">
                  <Row icon="📍" text={r.address} />
                  <Row icon="⏰" text={r.hours} />
                  <Row icon="🚶" text={`${distanceLabel(r.distanceMeters)} — ${walkMinutes(r.distanceMeters)} min à pied`} />
                  <Row icon="💰" text={PRICE_ICONS[r.price] + ' ' + (r.price === 'low' ? '< 10 €' : r.price === 'medium' ? '10–20 €' : '> 20 €')} />
                  {r.phone && <Row icon="📞" text={r.phone} />}
                </div>

                {/* Actions */}
                <div className="restaurant-sheet-actions">
                  <a
                    href={mapsUrl(r)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="figma-button restaurant-sheet-action bg-primary text-surface"
                  >
                    🗺️ Voir sur Maps
                  </a>

                  {group && (
                    <button
                      onClick={handleShare}
                      className={[
                        'figma-button restaurant-sheet-action',
                        shared ? 'bg-success text-text' : 'bg-bg text-text',
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
    <div className="restaurant-info-row">
      <span className="mt-0.5 flex-shrink-0 text-lg">{icon}</span>
      <span className="text-sm text-text leading-relaxed">{text}</span>
    </div>
  )
}
