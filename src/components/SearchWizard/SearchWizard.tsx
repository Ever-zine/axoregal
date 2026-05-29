import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORIES } from '@/data/categories'
import type { SearchFilters } from '@/services/restaurants'
import type { Diet, PriceRange } from '@/data/restaurants'

interface Option<T> {
  value: T
  label: string
  emoji: string
  sub?: string
}

const PRICE_OPTIONS: Option<PriceRange>[] = [
  { value: 'low',    emoji: '💰', label: '< 10 €',   sub: 'Petit budget' },
  { value: 'medium', emoji: '🍔', label: '10–20 €',  sub: 'Raisonnable' },
  { value: 'high',   emoji: '💎', label: '> 20 €',   sub: 'On se fait plaisir' },
]

const DISTANCE_OPTIONS: Option<number>[] = [
  { value: 400,  emoji: '🚶', label: '< 5 min',   sub: 'À deux pas' },
  { value: 800,  emoji: '🏃', label: '5–10 min',  sub: 'Petite marche' },
  { value: 2000, emoji: '🚗', label: '> 10 min',  sub: 'On s\'y met' },
]

const DIET_OPTIONS: Option<Diet>[] = [
  { value: 'all',         emoji: '🍽️', label: 'Tout',          sub: 'Pas de restriction' },
  { value: 'vegetarian',  emoji: '🥦', label: 'Végétarien',    sub: 'Sans viande' },
  { value: 'vegan',       emoji: '🌿', label: 'Vegan',         sub: 'Zéro produit animal' },
  { value: 'gluten_free', emoji: '🌾', label: 'Sans gluten',   sub: 'Intolérant au gluten' },
]

const STEPS = [
  { id: 'price',    question: 'Quel budget ?',         options: PRICE_OPTIONS },
  { id: 'distance', question: 'Quelle distance ?',     options: DISTANCE_OPTIONS },
  { id: 'diet',     question: 'Régime alimentaire ?',  options: DIET_OPTIONS },
] as const

interface Props {
  onComplete: (filters: SearchFilters) => void
  defaultCategoryId?: string
}

const slide = {
  initial:  { x: 60, opacity: 0 },
  animate:  { x: 0,  opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit:     { x: -60, opacity: 0, transition: { duration: 0.15 } },
}

export function SearchWizard({ onComplete, defaultCategoryId }: Props) {
  const [stepIdx, setStepIdx] = useState(0)
  const [answers, setAnswers] = useState<Partial<{ price: PriceRange; distance: number; diet: Diet }>>({})

  const step = STEPS[stepIdx]
  const category = CATEGORIES.find((c) => c.id === defaultCategoryId)

  function pick(value: unknown) {
    const next = { ...answers, [step.id]: value }
    setAnswers(next)
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((i) => i + 1)
    } else {
      onComplete({
        price: next.price!,
        maxDistanceMeters: next.distance!,
        diet: next.diet!,
        categoryId: defaultCategoryId,
      })
    }
  }

  return (
    <div className="flex flex-col h-full bg-bg overflow-hidden">
      {/* Progress */}
      <div className="flex-shrink-0 flex items-center justify-center gap-3 pt-8 pb-4">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={[
              'h-2 rounded-full border-[2px] border-black transition-all duration-200',
              i < stepIdx  ? 'w-8 bg-success' :
              i === stepIdx ? 'w-8 bg-primary' :
              'w-4 bg-surface',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Catégorie pré-filtrée (REST-04) */}
      {category && (
        <div className="flex-shrink-0 mx-4 mb-2 flex items-center gap-2 px-4 py-2 bg-surface border-cup rounded-xl">
          <span className="text-xl">{category.emoji}</span>
          <span className="text-xs font-bold text-muted uppercase tracking-wider flex-1">
            Filtré sur {category.name}
          </span>
        </div>
      )}

      {/* Question + options */}
      <div className="flex-1 flex flex-col px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            variants={slide}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col flex-1 overflow-hidden"
          >
            <h2 className="text-cuphead-lg text-3xl text-secondary text-center pt-4 pb-6">
              {step.question}
            </h2>

            <div className="flex flex-col gap-3 overflow-y-auto pb-4">
              {(step.options as Option<unknown>[]).map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => pick(opt.value)}
                  className="flex items-center gap-4 p-4 bg-surface border-cup rounded-2xl shadow-cup-btn btn-press text-left"
                >
                  <span className="text-4xl flex-shrink-0">{opt.emoji}</span>
                  <div>
                    <span className="text-cuphead text-lg text-text block">{opt.label}</span>
                    {opt.sub && <span className="text-xs text-muted">{opt.sub}</span>}
                  </div>
                  <span className="ml-auto text-muted text-xl">›</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Retour */}
      {stepIdx > 0 && (
        <button
          className="flex-shrink-0 text-muted text-sm font-semibold underline text-center py-4"
          onClick={() => setStepIdx((i) => i - 1)}
        >
          ← Retour
        </button>
      )}
    </div>
  )
}
