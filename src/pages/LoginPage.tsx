import { useAuth } from '@/providers/AuthProvider'

export function LoginPage() {
  const { login } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center h-full bg-bg gap-8 px-8">
      <h1 className="text-cuphead-lg text-5xl text-secondary text-center leading-tight">Axoregal</h1>
      <p className="text-muted font-semibold text-center">Trouve ton resto avec tes collègues 🍔</p>
      <button
        className="bg-primary text-text font-display text-base px-8 py-3 border-cup rounded-2xl shadow-cup-btn btn-press uppercase tracking-wider"
        onClick={login}
      >
        Se connecter
      </button>
    </div>
  )
}
