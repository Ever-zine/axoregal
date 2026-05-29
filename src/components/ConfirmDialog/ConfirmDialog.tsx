import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  open: boolean
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  message,
  confirmLabel = 'Quitter',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
}: Props) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          onClick={onCancel}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-text/60" />

          {/* Card */}
          <motion.div
            className="figma-card relative flex w-full max-w-[320px] flex-col gap-5 bg-surface p-6"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-base font-bold leading-snug text-text">{message}</p>

            <div className="flex flex-col gap-3">
              <button
                className="figma-button w-full bg-primary text-base font-bold text-white"
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
              <button
                className="figma-button w-full bg-bg text-base font-bold text-muted"
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
