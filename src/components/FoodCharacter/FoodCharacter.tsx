import type { Category } from '@/data/categories'
import styles from './FoodCharacter.module.css'

interface Props {
  category: Category
}

export function FoodCharacter({ category }: Props) {
  return (
    <div className={`${styles.wrap} ${styles[category.anim]}`}>
      <div
        className={styles.body}
        style={{ '--char-color': category.color } as React.CSSProperties}
      >
        <div className={styles.eyes}>
          <div className={styles.eye} />
          <div className={styles.eye} />
        </div>
        <span className={styles.emoji}>{category.emoji}</span>
      </div>
      <div className={styles.legs}>
        <div className={styles.leg} style={{ '--char-color': category.color } as React.CSSProperties} />
        <div className={styles.leg} style={{ '--char-color': category.color } as React.CSSProperties} />
      </div>
    </div>
  )
}
