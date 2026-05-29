import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Variante "pop" pour les pages célébration (MatchPage) */
  variant?: 'default' | 'pop'
}

const variants = {
  default: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.14, ease: [0.4, 0, 0.2, 1] } },
    exit:    { opacity: 0, y: -6, transition: { duration: 0.1 } },
  },
  pop: {
    initial: { opacity: 0, scale: 0.82 },
    animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 22 } },
    exit:    { opacity: 0, scale: 0.94, transition: { duration: 0.1 } },
  },
} as const

export function PageTransition({ children, variant = 'default' }: Props) {
  const v = variants[variant]
  return (
    <motion.div
      className="flex flex-col flex-1 overflow-hidden"
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
    >
      {children}
    </motion.div>
  )
}
