import { useAuth } from '@/providers/AuthProvider'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { login } = useAuth()

  return (
    <div className={styles.page}>
      <h1 className={styles.logo}>Axoregal</h1>
      <p className={styles.tagline}>Trouve ton resto avec tes collègues 🍔</p>
      <button className={styles.btn} onClick={login}>
        Se connecter
      </button>
    </div>
  )
}
