export type Diet = 'all' | 'vegetarian' | 'vegan' | 'gluten_free'
export type PriceRange = 'low' | 'medium' | 'high'

export interface Restaurant {
  id: string
  name: string
  category_id: string
  address: string
  distanceMeters: number
  rating: number
  price: PriceRange
  diets: Diet[]
  emoji: string
  hours: string
  phone?: string
  outdoor: boolean
  halal: boolean
  healthy: boolean
  tags: string[]
}
