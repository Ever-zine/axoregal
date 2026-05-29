import type { Category, AccessoryType } from '@/data/categories'
import './FoodCharacter.scss'

interface Props { category: Category }

function Accessory({ type }: { type: AccessoryType }) {
  switch (type) {
    case 'chef-hat':
      return (
        <div className="accessory-chef-hat">
          <div className="accessory-chef-hat__top" />
          <div className="accessory-chef-hat__brim" />
        </div>
      )
    case 'headband':
      return <div className="accessory-headband" />
    case 'glasses':
      return (
        <div className="accessory-glasses">
          <div className="accessory-glasses__lens" />
          <div className="accessory-glasses__bridge" />
          <div className="accessory-glasses__lens" />
        </div>
      )
    case 'sombrero':
      return (
        <div className="accessory-sombrero">
          <div className="accessory-sombrero__crown" />
          <div className="accessory-sombrero__brim" />
        </div>
      )
    case 'steam':
      return (
        <div className="accessory-steam">
          <span /><span /><span />
        </div>
      )
    case 'bow':
      return (
        <div className="accessory-bow">
          <div className="accessory-bow__wing" />
          <div className="accessory-bow__knot" />
          <div className="accessory-bow__wing" />
        </div>
      )
    case 'comb':
      return (
        <div className="accessory-comb">
          <span /><span /><span /><span /><span />
        </div>
      )
    case 'mustache':
      return (
        <div className="accessory-mustache">
          <span /><span />
        </div>
      )
  }
}

export function FoodCharacter({ category }: Props) {
  const { character } = category

  return (
    <div className={`relative flex items-center justify-center ${category.anim}`}>
      {/* Corps — forme variable selon la catégorie */}
      <div
        className="body w-[140px] h-[140px] border-cup-xl shadow-cup-card flex items-center justify-center relative"
        style={{ backgroundColor: category.color, borderRadius: character.bodyRadius }}
      >
        <Accessory type={character.accessory} />

        {/* Yeux */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex gap-[20px]">
          <div className="w-[13px] h-[13px] bg-black rounded-full" />
          <div className="w-[13px] h-[13px] bg-black rounded-full" />
        </div>

        {/* Joues */}
        <div className="absolute top-[44%] left-[10%] w-[20px] h-[12px] rounded-full opacity-70"
          style={{ backgroundColor: character.cheekColor }} />
        <div className="absolute top-[44%] right-[10%] w-[20px] h-[12px] rounded-full opacity-70"
          style={{ backgroundColor: character.cheekColor }} />

        <span className="text-[64px] leading-none select-none drop-shadow-[2px_2px_0_rgba(0,0,0,0.4)] mt-3">
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
