import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGroup } from '@/providers/GroupProvider'
import { searchRestaurants, type SearchFilters } from '@/services/restaurants'
import { CATEGORIES } from '@/data/categories'
import { SearchWizard } from '@/components/SearchWizard/SearchWizard'
import { RestaurantCard } from '@/components/RestaurantCard/RestaurantCard'
import { BottomNav } from '@/components/BottomNav/BottomNav'

type View = 'wizard' | 'results'

export function SearchPage() {
  const { group } = useGroup()
  const [view, setView] = useState<View>('wizard')
  const [filters, setFilters] = useState<SearchFilters | null>(null)

  const category = CATEGORIES.find((c) => c.id === group?.category_id)

  function handleComplete(f: SearchFilters) {
    setFilters(f)
    setView('results')
  }

  const results = filters ? searchRestaurants(filters) : []

  return (
    <div className="flex flex-col h-full bg-bg overflow-hidden">
      <header className="flex-shrink-0 flex items-center gap-3 px-5 py-4 border-b-[2px] border-black">
        <span className="text-cuphead-lg text-2xl text-secondary flex-1">
          {view === 'wizard' ? 'Je cherche un resto' : 'Résultats'}
        </span>
        {view === 'results' && (
          <button
            className="text-sm text-muted font-semibold underline"
            onClick={() => setView('wizard')}
          >
            Modifier
          </button>
        )}
      </header>

      {view === 'wizard' ? (
        <div className="flex-1 overflow-hidden">
          <SearchWizard
            onComplete={handleComplete}
            defaultCategoryId={group?.category_id}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {/* Bandeau catégorie pré-filtrée (REST-04) */}
          {category && (
            <div className="flex items-center gap-2 px-4 py-2 bg-surface border-cup rounded-xl">
              <span className="text-xl">{category.emoji}</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                Filtré sur {category.name} — depuis ton groupe
              </span>
            </div>
          )}

          {results.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center flex-1 gap-4 py-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-6xl">🔍</span>
              <h3 className="text-cuphead text-xl text-muted uppercase">Aucun résultat</h3>
              <p className="text-sm text-muted">Essaie d'élargir les filtres</p>
              <button
                className="mt-2 bg-primary text-text font-display text-base px-6 py-3 border-cup rounded-xl shadow-cup-btn btn-press uppercase"
                onClick={() => setView('wizard')}
              >
                Modifier les filtres
              </button>
            </motion.div>
          ) : (
            <>
              <p className="text-xs text-muted font-bold uppercase tracking-wider px-1">
                {results.length} restaurant{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
              </p>
              {results.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
                >
                  <RestaurantCard restaurant={r} />
                </motion.div>
              ))}
            </>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
