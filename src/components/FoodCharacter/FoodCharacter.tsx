import type { Category } from '@/data/categories'
import './FoodCharacter.scss'

import burgerGif from '@/assets/Burger.gif'
import saladGif from '@/assets/Salade.gif'
import sushiGif from '@/assets/Sushi.gif'
import pouletGif from '@/assets/Poulet.gif'
import pizzaGif from '@/assets/pizza.gif'
import sandwichGif from '@/assets/SANDWICH 1.gif'


const GIF_MAP: Record<string, string> = {
  burger: burgerGif,
  salad: saladGif,
  sushi: sushiGif,
  poulet: pouletGif,
  pizza: pizzaGif,
  sandwich: sandwichGif
}

interface Props { category: Category }

export function FoodCharacter({ category }: Props) {
  const gif = GIF_MAP[category.id] ?? new URL('@/assets/SANDWICH 1.gif', import.meta.url).href
  console.log(category.id)

  return (
    <img
      src={gif}
      alt={category.name}
      className="w-[200px] h-[200px] object-contain"
    />
  )
}
