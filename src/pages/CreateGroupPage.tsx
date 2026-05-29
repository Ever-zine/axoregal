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
    <div className="flex flex-col h-full bg-bg overflow-hidden">
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b-[2px] border-black">
        <button
          className="text-muted font-semibold text-sm"
          onClick={() => navigate('/swipe')}
          aria-label="Retour"
        >
          ← Retour
        </button>
        <span className="text-cuphead-lg text-xl text-secondary">Créer un groupe</span>
        <div className="w-16" />
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
        {/* Nom du groupe */}
        <div className="flex flex-col gap-2">
          <label className="font-display text-sm text-text uppercase tracking-wider">
            Nom du groupe
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Lunch équipe produit"
            maxLength={60}
            className="bg-surface border-cup rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary"
          />
        </div>

        {/* Catégorie */}
        <div className="flex flex-col gap-3">
          <label className="font-display text-sm text-text uppercase tracking-wider">
            Type de cuisine
          </label>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-xl border-cup font-semibold text-sm text-left transition-all btn-press',
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

      <div className="flex-shrink-0 px-5 pb-3">
        <button
          className={[
            'w-full bg-success text-text font-display text-xl py-4 border-cup-xl rounded-2xl shadow-cup-card uppercase tracking-wider transition-opacity',
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
    </PageTransition>
  )
}
