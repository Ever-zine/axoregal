import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORIES } from '@/data/categories'
import type { SearchFilters } from '@/services/restaurants'
import type { Diet, PriceRange } from '@/data/restaurants'

/* ─── Types ─────────────────────────────────────────────────────────── */

type TagValue = string | number | boolean

interface Option<T extends TagValue> {
  value: T
  label: string
  emoji: string
  sub?: string
  tags: Partial<FilterTags>
}

interface FilterTags {
  price: PriceRange
  maxDistanceMeters: number
  diet: Diet
  vibe: 'rapide' | 'tranquille' | 'festif' | 'romantique' | 'business'
  hungry: boolean
  outdoor: boolean
  noise: 'calme' | 'animé'
  familiar: boolean
  speed: 'fast' | 'slow'
  healthy: boolean
  discovery: boolean
}

interface Question {
  id: string
  question: string
  options: Option<TagValue>[]
}

/* ─── Pool de 14 questions ───────────────────────────────────────────── */

const QUESTION_POOL: Question[] = [
  {
    id: 'budget',
    question: 'Quel budget aujourd\'hui ?',
    options: [
      { value: 'low',    emoji: '💰', label: '< 10 €',  sub: 'Petit budget',        tags: { price: 'low' } },
      { value: 'medium', emoji: '🍔', label: '10–20 €', sub: 'Raisonnable',         tags: { price: 'medium' } },
      { value: 'high',   emoji: '💎', label: '> 20 €',  sub: 'On se fait plaisir',  tags: { price: 'high' } },
    ],
  },
  {
    id: 'distance',
    question: 'T\'es prêt à marcher combien ?',
    options: [
      { value: 400,  emoji: '🚶', label: '< 5 min',   sub: 'À deux pas',    tags: { maxDistanceMeters: 400 } },
      { value: 800,  emoji: '🏃', label: '5–10 min',  sub: 'Petite balade', tags: { maxDistanceMeters: 800 } },
      { value: 2000, emoji: '🚗', label: '> 10 min',  sub: 'On s\'y met',   tags: { maxDistanceMeters: 2000 } },
    ],
  },
  {
    id: 'diet',
    question: 'Régime alimentaire ?',
    options: [
      { value: 'all',         emoji: '🍽️', label: 'Tout',         sub: 'Pas de restriction',    tags: { diet: 'all' } },
      { value: 'vegetarian',  emoji: '🥦', label: 'Végétarien',   sub: 'Sans viande',           tags: { diet: 'vegetarian' } },
      { value: 'vegan',       emoji: '🌿', label: 'Vegan',        sub: 'Zéro produit animal',   tags: { diet: 'vegan' } },
      { value: 'gluten_free', emoji: '🌾', label: 'Sans gluten',  sub: 'Intolérant au gluten',  tags: { diet: 'gluten_free' } },
    ],
  },
  {
    id: 'vibe',
    question: 'C\'est quel type de repas ?',
    options: [
      { value: 'rapide',     emoji: '⚡', label: 'Rapide',     sub: 'J\'ai peu de temps',      tags: { vibe: 'rapide',     speed: 'fast' } },
      { value: 'tranquille', emoji: '😌', label: 'Tranquille', sub: 'On prend notre temps',    tags: { vibe: 'tranquille', speed: 'slow' } },
      { value: 'festif',     emoji: '🎉', label: 'Festif',     sub: 'On fête quelque chose',   tags: { vibe: 'festif' } },
      { value: 'business',   emoji: '💼', label: 'Business',   sub: 'Repas pro',               tags: { vibe: 'business',   noise: 'calme' } },
    ],
  },
  {
    id: 'hungry',
    question: 'T\'as vraiment faim ?',
    options: [
      { value: true,  emoji: '🐺', label: 'Affamé·e',     sub: 'Je mangerais un cheval', tags: { hungry: true } },
      { value: false, emoji: '😌', label: 'Pas trop',      sub: 'Un truc léger ça ira',  tags: { hungry: false, healthy: true } },
    ],
  },
  {
    id: 'outdoor',
    question: 'Terrasse ou intérieur ?',
    options: [
      { value: true,  emoji: '☀️', label: 'Terrasse',   sub: 'Si le temps le permet',  tags: { outdoor: true } },
      { value: false, emoji: '🏠', label: 'Intérieur',  sub: 'Au chaud / au calme',    tags: { outdoor: false } },
    ],
  },
  {
    id: 'noise',
    question: 'Ambiance sonore ?',
    options: [
      { value: 'calme',  emoji: '🔇', label: 'Calme',   sub: 'Pour discuter tranquille', tags: { noise: 'calme' } },
      { value: 'animé',  emoji: '🔊', label: 'Animé',   sub: 'Un peu d\'ambiance',       tags: { noise: 'animé' } },
    ],
  },
  {
    id: 'familiar',
    question: 'Cuisine connue ou découverte ?',
    options: [
      { value: true,  emoji: '🏠', label: 'Familier',    sub: 'Je veux du connu',          tags: { familiar: true,  discovery: false } },
      { value: false, emoji: '🌍', label: 'Découverte',  sub: 'Surprends-moi !',           tags: { familiar: false, discovery: true } },
    ],
  },
  {
    id: 'speed',
    question: 'En combien de temps tu veux manger ?',
    options: [
      { value: 'fast', emoji: '⏱️', label: '< 30 min',  sub: 'On est pressé',           tags: { speed: 'fast' } },
      { value: 'slow', emoji: '🕐', label: '1h ou plus', sub: 'On prend le temps',       tags: { speed: 'slow' } },
    ],
  },
  {
    id: 'healthy',
    question: 'Tu surveilles ce que tu manges ?',
    options: [
      { value: true,  emoji: '🥗', label: 'Oui',   sub: 'Équilibré svp',       tags: { healthy: true } },
      { value: false, emoji: '🍟', label: 'Non',   sub: 'YOLO, c\'est la vie', tags: { healthy: false } },
    ],
  },
  {
    id: 'weather',
    question: 'Il fait quel temps dehors ?',
    options: [
      { value: 'sun',  emoji: '☀️', label: 'Beau soleil', sub: 'Parfait pour sortir',   tags: { outdoor: true } },
      { value: 'rain', emoji: '🌧️', label: 'Il pleut',    sub: 'Mieux rester au chaud', tags: { outdoor: false } },
      { value: 'meh',  emoji: '⛅', label: 'Couvert',     sub: 'Bof bof',               tags: {} },
    ],
  },
  {
    id: 'energy',
    question: 'T\'as la patate aujourd\'hui ?',
    options: [
      { value: 'high', emoji: '🚀', label: 'En forme',    sub: 'Prêt pour l\'aventure', tags: { discovery: true, outdoor: true } },
      { value: 'low',  emoji: '🛋️', label: 'Fatigué·e',  sub: 'Le plus proche possible', tags: { maxDistanceMeters: 400, speed: 'fast' } },
    ],
  },
]

