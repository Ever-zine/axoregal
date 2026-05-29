import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGroup } from '@/providers/GroupProvider'
import { searchRestaurants, type SearchFilters } from '@/services/restaurants'
import { CATEGORIES } from '@/data/categories'
import { SearchWizard } from '@/components/SearchWizard/SearchWizard'
import { RestaurantCard } from '@/components/RestaurantCard/RestaurantCard'
import { BottomNav } from '@/components/BottomNav/BottomNav'
import { PageTransition } from '@/components/PageTransition/PageTransition'

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
    <PageTransition>
    <div className="figma-screen search-screen">
    <div className="figma-screen-bg" />
    <div className="figma-page search-page">
      <header className="search-header">
        <span className="figma-brand search-brand">
          {view === 'wizard' ? 'Je cherche un resto' : 'Résultats'}
        </span>
        {view === 'results' && (
          <button
            className="search-edit-button"
            onClick={() => setView('wizard')}
          >
            Modifier
          </button>
        )}
      </header>

      {view === 'wizard' ? (
        <div className="search-wizard-view">
          <SearchWizard
            onComplete={handleComplete}
            defaultCategoryId={group?.category_id}
          />
        </div>
      ) : (
        <div className="figma-main figma-scroll search-results">
          {/* Bandeau catégorie pré-filtrée (REST-04) */}
          {category && (
            <div className="search-category-pill border-cup bg-surface">
              <span className="text-xl">{category.emoji}</span>
              <span className="text-xs font-bold text-muted">
                Filtré sur {category.name} — depuis ton groupe
              </span>
            </div>
          )}

          {results.length === 0 ? (
            <motion.div
              className="search-empty-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-6xl">🔍</span>
              <h3 className="figma-title text-3xl text-muted">Aucun résultat</h3>
              <p className="text-sm text-muted">Essaie d'élargir les filtres</p>
              <button
                className="figma-button bg-primary px-6 text-base text-surface"
                onClick={() => setView('wizard')}
              >
                Modifier les filtres
              </button>
            </motion.div>
          ) : (
            <>
              <p className="search-results-count">
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
    </div>
    </PageTransition>
  )
}
