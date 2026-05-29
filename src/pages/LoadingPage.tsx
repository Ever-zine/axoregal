import styles from './LoadingPage.module.css'

export function LoadingPage() {
  return (
    <div className={styles.page}>
      <span className={styles.title}>Axoregal</span>

      <div className={styles.characterWrap}>
        <div className={styles.character}>
          <div className={styles.smile} />
        </div>
        <div className={styles.legs}>
          <div className={styles.leg} />
          <div className={styles.leg} />
        </div>
      </div>

      <div className={styles.dots}>
        <div className={styles.dot} />
        <div className={styles.dot} />
        <div className={styles.dot} />
      </div>
    </div>
  )
}
