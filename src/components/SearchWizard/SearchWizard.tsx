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
    <div className="figma-main search-wizard">
      {/* Progress */}
      <div className="search-progress">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={[
              'h-3 rounded-full border-[2px] border-black transition-all duration-200',
              i < stepIdx  ? 'w-10 bg-secondary' :
              i === stepIdx ? 'w-10 bg-primary' :
              'w-5 bg-surface',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Catégorie pré-filtrée (REST-04) */}
      {category && (
        <div className="search-category-pill border-cup bg-surface">
          <span className="text-xl">{category.emoji}</span>
          <span className="flex-1 text-xs font-bold text-muted">
            Filtré sur {category.name}
          </span>
        </div>
      )}

      {/* Question + options */}
      <div className="search-question-pane">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            variants={slide}
            initial="initial"
            animate="animate"
            exit="exit"
            className="search-step"
          >
            <h2 className="figma-title search-question">
              {step.question}
            </h2>

            <div className="figma-scroll search-options">
              {(step.options as Option<unknown>[]).map((opt, i) => (
                <button
                  key={String(opt.value)}
                  onClick={() => pick(opt.value)}
                  className={[
                    'figma-button search-option text-surface',
                    i % 3 === 0 ? 'bg-accent' : i % 3 === 1 ? 'bg-primary' : 'bg-secondary text-text',
                  ].join(' ')}
                >
                  <span className="flex-shrink-0 text-3xl">{opt.emoji}</span>
                  <div className="min-w-0">
                    <span className="block text-xl font-bold leading-tight">{opt.label}</span>
                    {opt.sub && <span className="text-xs font-bold opacity-80">{opt.sub}</span>}
                  </div>
                  <span className="ml-auto text-xl">›</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Retour */}
      {stepIdx > 0 && (
        <button
          className="search-back-button"
          onClick={() => setStepIdx((i) => i - 1)}
        >
          ← Retour
        </button>
      )}
    </div>
  )
}
