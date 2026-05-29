import type { Restaurant, Diet, PriceRange } from '@/data/restaurants'

export type { Restaurant }

export interface SearchFilters {
  price: PriceRange
  maxDistanceMeters: number
  diet: Diet
  categoryId?: string
  vibe?: 'rapide' | 'tranquille' | 'festif' | 'romantique' | 'business'
  outdoor?: boolean
  noise?: 'calme' | 'animé'
  speed?: 'fast' | 'slow'
  healthy?: boolean
  discovery?: boolean
}

export function searchRestaurants(restaurants: Restaurant[], filters: SearchFilters): Restaurant[] {
  const PRICE_ORDER: PriceRange[] = ['low', 'medium', 'high']

  const scored = restaurants
    .filter((r) => {
      // Hard filters
      if (r.distanceMeters > filters.maxDistanceMeters) return false
      if (filters.diet !== 'all' && !r.diets.includes(filters.diet)) return false
      return true
    })
    .map((r) => {
      let score = 0

      // Price: exact +3, adjacent +1
      const pDiff = Math.abs(PRICE_ORDER.indexOf(r.price) - PRICE_ORDER.indexOf(filters.price))
      if (pDiff === 0) score += 3
      else if (pDiff === 1) score += 1

      // Category match (group pre-filter)
      if (filters.categoryId && r.category_id === filters.categoryId) score += 2

      // Outdoor preference
      if (filters.outdoor === true && r.outdoor) score += 2

      // Healthy preference
      if (filters.healthy === true && r.healthy) score += 2

      // Rating boost
      score += r.rating * 0.5

      return { r, score }
    })
    .sort((a, b) => b.score - a.score || b.r.rating - a.r.rating)
    .map(({ r }) => r)

  return scored
}

export function distanceLabel(meters: number): string {
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export function walkMinutes(meters: number): number {
  return Math.ceil(meters / 80)
}

export function mapsUrl(restaurant: Restaurant): string {
  const query = encodeURIComponent(`${restaurant.name} ${restaurant.address}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

export function shareChatText(restaurant: Restaurant): string {
  return [
    `📍 *${restaurant.name}*`,
    `${restaurant.emoji}  ${restaurant.address}`,
    `⭐ ${restaurant.rating.toFixed(1)}  ·  🚶 ${walkMinutes(restaurant.distanceMeters)} min  ·  ${priceLabel(restaurant.price)}`,
    `🗺️ ${mapsUrl(restaurant)}`,
  ].join('\n')
}

function priceLabel(p: PriceRange): string {
  return p === 'low' ? '< 10 €' : p === 'medium' ? '10–20 €' : '> 20 €'
}
