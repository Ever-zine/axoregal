import { motion } from 'framer-motion'
import { CATEGORIES } from '@/data/categories'
import { useUserHistory } from '@/hooks/useHistory'
import { PageTransition } from '@/components/PageTransition/PageTransition'
import { BottomNav } from '@/components/BottomNav/BottomNav'

export function HistoryPage() {
  const { data: history = [], isLoading, isError } = useUserHistory()

  return (
    <PageTransition>
    <div className="figma-screen history-screen">
    <div className="figma-screen-bg" />
    <div className="figma-page history-page">
      <header className="search-header history-header">
        <span className="figma-brand search-brand">Mon historique</span>
      </header>

      <main className="figma-main figma-scroll history-content">
        {isLoading && (
          <div className="history-state">
            <span className="history-state-icon">◷</span>
            <h2 className="figma-title">Chargement</h2>
          </div>
        )}

        {isError && (
          <div className="history-state">
            <span className="history-state-icon">!</span>
            <h2 className="figma-title">Impossible de charger</h2>
            <p>Réessaie dans un instant.</p>
          </div>
        )}

        {!isLoading && !isError && history.length === 0 && (
          <div className="history-state">
            <span className="history-state-icon">✦</span>
            <h2 className="figma-title">Rien pour l'instant</h2>
            <p>Tes swipes et groupes apparaîtront ici.</p>
          </div>
        )}

        {!isLoading && !isError && history.length > 0 && (
          <>
            <p className="history-count">
              {history.length} moment{history.length > 1 ? 's' : ''} retrouvé{history.length > 1 ? 's' : ''}
            </p>
            <div className="history-list">
              {history.map((item, index) => {
                const category = CATEGORIES.find((c) => c.id === item.categoryId)
                const status = getStatus(item.joinedAt, item.swipeDirection)

                return (
                  <motion.article
                    key={item.groupId}
                    className="history-card border-cup bg-surface shadow-cup-card"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04 } }}
                  >
                    <div className="history-card-main">
                      <div
                        className="history-category"
                        style={{ backgroundColor: category?.color ?? 'var(--color-secondary)' }}
                        aria-hidden="true"
                      >
                        {category?.emoji ?? '🍽️'}
                      </div>
                      <div className="history-card-copy">
                        <div className="history-card-topline">
                          <span>{formatDate(item.sessionDate)}</span>
                          <span className={`history-status history-status-${status.kind}`}>
                            {status.label}
                          </span>
                        </div>
                        <h2 className="figma-title history-card-title">{item.groupName}</h2>
                        <p className="history-card-meta">
                          {category?.name ?? item.categoryId}
                          {item.members.length > 0 ? ` · ${item.members.length} membre${item.members.length > 1 ? 's' : ''}` : ''}
                        </p>
                      </div>
                    </div>

                    {item.members.length > 0 && (
                      <div className="history-members" aria-label="Membres du groupe">
                        {item.members.slice(0, 5).map((member) => (
                          <div key={member.id} className="history-member">
                            {member.avatar_url ? (
                              <img src={member.avatar_url} alt={member.name} />
                            ) : (
                              <span>{member.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        ))}
                        {item.members.length > 5 && (
                          <div className="history-member history-member-more">
                            +{item.members.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.article>
                )
              })}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
    </div>
    </PageTransition>
  )
}

function getStatus(joinedAt: string | null, swipeDirection: 'left' | 'right' | null) {
  if (joinedAt) return { kind: 'joined', label: 'Rejoint' }
  if (swipeDirection === 'right') return { kind: 'liked', label: 'Liké' }
  return { kind: 'passed', label: 'Passé' }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
