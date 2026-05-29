import { RESTAURANTS, type Restaurant, type Diet, type PriceRange } from '@/data/restaurants'

export interface SearchFilters {
  price: PriceRange
  maxDistanceMeters: number
  diet: Diet
  categoryId?: string   // pré-rempli depuis le groupe (REST-04)
}

// Remplacer cette fonction par un appel API réel (Google Places, Yelp…)
export function searchRestaurants(filters: SearchFilters): Restaurant[] {
  return RESTAURANTS.filter((r) => {
    if (filters.categoryId && r.category_id !== filters.categoryId) return false
    if (r.price !== filters.price) return false
    if (r.distanceMeters > filters.maxDistanceMeters) return false
    if (filters.diet !== 'all' && !r.diets.includes(filters.diet)) return false
    return true
  }).sort((a, b) => b.rating - a.rating)
}

export function distanceLabel(meters: number): string {
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export function walkMinutes(meters: number): number {
  return Math.ceil(meters / 80) // ~80 m/min
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