/* ─── Tirage de 5 questions au hasard ──────────────────────────────── */

function pickQuestions(pool: Question[], n: number): Question[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

/* ─── Scoring : calcule les filtres à partir des tags accumulés ─────── */

function buildFilters(
  tagHistory: Partial<FilterTags>[],
  defaultCategoryId?: string,
): SearchFilters {
  const merged: Partial<FilterTags> = {}

  for (const tags of tagHistory) {
    Object.assign(merged, tags)
  }

  // Valeurs par défaut si une dimension n'a pas été couverte
  return {
    price:              merged.price            ?? 'medium',
    maxDistanceMeters:  merged.maxDistanceMeters ?? 800,
    diet:               merged.diet             ?? 'all',
    categoryId:         defaultCategoryId,
    // Champs étendus — à consommer côté service si besoin
    vibe:               merged.vibe,
    outdoor:            merged.outdoor,
    noise:              merged.noise,
    speed:              merged.speed,
    healthy:            merged.healthy,
    discovery:          merged.discovery,
  } as SearchFilters
}

/* ─── Animation ─────────────────────────────────────────────────────── */

const slide = {
  initial:  { x: 60, opacity: 0 },
  animate:  { x: 0,  opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit:     { x: -60, opacity: 0, transition: { duration: 0.15 } },
}

/* ─── Composant ─────────────────────────────────────────────────────── */

interface Props {
  onComplete: (filters: SearchFilters) => void
  defaultCategoryId?: string
}

export function SearchWizard({ onComplete, defaultCategoryId }: Props) {
  const questions = useMemo(() => pickQuestions(QUESTION_POOL, 5), [])

  const [stepIdx, setStepIdx]         = useState(0)
  const [tagHistory, setTagHistory]   = useState<Partial<FilterTags>[]>([])

  const step     = questions[stepIdx]
  const category = CATEGORIES.find((c) => c.id === defaultCategoryId)

  function pick(tags: Partial<FilterTags>) {
    const next = [...tagHistory, tags]
    setTagHistory(next)

    if (stepIdx < questions.length - 1) {
      setStepIdx((i) => i + 1)
    } else {
      onComplete(buildFilters(next, defaultCategoryId))
    }
  }

  return (
    <div className="figma-main search-wizard">
      {/* Progress */}
      <div className="search-progress">
        {questions.map((_, i) => (
          <div
            key={i}
            className={[
              'h-3 rounded-full border-[2px] border-black transition-all duration-200',
              i < stepIdx   ? 'w-10 bg-secondary' :
              i === stepIdx ? 'w-10 bg-primary'   :
              'w-5 bg-surface',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Catégorie pré-filtrée */}
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
            <h2 className="figma-title search-question">{step.question}</h2>

            <div className="figma-scroll search-options">
              {step.options.map((opt, i) => (
                <button
                  key={String(opt.value)}
                  onClick={() => pick(opt.tags)}
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
          onClick={() => {
            setTagHistory((h) => h.slice(0, -1))
            setStepIdx((i) => i - 1)
          }}
        >
          ← Retour
        </button>
      )}
    </div>
  )
}