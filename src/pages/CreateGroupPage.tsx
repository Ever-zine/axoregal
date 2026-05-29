import { useState, useCallback } from 'react'
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
  const [trollPos, setTrollPos] = useState<{ top: string; left: string } | null>(null)
  const [trollClicks, setTrollClicks] = useState(0)

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

  const handleTroll = useCallback(() => {
    setTrollClicks((c) => (c + 1) % 7)
    // Zone sûre : entre 5% et 75% pour éviter les bords et la BottomNav
    const top = `${Math.floor(Math.random() * 70) + 5}%`
    const left = `${Math.floor(Math.random() * 65) + 5}%`
    setTrollPos({ top, left })

    // Après l'animation de déplacement, retour à l'origine
    setTimeout(() => {
      setTrollPos(null)
    }, 350)
  }, [])

  const trollLabels = [
    'Cliquez ici pour que la Direction vous offre ce repas 🎁',
    'Cliquez ici pour le repas gratuit 👆',
    'Presque… encore un clic 😏',
    "C'est pour de vrai cette fois 🤞",
    'Haha non. Toujours pas. 😈',
    '…tu y crois encore ? 🫠',
    'Respect pour la persévérance 👏',
  ]
  const trollLabel = trollLabels[Math.min(trollClicks, trollLabels.length - 1)]

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

      {/* Bouton troll — flotte en position absolue sur tout l'écran */}
        <button
          onClick={handleTroll}
          style={{
            position: 'absolute',
            top: trollPos ? trollPos.top : 'calc(100% - 180px)',
            left: trollPos ? trollPos.left : '50%',
            transform: 'translateX(-50%)',
            transition: 'top 0.25s cubic-bezier(.4,1.6,.6,1), left 0.25s cubic-bezier(.4,1.6,.6,1)',
            zIndex: 50,
            background: '#fff7ed',
            border: '1.5px dashed #f97316',
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#c2410c',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(249,115,22,0.15)',
          }}
        >
          {trollLabel}
        </button>

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
