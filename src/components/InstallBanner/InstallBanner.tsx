import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export function InstallBanner() {
  const { canInstall, install } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[448px] z-[150]"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } }}
        exit={{ y: 80, opacity: 0 }}
      >
        <div className="flex items-center gap-3 p-4 bg-surface border-cup-xl rounded-2xl shadow-cup-card">
          <img src="/icons/icon-192.png" alt="Axoregal" className="w-12 h-12 rounded-xl border-cup flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <p className="text-cuphead text-sm text-secondary">Installer Axoregal</p>
            <p className="text-xs text-muted">Accès rapide depuis ton écran d'accueil</p>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-2 text-xs font-bold text-muted border-cup rounded-xl"
              aria-label="Ignorer"
            >
              Plus tard
            </button>
            <button
              onClick={install}
              className="px-3 py-2 text-xs font-bold text-text bg-primary border-cup rounded-xl shadow-cup-btn btn-press"
            >
              Installer
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
