import type { Category } from '@/data/categories'
import './FoodCharacter.scss'

interface Props { category: Category }

export function FoodCharacter({ category }: Props) {
  return (
    <div className={`relative flex items-center justify-center ${category.anim}`}>
      {/* Corps rond CupHead */}
      <div
        className="body w-[140px] h-[140px] rounded-full border-cup-xl shadow-cup-card flex items-center justify-center relative"
        style={{ backgroundColor: category.color }}
      >
        {/* Yeux */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 flex gap-[22px]">
          <div className="w-[14px] h-[14px] bg-black rounded-full" />
          <div className="w-[14px] h-[14px] bg-black rounded-full" />
        </div>
        <span className="text-[72px] leading-none select-none drop-shadow-[2px_2px_0_rgba(0,0,0,0.4)]">
          {category.emoji}
        </span>
      </div>

      {/* Jambes */}
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex gap-[14px]">
        <div
          className="leg w-[16px] h-[26px] border-cup rounded-[6px_6px_10px_10px]"
          style={{ backgroundColor: category.color }}
        />
        <div
          className="leg w-[16px] h-[26px] border-cup rounded-[6px_6px_10px_10px]"
          style={{ backgroundColor: category.color }}
        />
      </div>
    </div>
  )
}
