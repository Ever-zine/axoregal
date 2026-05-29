import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '@/data/categories'
import { createGroup } from '@/services/matching'
import { useAuth } from '@/providers/AuthProvider'
import { PageTransition } from '@/components/PageTransition/PageTransition'
import { BottomNav } from '@/components/BottomNav/BottomNav'

export function CreateGroupPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canCreate = name.trim().length > 0 && selectedCategory !== null && !isSubmitting

  async function handleCreate() {
    if (!canCreate || !user) return
    setIsSubmitting(true)
    setError(null)
    try {
      const newGroup = await createGroup(user.id, name.trim(), selectedCategory!)
      navigate(`/match/${newGroup.id}`, { replace: true })
    } catch {
      setError('Impossible de créer le groupe. Réessaie !')
      setIsSubmitting(false)
    }
  }

  return (
    <PageTransition>
    <div className="figma-screen create-group-screen">
    <div className="figma-screen-bg" />
    <div className="figma-page create-group-page">
      <header className="create-group-header">
        <button
          className="create-group-back"
          onClick={() => navigate('/swipe')}
          aria-label="Retour"
        >
          ← Retour
        </button>
        <span className="figma-brand create-group-title">Créer un groupe</span>
      </header>

      <div className="create-group-content figma-scroll">
        {/* Nom du groupe */}
        <div className="create-group-field">
          <label className="create-group-label">
            Nom du groupe
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Lunch équipe produit"
            maxLength={60}
            className="create-group-input border-cup bg-surface text-text placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>

        {/* Catégorie */}
        <div className="create-group-field">
          <label className="create-group-label">
            Type de cuisine
          </label>
          <div className="create-group-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={[
                  'create-category-option border-cup btn-press',
                  selectedCategory === cat.id
                    ? 'bg-primary shadow-cup-card'
                    : 'bg-surface shadow-cup-btn text-muted',
                ].join(' ')}
                style={selectedCategory === cat.id ? { color: cat.color } : {}}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-accent font-semibold text-sm text-center">{error}</p>
        )}
      </div>

      <div className="create-group-footer">
        <button
          className={[
            'figma-button create-group-submit bg-success text-text',
            canCreate ? 'btn-press' : 'opacity-40 cursor-not-allowed',
          ].join(' ')}
          onClick={handleCreate}
          disabled={!canCreate}
        >
          {isSubmitting ? 'Création…' : 'Créer le groupe ✚'}
        </button>
      </div>

      <BottomNav />
    </div>
    </div>
    </PageTransition>
  )
}
